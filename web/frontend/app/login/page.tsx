"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Minimal MVP sign-in: identify by user_id or phone stored locally after registration.
export default function Login() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) {
      setError("Enter your user ID");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("afyadrop_user_id", userId.trim());
    }
    router.push("/dashboard");
  }

  return (
    <main className="container">
      <div className="brand">Afya Drop</div>
      <div className="card">
        <h2>Sign in</h2>
        <form onSubmit={onSubmit}>
          <label htmlFor="uid">User ID</label>
          <input id="uid" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="your account id" required />
          <div className="hint">For the MVP, paste the user ID you received after registering.</div>
          <button>Continue</button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </main>
  );
}
