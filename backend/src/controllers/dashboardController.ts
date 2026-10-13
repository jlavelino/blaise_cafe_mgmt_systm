import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getManilaDayBounds, getManilaHour } from "../lib/dateUtils";

/**
 * GET /api/dashboard/today
 * Aggregates today's sales, payment splits, top items, and hourly trends
 */
export async function getTodayDashboard(_req: Request, res: Response): Promise<void> {
  try {
    const { startOfDay, endOfDay, dateStr } = getManilaDayBounds();

    // Fetch all active/completed orders today with items and payment
    const todayOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PREPARING", "SERVED", "COMPLETED"] as any },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        items: true,
        payment: true
      },
      orderBy: { createdAt: "desc" }
    });

    // 1. Calculate Core Financial Metrics
    let totalSales = 0;
    let cashSales = 0;
    let gcashGross = 0;
    let gcashFees = 0;
    let gcashNet = 0;

    const productSalesMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    // Prepare business hour slots (7 AM to 10 PM) in Manila time
    const hourlyMap = new Map<number, { hourLabel: string; sales: number; orders: number }>();
    for (let h = 7; h <= 22; h++) {
      const label = h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`;
      hourlyMap.set(h, { hourLabel: label, sales: 0, orders: 0 });
    }

    for (const order of todayOrders) {
      const orderTotal = Number(order.total);
      totalSales += orderTotal;

      // Payment Breakdown
      if (order.payment) {
        if (order.payment.method === "CASH") {
          // For cash, sale amount is the order total
          cashSales += orderTotal;
        } else if (order.payment.method === "GCASH") {
          gcashGross += Number(order.payment.amountTendered);
          gcashFees += Number(order.payment.fee);
          gcashNet += Number(order.payment.netAmount);
        }
      }

      // Hourly Trend in Manila Time (UTC+8)
      const orderHour = getManilaHour(new Date(order.createdAt));
      if (!hourlyMap.has(orderHour)) {
        const label = orderHour === 0 ? "12 AM" : orderHour === 12 ? "12 PM" : orderHour > 12 ? `${orderHour - 12} PM` : `${orderHour} AM`;
        hourlyMap.set(orderHour, { hourLabel: label, sales: 0, orders: 0 });
      }
      const slot = hourlyMap.get(orderHour)!;
      slot.sales += orderTotal;
      slot.orders += 1;

      // Product Performance
      for (const item of order.items) {
        const key = item.itemNameSnapshot;
        const existing = productSalesMap.get(key) || {
          name: key,
          quantity: 0,
          revenue: 0
        };
        existing.quantity += item.quantity;
        existing.revenue += Number(item.subtotal);
        productSalesMap.set(key, existing);
      }
    }

    let preparingCount = 0;
    let servedCount = 0;

    for (const order of todayOrders) {
      if (order.status === "PREPARING") {
        preparingCount++;
      } else {
        servedCount++;
      }
    }

    const cancelledCount = await prisma.order.count({
      where: {
        status: "CANCELLED",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const orderCount = todayOrders.length;
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    // Sort and extract Top 5 Products
    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5);

    // Convert hourly map to sorted array by hour
    const hourlyTrends = Array.from(hourlyMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, val]) => val);

    res.status(200).json({
      success: true,
      data: {
        date: dateStr,
        metrics: {
          totalSales: totalSales.toFixed(2),
          orderCount,
          averageOrderValue: averageOrderValue.toFixed(2),
          cashSales: cashSales.toFixed(2),
          gcashGross: gcashGross.toFixed(2),
          gcashFees: gcashFees.toFixed(2),
          gcashNet: gcashNet.toFixed(2),
          preparingCount,
          servedCount,
          cancelledCount
        },
        topProducts,
        hourlyTrends,
        recentOrders: todayOrders.slice(0, 10).map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          total: Number(o.total).toFixed(2),
          paymentMethod: o.payment?.method || "CASH",
          itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
          createdAt: o.createdAt
        }))
      }
    });
  } catch (err) {
    console.error("Dashboard calculation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard metrics"
    });
  }
}
