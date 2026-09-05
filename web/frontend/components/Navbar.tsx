"use client";

import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/login", label: "Login" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-teal/10 bg-cream/90 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between">
        <Link href="/" className="font-heading text-xl font-bold tracking-tight text-teal">
          Afya<span className="text-teal-700">Drop</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-teal/80 transition-colors hover:text-teal">
              {l.label}
            </Link>
          ))}
          <Link href="/register" className="btn-primary !px-5 !py-2.5 text-sm">
            Register
          </Link>
        </nav>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-teal md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <div className={clsx("overflow-hidden border-t border-teal/10 transition-all duration-200 md:hidden", open ? "max-h-64" : "max-h-0 border-t-0")}>
        <nav className="container-site flex flex-col gap-1 py-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-teal/80 hover:bg-sage/40"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/register" onClick={() => setOpen(false)} className="btn-primary mt-2 text-sm">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
