import type { Request, Response, NextFunction } from "express";
import { supabase } from "./db.js";

// Augment Express Request with the authenticated Supabase user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

// Verifies the Supabase Auth JWT sent as `Authorization: Bearer <token>` by
// the frontend (set after signInWithOtp / signInWithOAuth). Attaches the
// authenticated user's id + email to the request.
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "missing bearer token" });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "invalid or expired session" });
    return;
  }

  req.userId = data.user.id;
  req.userEmail = data.user.email ?? undefined;
  next();
}
