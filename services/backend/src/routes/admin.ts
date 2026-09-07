import { Router, type Request, type Response, type NextFunction } from "express";
import { supabase } from "../db.js";
import { config } from "../config.js";

export const adminRouter = Router();

// Simple shared-secret guard for admin endpoints. For production, replace with
// proper admin auth (e.g. Supabase auth + role check).
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const provided = req.header("x-admin-secret");
  const expected = process.env.ADMIN_SECRET ?? config.internalSecret;
  if (!expected || provided !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

adminRouter.use(requireAdmin);

// GET /admin/users — list clinicians with wallet balance + question count
adminRouter.get("/users", async (_req, res) => {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, full_name, email, qualification, licence_number, profile_completed, role, suspended, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const enriched = await Promise.all(
    (users ?? []).map(async (u) => {
      const [{ data: wallet }, { count }] = await Promise.all([
        supabase.from("wallets").select("balance_credits").eq("user_id", u.id).maybeSingle(),
        supabase.from("qa_logs").select("id", { count: "exact", head: true }).eq("user_id", u.id),
      ]);
      return { ...u, balance_credits: wallet?.balance_credits ?? 0, questions_asked: count ?? 0 };
    }),
  );

  res.json({ users: enriched });
});

// PATCH /admin/users/:id  { suspended: boolean }  — suspend / reinstate
adminRouter.patch("/users/:id", async (req, res) => {
  const { suspended } = req.body ?? {};
  if (typeof suspended !== "boolean") {
    res.status(400).json({ error: "suspended (boolean) is required" });
    return;
  }
  const { data, error } = await supabase
    .from("users")
    .update({ suspended })
    .eq("id", req.params.id)
    .select("id, full_name, suspended")
    .single();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ ok: true, user: data });
});

// GET /admin/stats — high-level metrics for the admin dashboard
adminRouter.get("/stats", async (_req, res) => {
  const [users, questions, revenue] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("qa_logs").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("amount").eq("status", "paid"),
  ]);
  const totalRevenue = (revenue.data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);
  res.json({
    total_users: users.count ?? 0,
    total_questions: questions.count ?? 0,
    total_revenue: totalRevenue,
  });
});
