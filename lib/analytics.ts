// Analytics adattárolás
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const analyticsFile = path.join(dataDir, 'analytics.json');

// Biztosítjuk, hogy a data mappa létezik
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializáljuk a fájlt, ha nem létezik
if (!fs.existsSync(analyticsFile)) {
  fs.writeFileSync(analyticsFile, JSON.stringify([], null, 2));
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
  fs.writeFileSync(analyticsFile, JSON.stringify(entries, null, 2));
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
  fs.writeFileSync(analyticsFile, JSON.stringify(entries, null, 2));
  return true;
}
