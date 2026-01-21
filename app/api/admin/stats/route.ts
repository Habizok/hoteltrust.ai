import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getWaitlistEntries, getAuditEntries } from '@/lib/data';

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

    const waitlistEntries = getWaitlistEntries();
    const auditEntries = getAuditEntries();

    // Calculate statistics
    const stats = {
      waitlist: {
        total: waitlistEntries.length,
        today: waitlistEntries.filter(entry => {
          const entryDate = new Date(entry.createdAt);
          const today = new Date();
          return entryDate.toDateString() === today.toDateString();
        }).length,
        thisWeek: waitlistEntries.filter(entry => {
          const entryDate = new Date(entry.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return entryDate >= weekAgo;
        }).length,
        thisMonth: waitlistEntries.filter(entry => {
          const entryDate = new Date(entry.createdAt);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return entryDate >= monthAgo;
        }).length,
        byLocale: {
          hu: waitlistEntries.filter(e => e.locale === 'hu').length,
          de: waitlistEntries.filter(e => e.locale === 'de').length,
        },
      },
      audit: {
        total: auditEntries.length,
        today: auditEntries.filter(entry => {
          const entryDate = new Date(entry.createdAt);
          const today = new Date();
          return entryDate.toDateString() === today.toDateString();
        }).length,
        thisWeek: auditEntries.filter(entry => {
          const entryDate = new Date(entry.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return entryDate >= weekAgo;
        }).length,
        thisMonth: auditEntries.filter(entry => {
          const entryDate = new Date(entry.createdAt);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return entryDate >= monthAgo;
        }).length,
        averageTrustScore: auditEntries.length > 0
          ? Math.round(auditEntries.reduce((sum, e) => sum + e.trustScore, 0) / auditEntries.length)
          : 0,
        byLocale: {
          hu: auditEntries.filter(e => e.locale === 'hu').length,
          de: auditEntries.filter(e => e.locale === 'de').length,
        },
      },
      entries: {
        waitlist: waitlistEntries.slice().reverse(), // Latest first
        audit: auditEntries.slice().reverse().map(entry => ({
          id: entry.id,
          email: entry.email,
          hotelName: entry.hotelName,
          hotelPlaceId: entry.hotelPlaceId,
          trustScore: entry.trustScore,
          aiVisibility: entry.aiVisibility,
          unansweredReviews: entry.unansweredReviews,
          totalReviews: entry.totalReviews,
          answeredReviews: entry.answeredReviews,
          criticalIssues: entry.criticalIssues,
          recommendations: entry.recommendations,
          revenueLoss: entry.revenueLoss,
          createdAt: entry.createdAt,
          locale: entry.locale,
        })), // Latest first, with all fields
      },
    };

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az adatok lekérése során' },
      { status: 500 }
    );
  }
}
