"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompletedOrderData } from "./ReceiptModal";
import {
  Receipt,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Banknote,
  QrCode,
  Calendar,
  Coffee,
  SlidersHorizontal,
  CheckCircle2
} from "lucide-react";
import { API_BASE } from "@/lib/api";

interface OrderHistoryViewProps {
  onSelectOrder: (order: CompletedOrderData) => void;
}

function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const todayStr = toDateString(new Date());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  if (dateStr === todayStr) {
    return "Today, " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (dateStr === yesterdayStr) {
    return "Yesterday, " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function OrderHistoryView({ onSelectOrder }: OrderHistoryViewProps) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<CompletedOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PREPARING" | "SERVED">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Today string
  const todayStr = useMemo(() => toDateString(new Date()), []);

  // History selected date (defaults to yesterday)
  const defaultHistoryDate = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return toDateString(y);
  }, []);

  const [historyDate, setHistoryDate] = useState<string>(defaultHistoryDate);

  // Active query date
  const effectiveDate = activeTab === "active" ? todayStr : historyDate;

  // Step days in history mode
  const handleStepDay = (delta: number) => {
    const [y, m, d] = historyDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + delta);
    setHistoryDate(toDateString(date));
  };

  const isHistoryAtToday = historyDate >= todayStr;

  const fetchOrders = useCallback(async (dateParam: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/orders?limit=100&date=${dateParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setOrders(json.data);
      } else {
        throw new Error(json.message || "Failed to load orders");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders(effectiveDate);
  }, [effectiveDate, fetchOrders]);

  // Update order status with optimistic update
  const handleUpdateStatus = async (orderId: string, newStatus: "PREPARING" | "SERVED") => {
    if (!token) return;
    setUpdatingId(orderId);

    // Optimistically update local state immediately
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      // Revert if error
      fetchOrders(effectiveDate);
    } finally {
      setUpdatingId(null);
    }
  };

  // Counts for today's active orders
  const todayCounts = useMemo(() => {
    let preparing = 0;
    let served = 0;
    orders.forEach((o) => {
      if (o.status === "PREPARING") {
        preparing++;
      } else if (o.status !== "CANCELLED") {
        served++;
      }
    });
    return { all: orders.length, preparing, served };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders;

    // Apply status sub-filter in active tab
    if (activeTab === "active" && statusFilter !== "ALL") {
      if (statusFilter === "PREPARING") {
        list = list.filter((o) => o.status === "PREPARING");
      } else if (statusFilter === "SERVED") {
        list = list.filter((o) => o.status === "SERVED" || o.status === "COMPLETED");
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.items.some((i) => i.itemNameSnapshot.toLowerCase().includes(q))
      );
    }

    // In active tab when ALL is selected, prioritize PREPARING at the top
    if (activeTab === "active" && statusFilter === "ALL") {
      list = [...list].sort((a, b) => {
        if (a.status === "PREPARING" && b.status !== "PREPARING") return -1;
        if (a.status !== "PREPARING" && b.status === "PREPARING") return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return list;
  }, [orders, activeTab, statusFilter, searchQuery]);

  // Aggregate stats for current view
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + Number(o.total), 0);
  }, [filteredOrders]);

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-28 text-[#2D1C13]">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-[#2D1C13]">
          Orders
        </h2>
        <button
          onClick={() => fetchOrders(effectiveDate)}
          disabled={loading}
          className="p-2 rounded-full bg-white border border-[#EFE8DE] text-[#6F452A] hover:bg-[#F5EFEB] transition-colors shadow-cafe-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Pill Switcher: Active (Today) vs. History (Archive) */}
      <div className="grid grid-cols-2 p-1 rounded-full bg-[#F5EFEB] border border-[#EFE8DE]">
        <button
          onClick={() => setActiveTab("active")}
          className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-[#6F452A] text-white shadow-xs"
              : "text-[#8C7B70] hover:text-[#2D1C13]"
          }`}
        >
          Today&apos;s Active
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-[#6F452A] text-white shadow-xs"
              : "text-[#8C7B70] hover:text-[#2D1C13]"
          }`}
        >
          Past History
        </button>
      </div>

      {/* Status Sub-Filters (Only in Active Tab) */}
      {activeTab === "active" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-[#6F452A] text-white shadow-xs"
                : "bg-white text-[#8C7B70] border border-[#EFE8DE] hover:bg-[#F5EFEB]"
            }`}
          >
            All ({todayCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter("PREPARING")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "PREPARING"
                ? "bg-[#D25E1A] text-white shadow-xs"
                : "bg-white text-[#D25E1A] border border-[#FAD7C0] hover:bg-[#FFF1E5]"
            }`}
          >
            <Coffee className="w-3 h-3" />
            <span>Preparing ({todayCounts.preparing})</span>
          </button>
          <button
            onClick={() => setStatusFilter("SERVED")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "SERVED"
                ? "bg-[#256A38] text-white shadow-xs"
                : "bg-white text-[#256A38] border border-[#C6EBD0] hover:bg-[#EAF7ED]"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Served ({todayCounts.served})</span>
          </button>
        </div>
      )}

      {/* Date Navigator Header (Only in History Mode) */}
      {activeTab === "history" && (
        <div className="p-3 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe-sm flex items-center justify-between">
          <button
            onClick={() => handleStepDay(-1)}
            className="p-2 rounded-full hover:bg-[#F5EFEB] text-[#6F452A] transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="relative flex items-center gap-2 cursor-pointer group">
            <Calendar className="w-4 h-4 text-[#6F452A]" />
            <span className="font-serif text-sm font-bold text-[#2D1C13] group-hover:text-[#6F452A] transition-colors">
              {formatDisplayDate(historyDate)}
            </span>
            {/* Native Date Picker trigger overlay */}
            <input
              type="date"
              max={todayStr}
              value={historyDate}
              onChange={(e) => {
                if (e.target.value) setHistoryDate(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <button
            onClick={() => handleStepDay(1)}
            disabled={isHistoryAtToday}
            className="p-2 rounded-full hover:bg-[#F5EFEB] text-[#6F452A] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Daily Summary Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F5EFEB] text-xs font-semibold text-[#8C7B70]">
        <span>
          {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} {activeTab === "active" ? "today" : "on record"}
        </span>
        <span className="font-serif text-sm font-bold text-[#6F452A]">
          ₱{totalRevenue.toFixed(0)} Sales
        </span>
      </div>

      {/* Search Bar with Filter Icon */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B70]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order # or drink..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-[#EFE8DE] text-xs text-[#2D1C13] placeholder-[#8C7B70] focus:outline-none focus:border-[#6F452A] shadow-cafe-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B70] hover:text-[#2D1C13]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button className="p-2.5 rounded-2xl bg-white border border-[#EFE8DE] text-[#6F452A] shadow-cafe-sm cursor-pointer">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 text-center">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-[#EFE8DE] animate-pulse p-4 shadow-cafe-sm"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="p-10 text-center bg-white border border-[#EFE8DE] rounded-2xl shadow-cafe-sm space-y-3">
          {activeTab === "active" ? (
            <>
              <Coffee className="w-10 h-10 text-[#C69068] mx-auto stroke-[1.8]" />
              <p className="font-serif text-base font-bold text-[#2D1C13]">
                No orders placed today yet
              </p>
              <p className="text-xs text-[#8C7B70] max-w-xs mx-auto">
                Orders rung up today will appear here in real time. Switch to <strong>Past History</strong> to view previous days.
              </p>
            </>
          ) : (
            <>
              <Receipt className="w-10 h-10 text-[#8C7B70] mx-auto stroke-[1.8]" />
              <p className="font-serif text-base font-bold text-[#2D1C13]">
                No orders for {formatDisplayDate(historyDate)}
              </p>
              <p className="text-xs text-[#8C7B70]">
                Use the date stepper above to navigate to other days.
              </p>
            </>
          )}
        </div>
      ) : (
        /* Order Cards List */
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const dateObj = new Date(order.createdAt);
            const timeStr = dateObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            });
            const isCash = order.payment.method === "CASH";
            const isPreparing = order.status === "PREPARING";
            const isCancelled = order.status === "CANCELLED";
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-cafe-sm hover:shadow-cafe space-y-2.5 active:scale-[0.99] ${
                  isPreparing
                    ? "border-[#D25E1A]/50 bg-gradient-to-b from-[#FFFBF8] to-white ring-1 ring-[#D25E1A]/20"
                    : "border-[#EFE8DE] hover:border-[#6F452A]/40"
                }`}
              >
                {/* Header row: Order #, Time, Status Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-[#2D1C13]">
                      #{order.orderNumber.replace("ORD-", "")}
                    </span>
                    <span className="text-[11px] text-[#8C7B70]">{timeStr}</span>
                  </div>

                  {isPreparing ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF1E5] text-[#D25E1A] border border-[#FAD7C0]">
                      <Coffee className="w-3 h-3 animate-pulse" />
                      <span>PREPARING</span>
                    </span>
                  ) : isCancelled ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      CANCELLED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF7ED] text-[#256A38] border border-[#C6EBD0]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>SERVED</span>
                    </span>
                  )}
                </div>

                {/* Items bullet preview */}
                <div className="space-y-1 text-xs text-[#2D1C13] pl-1">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-[#8C5837]">▸</span>
                      <span>
                        {item.itemNameSnapshot} x{item.quantity}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-[10px] text-[#8C7B70] italic pl-3">
                      +{order.items.length - 3} more items...
                    </div>
                  )}
                </div>

                {/* Footer: Total & Payment Badge */}
                <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#6F452A]">
                    <span className="text-[#8C5837]">▸</span>
                    <span>Total: ₱{Number(order.total).toFixed(0)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#8C7B70]">
                    {isCash ? (
                      <span className="flex items-center gap-1 bg-[#F5EFEB] text-[#6F452A] px-2 py-0.5 rounded-full">
                        <Banknote className="w-3 h-3" />
                        <span>Cash</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-[#EBF3FF] text-[#007DFE] px-2 py-0.5 rounded-full font-semibold">
                        <QrCode className="w-3 h-3" />
                        <span>GCash</span>
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-[#8C7B70]" />
                  </div>
                </div>

                {/* 1-Tap Action Button for Barista */}
                {isPreparing && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(order.id, "SERVED");
                      }}
                      disabled={isUpdating}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#6F452A] hover:bg-[#5A361F] text-white text-xs font-bold transition-all shadow-cafe-sm flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Mark as Served ✓</span>
                    </button>
                  </div>
                )}

                {/* Subtle Revert Button for Active Served Orders */}
                {!isPreparing && !isCancelled && activeTab === "active" && (
                  <div className="flex items-center justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(order.id, "PREPARING");
                      }}
                      disabled={isUpdating}
                      className="text-[10px] text-[#8C7B70] hover:text-[#D25E1A] transition-colors cursor-pointer"
                    >
                      ↩ Revert to Preparing
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
