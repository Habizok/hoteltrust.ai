'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, MessageSquare, Globe, ArrowRight, Loader2, ChevronDown, CheckCircle2, XCircle, AlertTriangle, TrendingDown, Lightbulb, Copy, CheckCircle } from 'lucide-react';
import WaitlistPopup from '@/components/WaitlistPopup';
import { useRouter } from 'next/navigation';

type AuditStep = 'hotel' | 'email' | 'processing' | 'result';

export default function FreeAuditPage() {
  const t = useTranslations('audit');
  const locale = useLocale();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState<AuditStep>('hotel');
  const [email, setEmail] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [hotelPlaceId, setHotelPlaceId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Array<{id: string, name: string, address: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [copiedReply, setCopiedReply] = useState(false);
  const [expandedSampleReply, setExpandedSampleReply] = useState(false);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | undefined>(undefined);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const router = useRouter();
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Mock audit results
  const [auditResults, setAuditResults] = useState<{
    trustScore: number;
    aiVisibility: { platform: string; visible: boolean; position: number | null }[];
    unansweredReviews: number | string; // Can be number or "20+"
    totalReviews?: number; // Total reviews from Google
    answeredReviews?: number; // Number of answered reviews
    sampleReply: string;
    criticalIssues: string[];
    recommendations: string[];
    revenueLoss: string;
  } | null>(null);

  const processingSteps = [
    t('form.processingSteps.step1'),
    t('form.processingSteps.step2'),
    t('form.processingSteps.step3'),
    t('form.processingSteps.step4'),
    t('form.processingSteps.step5'),
  ];

  // Fetch waitlist count
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('/api/waitlist/count');
        if (response.ok) {
          const data = await response.json();
          setWaitlistCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching waitlist count:', error);
      }
    };
    fetchWaitlistCount();
  }, []);

  // Fetch autocomplete suggestions from Google Places API
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (hotelName.length < 2) {
        setAutocompleteSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/places/autocomplete?query=${encodeURIComponent(hotelName)}&locale=${locale}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log('[AUTOCOMPLETE] Success:', data);
          setAutocompleteSuggestions(data.places || []);
          if (data.places && data.places.length > 0) {
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        } else {
          console.error('[AUTOCOMPLETE] API Error:', data);
          setAutocompleteSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('[AUTOCOMPLETE] Network error:', error);
        setAutocompleteSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [hotelName, locale]);

  // Handle hotel selection
  const handleHotelSelect = (place: {id: string, name: string, address: string}) => {
    setHotelName(place.name);
    setHotelPlaceId(place.id);
    setShowSuggestions(false);
    setAutocompleteSuggestions([]);
  };

  const handleHotelNext = () => {
    if (hotelName.trim()) {
      setCurrentStep('email');
    }
  };

  // Handle email submission and start audit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !hotelName) {
      setError(locale === 'hu' ? 'Kérjük, töltse ki az összes mezőt' : 'Bitte füllen Sie alle Felder aus');
      return;
    }
    
    setError('');
    setCurrentStep('processing');
    setProgress(0);
    setCurrentProcessingStep(0);

    // Töröljük az előző intervalt, ha van
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Progress animation - 30 másodperc alatt éri el a 100%-ot
    startTimeRef.current = Date.now();
    const duration = 30000; // 30 másodperc
    
    progressIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, 50); // 50ms-onként frissítünk a simább animációért

    // Change processing step text every 2 seconds
    const stepInterval = setInterval(() => {
      setCurrentProcessingStep((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    try {
      // Call the API
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelName,
          email,
          hotelPlaceId,
          locale,
        }),
      });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API error');
      }

      const data = await response.json();
      
      // Complete progress (ha még nem ért el 100%-ra, akkor ugrik oda)
      setProgress(100);

      // Format results
      const analysis = data.data?.analysis || {};
      
      // Handle unansweredReviews - can be number or "20+"
      const unansweredReviews = analysis.unansweredReviews;
      const unansweredDisplay = typeof unansweredReviews === 'string' 
        ? unansweredReviews 
        : unansweredReviews > 20 
          ? '20+' 
          : unansweredReviews || 0;
      
      setAuditResults({
        trustScore: analysis.trustScore || 64,
        aiVisibility: [
          { 
            platform: 'ChatGPT', 
            visible: analysis.aiVisibility?.chatgpt?.visible || false,
            position: analysis.aiVisibility?.chatgpt?.position || null
          },
          { 
            platform: 'Gemini', 
            visible: analysis.aiVisibility?.gemini?.visible || false,
            position: analysis.aiVisibility?.gemini?.position || null
          },
          { 
            platform: 'Bing', 
            visible: analysis.aiVisibility?.bing?.visible || false,
            position: analysis.aiVisibility?.bing?.position || null
          },
        ],
        unansweredReviews: unansweredDisplay,
        totalReviews: analysis.totalReviews,
        answeredReviews: analysis.answeredReviews,
        sampleReply: analysis.sampleReply || (locale === 'hu' 
          ? 'Köszönjük a visszajelzését! Sajnáljuk, hogy nem volt elégedett a szolgáltatásunkkal. Visszajelzését továbbítottuk a megfelelő részlegnek, és dolgozunk azon, hogy javítsunk a jövőben. Reméljük, hogy legközelebb jobb élményben lesz része.'
          : 'Vielen Dank für Ihr Feedback! Es tut uns leid, dass Sie mit unserem Service nicht zufrieden waren. Wir haben Ihr Feedback an die zuständige Abteilung weitergeleitet und arbeiten daran, uns zu verbessern. Wir hoffen, dass Sie beim nächsten Mal eine bessere Erfahrung machen werden.'),
        criticalIssues: analysis.criticalIssues || [],
        recommendations: analysis.recommendations || [],
        revenueLoss: analysis.revenueLoss || '10-15%',
      });

      // Small delay before showing results
      setTimeout(() => {
        setCurrentStep('result');
      }, 500);
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      clearInterval(stepInterval);
      setError(error instanceof Error ? error.message : (locale === 'hu' ? 'Hiba történt' : 'Ein Fehler ist aufgetreten'));
      setCurrentStep('email');
      setProgress(0);
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: t('features.feature1.title'),
      description: t('features.feature1.description'),
    },
    {
      icon: Sparkles,
      title: t('features.feature2.title'),
      description: t('features.feature2.description'),
    },
    {
      icon: Globe,
      title: t('features.feature3.title'),
      description: t('features.feature3.description'),
    },
  ];

  const steps = [
    {
      number: '1',
      title: t('process.step1.title'),
      description: t('process.step1.description'),
    },
    {
      number: '2',
      title: t('process.step2.title'),
      description: t('process.step2.description'),
    },
    {
      number: '3',
      title: t('process.step3.title'),
      description: t('process.step3.description'),
    },
  ];

  const faqs = [
    {
      question: t('faq.q1.question'),
      answer: t('faq.q1.answer'),
    },
    {
      question: t('faq.q2.question'),
      answer: t('faq.q2.answer'),
    },
    {
      question: t('faq.q3.question'),
      answer: t('faq.q3.answer'),
    },
    {
      question: t('faq.q4.question'),
      answer: t('faq.q4.answer'),
    },
  ];

  // Unified color logic for all Trust Score elements (same as audit page)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-blue-50/20" id="top">
      {/* Hero Section with Light Theme */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/20 to-blue-50/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08)_0%,transparent_50%)]" />
          
          {/* Animated blur orbs - Purple left, Gray right - Only in hero section */}
          <motion.div
            className="absolute top-10 left-10 w-[32rem] h-[32rem] bg-purple-400/70 rounded-full blur-3xl pointer-events-none"
            animate={{
              y: [0, -30, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ zIndex: 1 }}
          />
          <motion.div
            className="absolute top-10 right-10 w-[36rem] h-[36rem] bg-gray-400/70 rounded-full blur-3xl pointer-events-none"
            animate={{
              y: [0, 30, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            style={{ zIndex: 1 }}
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">
                {locale === 'hu' ? 'Ingyenes & 1 perc alatt' : 'Kostenlos & in 1 Minute'}
              </span>
            </motion.div>
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-balance mb-6 text-gray-900 leading-tight">
              {locale === 'hu' ? (
                <>
                  Hogyan látja a{' '}
                  <span className="text-blue-600">mesterséges intelligencia</span>{' '}
                  a szállodádat?
                </>
              ) : (
                <>
                  Wie sieht die{' '}
                  <span className="text-blue-600">künstliche Intelligenz</span>{' '}
                  Ihr Hotel?
                </>
              )}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {locale === 'hu' 
                ? 'Ingyenes 1 perces AI elemzés, hogy megtudd, mit mond a mesterséges intelligencia a hotelekről.'
                : 'Kostenlose 1-minütige KI-Analyse, um herauszufinden, was die künstliche Intelligenz über Hotels sagt.'}
            </p>
          </motion.div>

          {/* White Card with Stepper UI */}
          <motion.div
            id="hero-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10">
              {/* Progress Stepper - Light Theme */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep === 'hotel' ? 'bg-purple-700 text-white' : 
                    ['email', 'processing', 'result'].includes(currentStep) ? 'bg-purple-700 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {['email', 'processing', 'result'].includes(currentStep) ? <Check className="w-5 h-5" /> : '1'}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${
                    currentStep === 'hotel' ? 'text-gray-900' : 
                    ['email', 'processing', 'result'].includes(currentStep) ? 'text-gray-900' : 
                    'text-gray-500'
                  }`}>
                    {locale === 'hu' ? 'Adatok' : 'Daten'}
                  </span>
                </div>
                <div className="flex-1 h-0.5 mx-2 bg-gray-200">
                  <div className={`h-full transition-all duration-500 ${
                    ['email', 'processing', 'result'].includes(currentStep) ? 'bg-purple-700 w-full' : 'bg-transparent w-0'
                  }`} />
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep === 'email' ? 'bg-purple-700 text-white' : 
                    ['processing', 'result'].includes(currentStep) ? 'bg-purple-700 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {['processing', 'result'].includes(currentStep) ? <Check className="w-5 h-5" /> : '2'}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${
                    currentStep === 'email' ? 'text-gray-900' : 
                    ['processing', 'result'].includes(currentStep) ? 'text-gray-900' : 
                    'text-gray-500'
                  }`}>
                    {locale === 'hu' ? 'Elemzés' : 'Analyse'}
                  </span>
                </div>
                <div className="flex-1 h-0.5 mx-2 bg-gray-200">
                  <div className={`h-full transition-all duration-500 ${
                    ['processing', 'result'].includes(currentStep) ? 'bg-purple-700 w-full' : 'bg-transparent w-0'
                  }`} />
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep === 'processing' ? 'bg-purple-700 text-white' : 
                    currentStep === 'result' ? 'bg-purple-700 text-white' : 
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep === 'result' ? <Check className="w-5 h-5" /> : '3'}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${
                    ['processing', 'result'].includes(currentStep) ? 'text-gray-900' : 
                    'text-gray-500'
                  }`}>
                    {locale === 'hu' ? 'Eredmény' : 'Ergebnis'}
                  </span>
                </div>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {currentStep === 'hotel' && (
                  <motion.div
                    key="hotel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          {locale === 'hu' ? 'Hotel neve' : 'Hotelname'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={hotelName}
                            onChange={(e) => {
                              setHotelName(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => {
                              if (autocompleteSuggestions.length > 0) {
                                setShowSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow click on suggestion
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && hotelName.trim()) {
                                e.preventDefault();
                                handleHotelNext();
                              }
                            }}
                            placeholder={locale === 'hu' ? 'Kezdje el gépelni a szálloda nevét...' : 'Beginnen Sie mit der Eingabe des Hotelnamens...'}
                            className="w-full px-6 py-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                          {/* Google Places Autocomplete suggestions */}
                          {showSuggestions && autocompleteSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-gray-200 shadow-2xl max-h-60 overflow-y-auto">
                              {isLoadingSuggestions ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                  {locale === 'hu' ? 'Keresés...' : 'Suche...'}
                                </div>
                              ) : (
                                <div className="py-1">
                                  {autocompleteSuggestions.map((place) => (
                                    <button
                                      key={place.id}
                                      type="button"
                                      onClick={() => handleHotelSelect(place)}
                                      className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="font-semibold text-gray-900 text-sm">{place.name}</div>
                                      {place.address && (
                                        <div className="text-xs text-gray-500 mt-0.5">{place.address}</div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleHotelNext}
                        disabled={!hotelName.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        {locale === 'hu' ? 'Tovább az elemzéshez' : 'Weiter zur Analyse'}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'email' && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          {locale === 'hu' ? 'E-mail cím' : 'E-Mail-Adresse'}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={locale === 'hu' ? 'email@pelda.hu' : 'email@beispiel.de'}
                          required
                          className="w-full px-6 py-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {error && (
                        <p className="text-red-600 text-sm">{error}</p>
                      )}
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                      >
                        {locale === 'hu' ? 'AI-Audit indítása' : 'KI-Analyse starten'}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </form>
                  </motion.div>
                )}

                {currentStep === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Circular Progress Bar */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="transform -rotate-90 w-32 h-32">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100) }}
                            transition={{ duration: 0.3 }}
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2563eb" />
                              <stop offset="100%" stopColor="#9333ea" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
                        </div>
                      </div>
                      
                      {/* Dynamic Status Text */}
                      <motion.p
                        key={currentProcessingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-gray-700 text-lg font-medium mt-6 text-center"
                      >
                        {processingSteps[currentProcessingStep]}
                      </motion.p>

                      {/* Live Log */}
                      <div className="w-full bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-600 max-h-32 overflow-y-auto border border-gray-200">
                        <div className="space-y-1">
                          {currentProcessingStep >= 0 && (
                            <div className="opacity-80">{'>'} {locale === 'hu' ? 'Kapcsolódás a Google Maps adatbázisához...' : 'Verbinde mit Google Maps Datenbank...'}</div>
                          )}
                          {currentProcessingStep >= 1 && (
                            <div className="opacity-80">{'>'} {locale === 'hu' ? `Vendégvélemények kinyerése a(z) ${hotelName} számára...` : `Extrahiere Gästebewertungen für ${hotelName}...`}</div>
                          )}
                          {currentProcessingStep >= 2 && (
                            <div className="opacity-80">{'>'} {locale === 'hu' ? 'AI elemzés indítása a GPT-4o-val...' : 'Starte KI-Analyse mit GPT-4o...'}</div>
                          )}
                          {currentProcessingStep >= 3 && (
                            <div className="opacity-80">{'>'} {locale === 'hu' ? 'Láthatósági pontszám kalkulálása...' : 'Berechne Sichtbarkeits-Score...'}</div>
                          )}
                          {currentProcessingStep >= 4 && (
                            <div className="text-green-600">{'>'} {locale === 'hu' ? 'Kész!' : 'Fertig!'}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'result' && auditResults && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Trust Score - Enhanced Visualization with Circular Progress */}
                    <div className="text-center">
                      <h3 className="text-gray-700 text-sm font-medium mb-4">{t('result.trustScore')}</h3>
                      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                        {/* Circular Progress */}
                        <div className="relative w-32 h-32 md:w-40 md:h-40">
                          <svg className="transform -rotate-90 w-full h-full">
                            {/* Background circle */}
                            <circle
                              cx="50%"
                              cy="50%"
                              r="45%"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                            />
                            {/* Progress circle */}
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
                          {/* Score text in center */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
                              className={`text-4xl md:text-5xl font-bold ${getTrustScoreColor(auditResults.trustScore)}`}
                            >
                              {auditResults.trustScore}
                            </motion.div>
                            <div className="text-gray-500 text-xs md:text-sm">/ 100</div>
                          </div>
                        </div>
                        
                        {/* Linear Progress Bar (for mobile clarity) */}
                        <div className="w-full md:w-64">
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${auditResults.trustScore}%` }}
                              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                              className={`h-full ${getTrustScoreBgColor(auditResults.trustScore)}`}
                            />
                          </div>
                          <div className="mt-2 text-gray-600 text-xs text-center">
                            {auditResults.trustScore >= 70 
                              ? (locale === 'hu' ? 'Kiváló' : 'Ausgezeichnet')
                              : auditResults.trustScore >= 50
                              ? (locale === 'hu' ? 'Közepes' : 'Durchschnittlich')
                              : (locale === 'hu' ? 'Javítandó' : 'Verbesserungswürdig')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
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

                    {/* Critical Issues - Expandable with Staggered Animation */}
                    {auditResults.criticalIssues && auditResults.criticalIssues.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-5 border-2 border-red-200">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <h4 className="text-gray-900 font-semibold text-base">{t('result.criticalIssues')}</h4>
                        </div>
                        <ul className="space-y-3">
                          {auditResults.criticalIssues.map((issue, idx) => {
                            const isExpanded = expandedIssues.has(idx);
                            return (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                layout={false}
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
                                        className="text-gray-600 text-xs mt-2 leading-relaxed space-y-1"
                                      >
                                        <p>{t('result.issueTip')}</p>
                                        {/* Show specific tip based on issue content */}
                                        {issue.includes('helyen szerepel') && (
                                          <p className="text-gray-700 font-medium mt-2">
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
                      {/* AI Visibility - with Tooltip */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-gray-900 font-semibold mb-3 text-sm">{t('result.aiVisibility')}</h4>
                        <div className="space-y-3">
                          {auditResults.aiVisibility.map((item, idx) => (
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
                                    {/* Tooltip */}
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
                                    {/* Tooltip for not visible */}
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

                      {/* Sample Reply with Copy Button - Expandable */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-green-600 font-semibold text-xs">{t('result.sampleReply')}</h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                await navigator.clipboard.writeText(auditResults.sampleReply);
                                setCopiedReply(true);
                                setTimeout(() => setCopiedReply(false), 2000);
                              }}
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
                          {auditResults.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 font-medium text-sm leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Button with Pulse Effect */}
                    <motion.button
                      onClick={async (e) => {
                        e.preventDefault();
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
                            
                            // Show success message modal (same as audit/[id] page)
                            setShowSuccessMessage(true);
                            
                            // Close modal after 3 seconds (we're already on free-audit page, no redirect needed)
                            setTimeout(() => {
                              setShowSuccessMessage(false);
                            }, 3000);
                          } else {
                            setError(data.error || (locale === 'hu' ? 'Hiba történt a feliratkozás során' : 'Fehler bei der Anmeldung'));
                          }
                        } catch (error) {
                          setError(locale === 'hu' ? 'Hiba történt a feliratkozás során' : 'Fehler bei der Anmeldung');
                        } finally {
                          setIsSubscribing(false);
                        }
                      }}
                      disabled={isSubscribing || !email || !hotelName}
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
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rest of the page remains the same */}
      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl text-center mb-10 sm:mb-12 md:mb-16 text-foreground"
          >
            {t('features.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-background border border-border rounded-lg p-6 sm:p-8 hover:shadow-xl hover:border-primary/30 transition-all transform hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground text-center">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-foreground/70 leading-relaxed text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Compatibility Section */}
      <section className="py-12 sm:py-16 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 sm:mb-12"
          >
            {t('compatible.title')}
          </motion.h3>
          
          <div className="overflow-hidden">
            <div className="animate-scroll flex items-center gap-8 md:gap-12 lg:gap-16 opacity-40 grayscale">
              <div className="flex items-center gap-8 md:gap-12 lg:gap-16 flex-shrink-0">
                <img src="https://www.vectorlogo.zone/logos/google/google-ar21.svg" alt="Google" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/tripadvisor/tripadvisor-ar21.svg" alt="TripAdvisor" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/booking/booking-ar21.svg" alt="Booking.com" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" alt="OpenAI" className="h-8 md:h-10 w-auto object-contain flex-shrink-0" />
                <img src="/logos/perplexity.svg" alt="Perplexity" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/bing/bing-ar21.svg" alt="Bing" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
              </div>
              <div className="flex items-center gap-8 md:gap-12 lg:gap-16 flex-shrink-0">
                <img src="https://www.vectorlogo.zone/logos/google/google-ar21.svg" alt="Google" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/tripadvisor/tripadvisor-ar21.svg" alt="TripAdvisor" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/booking/booking-ar21.svg" alt="Booking.com" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" alt="OpenAI" className="h-8 md:h-10 w-auto object-contain flex-shrink-0" />
                <img src="/logos/perplexity.svg" alt="Perplexity" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/bing/bing-ar21.svg" alt="Bing" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1 flex flex-col justify-center text-center"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
                {t('whyNow.title')}
              </h2>
              <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed">
                {t('whyNow.description')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 md:order-2 max-w-md mx-auto md:mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 aspect-square flex flex-col justify-between">
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">👤</span>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 flex items-center">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {locale === 'hu' 
                          ? 'Ajánlj egy jó hotelt Bécsben wellness-szel és 5 csillaggal!'
                          : 'Empfehlen Sie ein gutes Hotel in Wien mit Wellness und 5 Sternen!'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div className="flex-1 bg-primary/5 rounded-lg p-5 border border-primary/20 flex flex-col justify-center">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-xl">🏨</span>
                        <div className="flex-1">
                          <p className="text-base text-gray-900 font-semibold mb-2">
                            {locale === 'hu' 
                              ? 'Grand Hotel Vienna'
                              : 'Grand Hotel Wien'}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
                            <span className="text-sm text-gray-500">(4.8)</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {locale === 'hu' 
                          ? 'Kiváló választás Bécs központjában! 5 csillagos wellness hotel kiváló spa részleggel, fedett medencével és privát wellness szobákkal. Központi helyen, a legjobb éttermek és bevásárlóutcák közelében.'
                          : 'Ausgezeichnete Wahl im Zentrum Wiens! 5-Sterne Wellness-Hotel mit exzellenter Spa-Abteilung, Hallenbad und privaten Wellness-Räumen. Zentrale Lage, nah an den besten Restaurants und Einkaufsstraßen.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl text-center mb-10 sm:mb-12 md:mb-16 text-foreground"
          >
            {t('process.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                  {step.number}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground text-center">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-foreground/70 text-center">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl text-center mb-10 sm:mb-12 md:mb-16 text-foreground"
          >
            {t('faq.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all transform hover:-translate-y-1"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-background/50 transition-colors"
                  >
                    <h3 className="font-bold text-base sm:text-lg text-foreground pr-2 sm:pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-foreground/60 flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? 'auto' : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA - Light Theme */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-purple-50/30 to-blue-50/20">
        {/* Subtle gradient background with animated blur orbs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/20 to-blue-50/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08)_0%,transparent_50%)]" />
          
          {/* Animated blur orbs */}
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"
            animate={{
              y: [0, 20, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              {locale === 'hu' ? 'Ingyenes & 1 perc alatt' : 'Kostenlos & in 1 Minute'}
            </span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-4 sm:mb-6 text-gray-900 leading-tight"
          >
            {locale === 'hu' ? (
              <>
                Kezdje el az ingyenes auditat{' '}
                <span className="text-blue-600">most!</span>
              </>
            ) : (
              <>
                Starten Sie das kostenlose Audit{' '}
                <span className="text-blue-600">jetzt!</span>
              </>
            )}
          </motion.h2>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            {locale === 'hu' 
              ? 'Fedezze fel, hogyan látja a mesterséges intelligencia a szállodáját, és mit tehet a jobb eredményekért.'
              : 'Entdecken Sie, wie die künstliche Intelligenz Ihr Hotel sieht und was Sie für bessere Ergebnisse tun können.'}
          </motion.p>
          
          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={(e) => {
              e.preventDefault();
              const heroSection = document.getElementById('hero-form');
              if (heroSection) {
                heroSection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {locale === 'hu' ? 'AI-Audit indítása' : 'KI-Analyse starten'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

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
                ? 'Köszönjük a feliratkozást!' 
                : 'Vielen Dank für Ihre Anmeldung!'}
            </p>
            <button
              onClick={() => {
                setShowSuccessMessage(false);
              }}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              {locale === 'hu' ? 'Rendben' : 'OK'}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
            {/* Impressum és Datenschutz */}
            <Link href={`/${locale}/impressum`} className="hover:text-gray-900 transition-colors">
              {locale === 'hu' ? 'Impresszum' : 'Impressum'}
            </Link>
            <Link href={`/${locale}/datenschutz`} className="hover:text-gray-900 transition-colors">
              {locale === 'hu' ? 'Adatvédelem' : 'Datenschutz'}
            </Link>
            <span className="text-gray-300">|</span>
            {/* Nyelvválasztó */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href={pathname}
                locale="hu"
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-all ${
                  locale === 'hu' 
                    ? 'text-purple-700 font-semibold bg-purple-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                HU
              </Link>
              <span className="text-gray-300">/</span>
              <Link
                href={pathname}
                locale="de"
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-all ${
                  locale === 'de' 
                    ? 'text-purple-700 font-semibold bg-purple-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                DE
              </Link>
            </div>
          </div>
          {/* Copyright */}
          <div className="mt-6 sm:mt-8 text-center text-[10px] sm:text-xs text-gray-500">
            {locale === 'hu' 
              ? '© 2025 HotelTrust · Minden jog fenntartva.'
              : '© 2025 HotelTrust · Alle Rechte vorbehalten.'}
          </div>
        </div>
      </footer>

      {/* Waitlist Popup */}
      <WaitlistPopup
        isOpen={showWaitlistPopup}
        onClose={() => setShowWaitlistPopup(false)}
        waitlistCount={waitlistCount}
      />
    </div>
  );
}
