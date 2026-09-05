import type { ReactNode } from "react";

export function StatCard({ value, label, sub }: { value: ReactNode; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-teal/10 bg-ivory p-5 text-center shadow-card sm:p-6">
      <div className="font-heading text-2xl font-bold leading-tight text-teal sm:text-3xl lg:text-4xl">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-teal/70 sm:text-sm">{label}</div>
      {sub && <div className="mt-1 text-xs text-muted sm:text-sm">{sub}</div>}
    </div>
  );
}
