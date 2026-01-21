'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2 } from 'lucide-react';
import { useLocale } from 'next-intl';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
  waitlistCount?: number;
}

export default function WaitlistPopup({ isOpen, onClose, waitlistCount }: WaitlistPopupProps) {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, mounted]);

  if (!mounted || !isOpen) {
    return null;
  }

  const popupContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={locale === 'hu' ? 'Bezárás' : 'Schließen'}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          {locale === 'hu' 
            ? 'Sikeres feliratkozás a várólistára!' 
            : 'Erfolgreich für die Warteliste angemeldet!'}
        </h2>

        <p className="text-gray-600 text-center mb-6">
          {locale === 'hu'
            ? 'Köszönjük! Hamarosan jelentkezünk az 50% Early Bird kedvezménnyel.'
            : 'Vielen Dank! Wir melden uns bald mit dem 50% Early Bird Rabatt.'}
        </p>

        <div className="bg-primary/10 rounded-lg p-4 mb-6">
          <p className="text-center text-sm text-gray-600 mb-1">
            {locale === 'hu' ? 'Már feliratkozott a világon:' : 'Bereits angemeldet weltweit:'}
          </p>
          <p className="text-center text-3xl font-bold text-primary">
            163 {locale === 'hu' ? 'hotel' : 'Hotels'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          {locale === 'hu' ? 'Rendben' : 'Verstanden'}
        </button>
      </div>
    </div>
  );

  // Use React Portal to render outside the normal DOM hierarchy
  // This prevents Framer Motion from interfering with the popup
  return createPortal(popupContent, document.body);
}
