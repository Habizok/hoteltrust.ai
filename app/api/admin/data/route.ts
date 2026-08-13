import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getWaitlistEntries, getAuditEntriesFromKV, getAnalyticsEntries } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Nincs jogosultság' },
        { status: 401 }
      );
    }

    // Get all data in parallel
    const [waitlistEntries, auditEntries, analyticsEntries] = await Promise.all([
      getWaitlistEntries(),
      getAuditEntriesFromKV(),
      getAnalyticsEntries(),
    ]);

    // Calculate basic statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      waitlist: {
        total: waitlistEntries.length,
        today: waitlistEntries.filter(e => new Date(e.createdAt) >= today).length,
        thisWeek: waitlistEntries.filter(e => new Date(e.createdAt) >= weekAgo).length,
        thisMonth: waitlistEntries.filter(e => new Date(e.createdAt) >= monthAgo).length,
        byLocale: {
          hu: waitlistEntries.filter(e => e.locale === 'hu').length,
          de: waitlistEntries.filter(e => e.locale === 'de').length,
        },
      },
      audit: {
        total: auditEntries.length,
        today: auditEntries.filter(e => new Date(e.createdAt) >= today).length,
        thisWeek: auditEntries.filter(e => new Date(e.createdAt) >= weekAgo).length,
        thisMonth: auditEntries.filter(e => new Date(e.createdAt) >= monthAgo).length,
        averageTrustScore: auditEntries.length > 0
          ? Math.round(auditEntries.reduce((sum, e) => sum + e.trustScore, 0) / auditEntries.length)
          : 0,
        byLocale: {
          hu: auditEntries.filter(e => e.locale === 'hu').length,
          de: auditEntries.filter(e => e.locale === 'de').length,
        },
      },
      analytics: {
        total: analyticsEntries.length,
        totalDuration: analyticsEntries.reduce((sum, e) => sum + e.duration, 0),
        averageDuration: analyticsEntries.length > 0
          ? Math.round(analyticsEntries.reduce((sum, e) => sum + e.duration, 0) / analyticsEntries.length)
          : 0,
        totalClicks: analyticsEntries.reduce((sum, e) => sum + (e.clicks?.length || 0), 0),
        totalPageViews: analyticsEntries.reduce((sum, e) => sum + (e.pagesViewed?.length || 0), 0),
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        entries: {
          waitlist: waitlistEntries.slice().reverse(), // Latest first
          audit: auditEntries.slice().reverse(), // Latest first
          analytics: analyticsEntries.slice().reverse(), // Latest first
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Admin data API error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az adatok lekérése során', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
