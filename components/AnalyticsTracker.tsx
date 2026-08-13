'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { detectDevice } from '@/lib/deviceDetector';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pageStartTimeRef = useRef<number>(Date.now());
  const clicksRef = useRef<Array<{ element: string; page: string; timestamp: string }>>([]);
  const pagesViewedRef = useRef<Array<{ page: string; timestamp: string; duration: number }>>([]);
  const countryRef = useRef<string>('Ismeretlen');
  const countryCodeRef = useRef<string>('XX');

  // Initialize session ID once (nincs több külső IP alapú ország lekérdezés)
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = sessionStorage.getItem('analytics_session_id') || 
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionIdRef.current);
    }

    // Országot nem kérdezünk le külső szolgáltatásból – marad "Ismeretlen" / "XX"
    countryRef.current = 'Ismeretlen';
    countryCodeRef.current = 'XX';
  }, []);

  // Track page views on pathname change
  useEffect(() => {
    // Track new page view
    const pageViewStart = Date.now();
    pageStartTimeRef.current = pageViewStart;
    
    pagesViewedRef.current.push({
      page: pathname,
      timestamp: new Date().toISOString(),
      duration: 0, // Will be updated when leaving page
    });

    // Track clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Safely get className - it might be a string or SVGAnimatedString
      let className = '';
      if (target.className) {
        if (typeof target.className === 'string') {
          className = target.className.split(' ')[0];
        } else if (typeof target.className === 'object' && 'baseVal' in target.className) {
          // SVGAnimatedString case
          className = (target.className as any).baseVal?.split(' ')[0] || '';
        }
      }
      
      const element = target.tagName + (target.id ? `#${target.id}` : '') + (className ? `.${className}` : '');
      
      clicksRef.current.push({
        element: element.substring(0, 100), // Limit length
        page: pathname,
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener('click', handleClick);

    // Send analytics data periodically (every 30 seconds) and on page unload
    const sendAnalytics = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // Update last page view duration
      if (pagesViewedRef.current.length > 0) {
        const lastPage = pagesViewedRef.current[pagesViewedRef.current.length - 1];
        lastPage.duration = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      }

      // Detect device info
      const deviceInfo = detectDevice(navigator.userAgent);
      
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          country: countryRef.current,
          countryCode: countryCodeRef.current,
          page: pathname,
          duration,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          clicks: clicksRef.current,
          pagesViewed: pagesViewedRef.current,
        }),
      })
        .then(response => {
          if (!response.ok) {
            console.warn('Analytics API returned non-OK status:', response.status);
          }
        })
        .catch(err => {
          // Silently fail - analytics should not break the app
          console.warn('Analytics error (non-critical):', err);
        });
    };

    const interval = setInterval(sendAnalytics, 30000); // Every 30 seconds
    window.addEventListener('beforeunload', sendAnalytics);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', sendAnalytics);
      document.removeEventListener('click', handleClick);
      
      // Update last page view duration before leaving (sync only, no async fetch in cleanup)
      if (pagesViewedRef.current.length > 0) {
        const lastPage = pagesViewedRef.current[pagesViewedRef.current.length - 1];
        lastPage.duration = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      }
      
      // Send analytics before leaving (using sendBeacon for reliability, no async fetch)
      try {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const deviceInfo = detectDevice(navigator.userAgent);
        
        const analyticsData = JSON.stringify({
          sessionId: sessionIdRef.current,
          country: countryRef.current,
          countryCode: countryCodeRef.current,
          page: pathname,
          duration,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          clicks: clicksRef.current,
          pagesViewed: pagesViewedRef.current,
        });
        
        // Use sendBeacon for cleanup - it's more reliable and doesn't block
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics', analyticsData);
        }
      } catch (err) {
        // Silently fail in cleanup
        console.warn('Analytics cleanup error (non-critical):', err);
      }
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
