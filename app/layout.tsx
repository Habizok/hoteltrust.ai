import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

// Ez a globális, nyelv-független fallback - minden nyilvános oldal a saját
// layout.tsx-ében (waitlist, free-audit, impressum, datenschutz, audit/[id])
// felülírja ezt a tényleges, nyelv- és oldal-specifikus cím/leírás párral.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Wird Ihr Hotel von der KI empfohlen?`,
    template: `%s`,
  },
  description: "AI-Láthatósági és Reputációs Optimalizálás hoteleknek",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
