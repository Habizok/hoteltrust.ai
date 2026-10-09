"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Minus, Plus, Send } from "lucide-react";
import { de, type Key } from "@/lib/content/de";
import { ACC_KEYS, COUPLE_KEYS, GER_KEYS, POSITION_KEYS, START_KEYS, STATES } from "@/lib/site";
import { useT, T } from "./Lang";

type Data = {
  positions: string[];
  headcount: number;
  start: string;
  languages: string[];
  accommodation: string;
  couples: string;
  message: string;
  business: string;
  town: string;
  state: string;
  contact: string;
  email: string;
  phone: string;
  consent: boolean;
};

const INITIAL: Data = {
  positions: [],
  headcount: 1,
  start: "",
  languages: [],
  accommodation: de["opt.acc.3"],
  couples: de["opt.couple.3"],
  message: "",
  business: "",
  town: "",
  state: "",
  contact: "",
  email: "",
  phone: "",
  consent: false,
};

type Errors = Partial<Record<keyof Data, Key>>;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(step: number, d: Data): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (d.positions.length === 0) e.positions = "err.positions";
    if (!d.start) e.start = "err.start";
  }
  if (step === 2) {
    if (d.languages.length === 0) e.languages = "err.lang";
  }
  if (step === 3) {
    if (!d.business.trim()) e.business = "err.business";
    if (!d.town.trim()) e.town = "err.town";
    if (!d.state) e.state = "err.state";
    if (!d.contact.trim()) e.contact = "err.contact";
    if (!EMAIL.test(d.email.trim())) e.email = "err.email";
    if (!d.consent) e.consent = "err.consent";
  }
  return e;
}

const FIELD_ORDER: (keyof Data)[] = ["positions", "start", "languages", "business", "town", "state", "contact", "email", "consent"];

const labelCls = "mb-1.5 block text-sm font-bold text-ink";

function Chip({ on, children, input }: { on: boolean; children: React.ReactNode; input: React.ReactNode }) {
  return (
    <label
      className={`inline-flex min-h-[2.75rem] cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition focus-within:ring-4 focus-within:ring-forest-600/20 ${
        on ? "border-forest-600 bg-forest-600 text-white" : "border-meadow-300 bg-white text-ink hover:border-forest-600"
      }`}
    >
      {input}
      {on && <Check className="h-4 w-4" aria-hidden="true" />}
      {children}
    </label>
  );
}

function ErrorText({ id, k }: { id: string; k?: Key }) {
  const t = useT();
  if (!k) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-semibold text-red-700">
      {t(k)}
    </p>
  );
}

export function InquiryForm() {
  const t = useT();
  const [step, setStep] = useState(1);
  const [d, setD] = useState<Data>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "ok">("idle");
  const [serverError, setServerError] = useState("");
  const opened = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);
  const card = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const prevStep = useRef(1);

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setD((cur) => ({ ...cur, [k]: v }));
    setErrors((cur) => (cur[k] ? { ...cur, [k]: undefined } : cur));
  };
  const togglePosition = (v: string) => set("positions", d.positions.includes(v) ? d.positions.filter((x) => x !== v) : [...d.positions, v]);

  // "Kaum oder keine Sprachkenntnisse" schließt konkrete Sprachen aus und umgekehrt.
  const NONE = de["opt.ger.5"];
  const toggleLang = (v: string) =>
    set(
      "languages",
      d.languages.includes(v) ? d.languages.filter((x) => x !== v) : v === NONE ? [v] : [...d.languages.filter((x) => x !== NONE), v],
    );

  // Nach einem Schrittwechsel Überschrift fokussieren und das Formular ins Bild holen.
  useEffect(() => {
    if (prevStep.current === step) return;
    prevStep.current = step;
    heading.current?.focus({ preventScroll: true });
    const r = card.current?.getBoundingClientRect();
    if (r && (r.top < 70 || r.top > window.innerHeight * 0.5)) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [step]);

  function focusFirst(e: Errors) {
    const key = FIELD_ORDER.find((k) => e[k]);
    if (!key) return;
    requestAnimationFrame(() => {
      const el = card.current?.querySelector<HTMLElement>(`[data-field="${key}"]`);
      (el?.matches("input,select,textarea,button") ? el : el?.querySelector<HTMLElement>("input,button"))?.focus();
    });
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (state === "sending") return;
    const e = validate(step, d);
    setErrors(e);
    if (Object.keys(e).length) return focusFirst(e);
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setServerError("");
    setState("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, website: honeypot.current?.value ?? "", elapsedMs: Date.now() - opened.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error || de["form.err.net"]);
        setState("idle");
        return;
      }
      setState("ok");
    } catch {
      setServerError(t("form.err.net"));
      setState("idle");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-lift sm:p-10" role="status">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-meadow-100 text-forest-600">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-ink">
          <T k="form.ok.h" />
        </h3>
        <p className="mt-2 text-ink-mute">
          <T k="form.ok.p" />
        </p>
      </div>
    );
  }

  const consentParts = t("form.consent").split("{privacy}");
  const steps: Key[] = ["form.step.1", "form.step.2", "form.step.3"];
  const field = (k: keyof Data) => ({
    "data-field": k,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `err-${k}` : undefined,
  });

  return (
    <form ref={card} onSubmit={onSubmit} noValidate className="scroll-mt-20 rounded-3xl bg-white shadow-lift" aria-labelledby="form-title">
      {/* Fortschritt */}
      <div className="border-b border-meadow-200 px-5 pb-5 pt-6 sm:px-8">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">{t("form.stepof").replace("{n}", String(step))}</p>
          <p className="text-sm font-semibold text-ink-mute">
            <T k="form.title" />
          </p>
        </div>
        <ol className="mt-3 grid grid-cols-3 gap-2">
          {steps.map((k, i) => {
            const n = i + 1;
            const done = n < step;
            const current = n === step;
            return (
              <li key={k} aria-current={current ? "step" : undefined}>
                <span className={`block h-1.5 rounded-full transition-colors ${done || current ? "bg-forest-600" : "bg-meadow-200"}`} />
                <span className={`mt-2 flex items-center gap-1.5 text-sm font-bold ${current ? "text-ink" : done ? "text-forest-700" : "text-ink-mute"}`}>
                  {done && <Check className="h-4 w-4" aria-hidden="true" />}
                  <T k={k} />
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8">
        <h3 id="form-title" ref={heading} tabIndex={-1} className="font-display text-2xl font-bold text-ink outline-none focus-visible:!outline-none">
          <T k={`form.h.${step}` as Key} />
        </h3>

        {step === 1 && (
          <div className="mt-6 space-y-6">
            <fieldset data-field="positions">
              <legend className={labelCls}>
                <T k="form.positions" />
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {POSITION_KEYS.map((k) => {
                  const v = de[k];
                  const on = d.positions.includes(v);
                  return (
                    <Chip
                      key={k}
                      on={on}
                      input={
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={on}
                          onChange={() => togglePosition(v)}
                          aria-describedby={errors.positions ? "err-positions" : undefined}
                        />
                      }
                    >
                      {t(k)}
                    </Chip>
                  );
                })}
              </div>
              <ErrorText id="err-positions" k={errors.positions} />
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <span id="hc-label" className={labelCls}>
                  <T k="form.headcount" />
                </span>
                <div className="inline-flex items-center gap-1 rounded-2xl border-2 border-meadow-300 bg-white p-1" role="group" aria-labelledby="hc-label">
                  <button
                    type="button"
                    onClick={() => set("headcount", Math.max(1, d.headcount - 1))}
                    className="grid h-11 w-11 place-items-center rounded-xl text-forest-700 transition hover:bg-meadow-100 disabled:opacity-35"
                    disabled={d.headcount <= 1}
                    aria-label={t("form.less")}
                  >
                    <Minus className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <output className="min-w-[3rem] text-center font-display text-xl font-bold text-ink" aria-live="polite">
                    {d.headcount}
                  </output>
                  <button
                    type="button"
                    onClick={() => set("headcount", Math.min(100, d.headcount + 1))}
                    className="grid h-11 w-11 place-items-center rounded-xl text-forest-700 transition hover:bg-meadow-100"
                    aria-label={t("form.more")}
                  >
                    <Plus className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="f-start" className={labelCls}>
                  <T k="form.start" />
                </label>
                <select id="f-start" className="field" value={d.start} onChange={(e) => set("start", e.target.value)} {...field("start")}>
                  <option value="" disabled>
                    {t("form.start.ph")}
                  </option>
                  {START_KEYS.map((k) => (
                    <option key={k} value={de[k]}>
                      {t(k)}
                    </option>
                  ))}
                </select>
                <ErrorText id="err-start" k={errors.start} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-6">
            <fieldset data-field="languages">
              <legend className={labelCls}>
                <T k="form.ger" />
              </legend>
              <p className="mb-2.5 text-sm text-ink-mute">{t("form.ger.hint")}</p>
              <div className="flex flex-wrap gap-2.5">
                {GER_KEYS.map((k) => {
                  const v = de[k];
                  const on = d.languages.includes(v);
                  return (
                    <Chip key={k} on={on} input={<input type="checkbox" className="sr-only" checked={on} onChange={() => toggleLang(v)} />}>
                      {t(k)}
                    </Chip>
                  );
                })}
              </div>
              <ErrorText id="err-languages" k={errors.languages} />
            </fieldset>

            <fieldset>
              <legend className={labelCls}>
                <T k="form.acc" />
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {ACC_KEYS.map((k) => (
                  <Chip
                    key={k}
                    on={d.accommodation === de[k]}
                    input={<input type="radio" name="accommodation" className="sr-only" checked={d.accommodation === de[k]} onChange={() => set("accommodation", de[k])} />}
                  >
                    {t(k)}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={labelCls}>
                <T k="form.couples" />
              </legend>
              <p className="mb-2.5 text-sm text-ink-mute">{t("form.couples.hint")}</p>
              <div className="flex flex-wrap gap-2.5">
                {COUPLE_KEYS.map((k) => (
                  <Chip
                    key={k}
                    on={d.couples === de[k]}
                    input={<input type="radio" name="couples" className="sr-only" checked={d.couples === de[k]} onChange={() => set("couples", de[k])} />}
                  >
                    {t(k)}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <details className="group rounded-2xl border-2 border-meadow-200 px-4" open={d.message.length > 0 || undefined}>
              <summary className="flex min-h-[3rem] cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-forest-700 [&::-webkit-details-marker]:hidden">
                <T k="form.msg" />
                <Plus className="h-4 w-4 transition group-open:rotate-45" aria-hidden="true" />
              </summary>
              <textarea id="f-msg" rows={3} className="field mb-4 !py-3" value={d.message} onChange={(e) => set("message", e.target.value)} placeholder={t("form.msg.ph")} aria-label={t("form.msg")} />
            </details>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="f-business" className={labelCls}>
                  <T k="form.business" />
                </label>
                <input id="f-business" className="field" autoComplete="organization" value={d.business} onChange={(e) => set("business", e.target.value)} placeholder={t("form.business.ph")} {...field("business")} />
                <ErrorText id="err-business" k={errors.business} />
              </div>
              <div>
                <label htmlFor="f-town" className={labelCls}>
                  <T k="form.town" />
                </label>
                <input id="f-town" className="field" autoComplete="address-level2" value={d.town} onChange={(e) => set("town", e.target.value)} placeholder={t("form.town.ph")} {...field("town")} />
                <ErrorText id="err-town" k={errors.town} />
              </div>
              <div>
                <label htmlFor="f-state" className={labelCls}>
                  <T k="form.state" />
                </label>
                <select id="f-state" className="field" value={d.state} onChange={(e) => set("state", e.target.value)} {...field("state")}>
                  <option value="" disabled>
                    {t("form.state.ph")}
                  </option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ErrorText id="err-state" k={errors.state} />
              </div>
              <div>
                <label htmlFor="f-contact" className={labelCls}>
                  <T k="form.contact" />
                </label>
                <input id="f-contact" className="field" autoComplete="name" value={d.contact} onChange={(e) => set("contact", e.target.value)} placeholder={t("form.contact.ph")} {...field("contact")} />
                <ErrorText id="err-contact" k={errors.contact} />
              </div>
              <div>
                <label htmlFor="f-email" className={labelCls}>
                  <T k="form.email" />
                </label>
                <input id="f-email" type="email" className="field" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} {...field("email")} />
                <ErrorText id="err-email" k={errors.email} />
              </div>
              <div>
                <label htmlFor="f-phone" className={labelCls}>
                  <T k="form.phone" />
                </label>
                <input id="f-phone" type="tel" className="field" autoComplete="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>

            {/* Honeypot: für Menschen unsichtbar */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label>
                Website
                <input ref={honeypot} tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
                <input type="checkbox" className="mt-1 h-5 w-5 flex-none accent-forest-600" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} {...field("consent")} />
                <span>
                  {consentParts[0]}
                  <Link href="/datenschutz" className="font-bold text-forest-700 underline underline-offset-2">
                    {t("form.privacy")}
                  </Link>
                  {consentParts[1]}
                </span>
              </label>
              <ErrorText id="err-consent" k={errors.consent} />
            </div>
          </div>
        )}

        {serverError && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
            {serverError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn btn-outline !min-h-[3rem] !px-5">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> <T k="form.back" />
            </button>
          ) : (
            <span />
          )}
          <button type="submit" disabled={state === "sending"} className="btn btn-primary disabled:opacity-70">
            {state === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> <T k="form.sending" />
              </>
            ) : step < 3 ? (
              <>
                <T k="form.next" /> <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <>
                <T k="form.submit" /> <Send className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
