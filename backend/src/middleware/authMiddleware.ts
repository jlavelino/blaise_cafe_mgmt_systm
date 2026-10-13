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
    const userEmail = authenticatedUser.email?.toLowerCase();

    if (!userEmail) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Authenticated user does not have an associated email"
      });
      return;
    }

    // Optional strict whitelist enforcement via STRICT_OWNER_ONLY=true
    // By default, any user manually created by the owner in the Supabase project is authorized.
    if (process.env.STRICT_OWNER_ONLY === "true") {
      const allowedEmails = (process.env.ALLOWED_EMAILS || process.env.OWNER_EMAIL || "jhonleovil@gmail.com")
        .toLowerCase()
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      if (!allowedEmails.includes(userEmail)) {
        res.status(403).json({
          success: false,
          message: "Forbidden: Access restricted to authorized Blaise Café users only"
        });
        return;
      }
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
