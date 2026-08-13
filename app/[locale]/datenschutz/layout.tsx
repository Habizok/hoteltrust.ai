import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SITE_URL, SITE_NAME, LOCALES } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'datenschutz' });

  const title = `${t('title')} | ${SITE_NAME}`;
  const path = `/${locale}/datenschutz`;

  return {
    title,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/datenschutz`])),
    },
    openGraph: {
      title,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      locale: locale === 'hu' ? 'hu_HU' : 'de_AT',
      type: 'website',
    },
  };
}

export default function DatenschutzLayout({ children }: { children: React.ReactNode }) {
  return children;
}
