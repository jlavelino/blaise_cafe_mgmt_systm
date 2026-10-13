"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Loader2,
  Calendar,
  Save,
  Coins,
  RotateCcw,
  TrendingUp,
  Banknote
} from "lucide-react";
import { API_BASE } from "@/lib/api";

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

  // Direct manual input mode fallback
  const [inputMode, setInputMode] = useState<"counter" | "direct">("counter");
  const [directCash, setDirectCash] = useState<string>("");

  // Notes
  const [notes, setNotes] = useState<string>("");

  // Fetch preview data on modal open
  const fetchPreview = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/closing/preview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setData(json.data);
        if (json.data.closingRecord) {
          setDirectCash(String(json.data.closingRecord.actualCash));
          setNotes(json.data.closingRecord.notes || "");
          setInputMode("direct");
        }
      } else {
        throw new Error(json.message || "Failed to load closing preview");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchPreview();
    }
  }, [isOpen, token]);

  // Stepper helper
  const updateCount = (denom: number, delta: number) => {
    setCounts((prev) => {
      const current = prev[denom] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [denom]: next };
    });
  };

  const handleResetCounts = () => {
    setCounts({
      1000: 0,
      500: 0,
      200: 0,
      100: 0,
      50: 0,
      20: 0
    });
    setCoinsAmount("");
  };

  // Calculate actual cash from counter or direct input
  const calculatedCashCount = useMemo(() => {
    if (inputMode === "direct") {
      return parseFloat(directCash) || 0;
    }

    const billsTotal = Object.entries(counts).reduce((sum, [denom, qty]) => {
      return sum + Number(denom) * qty;
    }, 0);

    const coinsTotal = parseFloat(coinsAmount) || 0;
    return billsTotal + coinsTotal;
  }, [counts, coinsAmount, inputMode, directCash]);

  // Financial figures
  const expectedCash = data ? parseFloat(data.preview.cashSales) : 0;
  const cashDifference = calculatedCashCount - expectedCash;
  const isExact = Math.abs(cashDifference) < 0.01;
  const isShortage = cashDifference < -0.01;
  const isOverage = cashDifference > 0.01;

  const totalSalesNum = data ? parseFloat(data.preview.totalSales) : 0;
  const gcashGrossNum = data ? parseFloat(data.preview.gcashGross) : 0;

  // Submit Handler
  const handleSubmitClosing = async () => {
    if (!token) return;

    if (calculatedCashCount < 0) {
      setErrorMsg("Actual cash counted cannot be negative.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/closing/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          actualCash: Number(calculatedCashCount.toFixed(2)),
          notes: notes.trim() || undefined
        })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMsg("Daily closing recorded successfully!");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error(json.message || "Failed to submit daily closing");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving closing report");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white border-t sm:border border-[#EFE8DE] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200 text-[#2D1C13]">
        {/* Handle bar on mobile */}
        <div className="w-12 h-1 bg-[#E5DCD0] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F5EFEB] text-[#6F452A] flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2D1C13]">End of Day Cash Balancing</h3>
              <p className="text-[11px] text-[#8C7B70]">Shift &amp; Cash Drawer Reconciliation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F5EFEB] text-[#8C7B70] hover:text-[#2D1C13] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-[#6F452A] animate-spin" />
            <p className="text-xs text-[#8C7B70]">Calculating shift sales summary...</p>
          </div>
        ) : !data ? (
          <div className="py-8 text-center text-xs text-red-600">
            {errorMsg || "Unable to load closing data"}
          </div>
        ) : (
          <div className="py-3 space-y-4">
            {/* Status Alert if Already Closed */}
            {data.isClosed && (
              <div className="p-3.5 rounded-2xl bg-[#EAF7ED] border border-[#256A38]/30 text-xs flex items-center gap-2 text-[#256A38]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold">Shift Closed Already</span>
                  <div className="text-[11px] opacity-80">
                    Recorded at:{" "}
                    {new Date(data.closingRecord?.closedAt || "").toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-[#EAF7ED] border border-[#256A38]/30 text-xs text-[#256A38] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sales Summary Card */}
            <div className="p-4 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] space-y-2.5 text-xs shadow-cafe-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DE] font-bold text-[#6F452A]">
                <span className="font-serif text-sm">Shift Sales Summary</span>
                <span className="text-[11px] text-[#8C7B70]">{data.preview.orderCount} Orders</span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#8C7B70]">
                <span>Cash Sales:</span>
                <span className="font-bold text-[#2D1C13]">
                  ₱{expectedCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#8C7B70]">
                <span>GCash Sales:</span>
                <span className="font-bold text-[#007DFE]">
                  ₱{gcashGrossNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Total Sales Solid Roast Banner */}
              <div className="p-3 rounded-xl bg-[#6F452A] text-white flex items-center justify-between font-bold text-sm shadow-xs mt-1">
                <span className="font-serif">Total Revenue</span>
                <span className="font-serif text-base">₱{totalSalesNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Cash Drawer Reconciliation Section */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] space-y-3 shadow-cafe-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#2D1C13]">
                    Cash Drawer Balancing
                  </h4>
                  <p className="text-[11px] text-[#8C7B70]">Count drawer bills and coins</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#8C7B70] tracking-wider">
                    Expected in Drawer
                  </div>
                  <div className="font-serif text-sm font-bold text-[#6F452A]">
                    ₱{expectedCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Input Mode Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F5EFEB] border border-[#EFE8DE]">
                <button
                  type="button"
                  onClick={() => setInputMode("counter")}
                  className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    inputMode === "counter"
                      ? "bg-[#6F452A] text-white shadow-xs"
                      : "text-[#8C7B70] hover:text-[#2D1C13]"
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Denomination Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("direct")}
                  className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    inputMode === "direct"
                      ? "bg-[#6F452A] text-white shadow-xs"
                      : "text-[#8C7B70] hover:text-[#2D1C13]"
                  }`}
                >
                  <span>Direct Total</span>
                </button>
              </div>

              {/* DENOMINATION COUNTER GRID */}
              {inputMode === "counter" ? (
                <div className="space-y-3 pt-1">
                  {/* Grid of Bills (₱1,000, ₱500, ₱200, ₱100, ₱50, ₱20) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1000, 500, 200, 100, 50, 20].map((denom) => {
                      const count = counts[denom] || 0;
                      const subtotal = count * denom;
                      const hasCount = count > 0;

                      return (
                        <div
                          key={denom}
                          className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                            hasCount
                              ? "bg-[#FFF9F5] border-[#D4A373] shadow-xs"
                              : "bg-[#FBF8F2] border-[#EFE8DE] hover:border-[#D8C7B5]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-extrabold text-xs sm:text-sm text-[#2D1C13]">
                              ₱{denom.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-[#8C7B70]">
                              ₱{subtotal.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFE8DE]/60">
                            <button
                              type="button"
                              onClick={() => updateCount(denom, -1)}
                              disabled={count === 0}
                              className="w-7 h-7 rounded-xl bg-white border border-[#EFE8DE] text-[#8C7B70] hover:text-[#2D1C13] hover:bg-[#F5EFEB] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
                              title="Subtract 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="font-bold text-xs sm:text-sm text-[#2D1C13] min-w-5 text-center">
                              {count}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateCount(denom, 1)}
                              className="w-7 h-7 rounded-xl bg-[#6F452A] text-white hover:bg-[#5A361F] active:scale-95 flex items-center justify-center cursor-pointer transition-all shadow-xs"
                              title="Add 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Loose Coins Card */}
                    <div className="col-span-2 sm:col-span-3 p-3 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-white border border-[#EFE8DE] flex items-center justify-center text-[#6F452A] shadow-2xs">
                          <Coins className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#2D1C13]">Loose Coins</div>
                          <div className="text-[10px] text-[#8C7B70]">Quick add or type amount</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1">
                          {[5, 10, 20, 50].map((addVal) => (
                            <button
                              key={addVal}
                              type="button"
                              onClick={() => {
                                const current = parseFloat(coinsAmount) || 0;
                                setCoinsAmount(String(current + addVal));
                              }}
                              className="px-2 py-1 rounded-lg bg-white border border-[#EFE8DE] text-[10px] font-bold text-[#6F452A] hover:bg-[#F5EFEB] cursor-pointer transition-colors"
                            >
                              +{addVal}
                            </button>
                          ))}
                        </div>

                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[#8C7B70] text-xs font-bold">
                            ₱
                          </span>
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            placeholder="0.00"
                            value={coinsAmount}
                            onChange={(e) => setCoinsAmount(e.target.value)}
                            className="w-24 pl-6 pr-2.5 py-1.5 rounded-xl bg-white border border-[#EFE8DE] text-xs font-bold text-[#2D1C13] text-right focus:outline-none focus:border-[#6F452A]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Reset Counts */}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[11px] text-[#8C7B70]">
                      System automatically sums your drawer count
                    </span>
                    <button
                      type="button"
                      onClick={handleResetCounts}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C7B70] hover:text-[#C25E38] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Grid</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Direct Entry Mode */
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-[#8C7B70]">
                    Total Cash Amount in Drawer
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8C7B70] font-bold text-sm">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="e.g. 4850.00"
                      value={directCash}
                      onChange={(e) => setDirectCash(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] text-[#2D1C13] text-base font-bold focus:outline-none focus:border-[#6F452A]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* LARGE COLOR-CODED VARIANCE INDICATOR */}
            <div
              className={`p-4 rounded-3xl border transition-all text-center relative overflow-hidden ${
                isExact
                  ? "bg-gradient-to-b from-[#F2FBF4] to-[#E5F7E9] border-[#256A38]/30 shadow-xs"
                  : isShortage
                  ? "bg-gradient-to-b from-[#FFF5F0] to-[#FFEBE0] border-[#C25E38]/30 shadow-xs"
                  : "bg-gradient-to-b from-[#FFF7ED] to-[#FFEDD5] border-[#D25E1A]/30 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {isExact ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#256A38]/10 text-[#256A38] text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Reconciliation Status: Balanced
                  </span>
                ) : isShortage ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C25E38]/10 text-[#C25E38] text-[10px] font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Reconciliation Status: Shortage
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D25E1A]/10 text-[#D25E1A] text-[10px] font-bold uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Reconciliation Status: Overage
                  </span>
                )}
              </div>

              {/* Large Color-Coded Typography */}
              <div
                className={`font-serif text-3xl sm:text-4xl font-black tracking-tight my-1.5 ${
                  isExact
                    ? "text-[#256A38]"
                    : isShortage
                    ? "text-[#C25E38]"
                    : "text-[#D25E1A]"
                }`}
              >
                {isExact
                  ? "Balanced (₱0.00)"
                  : isShortage
                  ? `Shortage (-₱${Math.abs(cashDifference).toFixed(2)})`
                  : `Overage (+₱${cashDifference.toFixed(2)})`}
              </div>

              {/* Subtext Comparison */}
              <div className="text-[11px] font-medium text-[#8C7B70] mt-1.5 flex items-center justify-center gap-3 flex-wrap">
                <span>
                  Expected: <strong className="text-[#2D1C13]">₱{expectedCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                </span>
                <span>•</span>
                <span>
                  Actual Count: <strong className="text-[#2D1C13]">₱{calculatedCashCount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
            </div>

            {/* Optional Closing Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8C7B70] mb-1 uppercase tracking-wider">
                Shift Closing Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Petty cash replenishment, minor change variance..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] text-[#2D1C13] text-xs placeholder-[#8C7B70] focus:outline-none focus:border-[#6F452A]"
              />
            </div>

            {/* Save Report Button */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitClosing}
              className="w-full py-4 px-4 rounded-full font-bold text-sm bg-[#6F452A] text-white hover:bg-[#5A361F] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Cash Balancing...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Closing Report</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
