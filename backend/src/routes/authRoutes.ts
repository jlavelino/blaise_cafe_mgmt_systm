import { Router, Request, Response } from "express";
import { requireOwnerAuth } from "../middleware/authMiddleware";

const router = Router();

/**
 * GET /api/auth/me
 * Protected endpoint to verify owner session and return owner profile
 */
router.get("/me", requireOwnerAuth, (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: "owner",
      lastSignInAt: user.last_sign_in_at
    }
  });
});

export default router;
