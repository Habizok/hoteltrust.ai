import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SITE_URL, SITE_NAME, LOCALES } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'waitlist.hero' });

  const title = `${t('title')} | ${SITE_NAME}`;
  const description = t('subtitle');
  const path = `/${locale}/waitlist`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/waitlist`])),
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

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
