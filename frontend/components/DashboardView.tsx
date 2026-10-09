"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  Banknote,
  QrCode,
  ShoppingBag,
  Award,
  RefreshCw,
  Clock,
  ChevronRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { CompletedOrderData } from "./ReceiptModal";

interface DashboardMetrics {
  totalSales: string;
  orderCount: number;
  averageOrderValue: string;
  cashSales: string;
  gcashGross: string;
  gcashFees: string;
  gcashNet: string;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface HourlyTrend {
  hourLabel: string;
  sales: number;
  orders: number;
}

interface DashboardData {
  date: string;
  metrics: DashboardMetrics;
  topProducts: TopProduct[];
  hourlyTrends: HourlyTrend[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: string;
    paymentMethod: "CASH" | "GCASH";
    itemCount: number;
    createdAt: string;
  }>;
}

interface DashboardViewProps {
  onSelectOrder?: (orderId: string) => void;
}

export function DashboardView({ onSelectOrder }: DashboardViewProps) {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const res = await fetch(`${apiUrl}/dashboard/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setData(json.data);
      } else {
        throw new Error(json.message || "Failed to load dashboard data");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  if (loading && !data) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto animate-pulse">
        <div className="h-28 rounded-2xl bg-[#1C2024]" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-2xl bg-[#1C2024]" />
          <div className="h-24 rounded-2xl bg-[#1C2024]" />
        </div>
        <div className="h-44 rounded-2xl bg-[#1C2024]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center max-w-md mx-auto space-y-3">
        <div className="p-3 rounded-full bg-red-950/40 text-red-400 w-12 h-12 flex items-center justify-center mx-auto">
          ⚠️
        </div>
        <h3 className="text-sm font-bold text-white">Dashboard Offline</h3>
        <p className="text-xs text-stone-400">{error || "Could not fetch data"}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 rounded-xl bg-[#C8A882] text-black font-bold text-xs"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { metrics, topProducts, hourlyTrends, recentOrders } = data;
  const chartData = hourlyTrends.filter((h) => h.sales > 0 || parseInt(h.hourLabel) >= 9);

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto pb-24 text-[#F3F4F6]">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A882]">
            Live Performance
          </span>
          <h2 className="text-base font-extrabold text-white">Today's Sales</h2>
        </div>

        <button
          onClick={fetchDashboard}
          className="p-2 rounded-xl bg-[#1F2328] border border-[#2F353E] text-stone-300 hover:text-white transition-colors"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Primary Revenue Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#242930] to-[#1A1D21] border border-[#343B45] shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-300">
            Total Revenue
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{metrics.orderCount} Orders</span>
          </div>
        </div>

        <div className="text-3xl font-black text-[#C8A882] tracking-tight">
          ₱{parseFloat(metrics.totalSales).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>

        <div className="mt-3 pt-3 border-t border-[#343B45]/70 flex items-center justify-between text-xs text-stone-400">
          <span>Avg. Ticket Size</span>
          <span className="font-bold text-white font-mono">
            ₱{parseFloat(metrics.averageOrderValue).toFixed(0)} / order
          </span>
        </div>
      </div>

      {/* Payment Split Cards (Cash vs GCash) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cash Card */}
        <div className="p-4 rounded-2xl bg-[#1C2025] border border-[#2B313A] shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/50 text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
              Cash Sales
            </span>
          </div>

          <div className="text-xl font-black text-white font-mono mt-1">
            ₱{parseFloat(metrics.cashSales).toFixed(0)}
          </div>
          <span className="text-[10px] text-stone-400 mt-1">In register</span>
        </div>

        {/* GCash Card */}
        <div className="p-4 rounded-2xl bg-[#1C2025] border border-[#2B313A] shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#007DFE]/15 text-[#007DFE] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300">
              GCash Sales
            </span>
          </div>

          <div className="text-xl font-black text-white font-mono mt-1">
            ₱{parseFloat(metrics.gcashNet).toFixed(0)}
          </div>
          <span className="text-[10px] text-stone-400 mt-1">
            Gross ₱{parseFloat(metrics.gcashGross).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Rush Hour Sales Bar Chart */}
      <div className="p-4 rounded-2xl bg-[#191D21] border border-[#2A3038] space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#C8A882]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Today's Rush Hours
          </h3>
        </div>

        <div className="h-36 w-full pt-2">
          {hourlyTrends.some((h) => h.sales > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTrends}>
                <XAxis
                  dataKey="hourLabel"
                  stroke="#6B7280"
                  fontSize={9}
                  tickLine={false}
                  interval={2}
                />
                <Tooltip
                  cursor={{ fill: "rgba(200, 168, 130, 0.1)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2 rounded-lg bg-stone-900 border border-stone-700 text-[11px] shadow-lg">
                          <p className="font-bold text-white">{item.hourLabel}</p>
                          <p className="text-[#C8A882]">₱{item.sales} ({item.orders} orders)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#C8A882"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-stone-500">
              Rush hour chart will plot as sales occur today
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Bestsellers Today */}
      <div className="p-4 rounded-2xl bg-[#191D21] border border-[#2A3038] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C8A882]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Top Sellers Today
            </h3>
          </div>
          <span className="text-[10px] text-stone-400">By Cups Sold</span>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-xs text-stone-500 py-3 text-center">
            No drinks sold yet today. Ring up your first order!
          </p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#20252B] border border-[#2D333C] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      idx === 0
                        ? "bg-[#C8A882] text-black"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-white truncate max-w-[170px]">
                    {p.name}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-[#C8A882] font-mono">
                    {p.quantity} sold
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    ₱{p.revenue.toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Snippet */}
      <div className="p-4 rounded-2xl bg-[#191D21] border border-[#2A3038] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Latest Transactions
          </h3>
          <span className="text-[10px] text-stone-400">Today</span>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-stone-500 py-3 text-center">
            No completed sales recorded today yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((ord) => (
              <div
                key={ord.id}
                onClick={() => onSelectOrder && onSelectOrder(ord.id)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#20252B] border border-[#2E343D] hover:border-[#C8A882]/60 transition-colors cursor-pointer text-xs"
              >
                <div>
                  <div className="font-bold text-white">{ord.orderNumber}</div>
                  <div className="text-[10px] text-stone-400">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {ord.itemCount} items
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#C8A882] font-mono">
                    ₱{ord.total}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
