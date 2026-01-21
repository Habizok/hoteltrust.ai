import { NextRequest, NextResponse } from 'next/server';

// Test endpoint for AI visibility check
// POST /api/test-ai-visibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotelName, cityName, locale = 'hu' } = body;

    console.log('Test AI Visibility request:', { hotelName, cityName, locale });

    if (!hotelName || !cityName) {
      return NextResponse.json(
        { error: 'Hotel name and city name are required' },
        { status: 400 }
      );
    }

    const originalHotelName = hotelName.trim();
    const results: {
      gemini: { visible: boolean; position: number | null; responses: Array<{ question: string; response: string; visible: boolean; matchedName?: string; position?: number | null }> };
      chatgpt: { visible: boolean; position: number | null; responses: Array<{ question: string; response: string; visible: boolean; matchedName?: string; position?: number | null }> };
    } = {
      gemini: { visible: false, position: null, responses: [] },
      chatgpt: { visible: false, position: null, responses: [] },
    };

    // Capitalize city name (first letter uppercase)
    const capitalizedCityName = cityName.trim().charAt(0).toUpperCase() + cityName.trim().slice(1).toLowerCase();
    
    // Get list of hotels in the city from Google Places API
    // This will be used as reference for the AI to ensure it only recommends hotels from this city
    let cityHotelsList: Array<{name: string, address: string}> = [];
    
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

    // Test questions
    const testQuestions: string[] = [];
    
    // Get country and region info for better context
    const country = locale === 'hu' ? 'Magyarország' : 'Österreich';
    const locationContext = locale === 'hu' 
      ? `${capitalizedCityName}, ${country}`
      : `${capitalizedCityName}, ${country}`;
    
    if (locale === 'hu') {
      // Less restrictive, more natural questions
      // Important: If there are fewer than 5 hotels, only list the real ones, don't hallucinate
      testQuestions.push(
        `Melyik szállodákat ajánlod ${locationContext} területén, ahol van ingyenes parkolás? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel, és írd oda, hogy nincs több találat. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`,
        `Melyik hoteleket ajánlod ${locationContext} területén, ahol van reggeli és közel van a központhoz? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`,
        `Melyik a legjobb ár-érték arányú szállodák ${locationContext} területén? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`,
        `Melyik szállodákat ajánlod ${locationContext} területén wellness szolgáltatással? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`,
        `Melyik a legjobb minősítésű hotelek ${locationContext} területén? Csak a neveket mondd, röviden, számozott listában. Ha nincs legalább 5 ilyen hotel, csak a valós találatokat sorold fel. Ne találj ki nem létező vagy más városban lévő hoteleket! Ellenőrizd a helyszínt: csak akkor ajánlj egy hotelt, ha biztosan tudod, hogy ${capitalizedCityName}-ban van.`
      );
    } else {
      testQuestions.push(
        `Welche Hotels empfehlen Sie in ${locationContext} mit kostenlosem Parken? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`,
        `Welche Hotels empfehlen Sie in ${locationContext}, die Frühstück anbieten und nah am Zentrum sind? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`,
        `Welche Hotels haben das beste Preis-Leistungs-Verhältnis in ${locationContext}? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`,
        `Welche Hotels empfehlen Sie in ${locationContext} mit Wellness-Angeboten? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`,
        `Welche sind die am besten bewerteten Hotels in ${locationContext}? Nur die Namen, kurz, nummerierte Liste. Wenn es weniger als 5 solche Hotels gibt, listen Sie nur die echten auf. Erfinden Sie keine nicht existierenden oder Hotels in anderen Städten! Überprüfen Sie den Standort: Empfehlen Sie ein Hotel nur, wenn Sie sicher wissen, dass es in ${capitalizedCityName} ist.`
      );
    }

    // Test with Gemini
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (geminiApiKey) {
        let geminiPositions: number[] = [];
        
        for (const question of testQuestions) {
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
                contents: [
                  {
                    parts: [
                      {
                        text: promptText,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.3, // Lower temperature for more accuracy, less hallucination
                  maxOutputTokens: 500,
                },
              }),
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            const questionResult: { question: string; response: string; visible: boolean; matchedName?: string; position?: number | null } = {
              question,
              response: responseText,
              visible: false,
            };

            // Check if hotel name appears in the response (improved fuzzy matching)
            const hotelNamesToCheck = [originalHotelName.toLowerCase().trim()];
            
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
                break;
              }
            }

            if (isVisible) {
              questionResult.visible = true;
              questionResult.matchedName = matchedHotelName;
              results.gemini.visible = true;
              
              // Find position
              const lines = responseText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
              let position: number | null = null;
              
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
                  // Check for numbered list (1., 2., etc.)
                  const numberMatch = lines[i].match(/^(\d+)\./);
                  if (numberMatch) {
                    position = parseInt(numberMatch[1], 10);
                    break;
                  }
                  
                  // Check previous lines for number
                  for (let j = Math.max(0, i - 2); j < i; j++) {
                    const prevNumberMatch = lines[j].match(/^(\d+)\./);
                    if (prevNumberMatch) {
                      position = parseInt(prevNumberMatch[1], 10);
                      break;
                    }
                  }
                  
                  // If no number found, count position by order
                  if (position === null) {
                    let count = 1;
                    for (let j = 0; j < i; j++) {
                      if (lines[j].length > 10) count++; // Count non-empty lines as items
                    }
                    position = count;
                  }
                }
              }
              
              questionResult.position = position;
              geminiPositions.push(position || 999);
            }
            
            results.gemini.responses.push(questionResult);
          }
        }
        
        if (geminiPositions.length > 0) {
          results.gemini.position = Math.min(...geminiPositions);
        } else {
          results.gemini.position = null;
        }
      }
    } catch (error) {
      console.error('Gemini test error:', error);
      // Add error response to results
      results.gemini.responses.push({
        question: 'Error occurred',
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        visible: false,
      });
    }

    // Test with ChatGPT
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (openaiApiKey) {
        let chatgptPositions: number[] = [];
        
        for (const question of testQuestions) {
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
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
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

          if (openaiResponse.ok) {
            const openaiData = await openaiResponse.json();
            const responseText = openaiData.choices?.[0]?.message?.content || '';
            
            const questionResult: { question: string; response: string; visible: boolean; matchedName?: string; position?: number | null } = {
              question,
              response: responseText,
              visible: false,
            };

            // Check if hotel name appears in the response (improved fuzzy matching)
            const hotelNamesToCheck = [originalHotelName.toLowerCase().trim()];
            
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
                break;
              }
            }

            if (isVisible) {
              questionResult.visible = true;
              questionResult.matchedName = matchedHotelName;
              results.chatgpt.visible = true;
              
              // Find position
              const lines = responseText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
              let position: number | null = null;
              
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
                    position = parseInt(numberMatch[1], 10);
                    break;
                  }
                  
                  for (let j = Math.max(0, i - 2); j < i; j++) {
                    const prevNumberMatch = lines[j].match(/^(\d+)\./);
                    if (prevNumberMatch) {
                      position = parseInt(prevNumberMatch[1], 10);
                      break;
                    }
                  }
                  
                  if (position === null) {
                    let count = 1;
                    for (let j = 0; j < i; j++) {
                      if (lines[j].length > 10) count++;
                    }
                    position = count;
                  }
                }
              }
              
              questionResult.position = position;
              chatgptPositions.push(position || 999);
            }
            
            results.chatgpt.responses.push(questionResult);
          }
        }
        
        if (chatgptPositions.length > 0) {
          results.chatgpt.position = Math.min(...chatgptPositions);
        } else {
          results.chatgpt.position = null;
        }
      }
    } catch (error) {
      console.error('ChatGPT test error:', error);
      // Add error response to results
      results.chatgpt.responses.push({
        question: 'Error occurred',
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        visible: false,
      });
    }

    console.log('Test AI Visibility results:', JSON.stringify(results, null, 2));

    return NextResponse.json({
      hotelName: originalHotelName,
      cityName,
      locale,
      results,
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
