import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS, createAdminSessionToken } from '@/lib/adminSession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email és jelszó kötelező' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL or ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { error: 'Szerver konfigurációs hiba' },
        { status: 500 }
      );
    }

    if (email === adminEmail && password === adminPassword) {
      const sessionToken = await createAdminSessionToken(email);

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      });

      return NextResponse.json(
        { success: true, message: 'Sikeres bejelentkezés' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Hibás email vagy jelszó' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a bejelentkezés során' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);

    return NextResponse.json(
      { success: true, message: 'Sikeres kijelentkezés' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Hiba történt a kijelentkezés során' },
      { status: 500 }
    );
  }
}
