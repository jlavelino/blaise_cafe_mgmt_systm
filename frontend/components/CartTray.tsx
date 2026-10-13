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

  const [isBouncing, setIsBouncing] = React.useState(false);
  const prevCountRef = React.useRef(itemCount);

  React.useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 450);
      prevCountRef.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  if (itemCount === 0) return null;

  return (
    <>
      {/* Expanded Order Drawer (Modal) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

          <div className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-white border-t border-[#EFE8DE] rounded-t-3xl shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200">
            {/* Handle bar */}
            <div className="w-12 h-1 bg-[#E5DCD0] rounded-full mx-auto mt-3" />

            {/* Header */}
            <div className="p-4 border-b border-[#F5EFEB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F5EFEB] text-[#6F452A] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#2D1C13]">Current Order</h3>
                  <p className="text-[11px] text-[#8C7B70]">
                    {itemCount} {itemCount === 1 ? "item" : "items"} in cart
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCart}
                  className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full bg-[#F5EFEB] text-[#8C7B70] hover:text-[#2D1C13] transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 bg-[#FBF8F2] text-[10px] font-bold text-[#8C7B70] uppercase tracking-wider border-b border-[#F5EFEB]">
              <span className="col-span-5">Items</span>
              <span className="col-span-3 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {/* Item List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#F5EFEB]">
              {items.map((item) => (
                <div key={item.variantId} className="pt-3 first:pt-0 grid grid-cols-12 items-center gap-1">
                  {/* Item info */}
                  <div className="col-span-5 min-w-0 pr-1">
                    <h4 className="text-xs font-bold text-[#2D1C13] truncate">
                      {item.productName}
                    </h4>
                    {item.size && (
                      <span className="text-[9px] font-semibold text-[#6F452A] px-1.5 py-0.2 rounded-full bg-[#F5EFEB]">
                        {item.size}
                      </span>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="col-span-3 flex items-center justify-center">
                    <div className="flex items-center bg-[#FBF8F2] border border-[#EFE8DE] rounded-full p-0.5">
                      <button
                        onClick={() => updateQuantity(item.variantId, -1)}
                        className="w-5 h-5 flex items-center justify-center text-[#8C7B70] hover:text-[#2D1C13] active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>

                      <span className="w-5 text-center text-xs font-bold text-[#2D1C13]">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.variantId, 1)}
                        className="w-5 h-5 flex items-center justify-center text-[#6F452A] hover:text-[#2D1C13] active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-2 text-right text-[11px] text-[#8C7B70]">
                    ₱{item.unitPrice}
                  </div>

                  {/* Line Total & Trash */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-[#2D1C13]">
                      ₱{(Number(item.unitPrice) * item.quantity).toFixed(0)}
                    </span>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-[#8C7B70] hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Total & Checkout CTA */}
            <div className="p-4 border-t border-[#F5EFEB] bg-[#FBF8F2] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-semibold text-[#8C7B70]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#6F452A]">
                  ₱{subtotal.toFixed(0)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (onProceedToCheckout) {
                    onProceedToCheckout();
                  }
                }}
                className="w-full py-3.5 px-4 rounded-full font-bold text-sm bg-[#6F452A] text-white hover:bg-[#5A361F] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick-Checkout Bar (Pill shaped, floating above Bottom Nav) */}
      <div className="fixed bottom-[74px] sm:bottom-20 inset-x-0 z-30 px-3 max-w-md mx-auto pointer-events-none">
        <div
          className={`pointer-events-auto rounded-full bg-[#2D1C13] text-white border border-[#D49E78]/50 shadow-2xl p-1.5 pl-3 flex items-center justify-between transition-all select-none ${
            isBouncing ? "animate-pop-bounce ring-4 ring-[#D49E78]/50 scale-[1.03]" : ""
          }`}
        >
          {/* Left section: Open Cart Drawer */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer py-1 text-left min-w-0 flex-1"
            title="Tap to review order items"
          >
            <div className="relative w-8 h-8 rounded-full bg-[#6F452A] text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm border border-[#D49E78]/40">
              <ShoppingBag className="w-4 h-4 text-amber-200" />
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#2D1C13]">
                {itemCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-semibold text-[#EAD8CA]">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              <span className="text-white/40">•</span>
              <span className="font-sans text-sm font-extrabold text-white tracking-normal">
                ₱{subtotal.toFixed(0)}
              </span>
            </div>
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-white/20 mx-1 flex-shrink-0" />

          {/* Right section: 1-Tap Quick Charge Action */}
          <button
            onClick={() => {
              if (onProceedToCheckout) {
                onProceedToCheckout();
              }
            }}
            className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-gradient-to-r from-[#C69068] to-[#8C5837] text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex-shrink-0"
            title="Charge Now"
          >
            <span>Charge</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </>
  );
}
