import { NextRequest, NextResponse } from 'next/server';

// Google Places Autocomplete API endpoint
// GET /api/places/autocomplete?query=hotel+name&locale=hu
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const locale = searchParams.get('locale') || 'de';

    if (!query || query.length < 2) {
      return NextResponse.json({ places: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('[PLACES API] Google Places API key not configured');
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }
    
    console.log('[PLACES API] Fetching places for query:', query, 'locale:', locale);

    // Use Google Places API (New) searchText endpoint
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating',
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: locale === 'hu' ? 'hu' : 'de',
        maxResultCount: 5, // Limit to 5 results
        includedType: 'lodging', // Only hotels/lodging
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PLACES API] Google Places API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch places', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[PLACES API] Response received:', data.places?.length || 0, 'places');
    
    // Format the response
    const places = (data.places || []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      rating: place.rating || null,
    }));

    console.log('[PLACES API] Formatted places:', places.length);
    return NextResponse.json({ places });
  } catch (error) {
    console.error('Places autocomplete error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
