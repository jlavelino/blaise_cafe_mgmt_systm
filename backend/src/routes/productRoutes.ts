import { Router } from "express";
import { getProducts } from "../controllers/productController";
import { requireOwnerAuth } from "../middleware/authMiddleware";

const router = Router();

// Protect with owner auth
router.get("/", requireOwnerAuth, getProducts);

export default router;
