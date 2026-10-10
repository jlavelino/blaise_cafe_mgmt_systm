"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  Banknote,
  QrCode,
  ShoppingBag,
  Award,
  RefreshCw,
  Clock,
  ChevronRight,
  Moon,
  Wallet,
  Receipt,
  ArrowUpRight,
  PlusCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { API_BASE } from "@/lib/api";

interface DashboardMetrics {
  totalSales: string;
  orderCount: number;
  averageOrderValue: string;
  cashSales: string;
  gcashGross: string;
  gcashFees: string;
  gcashNet: string;
  preparingCount?: number;
  servedCount?: number;
  cancelledCount?: number;
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
  onOpenClosing?: () => void;
  onNavigateToPOS?: () => void;
}

export function DashboardView({
  onSelectOrder,
  onOpenClosing,
  onNavigateToPOS
}: DashboardViewProps) {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/dashboard/today`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to load dashboard metrics");
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.message || "Invalid response format");
      }
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      weekday: "short"
    }).format(new Date());
  }, []);

  if (loading && !data) {
    return (
      <div className="max-w-md w-full mx-auto px-4 py-8 space-y-4">
        <div className="h-28 rounded-2xl bg-white border border-[#EFE8DE] animate-pulse shadow-cafe-sm" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-2xl bg-white border border-[#EFE8DE] animate-pulse shadow-cafe-sm" />
          <div className="h-24 rounded-2xl bg-white border border-[#EFE8DE] animate-pulse shadow-cafe-sm" />
          <div className="h-24 rounded-2xl bg-white border border-[#EFE8DE] animate-pulse shadow-cafe-sm" />
          <div className="h-24 rounded-2xl bg-white border border-[#EFE8DE] animate-pulse shadow-cafe-sm" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-md w-full mx-auto px-4 py-12 text-center">
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-3">
          <p className="text-xs font-bold">Failed to load sales data</p>
          <p className="text-[11px] text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 text-xs font-bold bg-[#6F452A] text-white rounded-full hover:bg-[#5A361F] cursor-pointer shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalSales: "0.00",
    orderCount: 0,
    averageOrderValue: "0.00",
    cashSales: "0.00",
    gcashGross: "0.00",
    gcashFees: "0.00",
    gcashNet: "0.00"
  };

  const topProducts = data?.topProducts || [];
  const hourlyTrends = data?.hourlyTrends || [];
  const recentOrders = data?.recentOrders || [];

  const preparingCount = metrics.preparingCount ?? 0;
  const servedCount = metrics.servedCount ?? (metrics.orderCount - preparingCount);
  const cancelledCount = metrics.cancelledCount ?? 0;

  // Order status distribution data for donut
  const statusData = [
    { name: "Served", value: servedCount > 0 ? servedCount : (metrics.orderCount === 0 ? 1 : 0), color: "#6F452A" },
    { name: "Preparing", value: preparingCount, color: "#D25E1A" }
  ];

  const totalSalesNum = parseFloat(metrics.totalSales) || 0;
  const cashSalesNum = parseFloat(metrics.cashSales) || 0;
  const gcashNetNum = parseFloat(metrics.gcashNet) || 0;
  const gcashFeesNum = parseFloat(metrics.gcashFees) || 0;

  return (
    <div className="max-w-md w-full mx-auto px-4 pt-3 pb-28 space-y-4">
      {/* Top Greeting & Date Header (Matching 3.jpg Screen 2) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2D1C13]">
            {greeting}, Admin!
          </h2>
          <p className="text-xs text-[#8C7B70] mt-0.5">
            {formattedDate}
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="p-2 rounded-full bg-white border border-[#EFE8DE] text-[#6F452A] hover:bg-[#F5EFEB] transition-colors shadow-cafe-sm cursor-pointer"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Hero Card: Today's Sales (Matching 3.jpg Screen 2) */}
      <div className="p-5 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe space-y-2">
        <div className="flex items-center justify-between text-xs text-[#8C7B70] font-medium">
          <span>Today&apos;s Sales</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#256A38] bg-[#EAF7ED] px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            <span>Active Today</span>
          </span>
        </div>

        <div className="font-serif text-3xl sm:text-4xl font-bold text-[#2D1C13] tracking-tight">
          ₱ {totalSalesNum.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F5EFEB] text-xs text-[#8C7B70]">
          <span>{metrics.orderCount} total orders completed</span>
          <span>Avg. ₱{metrics.averageOrderValue}/cup</span>
        </div>
      </div>

      {/* 2x2 Financial Quick Grid (Matching 3.jpg Screen 2) */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Cash */}
        <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#F5EFEB] text-[#6F452A] flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-[#8C7B70]">
              Cash
            </span>
          </div>
          <div className="font-serif text-lg font-bold text-[#2D1C13]">
            ₱ {cashSalesNum.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#8C7B70] mt-0.5">Physical drawer</span>
        </div>

        {/* 2. GCash */}
        <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#EBF3FF] text-[#007DFE] flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-[#8C7B70]">
              GCash
            </span>
          </div>
          <div className="font-serif text-lg font-bold text-[#007DFE]">
            ₱ {gcashNetNum.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#8C7B70] mt-0.5">Net received</span>
        </div>

        {/* 3. GCash Fees */}
        <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#FFF1E5] text-[#D25E1A] flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-[#8C7B70]">
              GCash Fees
            </span>
          </div>
          <div className="font-serif text-lg font-bold text-[#D25E1A]">
            ₱ {gcashFeesNum.toFixed(2)}
          </div>
          <span className="text-[10px] text-[#8C7B70] mt-0.5">Deducted fee</span>
        </div>

        {/* 4. Net Sales */}
        <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#EAF7ED] text-[#256A38] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-[#8C7B70]">
              Net Sales
            </span>
          </div>
          <div className="font-serif text-lg font-bold text-[#256A38]">
            ₱ {(cashSalesNum + gcashNetNum).toLocaleString()}
          </div>
          <span className="text-[10px] text-[#8C7B70] mt-0.5">Realized income</span>
        </div>
      </div>

      {/* Daily Cash Balancing Shift Close Action Card */}
      <button
        onClick={onOpenClosing}
        className="w-full p-4 rounded-2xl bg-[#6F452A] text-white shadow-cafe flex items-center justify-between hover:bg-[#5A361F] transition-all cursor-pointer group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
            <Moon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-serif text-sm font-bold text-white">
              Daily Cash Balancing (Shift Close)
            </h3>
            <p className="text-[11px] text-[#E5DCD0]">
              Count cash drawer &amp; audit shift variance
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Order Status Section (Matching 3.jpg Screen 2 Donut Card) */}
      <div className="p-5 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe space-y-4">
        <h3 className="font-serif text-sm font-bold text-[#2D1C13]">
          Order Status
        </h3>

        <div className="flex items-center justify-between gap-4">
          {/* Donut Chart with center count */}
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={36}
                  outerRadius={52}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="font-serif text-xl font-bold text-[#2D1C13] leading-none">
                {metrics.orderCount}
              </span>
              <span className="text-[9px] text-[#8C7B70] mt-0.5 font-medium">
                Orders
              </span>
            </div>
          </div>

          {/* Status Breakdown Legend */}
          <div className="flex-1 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D25E1A]" />
                <span className="text-[#8C7B70]">Preparing</span>
              </div>
              <span className={`font-bold ${preparingCount > 0 ? "text-[#D25E1A]" : "text-[#2D1C13]"}`}>
                {preparingCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#6F452A]" />
                <span className="text-[#8C7B70]">Served</span>
              </div>
              <span className="font-bold text-[#2D1C13]">{servedCount}</span>
            </div>

            {cancelledCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-[#8C7B70]">Cancelled</span>
                </div>
                <span className="font-bold text-red-600">{cancelledCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rush Hour Sales Bar Chart */}
      <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6F452A]" />
          <h3 className="font-serif text-xs font-bold text-[#2D1C13] uppercase tracking-wider">
            Today&apos;s Rush Hours
          </h3>
        </div>

        <div className="h-36 w-full pt-2">
          {hourlyTrends.some((h) => h.sales > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTrends}>
                <XAxis
                  dataKey="hourLabel"
                  stroke="#8C7B70"
                  fontSize={9}
                  tickLine={false}
                  interval={2}
                />
                <Tooltip
                  cursor={{ fill: "rgba(111, 69, 42, 0.06)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2 rounded-xl bg-white border border-[#EFE8DE] text-[11px] shadow-cafe">
                          <p className="font-bold text-[#2D1C13]">{item.hourLabel}</p>
                          <p className="text-[#6F452A] font-semibold">₱{item.sales} ({item.orders} orders)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#6F452A"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#8C7B70]">
              Rush hour chart plots automatically as drinks are ordered
            </div>
          )}
        </div>
      </div>

      {/* Top Sellers Today Leaderboard */}
      <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#6F452A]" />
            <h3 className="font-serif text-xs font-bold text-[#2D1C13] uppercase tracking-wider">
              Top Sellers Today
            </h3>
          </div>
          <span className="text-[10px] text-[#8C7B70]">By Volume</span>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-xs text-[#8C7B70] py-3 text-center">
            No drinks sold yet today. Ring up your first order!
          </p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF8F2] border border-[#EFE8DE] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      idx === 0
                        ? "bg-[#6F452A] text-white"
                        : "bg-[#EFE8DE] text-[#6F452A]"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-[#2D1C13] truncate max-w-[170px]">
                    {p.name}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#6F452A]">
                    {p.quantity} sold
                  </div>
                  <div className="text-[10px] text-[#8C7B70]">
                    ₱{p.revenue.toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Snippet */}
      <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] shadow-cafe space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xs font-bold text-[#2D1C13] uppercase tracking-wider">
            Latest Transactions
          </h3>
          <span className="text-[10px] text-[#8C7B70]">Today</span>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-[#8C7B70] py-3 text-center">
            No completed sales recorded today yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((ord) => (
              <div
                key={ord.id}
                onClick={() => onSelectOrder && onSelectOrder(ord.id)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF8F2] border border-[#EFE8DE] hover:border-[#6F452A]/50 transition-colors cursor-pointer text-xs"
              >
                <div>
                  <div className="font-bold text-[#2D1C13]">{ord.orderNumber}</div>
                  <div className="text-[10px] text-[#8C7B70]">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {ord.itemCount} items
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#6F452A]">
                    ₱{ord.total}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C7B70]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
