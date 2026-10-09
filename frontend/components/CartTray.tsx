"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ChevronUp, ChevronDown, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

interface CartTrayProps {
  onProceedToCheckout?: () => void;
}

export function CartTray({ onProceedToCheckout }: CartTrayProps) {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  if (itemCount === 0) return null;

  return (
    <>
      {/* Expanded Order Drawer (Modal) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

          <div className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-[#181B1F] border-t border-x border-[#2C3138] rounded-t-3xl shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-[#292E36] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C8A882]/15 text-[#C8A882] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Current Order Ticket</h3>
                  <p className="text-[11px] text-stone-400">
                    {itemCount} {itemCount === 1 ? "item" : "items"} in tray
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCart}
                  className="px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/30 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg bg-[#22262C] text-stone-400 hover:text-white transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#262A31]">
              {items.map((item) => (
                <div key={item.variantId} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.productName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.size && (
                        <span className="text-[10px] font-semibold text-[#C8A882] px-1.5 py-0.2 rounded bg-[#C8A882]/10 border border-[#C8A882]/20">
                          {item.size}
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400">
                        ₱{item.unitPrice} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#20242A] border border-[#2F353E] rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(item.variantId, -1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-white active:scale-95 transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-6 text-center text-xs font-extrabold text-white">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.variantId, 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#C8A882] hover:text-white active:scale-95 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Total & Checkout CTA */}
            <div className="p-4 border-t border-[#292E36] bg-[#141619] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">Order Total</span>
                <span className="text-xl font-black text-[#C8A882]">
                  ₱{subtotal.toFixed(0)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (onProceedToCheckout) {
                    onProceedToCheckout();
                  } else {
                    alert(`Order ticket with ₱${subtotal.toFixed(0)} ready! Phase 5 will process payment.`);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#C8A882] to-[#B6956F] text-[#121416] hover:from-[#DFCAAF] hover:to-[#C8A882] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C8A882]/10 cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Bar (Sticky above Bottom Nav) */}
      <div className="fixed bottom-16 inset-x-0 z-30 p-3 max-w-md mx-auto pointer-events-none">
        <div
          onClick={() => setIsCartOpen(true)}
          className="pointer-events-auto bg-gradient-to-r from-[#1E2227] to-[#181B1F] border border-[#343A43] hover:border-[#C8A882]/70 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-[#C8A882] text-black flex items-center justify-center font-black shadow-md">
              <ShoppingBag className="w-5 h-5 text-black" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#121416]">
                {itemCount}
              </span>
            </div>

            <div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                Order Total
              </div>
              <div className="text-base font-extrabold text-[#C8A882] leading-tight">
                ₱{subtotal.toFixed(0)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#292E36] text-white text-xs font-bold hover:bg-[#323842] transition-colors">
            <span>View Ticket</span>
            <ChevronUp className="w-4 h-4 text-[#C8A882]" />
          </div>
        </div>
      </div>
    </>
  );
}
