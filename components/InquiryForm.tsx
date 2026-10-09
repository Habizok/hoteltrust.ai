"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { de } from "@/lib/content/de";
import { ACC_KEYS, GER_KEYS, POSITION_KEYS, START_KEYS, STATES } from "@/lib/site";
import { useT, T } from "./Lang";

type State = "idle" | "sending" | "ok";

export function InquiryForm() {
  const t = useT();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [positions, setPositions] = useState<string[]>([]);
  const opened = useRef(Date.now());
  const okRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state === "ok") okRef.current?.focus();
  }, [state]);

  const toggle = (v: string) => setPositions((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      business: f.get("business"),
      contact: f.get("contact"),
      email: f.get("email"),
      phone: f.get("phone"),
      state: f.get("state"),
      positions,
      headcount: Number(f.get("headcount")),
      start: f.get("start"),
      accommodation: f.get("accommodation"),
      german: f.get("german"),
      message: f.get("message"),
      consent: f.get("consent") === "on",
      website: f.get("website"),
      elapsedMs: Date.now() - opened.current,
    };
    setState("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || de["form.err.net"]);
        setState("idle");
        return;
      }
      setState("ok");
    } catch {
      setError(t("form.err.net"));
      setState("idle");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-lift sm:p-10" role="status">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-meadow-100 text-forest-600">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </span>
        <h3 ref={okRef} tabIndex={-1} className="mt-5 font-display text-2xl font-bold text-ink outline-none">
          <T k="form.ok.h" />
        </h3>
        <p className="mt-2 text-ink-mute">
          <T k="form.ok.p" />
        </p>
      </div>
    );
  }

  const label = "mb-1.5 block text-sm font-bold text-ink";
  const consent = t("form.consent").split("{privacy}");

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl bg-white p-5 shadow-lift sm:p-8" aria-labelledby="form-title">
      <h3 id="form-title" className="font-display text-2xl font-bold text-ink">
        <T k="form.title" />
      </h3>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="f-business" className={label}>
            <T k="form.business" />
          </label>
          <input id="f-business" name="business" className="field" autoComplete="organization" required placeholder={t("form.business.ph")} />
        </div>
        <div>
          <label htmlFor="f-contact" className={label}>
            <T k="form.contact" />
          </label>
          <input id="f-contact" name="contact" className="field" autoComplete="name" required placeholder={t("form.contact.ph")} />
        </div>
        <div>
          <label htmlFor="f-email" className={label}>
            <T k="form.email" />
          </label>
          <input id="f-email" name="email" type="email" className="field" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="f-phone" className={label}>
            <T k="form.phone" />
          </label>
          <input id="f-phone" name="phone" type="tel" className="field" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="f-state" className={label}>
            <T k="form.state" />
          </label>
          <select id="f-state" name="state" className="field" required defaultValue="">
            <option value="" disabled>
              {t("form.state.ph")}
            </option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-headcount" className={label}>
            <T k="form.headcount" />
          </label>
          <input id="f-headcount" name="headcount" type="number" min={1} max={100} defaultValue={1} className="field" required />
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className={label}>
          <T k="form.positions" />
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {POSITION_KEYS.map((k) => {
            const v = de[k];
            const on = positions.includes(v);
            return (
              <label
                key={k}
                className={`inline-flex min-h-[2.75rem] cursor-pointer items-center rounded-full border-2 px-4 text-sm font-semibold transition focus-within:ring-4 focus-within:ring-forest-600/20 ${
                  on ? "border-forest-600 bg-forest-600 text-white" : "border-meadow-300 bg-white text-ink hover:border-forest-600"
                }`}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(v)} />
                {t(k)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="f-start" className={label}>
            <T k="form.start" />
          </label>
          <select id="f-start" name="start" className="field" required defaultValue="">
            <option value="" disabled>
              {t("form.start.ph")}
            </option>
            {START_KEYS.map((k) => (
              <option key={k} value={de[k]}>
                {t(k)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-german" className={label}>
            <T k="form.ger" />
          </label>
          <select id="f-german" name="german" className="field" required defaultValue="">
            <option value="" disabled>
              {t("form.ger.ph")}
            </option>
            {GER_KEYS.map((k) => (
              <option key={k} value={de[k]}>
                {t(k)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className={label}>
          <T k="form.acc" />
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {ACC_KEYS.map((k, i) => (
            <label
              key={k}
              className="inline-flex min-h-[2.75rem] cursor-pointer items-center gap-2 rounded-full border-2 border-meadow-300 bg-white px-4 text-sm font-semibold text-ink transition hover:border-forest-600 has-[:checked]:border-forest-600 has-[:checked]:bg-forest-600 has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-forest-600/20"
            >
              <input type="radio" name="accommodation" value={de[k]} required defaultChecked={i === 2} className="sr-only" />
              {t(k)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="f-msg" className={label}>
          <T k="form.msg" />
        </label>
        <textarea id="f-msg" name="message" rows={3} className="field !py-3" placeholder={t("form.msg.ph")} />
      </div>

      {/* Honeypot: für Menschen unsichtbar */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
        <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 flex-none accent-forest-600" />
        <span>
          {consent[0]}
          <Link href="/datenschutz" className="font-bold text-forest-700 underline underline-offset-2">
            {t("form.privacy")}
          </Link>
          {consent[1]}
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
          {error}
        </p>
      )}

      <button type="submit" disabled={state === "sending"} className="btn btn-primary mt-6 w-full disabled:opacity-70 sm:w-auto">
        {state === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> <T k="form.sending" />
          </>
        ) : (
          <>
            <T k="form.submit" /> <Send className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
