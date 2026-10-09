import {
  BedDouble,
  BadgeCheck,
  CalendarCheck,
  ChefHat,
  Clock,
  Coffee,
  ConciergeBell,
  FileSignature,
  Gift,
  Globe2,
  KeyRound,
  MapPin,
  MessageSquareText,
  Plus,
  ShieldCheck,
  UserRound,
  Users,
  Utensils,
  Wine,
  Wrench,
  Languages,
  Hourglass,
  Handshake,
  Layers,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { T } from "./Lang";
import type { Key } from "@/lib/content/de";

function Head({ eyebrow, title, intro, center = false }: { eyebrow: Key; title: Key; intro?: Key; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">
        <T k={eyebrow} />
      </p>
      <h2 className="mt-3 text-3xl font-bold text-ink sm:text-[2.5rem] sm:leading-[1.1]">
        <T k={title} />
      </h2>
      {intro && (
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          <T k={intro} />
        </p>
      )}
    </div>
  );
}

export function TrustStrip() {
  const items = [
    { Icon: BadgeCheck, t: "trust.1.t", d: "trust.1.d" },
    { Icon: Handshake, t: "trust.2.t", d: "trust.2.d" },
    { Icon: CalendarCheck, t: "trust.3.t", d: "trust.3.d" },
    { Icon: ShieldCheck, t: "trust.4.t", d: "trust.4.d" },
  ] as const;
  return (
    <section className="bg-white">
      <div className="container-x grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ Icon, t, d }) => (
          <div key={t} className="flex gap-4">
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-meadow-100 text-forest-600">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                <T k={t} />
              </h3>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-mute">
                <T k={d} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Problem() {
  const items = [
    { Icon: Users, t: "problem.1.t", d: "problem.1.d" },
    { Icon: Hourglass, t: "problem.2.t", d: "problem.2.d" },
    { Icon: Layers, t: "problem.3.t", d: "problem.3.d" },
  ] as const;
  return (
    <section className="section bg-meadow-50">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal>
          <Head eyebrow="problem.eyebrow" title="problem.h" intro="problem.p" />
        </Reveal>
        <div className="grid gap-4">
          {items.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="flex gap-4 rounded-2xl bg-white p-5 shadow-card">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-sun-200 text-forest-900">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    <T k={t} />
                  </h3>
                  <p className="mt-1 text-ink-mute">
                    <T k={d} />
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Process() {
  const steps = [
    { t: "process.1.t", d: "process.1.d" },
    { t: "process.2.t", d: "process.2.d" },
    { t: "process.3.t", d: "process.3.d" },
    { t: "process.4.t", d: "process.4.d" },
  ] as const;
  return (
    <section id="ablauf" className="section bg-white">
      <div className="container-x">
        <Reveal>
          <Head eyebrow="process.eyebrow" title="process.h" center />
        </Reveal>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.t} className="h-full">
              <Reveal delay={i * 0.08} className="h-full">
              <div className="relative h-full rounded-3xl border-2 border-meadow-200 bg-white p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-600 font-display text-lg font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">
                  <T k={s.t} />
                </h3>
                <p className="mt-2 leading-relaxed text-ink-mute">
                  <T k={s.d} />
                </p>
              </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Positions() {
  const items = [
    { Icon: ChefHat, k: "pos.koch" },
    { Icon: Utensils, k: "pos.kueche" },
    { Icon: ConciergeBell, k: "pos.service" },
    { Icon: Coffee, k: "pos.fruehstueck" },
    { Icon: KeyRound, k: "pos.rezeption" },
    { Icon: BedDouble, k: "pos.housekeeping" },
    { Icon: Wine, k: "pos.bar" },
    { Icon: Wrench, k: "pos.technik" },
  ] as const;
  return (
    <section id="positionen" className="section bg-meadow-100">
      <div className="container-x">
        <Reveal>
          <Head eyebrow="pos.eyebrow" title="pos.h" intro="pos.p" center />
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map(({ Icon, k }, i) => (
            <li key={k} className="h-full">
              <Reveal delay={(i % 4) * 0.06} className="h-full">
              <div className="flex h-full flex-col items-start gap-4 rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-lift sm:p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sun-300 text-forest-900">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-bold leading-snug text-ink">
                  <T k={k} />
                </span>
              </div>
              </Reveal>
            </li>
          ))}
        </ul>
        <p className="mt-8 flex items-center justify-center gap-2 text-center font-semibold text-forest-800">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <T k="pos.more" />
        </p>
      </div>
    </section>
  );
}

export function Why() {
  const items = [
    { Icon: UserRound, t: "why.1.t", d: "why.1.d" },
    { Icon: CalendarCheck, t: "why.2.t", d: "why.2.d" },
    { Icon: Globe2, t: "why.3.t", d: "why.3.d" },
    { Icon: MessageSquareText, t: "why.4.t", d: "why.4.d" },
  ] as const;
  return (
    <section className="section bg-white">
      <div className="container-x">
        <Reveal>
          <Head eyebrow="why.eyebrow" title="why.h" />
        </Reveal>
        <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {items.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={(i % 2) * 0.08}>
              <div className="flex gap-5">
                <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-forest-600 text-white shadow-btn">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    <T k={t} />
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-mute">
                    <T k={d} />
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Hungarian() {
  const items = [
    { Icon: FileSignature, t: "eu.1.t", d: "eu.1.d" },
    { Icon: MapPin, t: "eu.2.t", d: "eu.2.d" },
    { Icon: Languages, t: "eu.3.t", d: "eu.3.d" },
  ] as const;
  return (
    <section className="section bg-forest-900 text-white">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow !text-sun-400">
            <T k="eu.eyebrow" />
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold sm:text-[2.5rem] sm:leading-[1.1]">
            <T k="eu.h" />
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="h-full rounded-3xl bg-forest-800 p-6 ring-1 ring-white/10">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sun-400 text-forest-900">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">
                  <T k={t} />
                </h3>
                <p className="mt-2 leading-relaxed text-white/75">
                  <T k={d} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Terms() {
  const items = [
    { Icon: Gift, t: "terms.1.t", v: "terms.1.v", d: "terms.1.d" },
    { Icon: Handshake, t: "terms.2.t", v: "terms.2.v", d: "terms.2.d" },
    { Icon: Clock, t: "terms.3.t", v: "terms.3.v", d: "terms.3.d" },
  ] as const;
  return (
    <section id="konditionen" className="section bg-meadow-50">
      <div className="container-x">
        <Reveal>
          <Head eyebrow="terms.eyebrow" title="terms.h" intro="terms.p" center />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map(({ Icon, t, v, d }, i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="h-full rounded-3xl bg-white p-7 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">
                    <T k={t} />
                  </p>
                  <Icon className="h-5 w-5 text-forest-600" aria-hidden="true" />
                </div>
                <p className="mt-3 font-display text-3xl font-bold leading-tight text-ink">
                  <T k={v} />
                </p>
                <p className="mt-3 leading-relaxed text-ink-mute">
                  <T k={d} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const n = [1, 2, 3, 4, 5, 6, 7] as const;
  return (
    <section id="faq" className="section bg-white">
      <div className="container-x max-w-3xl">
        <Reveal>
          <Head eyebrow="faq.eyebrow" title="faq.h" center />
        </Reveal>
        <div className="mt-10 divide-y divide-meadow-200 rounded-3xl border-2 border-meadow-200 bg-white">
          {n.map((i) => (
            <details key={i} className="group px-5 py-1 sm:px-7">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                <span>
                  <T k={`faq.${i}.q` as Key} />
                </span>
                <span
                  className="grid h-8 w-8 flex-none place-items-center rounded-full bg-meadow-100 text-forest-700 transition group-open:rotate-45 group-open:bg-forest-600 group-open:text-white"
                  aria-hidden="true"
                >
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <p className="pb-6 pr-10 leading-relaxed text-ink-soft">
                <T k={`faq.${i}.a` as Key} />
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
