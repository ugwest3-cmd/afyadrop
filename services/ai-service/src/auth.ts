import type { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

export function requireInternalSecret(req: Request, res: Response, next: NextFunction): void {
  const provided = req.header("x-internal-secret");
  if (!config.internalSecret || provided !== config.internalSecret) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
