import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * GET /api/dashboard/today
 * Aggregates today's sales, payment splits, top items, and hourly trends
 */
export async function getTodayDashboard(_req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch all completed orders today with items and payment
    const todayOrders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
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

    // Prepare 24-hour slots or business hours
    const hourlyMap = new Map<number, { hourLabel: string; sales: number; orders: number }>();
    for (let h = 8; h <= 21; h++) {
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

      // Hourly Trend
      const orderHour = new Date(order.createdAt).getHours();
      if (hourlyMap.has(orderHour)) {
        const slot = hourlyMap.get(orderHour)!;
        slot.sales += orderTotal;
        slot.orders += 1;
      }

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

    const orderCount = todayOrders.length;
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    // Sort and extract Top 5 Products
    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5);

    // Convert hourly map to array
    const hourlyTrends = Array.from(hourlyMap.values());

    res.status(200).json({
      success: true,
      data: {
        date: now.toISOString().split("T")[0],
        metrics: {
          totalSales: totalSales.toFixed(2),
          orderCount,
          averageOrderValue: averageOrderValue.toFixed(2),
          cashSales: cashSales.toFixed(2),
          gcashGross: gcashGross.toFixed(2),
          gcashFees: gcashFees.toFixed(2),
          gcashNet: gcashNet.toFixed(2)
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
