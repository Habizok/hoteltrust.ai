'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, XCircle, MapPin, Building2, Globe } from 'lucide-react';

export default function TestAIPage() {
  const [hotelName, setHotelName] = useState('');
  const [cityName, setCityName] = useState('');
  const [locale, setLocale] = useState<'hu' | 'de'>('hu');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !cityName) {
      setError(locale === 'hu' ? 'Kérlek add meg a hotel nevét és a várost!' : 'Bitte geben Sie den Hotelnamen und die Stadt ein!');
      return;
    }

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const response = await fetch('/api/test-ai-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelName,
          cityName,
          locale,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || (locale === 'hu' ? 'Hiba történt a teszt során' : 'Fehler beim Test'));
      }
    } catch (error) {
      console.error('Test error:', error);
      setError(locale === 'hu' ? 'Hiba történt a teszt során' : 'Fehler beim Test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">
            {locale === 'hu' ? 'AI Láthatóság Teszt' : 'KI-Sichtbarkeitstest'}
          </h1>
          <p className="text-foreground/60 text-sm sm:text-base">
            {locale === 'hu'
              ? 'Teszteld, hogy az AI milyen jól találja meg a hotelt'
              : 'Testen Sie, wie gut die KI das Hotel findet'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 border border-border"
        >
          <form onSubmit={handleTest} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="hotelName" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {locale === 'hu' ? 'Hotel neve' : 'Hotelname'}
              </label>
              <input
                type="text"
                id="hotelName"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder={locale === 'hu' ? 'pl. Hotel Sacher' : 'z.B. Hotel Sacher'}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="cityName" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {locale === 'hu' ? 'Város neve' : 'Stadtname'}
              </label>
              <input
                type="text"
                id="cityName"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder={locale === 'hu' ? 'pl. Salzburg' : 'z.B. Salzburg'}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="locale" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {locale === 'hu' ? 'Nyelv' : 'Sprache'}
              </label>
              <select
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'hu' | 'de')}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="hu">Magyar</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {locale === 'hu' ? 'Tesztelés...' : 'Testen...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {locale === 'hu' ? 'Teszt indítása' : 'Test starten'}
                </>
              )}
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {results && results.results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Gemini Results */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-border"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </span>
                  Gemini (Google AI)
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-background rounded-lg">
                    <span className="font-semibold text-foreground">{locale === 'hu' ? 'Összesített eredmény:' : 'Gesamtergebnis:'}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        results.results?.gemini?.visible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {results.results?.gemini?.visible ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {locale === 'hu' ? 'IGEN' : 'JA'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          {locale === 'hu' ? 'NEM' : 'NEIN'}
                        </span>
                      )}
                    </span>
                    {results.results?.gemini?.visible && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {locale === 'hu' ? 'Átlagos pozíció:' : 'Durchschnittliche Position:'} {results.results?.gemini?.position || 'N/A'}
                      </span>
                    )}
                  </div>
                  
                  {/* Individual Questions */}
                  <div className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold text-foreground">{locale === 'hu' ? 'Kérdések és válaszok:' : 'Fragen und Antworten:'}</h3>
                    <div className="space-y-4">
                      {(results.results?.gemini?.responses || []).map((item: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="border border-border rounded-lg p-4 sm:p-5 bg-background/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="font-semibold text-foreground mb-2">
                                {locale === 'hu' ? 'Kérdés' : 'Frage'} {index + 1}:
                              </div>
                              <div className="text-sm text-foreground/70 mb-3 italic">
                                "{item.question}"
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                item.visible
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.visible ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {locale === 'hu' ? 'Látható' : 'Sichtbar'}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  {locale === 'hu' ? 'Nem látható' : 'Nicht sichtbar'}
                                </span>
                              )}
                            </span>
                          </div>
                          {item.visible && (
                            <div className="mb-3 text-xs text-foreground/60 space-y-1">
                              <div>{locale === 'hu' ? 'Pozíció:' : 'Position:'} {item.position || 'N/A'}</div>
                              <div>{locale === 'hu' ? 'Megtalált név:' : 'Gefundener Name:'} {item.matchedName || 'N/A'}</div>
                            </div>
                          )}
                          <div className="bg-background p-3 sm:p-4 rounded-lg text-sm text-foreground/80 whitespace-pre-wrap max-h-64 overflow-y-auto border border-border">
                            {item.response || (locale === 'hu' ? 'Nincs válasz' : 'Keine Antwort')}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ChatGPT Results */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-border"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </span>
                  ChatGPT (OpenAI)
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-background rounded-lg">
                    <span className="font-semibold text-foreground">{locale === 'hu' ? 'Összesített eredmény:' : 'Gesamtergebnis:'}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        results.results?.chatgpt?.visible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {results.results?.chatgpt?.visible ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {locale === 'hu' ? 'IGEN' : 'JA'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          {locale === 'hu' ? 'NEM' : 'NEIN'}
                        </span>
                      )}
                    </span>
                    {results.results?.chatgpt?.visible && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {locale === 'hu' ? 'Átlagos pozíció:' : 'Durchschnittliche Position:'} {results.results?.chatgpt?.position || 'N/A'}
                      </span>
                    )}
                  </div>
                  
                  {/* Individual Questions */}
                  <div className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold text-foreground">{locale === 'hu' ? 'Kérdések és válaszok:' : 'Fragen und Antworten:'}</h3>
                    <div className="space-y-4">
                      {(results.results?.chatgpt?.responses || []).map((item: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="border border-border rounded-lg p-4 sm:p-5 bg-background/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="font-semibold text-foreground mb-2">
                                {locale === 'hu' ? 'Kérdés' : 'Frage'} {index + 1}:
                              </div>
                              <div className="text-sm text-foreground/70 mb-3 italic">
                                "{item.question}"
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                item.visible
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.visible ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {locale === 'hu' ? 'Látható' : 'Sichtbar'}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  {locale === 'hu' ? 'Nem látható' : 'Nicht sichtbar'}
                                </span>
                              )}
                            </span>
                          </div>
                          {item.visible && (
                            <div className="mb-3 text-xs text-foreground/60 space-y-1">
                              <div>{locale === 'hu' ? 'Pozíció:' : 'Position:'} {item.position || 'N/A'}</div>
                              <div>{locale === 'hu' ? 'Megtalált név:' : 'Gefundener Name:'} {item.matchedName || 'N/A'}</div>
                            </div>
                          )}
                          <div className="bg-background p-3 sm:p-4 rounded-lg text-sm text-foreground/80 whitespace-pre-wrap max-h-64 overflow-y-auto border border-border">
                            {item.response || (locale === 'hu' ? 'Nincs válasz' : 'Keine Antwort')}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
