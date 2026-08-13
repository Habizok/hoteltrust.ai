import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getApiKeys, saveApiKey, deleteApiKey, ApiKeyStored } from '@/lib/kv';

// GET: list API keys (masked)
export async function GET() {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 401 });
    }

    const entries = await getApiKeys();

    // Ne adjuk vissza a teljes kulcsot, csak maszkolt formában
    const masked = entries.map((entry) => {
      const last4 = entry.key.slice(-4);
      const maskedKey = entry.key.length > 4 ? `••••••••${last4}` : '••••';
      return {
        id: entry.id,
        provider: entry.provider,
        label: entry.label,
        maskedKey,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      };
    });

    return NextResponse.json({ success: true, data: masked }, { status: 200 });
  } catch (error) {
    console.error('Admin API keys GET error:', error);
    return NextResponse.json(
      {
        error: 'Hiba történt az API kulcsok lekérése során',
      },
      { status: 500 }
    );
  }
}

// POST: create / update API key
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 401 });
    }

    const body = await request.json();
    const { id, provider, label, key } = body as {
      id?: string;
      provider: string;
      label: string;
      key: string;
    };

    if (!provider || !label || !key) {
      return NextResponse.json(
        { error: 'Provider, label és key mezők kötelezőek' },
        { status: 400 }
      );
    }

    const saved: ApiKeyStored = await saveApiKey({ id, provider, label, key });

    return NextResponse.json(
      { success: true, data: { id: saved.id } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin API keys POST error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az API kulcs mentése során' },
      { status: 500 }
    );
  }
}

// DELETE: delete API key by id
export async function DELETE(request: NextRequest) {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body as { id?: string };

    if (!id) {
      return NextResponse.json(
        { error: 'API kulcs azonosító (id) kötelező' },
        { status: 400 }
      );
    }

    const deleted = await deleteApiKey(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'API kulcs nem található' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Admin API keys DELETE error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az API kulcs törlése során' },
      { status: 500 }
    );
  }
}

