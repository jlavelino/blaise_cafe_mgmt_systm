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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white border border-[#EFE8DE] rounded-3xl p-5 shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200 text-[#2D1C13]">
        {/* Success Header */}
        <div className="text-center pt-2">
          <div className="w-12 h-12 rounded-full bg-[#EAF7ED] text-[#256A38] flex items-center justify-center mx-auto mb-2 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#256A38] px-2.5 py-0.5 rounded-full bg-[#EAF7ED] border border-[#256A38]/30">
            Payment Successful
          </span>
          <h3 className="font-serif text-xl font-bold text-[#2D1C13] mt-2">
            Blaise Café Receipt
          </h3>
          <p className="text-[11px] text-[#8C7B70]">
            Order #{order.orderNumber.replace("ORD-", "")} • {formattedDate}
          </p>

          <div className="flex items-center justify-center gap-2 mt-2">
            {order.status === "PREPARING" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF1E5] text-[#D25E1A] border border-[#FAD7C0]">
                <Coffee className="w-3.5 h-3.5 animate-pulse" />
                <span>Preparing Order</span>
              </span>
            ) : order.status === "CANCELLED" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <span>Cancelled</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF7ED] text-[#256A38] border border-[#C6EBD0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Order Served</span>
              </span>
            )}
          </div>
        </div>

        {/* Paper Receipt Breakdown */}
        <div className="p-4 rounded-2xl bg-[#FBF8F2] border border-dashed border-[#EFE8DE] space-y-2.5 text-xs shadow-cafe-sm">
          {/* Items Table */}
          <div className="space-y-1.5 pb-2 border-b border-[#EFE8DE]">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="text-[#2D1C13] font-medium truncate max-w-[190px]">
                  {item.quantity}x {item.itemNameSnapshot}
                </span>
                <span className="font-bold text-[#6F452A]">
                  ₱{Number(item.subtotal).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-sm pt-1">
              <span className="text-[#2D1C13]">Total:</span>
              <span className="font-serif text-base text-[#6F452A]">₱{totalNum.toFixed(0)}</span>
            </div>

            <div className="flex justify-between text-[#8C7B70] text-[11px]">
              <span>Payment ({order.payment.method}):</span>
              <span>₱{tenderedNum.toFixed(0)}</span>
            </div>

            {order.payment.method === "CASH" ? (
              <div className="flex justify-between font-bold text-[#256A38] text-xs pt-1 border-t border-[#EFE8DE]">
                <span>Change Given:</span>
                <span>₱{changeNum.toFixed(0)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-[11px] text-[#8C7B70] pt-1 border-t border-[#EFE8DE]">
                <span>Net in GCash (after fees):</span>
                <span className="font-bold text-[#007DFE]">₱{netNum.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-full font-bold text-sm bg-[#6F452A] text-white hover:bg-[#5A361F] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Order</span>
          </button>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 px-4 rounded-full font-semibold text-xs text-[#8C7B70] hover:text-[#2D1C13] border border-[#EFE8DE] hover:bg-[#F5EFEB] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
