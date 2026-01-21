'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

export default function ImpressumPage() {
  const t = useTranslations('impressum');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back button */}
        <Link
          href="/waitlist"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('back')}</span>
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">
          {t('title')}
        </h1>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8 text-foreground/80">
          {/* Company Info */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('company.title')}
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{t('company.name')}</p>
              <p>{t('company.address')}</p>
              <p>{t('company.postalCode')}</p>
              <p>{t('company.city')}</p>
              <p>{t('company.country')}</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('contact.title')}
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">{t('contact.email')}:</span>{' '}
                <a href={`mailto:${t('contact.emailValue')}`} className="text-primary hover:underline">
                  {t('contact.emailValue')}
                </a>
              </p>
            </div>
          </section>

          {/* Legal */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('legal.title')}
            </h2>
            <div className="space-y-4">
              <p>{t('legal.content')}</p>
            </div>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('dataProtection.title')}
            </h2>
            <p>
              {t('dataProtection.content')}{' '}
              <Link href="/datenschutz" className="text-primary hover:underline">
                {t('dataProtection.link')}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
