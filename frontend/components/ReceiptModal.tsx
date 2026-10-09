"use client";

import React from "react";
import { CheckCircle2, Coffee, Printer, PlusCircle } from "lucide-react";

export interface CompletedOrderData {
  id: string;
  orderNumber: string;
  total: string | number;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    itemNameSnapshot: string;
    unitPrice: string | number;
    quantity: number;
    subtotal: string | number;
  }>;
  payment: {
    id: string;
    method: "CASH" | "GCASH";
    amountTendered: string | number;
    change: string | number;
    fee: string | number;
    netAmount: string | number;
  };
}

interface ReceiptModalProps {
  order: CompletedOrderData | null;
  onClose: () => void;
}

export function ReceiptModal({ order, onClose }: ReceiptModalProps) {
  if (!order) return null;

  const totalNum = Number(order.total);
  const tenderedNum = Number(order.payment?.amountTendered || 0);
  const changeNum = Number(order.payment?.change || 0);
  const feeNum = Number(order.payment?.fee || 0);
  const netNum = Number(order.payment?.netAmount || 0);

  const formattedDate = new Date(order.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#181B1F] border border-[#2F353E] rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200 text-[#F3F4F6]">
        {/* Success Header */}
        <div className="text-center pt-2">
          <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/60">
            Payment Completed
          </span>
          <h3 className="text-lg font-extrabold text-white mt-1">
            {order.orderNumber}
          </h3>
          <p className="text-[11px] text-stone-400">{formattedDate}</p>
        </div>

        {/* Receipt Paper Card */}
        <div className="p-4 rounded-2xl bg-[#1F2328] border border-[#2C3138] space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#2C3138] text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            <span>Item</span>
            <span>Total</span>
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-white">
                    {item.itemNameSnapshot}
                  </span>
                  <span className="text-[11px] text-stone-400 ml-1.5 font-mono">
                    × {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-[#C8A882] font-mono">
                  ₱{Number(item.subtotal).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="pt-3 border-t border-[#2C3138] space-y-1.5 text-xs">
            <div className="flex justify-between font-bold text-white text-sm">
              <span>Grand Total</span>
              <span className="text-[#C8A882] font-mono">₱{totalNum.toFixed(0)}</span>
            </div>

            <div className="flex justify-between text-stone-400 text-[11px] pt-1">
              <span>Payment Method</span>
              <span className="font-semibold text-white px-1.5 py-0.2 rounded bg-stone-800">
                {order.payment?.method}
              </span>
            </div>

            {order.payment?.method === "CASH" ? (
              <>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Cash Received</span>
                  <span className="font-mono">₱{tenderedNum.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold text-xs pt-0.5">
                  <span>Change Given</span>
                  <span className="font-mono">₱{changeNum.toFixed(0)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Gross GCash</span>
                  <span className="font-mono">₱{tenderedNum.toFixed(0)}</span>
                </div>
                {feeNum > 0 && (
                  <div className="flex justify-between text-stone-400 text-[11px]">
                    <span>GCash Fee</span>
                    <span className="font-mono text-red-400">-₱{feeNum.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-300 font-semibold text-[11px]">
                  <span>Net GCash Received</span>
                  <span className="font-mono">₱{netNum.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-[#C8A882] to-[#B6956F] text-[#121416] hover:from-[#DFCAAF] hover:to-[#C8A882] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C8A882]/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Next Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
