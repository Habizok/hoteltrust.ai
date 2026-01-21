'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestEmailPage() {
  const locale = useLocale();
  const [toEmail, setToEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string; hint?: string } | null>(null);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);

    try {
      const targetEmail = toEmail.trim() || 'info@hotel-trust.site';
      const response = await fetch(`/api/test-email?to=${encodeURIComponent(targetEmail)}`);
      const data = await response.json();

      setResult(data);
    } catch (error: any) {
      console.error('Frontend email test error:', error);
      setResult({
        success: false,
        message: locale === 'hu' ? 'Hiba történt a teszt email küldése során.' : 'Fehler beim Senden der Test-E-Mail.',
        details: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-border">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {locale === 'hu' ? 'Teszt Email Küldése' : 'Test-E-Mail senden'}
            </h1>
            <p className="text-sm sm:text-base text-foreground/60">
              {locale === 'hu'
                ? 'Teszteld az email küldési funkciót'
                : 'Testen Sie die E-Mail-Versandfunktion'}
            </p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="toEmail" className="block text-sm font-medium text-foreground mb-2">
                {locale === 'hu' ? 'Címzett E-mail' : 'E-Mail-Adresse'}
              </label>
              <input
                type="email"
                id="toEmail"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="pl: info@hotel-trust.site"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <p className="text-xs text-foreground/50 mt-1">
                {locale === 'hu'
                  ? 'Ha üresen hagyod, az admin email címre megy (info@hotel-trust.site)'
                  : 'Wenn leer, wird an die Admin-Adresse (info@hotel-trust.site) gesendet'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {locale === 'hu' ? 'Küldés...' : 'Senden...'}
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  {locale === 'hu' ? 'Teszt email küldése' : 'Test-E-Mail senden'}
                </>
              )}
            </button>
          </form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold mb-1">{result.message}</p>
                  {result.details && (
                    <p className="text-sm mt-1 opacity-90">
                      <strong>{locale === 'hu' ? 'Részletek:' : 'Details:'}</strong> {result.details}
                    </p>
                  )}
                  {result.hint && (
                    <p className="text-sm mt-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>{locale === 'hu' ? 'Tipp:' : 'Hinweis:'}</strong> {result.hint}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-foreground/60 text-center">
              {locale === 'hu'
                ? 'Ez az oldal a /api/test-email endpointot hívja, ugyanazzal a Gmail SMTP konfigurációval, mint az audit és a várólista értesítések.'
                : 'Diese Seite ruft den /api/test-email Endpoint auf, mit derselben Gmail-SMTP-Konfiguration wie Audit- und Wartelisten-Benachrichtigungen.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

