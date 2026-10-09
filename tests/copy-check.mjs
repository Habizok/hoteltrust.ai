// Prüft die deutschen Texte auf Binde und Gedankenstriche (Stilregel des Inhabers)
// und darauf, dass die ungarische Fassung dieselben Schlüssel hat.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../lib/content/de.ts", import.meta.url), "utf8");
const huSrc = readFileSync(new URL("../lib/content/hu.ts", import.meta.url), "utf8");
const pairs = [...src.matchAll(/^\s*"([^"]+)":\s*\n?\s*"((?:[^"\\]|\\.)*)"/gm)];
let bad = 0;
for (const [, k, v] of pairs) {
  if (/[-‐-―−]/.test(v)) {
    console.error(`HYPHEN  ${k}: ${v}`);
    bad++;
  }
}
const keys = pairs.map((p) => p[1]);
const huKeys = new Set([...huSrc.matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]));
for (const k of keys) if (!huKeys.has(k)) { console.error(`HU FEHLT ${k}`); bad++; }
console.log(`${keys.length} Schlüssel geprüft, ${bad} Probleme`);
process.exit(bad ? 1 : 0);
