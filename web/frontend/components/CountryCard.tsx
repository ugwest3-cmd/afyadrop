import type { AfyaCountry } from "@/lib/countries";

export function CountryCard({ country }: { country: AfyaCountry }) {
  const live = country.status === "Live";
  return (
    <article className="card group relative overflow-hidden p-6 transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <img src={country.flagPath} alt={`${country.name} flag`} className="h-10 w-14 rounded object-cover shadow-sm" />
        <span className={live ? "badge-live" : "badge-soon"}>{country.status}</span>
      </div>
      <h3 className="mt-5 text-xl font-bold text-teal">{country.name}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{country.body}</p>
      <p className="mt-5 border-t border-teal/10 pt-4 text-sm font-semibold text-teal">
        {live ? "Available in Afya Drop App" : "Service launching soon"}
      </p>
    </article>
  );
}
