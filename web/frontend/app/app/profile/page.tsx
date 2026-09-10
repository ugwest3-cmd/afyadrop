"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { api, type UserProfile } from "@/lib/api";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { user: u } = await api.me();
      if (!u) { router.push("/login"); return; }
      setUser(u);
      const b = await api.balance(u.id);
      setBalance(b.balance_credits);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  const initials = (user?.full_name || "U").charAt(0).toUpperCase();

  return (
    <div className="overflow-y-auto pb-6">
      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-teal/10 bg-teal/8">
            <span className="text-3xl font-black text-teal">{initials}</span>
          </div>
          <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal shadow">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">{user?.full_name || "Your Name"}</h1>
        <p className="text-sm text-gray-500">{user?.qualification || "Clinician"}</p>
      </div>

      {/* Credit balance card */}
      <div className="mx-4">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-teal to-teal/80 p-5 text-white shadow-lg">
          <div>
            <p className="text-xs font-semibold text-white/60">Credits Balance</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-4xl font-black">{balance}</span>
              <span className="text-sm font-semibold text-white/80">credits</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/app/wallet")}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-teal shadow-sm transition-opacity hover:opacity-90"
          >
            Top Up
          </button>
        </div>
      </div>

      {/* Personal info */}
      <div className="mx-4 mt-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Personal Information</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
          <InfoRow label="Email Address" value={user?.email ?? ""} />
          <InfoRow label="Country" value={user?.country ?? ""} />
          <InfoRow label="Licence Number" value={user?.licence_number ?? ""} />
        </div>
      </div>

      {/* Settings */}
      <div className="mx-4 mt-5">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Settings &amp; Support</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100">
          <a
            href="mailto:info@afyalinks.com"
            className="flex items-center gap-3 px-4 py-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
              <svg className="h-4.5 w-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="flex-1 text-sm font-semibold text-gray-900">Help Center</span>
            <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 px-4 py-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
              <svg className="h-4.5 w-4.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-red-600">
              {loggingOut ? "Signing out…" : "Log Out"}
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[11px] text-gray-400">AfyaDrop · Clinical Decision Support · v1.0</p>
    </div>
  );
}
