import { NextRequest, NextResponse } from 'next/server';
import { saveAuditEntry } from '@/lib/data';
import nodemailer from 'nodemailer';

// Audit API endpoint
// POST /api/audit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelName, email, hotelPlaceId, locale = 'de' } = body;

    if (!hotelName || !email) {
      return NextResponse.json(
        { error: 'Hotel name and email are required' },
        { status: 400 }
      );
    }

    // Step 1: Get hotel data from Google Places API (New)
    // Store original input name separately - this is what user typed
    const originalHotelName = hotelName.trim();
    
    let hotelData = {
      name: hotelName,
      placeId: hotelPlaceId || null,
      address: '',
      website: '',
      rating: 0,
      totalReviews: 0,
    };

    try {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        throw new Error('Google Places API key not configured');
      }

      // Search for the hotel
      const searchResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.addressComponents,places.rating,places.userRatingCount,places.websiteUri',
        },
        body: JSON.stringify({
          textQuery: hotelName,
          languageCode: locale === 'hu' ? 'hu' : 'de',
        }),
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const place = searchData.places?.[0];
        
        if (place) {
          hotelData.placeId = place.id;
          hotelData.name = place.displayName?.text || hotelName;
          hotelData.address = place.formattedAddress || '';
          hotelData.rating = place.rating || 0;
          hotelData.totalReviews = place.userRatingCount || 0;
          hotelData.website = place.websiteUri || '';
          
          // Extract city name from addressComponents in search response (if available)
          let extractedCityName = '';
          if (place.addressComponents && Array.isArray(place.addressComponents)) {
            // Look for 'locality' type (city name)
            const locality = place.addressComponents.find((comp: any) => 
              comp.types && comp.types.includes('locality')
            );
            if (locality) {
              extractedCityName = locality.longText || locality.text || '';
            }
            // Fallback to 'administrative_area_level_2' if no locality (for smaller towns)
            if (!extractedCityName) {
              const adminArea2 = place.addressComponents.find((comp: any) => 
                comp.types && comp.types.includes('administrative_area_level_2')
              );
              if (adminArea2) {
                extractedCityName = adminArea2.longText || adminArea2.text || '';
              }
            }
          }
          // Store extracted city name for later use (will be overridden by details if available)
          if (extractedCityName) {
            (hotelData as any).extractedCityName = extractedCityName;
          }

          // Get detailed place information with reviews if we have a Place ID
          if (place.id) {
            const detailsResponse = await fetch(`https://places.googleapis.com/v1/places/${place.id}`, {
              method: 'GET',
              headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,addressComponents,rating,userRatingCount,websiteUri,internationalPhoneNumber,editorialSummary,reviews',
              },
            });

            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              if (detailsData) {
                hotelData.name = detailsData.displayName?.text || hotelData.name;
                hotelData.address = detailsData.formattedAddress || hotelData.address;
                hotelData.rating = detailsData.rating || hotelData.rating;
                hotelData.totalReviews = detailsData.userRatingCount || hotelData.totalReviews;
                hotelData.website = detailsData.websiteUri || hotelData.website;
                
                // Extract city name from addressComponents (more reliable)
                let extractedCityName = '';
                if (detailsData.addressComponents && Array.isArray(detailsData.addressComponents)) {
                  // Look for 'locality' type (city name)
                  const locality = detailsData.addressComponents.find((comp: any) => 
                    comp.types && comp.types.includes('locality')
                  );
                  if (locality) {
                    extractedCityName = locality.longText || locality.text || '';
                  }
                  // Fallback to 'administrative_area_level_2' if no locality (for smaller towns)
                  if (!extractedCityName) {
                    const adminArea2 = detailsData.addressComponents.find((comp: any) => 
                      comp.types && comp.types.includes('administrative_area_level_2')
                    );
                    if (adminArea2) {
                      extractedCityName = adminArea2.longText || adminArea2.text || '';
                    }
                  }
                }
                // Store extracted city name for later use (override if found in details)
                if (extractedCityName) {
                  (hotelData as any).extractedCityName = extractedCityName;
                }
                
                // Extract reviews from place details (already included in FieldMask)
                if (detailsData.reviews && Array.isArray(detailsData.reviews)) {
                  (hotelData as any).reviews = detailsData.reviews;
                }
              }
            }
          }
        }
      } else {
        console.error('Google Places API error:', await searchResponse.text());
        // Continue with mock data if API fails
      }
    } catch (error) {
      console.error('Error fetching hotel data from Google Places:', error);
      // Continue with provided hotel name if API fails
    }

    // Step 2: Get reviews from hotelData (already fetched in Step 1 place details)
    let reviews: Array<{text: string, rating: number, date: string, answered: boolean}> = [];
    
    if ((hotelData as any).reviews && Array.isArray((hotelData as any).reviews)) {
      // Get last 15 reviews only (deterministic, consistent)
      reviews = (hotelData as any).reviews.slice(0, 15).map((review: any, index: number) => ({
        text: review.text?.text || review.originalText?.text || '',
        rating: review.rating || 0,
        date: review.publishTime ? new Date(review.publishTime).toISOString().split('T')[0] : '',
        // Deterministic: negative reviews (1-2 stars) are unanswered
        // Positive reviews (4-5 stars) are answered
        // 3 stars: deterministically 50% answered (even index = answered, odd = unanswered)
        answered: review.rating >= 4 ? true : review.rating === 3 ? index % 2 === 0 : false,
      }));
    }

    // Fallback to mock reviews if no reviews found
    if (reviews.length === 0) {
      reviews = [
        {
          text: locale === 'hu' 
            ? 'Nagyszerű hotel, kiváló szolgáltatás!' 
            : 'Großartiges Hotel, ausgezeichneter Service!',
          rating: 5,
          date: '2024-01-15',
          answered: false,
        },
        {
          text: locale === 'hu'
            ? 'A wellness részleg kicsit elavult volt.'
            : 'Der Wellness-Bereich war etwas veraltet.',
          rating: 3,
          date: '2024-01-10',
          answered: false,
        },
        {
          text: locale === 'hu'
            ? 'Kiváló reggeli, barátságos személyzet!'
            : 'Ausgezeichnetes Frühstück, freundliches Personal!',
          rating: 5,
          date: '2024-01-05',
          answered: true,
        },
      ];
    }

    // Step 3: Scrape website (if available) using Firecrawl
    let websiteData = null;
    if (hotelData.website && hotelData.website !== 'https://example.com') {
      try {
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({
            url: hotelData.website,
            formats: ['markdown'],
          }),
        });

        if (firecrawlResponse.ok) {
          const firecrawlData = await firecrawlResponse.json();
          websiteData = firecrawlData.data?.markdown || null;
        }
      } catch (error) {
        console.error('Firecrawl error:', error);
        // Continue without website data
      }
    }

    // Calculate statistics deterministically (no randomness)
    const analyzedReviewsCount = reviews.length; // Number of reviews we analyzed (15)
    const totalReviewsFromGoogle = hotelData.totalReviews || analyzedReviewsCount; // Total reviews from Google Places API
    const negativeReviews = reviews.filter(r => r.rating <= 2).length;
    const positiveReviews = reviews.filter(r => r.rating >= 4).length;
    const neutralReviews = reviews.filter(r => r.rating === 3).length;
    const negativeRatio = analyzedReviewsCount > 0 ? negativeReviews / analyzedReviewsCount : 0;
    
    // Deterministic calculation: 
    // - All negative reviews (1-2 stars) are considered unanswered
    // - 50% of neutral reviews (3 stars) are considered unanswered
    // - Positive reviews (4-5 stars) are considered answered
    const answeredReviews = positiveReviews; // Positive reviews are considered answered
    const estimatedUnanswered = negativeReviews + Math.floor(neutralReviews * 0.5);
    
    // Calculate answered count from total reviews (proportional)
    const answeredCount = totalReviewsFromGoogle > 0 && analyzedReviewsCount > 0
      ? Math.round((answeredReviews / analyzedReviewsCount) * totalReviewsFromGoogle)
      : answeredReviews;
    
    // Cap at 20+ for display
    const displayUnanswered = estimatedUnanswered > 20 ? '20+' : estimatedUnanswered.toString();

    // Step 4: Extract city name from Google Places API addressComponents (most reliable)
    let cityName = '';
    
    // First, try to use the extracted city name from addressComponents (most reliable)
    if ((hotelData as any).extractedCityName) {
      cityName = (hotelData as any).extractedCityName;
      console.log(`✅ Using city name from Google Places API addressComponents: "${cityName}"`);
    }
    
    // Fallback: if no city name from addressComponents, try to extract from formattedAddress
    if (!cityName && hotelData.address) {
      // Try to extract city from address (usually after postal code or comma)
      const addressParts = hotelData.address.split(',');
      if (addressParts.length >= 2) {
        // Usually city is the second-to-last part (before country)
        // Format: "Street, City, Country" or "Street, Postal Code City, Country"
        cityName = addressParts[addressParts.length - 2]?.trim() || '';
        // Remove postal code if present (e.g., "1010 Wien" -> "Wien")
        cityName = cityName.replace(/^\d{4,5}\s+/, '').trim();
      } else {
        // If no comma, try to extract from the address string
        const match = hotelData.address.match(/(\d{4,5})\s+([^,]+)/);
        if (match) {
          cityName = match[2].trim();
        }
      }
    }
    
    // Final fallback: if city name is still empty or too short
    if (!cityName || cityName.length < 2) {
      if (hotelData.address) {
        const parts = hotelData.address.split(',').map(p => p.trim());
        cityName = parts.find(p => p.length > 2 && !p.match(/^\d+$/)) || '';
      }
    }
    
    console.log(`📍 Final extracted city name: "${cityName}" from address: "${hotelData.address}"`);

    // Step 4.5: Get list of hotels in the city from Google Places API
    // This will be used as reference for the AI to ensure it only recommends hotels from this city
    let cityHotelsList: Array<{name: string, address: string}> = [];
    
    if (cityName) {
      try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (apiKey) {
          // Determine country based on locale (Hungary for 'hu', Austria for 'de')
          const country = locale === 'hu' ? 'Hungary' : 'Austria';
          
          // Search for hotels in the city
          const cityHotelsResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating',
            },
            body: JSON.stringify({
              textQuery: `hotels in ${cityName}, ${country}`,
              languageCode: locale === 'hu' ? 'hu' : 'de',
              maxResultCount: 20, // Get up to 20 hotels for reference
            }),
          });

          if (cityHotelsResponse.ok) {
            const cityHotelsData = await cityHotelsResponse.json();
            if (cityHotelsData.places && Array.isArray(cityHotelsData.places)) {
              cityHotelsList = cityHotelsData.places.map((place: any) => ({
                name: place.displayName?.text || '',
                address: place.formattedAddress || '',
              })).filter((hotel: any) => hotel.name && hotel.address);
              
              console.log(`🏨 Found ${cityHotelsList.length} hotels in ${cityName} from Google Places API`);
            }
          } else {
            console.error('Error fetching city hotels from Google Places API:', await cityHotelsResponse.text());
          }
        }
      } catch (error) {
        console.error('Error fetching city hotels list:', error);
        // Continue without the list if it fails
      }
    }

    // Step 5: Test AI Visibility with real AI queries (Gemini Flash 2.5)
    const aiVisibility = {
      chatgpt: { visible: false, position: null as number | null },
      gemini: { visible: false, position: null as number | null },
      bing: { visible: false, position: null as number | null },
    };

    // Track wellness visibility across all AI platforms (declare outside if block for scope)
    let wellnessVisibleInGemini = false;
    let wellnessVisibleInChatGPT = false;

    if (cityName && hotelData.name) {
      // Questions to test AI visibility - city-based with specific criteria
      // Test in BOTH languages (Hungarian and German) for better coverage
      const testQuestions: string[] = [];
      
      // Capitalize city name (first letter uppercase)
      const capitalizedCityName = cityName.trim().charAt(0).toUpperCase() + cityName.trim().slice(1).toLowerCase();
      
      // Get country and region info for better context
      const country = locale === 'hu' ? 'Magyarország' : 'Österreich';
      const locationContext = locale === 'hu' 
        ? `${capitalizedCityName}, ${country}`
        : `${capitalizedCityName}, ${country}`;
      
      // Hungarian questions - less restrictive, more natural
      // Important: If there are fewer than 5 hotels, only list the real ones, don't hallucinate
      testQuestions.push(
        `Melyik szállodákat ajánlod ${locationContext} területén, ahol van ingyenes parkolás? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel, és írd oda, hogy nincs több találat. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`,
        `Melyik hoteleket ajánlod ${locationContext} területén, ahol van reggeli és közel van a központhoz? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`,
        `Melyik a legjobb ár-érték arányú szállodák ${locationContext} területén? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`,
        `Melyik szállodákat ajánlod ${locationContext} területén wellness szolgáltatással? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`,
        `Melyik a legjobb minősítésű hotelek ${locationContext} területén? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`
      );
      
      // German questions (for Austrian/German market)
      testQuestions.push(
        `Welche Hotels empfehlen Sie in ${locationContext} mit kostenlosem Parken? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`,
        `Welche Hotels empfehlen Sie in ${locationContext}, die Frühstück anbieten und nah am Zentrum sind? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`,
        `Welche Hotels haben das beste Preis-Leistungs-Verhältnis in ${locationContext}? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`,
        `Welche Hotels empfehlen Sie in ${locationContext} mit Wellness-Angeboten? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`,
        `Welche sind die am besten bewerteten Hotels in ${locationContext}? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`
      );
      
      // Test with Gemini Flash 2.5
      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (geminiApiKey) {
          let geminiPositions: number[] = [];
          
          for (let questionIndex = 0; questionIndex < testQuestions.length; questionIndex++) {
            const question = testQuestions[questionIndex];
            const isWellnessQuestion = questionIndex === 3 || questionIndex === 7; // 4th question (index 3) in HU, 8th (index 7) in DE
            try {
              // Build prompt with Google Places API hotel list as reference
              let promptText = question;
              
              if (cityHotelsList.length > 0) {
                const hotelsListText = cityHotelsList.map((hotel, idx) => 
                  `${idx + 1}. ${hotel.name} - ${hotel.address}`
                ).join('\n');
                
                if (locale === 'hu') {
                  promptText = `Itt van ${capitalizedCityName} város valódi hoteljeinek listája a Google Places API-ból:\n\n${hotelsListText}\n\n${question}\n\nFontos: Csak a fenti listában szereplő hoteleket ajánlj! Ha egy hotel nincs a listában, ne ajánld! Ellenőrizd, hogy valóban ${capitalizedCityName}-ban van-e a címük.`;
                } else {
                  promptText = `Hier ist die Liste der echten Hotels in ${capitalizedCityName} von der Google Places API:\n\n${hotelsListText}\n\n${question}\n\nWichtig: Empfehlen Sie nur Hotels aus der obigen Liste! Wenn ein Hotel nicht in der Liste steht, empfehlen Sie es nicht! Überprüfen Sie, ob die Adresse wirklich in ${capitalizedCityName} ist.`;
                }
              }
              
              const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{
                        text: promptText
                      }]
                    }],
                    generationConfig: {
                      temperature: 0.3, // Lower temperature for more accuracy, less hallucination
                      maxOutputTokens: 500,
                    }
                  }),
                }
              );

              if (!geminiResponse.ok) {
                const errorText = await geminiResponse.text();
                console.error(`Gemini API error (${geminiResponse.status}):`, errorText);
              } else {
                const geminiData = await geminiResponse.json();
                
                // Check if response has valid structure
                if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content || !geminiData.candidates[0].content.parts || !geminiData.candidates[0].content.parts[0]) {
                  console.error('Gemini API response structure invalid:', JSON.stringify(geminiData).substring(0, 500));
                } else {
                  const responseText = geminiData.candidates[0].content.parts[0].text || '';
                  
                  if (!responseText || responseText.trim().length === 0) {
                    console.error('Gemini API returned empty response');
                  } else {
                
                // Check if hotel name appears in the response (improved fuzzy matching)
                // Use BOTH original input name and Google Places name
                const hotelNamesToCheck = [
                  originalHotelName.toLowerCase().trim(),
                  hotelData.name.toLowerCase().trim()
                ].filter((name, index, self) => self.indexOf(name) === index); // Remove duplicates
                
                // Also create normalized versions (without hyphens, spaces normalized)
                const normalizedNames = hotelNamesToCheck.map(name => 
                  name.replace(/[-_]/g, '').replace(/\s+/g, ' ')
                );
                hotelNamesToCheck.push(...normalizedNames);
                
                const responseLower = responseText.toLowerCase();
                // Also normalize response for better matching
                const responseNormalized = responseText.toLowerCase().replace(/[-_]/g, '').replace(/\s+/g, ' ');
                
                let isVisible = false;
                let matchedHotelName = '';
                
                // Try matching with each hotel name variant
                for (const hotelNameToCheck of hotelNamesToCheck) {
                  // Normalize the hotel name (remove hyphens, normalize spaces)
                  const normalizedHotelName = hotelNameToCheck.replace(/[-_]/g, '').replace(/\s+/g, ' ');
                  
                  // Multiple matching strategies
                  // 1. Exact match (case-insensitive)
                  const exactMatch = responseLower.includes(hotelNameToCheck);
                  
                  // 2. Normalized match (without hyphens)
                  const normalizedMatch = responseNormalized.includes(normalizedHotelName);
                  
                  // 3. Split hotel name into words (handle both spaces and hyphens)
                  const hotelNameWords = hotelNameToCheck
                    .split(/[\s\-_]+/)
                    .filter((word: string) => word.length > 1 && !['hotel', 'the', 'der', 'die', 'das', 'und', 'von', 'am', 'im', 'zum', 'zur', 'in', 'at', 'ház', 'haz'].includes(word));
                  
                  // 4. Check if all significant words appear
                  const allWordsMatch = hotelNameWords.length > 0 && hotelNameWords.every((word: string) => {
                    // Check in both original and normalized response
                    return responseLower.includes(word) || responseNormalized.includes(word.replace(/[-_]/g, ''));
                  });
                  
                  // 5. Check if any significant word appears (for compound names like "Grossmann-ház")
                  const anyWordMatch = hotelNameWords.length > 0 && hotelNameWords.some((word: string) => {
                    // Check if word appears as standalone (word boundary, case-insensitive)
                    const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                    return wordRegex.test(responseText);
                  });
                  
                  // 6. Partial match for compound names (e.g., "grossmann" in "Grossmann-ház")
                  const partialMatch = hotelNameWords.length > 0 && hotelNameWords.some((word: string) => {
                    if (word.length >= 5) { // Only for longer words
                      return responseLower.includes(word) || responseNormalized.includes(word);
                    }
                    return false;
                  });
                  
                  // More lenient matching: exact OR normalized OR (all words match) OR (any word match for compound names) OR (partial match)
                  const nameMatches = exactMatch || normalizedMatch || 
                    (allWordsMatch && hotelNameWords.length > 0) || 
                    (hotelNameWords.length >= 1 && anyWordMatch && hotelNameWords[0].length >= 3) ||
                    (partialMatch && hotelNameWords.length > 0);
                  
                  if (nameMatches) {
                    isVisible = true;
                    matchedHotelName = hotelNameToCheck;
                    break; // Found a match, no need to check other variants
                  }
                }
                
                // Log for debugging
                if (!isVisible) {
                  console.log(`Gemini - Hotel not found: "${originalHotelName}" or "${hotelData.name}" in response`);
                  console.log(`Response preview (first 500 chars): ${responseText.substring(0, 500)}`);
                  console.log(`Hotel names checked: ${hotelNamesToCheck.join(', ')}`);
                } else {
                  console.log(`✅ Gemini - Hotel found: "${matchedHotelName}" in response`);
                }
                
                if (isVisible) {
                  // Try to find position by looking for numbered lists (1., 2., etc.) or ordinal words
                  const lines = responseText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
                  let position: number | null = null;
                  
                  // Get the matched hotel name words for line matching
                  const matchedNameWords = matchedHotelName
                    .split(/\s+/)
                    .filter((word: string) => word.length > 1 && !['hotel', 'the', 'der', 'die', 'das', 'und', 'von', 'am', 'im', 'zum', 'zur', 'in', 'at'].includes(word));
                  
                  for (let i = 0; i < lines.length; i++) {
                    const lineLower = lines[i].toLowerCase();
                    const exactLineMatch = lineLower.includes(matchedHotelName);
                    const wordsLineMatch = matchedNameWords.length > 0 && matchedNameWords.every((word: string) => {
                      const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                      return wordRegex.test(lines[i]);
                    });
                    const lineMatches = exactLineMatch || wordsLineMatch;
                    
                    if (lineMatches) {
                      // Check if line starts with a number (1., 2., etc.)
                      const numberMatch = lines[i].match(/^(\d+)\./);
                      if (numberMatch) {
                        position = parseInt(numberMatch[1]);
                      } else {
                        // Check previous lines for numbering
                        for (let j = Math.max(0, i - 2); j < i; j++) {
                          const prevNumberMatch = lines[j].match(/^(\d+)\./);
                          if (prevNumberMatch) {
                            position = parseInt(prevNumberMatch[1]) + (i - j);
                            break;
                          }
                        }
                        // If no number found, estimate position based on line index
                        if (position === null) {
                          position = i + 1;
                        }
                      }
                      break;
                    }
                  }
                  
                  if (position !== null) {
                    geminiPositions.push(position);
                    // Track wellness visibility separately
                    if (isWellnessQuestion) {
                      wellnessVisibleInGemini = true;
                    }
                  } else {
                    // Hotel mentioned but position unclear, assume it's in top 5
                    geminiPositions.push(5);
                    if (isWellnessQuestion) {
                      wellnessVisibleInGemini = true;
                    }
                  }
                } else if (isWellnessQuestion) {
                  // Hotel not found in wellness question response
                  wellnessVisibleInGemini = false;
                }
                  }
                }
              }
            } catch (error) {
              console.error('Gemini API error for question:', question, error);
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Calculate average position (if hotel is mentioned in at least 1 question, it's visible)
          // Use average instead of best position to show realistic performance across all questions
          if (geminiPositions.length > 0) {
            const averagePosition = Math.round(geminiPositions.reduce((a, b) => a + b, 0) / geminiPositions.length);
            aiVisibility.gemini = { visible: true, position: averagePosition };
          } else {
            aiVisibility.gemini = { visible: false, position: null };
          }
          
          // Log for debugging
          console.log(`Gemini visibility check: ${hotelData.name} in ${cityName} - Visible: ${aiVisibility.gemini.visible}, Positions: ${geminiPositions.join(', ') || 'none'}, Questions tested: ${testQuestions.length}`);
          if (geminiPositions.length === 0) {
            console.log(`⚠️ Hotel "${hotelData.name}" not found in any Gemini responses for ${cityName}`);
          }
        }
      } catch (error) {
        console.error('Error testing Gemini visibility:', error);
      }

      // Test with OpenAI (GPT-4o-mini) - but prefer Gemini
      try {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (openaiApiKey) {
          let openaiPositions: number[] = [];
          
          for (let questionIndex = 0; questionIndex < testQuestions.length; questionIndex++) {
            const question = testQuestions[questionIndex];
            const isWellnessQuestion = questionIndex === 3 || questionIndex === 7; // 4th question (index 3) in HU, 8th (index 7) in DE
            try {
              // Build prompt with Google Places API hotel list as reference
              let promptText = question;
              
              if (cityHotelsList.length > 0) {
                const hotelsListText = cityHotelsList.map((hotel, idx) => 
                  `${idx + 1}. ${hotel.name} - ${hotel.address}`
                ).join('\n');
                
                if (locale === 'hu') {
                  promptText = `Itt van ${capitalizedCityName} város valódi hoteljeinek listája a Google Places API-ból:\n\n${hotelsListText}\n\n${question}\n\nFontos: Csak a fenti listában szereplő hoteleket ajánlj! Ha egy hotel nincs a listában, ne ajánld! Ellenőrizd, hogy valóban ${capitalizedCityName}-ban van-e a címük.`;
                } else {
                  promptText = `Hier ist die Liste der echten Hotels in ${capitalizedCityName} von der Google Places API:\n\n${hotelsListText}\n\n${question}\n\nWichtig: Empfehlen Sie nur Hotels aus der obigen Liste! Wenn ein Hotel nicht in der Liste steht, empfehlen Sie es nicht! Überprüfen Sie, ob die Adresse wirklich in ${capitalizedCityName} ist.`;
                }
              }
              
              const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${openaiApiKey}`,
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    {
                      role: 'user',
                      content: promptText,
                    },
                  ],
                  temperature: 0.3, // Lower temperature for more accuracy, less hallucination
                  max_tokens: 500,
                }),
              });

              if (!openaiResponse.ok) {
                const errorText = await openaiResponse.text();
                console.error(`OpenAI API error (${openaiResponse.status}):`, errorText);
              } else {
                const openaiData = await openaiResponse.json();
                
                // Check if response has valid structure
                if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message || !openaiData.choices[0].message.content) {
                  console.error('OpenAI API response structure invalid:', JSON.stringify(openaiData).substring(0, 500));
                } else {
                  const responseText = openaiData.choices[0].message.content || '';
                  
                  if (!responseText || responseText.trim().length === 0) {
                    console.error('OpenAI API returned empty response');
                  } else {
                
                // Check if hotel name appears in the response (improved fuzzy matching)
                // Use BOTH original input name and Google Places name
                const hotelNamesToCheck = [
                  originalHotelName.toLowerCase().trim(),
                  hotelData.name.toLowerCase().trim()
                ].filter((name, index, self) => self.indexOf(name) === index); // Remove duplicates
                
                // Also create normalized versions (without hyphens, spaces normalized)
                const normalizedNames = hotelNamesToCheck.map(name => 
                  name.replace(/[-_]/g, '').replace(/\s+/g, ' ')
                );
                hotelNamesToCheck.push(...normalizedNames);
                
                const responseLower = responseText.toLowerCase();
                // Also normalize response for better matching
                const responseNormalized = responseText.toLowerCase().replace(/[-_]/g, '').replace(/\s+/g, ' ');
                
                let isVisible = false;
                let matchedHotelName = '';
                
                // Try matching with each hotel name variant
                for (const hotelNameToCheck of hotelNamesToCheck) {
                  // Normalize the hotel name (remove hyphens, normalize spaces)
                  const normalizedHotelName = hotelNameToCheck.replace(/[-_]/g, '').replace(/\s+/g, ' ');
                  
                  // Multiple matching strategies
                  // 1. Exact match (case-insensitive)
                  const exactMatch = responseLower.includes(hotelNameToCheck);
                  
                  // 2. Normalized match (without hyphens)
                  const normalizedMatch = responseNormalized.includes(normalizedHotelName);
                  
                  // 3. Split hotel name into words (handle both spaces and hyphens)
                  const hotelNameWords = hotelNameToCheck
                    .split(/[\s\-_]+/)
                    .filter((word: string) => word.length > 1 && !['hotel', 'the', 'der', 'die', 'das', 'und', 'von', 'am', 'im', 'zum', 'zur', 'in', 'at', 'ház', 'haz'].includes(word));
                  
                  // 4. Check if all significant words appear
                  const allWordsMatch = hotelNameWords.length > 0 && hotelNameWords.every((word: string) => {
                    // Check in both original and normalized response
                    return responseLower.includes(word) || responseNormalized.includes(word.replace(/[-_]/g, ''));
                  });
                  
                  // 5. Check if any significant word appears (for compound names like "Grossmann-ház")
                  const anyWordMatch = hotelNameWords.length > 0 && hotelNameWords.some((word: string) => {
                    // Check if word appears as standalone (word boundary, case-insensitive)
                    const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                    return wordRegex.test(responseText);
                  });
                  
                  // 6. Partial match for compound names (e.g., "grossmann" in "Grossmann-ház")
                  const partialMatch = hotelNameWords.length > 0 && hotelNameWords.some((word: string) => {
                    if (word.length >= 5) { // Only for longer words
                      return responseLower.includes(word) || responseNormalized.includes(word);
                    }
                    return false;
                  });
                  
                  // More lenient matching: exact OR normalized OR (all words match) OR (any word match for compound names) OR (partial match)
                  const nameMatches = exactMatch || normalizedMatch || 
                    (allWordsMatch && hotelNameWords.length > 0) || 
                    (hotelNameWords.length >= 1 && anyWordMatch && hotelNameWords[0].length >= 3) ||
                    (partialMatch && hotelNameWords.length > 0);
                  
                  if (nameMatches) {
                    isVisible = true;
                    matchedHotelName = hotelNameToCheck;
                    break; // Found a match, no need to check other variants
                  }
                }
                
                // Log for debugging
                if (!isVisible) {
                  console.log(`ChatGPT - Hotel not found: "${originalHotelName}" or "${hotelData.name}" in response`);
                  console.log(`Response preview (first 500 chars): ${responseText.substring(0, 500)}`);
                  console.log(`Hotel names checked: ${hotelNamesToCheck.join(', ')}`);
                } else {
                  console.log(`✅ ChatGPT - Hotel found: "${matchedHotelName}" in response`);
                }
                
                if (isVisible) {
                  const lines = responseText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
                  let position: number | null = null;
                  
                  // Get the matched hotel name words for line matching
                  const matchedNameWords = matchedHotelName
                    .split(/\s+/)
                    .filter((word: string) => word.length > 1 && !['hotel', 'the', 'der', 'die', 'das', 'und', 'von', 'am', 'im', 'zum', 'zur', 'in', 'at'].includes(word));
                  
                  for (let i = 0; i < lines.length; i++) {
                    const lineLower = lines[i].toLowerCase();
                    const exactLineMatch = lineLower.includes(matchedHotelName);
                    const wordsLineMatch = matchedNameWords.length > 0 && matchedNameWords.every((word: string) => {
                      const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                      return wordRegex.test(lines[i]);
                    });
                    const lineMatches = exactLineMatch || wordsLineMatch;
                    
                    if (lineMatches) {
                      const numberMatch = lines[i].match(/^(\d+)\./);
                      if (numberMatch) {
                        position = parseInt(numberMatch[1]);
                      } else {
                        for (let j = Math.max(0, i - 2); j < i; j++) {
                          const prevNumberMatch = lines[j].match(/^(\d+)\./);
                          if (prevNumberMatch) {
                            position = parseInt(prevNumberMatch[1]) + (i - j);
                            break;
                          }
                        }
                        if (position === null) {
                          position = i + 1;
                        }
                      }
                      break;
                    }
                  }
                  
                  if (position !== null) {
                    openaiPositions.push(position);
                    // Track wellness visibility separately
                    if (isWellnessQuestion) {
                      wellnessVisibleInChatGPT = true;
                    }
                  } else {
                    openaiPositions.push(5);
                    if (isWellnessQuestion) {
                      wellnessVisibleInChatGPT = true;
                    }
                  }
                } else if (isWellnessQuestion) {
                  // Hotel not found in wellness question response
                  wellnessVisibleInChatGPT = false;
                }
                  }
                }
              }
            } catch (error) {
              console.error('OpenAI API error for question:', question, error);
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Calculate average position (if hotel is mentioned in at least 1 question, it's visible)
          // Use average instead of best position to show realistic performance across all questions
          if (openaiPositions.length > 0) {
            const averagePosition = Math.round(openaiPositions.reduce((a, b) => a + b, 0) / openaiPositions.length);
            aiVisibility.chatgpt = { visible: true, position: averagePosition };
          } else {
            aiVisibility.chatgpt = { visible: false, position: null };
          }
          
          // Log for debugging
          console.log(`ChatGPT visibility check: ${hotelData.name} in ${cityName} - Visible: ${aiVisibility.chatgpt.visible}, Positions: ${openaiPositions.join(', ') || 'none'}, Questions tested: ${testQuestions.length}, Wellness visible: ${wellnessVisibleInChatGPT}`);
          if (openaiPositions.length === 0) {
            console.log(`⚠️ Hotel "${hotelData.name}" not found in any ChatGPT responses for ${cityName}`);
          }
        }
      } catch (error) {
        console.error('Error testing OpenAI visibility:', error);
      }

      // Bing: Use best position from Gemini or ChatGPT
      if (aiVisibility.gemini.visible || aiVisibility.chatgpt.visible) {
        const positions = [
          aiVisibility.gemini.position,
          aiVisibility.chatgpt.position,
        ].filter(p => p !== null) as number[];
        const bestPosition = positions.length > 0 ? Math.min(...positions) : null;
        aiVisibility.bing = { visible: true, position: bestPosition };
      } else {
        aiVisibility.bing = { visible: false, position: null };
      }
    } else {
      // Fallback: if no city name, use data quality check
      const hasGoodData = websiteData && websiteData.length > 100 && analyzedReviewsCount >= 5;
      // Calculate base trust score for fallback (same aggressive penalties)
      const baseScore = 100;
      const unansweredPenalty = estimatedUnanswered * 10;
      const negativeRatioPenalty = analyzedReviewsCount > 0 ? Math.round((negativeReviews / analyzedReviewsCount) * 30) : 0;
      const websitePenalty = !websiteData ? 20 : 0;
      const noAnswersPenalty = (answeredCount === 0 || (answeredCount !== undefined && answeredCount === 0)) ? 30 : 0;
      const fallbackTrustScore = Math.max(20, Math.min(100, baseScore - unansweredPenalty - negativeRatioPenalty - websitePenalty - noAnswersPenalty));
      
      aiVisibility.gemini = { visible: hasGoodData && fallbackTrustScore >= 50, position: hasGoodData && fallbackTrustScore >= 50 ? 5 : null };
      aiVisibility.chatgpt = { visible: hasGoodData && positiveReviews > negativeReviews, position: hasGoodData && positiveReviews > negativeReviews ? 5 : null };
      aiVisibility.bing = { visible: hasGoodData, position: hasGoodData ? 5 : null };
    }

    // Step 6: Calculate Trust Score deterministically (after AI visibility check)
    // More aggressive penalties for real problems to show realistic scores
    const baseScore = 100;
    
    // Penalty for unanswered reviews: 12 points per unanswered review (more aggressive)
    const unansweredPenalty = estimatedUnanswered * 12;
    
    // Penalty for negative reviews ratio: up to 35 points (increased)
    const negativeRatioPenalty = analyzedReviewsCount > 0 ? Math.round((negativeReviews / analyzedReviewsCount) * 35) : 0;
    
    // Penalty for no website data: 20 points
    const websitePenalty = !websiteData ? 20 : 0;
    
    // Penalty for AI visibility: if not visible in any AI, major penalty
    const aiVisibilityPenalty = (!aiVisibility.gemini.visible && !aiVisibility.chatgpt.visible && !aiVisibility.bing.visible) ? 40 : 0;
    
    // Additional penalty if hotel is visible but not in top 3
    // More aggressive penalties: even if visible, being lower in rankings hurts score
    let positionPenalty = 0;
    if (aiVisibility.gemini.visible && aiVisibility.gemini.position) {
      if (aiVisibility.gemini.position === 1) {
        positionPenalty += 0; // No penalty for 1st place
      } else if (aiVisibility.gemini.position === 2) {
        positionPenalty += 5; // Small penalty for 2nd place
      } else if (aiVisibility.gemini.position === 3) {
        positionPenalty += 10; // Medium penalty for 3rd place
      } else {
        positionPenalty += 10 + (aiVisibility.gemini.position - 3) * 8; // 8 points per position after 3rd
      }
    }
    if (aiVisibility.chatgpt.visible && aiVisibility.chatgpt.position) {
      if (aiVisibility.chatgpt.position === 1) {
        positionPenalty += 0; // No penalty for 1st place
      } else if (aiVisibility.chatgpt.position === 2) {
        positionPenalty += 5; // Small penalty for 2nd place
      } else if (aiVisibility.chatgpt.position === 3) {
        positionPenalty += 10; // Medium penalty for 3rd place
      } else {
        positionPenalty += 10 + (aiVisibility.chatgpt.position - 3) * 8; // 8 points per position after 3rd
      }
    }
    
    // Penalty if no reviews answered at all
    const noAnswersPenalty = (answeredCount === 0 || (answeredCount !== undefined && answeredCount === 0)) ? 30 : 0;
    
    // Calculate final score with more aggressive penalties (lower scores = more conversion)
    // Minimum score is 15 (was 20) to show more realistic problems
    const calculatedTrustScore = Math.max(15, Math.min(100, baseScore - unansweredPenalty - negativeRatioPenalty - websitePenalty - aiVisibilityPenalty - positionPenalty - noAnswersPenalty));

    // Step 7: AI Analysis using Gemini Flash 2.5 - only for text generation (cheaper than OpenAI)
    const reviewsText = reviews.slice(0, 5).map((r, idx) => 
      `${idx + 1}. ${r.rating} csillag (${r.date}): ${r.text.substring(0, 150)}${r.text.length > 150 ? '...' : ''}`
    ).join('\n\n');

    const aiPrompt = `Te egy világszínvonalú mesterséges intelligencia szakértő és turisztikai marketing tanácsadó vagy. A feladatod, hogy elemezz egy adott szállodát az "AI-láthatóság" (GEO - Generative Engine Optimization) szempontjából. A stílusod legyen profi, segítőkész, de határozott. A válasz nyelve: ${locale === 'hu' ? 'Magyar' : 'Német'}.

Íme az adatok a hotelről:
* Név: ${hotelName}
* Összes elemzett vélemény: ${analyzedReviewsCount}
* Negatív vélemények (1-2 csillag): ${negativeReviews}
* Pozitív vélemények (4-5 csillag): ${positiveReviews}
* Válaszolatlan vélemények (becsült): ${estimatedUnanswered}
* Utolsó 5 Google vélemény részletei:
${reviewsText}
* Weboldalról kinyert infók: ${websiteData ? websiteData.substring(0, 300) : 'Nincs elérhető weboldal információ'}

FONTOS: A számok már kiszámolva vannak, ne változtasd meg őket! Csak a szövegeket generáld.

Készíts egy gyors auditot az alábbi JSON formátumban:
{
  "criticalIssues": ["hiba1", "hiba2", "hiba3"] - minimum 2-3 konkrét probléma (használd a ${estimatedUnanswered} válaszolatlan vélemény számot),
  "sampleReply": "Tökéletes válasz ${locale === 'hu' ? 'magyarul' : 'németül'} a legutóbbi negatív véleményre (ha van, különben a legutóbbi véleményre)",
  "recommendations": ["javaslat1", "javaslat2"] - minimum 2 konkrét technikai lépés,
  "revenueLoss": "15-20%" vagy "10-15%" vagy "5-10%" - becsült bevételkiesés százalékban évente (${estimatedUnanswered} válaszolatlan vélemény alapján)
}

Fontos: 
- NE változtasd meg a számokat (trustScore, unansweredReviews, aiVisibility) - ezek már kiszámolva vannak!
- A criticalIssues legyen konkrét és akció-orientált (pl. "${estimatedUnanswered > 0 ? estimatedUnanswered : 'Több'} válaszolatlan vélemény található", "Az AI nem találja a wellness szolgáltatásokat a weboldaladon")
- A recommendations legyen konkrét technikai lépés (pl. "Azonnali válasz-automatizáció bekapcsolása", "Strukturált adatok közzététele az AI tanításához")
- A válasz csak JSON legyen, semmi más!`;

    let aiAnalysis = null;
    try {
      // Use Gemini Flash 2.5 instead of OpenAI (cheaper)
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (geminiApiKey) {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Te egy világszínvonalú mesterséges intelligencia szakértő vagy. Mindig JSON formátumban válaszolsz.\n\n${aiPrompt}`
                }]
              }],
              generationConfig: {
                temperature: 0.3, // Lower temperature for more accuracy, less hallucination
                maxOutputTokens: 2000,
                responseMimeType: 'application/json',
              }
            }),
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const aiContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiContent) {
            try {
              const parsed = JSON.parse(aiContent);
              // Merge AI text generation with deterministic numbers
              // Generate critical issues with position-based recommendations
              const criticalIssues = parsed.criticalIssues || [];
              
              // Add position-based recommendations if hotel is not in top 3
              // Note: Position is average across all test questions (10 questions total: 5 Hungarian + 5 German)
              const totalQuestions = 10;
              
              if (aiVisibility.gemini.visible && aiVisibility.gemini.position && aiVisibility.gemini.position > 3) {
                criticalIssues.push(
                  locale === 'hu'
                    ? `A Gemini AI-ban átlagosan ${aiVisibility.gemini.position}. helyen szerepel ${totalQuestions} átlag kérdés között, nem az első helyen.`
                    : `Erscheint durchschnittlich auf Platz ${aiVisibility.gemini.position} bei Gemini AI über ${totalQuestions} Testfragen, nicht auf Platz 1.`
                );
              }
              if (aiVisibility.chatgpt.visible && aiVisibility.chatgpt.position && aiVisibility.chatgpt.position > 3) {
                criticalIssues.push(
                  locale === 'hu'
                    ? `A ChatGPT-ben átlagosan ${aiVisibility.chatgpt.position}. helyen szerepel ${totalQuestions} átlag kérdés között, nem az első helyen.`
                    : `Erscheint durchschnittlich auf Platz ${aiVisibility.chatgpt.position} bei ChatGPT über ${totalQuestions} Testfragen, nicht auf Platz 1.`
                );
              }
              if (!aiVisibility.gemini.visible && !aiVisibility.chatgpt.visible) {
                criticalIssues.push(
                  locale === 'hu'
                    ? 'Az AI nem ajánlja a szállodát (nem szerepel az ajánlások között).'
                    : 'Die KI empfiehlt das Hotel nicht (erscheint nicht in den Empfehlungen).'
                );
              }
              
              // Calculate revenue loss proportionally based on multiple factors
              let revenueLossPercentage = '0-5%';
              
              // Base on Trust Score (lower score = higher revenue loss)
              if (calculatedTrustScore < 30) {
                revenueLossPercentage = '25-35%';
              } else if (calculatedTrustScore < 40) {
                revenueLossPercentage = '20-30%';
              } else if (calculatedTrustScore < 50) {
                revenueLossPercentage = '15-25%';
              } else if (calculatedTrustScore < 60) {
                revenueLossPercentage = '10-20%';
              } else if (calculatedTrustScore < 70) {
                revenueLossPercentage = '5-15%';
              } else if (calculatedTrustScore < 80) {
                revenueLossPercentage = '5-10%';
              }
              
              // Adjust based on AI visibility (not visible = major revenue loss)
              if (!aiVisibility.gemini.visible && !aiVisibility.chatgpt.visible && !aiVisibility.bing.visible) {
                // Increase by 10-15% if not visible in any AI
                if (revenueLossPercentage === '0-5%') revenueLossPercentage = '10-15%';
                else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '15-20%';
                else if (revenueLossPercentage === '5-15%') revenueLossPercentage = '20-25%';
                else if (revenueLossPercentage === '10-20%') revenueLossPercentage = '25-30%';
                else if (revenueLossPercentage === '15-25%') revenueLossPercentage = '30-35%';
                else if (revenueLossPercentage === '20-30%') revenueLossPercentage = '35-40%';
                else if (revenueLossPercentage === '25-35%') revenueLossPercentage = '40-45%';
              }
              
              // Adjust based on answered reviews ratio (if less than 20% answered, increase loss)
              const answeredRatio = totalReviewsFromGoogle > 0 ? (answeredCount / totalReviewsFromGoogle) : 0;
              if (answeredRatio < 0.1) { // Less than 10% answered
                if (revenueLossPercentage === '0-5%') revenueLossPercentage = '10-15%';
                else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '15-20%';
                else if (revenueLossPercentage === '5-15%') revenueLossPercentage = '20-25%';
              } else if (answeredRatio < 0.2) { // Less than 20% answered
                if (revenueLossPercentage === '0-5%') revenueLossPercentage = '5-10%';
                else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '10-15%';
              }
              
              // Cap unansweredReviews at 20+ for display
              const displayUnansweredReviews = estimatedUnanswered > 20 ? '20+' : estimatedUnanswered;
              
              aiAnalysis = {
                trustScore: calculatedTrustScore, // Deterministic, not from AI
                aiVisibility: aiVisibility, // From real AI queries with positions
                unansweredReviews: displayUnansweredReviews, // Can be number or "20+"
                totalReviews: totalReviewsFromGoogle, // Total reviews from Google
                answeredReviews: answeredCount, // Number of answered reviews
                criticalIssues: criticalIssues,
                sampleReply: parsed.sampleReply || '',
                recommendations: [
                  ...(parsed.recommendations || []),
                  locale === 'hu'
                    ? 'Folyamatos oldal karbantartás és heti riportok küldése - mi rendben tartjuk az oldalát'
                    : 'Kontinuierliche Website-Wartung und wöchentliche Berichte - wir halten Ihre Website auf dem neuesten Stand',
                ],
                revenueLoss: parsed.revenueLoss || revenueLossPercentage,
              };
            } catch (e) {
              console.error('Failed to parse Gemini response:', e);
              aiAnalysis = null;
            }
          }
        }
      } else {
        // Fallback to OpenAI if Gemini key not available
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Te egy világszínvonalú mesterséges intelligencia szakértő vagy. Mindig JSON formátumban válaszolsz.',
              },
              {
                role: 'user',
                content: aiPrompt,
              },
            ],
            temperature: 0.3, // Lower temperature for more accuracy, less hallucination
            response_format: { type: 'json_object' },
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const aiContent = openaiData.choices[0]?.message?.content;
          if (aiContent) {
            try {
              const parsed = JSON.parse(aiContent);
              // Calculate revenue loss proportionally (same logic as above)
              let revenueLossPercentage = '0-5%';
              
              if (calculatedTrustScore < 30) {
                revenueLossPercentage = '25-35%';
              } else if (calculatedTrustScore < 40) {
                revenueLossPercentage = '20-30%';
              } else if (calculatedTrustScore < 50) {
                revenueLossPercentage = '15-25%';
              } else if (calculatedTrustScore < 60) {
                revenueLossPercentage = '10-20%';
              } else if (calculatedTrustScore < 70) {
                revenueLossPercentage = '5-15%';
              } else if (calculatedTrustScore < 80) {
                revenueLossPercentage = '5-10%';
              }
              
              if (!aiVisibility.gemini.visible && !aiVisibility.chatgpt.visible && !aiVisibility.bing.visible) {
                if (revenueLossPercentage === '0-5%') revenueLossPercentage = '10-15%';
                else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '15-20%';
                else if (revenueLossPercentage === '5-15%') revenueLossPercentage = '20-25%';
                else if (revenueLossPercentage === '10-20%') revenueLossPercentage = '25-30%';
                else if (revenueLossPercentage === '15-25%') revenueLossPercentage = '30-35%';
                else if (revenueLossPercentage === '20-30%') revenueLossPercentage = '35-40%';
                else if (revenueLossPercentage === '25-35%') revenueLossPercentage = '40-45%';
              }
              
              const answeredRatio = totalReviewsFromGoogle > 0 ? (answeredCount / totalReviewsFromGoogle) : 0;
              if (answeredRatio < 0.1) {
                if (revenueLossPercentage === '0-5%') revenueLossPercentage = '10-15%';
                else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '15-20%';
                else if (revenueLossPercentage === '5-15%') revenueLossPercentage = '20-25%';
              } else if (answeredRatio < 0.2) {
                if (revenueLossPercentage === '0-5%') revenueLossPercentage = '5-10%';
                else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '10-15%';
              }
              
              aiAnalysis = {
                trustScore: calculatedTrustScore,
                aiVisibility: aiVisibility,
                unansweredReviews: estimatedUnanswered,
                totalReviews: totalReviewsFromGoogle, // Total reviews from Google
                answeredReviews: answeredCount, // Number of answered reviews
                criticalIssues: parsed.criticalIssues || [],
                sampleReply: parsed.sampleReply || '',
                recommendations: [
                  ...(parsed.recommendations || []),
                  locale === 'hu'
                    ? 'Folyamatos oldal karbantartás és heti riportok küldése - mi rendben tartjuk az oldalát'
                    : 'Kontinuierliche Website-Wartung und wöchentliche Berichte - wir halten Ihre Website auf dem neuesten Stand',
                ],
                revenueLoss: parsed.revenueLoss || revenueLossPercentage,
              };
            } catch (e) {
              console.error('Failed to parse OpenAI response:', e);
              aiAnalysis = null;
            }
          }
        }
      }
    } catch (error) {
      console.error('AI API error:', error);
    }

    // Fallback ha az AI nem válaszol - determinisztikus számokkal
    if (!aiAnalysis) {
      const lastNegativeReview = reviews.find(r => r.rating <= 2);
      const sampleReplyText = lastNegativeReview 
        ? (locale === 'hu'
            ? `Köszönjük a visszajelzését! Sajnáljuk, hogy nem volt elégedett a szolgáltatásunkkal. Visszajelzését továbbítottuk a megfelelő részlegnek, és dolgozunk azon, hogy javítsunk a jövőben.`
            : `Vielen Dank für Ihr Feedback! Es tut uns leid, dass Sie mit unserem Service nicht zufrieden waren. Wir haben Ihr Feedback an die zuständige Abteilung weitergeleitet und arbeiten daran, uns zu verbessern.`)
        : (locale === 'hu'
            ? 'Köszönjük a visszajelzését! Örömmel látjuk, hogy elégedett volt a szolgáltatásunkkal.'
            : 'Vielen Dank für Ihr Feedback! Wir freuen uns, dass Sie mit unserem Service zufrieden waren.');
      
      // Check if wellness should be expected based on hotel profile
      // 1. Check if website mentions wellness/spa/sauna
      const websiteHasWellness = websiteData && (
        websiteData.toLowerCase().includes('wellness') ||
        websiteData.toLowerCase().includes('spa') ||
        websiteData.toLowerCase().includes('sauna') ||
        websiteData.toLowerCase().includes('massage') ||
        websiteData.toLowerCase().includes('relax') ||
        websiteData.toLowerCase().includes('fürdő') ||
        websiteData.toLowerCase().includes('fürdőzés')
      );
      
      // 2. Check if hotel rating/category suggests wellness should be available
      // High-end hotels (4+ stars or rating > 4.0) typically offer wellness
      const averageRating = hotelData.rating || 0;
      const shouldHaveWellness = averageRating >= 4.0;
      
      // 3. Check if AI found hotel in wellness question (from visibility checks above)
      const wellnessVisibleInAI = wellnessVisibleInGemini || wellnessVisibleInChatGPT;
      
      // Only flag wellness as issue if:
      // - Hotel should have wellness (high rating) AND AI doesn't find it
      // - OR website mentions wellness but AI doesn't find it
      const shouldFlagWellness = (shouldHaveWellness || websiteHasWellness) && !wellnessVisibleInAI;
      
      // Generate critical issues with position-based recommendations
      const criticalIssues = [
        estimatedUnanswered > 0 
          ? (locale === 'hu' 
              ? `${displayUnanswered} válaszolatlan vélemény található.`
              : `${displayUnanswered} unbeantwortete Bewertungen gefunden.`)
          : shouldFlagWellness
            ? (locale === 'hu'
                ? 'Az AI nem találja a wellness szolgáltatásokat a weboldaladon.'
                : 'Die KI findet Ihre Wellness-Angebote nicht auf Ihrer Website.')
            : null,
        negativeReviews > 0
          ? (locale === 'hu'
              ? `${negativeReviews} negatív vélemény található.`
              : `${negativeReviews} negative Bewertungen gefunden.`)
          : (locale === 'hu'
              ? 'A weboldal nem tartalmaz strukturált adatokat - mi segítünk ezeket közzétenni, ezzel tanítva az AI-t.'
              : 'Die Website enthält keine strukturierten Daten (Schema-Markup).'),
      ].filter(issue => issue !== null) as string[]; // Remove null entries
      
      // Add position-based issues with city name
      // Note: Position is average across all test questions (10 questions total: 5 Hungarian + 5 German)
      const totalQuestions = 10; // 5 Hungarian + 5 German questions
      
      if (aiVisibility.gemini.visible && aiVisibility.gemini.position && aiVisibility.gemini.position > 1) {
        if (aiVisibility.gemini.position <= 3) {
          criticalIssues.push(
            locale === 'hu'
              ? `A Gemini AI-ban átlagosan ${aiVisibility.gemini.position}. helyen szerepel ${cityName ? `${cityName} településen` : ''} ${totalQuestions} átlag kérdés között, nem az első helyen.`
              : `Erscheint durchschnittlich auf Platz ${aiVisibility.gemini.position} bei Gemini AI in ${cityName || ''} über ${totalQuestions} Testfragen, nicht auf Platz 1.`
          );
        } else {
          criticalIssues.push(
            locale === 'hu'
              ? `A Gemini AI-ban átlagosan csak ${aiVisibility.gemini.position}. helyen szerepel ${cityName ? `${cityName} településen` : ''} ${totalQuestions} átlag kérdés között (nem az első 3-ban).`
              : `Erscheint durchschnittlich nur auf Platz ${aiVisibility.gemini.position} bei Gemini AI in ${cityName || ''} über ${totalQuestions} Testfragen (nicht in den Top 3).`
          );
        }
      } else if (!aiVisibility.gemini.visible) {
        criticalIssues.push(
          locale === 'hu'
            ? `A Gemini AI nem ajánlja a szállodát ${cityName ? `${cityName} településen` : ''} (nem szerepel az ajánlások között).`
            : `Gemini AI empfiehlt das Hotel nicht in ${cityName || ''} (erscheint nicht in den Empfehlungen).`
        );
      }
      
      if (aiVisibility.chatgpt.visible && aiVisibility.chatgpt.position && aiVisibility.chatgpt.position > 1) {
        if (aiVisibility.chatgpt.position <= 3) {
          criticalIssues.push(
            locale === 'hu'
              ? `A ChatGPT-ben átlagosan ${aiVisibility.chatgpt.position}. helyen szerepel ${cityName ? `${cityName} településen` : ''} ${totalQuestions} átlag kérdés között, nem az első helyen.`
              : `Erscheint durchschnittlich auf Platz ${aiVisibility.chatgpt.position} bei ChatGPT in ${cityName || ''} über ${totalQuestions} Testfragen, nicht auf Platz 1.`
          );
        } else {
          criticalIssues.push(
            locale === 'hu'
              ? `A ChatGPT-ben átlagosan csak ${aiVisibility.chatgpt.position}. helyen szerepel ${cityName ? `${cityName} településen` : ''} ${totalQuestions} átlag kérdés között (nem az első 3-ban).`
              : `Erscheint durchschnittlich nur auf Platz ${aiVisibility.chatgpt.position} bei ChatGPT in ${cityName || ''} über ${totalQuestions} Testfragen (nicht in den Top 3).`
          );
        }
      } else if (!aiVisibility.chatgpt.visible) {
        criticalIssues.push(
          locale === 'hu'
            ? `A ChatGPT nem ajánlja a szállodát ${cityName ? `${cityName} településen` : ''} (nem szerepel az ajánlások között).`
            : `ChatGPT empfiehlt das Hotel nicht in ${cityName || ''} (erscheint nicht in den Empfehlungen).`
        );
      }
      
      // Generate recommendations for reaching first position
      const recommendations = [
        locale === 'hu'
          ? 'Azonnali válasz-automatizáció bekapcsolása a véleményekre'
          : 'Sofortige Aktivierung der automatischen Antworten auf Bewertungen',
        locale === 'hu'
          ? 'Strukturált adatok közzététele az AI tanításához - mi segítünk ebben'
          : 'Strukturierte Daten veröffentlichen, um die KI zu trainieren - wir helfen dabei',
        locale === 'hu'
          ? 'Folyamatos oldal karbantartás és heti riportok küldése - mi rendben tartjuk az oldalát'
          : 'Kontinuierliche Website-Wartung und wöchentliche Berichte - wir halten Ihre Website auf dem neuesten Stand',
      ];
      
      // Add position-specific recommendations
      if (aiVisibility.gemini.visible && aiVisibility.gemini.position && aiVisibility.gemini.position > 1) {
        recommendations.push(
          locale === 'hu'
            ? `Az első helyre kerüléshez: válaszolj minden véleményre 24 órán belül, növeld a pozitív vélemények arányát, és mi segítünk strukturált adatokat közzétenni, ezzel tanítva az AI-t`
            : `Um auf Platz 1 zu kommen: Beantworten Sie alle Bewertungen innerhalb von 24 Stunden, erhöhen Sie den Anteil positiver Bewertungen und fügen Sie strukturierte Daten zur Website hinzu`
        );
      }
      if (!aiVisibility.gemini.visible && !aiVisibility.chatgpt.visible) {
        recommendations.push(
          locale === 'hu'
            ? 'Az AI ajánlásokban való megjelenéshez: válaszolj a véleményekre, növeld az értékeléseket, és mi segítünk strukturált adatokat közzétenni, ezzel tanítva az AI-t'
            : 'Um in den KI-Empfehlungen zu erscheinen: Beantworten Sie Bewertungen, erhöhen Sie die Bewertungen und stellen Sie sicher, dass Ihre Website strukturierte Daten (Schema.org) enthält'
        );
      }
      
      // Calculate revenue loss proportionally (same logic as above)
      let revenueLossPercentage = '0-5%';
      
      if (calculatedTrustScore < 30) {
        revenueLossPercentage = '25-35%';
      } else if (calculatedTrustScore < 40) {
        revenueLossPercentage = '20-30%';
      } else if (calculatedTrustScore < 50) {
        revenueLossPercentage = '15-25%';
      } else if (calculatedTrustScore < 60) {
        revenueLossPercentage = '10-20%';
      } else if (calculatedTrustScore < 70) {
        revenueLossPercentage = '5-15%';
      } else if (calculatedTrustScore < 80) {
        revenueLossPercentage = '5-10%';
      }
      
      if (!aiVisibility.gemini.visible && !aiVisibility.chatgpt.visible && !aiVisibility.bing.visible) {
        if (revenueLossPercentage === '0-5%') revenueLossPercentage = '10-15%';
        else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '15-20%';
        else if (revenueLossPercentage === '5-15%') revenueLossPercentage = '20-25%';
        else if (revenueLossPercentage === '10-20%') revenueLossPercentage = '25-30%';
        else if (revenueLossPercentage === '15-25%') revenueLossPercentage = '30-35%';
        else if (revenueLossPercentage === '20-30%') revenueLossPercentage = '35-40%';
        else if (revenueLossPercentage === '25-35%') revenueLossPercentage = '40-45%';
      }
      
      const answeredRatio = totalReviewsFromGoogle > 0 ? (answeredCount / totalReviewsFromGoogle) : 0;
      if (answeredRatio < 0.1) {
        if (revenueLossPercentage === '0-5%') revenueLossPercentage = '10-15%';
        else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '15-20%';
        else if (revenueLossPercentage === '5-15%') revenueLossPercentage = '20-25%';
      } else if (answeredRatio < 0.2) {
        if (revenueLossPercentage === '0-5%') revenueLossPercentage = '5-10%';
        else if (revenueLossPercentage === '5-10%') revenueLossPercentage = '10-15%';
      }
      
      aiAnalysis = {
        trustScore: calculatedTrustScore, // Deterministic
        aiVisibility: aiVisibility, // With positions
        unansweredReviews: estimatedUnanswered, // Deterministic
        totalReviews: totalReviewsFromGoogle, // Total reviews from Google
        answeredReviews: answeredCount, // Number of answered reviews
        criticalIssues: criticalIssues,
        sampleReply: sampleReplyText,
        recommendations: recommendations,
        revenueLoss: revenueLossPercentage,
      };
    }
    
    // Ensure unansweredReviews is capped at 20+ for display (convert to string if > 20)
    if (typeof aiAnalysis.unansweredReviews === 'number' && aiAnalysis.unansweredReviews > 20) {
      aiAnalysis.unansweredReviews = '20+';
    }

    // Step 5: Send email with results (using Gmail SMTP)
    try {
      const emailSubject = locale === 'hu'
        ? `HotelTrust.ai Audit Eredmény - ${hotelName}`
        : `HotelTrust.ai Audit Ergebnis - ${hotelName}`;

      const emailHtml = `
        <h2>${locale === 'hu' ? 'Audit Eredmény' : 'Audit Ergebnis'}</h2>
        <p><strong>${locale === 'hu' ? 'Hotel' : 'Hotel'}:</strong> ${hotelName}</p>
        <p><strong>Trust Score:</strong> ${aiAnalysis.trustScore}/100</p>
        <h3>${locale === 'hu' ? 'AI Láthatóság' : 'KI-Sichtbarkeit'}</h3>
        <ul>
          <li>ChatGPT: ${aiAnalysis.aiVisibility.chatgpt ? '✅' : '❌'}</li>
          <li>Gemini: ${aiAnalysis.aiVisibility.gemini ? '✅' : '❌'}</li>
          <li>Bing: ${aiAnalysis.aiVisibility.bing ? '✅' : '❌'}</li>
        </ul>
        <h3>${locale === 'hu' ? 'Kritikus Hibák' : 'Kritische Probleme'}</h3>
        <ul>
          ${aiAnalysis.criticalIssues.map((issue: string) => `<li>${issue}</li>`).join('')}
        </ul>
        <h3>${locale === 'hu' ? 'Példa Válasz' : 'Beispielantwort'}</h3>
        <p>${aiAnalysis.sampleReply}</p>
      `;

      // Use Gmail SMTP if credentials are available
      const gmailUser = process.env.GMAIL_USER;
      const gmailPassword = process.env.GMAIL_APP_PASSWORD;

      if (gmailUser && gmailPassword) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPassword,
          },
        });

        await transporter.sendMail({
          from: `HotelTrust.ai <${gmailUser}>`,
          to: email,
          subject: emailSubject,
          html: emailHtml,
        });

        console.log('Email sent successfully via Gmail SMTP');
      } else {
        console.warn('Gmail SMTP credentials not configured. Skipping email send.');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      // Continue even if email fails
    }

    // Save audit entry to database
    try {
      const displayUnansweredReviews = estimatedUnanswered > 20 ? '20+' : estimatedUnanswered;
      saveAuditEntry({
        email: email.trim(),
        hotelName: hotelData.name,
        hotelPlaceId: hotelData.placeId,
        trustScore: calculatedTrustScore,
        aiVisibility: {
          chatgpt: aiVisibility.chatgpt,
          gemini: aiVisibility.gemini,
          bing: aiVisibility.bing,
        },
        unansweredReviews: displayUnansweredReviews,
        totalReviews: hotelData.totalReviews,
        answeredReviews: answeredCount,
        criticalIssues: aiAnalysis?.criticalIssues || [],
        recommendations: aiAnalysis?.recommendations || [],
        revenueLoss: aiAnalysis?.revenueLoss || '10-15%',
        locale,
      });
    } catch (saveError) {
      console.error('Error saving audit entry:', saveError);
      // Continue even if save fails
    }

    // Return results
    return NextResponse.json({
      success: true,
      data: {
        hotel: hotelData,
        reviews,
        analysis: aiAnalysis,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
