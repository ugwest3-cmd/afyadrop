import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afya Drop — Clinical Decision Support for Uganda",
  description:
    "AI-powered clinical decision support grounded in the Uganda Clinical Guidelines. Ask over WhatsApp, get trusted answers in seconds.",
  openGraph: {
    title: "Afya Drop — Clinical Decision Support for Uganda",
    description:
      "AI-powered clinical decision support grounded in the Uganda Clinical Guidelines. Ask over WhatsApp, get trusted answers in seconds.",
    url: "https://afyadrop.com",
    siteName: "Afya Drop",
    type: "website",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Afya Drop",
  url: "https://afyadrop.com",
  description:
    "Clinical decision-support assistant for Ugandan medical professionals, grounded in the Uganda Clinical Guidelines.",
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
