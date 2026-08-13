// Egyszerű adattárolás JSON fájlban
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const waitlistFile = path.join(dataDir, 'waitlist.json');
const auditFile = path.join(dataDir, 'audit.json');

// Biztosítjuk, hogy a data mappa és a fájlok léteznek (csak helyi fejlesztésnél
// írható a fájlrendszer - Vercel-en ez read-only, ilyenkor a lenti függvények
// már amúgy is a lib/kv.ts Redis-alapú tárolására esnek vissza)
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(waitlistFile)) {
    fs.writeFileSync(waitlistFile, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(auditFile)) {
    fs.writeFileSync(auditFile, JSON.stringify([], null, 2));
  }
} catch (error) {
  console.error('Failed to initialize local data files (read-only filesystem, expected on Vercel):', error);
}

export interface WaitlistEntry {
  id: string;
  email: string;
  hotelName: string;
  createdAt: string;
  locale: string;
}

export interface AuditEntry {
  id: string;
  email: string;
  hotelName: string;
  hotelPlaceId: string | null;
  trustScore: number;
  aiVisibility: {
    chatgpt: { visible: boolean; position: number | null };
    gemini: { visible: boolean; position: number | null };
    bing: { visible: boolean; position: number | null };
  };
  unansweredReviews: number | string;
  totalReviews?: number;
  answeredReviews?: number;
  sampleReply?: string;
  criticalIssues: string[];
  recommendations: string[];
  revenueLoss: string;
  createdAt: string;
  locale: string;
}

export function saveWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'createdAt'>): WaitlistEntry {
  const newEntry: WaitlistEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  
  try {
    const entries = getWaitlistEntries();
    entries.push(newEntry);
    fs.writeFileSync(waitlistFile, JSON.stringify(entries, null, 2));
  } catch (error) {
    // Vercel read-only filesystem - csak logoljuk, de ne dobjunk hibát
    console.error('Failed to save waitlist entry to file (Vercel read-only filesystem):', error);
    // A newEntry-t visszaadjuk, hogy az email értesítés működjön
  }
  
  return newEntry;
}

export function getWaitlistEntries(): WaitlistEntry[] {
  try {
    const data = fs.readFileSync(waitlistFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveAuditEntry(entry: Omit<AuditEntry, 'id' | 'createdAt'> | AuditEntry): AuditEntry {
  // Ha már van ID, használjuk azt, különben generálunk újat
  const newEntry: AuditEntry = 'id' in entry && entry.id
    ? { ...entry, createdAt: entry.createdAt || new Date().toISOString() }
    : {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
  
  try {
    const entries = getAuditEntries();
    // Ha már létezik ez az ID, frissítjük, különben hozzáadjuk
    const existingIndex = entries.findIndex(e => e.id === newEntry.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }
    fs.writeFileSync(auditFile, JSON.stringify(entries, null, 2));
  } catch (error) {
    // Vercel read-only filesystem - csak logoljuk, de ne dobjunk hibát
    console.error('Failed to save audit entry to file (Vercel read-only filesystem):', error);
    // A newEntry-t visszaadjuk, hogy az email értesítés működjön
  }
  
  return newEntry;
}

export function getAuditEntryById(id: string): AuditEntry | null {
  try {
    const entries = getAuditEntries();
    return entries.find(e => e.id === id) || null;
  } catch (error) {
    return null;
  }
}

export function getAuditEntries(): AuditEntry[] {
  try {
    const data = fs.readFileSync(auditFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
