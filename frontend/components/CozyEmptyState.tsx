"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface CozyEmptyStateProps {
  type?: "steaming-cup" | "calendar" | "search";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function CozyEmptyState({
  type = "steaming-cup",
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  compact = false,
}: CozyEmptyStateProps) {
  return (
    <div
      className={`text-center flex flex-col items-center justify-center select-none ${
        compact ? "py-4 px-3 space-y-2" : "py-8 px-4 space-y-3.5"
      } ${className}`}
    >
      {/* Steaming Coffee Cup Graphic */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Warm Glow Halo */}
        <div
          className={`rounded-full bg-gradient-to-b from-[#FAF4EE] via-[#F5EFEB] to-[#EAE0D5] border border-[#EBE1D5] shadow-xs flex items-center justify-center ${
            compact ? "w-16 h-16" : "w-24 h-24"
          }`}
        >
          {type === "steaming-cup" ? (
            <svg
              viewBox="0 0 100 100"
              className={compact ? "w-12 h-12" : "w-18 h-18"}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C69068" />
                  <stop offset="50%" stopColor="#8C5837" />
                  <stop offset="100%" stopColor="#6F452A" />
                </linearGradient>
                <linearGradient id="coffeeSurface" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3E2213" />
                  <stop offset="50%" stopColor="#5A361F" />
                  <stop offset="100%" stopColor="#3E2213" />
                </linearGradient>
                <linearGradient id="steamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#C69068" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#D99B6A" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F5EFEB" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Saucer */}
              <ellipse
                cx="50"
                cy="80"
                rx="34"
                ry="6"
                fill="#E8DEC8"
                stroke="#D1C3AD"
                strokeWidth="1.5"
              />

              {/* Mug Handle */}
              <path
                d="M68 47 C 80 47, 82 63, 66 65"
                fill="none"
                stroke="#6F452A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M68 49 C 77 49, 78 61, 66 63"
                fill="none"
                stroke="#8C5837"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Mug Body */}
              <path
                d="M32 43 H 68 C 68 43, 67 75, 50 75 C 33 75, 32 43, 32 43 Z"
                fill="url(#cupGrad)"
                stroke="#5A361F"
                strokeWidth="1.8"
              />

              {/* Mug Highlight Reflection */}
              <path
                d="M36 46 C 35 53, 37 66, 43 71"
                fill="none"
                stroke="#FBF8F2"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.35"
              />

              {/* Coffee Liquid Rim & Crema */}
              <ellipse
                cx="50"
                cy="43"
                rx="18"
                ry="5"
                fill="url(#coffeeSurface)"
                stroke="#5A361F"
                strokeWidth="1.2"
              />
              <ellipse
                cx="50"
                cy="43"
                rx="14"
                ry="3.5"
                fill="#A6734E"
                opacity="0.85"
              />

              {/* Tiny Latte Art Heart in Crema */}
              <path
                d="M50 41.5 C 48.8 40.2, 47 41.2, 48.8 43 L 50 44.2 L 51.2 43 C 53 41.2, 51.2 40.2, 50 41.5 Z"
                fill="#FFFBF5"
                opacity="0.9"
              />

              {/* Rising Animated Steam Wisps */}
              {/* Left Steam Line */}
              <path
                d="M43 35 C 39 28, 47 21, 42 14 C 40 10, 43 7, 41 3"
                fill="none"
                stroke="url(#steamGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="animate-steam-left"
              />

              {/* Center Steam Line */}
              <path
                d="M50 33 C 54 26, 46 19, 51 12 C 54 7, 49 4, 51 1"
                fill="none"
                stroke="url(#steamGrad)"
                strokeWidth="2.6"
                strokeLinecap="round"
                className="animate-steam-mid"
              />

              {/* Right Steam Line */}
              <path
                d="M57 35 C 61 28, 53 21, 58 14 C 61 10, 57 7, 59 3"
                fill="none"
                stroke="url(#steamGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="animate-steam-right"
              />
            </svg>
          ) : type === "calendar" ? (
            <svg
              viewBox="0 0 100 100"
              className={compact ? "w-12 h-12" : "w-18 h-18"}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C69068" />
                  <stop offset="100%" stopColor="#6F452A" />
                </linearGradient>
              </defs>
              {/* Calendar Base */}
              <rect
                x="28"
                y="28"
                width="44"
                height="46"
                rx="8"
                fill="#FFFFFF"
                stroke="#D1C3AD"
                strokeWidth="2"
              />
              {/* Header Bar */}
              <path
                d="M28 36 C 28 31.5, 31.5 28, 36 28 H 64 C 68.5 28, 72 31.5, 72 36 V 42 H 28 V 36 Z"
                fill="url(#calGrad)"
              />
              {/* Calendar Rings */}
              <rect x="36" y="22" width="4" height="10" rx="2" fill="#5A361F" />
              <rect x="60" y="22" width="4" height="10" rx="2" fill="#5A361F" />
              {/* Mini Coffee Cup on Calendar */}
              <ellipse cx="50" cy="62" rx="12" ry="3" fill="#E8DEC8" />
              <path
                d="M44 51 H 56 C 56 51, 55.5 61, 50 61 C 44.5 61, 44 51, 44 51 Z"
                fill="#8C5837"
              />
              <path
                d="M56 53 C 60 53, 60 58, 55 58"
                fill="none"
                stroke="#8C5837"
                strokeWidth="1.5"
              />
              {/* Steam dots */}
              <circle cx="48" cy="46" r="1" fill="#C69068" className="animate-steam-left" />
              <circle cx="52" cy="44" r="1.2" fill="#C69068" className="animate-steam-mid" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 100 100"
              className={compact ? "w-12 h-12" : "w-18 h-18"}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Search Glass with Coffee Bean */}
              <circle
                cx="46"
                cy="46"
                r="22"
                fill="#FFFFFF"
                stroke="#8C5837"
                strokeWidth="3.5"
              />
              <line
                x1="62"
                y1="62"
                x2="78"
                y2="78"
                stroke="#6F452A"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Stylized Coffee Bean in lens */}
              <ellipse
                cx="46"
                cy="46"
                rx="11"
                ry="8"
                transform="rotate(-25 46 46)"
                fill="#8C5837"
              />
              <path
                d="M40 40 Q 46 46 52 52"
                fill="none"
                stroke="#FAF4EE"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {/* Floating Warm Sparkle Accent */}
        <div className="absolute -top-1 -right-1 p-1 bg-white/90 rounded-full shadow-xs border border-[#EFE8DE] text-[#D99B6A]">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Text Copy */}
      <div className="space-y-1 max-w-xs mx-auto">
        <h4
          className={`font-serif font-bold text-[#2D1C13] ${
            compact ? "text-xs" : "text-sm sm:text-base"
          }`}
        >
          {title}
        </h4>
        {description && (
          <p
            className={`text-[#8C7B70] leading-relaxed ${
              compact ? "text-[11px]" : "text-xs"
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {/* Action Button (Optional) */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8C5837] to-[#6F452A] text-white text-xs font-semibold shadow-xs hover:shadow-sm hover:from-[#7A4B2D] hover:to-[#5E3820] active:scale-95 transition-all cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
