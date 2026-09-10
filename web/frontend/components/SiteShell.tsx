"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InstallBanner } from "@/components/InstallBanner";

/**
 * Conditionally wraps children with the website Navbar + Footer.
 * Pages under /app get a bare shell — their own layout handles the UI.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp = pathname.startsWith("/app");

  if (isApp) {
    // Pure app — no website chrome at all
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      {/* Install banner only on website pages (not inside the app shell) */}
      <InstallBanner />
    </>
  );
}
