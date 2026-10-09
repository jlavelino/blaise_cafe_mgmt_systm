"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CartItem } from "@/types";
import { CompletedOrderData } from "./ReceiptModal";
import {
  X,
  Banknote,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Loader2,
  DollarSign
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  items: CartItem[];
  onOrderCompleted: (order: CompletedOrderData) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  subtotal,
  items,
  onOrderCompleted
}: PaymentModalProps) {
  const { token } = useAuth();

  const [method, setMethod] = useState<"CASH" | "GCASH">("CASH");
  const [cashGiven, setCashGiven] = useState<string>(String(subtotal));
  const [feePercentage, setFeePercentage] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update default cash given when subtotal changes
  useEffect(() => {
    if (isOpen) {
      setCashGiven(String(subtotal));
      setErrorMsg(null);
    }
  }, [isOpen, subtotal]);

  // Dynamic quick bills: Exact, 100, 200, 500, 1000
  const quickBills = useMemo(() => {
    const bills = [subtotal];
    [100, 200, 500, 1000].forEach((bill) => {
      if (bill >= subtotal && !bills.includes(bill)) {
        bills.push(bill);
      }
    });
    return bills;
  }, [subtotal]);

  // Calculations
  const cashNum = parseFloat(cashGiven) || 0;
  const change = cashNum - subtotal;
  const isCashInsufficient = method === "CASH" && change < 0;

  const gcashFee = subtotal * (feePercentage / 100);
  const gcashNet = subtotal - gcashFee;

  if (!isOpen) return null;

  const handleCharge = async () => {
    setErrorMsg(null);

    if (method === "CASH" && isCashInsufficient) {
      setErrorMsg("Amount received is less than the order total.");
      return;
    }

    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const payload = {
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity
        })),
        payment: {
          method,
          amountTendered: method === "CASH" ? cashNum : subtotal,
          feePercentage: method === "GCASH" ? feePercentage : 0
        },
        notes: notes.trim() || undefined
      };

      const res = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to process payment");
      }

      // Success
      onOrderCompleted(json.data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Network error completing order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#181B1F] border-t border-x border-[#2C3138] rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200 text-[#F3F4F6] max-h-[92vh] overflow-y-auto">
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-stone-600 rounded-full mx-auto mb-3" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A882]">
              Checkout Counter
            </span>
            <h3 className="text-base font-bold text-white">Payment Method</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#22262B] text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Due Big Display */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-[#20242A] to-[#191C20] border border-[#2E343D] text-center shadow-inner">
          <span className="text-xs uppercase font-semibold text-stone-400 tracking-wider">
            Total Amount Due
          </span>
          <div className="text-3xl font-black text-[#C8A882] tracking-tight mt-0.5">
            ₱{subtotal.toFixed(0)}
          </div>
          <span className="text-[11px] text-stone-500">
            {items.reduce((s, i) => s + i.quantity, 0)} items in ticket
          </span>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMethod("CASH")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              method === "CASH"
                ? "bg-[#C8A882] text-[#121416] shadow-md shadow-[#C8A882]/20"
                : "bg-[#20242A] text-stone-300 border border-[#2D333B] hover:text-white"
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>CASH</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod("GCASH")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              method === "GCASH"
                ? "bg-[#007DFE] text-white shadow-md shadow-[#007DFE]/30"
                : "bg-[#20242A] text-stone-300 border border-[#2D333B] hover:text-white"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>GCASH</span>
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CASH WORKFLOW */}
        {method === "CASH" && (
          <div className="space-y-3.5 mb-5">
            {/* Quick Bill Chips */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
                Quick Tender Bills
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickBills.map((bill) => {
                  const isSelected = parseFloat(cashGiven) === bill;
                  const isExact = bill === subtotal;

                  return (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setCashGiven(String(bill))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 scale-[1.03]"
                          : "bg-[#22262C] text-stone-300 border border-[#2E343D] hover:border-stone-500 hover:text-white"
                      }`}
                    >
                      {isExact ? `Exact ₱${bill}` : `₱${bill}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Received Input */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 uppercase tracking-wider">
                Cash Received (₱)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500 text-sm font-bold">
                  ₱
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-3 rounded-xl bg-[#121416] border border-[#2F353E] text-white text-base font-extrabold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Live Change Calculation Box */}
            <div
              className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between ${
                isCashInsufficient
                  ? "bg-amber-950/20 border-amber-800/40 text-amber-300"
                  : "bg-emerald-950/25 border-emerald-700/50 text-emerald-300"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">
                {isCashInsufficient ? "Insufficient Cash" : "Customer Change"}
              </span>
              <span className="text-lg font-black font-mono">
                {isCashInsufficient
                  ? `-₱${Math.abs(change).toFixed(0)}`
                  : `₱${change.toFixed(0)}`}
              </span>
            </div>
          </div>
        )}

        {/* GCASH WORKFLOW */}
        {method === "GCASH" && (
          <div className="space-y-3.5 mb-5">
            <div className="p-3.5 rounded-xl bg-[#007DFE]/10 border border-[#007DFE]/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300">Customer Pays Gross:</span>
                <span className="font-extrabold text-white text-sm">
                  ₱{subtotal.toFixed(0)}
                </span>
              </div>

              {/* Fee Percentage Options */}
              <div className="pt-2 border-t border-[#007DFE]/20">
                <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  GCash Fee Deduction
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFeePercentage(0)}
                    className={`py-2 px-2.5 rounded-lg font-bold border transition-all ${
                      feePercentage === 0
                        ? "bg-[#007DFE] text-white border-[#007DFE]"
                        : "bg-[#181B1F] text-stone-400 border-[#2D333B]"
                    }`}
                  >
                    0% (Personal QR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeePercentage(2)}
                    className={`py-2 px-2.5 rounded-lg font-bold border transition-all ${
                      feePercentage === 2
                        ? "bg-[#007DFE] text-white border-[#007DFE]"
                        : "bg-[#181B1F] text-stone-400 border-[#2D333B]"
                    }`}
                  >
                    2% (Merchant QRPH)
                  </button>
                </div>
              </div>

              {feePercentage > 0 && (
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span>Merchant Fee ({feePercentage}%):</span>
                  <span className="text-red-400 font-mono">
                    -₱{gcashFee.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-1 border-t border-[#007DFE]/20">
                <span>Net Credited to GCash:</span>
                <span className="font-mono text-sm">₱{gcashNet.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Optional Notes */}
        <div className="mb-4">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (e.g. Less Ice, Table 2, Takeout)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#121416] border border-[#2B3037] text-white text-xs placeholder-stone-600 focus:outline-none focus:border-[#C8A882]"
          />
        </div>

        {/* Big Complete Order CTA */}
        <button
          type="button"
          disabled={submitting || isCashInsufficient}
          onClick={handleCharge}
          className="w-full py-4 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#C8A882] to-[#B6956F] text-[#121416] hover:from-[#DFCAAF] hover:to-[#C8A882] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#C8A882]/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Transaction...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>
                {method === "CASH"
                  ? `Charge ₱${subtotal.toFixed(0)} & Print Receipt`
                  : `Confirm GCash ₱${subtotal.toFixed(0)}`}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
