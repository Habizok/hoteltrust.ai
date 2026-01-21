'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function CookieBanner() {
  const t = useTranslations('cookies');
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
              {t('title')}
            </h3>
            <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
              {t('description')}{' '}
              <Link href="/datenschutz" className="text-primary hover:underline">
                {t('link')}
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full md:w-auto justify-end md:justify-start">
            <button
              onClick={declineCookies}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              type="button"
            >
              {t('decline')}
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-primary text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-primary/90 transition-colors"
              type="button"
            >
              {t('accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
