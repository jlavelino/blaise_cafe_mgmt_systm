import { Router } from "express";
import { createOrder, getOrders, getOrderById } from "../controllers/orderController";
import { requireOwnerAuth } from "../middleware/authMiddleware";

const router = Router();

// All order operations require authenticated owner
router.use(requireOwnerAuth);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

export default router;
