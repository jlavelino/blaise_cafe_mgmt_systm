"use client";

import React from "react";
import { Category } from "@/types";
import { Coffee, Milk, Sparkles, Utensils, LayoutGrid, CupSoda } from "lucide-react";

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export function CategoryPills({
  categories,
  selectedCategoryId,
  onSelectCategory,
  categoryCounts,
  totalCount
}: CategoryPillsProps) {
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("coffee") || lower.includes("espresso") || lower.includes("brew")) {
      return <Coffee className="w-3.5 h-3.5" />;
    }
    if (lower.includes("milk") || lower.includes("latte")) {
      return <Milk className="w-3.5 h-3.5" />;
    }
    if (lower.includes("matcha") || lower.includes("tea")) {
      return <Sparkles className="w-3.5 h-3.5" />;
    }
    if (
      lower.includes("snack") ||
      lower.includes("pastr") ||
      lower.includes("food") ||
      lower.includes("siomai") ||
      lower.includes("bread")
    ) {
      return <Utensils className="w-3.5 h-3.5" />;
    }
    if (lower.includes("soda") || lower.includes("beverage") || lower.includes("drink")) {
      return <CupSoda className="w-3.5 h-3.5" />;
    }
    return <Coffee className="w-3.5 h-3.5" />;
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 px-4 min-w-max">
        {/* All Products Pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
            selectedCategoryId === null
              ? "bg-[#6F452A] text-white shadow-cafe-sm scale-[1.02] ring-2 ring-[#6F452A]/20"
              : "bg-white text-[#8C7B70] border border-[#EFE8DE] hover:border-[#6F452A]/40 hover:text-[#2D1C13]"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedCategoryId === null
                ? "bg-white/20 text-white font-bold"
                : "bg-[#F5EFEB] text-[#6F452A] font-semibold"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                isSelected
                  ? "bg-[#6F452A] text-white shadow-cafe-sm scale-[1.02] ring-2 ring-[#6F452A]/20"
                  : "bg-white text-[#8C7B70] border border-[#EFE8DE] hover:border-[#6F452A]/40 hover:text-[#2D1C13]"
              }`}
            >
              {getCategoryIcon(cat.name)}
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-white/20 text-white font-bold"
                    : "bg-[#F5EFEB] text-[#6F452A] font-semibold"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
