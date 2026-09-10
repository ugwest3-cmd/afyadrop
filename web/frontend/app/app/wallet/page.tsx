"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { api, type UserProfile } from "@/lib/api";

const PACKAGES = [
  { credits: 10, label: "Starter", usd: 1.0, popular: false },
  { credits: 25, label: "Popular Clinician", usd: 2.5, popular: true },
  { credits: 60, label: "Ward Bundle", usd: 6.0, popular: false },
  { credits: 100, label: "Pro Bundle", usd: 10.0, popular: false },
];

export default function WalletPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [selected, setSelected] = useState(PACKAGES[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handlePurchase() {
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      const { redirect_url } = await api.purchase(user.id, selected.credits);
      window.location.href = redirect_url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  const usagePct = Math.min((balance / 100) * 100, 100);

  return (
    <div className="overflow-y-auto px-4 py-4 space-y-4">
      {/* Balance card */}
      <div className="rounded-2xl bg-teal p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Your Balance</p>
            <p className="mt-1 text-5xl font-black text-sage">{balance}</p>
            <p className="text-sm font-medium text-white/70 mt-0.5">Credits remaining</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <svg className="h-7 w-7 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-sage transition-all duration-500"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/50">Usage tracker (out of 100)</p>
        </div>
      </div>

      {/* Pricing note */}
      <div className="flex items-center gap-2 rounded-xl border border-teal/10 bg-teal/5 px-3.5 py-2.5">
        <svg className="h-4 w-4 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs font-semibold text-teal">Transparent Pricing: \$0.10 USD per credit · 1 credit = 1 clinical question</p>
      </div>

      {/* Package picker */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Top-up Packages</h2>
        <div className="grid grid-cols-2 gap-2">
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
                <p className="text-[11px] font-medium text-gray-500">credits</p>
                <p className="mt-2 text-sm font-bold text-teal">\${pkg.usd.toFixed(2)} USD</p>
                <p className="text-[10px] text-gray-400">{pkg.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Purchase button */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handlePurchase}
        disabled={loading || !user}
        className="w-full rounded-2xl bg-teal py-4 text-sm font-bold text-sage transition-opacity disabled:opacity-50 hover:opacity-90"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage border-t-transparent" />
            Redirecting…
          </span>
        ) : (
          `Pay \$${selected.usd.toFixed(2)} USD · Get ${selected.credits} credits`
        )}
      </button>

      <p className="text-center text-[11px] text-gray-400">
        Secure checkout via IntaSend · MTN MoMo, Airtel Money, Card accepted
      </p>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
        <p className="text-[11px] font-semibold text-amber-700">Clinical Decision Support Disclaimer</p>
        <p className="mt-0.5 text-[11px] text-amber-600">Credits are consumed per query. Purchases are non-refundable except as required by law.</p>
      </div>
    </div>
  );
}
