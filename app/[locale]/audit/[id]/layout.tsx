import type { Metadata } from 'next';
import { getAuditResult } from '@/lib/kv';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

// Egyedi, felhasználó-specifikus eredményoldal - nem publikus keresésre szánt tartalom,
// ezért noindex (a robots.ts is letiltja /*/audit/* alatt), de ha valaki megosztja a
// saját linkjét, legyen rendes cím/leírás, ne a generikus site-szintű metaadat.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;

  let hotelName: string | null = null;
  try {
    const result = await getAuditResult(id);
    hotelName = result?.hotelName ?? null;
  } catch {
    hotelName = null;
  }

  const title = hotelName
    ? `${hotelName} - AI Audit | ${SITE_NAME}`
    : locale === 'hu'
      ? `AI Audit eredmény | ${SITE_NAME}`
      : `AI-Audit-Ergebnis | ${SITE_NAME}`;

  const description = locale === 'hu'
    ? 'Így látja a mesterséges intelligencia ezt a szállodát - élő AI-láthatósági elemzés a Trusthotel-től.'
    : 'So sieht die künstliche Intelligenz dieses Hotel - Live-KI-Sichtbarkeitsanalyse von Trusthotel.';

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/audit/${id}`,
      siteName: SITE_NAME,
      locale: locale === 'hu' ? 'hu_HU' : 'de_AT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function AuditResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
