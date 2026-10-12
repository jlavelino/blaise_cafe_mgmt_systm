"use client";

import React from "react";
import { Home, Coffee, Receipt } from "lucide-react";
import { useCart } from "@/context/CartContext";

export type ActiveTab = "home" | "pos" | "orders";

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
  ];

  const activeIndex = navItems.findIndex((item) => item.id === activeTab);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FBF8F2]/95 backdrop-blur-md border-t border-[#EFE8DE] px-4 py-2 max-w-md mx-auto shadow-cafe">
      <div className="relative p-1 bg-[#F5EFEB]/90 rounded-2xl border border-[#EAE1D5]/80 flex items-stretch">
        {/* Sliding Terracotta Highlight Pill */}
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-[#8C5837] via-[#7B4D30] to-[#6F452A] shadow-sm shadow-[#6F452A]/25 transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] pointer-events-none"
          style={{
            left: "4px",
            width: "calc((100% - 8px) / 3)",
            transform: `translateX(calc(${activeIndex >= 0 ? activeIndex : 0} * 100%))`,
          }}
        />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? "text-white font-bold"
                  : "text-[#8C7B70] hover:text-[#5A361F] font-medium"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 mb-0.5 transition-all duration-200 ${
                    isActive
                      ? "stroke-[2.5] scale-110 drop-shadow-xs"
                      : "stroke-[1.8]"
                  }`}
                />
                {item.badge && item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs transition-colors duration-200 ${
                      isActive
                        ? "bg-white text-[#6F452A]"
                        : "bg-[#6F452A] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-wide transition-colors duration-200 ${
                  isActive ? "text-white font-bold" : "text-[#8C7B70]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

