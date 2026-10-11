import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  toggleOrderItemServed
} from "../controllers/orderController";
import { requireOwnerAuth } from "../middleware/authMiddleware";

const router = Router();

// All order operations require authenticated owner
router.use(requireOwnerAuth);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:orderId/items/:itemId/toggle-served", toggleOrderItemServed);

export default router;
