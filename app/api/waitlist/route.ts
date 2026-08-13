import { NextRequest, NextResponse } from 'next/server';
import { saveWaitlistEntry as saveWaitlistEntryToFile, getWaitlistEntries as getWaitlistEntriesFromFile } from '@/lib/data';
import { saveWaitlistEntry, getWaitlistEntries } from '@/lib/kv';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, hotelName, locale = 'de' } = body;

    if (!email || !hotelName) {
      return NextResponse.json(
        { error: 'Email és hotel név kötelező' },
        { status: 400 }
      );
    }

    // Email validáció
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Érvénytelen email cím' },
        { status: 400 }
      );
    }

    // Ellenőrizzük, hogy az email már létezik-e (Redis/KV-ból)
    const existingEntries = await getWaitlistEntries();
    const normalizedEmail = email.trim().toLowerCase();
    const existingEntry = existingEntries.find(
      e => e.email.toLowerCase() === normalizedEmail
    );

    if (existingEntry) {
      // Email már létezik - ne növeljük a számot, de adjunk vissza sikeres választ
      const totalCount = existingEntries.length;
      return NextResponse.json(
        { 
          success: true, 
          message: locale === 'hu' 
            ? 'Ez az email cím már fel van iratkozva a várólistára!' 
            : 'Diese E-Mail-Adresse ist bereits für die Warteliste angemeldet!',
          alreadyExists: true,
          count: totalCount
        },
        { status: 200 }
      );
    }

    // Mentés Redis/KV-ba (és file storage-ba fallback-ként)
    console.log('[WAITLIST API] Saving waitlist entry:', { email: email.trim(), hotelName: hotelName.trim(), locale });
    const entry = await saveWaitlistEntry({
      email: email.trim(),
      hotelName: hotelName.trim(),
      locale,
    });
    console.log('[WAITLIST API] Waitlist entry saved:', entry.id);
    
    // Also save to file storage as fallback
    try {
      saveWaitlistEntryToFile({
        email: email.trim(),
        hotelName: hotelName.trim(),
        locale,
      });
    } catch (fileError) {
      console.warn('Failed to save waitlist entry to file (non-critical):', fileError);
    }

    // Email értesítés küldése az adminnak
    try {
      const gmailUser = process.env.GMAIL_USER;
      const gmailPassword = process.env.GMAIL_APP_PASSWORD;

      if (gmailUser && gmailPassword) {
        const totalCount = (await getWaitlistEntries()).length;
        
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPassword,
          },
        });

        const notificationSubject = locale === 'hu'
          ? `🆕 Új várólista regisztráció - ${hotelName.trim()}`
          : `🆕 Neue Wartelisten-Registrierung - ${hotelName.trim()}`;

        const notificationHtml = `
          <h2 style="color: #1A73E8;">${locale === 'hu' ? 'Új várólista regisztráció!' : 'Neue Wartelisten-Registrierung!'}</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>${locale === 'hu' ? 'Hotel neve:' : 'Hotel Name:'}</strong> ${hotelName.trim()}</p>
            <p><strong>${locale === 'hu' ? 'Email cím:' : 'E-Mail-Adresse:'}</strong> ${email.trim()}</p>
            <p><strong>${locale === 'hu' ? 'Nyelv:' : 'Sprache:'}</strong> ${locale.toUpperCase()}</p>
            <p><strong>${locale === 'hu' ? 'Regisztráció ideje:' : 'Registrierungszeit:'}</strong> ${new Date().toLocaleString(locale === 'hu' ? 'hu-HU' : 'de-DE', { timeZone: 'Europe/Budapest' })}</p>
          </div>

          <div style="background: #e8f0fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>${locale === 'hu' ? 'Összes várólista regisztráció:' : 'Gesamt Wartelisten-Registrierungen:'}</strong> <span style="font-size: 24px; color: #1A73E8;">${totalCount}</span></p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            ${locale === 'hu' 
              ? 'Ez egy automatikus értesítés a Trusthotel rendszerből.' 
              : 'Dies ist eine automatische Benachrichtigung vom Trusthotel System.'}
          </p>
        `;

        await transporter.sendMail({
          from: `Trusthotel <${gmailUser}>`,
          to: gmailUser, // Értesítés az adminnak
          subject: notificationSubject,
          html: notificationHtml,
        });

        console.log('Waitlist notification email sent successfully');
      } else {
        console.warn('Gmail SMTP credentials not configured. Skipping notification email.');
      }
    } catch (error) {
      console.error('Waitlist notification email error:', error);
      // Ne dobjunk hibát, ha az email küldés nem sikerül
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Sikeresen regisztrálva a várólistára!',
        id: entry.id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a regisztráció során' },
      { status: 500 }
    );
  }
}
