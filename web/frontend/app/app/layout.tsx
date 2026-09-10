"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { api, type UserProfile } from "@/lib/api";

// Bottom nav items
const NAV = [
  {
    href: "/app",
    label: "Ask",
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? "text-teal" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    href: "/app/history",
    label: "History",
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? "text-teal" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/app/wallet",
    label: "Wallet",
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? "text-teal" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: "/app/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg className={`h-6 w-6 ${active ? "text-teal" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    try {
      const { user: u } = await api.me();
      if (!u) { router.push("/login"); return; }
      if (!u.profile_completed) { router.push("/register"); return; }
      setUser(u);
      const b = await api.balance(u.id);
      setBalance(b.balance_credits);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadUser(); }, [loadUser]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="AfyaDrop" className="h-12 w-12 rounded-2xl" />
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-1/2 animate-[loading_1s_ease-in-out_infinite] rounded-full bg-teal" />
          </div>
        </div>
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <div className="app-shell">
      {/* Top App Bar */}
      <header className="app-topbar">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" className="h-8 w-8 rounded-lg" />
          <div>
            <div className="text-sm font-bold leading-none text-teal">AfyaDrop</div>
            <div className="text-[10px] font-semibold leading-none text-teal/50 mt-0.5">
              {user?.country ?? "UG"} · Clinical AI
            </div>
          </div>
        </div>
        <Link
          href="/app/wallet"
          className="flex items-center gap-1.5 rounded-lg bg-teal/8 px-2.5 py-1.5 transition-colors hover:bg-teal/12"
        >
          <svg className="h-3.5 w-3.5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-xs font-bold text-teal">{balance} credits</span>
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-teal">
            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </Link>
      </header>

      {/* Grounding banner */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-green-50/60 px-4 py-1.5">
        <svg className="h-3.5 w-3.5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-[11px] font-semibold text-green-700">
          Grounding: Clinical Guidelines · Live Sync
        </p>
      </div>

      {/* Page content */}
      <main className="app-content">{children}</main>

      {/* Bottom Navigation */}
      <nav className="app-bottom-nav">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className="app-nav-item">
              {item.icon(active)}
              <span className={`text-[10px] font-semibold mt-0.5 ${active ? "text-teal" : "text-gray-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
