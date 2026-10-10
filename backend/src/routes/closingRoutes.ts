import { Router } from "express";
import {
  getClosingPreview,
  submitDailyClosing,
  getClosingHistory
} from "../controllers/closingController";
import { requireOwnerAuth } from "../middleware/authMiddleware";

const router = Router();

// Owner-only endpoints
router.use(requireOwnerAuth);

router.get("/preview", getClosingPreview);
router.post("/submit", submitDailyClosing);
router.get("/history", getClosingHistory);

export default router;
