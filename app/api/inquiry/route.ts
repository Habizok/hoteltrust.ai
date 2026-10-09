import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import nodemailer from "nodemailer";
import { parseInquiry, type StoredInquiry } from "@/lib/inquiry";
import { de } from "@/lib/content/de";
import { hu } from "@/lib/content/hu";

export const runtime = "nodejs";

// Erst bei Gebrauch erzeugen: ohne Schlüssel (lokal, CI) darf schon der Import nicht scheitern.
let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// Die Benachrichtigung geht an den Inhaber (Ungarisch). Die deutschen Auswahlwerte werden mitübersetzt.
const huOf = (v: string) => {
  const k = (Object.keys(de) as (keyof typeof de)[]).find((key) => de[key] === v);
  return k && hu[k] && hu[k] !== v ? `${v} (${hu[k]})` : v;
};

async function notify(entry: StoredInquiry): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return false;
  const to = process.env.ADMIN_EMAIL || user;

  const rows: [string, string][] = [
    ["Üzem", entry.business],
    ["Kapcsolattartó", entry.contact],
    ["E-mail", entry.email],
    ["Telefon", entry.phone || "nincs megadva"],
    ["Település", entry.town],
    ["Tartomány", entry.state],
    ["Pozíciók", entry.positions.map(huOf).join(", ")],
    ["Létszám", String(entry.headcount)],
    ["Kezdés", huOf(entry.start)],
    ["Szállás", huOf(entry.accommodation)],
    ["Nyelvtudás (több is lehet)", entry.languages.map(huOf).join(", ")],
    ["Párok jelentkezhetnek", huOf(entry.couples)],
    ["Üzenet (németül/ahogy beírta)", entry.message || "nincs"],
  ];

  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `"HotelTrust" <${user}>`,
    to,
    replyTo: entry.email,
    subject: `Új munkaerőigény: ${entry.business}, ${entry.town} (${entry.state})`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nID: ${entry.id}`,
    html:
      `<h2 style="font-family:Arial,sans-serif;color:#12301f">Új munkaerőigény érkezett</h2>` +
      `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">` +
      rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#5a6862;vertical-align:top">${k}</td><td style="padding:6px 0;color:#14201d">${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
        )
        .join("") +
      `</table><p style="color:#5a6862;font-size:12px">ID: ${entry.id}</p>`,
  });
  return true;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Spam-Schutz: verstecktes Feld und Mindest-Ausfüllzeit. Bots bekommen scheinbar Erfolg.
  const b = body as Record<string, unknown>;
  const tooFast = typeof b.elapsedMs === "number" && b.elapsedMs < 2500;
  if ((typeof b.website === "string" && b.website.length > 0) || tooFast) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseInquiry(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const db = getRedis();

  // Einfache Begrenzung: höchstens 5 Anfragen pro Stunde und IP.
  if (db) {
    try {
      const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
      const key = `ht:rate:${ip}`;
      const n = await db.incr(key);
      if (n === 1) await db.expire(key, 3600);
      if (n > 5) return NextResponse.json({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }, { status: 429 });
    } catch (e) {
      console.error("[inquiry] rate limit unavailable", e);
    }
  }

  const entry: StoredInquiry = {
    ...parsed.data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "neu",
  };

  let stored = false;
  if (db) {
    try {
      await db.set(`ht:inquiry:${entry.id}`, entry);
      await db.lpush("ht:inquiries", entry.id);
      stored = true;
    } catch (e) {
      console.error("[inquiry] store failed", e);
    }
  }

  let mailed = false;
  try {
    mailed = await notify(entry);
  } catch (e) {
    console.error("[inquiry] mail failed", e);
  }

  // Nur lokale Entwicklung ohne Zugangsdaten: Anfrage im Log zeigen statt zu scheitern.
  if (!stored && !mailed && process.env.NODE_ENV !== "production") {
    console.warn("[inquiry] DEV, nicht gespeichert:", entry);
    return NextResponse.json({ ok: true });
  }

  // Erfolg nur melden, wenn die Anfrage tatsächlich irgendwo angekommen ist.
  if (!stored && !mailed) {
    console.error("[inquiry] LOST – weder gespeichert noch gemailt", entry.id);
    return NextResponse.json(
      { error: "Ihre Anfrage konnte gerade nicht übermittelt werden. Bitte versuchen Sie es in einigen Minuten erneut." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
