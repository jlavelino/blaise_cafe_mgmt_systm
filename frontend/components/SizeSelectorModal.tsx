"use client";

import React from "react";
import { Product, ProductVariant } from "@/types";
import { X, Coffee, Plus } from "lucide-react";

interface SizeSelectorModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectVariant: (product: Product, variant: ProductVariant) => void;
}

export function SizeSelectorModal({
  product,
  onClose,
  onSelectVariant
}: SizeSelectorModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Modal */}
      <div className="relative w-full max-w-md bg-[#191C20] border-t border-x border-[#2C3138] rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200">
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-stone-600 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C8A882] px-2 py-0.5 rounded-full bg-[#C8A882]/10 border border-[#C8A882]/20">
              {product.category?.name || "Drink"}
            </span>
            <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Select cup size for this order
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#24282E] text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Size Selection Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          {product.variants.map((variant) => {
            const priceNum = Number(variant.price);
            const is12oz = variant.size?.toLowerCase().includes("12");

            return (
              <button
                key={variant.id}
                onClick={() => {
                  onSelectVariant(product, variant);
                  onClose();
                }}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-[#202429] border border-[#2F353D] hover:border-[#C8A882] hover:bg-[#272B31] active:scale-95 transition-all text-center cursor-pointer shadow-lg"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                    is12oz
                      ? "bg-stone-800/80 text-stone-300 group-hover:text-[#C8A882]"
                      : "bg-[#C8A882]/15 text-[#C8A882]"
                  }`}
                >
                  <Coffee className={is12oz ? "w-6 h-6" : "w-7 h-7"} />
                </div>

                <span className="text-sm font-bold text-white group-hover:text-[#C8A882] transition-colors">
                  {variant.size || "Standard"}
                </span>

                <span className="text-base font-extrabold text-[#C8A882] mt-0.5">
                  ₱{priceNum.toFixed(0)}
                </span>

                <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-stone-400 group-hover:text-white transition-colors">
                  <Plus className="w-3 h-3" />
                  <span>Add to Order</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
