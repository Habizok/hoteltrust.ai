import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SITE_URL, SITE_NAME, LOCALES } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'audit.hero' });

  const title = `${t('title')} | ${SITE_NAME}`;
  const description = t('description');
  const path = `/${locale}/free-audit`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/free-audit`])),
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
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

export default function FreeAuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
