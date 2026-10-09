import { Request, Response, NextFunction } from "express";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// Augment Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function requireOwnerAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required: Bearer token missing"
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required: Token is empty"
      });
      return;
    }

    // Verify token with Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired session token"
      });
      return;
    }

    const authenticatedUser = data.user;
    const ownerEmail = (process.env.OWNER_EMAIL || "jhonleovil@gmail.com").toLowerCase();

    // Verify user is strictly the Blaise Café owner
    if (!authenticatedUser.email || authenticatedUser.email.toLowerCase() !== ownerEmail) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Access restricted to Blaise Café owner only"
      });
      return;
    }

    // Attach user to request object
    req.user = authenticatedUser;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication"
    });
  }
}
