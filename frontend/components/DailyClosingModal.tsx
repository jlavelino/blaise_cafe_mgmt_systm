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
  Calendar,
  Save
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

  const totalSalesNum = data ? parseFloat(data.preview.totalSales) : 0;
  const gcashGrossNum = data ? parseFloat(data.preview.gcashGross) : 0;
  const gcashFeesNum = data ? parseFloat(data.preview.gcashFees) : 0;
  const gcashNetNum = data ? parseFloat(data.preview.gcashNet) : 0;
  const netSalesNum = expectedCash + gcashNetNum;

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

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border-t sm:border border-[#EFE8DE] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-5 duration-200 text-[#2D1C13]">
        {/* Handle bar on mobile */}
        <div className="w-12 h-1 bg-[#E5DCD0] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header (Matching 4.jpg Screen 8) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F5EFEB] text-[#6F452A] flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2D1C13]">End of Day</h3>
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

            {/* Sales Summary Card (Matching 4.jpg Screen 8) */}
            <div className="p-4 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] space-y-2.5 text-xs shadow-cafe-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DE] font-bold text-[#6F452A]">
                <span className="font-serif text-sm">Sales Summary</span>
                <span className="text-[11px] text-[#8C7B70]">{data.preview.orderCount} Orders</span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#8C7B70]">
                <span>Total Sales:</span>
                <span className="font-bold text-[#2D1C13]">
                  ₱{totalSalesNum.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#8C7B70]">
                <span>Cash:</span>
                <span className="font-bold text-[#2D1C13]">
                  ₱{expectedCash.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#8C7B70]">
                <span>GCash:</span>
                <span className="font-bold text-[#007DFE]">
                  ₱{gcashGrossNum.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#8C7B70]">
                <span>GCash Fees:</span>
                <span className="font-bold text-[#D25E1A]">
                  ₱{gcashFeesNum.toFixed(2)}
                </span>
              </div>

              {/* Net Sales Solid Roast Banner (Matching 4.jpg Screen 8) */}
              <div className="p-3 rounded-xl bg-[#6F452A] text-white flex items-center justify-between font-bold text-sm shadow-xs mt-1">
                <span className="font-serif">Net Sales</span>
                <span className="font-serif text-base">₱{netSalesNum.toLocaleString("en-US", { minimumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Cash Reconciliation Section (Matching 4.jpg Screen 8) */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] space-y-3 shadow-cafe-sm">
              <h4 className="font-serif text-sm font-bold text-[#2D1C13]">
                Cash Reconciliation
              </h4>

              <div className="flex justify-between items-center text-xs text-[#8C7B70]">
                <span>Expected Cash in Drawer:</span>
                <span className="font-bold text-[#6F452A] text-sm">
                  ₱{expectedCash.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </span>
              </div>

              {/* Mode switch */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-[#F5EFEB] border border-[#EFE8DE]">
                <button
                  type="button"
                  onClick={() => setInputMode("counter")}
                  className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    inputMode === "counter"
                      ? "bg-[#6F452A] text-white shadow-xs"
                      : "text-[#8C7B70] hover:text-[#2D1C13]"
                  }`}
                >
                  Bill Counter
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("direct")}
                  className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    inputMode === "direct"
                      ? "bg-[#6F452A] text-white shadow-xs"
                      : "text-[#8C7B70] hover:text-[#2D1C13]"
                  }`}
                >
                  Direct Amount
                </button>
              </div>

              {/* Counter Mode */}
              {inputMode === "counter" ? (
                <div className="space-y-1.5 pt-1">
                  {[1000, 500, 200, 100, 50, 20].map((denom) => (
                    <div
                      key={denom}
                      className="flex items-center justify-between py-1 border-b border-[#F5EFEB] last:border-0"
                    >
                      <span className="text-xs font-bold text-[#2D1C13] w-14">
                        ₱{denom}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCount(denom, -1)}
                          className="w-6 h-6 rounded-full bg-[#F5EFEB] text-[#8C7B70] hover:text-[#2D1C13] flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-6 text-center text-xs font-bold text-[#2D1C13]">
                          {counts[denom] || 0}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateCount(denom, 1)}
                          className="w-6 h-6 rounded-full bg-[#F5EFEB] text-[#6F452A] hover:bg-[#6F452A] hover:text-white flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs text-[#8C7B70] w-16 text-right">
                        ₱{((counts[denom] || 0) * denom).toFixed(0)}
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#8C7B70]">Loose Coins:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#8C7B70]">₱</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={coinsAmount}
                        onChange={(e) => setCoinsAmount(e.target.value)}
                        className="w-20 px-2.5 py-1 bg-[#FBF8F2] border border-[#EFE8DE] rounded-xl text-xs text-[#2D1C13] text-right focus:outline-none focus:border-[#6F452A]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Direct Entry Mode */
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-[#8C7B70]">
                    Actual Cash Counted
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8C7B70] font-bold text-sm">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="e.g. 7850"
                      value={directCash}
                      onChange={(e) => setDirectCash(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] text-[#2D1C13] text-base font-bold focus:outline-none focus:border-[#6F452A]"
                    />
                  </div>
                </div>
              )}

              {/* Total Counted & Live Difference Banner (Matching 4.jpg Screen 8) */}
              <div className="pt-2 border-t border-[#F5EFEB] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#8C7B70]">Actual Counted:</span>
                  <span className="font-bold text-[#2D1C13] text-sm">
                    ₱{calculatedCashCount.toFixed(0)}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                    isExact
                      ? "bg-[#EAF7ED] border-[#256A38]/30 text-[#256A38]"
                      : isShortage
                      ? "bg-[#FDECEC] border-[#C5221F]/30 text-[#C5221F]"
                      : "bg-[#FFF1E5] border-[#D25E1A]/30 text-[#D25E1A]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isExact ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span>
                      {isExact
                        ? "Exact Match!"
                        : isShortage
                        ? "Difference (Shortage)"
                        : "Difference (Over)"}
                    </span>
                  </div>

                  <span className="font-bold text-sm">
                    {isExact
                      ? "₱0"
                      : isShortage
                      ? `-₱${Math.abs(cashDifference).toFixed(0)}`
                      : `+₱${cashDifference.toFixed(0)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Closing Notes */}
            <div>
              <input
                type="text"
                placeholder="Optional closing notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FBF8F2] border border-[#EFE8DE] text-[#2D1C13] text-xs placeholder-[#8C7B70] focus:outline-none focus:border-[#6F452A]"
              />
            </div>

            {/* Save Report Button (Matching 4.jpg Screen 8) */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitClosing}
              className="w-full py-3.5 px-4 rounded-full font-bold text-sm bg-[#6F452A] text-white hover:bg-[#5A361F] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Report...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Report</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
