'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check, Sparkles, MessageSquare, Globe, ArrowRight, Loader2, ChevronDown } from 'lucide-react';
import WaitlistPopup from '@/components/WaitlistPopup';
import { useEffect } from 'react';

export default function WaitlistPage() {
  const t = useTranslations('waitlist');
  const locale = useLocale();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | undefined>(undefined);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DEBUG WAITLIST] handleSubmit start', { email, hotelName, locale });
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          hotelName,
          locale,
        }),
      });

      const data = await response.json();
      console.log('[DEBUG WAITLIST] /api/waitlist response', { status: response.status, data });

      if (response.ok) {
        setEmail('');
        setHotelName('');
        
        // Fetch updated count
        try {
          const countResponse = await fetch('/api/waitlist/count');
          if (countResponse.ok) {
            const countData = await countResponse.json();
            setWaitlistCount(countData.count);
          }
        } catch (countError) {
          console.warn('[DEBUG WAITLIST] Error fetching updated count:', countError);
        }
        
        // Show popup - delay to let Framer Motion animations settle
        // Use requestAnimationFrame to ensure DOM is stable
        console.log('[DEBUG WAITLIST] Opening WaitlistPopup');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setShowWaitlistPopup(true);
          });
        });
      } else {
        setError(data.error || t('form.error'));
      }
    } catch (error) {
      console.error('[DEBUG WAITLIST] Submit error', error);
      setError(t('form.error'));
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background" id="top">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-20 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Alpesi osztrák hegyi táj"
            fill
            priority
            className="object-cover"
            quality={90}
          />
          {/* Mesh gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(26,115,232,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.1)_0%,transparent_50%)] blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-balance mb-4 sm:mb-6 text-white drop-shadow-lg px-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)' }}>
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-3 sm:mb-4 text-white drop-shadow-md px-2" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)' }}>
              {t('hero.subtitle')}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-12 max-w-2xl mx-auto drop-shadow-md px-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {t('hero.description')}
            </p>

            {/* CTA Form – ugyanaz a submit logika, mint a debug oldalon */}
            <div id="hero-form" className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder={t('form.hotelNamePlaceholder')}
                    required
                    className="w-full px-6 py-4 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('form.emailPlaceholder')}
                    required
                    className="w-full px-6 py-4 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('form.submit')}
                    </>
                  ) : (
                    <>
                      {t('form.submit')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}
              </form>
            </div>

            <p className="mt-6 text-sm text-white/80 drop-shadow-md" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {t('hero.cta')}
            </p>
          </motion.div>
        </div>
      </section>

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
          {/* Modern, elegáns felirat */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 sm:mb-12"
          >
            {t('compatible.title')}
          </motion.h3>
          
          {/* Logó carousel: Folyamatos scroll animáció egy sorban */}
          <div className="overflow-hidden">
            <div className="animate-scroll flex items-center gap-8 md:gap-12 lg:gap-16 opacity-40 grayscale">
              {/* Első sor */}
              <div className="flex items-center gap-8 md:gap-12 lg:gap-16 flex-shrink-0">
                <img src="https://www.vectorlogo.zone/logos/google/google-ar21.svg" alt="Google" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/tripadvisor/tripadvisor-ar21.svg" alt="TripAdvisor" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/booking/booking-ar21.svg" alt="Booking.com" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" alt="OpenAI" className="h-8 md:h-10 w-auto object-contain flex-shrink-0" />
                <img src="/logos/perplexity.svg" alt="Perplexity" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
                <img src="https://www.vectorlogo.zone/logos/bing/bing-ar21.svg" alt="Bing" className="h-12 md:h-14 w-auto object-contain flex-shrink-0" />
              </div>
              {/* Második sor - duplikálva a folyamatos animációhoz */}
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
            {/* Bal oldal: Szöveg - középre igazítva */}
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

            {/* Jobb oldal: AI Mockup - kocka formájú */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 md:order-2 max-w-md mx-auto md:mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 aspect-square flex flex-col justify-between">
                {/* ChatGPT-style mockup */}
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  {/* User message */}
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
                  {/* AI response */}
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

      {/* Footer CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {t('hero.cta')}
          </h2>
          <button
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
            className="inline-block mt-4 sm:mt-6 bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg cursor-pointer"
          >
            {t('form.submit')}
          </button>
        </div>
        {/* Footer links: Impressum/Datenschutz és nyelvválasztó */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/70">
            {/* Impressum és Datenschutz - mindkét verzióban */}
            <a href={`/${locale}/impressum`} className="hover:text-white transition-colors">
              {t('footer.impressum')}
            </a>
            <a href={`/${locale}/datenschutz`} className="hover:text-white transition-colors">
              {t('footer.datenschutz')}
            </a>
            <span className="text-white/30">|</span>
            {/* Nyelvválasztó - mindig látható */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href={pathname}
                locale="hu"
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-all ${
                  locale === 'hu' 
                    ? 'text-white font-semibold bg-white/20' 
                    : 'hover:text-white hover:bg-white/10'
                }`}
              >
                HU
              </Link>
              <span className="text-white/30">/</span>
              <Link
                href={pathname}
                locale="de"
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-all ${
                  locale === 'de' 
                    ? 'text-white font-semibold bg-white/20' 
                    : 'hover:text-white hover:bg-white/10'
                }`}
              >
                DE
              </Link>
            </div>
          </div>
          {/* Copyright */}
          <div className="mt-6 sm:mt-8 text-center text-[10px] sm:text-xs text-white/50">
            {t('footer.copyright')}
          </div>
        </div>
      </section>

      {/* Waitlist Popup */}
      <WaitlistPopup
        isOpen={showWaitlistPopup}
        onClose={() => setShowWaitlistPopup(false)}
        waitlistCount={waitlistCount}
      />
    </div>
  );
}
