import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAnalyticsEntries } from '@/lib/analytics';

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

    const entries = getAnalyticsEntries();

    // Calculate statistics
    const stats = {
      total: entries.length,
      byCountry: {} as Record<string, { count: number; totalDuration: number; avgDuration: number }>,
      byPage: {} as Record<string, { count: number; totalDuration: number; avgDuration: number }>,
      byDevice: {} as Record<string, { count: number; totalDuration: number; avgDuration: number }>,
      byBrowser: {} as Record<string, { count: number; totalDuration: number; avgDuration: number }>,
      byOS: {} as Record<string, { count: number; totalDuration: number; avgDuration: number }>,
      totalDuration: 0,
      avgDuration: 0,
      clicks: [] as Array<{ element: string; page: string; count: number }>,
      pagesViewed: [] as Array<{ page: string; count: number; totalDuration: number; avgDuration: number }>,
      entries: entries.slice().reverse(), // Latest first
    };

    // Process entries
    entries.forEach(entry => {
      // By country
      if (!stats.byCountry[entry.country]) {
        stats.byCountry[entry.country] = { count: 0, totalDuration: 0, avgDuration: 0 };
      }
      stats.byCountry[entry.country].count++;
      stats.byCountry[entry.country].totalDuration += entry.duration;
      
      // By page
      if (!stats.byPage[entry.page]) {
        stats.byPage[entry.page] = { count: 0, totalDuration: 0, avgDuration: 0 };
      }
      stats.byPage[entry.page].count++;
      stats.byPage[entry.page].totalDuration += entry.duration;
      
      // By device
      const device = entry.device || 'Ismeretlen';
      if (!stats.byDevice[device]) {
        stats.byDevice[device] = { count: 0, totalDuration: 0, avgDuration: 0 };
      }
      stats.byDevice[device].count++;
      stats.byDevice[device].totalDuration += entry.duration;
      
      // By browser
      const browser = entry.browser || 'Ismeretlen';
      if (!stats.byBrowser[browser]) {
        stats.byBrowser[browser] = { count: 0, totalDuration: 0, avgDuration: 0 };
      }
      stats.byBrowser[browser].count++;
      stats.byBrowser[browser].totalDuration += entry.duration;
      
      // By OS
      const os = entry.os || 'Ismeretlen';
      if (!stats.byOS[os]) {
        stats.byOS[os] = { count: 0, totalDuration: 0, avgDuration: 0 };
      }
      stats.byOS[os].count++;
      stats.byOS[os].totalDuration += entry.duration;
      
      // Total duration
      stats.totalDuration += entry.duration;
      
      // Clicks
      entry.clicks.forEach(click => {
        const existing = stats.clicks.find(c => c.element === click.element && c.page === click.page);
        if (existing) {
          existing.count++;
        } else {
          stats.clicks.push({ element: click.element, page: click.page, count: 1 });
        }
      });
      
      // Pages viewed
      entry.pagesViewed.forEach(pageView => {
        const existing = stats.pagesViewed.find(p => p.page === pageView.page);
        if (existing) {
          existing.count++;
          existing.totalDuration += pageView.duration;
        } else {
          stats.pagesViewed.push({
            page: pageView.page,
            count: 1,
            totalDuration: pageView.duration,
            avgDuration: pageView.duration,
          });
        }
      });
    });

    // Calculate averages
    Object.keys(stats.byCountry).forEach(country => {
      const data = stats.byCountry[country];
      data.avgDuration = data.count > 0 ? Math.round(data.totalDuration / data.count) : 0;
    });

    Object.keys(stats.byPage).forEach(page => {
      const data = stats.byPage[page];
      data.avgDuration = data.count > 0 ? Math.round(data.totalDuration / data.count) : 0;
    });

    Object.keys(stats.byDevice).forEach(device => {
      const data = stats.byDevice[device];
      data.avgDuration = data.count > 0 ? Math.round(data.totalDuration / data.count) : 0;
    });

    Object.keys(stats.byBrowser).forEach(browser => {
      const data = stats.byBrowser[browser];
      data.avgDuration = data.count > 0 ? Math.round(data.totalDuration / data.count) : 0;
    });

    Object.keys(stats.byOS).forEach(os => {
      const data = stats.byOS[os];
      data.avgDuration = data.count > 0 ? Math.round(data.totalDuration / data.count) : 0;
    });

    stats.avgDuration = entries.length > 0 ? Math.round(stats.totalDuration / entries.length) : 0;

    // Calculate averages for pages viewed
    stats.pagesViewed.forEach(page => {
      page.avgDuration = page.count > 0 ? Math.round(page.totalDuration / page.count) : 0;
    });

    // Sort clicks and pages viewed by count
    stats.clicks.sort((a, b) => b.count - a.count);
    stats.pagesViewed.sort((a, b) => b.count - a.count);

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    console.error('Analytics stats API error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az adatok lekérése során' },
      { status: 500 }
    );
  }
}
