"use client";

import React, { useState, useMemo } from "react";
import {
  DEFAULT_QRPH_TEMPLATE,
  extractMerchantName
} from "@/lib/qrph";
import {
  Maximize2,
  Minimize2,
  Copy,
  Check
} from "lucide-react";

interface QRPHDisplayProps {
  amount: number;
  referenceNumber?: string;
  onReferenceChange?: (ref: string) => void;
}

export function QRPHDisplay({
  amount,
  referenceNumber,
  onReferenceChange
}: QRPHDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const merchantName = useMemo(() => {
    return extractMerchantName(DEFAULT_QRPH_TEMPLATE);
  }, []);

  const handleCopyAmount = () => {
    navigator.clipboard?.writeText(amount.toFixed(2));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 1500);
  };

  return (
    <div className="space-y-3 select-none">
      {/* QR Presentation Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-[#F0F7FF] via-[#E8F2FE] to-[#DDEBFC] border border-[#BBD8FC] shadow-cafe-sm text-center relative overflow-hidden">
        {/* Expand / Minimize Button in Top-Right */}
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#5584B3] hover:text-[#007DFE] hover:bg-white transition-colors cursor-pointer"
            title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Owner Account Details Pill */}
        <div className="mb-2">
          <div className="text-xs font-bold text-[#1E3A8A]">
            {merchantName}
          </div>
          <div className="text-[10px] text-[#5584B3] font-medium">
            Verified GCash • InstaPay
          </div>
        </div>

        {/* QR Code Container */}
        <div className="relative inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#D4E7FD] mx-auto my-1">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gcash-qr-cropped.png"
              alt="My GCash QR Code"
              className={`rounded-xl object-contain transition-all ${
                isExpanded ? "w-64 h-64 sm:w-72 sm:h-72" : "w-48 h-48"
              }`}
            />
          </div>
        </div>

        {/* Exact Amount Banner with 1-Tap Copy */}
        <div className="mt-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D4E7FD] shadow-xs">
            <span className="text-[11px] font-semibold text-[#5584B3]">Amount to Pay:</span>
            <span className="font-sans font-extrabold text-lg text-[#007DFE]">
              ₱{amount.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={handleCopyAmount}
              className="p-1 rounded text-[#5584B3] hover:text-[#007DFE] transition-colors cursor-pointer"
              title="Copy Amount"
            >
              {copiedAmount ? (
                <Check className="w-3.5 h-3.5 text-[#256A38]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-[#5584B3] mt-1.5 font-medium flex items-center justify-center gap-1">
            <span>Customer scans and enters <strong>₱{amount.toFixed(2)}</strong></span>
          </p>
        </div>
      </div>

      {/* Cashier Reference Number Verification Input */}
      <div>
        <label className="block text-[11px] font-semibold text-[#8C7B70] mb-1 uppercase tracking-wider">
          GCash Reference No. (Optional)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. 102948... (or last 4 digits)"
            value={referenceNumber || ""}
            onChange={(e) => onReferenceChange && onReferenceChange(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#FBF8F2] border border-[#EFE8DE] text-xs text-[#2D1C13] placeholder-[#A89B92] focus:outline-none focus:border-[#007DFE]"
          />
        </div>
      </div>
    </div>
  );
}
