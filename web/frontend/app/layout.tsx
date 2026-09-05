import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://afyadrop.com"),
  title: "Afya Drop",
  description:
    "Clinical decision support grounded in each country's national clinical guidelines. Ask in the Afya Drop app, get trusted answers in seconds.",
  icons: { icon: "/logo-mark.png" },
  openGraph: {
    title: "Afya Drop",
    description:
      "Clinical decision support grounded in each country's national clinical guidelines. Ask in the Afya Drop app, get trusted answers in seconds.",
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
    "Clinical decision-support grounded in each country's national clinical guidelines, delivered through the Afya Drop mobile app.",
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
      </head>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
