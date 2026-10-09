"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Moon,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Loader2,
  Clock,
  RotateCcw
} from "lucide-react";

interface ClosingPreviewData {
  date: string;
  isClosed: boolean;
  closingRecord: {
    id: string;
    actualCash: string | number;
    cashDifference: string | number;
    closedAt: string;
    notes?: string | null;
  } | null;
  preview: {
    totalSales: string;
    orderCount: number;
    cashSales: string;
    gcashGross: string;
    gcashFees: string;
    gcashNet: string;
  };
}

interface DailyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DailyClosingModal({
  isOpen,
  onClose,
  onSuccess
}: DailyClosingModalProps) {
  const { token } = useAuth();
  const [data, setData] = useState<ClosingPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Bill denomination counts
  const [counts, setCounts] = useState<{ [denom: number]: number }>({
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0
  });
  const [coinsAmount, setCoinsAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Input mode: "counter" or "direct"
  const [inputMode, setInputMode] = useState<"counter" | "direct">("counter");
  const [directCash, setDirectCash] = useState<string>("");

  const fetchPreview = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const res = await fetch(`${apiUrl}/closing/preview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
        if (json.data.closingRecord) {
          setDirectCash(String(json.data.closingRecord.actualCash));
        }
      } else {
        throw new Error(json.message || "Failed to load closing preview");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPreview();
      setSuccessMsg(null);
    }
  }, [isOpen, token]);

  const updateCount = (denom: number, delta: number) => {
    setCounts((prev) => {
      const current = prev[denom] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [denom]: next };
    });
  };

  const calculatedCashCount = useMemo(() => {
    if (inputMode === "direct") {
      return parseFloat(directCash) || 0;
    }

    let sum = 0;
    Object.entries(counts).forEach(([denom, count]) => {
      sum += Number(denom) * count;
    });
    sum += parseFloat(coinsAmount) || 0;
    return sum;
  }, [counts, coinsAmount, inputMode, directCash]);

  if (!isOpen) return null;

  const expectedCash = parseFloat(data?.preview.cashSales || "0");
  const cashDifference = calculatedCashCount - expectedCash;
  const isExact = cashDifference === 0;
  const isShortage = cashDifference < 0;
  const isOverage = cashDifference > 0;

  const handleSubmitClosing = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const res = await fetch(`${apiUrl}/closing/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          actualCash: calculatedCashCount,
          notes: notes.trim() || undefined
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMsg("Day successfully closed and recorded!");
        if (onSuccess) onSuccess();
        fetchPreview();
      } else {
        throw new Error(json.message || "Failed to submit daily closing");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to record closing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#181B1F] border-t border-x border-[#2C3138] rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200 text-[#F3F4F6] max-h-[92vh] overflow-y-auto">
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-stone-600 rounded-full mx-auto mb-3" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#292E36]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-indigo-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Cash Balancing</h3>
              <p className="text-[11px] text-stone-400">End-of-Day Shift Close</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#22262B] text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-[#C8A882] animate-spin" />
            <p className="text-xs text-stone-400">Loading daily sales summary...</p>
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-xs text-red-400">
            {errorMsg || "Unable to load closing data"}
          </div>
        ) : (
          <div className="py-3 space-y-4">
            {/* Status Alert if Already Closed */}
            {data.isClosed && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">Day Already Closed</span>
                  <div className="text-[11px] text-emerald-400/80">
                    Closed at:{" "}
                    {new Date(data.closingRecord?.closedAt || "").toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Expected Summary Card */}
            <div className="p-4 rounded-2xl bg-[#1F2328] border border-[#2D333C] space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#2C3138] text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                <span>System Expected Sales</span>
                <span>{data.preview.orderCount} Orders</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-stone-300">Expected Cash in Drawer:</span>
                <span className="text-emerald-400 font-mono text-base">
                  ₱{expectedCash.toFixed(0)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>GCash Net Collected:</span>
                <span className="font-mono text-stone-200">
                  ₱{parseFloat(data.preview.gcashNet).toFixed(0)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-stone-400 pt-1 border-t border-[#2C3138]">
                <span>Total Day Revenue:</span>
                <span className="font-bold text-[#C8A882] font-mono">
                  ₱{parseFloat(data.preview.totalSales).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Input Mode Selector */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setInputMode("counter")}
                className={`py-2 px-3 rounded-xl font-bold transition-all ${
                  inputMode === "counter"
                    ? "bg-[#C8A882] text-black shadow-md shadow-[#C8A882]/20"
                    : "bg-[#20242A] text-stone-300 border border-[#2E343D]"
                }`}
              >
                Denomination Counter
              </button>
              <button
                type="button"
                onClick={() => setInputMode("direct")}
                className={`py-2 px-3 rounded-xl font-bold transition-all ${
                  inputMode === "direct"
                    ? "bg-[#C8A882] text-black shadow-md shadow-[#C8A882]/20"
                    : "bg-[#20242A] text-stone-300 border border-[#2E343D]"
                }`}
              >
                Direct Amount
              </button>
            </div>

            {/* DENOMINATION COUNTER MODE */}
            {inputMode === "counter" ? (
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#1C2025] border border-[#2B3139]">
                <div className="text-[11px] font-bold uppercase text-stone-400 tracking-wider mb-2">
                  Bill Quantity Count
                </div>

                {[1000, 500, 200, 100, 50, 20].map((denom) => (
                  <div
                    key={denom}
                    className="flex items-center justify-between py-1 border-b border-[#262B32] last:border-0"
                  >
                    <span className="text-xs font-bold text-stone-200 w-16">
                      ₱{denom}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCount(denom, -1)}
                        className="w-7 h-7 rounded-lg bg-[#272C33] text-stone-300 hover:text-white flex items-center justify-center active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-8 text-center text-xs font-bold font-mono text-white">
                        {counts[denom] || 0}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateCount(denom, 1)}
                        className="w-7 h-7 rounded-lg bg-[#272C33] text-[#C8A882] hover:text-white flex items-center justify-center active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-mono text-stone-400 w-16 text-right">
                      ₱{((counts[denom] || 0) * denom).toFixed(0)}
                    </span>
                  </div>
                ))}

                {/* Loose Coins Field */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200">Loose Coins:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500 text-xs">₱</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={coinsAmount}
                      onChange={(e) => setCoinsAmount(e.target.value)}
                      className="w-20 px-2 py-1 bg-[#121416] border border-[#2E343D] rounded-lg text-xs font-mono text-white text-right focus:outline-none focus:border-[#C8A882]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* DIRECT ENTRY MODE */
              <div className="p-4 rounded-2xl bg-[#1C2025] border border-[#2B3139] space-y-2">
                <label className="block text-xs font-bold text-stone-300">
                  Total Cash Counted in Drawer (₱)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500 font-bold text-sm">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 3500"
                    value={directCash}
                    onChange={(e) => setDirectCash(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-3 rounded-xl bg-[#121416] border border-[#2F353E] text-white text-lg font-black focus:outline-none focus:border-[#C8A882]"
                  />
                </div>
              </div>
            )}

            {/* TOTAL ACTUAL COUNTED & RECONCILIATION VARIANCE */}
            <div className="p-4 rounded-2xl bg-[#1F2328] border border-[#2F353E] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-semibold">Total Counted:</span>
                <span className="text-xl font-black text-white font-mono">
                  ₱{calculatedCashCount.toFixed(0)}
                </span>
              </div>

              {/* Difference Status Badge */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isExact
                    ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-300"
                    : isShortage
                    ? "bg-red-950/40 border-red-700/60 text-red-300"
                    : "bg-amber-950/40 border-amber-700/60 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isExact ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span className="font-bold">
                    {isExact
                      ? "Exact Match!"
                      : isShortage
                      ? "Cash Shortage (Lacking)"
                      : "Cash Over (Excess)"}
                  </span>
                </div>

                <span className="font-mono font-extrabold text-sm">
                  {isExact
                    ? "₱0"
                    : isShortage
                    ? `-₱${Math.abs(cashDifference).toFixed(0)}`
                    : `+₱${cashDifference.toFixed(0)}`}
                </span>
              </div>
            </div>

            {/* Optional Closing Notes */}
            <div>
              <input
                type="text"
                placeholder="Closing notes (e.g. ₱50 tip in drawer, short change)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121416] border border-[#2C3138] text-white text-xs placeholder-stone-500 focus:outline-none focus:border-[#C8A882]"
              />
            </div>

            {/* Submit / Finalize Button */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitClosing}
              className="w-full py-4 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-[#C8A882] to-[#B6956F] text-[#121416] hover:from-[#DFCAAF] hover:to-[#C8A882] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#C8A882]/15 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recording Closing...</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>
                    {data.isClosed
                      ? "Update Daily Closing Record"
                      : "Finalize & Record Day's Close"}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
