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
  CheckCircle2,
  Check
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import { CozyEmptyState } from "./CozyEmptyState";

interface OrderHistoryViewProps {
  onSelectOrder: (order: CompletedOrderData) => void;
  onOpenPos?: () => void;
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

export function OrderHistoryView({ onSelectOrder, onOpenPos }: OrderHistoryViewProps) {
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

  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  // Update order status with optimistic update
  const handleUpdateStatus = async (orderId: string, newStatus: "PREPARING" | "SERVED") => {
    if (!token) return;
    setUpdatingId(orderId);

    // Optimistically update local state immediately (including all line items)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              items: o.items.map((item) => ({
                ...item,
                isServed: newStatus === "SERVED"
              }))
            }
          : o
      )
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
      if (json.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? json.data : o))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      // Revert if error
      fetchOrders(effectiveDate);
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle individual item served state (e.g., Siomai served first, coffee later)
  const handleToggleItemServed = async (orderId: string, itemId: string) => {
    if (!token) return;
    setTogglingItemId(itemId);

    // Optimistically toggle item status locally
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.id === itemId ? { ...item, isServed: !item.isServed } : item
        );
        const allServed =
          updatedItems.length > 0 && updatedItems.every((item) => item.isServed);
        return {
          ...order,
          status: allServed ? "SERVED" : "PREPARING",
          items: updatedItems
        };
      })
    );

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/items/${itemId}/toggle-served`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to toggle item served state");
      }
      if (json.data) {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === orderId ? json.data : o))
        );
      }
    } catch (err) {
      console.error("Error toggling item served:", err);
      fetchOrders(effectiveDate);
    } finally {
      setTogglingItemId(null);
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
        /* Cozy Empty State */
        <div className="bg-white border border-[#EFE8DE] rounded-2xl shadow-cafe-sm overflow-hidden p-6">
          {activeTab === "active" ? (
            <CozyEmptyState
              type="steaming-cup"
              title="Ready for your first brew of the day!"
              description="No orders recorded yet today. Ring up a fresh brew in the POS to begin serving your customers."
              actionLabel="Start Brewing in POS"
              onAction={onOpenPos}
            />
          ) : (
            <CozyEmptyState
              type="calendar"
              title={`No orders for ${formatDisplayDate(historyDate)}`}
              description="No completed orders found on this date. Use the date stepper above to navigate to other days."
              actionLabel="Return to Today's Queue"
              onAction={() => setActiveTab("active")}
            />
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
            const servedItemsCount = order.items.filter((i) => i.isServed).length;
            const totalItemsCount = order.items.length;

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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(order.id, "SERVED");
                      }}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF1E5] text-[#D25E1A] border border-[#FAD7C0] hover:bg-[#FFE8D6] active:scale-95 transition-all cursor-pointer shadow-2xs"
                      title="Tap to mark all items as served"
                    >
                      <Coffee className="w-3 h-3 animate-pulse" />
                      <span>
                        PREPARING {totalItemsCount > 1 ? `(${servedItemsCount}/${totalItemsCount})` : ""}
                      </span>
                      <span className="opacity-40">•</span>
                      <span className="underline decoration-[#D25E1A]/40 font-semibold">Mark All ✓</span>
                    </button>
                  ) : isCancelled ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      CANCELLED
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeTab === "active") {
                          handleUpdateStatus(order.id, "PREPARING");
                        }
                      }}
                      disabled={isUpdating}
                      className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF7ED] text-[#256A38] border border-[#C6EBD0] transition-all shadow-2xs ${
                        activeTab === "active" ? "hover:bg-[#DCF3E1] active:scale-95 cursor-pointer" : ""
                      }`}
                      title={activeTab === "active" ? "Tap to revert to preparing" : undefined}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>SERVED</span>
                      {activeTab === "active" && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="font-normal opacity-90 text-[9px]">↺ Revert</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Items Fulfillment Area */}
                {activeTab === "active" ? (
                  /* Interactive Line-Item Checklist (Today's Active) */
                  <div className="space-y-1.5 pt-0.5">
                    {order.items.map((item) => {
                      const isItemServed = !!item.isServed;
                      const isThisToggling = togglingItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleItemServed(order.id, item.id);
                          }}
                          className={`group flex items-center justify-between p-2 min-h-[38px] rounded-xl transition-all duration-300 cursor-pointer active:scale-[0.97] select-none ${
                            isItemServed
                              ? "bg-[#F0FAF2] text-[#256A38] border border-[#C6EBD0] shadow-2xs"
                              : "bg-[#FBF8F2] text-[#2D1C13] border border-[#EFE8DE] hover:border-[#C69068]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {/* Emerald Checkmark Circle */}
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                                isItemServed
                                  ? "bg-[#256A38] text-white shadow-xs ring-2 ring-[#256A38]/20 animate-pop-bounce"
                                  : "border-2 border-[#C69068]/60 bg-white group-hover:border-[#256A38]"
                              }`}
                            >
                              {isItemServed ? (
                                <Check className="w-3 h-3 stroke-[3]" />
                              ) : isThisToggling ? (
                                <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#C69068]" />
                              ) : null}
                            </div>

                            {/* Line-item text with smooth animated strikethrough */}
                            <div className="relative inline-flex items-center truncate">
                              <span
                                className={`text-xs transition-colors duration-300 truncate ${
                                  isItemServed
                                    ? "text-[#8C7B70]/80 font-normal"
                                    : "font-semibold text-[#2D1C13]"
                                }`}
                              >
                                {item.quantity}x {item.itemNameSnapshot}
                              </span>

                              {/* Animated Strikethrough Line */}
                              <span
                                className={`absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#256A38] rounded-full transition-all duration-300 ease-out origin-left pointer-events-none ${
                                  isItemServed
                                    ? "w-full scale-x-100 opacity-80"
                                    : "w-full scale-x-0 opacity-0"
                                }`}
                              />
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isItemServed ? (
                              <span className="text-[10px] font-bold text-[#256A38] bg-[#EAF7ED] border border-[#C6EBD0] px-2.5 py-0.5 rounded-full transition-all duration-300 flex items-center gap-1 shadow-2xs">
                                <span>Served</span>
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-[#D25E1A] bg-[#FFF1E5] border border-[#FAD7C0] px-2.5 py-0.5 rounded-full group-hover:bg-[#FFE8D6] transition-colors">
                                Tap when served
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Static Items View (Past History Archive) */
                  <div className="space-y-1 text-xs text-[#2D1C13] pl-1">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-[#256A38]">✓</span>
                        <span>
                          {item.quantity}x {item.itemNameSnapshot}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-[10px] text-[#8C7B70] italic pl-3">
                        +{order.items.length - 3} more items...
                      </div>
                    )}
                  </div>
                )}

                {/* Footer: Total & Payment Badge */}
                <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#6F452A]">
                    <span className="text-[#8C7B70]">▸</span>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
