import { Router } from "express";
import { getCategories } from "../controllers/productController";
import { requireOwnerAuth } from "../middleware/authMiddleware";

const router = Router();

// Protect with owner auth
router.get("/", requireOwnerAuth, getCategories);

export default router;
