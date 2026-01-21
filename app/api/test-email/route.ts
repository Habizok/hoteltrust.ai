import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Test email endpoint
// GET /api/test-email?to=test@example.com
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const toEmail = searchParams.get('to') || 'test@example.com';

    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gmail credentials not configured',
          message: 'Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables',
        },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    const testEmail = {
      from: `HotelTrust.ai <${gmailUser}>`,
      to: toEmail,
      subject: 'HotelTrust.ai - Email Teszt',
      html: `
        <h2>Email Teszt Sikeres! ✅</h2>
        <p>Ez egy teszt email a HotelTrust.ai rendszerből.</p>
        <p><strong>Küldő:</strong> ${gmailUser}</p>
        <p><strong>Címzett:</strong> ${toEmail}</p>
        <p><strong>Időpont:</strong> ${new Date().toLocaleString('hu-HU')}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Ha ezt az emailt megkaptad, az email küldés működik! 🎉</p>
      `,
    };

    const info = await transporter.sendMail(testEmail);

    return NextResponse.json(
      {
        success: true,
        message: 'Email sikeresen elküldve',
        messageId: info.messageId,
        from: gmailUser,
        to: toEmail,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Email küldési hiba',
        details: error.message,
        hint: error.code === 'EAUTH' 
          ? 'Ellenőrizd a Gmail App Password-t. Lehet, hogy App Password-t kell használni a normál jelszó helyett.'
          : 'Ellenőrizd a Gmail beállításokat és a network kapcsolatot.',
      },
      { status: 500 }
    );
  }
}
