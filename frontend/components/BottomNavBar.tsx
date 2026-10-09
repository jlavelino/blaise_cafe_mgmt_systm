"use client";

import React from "react";
import { Coffee, BarChart3, Receipt } from "lucide-react";
import { useCart } from "@/context/CartContext";

export type ActiveTab = "pos" | "dashboard" | "orders";

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#16191D]/95 backdrop-blur-lg border-t border-[#2A2F37] px-4 py-2 max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-1">
        {/* Register Tab */}
        <button
          onClick={() => onTabChange("pos")}
          className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === "pos"
              ? "text-[#C8A882] font-bold"
              : "text-stone-400 hover:text-stone-200 font-medium"
          }`}
        >
          <div className="relative">
            <Coffee className="w-5 h-5 mb-0.5" />
            {itemCount > 0 && activeTab !== "pos" && (
              <span className="absolute -top-1.5 -right-2 bg-[#C8A882] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wide">Register</span>
        </button>

        {/* Dashboard Tab */}
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === "dashboard"
              ? "text-[#C8A882] font-bold"
              : "text-stone-400 hover:text-stone-200 font-medium"
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wide">Dashboard</span>
        </button>

        {/* Orders Tab */}
        <button
          onClick={() => onTabChange("orders")}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === "orders"
              ? "text-[#C8A882] font-bold"
              : "text-stone-400 hover:text-stone-200 font-medium"
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wide">Orders</span>
        </button>
      </div>
    </nav>
  );
}
