"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { de, type Dict, type Key } from "@/lib/content/de";

/**
 * Die Website ist nur Deutsch. Für den Inhaber gibt es eine ungarische Ansicht
 * (Verständnis beim Prüfen). Sie ist für Besucher unsichtbar und wird erst bei Bedarf geladen:
 *  - einmalig freischalten mit  ?hu=1  (merkt sich der Browser), abschalten mit  ?hu=0
 *  - auf Vercel Preview Deployments und lokal immer verfügbar.
 * Der HTML Code für Suchmaschinen enthält ausschließlich Deutsch.
 */

type Lang = "de" | "hu";
type Ctx = { lang: Lang; dict: Dict; t: (k: Key) => string };

const LangContext = createContext<Ctx>({ lang: "de", dict: de, t: (k) => de[k] });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("de");
  const [hu, setHu] = useState<Dict | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let on = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";
    try {
      const p = new URLSearchParams(window.location.search).get("hu");
      if (p === "1") localStorage.setItem("ht-hu", "1");
      if (p === "0") localStorage.removeItem("ht-hu");
      if (localStorage.getItem("ht-hu") === "1") on = true;
      if (on && localStorage.getItem("ht-lang") === "hu") setLang("hu");
    } catch {}
    setEnabled(on);
  }, []);

  useEffect(() => {
    if (lang === "hu" && !hu) import("@/lib/content/hu").then((m) => setHu(m.hu));
  }, [lang, hu]);

  const toggle = useCallback(() => {
    const next: Lang = lang === "de" ? "hu" : "de";
    setLang(next);
    try {
      localStorage.setItem("ht-lang", next);
    } catch {}
  }, [lang]);

  const dict = lang === "hu" && hu ? hu : de;
  const value = useMemo<Ctx>(() => ({ lang, dict, t: (k) => dict[k] }), [lang, dict]);

  return (
    <LangContext.Provider value={value}>
      {children}
      {enabled && (
        <button
          type="button"
          onClick={toggle}
          className="fixed bottom-4 right-4 z-[60] rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-lift ring-2 ring-sun-300 hover:bg-forest-800"
          aria-label="Nyelv váltása: német eredeti és magyar fordítás"
        >
          {lang === "de" ? "HU  Magyar fordítás" : "DE  Német eredeti"}
        </button>
      )}
    </LangContext.Provider>
  );
}

export const useT = () => useContext(LangContext).t;

/** *Wort* wird zu einer Hervorhebung. */
export function rich(s: string): React.ReactNode {
  return s.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? <em key={i}>{part.slice(1, -1)}</em> : part,
  );
}

export function T({ k }: { k: Key }) {
  const t = useT();
  return <>{rich(t(k))}</>;
}
