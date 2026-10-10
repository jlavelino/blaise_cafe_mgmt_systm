"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompletedOrderData } from "./ReceiptModal";
import { Receipt, Search, X, ChevronRight, RefreshCw, Banknote, QrCode, SlidersHorizontal } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface OrderHistoryViewProps {
  onSelectOrder: (order: CompletedOrderData) => void;
}

export function OrderHistoryView({ onSelectOrder }: OrderHistoryViewProps) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<CompletedOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/orders?limit=50`, {
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
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.items.some((i) => i.itemNameSnapshot.toLowerCase().includes(q))
      );
    });
  }, [orders, searchQuery]);

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto pb-28 text-[#2D1C13]">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-[#2D1C13]">
          Orders
        </h2>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="p-2 rounded-full bg-white border border-[#EFE8DE] text-[#6F452A] hover:bg-[#F5EFEB] transition-colors shadow-cafe-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Pill Switcher: Active vs. History (Matching 3.jpg Screen 3) */}
      <div className="grid grid-cols-2 p-1 rounded-full bg-[#F5EFEB] border border-[#EFE8DE]">
        <button
          onClick={() => setActiveTab("active")}
          className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-[#6F452A] text-white shadow-xs"
              : "text-[#8C7B70] hover:text-[#2D1C13]"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-[#6F452A] text-white shadow-xs"
              : "text-[#8C7B70] hover:text-[#2D1C13]"
          }`}
        >
          History
        </button>
      </div>

      {/* Search Input with Filter Icon (Matching 3.jpg Screen 3) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B70]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order # or item..."
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
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white border border-[#EFE8DE] animate-pulse p-4 shadow-cafe-sm"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-10 text-center bg-white border border-[#EFE8DE] rounded-2xl shadow-cafe-sm space-y-2">
          <Receipt className="w-8 h-8 text-[#8C7B70] mx-auto" />
          <p className="font-serif text-sm font-bold text-[#2D1C13]">No orders recorded</p>
          <p className="text-xs text-[#8C7B70]">
            Orders will show up here as they are entered into the POS.
          </p>
        </div>
      ) : (
        /* Order Cards List matching 3.jpg Screen 3 */
        <div className="space-y-3">
          {filteredOrders.map((order, idx) => {
            const dateObj = new Date(order.createdAt);
            const timeStr = dateObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            });
            const isCash = order.payment.method === "CASH";

            // Demo status cycling for visual realism: most recent is PREPARING, others READY/SERVED
            const statusLabel = idx === 0 ? "PREPARING" : idx === 1 ? "READY" : "SERVED";
            const statusBg =
              statusLabel === "PREPARING"
                ? "bg-[#FFF1E5] text-[#D25E1A]"
                : "bg-[#EAF7ED] text-[#256A38]";

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="p-4 rounded-2xl bg-white border border-[#EFE8DE] hover:border-[#6F452A]/40 transition-all cursor-pointer shadow-cafe-sm hover:shadow-cafe space-y-2.5 active:scale-[0.99]"
              >
                {/* Header row: Order #, Time, Status Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-[#2D1C13]">
                      #{order.orderNumber.replace("ORD-", "")}
                    </span>
                    <span className="text-[11px] text-[#8C7B70]">{timeStr}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusBg}`}>
                    {statusLabel}
                  </span>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
