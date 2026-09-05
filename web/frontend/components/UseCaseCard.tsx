import type { ReactNode } from "react";

export function UseCaseCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="card p-6 transition-colors duration-200 hover:border-sage-500 hover:bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage text-2xl" aria-hidden>
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-bold text-teal">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{children}</p>
    </article>
  );
}
