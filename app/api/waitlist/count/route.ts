import { NextRequest, NextResponse } from 'next/server';
import { getWaitlistEntries } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const entries = await getWaitlistEntries();
    return NextResponse.json({ success: true, count: entries.length }, { status: 200 });
  } catch (error) {
    console.error('Waitlist count API error:', error);
    return NextResponse.json(
      { error: 'Failed to get waitlist count' },
      { status: 500 }
    );
  }
}
