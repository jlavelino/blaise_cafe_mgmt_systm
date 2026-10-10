import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { CreateOrderSchema } from "../schemas/orderSchema";
import { Prisma } from "@prisma/client";

/**
 * Generate human-friendly order number: ORD-YYYYMMDD-XXXX
 */
async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const countToday = await tx.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  const sequence = String(countToday + 1).padStart(4, "0");
  return `ORD-${dateStr}-${sequence}`;
}

/**
 * POST /api/orders
 * Creates an order, order items, and payment within an atomic database transaction
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    // 1. Validate request body with Zod
    const validationResult = CreateOrderSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid order data",
        errors: validationResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }))
      });
      return;
    }

    const { items: inputItems, payment: inputPayment, notes } = validationResult.data;

    // 2. Fetch all requested variants from DB to verify official prices
    const variantIds = inputItems.map((item) => item.variantId);

    const dbVariants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        isActive: true
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    if (dbVariants.length !== variantIds.length) {
      res.status(400).json({
        success: false,
        message: "One or more selected items are invalid or inactive."
      });
      return;
    }

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    // 3. Compute verified item subtotals and order total
    let calculatedTotal = 0;
    const preparedOrderItems = inputItems.map((inputItem) => {
      const variant = variantMap.get(inputItem.variantId)!;
      const unitPrice = Number(variant.price);
      const subtotal = unitPrice * inputItem.quantity;
      calculatedTotal += subtotal;

      const itemNameSnapshot = variant.size
        ? `${variant.product.name} (${variant.size})`
        : variant.product.name;

      return {
        variantId: variant.id,
        itemNameSnapshot,
        unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),
        quantity: inputItem.quantity,
        subtotal: new Prisma.Decimal(subtotal.toFixed(2))
      };
    });

    // 4. Validate payment values on the server
    const amountTendered = inputPayment.amountTendered;

    if (amountTendered < calculatedTotal) {
      res.status(400).json({
        success: false,
        message: `Amount received (₱${amountTendered.toFixed(2)}) is less than total due (₱${calculatedTotal.toFixed(2)}).`
      });
      return;
    }

    let change = 0;
    let fee = 0;
    let netAmount = calculatedTotal;

    if (inputPayment.method === "CASH") {
      change = amountTendered - calculatedTotal;
      fee = 0;
      netAmount = calculatedTotal;
    } else if (inputPayment.method === "GCASH") {
      const feePct = inputPayment.feePercentage || 0;
      fee = amountTendered * (feePct / 100);
      netAmount = amountTendered - fee;
      change = 0;
    }

    // 5. Execute atomic transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const orderNumber = await generateOrderNumber(tx);

      const created = await tx.order.create({
        data: {
          orderNumber,
          total: new Prisma.Decimal(calculatedTotal.toFixed(2)),
          status: "PREPARING",
          notes: notes || null,
          items: {
            create: preparedOrderItems
          },
          payment: {
            create: {
              method: inputPayment.method,
              amountTendered: new Prisma.Decimal(amountTendered.toFixed(2)),
              change: new Prisma.Decimal(change.toFixed(2)),
              fee: new Prisma.Decimal(fee.toFixed(2)),
              netAmount: new Prisma.Decimal(netAmount.toFixed(2))
            }
          }
        },
        include: {
          items: true,
          payment: true
        }
      });

      return created;
    });

    res.status(201).json({
      success: true,
      data: newOrder
    });
  } catch (err) {
    console.error("Order creation transaction failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to process order and payment transaction"
    });
  }
}

/**
 * GET /api/orders
 * Returns list of recent orders with items and payment details
 */
export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const dateQuery = req.query.date as string | undefined;

    const whereClause: Prisma.OrderWhereInput = {};

    if (dateQuery && /^\d{4}-\d{2}-\d{2}$/.test(dateQuery)) {
      const [year, month, day] = dateQuery.split("-").map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payment: true
      }
    });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders"
    });
  }
}

/**
 * GET /api/orders/:id
 * Returns a specific order receipt by UUID
 */
export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true
      }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error("Error retrieving order:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order"
    });
  }
}

/**
 * PATCH /api/orders/:id/status
 * Updates an order's status (PREPARING, SERVED, CANCELLED)
 */
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["PREPARING", "SERVED", "CANCELLED", "COMPLETED"];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`
      });
      return;
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: "Order not found"
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: true,
        payment: true
      }
    });

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
}
