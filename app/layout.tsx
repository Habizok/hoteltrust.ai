import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "HotelTrust.ai - Wird Ihr Hotel von der KI empfohlen?",
  description: "AI-Láthatósági és Reputációs Optimalizálás hoteleknek",
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
