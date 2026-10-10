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
  Loader2
} from "lucide-react";
import { API_BASE } from "@/lib/api";

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

  useEffect(() => {
    if (isOpen) {
      setCashGiven(String(subtotal));
      setErrorMsg(null);
    }
  }, [isOpen, subtotal]);

  const quickBills = useMemo(() => {
    const bills = [subtotal];
    [100, 200, 500, 1000].forEach((bill) => {
      if (bill >= subtotal && !bills.includes(bill)) {
        bills.push(bill);
      }
    });
    return bills;
  }, [subtotal]);

  const cashAmountNum = parseFloat(cashGiven) || 0;
  const change = Math.max(0, cashAmountNum - subtotal);
  const isCashInsufficient = method === "CASH" && cashAmountNum < subtotal;

  const gcashFeeAmount = (subtotal * feePercentage) / 100;
  const gcashNetAmount = subtotal - gcashFeeAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (isCashInsufficient) {
      setErrorMsg(`Amount given (₱${cashAmountNum}) is less than the order total (₱${subtotal}).`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity
        })),
        payment: {
          method,
          amountTendered: method === "CASH" ? cashAmountNum : subtotal,
          feePercentage: method === "GCASH" ? feePercentage : 0
        },
        notes: notes.trim() || undefined
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (res.ok && json.success) {
        onOrderCompleted(json.data);
      } else {
        throw new Error(json.message || "Failed to finalize transaction.");
      }
    } catch (err: unknown) {
      console.error("Order completion failed:", err);
      setErrorMsg(err instanceof Error ? err.message : "Error completing checkout");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border-t sm:border border-[#EFE8DE] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200 text-[#2D1C13]">
        <div className="w-12 h-1 bg-[#E5DCD0] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F452A]">
              Checkout Counter
            </span>
            <h3 className="font-serif text-base font-bold text-[#2D1C13]">Payment Method</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F5EFEB] text-[#8C7B70] hover:text-[#2D1C13] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Due Display */}
        <div className="my-4 p-4 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] text-center shadow-cafe-sm">
          <span className="text-xs uppercase font-semibold text-[#8C7B70] tracking-wider">
            Total Amount Due
          </span>
          <div className="font-serif text-3xl sm:text-4xl font-bold text-[#6F452A] tracking-tight mt-0.5">
            ₱{subtotal.toFixed(0)}
          </div>
          <span className="text-[11px] text-[#8C7B70]">
            {items.reduce((s, i) => s + i.quantity, 0)} items in ticket
          </span>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMethod("CASH")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
              method === "CASH"
                ? "bg-[#6F452A] text-white shadow-sm"
                : "bg-[#FBF8F2] text-[#8C7B70] border border-[#EFE8DE] hover:text-[#2D1C13]"
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>CASH</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod("GCASH")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
              method === "GCASH"
                ? "bg-[#007DFE] text-white shadow-sm"
                : "bg-[#FBF8F2] text-[#8C7B70] border border-[#EFE8DE] hover:text-[#2D1C13]"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>GCASH</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* CASH WORKFLOW */}
          {method === "CASH" && (
            <div className="space-y-3.5 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-[#8C7B70] mb-1.5 uppercase tracking-wider">
                  Quick Bills
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
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#6F452A] text-white shadow-xs scale-[1.02]"
                            : "bg-[#FBF8F2] text-[#8C7B70] border border-[#EFE8DE] hover:text-[#2D1C13]"
                        }`}
                      >
                        {isExact ? `Exact ₱${bill}` : `₱${bill}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8C7B70] mb-1 uppercase tracking-wider">
                  Cash Received (₱)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8C7B70] text-sm font-bold">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] text-[#2D1C13] text-base font-bold focus:outline-none focus:border-[#6F452A]"
                  />
                </div>
              </div>

              {/* Change Calculation Box */}
              <div
                className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-between ${
                  isCashInsufficient
                    ? "bg-[#FFF1E5] border-[#D25E1A]/30 text-[#D25E1A]"
                    : "bg-[#EAF7ED] border-[#256A38]/30 text-[#256A38]"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isCashInsufficient ? "Insufficient Cash" : "Customer Change"}
                </span>
                <span className="text-lg font-bold">
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
              <div className="p-3.5 rounded-2xl bg-[#EBF3FF] border border-[#007DFE]/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#007DFE]">GCash Gross:</span>
                  <span className="font-bold text-[#007DFE]">₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#8C7B70]">Fee ({feePercentage}%):</span>
                  <span className="font-bold text-[#D25E1A]">-₱{gcashFeeAmount.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-[#007DFE]/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2D1C13]">Net In Bank:</span>
                  <span className="font-bold text-[#256A38]">₱{gcashNetAmount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8C7B70] mb-1.5 uppercase tracking-wider">
                  Merchant Fee Preset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeePercentage(0)}
                    className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      feePercentage === 0
                        ? "bg-[#6F452A] text-white shadow-xs"
                        : "bg-[#FBF8F2] text-[#8C7B70] border border-[#EFE8DE]"
                    }`}
                  >
                    0% (Personal QR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeePercentage(2.0)}
                    className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      feePercentage === 2.0
                        ? "bg-[#6F452A] text-white shadow-xs"
                        : "bg-[#FBF8F2] text-[#8C7B70] border border-[#EFE8DE]"
                    }`}
                  >
                    2.0% (Merchant QRPH)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Order notes (optional: extra sweet, less ice)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] text-[#2D1C13] text-xs placeholder-[#8C7B70] focus:outline-none focus:border-[#6F452A]"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={submitting || isCashInsufficient}
            className="w-full py-4 px-4 rounded-full font-bold text-sm bg-[#6F452A] text-white hover:bg-[#5A361F] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recording Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Complete Order &amp; Receipt</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
