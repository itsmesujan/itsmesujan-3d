import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono, Inter } from "next/font/google";
import { site } from "@/content/site";
import { PERSON_ID, WEBSITE_ID } from "@/lib/schema";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "AI agent orchestration",
    "AI-native development",
    "agent engineering",
    "TypeScript",
    "Python",
    "Next.js",
    "Flutter",
    "MCP",
    "multi-agent systems",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "portfolio",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * Structured data. Person + WebSite, describing exactly what the page says.
   * No ratings, no fake awards — only facts present in the content.
   */
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    alternateName: site.handle,
    url: site.url,
    image: site.avatar,
    jobTitle: site.role,
    description: site.description,
    sameAs: [site.github],
    address: {
      "@type": "PostalAddress",
      addressCountry: "JP",
    },
    knowsAbout: [
      "Agent orchestration",
      "Context engineering",
      "AI output evaluation",
      "TypeScript",
      "Python",
      "Next.js",
      "Flutter",
      "Google Cloud",
    ],
  };

  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    // Referenced by the per-page schema as a bare @id.
    "@id": WEBSITE_ID,
    name: site.name,
    url: site.url,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
  };

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetbrains.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          // Schema is built from our own static content, not user input.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ "@graph": [personSchema, siteSchema] }),
          }}
        />
        {/* Warm up the connections the page will actually use. */}
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
