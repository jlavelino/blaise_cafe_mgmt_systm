import { Router } from "express";
import { getTodayDashboard } from "../controllers/dashboardController";
import { requireOwnerAuth } from "../middleware/authMiddleware";

const router = Router();

// Protect with owner auth
router.use(requireOwnerAuth);

router.get("/today", getTodayDashboard);

export default router;
