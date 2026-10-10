"use client";

import React from "react";
import { Home, Coffee, Receipt, BarChart3 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export type ActiveTab = "home" | "pos" | "orders" | "reports";

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const { itemCount } = useCart();

  const navItems = [
    {
      id: "home" as ActiveTab,
      label: "Home",
      icon: Home,
    },
    {
      id: "pos" as ActiveTab,
      label: "New Order",
      icon: Coffee,
      badge: itemCount > 0 ? itemCount : null,
    },
    {
      id: "orders" as ActiveTab,
      label: "Orders",
      icon: Receipt,
    },
    {
      id: "reports" as ActiveTab,
      label: "Reports",
      icon: BarChart3,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FBF8F2]/95 backdrop-blur-md border-t border-[#EFE8DE] px-3 py-2 max-w-md mx-auto shadow-cafe">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? "text-[#6F452A] font-bold"
                  : "text-[#8C7B70] hover:text-[#2D1C13] font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#6F452A] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-wide transition-colors ${
                  isActive ? "text-[#6F452A] font-semibold" : "text-[#8C7B70]"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#6F452A] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
