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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Modal */}
      <div className="relative w-full max-w-md bg-white border-t border-[#EFE8DE] rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200">
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-[#E5DCD0] rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F452A] px-2.5 py-0.5 rounded-full bg-[#F5EFEB] border border-[#EFE8DE]">
              {product.category?.name || "Drink"}
            </span>
            <h3 className="font-serif text-lg font-bold text-[#2D1C13] mt-1.5 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-[#8C7B70] mt-0.5">
              Choose your cup size
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F5EFEB] text-[#8C7B70] hover:text-[#2D1C13] transition-colors cursor-pointer"
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
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] hover:border-[#6F452A] hover:bg-white active:scale-95 transition-all text-center cursor-pointer shadow-cafe-sm"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 transition-colors ${
                    is12oz
                      ? "bg-[#F5EFEB] text-[#6F452A] group-hover:bg-[#6F452A] group-hover:text-white"
                      : "bg-[#EFE8DE] text-[#6F452A] group-hover:bg-[#6F452A] group-hover:text-white"
                  }`}
                >
                  <Coffee className={is12oz ? "w-6 h-6" : "w-7 h-7 stroke-[2]"} />
                </div>

                <span className="text-sm font-bold text-[#2D1C13] group-hover:text-[#6F452A] transition-colors">
                  {variant.size || "Standard"}
                </span>

                <span className="text-base font-extrabold text-[#6F452A] mt-0.5">
                  ₱{priceNum.toFixed(0)}
                </span>

                <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-[#8C7B70] group-hover:text-[#6F452A] transition-colors">
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>Select Size</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
