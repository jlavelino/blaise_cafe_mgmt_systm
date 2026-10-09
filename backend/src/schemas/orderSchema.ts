import { z } from "zod";

export const CreateOrderItemSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID format"),
  quantity: z.number().int().positive("Quantity must be at least 1")
});

export const CreateOrderPaymentSchema = z.object({
  method: z.enum(["CASH", "GCASH"]),
  amountTendered: z
    .number()
    .positive("Amount tendered must be greater than zero"),
  feePercentage: z
    .number()
    .min(0, "Fee percentage cannot be negative")
    .max(100, "Fee percentage cannot exceed 100")
    .optional()
    .default(0)
});

export const CreateOrderSchema = z.object({
  items: z
    .array(CreateOrderItemSchema)
    .min(1, "Order must contain at least one item"),
  payment: CreateOrderPaymentSchema,
  notes: z.string().max(255).optional()
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
