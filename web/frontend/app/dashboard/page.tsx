"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

const CREDIT_PRICE = 100; // UGX per credit
const MIN_UGX = 1000;
const BUNDLES = [10, 25, 50, 100];

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [credits, setCredits] = useState(25);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }
      try {
        const { user } = await api.me();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);
        if (!user.profile_completed) {
          router.push("/register");
          return;
        }
        const b = await api.balance(user.id);
        setBalance(b.balance_credits);
      } catch {
        setBalance(0);
      }
    });
  }, [router]);

  const amount = credits * CREDIT_PRICE;
  const belowMin = amount < MIN_UGX;

  async function onBuy(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.purchase(userId, credits);
      window.location.href = res.redirect_url; // PesaPal checkout
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="bg-cream py-14 sm:py-20">
      <div className="container-site max-w-3xl">
        <h1 className="text-3xl font-bold text-teal">Your wallet</h1>

        {/* Balance */}
        <Card className="mt-6 flex flex-col items-center bg-teal py-12 text-center">
          <div className="font-heading text-6xl font-bold text-sage sm:text-7xl">
            {balance === null ? "—" : balance}
          </div>
          <div className="mt-2 text-sm font-semibold uppercase tracking-wide text-cream/70">credits remaining</div>
          {balance === 0 && (
            <p className="mt-4 max-w-sm text-sm text-cream/70">
              You're out of credits. Top up below to keep asking questions in the Afya Drop app.
            </p>
          )}
        </Card>

        {/* Buy credits */}
        <Card className="mt-8">
          <h2 className="text-xl font-bold text-teal">Buy credits</h2>
          <p className="mt-1 text-sm text-muted">
            1 credit = {CREDIT_PRICE} UGX · minimum {MIN_UGX.toLocaleString()} UGX · secure checkout via PesaPal
          </p>

          <form onSubmit={onBuy} className="mt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BUNDLES.map((b) => {
                const active = credits === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setCredits(b)}
                    className={
                      "rounded-xl border-2 p-4 text-center transition-all " +
                      (active
                        ? "border-teal bg-sage shadow-card"
                        : "border-teal/10 bg-white hover:border-sage-500")
                    }
                  >
                    <div className="font-heading text-2xl font-bold text-teal">{b}</div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted">credits</div>
                    <div className="mt-1 text-sm font-semibold text-teal">{(b * CREDIT_PRICE).toLocaleString()} UGX</div>
                  </button>
                );
              })}
            </div>

            {belowMin && (
              <p className="error-text">Minimum purchase is {MIN_UGX.toLocaleString()} UGX (10 credits).</p>
            )}
            {error && <p className="error-text">{error}</p>}

            <Button type="submit" loading={loading} disabled={belowMin || !userId} className="mt-6 w-full text-lg">
              Pay {amount.toLocaleString()} UGX with PesaPal
            </Button>
            {!userId && <p className="hint mt-3 text-center">Please <a className="underline" href="/login">login</a> first.</p>}
          </form>
        </Card>
      </div>
    </main>
  );
}
