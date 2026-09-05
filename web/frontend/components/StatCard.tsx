import type { ReactNode } from "react";

export function StatCard({ value, label, sub }: { value: ReactNode; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-teal/10 bg-ivory p-6 text-center shadow-card">
      <div className="font-heading text-4xl font-bold text-teal sm:text-5xl">{value}</div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-wide text-teal/70">{label}</div>
      {sub && <div className="mt-1 text-sm text-muted">{sub}</div>}
    </div>
  );
}
