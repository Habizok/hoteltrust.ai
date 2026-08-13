'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, TrendingDown, Lightbulb, Copy, CheckCircle, Loader2, ArrowRight, ChevronDown } from 'lucide-react';
import WaitlistPopup from '@/components/WaitlistPopup';

export default function AuditResultPage() {
  const t = useTranslations('audit');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const auditId = params.id as string;
  
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [copiedReply, setCopiedReply] = useState(false);
  const [expandedSampleReply, setExpandedSampleReply] = useState(false);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | undefined>(undefined);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [email, setEmail] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Single useEffect for all data fetching
  useEffect(() => {
    if (!auditId || typeof auditId !== 'string') {
      setError(locale === 'hu' ? 'Érvénytelen audit azonosító' : 'Ungültige Analyse-ID');
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Fetch both audit and waitlist count in parallel
    const fetchAllData = async () => {
      try {
        const [auditResponse, waitlistResponse] = await Promise.all([
          fetch(`/api/audit/${auditId}`),
          fetch('/api/waitlist/count')
        ]);

        if (cancelled) return;

        // Handle audit response
        if (!auditResponse.ok) {
          if (auditResponse.status === 404) {
            setError(locale === 'hu' ? 'Az audit nem található' : 'Analyse nicht gefunden');
          } else {
            setError(locale === 'hu' ? 'Hiba történt az audit betöltése során' : 'Fehler beim Laden der Analyse');
          }
          setLoading(false);
          return;
        }

        const auditData = await auditResponse.json();
        if (cancelled) return;

        setAuditResult(auditData);
        
        // Set email and hotel name from audit result for waitlist
        if (auditData.email) {
          setEmail(auditData.email);
          console.log('[AUDIT] Email set from audit data:', auditData.email);
        } else {
          console.warn('[AUDIT] No email in audit data:', auditData);
        }
        if (auditData.hotel?.name) {
          setHotelName(auditData.hotel.name);
          console.log('[AUDIT] Hotel name set from audit data:', auditData.hotel.name);
        } else {
          console.warn('[AUDIT] No hotel name in audit data:', auditData);
        }

        // Handle waitlist count response (non-critical, don't block on error)
        if (waitlistResponse.ok) {
          try {
            const waitlistData = await waitlistResponse.json();
            if (!cancelled) {
              setWaitlistCount(waitlistData.count);
            }
          } catch (err) {
            // Silently fail for waitlist count
            console.warn('Error parsing waitlist count:', err);
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching data:', err);
        setError(locale === 'hu' ? 'Hiba történt az audit betöltése során' : 'Fehler beim Laden der Analyse');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllData();

    return () => {
      cancelled = true;
    };
  }, [auditId, locale]);

  const copyReply = () => {
    if (auditResult?.analysis?.sampleReply) {
      navigator.clipboard.writeText(auditResult.analysis.sampleReply);
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2000);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback: create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setLinkCopied(true);
        setTimeout(() => {
          setLinkCopied(false);
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textarea);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">{locale === 'hu' ? 'Audit betöltése...' : 'Analyse wird geladen...'}</p>
        </div>
      </div>
    );
  }

  if (error || !auditResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-blue-50/20 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {locale === 'hu' ? 'Audit nem található' : 'Analyse nicht gefunden'}
          </h1>
          <p className="text-gray-600 mb-6">{error || (locale === 'hu' ? 'Az audit nem található vagy lejárt.' : 'Die Analyse wurde nicht gefunden oder ist abgelaufen.')}</p>
          <button
            onClick={() => router.push(`/${locale}/free-audit`)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            {locale === 'hu' ? 'Új audit indítása' : 'Neue Analyse starten'}
          </button>
        </div>
      </div>
    );
  }

  // Helper functions for Trust Score colors
  // Unified color logic for all Trust Score elements
  const getTrustScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-400';
  };

  const getTrustScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-400';
  };

  const getTrustScoreStrokeColor = (score: number) => {
    if (score >= 70) return '#10b981'; // green-500
    if (score >= 50) return '#f59e0b'; // yellow-500
    return '#f87171'; // red-400 (halványabb piros)
  };

  // Simple format function (no useMemo needed for simple transformation)
  const formatAuditResults = () => {
    if (!auditResult?.analysis) return null;
    
    const analysis = auditResult.analysis;
    return {
      trustScore: analysis.trustScore || 0,
      aiVisibility: analysis.aiVisibility ? [
        { platform: 'ChatGPT', visible: analysis.aiVisibility.chatgpt?.visible || false, position: analysis.aiVisibility.chatgpt?.position || null },
        { platform: 'Gemini', visible: analysis.aiVisibility.gemini?.visible || false, position: analysis.aiVisibility.gemini?.position || null },
        { platform: 'Bing', visible: analysis.aiVisibility.bing?.visible || false, position: analysis.aiVisibility.bing?.position || null },
      ] : [],
      unansweredReviews: analysis.unansweredReviews || 0,
      totalReviews: analysis.totalReviews,
      answeredReviews: analysis.answeredReviews,
      sampleReply: analysis.sampleReply || '',
      criticalIssues: analysis.criticalIssues || [],
      recommendations: analysis.recommendations || [],
      revenueLoss: analysis.revenueLoss || '10-15%',
    };
  };

  const auditResults = formatAuditResults();

  if (!auditResults) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-blue-50/20 relative overflow-hidden">
      {/* Animated blur orbs - Purple left, Gray right - Full page background */}
      <motion.div
        className="fixed top-20 left-10 w-[32rem] h-[32rem] bg-purple-400/70 rounded-full blur-3xl pointer-events-none"
        animate={{
          y: [0, -30, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ zIndex: 0 }}
      />
      <motion.div
        className="fixed top-20 right-10 w-[36rem] h-[36rem] bg-gray-400/70 rounded-full blur-3xl pointer-events-none"
        animate={{
          y: [0, 30, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
        style={{ zIndex: 0 }}
      />
      
      <WaitlistPopup 
        isOpen={showWaitlistPopup}
        onClose={() => setShowWaitlistPopup(false)}
        waitlistCount={waitlistCount}
      />
      
      {/* Success Message Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSuccessMessage(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              {locale === 'hu' ? 'Sikeres feliratkozás!' : 'Erfolgreich angemeldet!'}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {locale === 'hu' 
                ? 'Átirányítjuk az audit oldalra...' 
                : 'Wir leiten Sie zur Audit-Seite weiter...'}
            </p>
            <button
              onClick={() => {
                setShowSuccessMessage(false);
                router.push(`/${locale}/free-audit`);
              }}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              {locale === 'hu' ? 'Rendben' : 'OK'}
            </button>
          </div>
        </div>
      )}
      
      {/* Hero Section with Results - Light Theme */}
      <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/20 to-blue-50/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08)_0%,transparent_50%)]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Main White Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 lg:p-10 relative z-10"
          >
            {/* Header with 3 columns: Title+Hotel | Trust Score | Share Button */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center mb-8 gap-6">
              {/* Left: Audit Eredmény + Hotel Name */}
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {locale === 'hu' ? 'Audit Eredmény' : 'Analyse-Ergebnis'}
                </h1>
                {auditResult?.hotel?.name && (
                  <p className="text-lg md:text-xl text-gray-700 font-medium">
                    {auditResult.hotel.name}
                  </p>
                )}
              </div>
              
              {/* Center: Trust Score */}
              <div className="text-center">
                <h3 className="text-gray-700 text-sm font-medium mb-3">{t('result.trustScore')}</h3>
                <div className="flex flex-col items-center justify-center gap-4">
                  {/* Circular Progress */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32">
                    <svg className="transform -rotate-90 w-full h-full">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke={getTrustScoreStrokeColor(auditResults.trustScore)}
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: auditResults.trustScore / 100 }}
                        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
                        className={`text-3xl md:text-4xl font-bold ${getTrustScoreColor(auditResults.trustScore)}`}
                      >
                        {auditResults.trustScore}
                      </motion.div>
                      <div className="text-gray-500 text-xs">/ 100</div>
                    </div>
                  </div>
                  <div className="text-gray-600 text-xs">
                    {auditResults.trustScore >= 70 
                      ? (locale === 'hu' ? 'Kiváló' : 'Ausgezeichnet')
                      : auditResults.trustScore >= 50
                      ? (locale === 'hu' ? 'Közepes' : 'Durchschnittlich')
                      : (locale === 'hu' ? 'Javítandó' : 'Verbesserungswürdig')}
                  </div>
                </div>
              </div>
              
              {/* Right: Link másolása */}
              <div className="text-center">
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all border border-gray-200"
                >
                  {linkCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{locale === 'hu' ? 'Másolva!' : 'Kopiert!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">{locale === 'hu' ? 'Link másolása' : 'Link kopieren'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content inside card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
            
            {/* Social Proof Badge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-gray-700 font-medium text-sm">
                {locale === 'hu' 
                  ? 'Már 150+ hotel használja a Trusthotel-t'
                  : 'Bereits 150+ Hotels nutzen Trusthotel'}
              </span>
            </div>

            {/* Revenue Loss Badge */}
            {auditResults.revenueLoss && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <div className="text-gray-700 font-semibold text-sm mb-1">{t('result.revenueLoss')}</div>
                  <div className="text-red-600 text-2xl font-bold">{auditResults.revenueLoss}</div>
                </div>
              </div>
            )}

            {/* Critical Issues - Expandable */}
            {auditResults.criticalIssues && auditResults.criticalIssues.length > 0 && (
              <div className="bg-red-50 rounded-lg p-5 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h4 className="text-gray-900 font-semibold text-base">{t('result.criticalIssues')}</h4>
                </div>
                <ul className="space-y-3">
                  {auditResults.criticalIssues.map((issue: string, idx: number) => {
                    const isExpanded = expandedIssues.has(idx);
                    return (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                        className="bg-white rounded-lg p-3 border border-red-200"
                      >
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedIssues);
                            if (isExpanded) {
                              newExpanded.delete(idx);
                            } else {
                              newExpanded.add(idx);
                            }
                            setExpandedIssues(newExpanded);
                          }}
                          className="w-full flex items-start gap-3 text-left"
                        >
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-900 font-medium text-sm leading-relaxed block">{issue}</span>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-white/70 text-xs mt-2 leading-relaxed space-y-1"
                              >
                                <p>{t('result.issueTip')}</p>
                                {issue.includes('helyen szerepel') && (
                                  <p className="text-white/80 font-medium mt-2">
                                    {locale === 'hu' 
                                      ? '💡 Első helyre kerüléshez: válaszolj minden véleményre 24 órán belül, növeld a pozitív vélemények arányát, és add hozzá a strukturált adatokat (Schema.org) a weboldalhoz.'
                                      : '💡 Um auf Platz 1 zu kommen: Beantworten Sie alle Bewertungen innerhalb von 24 Stunden, erhöhen Sie den Anteil positiver Bewertungen und fügen Sie strukturierte Daten (Schema.org) zur Website hinzu.'}
                                  </p>
                                )}
                                {issue.includes('nem ajánlja') && (
                                  <p className="text-gray-700 font-medium mt-2">
                                    {locale === 'hu'
                                      ? '💡 Az AI ajánlásokban való megjelenéshez: válaszolj a véleményekre, növeld az értékeléseket, és biztosítsd, hogy a weboldalad tartalmaz strukturált adatokat (Schema.org).'
                                      : '💡 Um in den KI-Empfehlungen zu erscheinen: Beantworten Sie Bewertungen, erhöhen Sie die Bewertungen und stellen Sie sicher, dass Ihre Website strukturierte Daten (Schema.org) enthält.'}
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-red-500 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Three Column Dashboard - Light Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* AI Visibility */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-3 text-sm">{t('result.aiVisibility')}</h4>
                <div className="space-y-3">
                  {auditResults.aiVisibility.map((item: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between relative"
                      onMouseEnter={() => setHoveredPlatform(item.platform)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                    >
                      <span className="text-gray-700 font-medium text-xs">{item.platform}</span>
                      <div className="flex items-center gap-2 relative">
                        {item.visible ? (
                          <>
                            <span className="text-gray-600 text-xs font-semibold">
                              {item.position 
                                ? (locale === 'hu' 
                                    ? `${item.position}. hely` 
                                    : `${item.position}. Platz`)
                                : (locale === 'hu' ? 'Látható' : 'Sichtbar')}
                            </span>
                            {item.position === 1 ? (
                              <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                                <span className="text-black text-[10px] font-bold">1</span>
                              </div>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                            {hoveredPlatform === item.platform && item.position && (
                              <div className="absolute right-0 top-6 z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700 whitespace-nowrap">
                                {locale === 'hu'
                                  ? `Átlagos pozíció ${item.position}. hely 10 különböző kérdés alapján (5 magyar + 5 német)`
                                  : `Durchschnittliche Position ${item.position}. Platz basierend auf 10 verschiedenen Fragen (5 ungarisch + 5 deutsch)`}
                                <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"></div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500 text-xs">
                              {locale === 'hu' ? 'Nem látható' : 'Nicht sichtbar'}
                            </span>
                            <XCircle className="w-4 h-4 text-red-500" />
                            {hoveredPlatform === item.platform && (
                              <div className="absolute right-0 top-6 z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700 whitespace-nowrap">
                                {locale === 'hu'
                                  ? 'Az AI nem találta a hotelt a tesztelt kérdésekben'
                                  : 'Die KI hat das Hotel in den getesteten Fragen nicht gefunden'}
                                <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"></div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reputation */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-3 text-sm">{t('result.reputation')}</h4>
                <div className="space-y-2">
                  {auditResults.unansweredReviews === 0 || (typeof auditResults.unansweredReviews === 'number' && auditResults.unansweredReviews === 0) ? (
                    <div className="text-red-600 font-medium text-xs">
                      {locale === 'hu' ? 'Egyetlen véleményt sem válaszoltál meg.' : 'Sie haben keine einzige Bewertung beantwortet.'}
                    </div>
                  ) : auditResults.totalReviews && auditResults.answeredReviews !== undefined ? (
                    <>
                      <div className="text-gray-700 font-medium text-xs">
                        {locale === 'hu' 
                          ? `${auditResults.totalReviews} véleményből ${auditResults.answeredReviews}-öt válaszoltál meg.`
                          : `Von ${auditResults.totalReviews} Bewertungen haben Sie ${auditResults.answeredReviews} beantwortet.`}
                      </div>
                      <div className="text-red-600 font-medium text-xs">
                        {locale === 'hu'
                          ? '⚠️ Ez nem jó! Az AI ezt alacsony szolgáltatási minőségként értékeli, és kevesebbszer fogja ajánlani a szállodádat.'
                          : '⚠️ Das ist nicht gut! Die KI bewertet dies als niedrige Servicequalität und wird Ihr Hotel seltener empfehlen.'}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-700 font-medium text-xs">
                      {typeof auditResults.unansweredReviews === 'string' 
                        ? `${auditResults.unansweredReviews} ${t('result.unansweredReviews')}`
                        : `${auditResults.unansweredReviews} ${t('result.unansweredReviews')}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Sample Reply */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-green-600 font-semibold text-xs">{t('result.sampleReply')}</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyReply}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                      title={t('result.copyReply')}
                    >
                      {copiedReply ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    {auditResults.sampleReply.length > 150 && (
                      <button
                        onClick={() => setExpandedSampleReply(!expandedSampleReply)}
                        className="text-gray-600 hover:text-gray-900 text-xs flex items-center gap-1"
                      >
                        {expandedSampleReply 
                          ? (locale === 'hu' ? 'Összecsukás' : 'Weniger')
                          : (locale === 'hu' ? 'Több' : 'Mehr')}
                        <ChevronDown className={`w-3 h-3 transition-transform ${expandedSampleReply ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
                <p className={`text-gray-700 font-medium text-xs leading-relaxed ${expandedSampleReply ? '' : 'line-clamp-4'}`}>
                  {auditResults.sampleReply}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            {auditResults.recommendations && auditResults.recommendations.length > 0 && (
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-green-500" />
                  <h4 className="text-gray-900 font-semibold text-base">{t('result.recommendations')}</h4>
                </div>
                <ul className="space-y-3">
                  {auditResults.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium text-sm leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA Button */}
            <motion.button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('[AUDIT CTA] Button clicked, email:', email, 'hotelName:', hotelName);
                
                // Email should already be set from audit data
                if (!email) {
                  console.warn('[AUDIT CTA] Email not found');
                  setError(locale === 'hu' ? 'Email cím nem található. Kérjük, próbáld újra.' : 'E-Mail-Adresse nicht gefunden. Bitte versuchen Sie es erneut.');
                  return;
                }
                
                if (!hotelName) {
                  console.warn('[AUDIT CTA] Hotel name not found');
                  setError(locale === 'hu' ? 'Hotel név nem található. Kérjük, próbáld újra.' : 'Hotel-Name nicht gefunden. Bitte versuchen Sie es erneut.');
                  return;
                }
                
                console.log('[AUDIT CTA] Starting subscription...');
                setIsSubscribing(true);
                try {
                  const response = await fetch('/api/waitlist', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      email: email,
                      hotelName: hotelName,
                      locale,
                    }),
                  });

                  const data = await response.json();

                  if (response.ok) {
                    // Fetch updated count
                    const countResponse = await fetch('/api/waitlist/count');
                    if (countResponse.ok) {
                      const countData = await countResponse.json();
                      setWaitlistCount(countData.count);
                    }
                    
                    // Show success message
                    setShowSuccessMessage(true);
                    
                    // Redirect to free audit page after 2 seconds
                    setTimeout(() => {
                      router.push(`/${locale}/free-audit`);
                    }, 2000);
                  } else {
                    setError(data.error || (locale === 'hu' ? 'Hiba történt a feliratkozás során' : 'Fehler bei der Anmeldung'));
                  }
                } catch (error) {
                  setError(locale === 'hu' ? 'Hiba történt a feliratkozás során' : 'Fehler bei der Anmeldung');
                } finally {
                  setIsSubscribing(false);
                }
              }}
              disabled={isSubscribing || !hotelName || !email}
              title={!email || !hotelName ? (locale === 'hu' ? `Hiányzó adatok: ${!email ? 'email' : ''} ${!hotelName ? 'hotel név' : ''}` : `Fehlende Daten: ${!email ? 'E-Mail' : ''} ${!hotelName ? 'Hotel Name' : ''}`) : ''}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              animate={{
                boxShadow: [
                  '0 10px 25px rgba(37, 99, 235, 0.3)',
                  '0 10px 35px rgba(147, 51, 234, 0.4)',
                  '0 10px 25px rgba(37, 99, 235, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {isSubscribing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {locale === 'hu' ? 'Feliratkozás...' : 'Anmeldung...'}
                </>
              ) : (
                <>
                  {t('result.cta')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
