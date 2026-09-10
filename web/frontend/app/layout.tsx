import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://afyadrop.com"),
  title: "Afya Drop",
  description:
    "Clinical decision support grounded in evidence-based clinical guidelines. Ask in the Afya Drop app, get trusted answers in seconds.",
  icons: { icon: "/logo-mark.png" },
  openGraph: {
    title: "Afya Drop",
    description:
      "Clinical decision support grounded in evidence-based clinical guidelines. Ask in the Afya Drop app, get trusted answers in seconds.",
    url: "https://afyadrop.com",
    siteName: "Afya Drop",
    images: [{ url: "/logo-full.png" }],
    type: "website",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Afya Drop",
  url: "https://afyadrop.com",
  logo: "https://afyadrop.com/logo-full.png",
  description:
    "Clinical decision-support grounded in evidence-based clinical guidelines, delivered through the Afya Drop mobile app.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cabin:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00282C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AfyaDrop" />
        <link rel="apple-touch-icon" href="/logo-mark.png" />

        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        {/*
          SiteShell is a client component that checks the pathname:
          - /app/* → renders children bare (the app shell layout takes over)
          - everything else → wraps with Navbar + Footer + InstallBanner
        */}
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
