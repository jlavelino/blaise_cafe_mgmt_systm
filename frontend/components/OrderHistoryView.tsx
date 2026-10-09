"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CompletedOrderData } from "./ReceiptModal";
import { Receipt, Search, X, ChevronRight, RefreshCw, Banknote, QrCode } from "lucide-react";

interface OrderHistoryViewProps {
  onSelectOrder: (order: CompletedOrderData) => void;
}

export function OrderHistoryView({ onSelectOrder }: OrderHistoryViewProps) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<CompletedOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const res = await fetch(`${apiUrl}/orders?limit=50`, {
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
    <div className="p-4 space-y-4 max-w-md mx-auto pb-24 text-[#F3F4F6]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A882]">
            Sales Ledger
          </span>
          <h2 className="text-base font-extrabold text-white">Order History</h2>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 rounded-xl bg-[#1F2328] border border-[#2F353E] text-stone-300 hover:text-white transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order # or item name..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#191C20] border border-[#2C3138] text-white text-xs placeholder-stone-500 focus:outline-none focus:border-[#C8A882]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-2.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#1B1E22] animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Receipt className="w-8 h-8 text-stone-600 mx-auto" />
          <p className="text-xs font-bold text-stone-400">No orders found</p>
          <p className="text-[11px] text-stone-500">
            {searchQuery ? "Try a different search query." : "Complete a sale at the register to see it here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order) => {
            const isCash = order.payment?.method === "CASH";
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="p-3.5 rounded-2xl bg-[#1A1D21] border border-[#2C3139] hover:border-[#C8A882]/70 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                        isCash
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                          : "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                      }`}
                    >
                      {order.payment?.method}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-400 mt-1 truncate">
                    {order.items.map((i) => i.itemNameSnapshot).join(", ")}
                  </div>

                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })} • {itemCount} items
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#C8A882] font-mono">
                      ₱{Number(order.total).toFixed(0)}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
