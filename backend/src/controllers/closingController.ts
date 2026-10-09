import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { SubmitDailyClosingSchema } from "../schemas/closingSchema";
import { Prisma } from "@prisma/client";

// Daily closing controller for shift reconciliation

/**
 * Helper to get clean UTC/local start and end of day
 */
function getDayBounds(dateObj: Date = new Date()) {
  const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999);
  return { startOfDay, endOfDay };
}

/**
 * GET /api/closing/preview
 * Calculates today's uncommitted/committed numbers and checks if today was already closed
 */
export async function getClosingPreview(_req: Request, res: Response): Promise<void> {
  try {
    const { startOfDay, endOfDay } = getDayBounds();

    // Check if an official closing record already exists for today
    const existingClosing = await prisma.dailyClosing.findFirst({
      where: {
        date: startOfDay
      }
    });

    // Fetch all completed orders today
    const orders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: { payment: true }
    });

    let totalSales = 0;
    let cashSales = 0;
    let gcashGross = 0;
    let gcashFees = 0;
    let gcashNet = 0;

    for (const order of orders) {
      const orderTotal = Number(order.total);
      totalSales += orderTotal;

      if (order.payment) {
        if (order.payment.method === "CASH") {
          cashSales += orderTotal;
        } else if (order.payment.method === "GCASH") {
          gcashGross += Number(order.payment.amountTendered);
          gcashFees += Number(order.payment.fee);
          gcashNet += Number(order.payment.netAmount);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        date: startOfDay.toISOString().split("T")[0],
        isClosed: !!existingClosing,
        closingRecord: existingClosing,
        preview: {
          totalSales: totalSales.toFixed(2),
          orderCount: orders.length,
          cashSales: cashSales.toFixed(2), // Expected Cash
          gcashGross: gcashGross.toFixed(2),
          gcashFees: gcashFees.toFixed(2),
          gcashNet: gcashNet.toFixed(2)
        }
      }
    });
  } catch (err) {
    console.error("Error generating closing preview:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate closing preview"
    });
  }
}

/**
 * POST /api/closing/submit
 * Submits the counted cash, calculates variance, and permanently saves the DailyClosing record
 */
export async function submitDailyClosing(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = SubmitDailyClosingSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid closing submission",
        errors: validationResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }))
      });
      return;
    }

    const { actualCash, notes } = validationResult.data;
    const { startOfDay, endOfDay } = getDayBounds();

    // Re-verify official sales from database
    const orders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: { payment: true }
    });

    let totalSales = 0;
    let cashSales = 0;
    let gcashGross = 0;
    let gcashFees = 0;
    let gcashNet = 0;

    for (const order of orders) {
      const orderTotal = Number(order.total);
      totalSales += orderTotal;

      if (order.payment) {
        if (order.payment.method === "CASH") {
          cashSales += orderTotal;
        } else if (order.payment.method === "GCASH") {
          gcashGross += Number(order.payment.amountTendered);
          gcashFees += Number(order.payment.fee);
          gcashNet += Number(order.payment.netAmount);
        }
      }
    }

    // Formula: Actual Cash Counted - Expected Cash Sales
    const cashDifference = actualCash - cashSales;

    // Upsert into DailyClosing
    const closing = await prisma.dailyClosing.upsert({
      where: {
        date: startOfDay
      },
      create: {
        date: startOfDay,
        totalSales: new Prisma.Decimal(totalSales.toFixed(2)),
        orderCount: orders.length,
        cashSales: new Prisma.Decimal(cashSales.toFixed(2)),
        actualCash: new Prisma.Decimal(actualCash.toFixed(2)),
        cashDifference: new Prisma.Decimal(cashDifference.toFixed(2)),
        gcashGross: new Prisma.Decimal(gcashGross.toFixed(2)),
        gcashFees: new Prisma.Decimal(gcashFees.toFixed(2)),
        gcashNet: new Prisma.Decimal(gcashNet.toFixed(2)),
        notes: notes || null
      },
      update: {
        totalSales: new Prisma.Decimal(totalSales.toFixed(2)),
        orderCount: orders.length,
        cashSales: new Prisma.Decimal(cashSales.toFixed(2)),
        actualCash: new Prisma.Decimal(actualCash.toFixed(2)),
        cashDifference: new Prisma.Decimal(cashDifference.toFixed(2)),
        gcashGross: new Prisma.Decimal(gcashGross.toFixed(2)),
        gcashFees: new Prisma.Decimal(gcashFees.toFixed(2)),
        gcashNet: new Prisma.Decimal(gcashNet.toFixed(2)),
        notes: notes || null,
        closedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: "Daily closing recorded successfully",
      data: closing
    });
  } catch (err) {
    console.error("Error recording daily closing:", err);
    res.status(500).json({
      success: false,
      message: "Failed to record daily closing"
    });
  }
}

/**
 * GET /api/closing/history
 * Returns the archive of past daily closings
 */
export async function getClosingHistory(_req: Request, res: Response): Promise<void> {
  try {
    const history = await prisma.dailyClosing.findMany({
      orderBy: { date: "desc" },
      take: 30
    });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    console.error("Error fetching closing history:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve closing history"
    });
  }
}
