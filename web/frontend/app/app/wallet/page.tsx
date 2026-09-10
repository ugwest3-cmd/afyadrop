"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { api, type UserProfile } from "@/lib/api";

const PACKAGES = [
  { credits: 10, label: "Starter", usd: 1.0, ugx: "3,700 UGX", popular: false, desc: "Try it out" },
  { credits: 25, label: "Popular", usd: 2.5, ugx: "9,300 UGX", popular: true, desc: "Best value" },
  { credits: 60, label: "Ward Bundle", usd: 6.0, ugx: "22,200 UGX", popular: false, desc: "For heavy use" },
  { credits: 100, label: "Pro", usd: 10.0, ugx: "37,000 UGX", popular: false, desc: "Power users" },
];

export default function WalletPage() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("status"); // e.g. ?status=paid from IntaSend callback

  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [selected, setSelected] = useState(PACKAGES[1]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { user: u } = await api.me();
      if (!u) return;
      setUser(u);
      const b = await api.balance(u.id);
      setBalance(b.balance_credits);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Show toast when returning from IntaSend payment
  useEffect(() => {
    if (paymentStatus === "paid" || paymentStatus === "success") {
      setToast({ type: "success", msg: "Payment received! Credits will appear shortly." });
      // Refresh balance after a short delay to let webhook process
      const t = setTimeout(() => load(), 3000);
      return () => clearTimeout(t);
    }
    if (paymentStatus === "failed" || paymentStatus === "cancelled") {
      setToast({ type: "error", msg: "Payment was not completed. Please try again." });
    }
  }, [paymentStatus, load]);

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handlePurchase() {
    if (!user) return;
    setError("");
    setBuying(true);
    try {
      const { redirect_url } = await api.purchase(user.id, selected.credits);
      window.location.href = redirect_url;
    } catch (err) {
      setError((err as Error).message);
      setBuying(false);
    }
  }

  const usagePct = Math.min((balance / 100) * 100, 100);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative overflow-y-auto pb-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`mx-4 mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-current/60 hover:text-current">✕</button>
        </div>
      )}

      {/* Balance card */}
      <div className="mx-4 mt-4">
        <div className="rounded-2xl bg-teal p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Your Balance</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-5xl font-black text-sage">{balance}</span>
                <span className="text-sm font-semibold text-white/70">credits</span>
              </div>
              <p className="mt-0.5 text-xs text-white/50">≈ {balance} clinical questions</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <svg className="h-7 w-7 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-white/40 mb-1">
              <span>0</span>
              <span>100</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-sage transition-all duration-700"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing note */}
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-teal/10 bg-teal/5 px-3.5 py-2.5">
        <svg className="h-4 w-4 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs font-semibold text-teal">1 credit = 1 clinical question · \$0.10 USD per credit</p>
      </div>

      {balance === 0 && (
        <div className="mx-4 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-bold text-amber-800">You're out of credits</p>
          <p className="text-xs text-amber-700 mt-0.5">Top up below to keep asking clinical questions.</p>
        </div>
      )}

      {/* Package picker */}
      <div className="mx-4 mt-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Choose a Top-up Package</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {PACKAGES.map((pkg) => {
            const isSelected = selected.credits === pkg.credits;
            return (
              <button
                key={pkg.credits}
                onClick={() => setSelected(pkg)}
                className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? "border-teal bg-teal/5 shadow-sm"
                    : "border-gray-100 bg-white hover:border-teal/20"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute right-2 top-2 rounded-full bg-teal px-2 py-0.5 text-[9px] font-bold text-sage">
                    Popular
                  </span>
                )}
                <p className="text-2xl font-black text-teal">{pkg.credits}</p>
                <p className="text-[11px] font-medium text-gray-400">credits</p>
                <p className="mt-2 text-sm font-bold text-teal">\${pkg.usd.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400">{pkg.ugx}</p>
                <p className="mt-1 text-[10px] font-semibold text-teal/60">{pkg.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Purchase CTA */}
      <div className="mx-4 mt-5 space-y-3">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={buying || !user}
          className="w-full rounded-2xl bg-teal py-4 text-sm font-bold text-sage transition-opacity disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
        >
          {buying ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage border-t-transparent" />
              Opening checkout…
            </span>
          ) : (
            `Pay \$${selected.usd.toFixed(2)} · Get ${selected.credits} credits`
          )}
        </button>

        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Secure
          </span>
          <span>·</span>
          <span>MTN MoMo</span>
          <span>·</span>
          <span>Airtel Money</span>
          <span>·</span>
          <span>Card</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-4 mt-5 rounded-xl border border-amber-100 bg-amber-50 p-3">
        <p className="text-[11px] font-semibold text-amber-700">Clinical Decision Support Disclaimer</p>
        <p className="mt-0.5 text-[11px] text-amber-600">Credits are consumed per query only after a successful answer. Purchases are non-refundable except as required by law.</p>
      </div>
    </div>
  );
}
