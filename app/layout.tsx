import type { Metadata, Viewport } from "next";
import { Outfit, Figtree } from "next/font/google";
import "./globals.css";
import { de } from "@/lib/content/de";
import { SITE } from "@/lib/site";
import { LangProvider } from "@/components/Lang";

const display = Outfit({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap", weight: ["500", "600", "700"] });
const sans = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: de["meta.title"], template: "%s | HotelTrust" },
  description: de["meta.desc"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: SITE.url,
    siteName: SITE.name,
    title: de["meta.title"],
    description: de["meta.desc"],
  },
  twitter: { card: "summary_large_image", title: de["meta.title"], description: de["meta.desc"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#EAF3E0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-AT" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-forest-600 focus:px-4 focus:py-3 focus:font-bold focus:text-white"
        >
          {de["skip"]}
        </a>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
