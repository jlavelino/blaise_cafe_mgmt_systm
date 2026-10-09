"use client";

import React from "react";
import { Category } from "@/types";
import { Coffee, Milk, Sparkles, Utensils, LayoutGrid } from "lucide-react";

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
    if (lower.includes("coffee")) return <Coffee className="w-3.5 h-3.5" />;
    if (lower.includes("milk")) return <Milk className="w-3.5 h-3.5" />;
    if (lower.includes("matcha")) return <Sparkles className="w-3.5 h-3.5" />;
    if (lower.includes("snack")) return <Utensils className="w-3.5 h-3.5" />;
    return <Coffee className="w-3.5 h-3.5" />;
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 px-4 min-w-max">
        {/* All Products Pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedCategoryId === null
              ? "bg-[#C8A882] text-[#121416] shadow-md shadow-[#C8A882]/20 scale-[1.02]"
              : "bg-[#1C2024] text-stone-300 border border-[#2B3037] hover:border-stone-500 hover:text-white"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All Items</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategoryId === null
                ? "bg-black/20 text-black font-bold"
                : "bg-stone-800 text-stone-400"
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#C8A882] text-[#121416] shadow-md shadow-[#C8A882]/20 scale-[1.02]"
                  : "bg-[#1C2024] text-stone-300 border border-[#2B3037] hover:border-stone-500 hover:text-white"
              }`}
            >
              {getCategoryIcon(cat.name)}
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-black/20 text-black font-bold"
                    : "bg-stone-800 text-stone-400"
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
