"use client";

import React from "react";
import { Product, ProductVariant } from "@/types";
import { Coffee, Utensils, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onDirectAdd: (product: Product, variant: ProductVariant) => void;
}

export function ProductCard({
  product,
  onSelectProduct,
  onDirectAdd
}: ProductCardProps) {
  const isSingleVariant = product.variants.length === 1;
  const isSnack = product.category?.name.toLowerCase().includes("snack");

  // Determine price display
  const prices = product.variants.map((v) => Number(v.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const priceLabel =
    isSingleVariant || minPrice === maxPrice
      ? `₱${minPrice.toFixed(0)}`
      : `₱${minPrice.toFixed(0)} - ₱${maxPrice.toFixed(0)}`;

  const handleClick = () => {
    if (isSingleVariant && product.variants[0]) {
      onDirectAdd(product, product.variants[0]);
    } else {
      onSelectProduct(product);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-[#191C20] border border-[#2B3037] hover:border-[#C8A882]/70 active:scale-[0.98] transition-all cursor-pointer shadow-md select-none"
    >
      {/* Top row: Icon & Category */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#22262C] border border-[#30363F] flex items-center justify-center text-stone-300 group-hover:text-[#C8A882] transition-colors">
          {isSnack ? (
            <Utensils className="w-4 h-4" />
          ) : (
            <Coffee className="w-4 h-4" />
          )}
        </div>

        {isSingleVariant ? (
          <span className="text-[10px] font-semibold text-stone-400 px-1.5 py-0.5 rounded-md bg-[#24282E]">
            1 Size
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-[#C8A882] px-1.5 py-0.5 rounded-md bg-[#C8A882]/10 border border-[#C8A882]/20">
            12 • 16oz
          </span>
        )}
      </div>

      {/* Product Title */}
      <div className="flex-1 my-1">
        <h4 className="text-xs font-bold text-white group-hover:text-[#C8A882] line-clamp-2 leading-snug transition-colors">
          {product.name}
        </h4>
      </div>

      {/* Bottom row: Price and Add indicator */}
      <div className="mt-2.5 pt-2 border-t border-[#2B3037]/70 flex items-center justify-between">
        <span className="text-xs font-extrabold text-[#C8A882]">
          {priceLabel}
        </span>

        <div className="w-6 h-6 rounded-lg bg-[#24282F] group-hover:bg-[#C8A882] group-hover:text-[#121416] text-stone-300 flex items-center justify-center transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
