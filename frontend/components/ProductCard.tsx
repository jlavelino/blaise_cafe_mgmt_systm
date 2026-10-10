"use client";

import React from "react";
import { Product, ProductVariant } from "@/types";
import { Coffee, Utensils, Sparkles, Plus } from "lucide-react";

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
  const isMatcha = product.name.toLowerCase().includes("matcha");

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

  // Thumbnail gradient background by drink type
  const getThumbnailTheme = () => {
    if (isSnack) return "from-[#FCE8D5] to-[#F7D3B5] text-[#A6642A]";
    if (isMatcha) return "from-[#E3F2E6] to-[#CBE5D1] text-[#2D6A4F]";
    if (product.name.toLowerCase().includes("americano")) return "from-[#4A3225] to-[#2B1B13] text-[#EFE8DE]";
    return "from-[#F3ECE2] to-[#E5D7C7] text-[#6F452A]";
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col justify-between p-3 rounded-2xl bg-white border border-[#EFE8DE] hover:border-[#6F452A]/50 active:scale-[0.98] transition-all cursor-pointer shadow-cafe-sm hover:shadow-cafe select-none"
    >
      {/* Product Image Thumbnail / Container */}
      <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${getThumbnailTheme()} flex flex-col items-center justify-center relative overflow-hidden mb-2.5 transition-transform group-hover:scale-[1.02]`}>
        {/* Soft cup icon representation */}
        {isSnack ? (
          <Utensils className="w-8 h-8 stroke-[1.8]" />
        ) : isMatcha ? (
          <Sparkles className="w-8 h-8 stroke-[1.8]" />
        ) : (
          <Coffee className="w-8 h-8 stroke-[1.8]" />
        )}

        {/* Size Badge */}
        <div className="absolute top-2 right-2">
          {isSingleVariant ? (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-[#6F452A] shadow-xs">
              1 Size
            </span>
          ) : (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#6F452A] text-white shadow-xs">
              12 • 16oz
            </span>
          )}
        </div>
      </div>

      {/* Product Title & Category */}
      <div className="flex-1 my-0.5">
        <h4 className="text-xs font-bold text-[#2D1C13] line-clamp-1 leading-snug group-hover:text-[#6F452A] transition-colors">
          {product.name}
        </h4>
        <p className="text-[10px] text-[#8C7B70] line-clamp-1">
          {product.category?.name || "Café Drink"}
        </p>
      </div>

      {/* Bottom row: Price and Quick Add Button */}
      <div className="mt-2 pt-2 border-t border-[#F5EFEB] flex items-center justify-between">
        <span className="text-xs font-extrabold text-[#6F452A]">
          {priceLabel}
        </span>

        <div className="w-6 h-6 rounded-full bg-[#F5EFEB] group-hover:bg-[#6F452A] group-hover:text-white text-[#6F452A] flex items-center justify-center transition-all shadow-xs">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
}
