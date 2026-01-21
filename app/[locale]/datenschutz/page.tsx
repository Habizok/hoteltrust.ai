'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

export default function DatenschutzPage() {
  const t = useTranslations('datenschutz');

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
          {/* Introduction */}
          <section>
            <p className="leading-relaxed">{t('introduction')}</p>
          </section>

          {/* Data Controller */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('dataController.title')}
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{t('dataController.name')}</p>
              <p>{t('dataController.address')}</p>
              <p>{t('dataController.postalCode')}</p>
              <p>{t('dataController.city')}</p>
              <p>{t('dataController.country')}</p>
              <p>
                <span className="font-medium">{t('dataController.email')}:</span>{' '}
                <a href={`mailto:${t('dataController.emailValue')}`} className="text-primary hover:underline">
                  {t('dataController.emailValue')}
                </a>
              </p>
            </div>
          </section>

          {/* Personal Data */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('personalData.title')}
            </h2>
            <p className="mb-4">{t('personalData.intro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t('personalData.item1')}</li>
              <li>{t('personalData.item2')}</li>
              <li>{t('personalData.item3')}</li>
              <li>{t('personalData.item4')}</li>
              <li>{t('personalData.item5')}</li>
            </ul>
          </section>

          {/* Purpose */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('purpose.title')}
            </h2>
            <p className="mb-4">{t('purpose.intro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t('purpose.item1')}</li>
              <li>{t('purpose.item2')}</li>
              <li>{t('purpose.item3')}</li>
              <li>{t('purpose.item4')}</li>
            </ul>
          </section>

          {/* Legal Basis */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('legalBasis.title')}
            </h2>
            <p className="mb-4">{t('legalBasis.content')}</p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('dataRetention.title')}
            </h2>
            <p className="mb-4">{t('dataRetention.content')}</p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('rights.title')}
            </h2>
            <p className="mb-4">{t('rights.intro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t('rights.item1')}</li>
              <li>{t('rights.item2')}</li>
              <li>{t('rights.item3')}</li>
              <li>{t('rights.item4')}</li>
              <li>{t('rights.item5')}</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('cookies.title')}
            </h2>
            <p className="mb-4">{t('cookies.content')}</p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('dataSecurity.title')}
            </h2>
            <p className="mb-4">{t('dataSecurity.content')}</p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('contact.title')}
            </h2>
            <p className="mb-4">{t('contact.content')}</p>
            <p>
              <span className="font-medium">{t('contact.email')}:</span>{' '}
              <a href={`mailto:${t('contact.emailValue')}`} className="text-primary hover:underline">
                {t('contact.emailValue')}
              </a>
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              {t('changes.title')}
            </h2>
            <p>{t('changes.content')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
