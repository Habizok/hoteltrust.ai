import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'info@hotel-trust.site';
const ADMIN_PASSWORD = 'HotelTrust2026!';

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

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create session token (simple implementation)
      const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
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
    cookieStore.delete('admin_session');
    
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
