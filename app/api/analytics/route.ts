import { NextRequest, NextResponse } from 'next/server';
import { saveAnalyticsEntry, updateAnalyticsEntry, getAnalyticsEntries } from '@/lib/analytics';
import { detectDevice } from '@/lib/deviceDetector';

// POST - új analytics entry létrehozása vagy frissítése
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, country, countryCode, page, duration, userAgent, referrer, clicks, pagesViewed, device, browser, os } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID kötelező' },
        { status: 400 }
      );
    }

    // Ellenőrizzük, hogy van-e már ilyen session
    const existing = getAnalyticsEntries().find(e => e.sessionId === sessionId);
    
    if (existing) {
      // Detect device info from userAgent if not provided
      const deviceInfo = device && browser && os 
        ? { device, browser, os }
        : userAgent 
          ? detectDevice(userAgent)
          : { device: existing.device || 'Ismeretlen', browser: existing.browser || 'Ismeretlen', os: existing.os || 'Ismeretlen' };
      
      // Frissítjük a meglévő entry-t
      const updated = {
        country: country || existing.country,
        countryCode: countryCode || existing.countryCode,
        page: page || existing.page,
        duration: duration !== undefined ? duration : existing.duration,
        userAgent: userAgent || existing.userAgent,
        referrer: referrer || existing.referrer,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        clicks: clicks || existing.clicks,
        pagesViewed: pagesViewed || existing.pagesViewed,
      };
      
      updateAnalyticsEntry(sessionId, updated);
      
      return NextResponse.json(
        { success: true, message: 'Analytics entry frissítve' },
        { status: 200 }
      );
    } else {
      // Detect device info from userAgent
      const deviceInfo = device && browser && os 
        ? { device, browser, os }
        : userAgent 
          ? detectDevice(userAgent)
          : { device: 'Ismeretlen', browser: 'Ismeretlen', os: 'Ismeretlen' };
      
      // Új entry létrehozása
      const entry = saveAnalyticsEntry({
        sessionId,
        country: country || 'Ismeretlen',
        countryCode: countryCode || 'XX',
        page: page || '/',
        duration: duration || 0,
        userAgent,
        referrer,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        clicks: clicks || [],
        pagesViewed: pagesViewed || [],
      });

      return NextResponse.json(
        { success: true, message: 'Analytics entry létrehozva', id: entry.id },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az analytics mentése során' },
      { status: 500 }
    );
  }
}

// GET - analytics adatok lekérése (csak admin)
export async function GET(request: NextRequest) {
  try {
    // TODO: Admin authentication check
    const entries = getAnalyticsEntries();
    
    return NextResponse.json(
      { success: true, data: entries },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az adatok lekérése során' },
      { status: 500 }
    );
  }
}
