import { clsx } from "clsx";

export function SectionHeading({ tagline, heading, align = "center" }: { tagline: string; heading: string; align?: "center" | "left" }) {
  return (
    <div className={clsx("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">{tagline}</p>
      <h2 className="mt-3 text-3xl font-bold text-teal sm:text-4xl">{heading}</h2>
    </div>
  );
}
