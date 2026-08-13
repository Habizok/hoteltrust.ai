export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://hoteltrust.at').replace(/\/+$/, '');

export const SITE_NAME = 'Trusthotel';

export const LOCALES = ['hu', 'de'] as const;
export type SiteLocale = (typeof LOCALES)[number];
