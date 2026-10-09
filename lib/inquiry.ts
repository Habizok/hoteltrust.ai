import { ACCOMMODATION, GERMAN_LEVELS, POSITIONS, START_OPTIONS, STATES } from "./site";

export type Inquiry = {
  business: string;
  contact: string;
  email: string;
  phone: string;
  state: string;
  positions: string[];
  headcount: number;
  start: string;
  accommodation: string;
  german: string;
  message: string;
};

export type StoredInquiry = Inquiry & { id: string; createdAt: string; status: "neu" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max) : "";

/** Prüft und bereinigt die Formulardaten. Gibt entweder Daten oder eine Fehlermeldung zurück. */
export function parseInquiry(raw: unknown): { ok: true; data: Inquiry } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Ungültige Anfrage." };
  const r = raw as Record<string, unknown>;

  const business = clean(r.business, 120);
  const contact = clean(r.contact, 100);
  const email = clean(r.email, 160).toLowerCase();
  const phone = clean(r.phone, 40);
  const state = clean(r.state, 40);
  const start = clean(r.start, 40);
  const accommodation = clean(r.accommodation, 40);
  const german = clean(r.german, 60);
  const message = clean(r.message, 2000);
  const headcount = Math.round(Number(r.headcount));
  const positions = Array.isArray(r.positions)
    ? r.positions.map((p) => clean(p, 60)).filter((p) => POSITIONS.includes(p))
    : [];

  if (!business) return { ok: false, error: "Bitte geben Sie den Namen Ihres Betriebs an." };
  if (!contact) return { ok: false, error: "Bitte nennen Sie eine Ansprechperson." };
  if (!EMAIL.test(email)) return { ok: false, error: "Bitte geben Sie eine gültige Mailadresse an." };
  if (!STATES.includes(state)) return { ok: false, error: "Bitte wählen Sie das Bundesland." };
  if (positions.length === 0) return { ok: false, error: "Bitte wählen Sie mindestens eine Position." };
  if (!Number.isFinite(headcount) || headcount < 1 || headcount > 100)
    return { ok: false, error: "Bitte geben Sie die Anzahl der benötigten Personen an (1 bis 100)." };
  if (!START_OPTIONS.includes(start)) return { ok: false, error: "Bitte wählen Sie den gewünschten Starttermin." };
  if (!ACCOMMODATION.includes(accommodation))
    return { ok: false, error: "Bitte geben Sie an, ob eine Unterkunft vorhanden ist." };
  if (!GERMAN_LEVELS.includes(german)) return { ok: false, error: "Bitte wählen Sie das gewünschte Deutschniveau." };
  if (r.consent !== true) return { ok: false, error: "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu." };

  return {
    ok: true,
    data: { business, contact, email, phone, state, positions, headcount, start, accommodation, german, message },
  };
}
