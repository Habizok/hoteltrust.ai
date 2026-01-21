// Egyszerű adattárolás JSON fájlban
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const waitlistFile = path.join(dataDir, 'waitlist.json');
const auditFile = path.join(dataDir, 'audit.json');

// Biztosítjuk, hogy a data mappa létezik
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializáljuk a fájlokat, ha nem léteznek
if (!fs.existsSync(waitlistFile)) {
  fs.writeFileSync(waitlistFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(auditFile)) {
  fs.writeFileSync(auditFile, JSON.stringify([], null, 2));
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
  criticalIssues: string[];
  recommendations: string[];
  revenueLoss: string;
  createdAt: string;
  locale: string;
}

export function saveWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'createdAt'>): WaitlistEntry {
  const entries = getWaitlistEntries();
  const newEntry: WaitlistEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  fs.writeFileSync(waitlistFile, JSON.stringify(entries, null, 2));
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

export function saveAuditEntry(entry: Omit<AuditEntry, 'id' | 'createdAt'>): AuditEntry {
  const entries = getAuditEntries();
  const newEntry: AuditEntry = {
    ...entry,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  fs.writeFileSync(auditFile, JSON.stringify(entries, null, 2));
  return newEntry;
}

export function getAuditEntries(): AuditEntry[] {
  try {
    const data = fs.readFileSync(auditFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
