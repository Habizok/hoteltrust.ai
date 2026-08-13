import type { MetadataRoute } from 'next';
import { SITE_URL, LOCALES } from '@/lib/seo';

// Statikus nyilvános oldalak (a /waitlist a tényleges "főoldal" - a "/" és "/[locale]"
// mindig ide irányít át, ld. app/page.tsx és app/[locale]/page.tsx)
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/waitlist', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/free-audit', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/impressum', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/datenschutz', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return STATIC_ROUTES.flatMap(({ path, priority, changeFrequency }) => {
    const languages = Object.fromEntries(
      LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])
    );

    // minden nyelvi változat önálló sitemap-bejegyzés, egymásra mutató hreflang-gal
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });
}
