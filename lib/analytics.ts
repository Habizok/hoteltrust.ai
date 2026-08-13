// Analytics adattárolás
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const analyticsFile = path.join(dataDir, 'analytics.json');

// Biztosítjuk, hogy a data mappa létezik (csak ha lehetséges)
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Inicializáljuk a fájlt, ha nem létezik (csak ha lehetséges)
  if (!fs.existsSync(analyticsFile)) {
    fs.writeFileSync(analyticsFile, JSON.stringify([], null, 2));
  }
} catch (error) {
  // Vercel read-only filesystem - ez oké, folytatjuk
  console.warn('Analytics file initialization skipped (read-only filesystem):', error);
}

export interface AnalyticsEntry {
  id: string;
  sessionId: string;
  country: string;
  countryCode: string;
  page: string;
  duration: number; // másodpercben
  timestamp: string;
  userAgent?: string;
  referrer?: string;
  device: string; // iOS, Android, Windows, Mac, Linux, stb.
  browser: string; // Chrome, Safari, Firefox, Edge, stb.
  os: string; // iOS, Android, Windows, macOS, Linux, stb.
  clicks: Array<{
    element: string;
    page: string;
    timestamp: string;
  }>;
  pagesViewed: Array<{
    page: string;
    timestamp: string;
    duration: number; // másodpercben
  }>;
}

export function saveAnalyticsEntry(entry: Omit<AnalyticsEntry, 'id' | 'timestamp'>): AnalyticsEntry {
  const entries = getAnalyticsEntries();
  const newEntry: AnalyticsEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
  };
  entries.push(newEntry);
  
  // Try to save to file, but don't crash if it fails (e.g., on Vercel's read-only filesystem)
  try {
    fs.writeFileSync(analyticsFile, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.warn('Failed to save analytics entry to file (read-only filesystem?):', error);
    // Continue without crashing - the entry is still returned
  }
  
  return newEntry;
}

export function getAnalyticsEntries(): AnalyticsEntry[] {
  try {
    const data = fs.readFileSync(analyticsFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function updateAnalyticsEntry(sessionId: string, updates: Partial<AnalyticsEntry>): boolean {
  const entries = getAnalyticsEntries();
  const index = entries.findIndex(e => e.sessionId === sessionId);
  
  if (index === -1) return false;
  
  entries[index] = { ...entries[index], ...updates };
  
  // Try to save to file, but don't crash if it fails (e.g., on Vercel's read-only filesystem)
  try {
    fs.writeFileSync(analyticsFile, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.warn('Failed to update analytics entry to file (read-only filesystem?):', error);
    // Continue without crashing - the update is still applied in memory
  }
  
  return true;
}
