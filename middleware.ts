import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSessionToken } from './lib/adminSession';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Protect admin dashboard routes (works with locale prefix)
  const pathname = request.nextUrl.pathname;
  if (pathname.includes('/admin-dashboard')) {
    const session = request.cookies.get('admin_session');
    const valid = await verifyAdminSessionToken(session?.value);

    if (!valid) {
      // Extract locale from pathname or use default
      const locale = pathname.match(/^\/(hu|de)/)?.[1] || 'hu';
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    }
  }

  // Continue with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(de|hu)/:path*', '/admin/:path*', '/admin-dashboard/:path*']
};
