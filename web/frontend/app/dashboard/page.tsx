"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const CREDIT_PRICE = 100; // UGX per credit
const MIN_UGX = 1000;
const BUNDLES = [10, 25, 50, 100];

export default function Dashboard() {
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [credits, setCredits] = useState(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = window.localStorage.getItem("afyadrop_user_id") ?? "";
    setUserId(id);
    if (id) {
      api.balance(id).then((b) => setBalance(b.balance_credits)).catch(() => setBalance(0));
    }
  }, []);

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
    <main className="container">
      <div className="brand">Afya Drop</div>
      <div className="card">
        <h2>Your wallet</h2>
        <div className="balance">{balance === null ? "—" : balance} <span className="hint">credits</span></div>
      </div>

      <div className="card">
        <h2>Buy credits</h2>
        <form onSubmit={onBuy}>
          <label htmlFor="credits">Credits</label>
          <select id="credits" value={credits} onChange={(e) => setCredits(Number(e.target.value))}>
            {BUNDLES.map((b) => (
              <option key={b} value={b}>{b} credits — {(b * CREDIT_PRICE).toLocaleString()} UGX</option>
            ))}
          </select>
          <div className="hint">1 credit = {CREDIT_PRICE} UGX · minimum {MIN_UGX.toLocaleString()} UGX · paid via PesaPal</div>
          {belowMin && <div className="error">Minimum purchase is {MIN_UGX.toLocaleString()} UGX (10 credits).</div>}
          <button disabled={loading || belowMin || !userId}>{loading ? "Redirecting…" : `Pay ${amount.toLocaleString()} UGX`}</button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </main>
  );
}
