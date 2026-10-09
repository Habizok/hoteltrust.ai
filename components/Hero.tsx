import { ArrowRight, Check, Inbox, Loader, Search } from "lucide-react";
import { T } from "./Lang";

function Hills() {
  return (
    <svg
      viewBox="0 0 1440 260"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%] min-h-[110px] w-full"
      aria-hidden="true"
    >
      <path fill="#D7E8C5" d="M0 150C180 70 340 70 520 130s340 70 520-10 280-40 400 20v120H0Z" />
      <path fill="#BCD7A1" opacity=".75" d="M0 190C200 120 380 130 560 175s320 40 520-20 260-30 360 10v115H0Z" />
      <path fill="#FFFFFF" d="M0 232C240 190 420 200 620 224s360 20 560-14 180-10 260 8v42H0Z" />
    </svg>
  );
}

const ROWS = [
  { r: "card.r1", f: "card.f1", s: "card.s1", n: 2, Icon: Check, tone: "bg-forest-600 text-white" },
  { r: "card.r2", f: "card.f2", s: "card.s2", n: 3, Icon: Loader, tone: "bg-sun-400 text-ink" },
  { r: "card.r3", f: "card.f3", s: "card.s3", n: 2, Icon: Inbox, tone: "bg-meadow-200 text-forest-900" },
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-meadow-100">
      <div className="pointer-events-none absolute -right-20 -top-24 h-[26rem] w-[26rem] rounded-full bg-sun-300/60 blur-3xl" aria-hidden="true" />
      <Hills />
      <div className="container-x relative grid items-center gap-12 pb-36 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-44">
        <div>
          <p className="eyebrow">
            <T k="hero.eyebrow" />
          </p>
          <h1 className="mt-4 text-[2.6rem] font-bold leading-[1.03] text-ink sm:text-6xl lg:text-[4.2rem]">
            <span className="[&_em]:rounded-lg [&_em]:bg-sun-400 [&_em]:px-2 [&_em]:[box-decoration-break:clone]">
              <T k="hero.h1" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            <T k="hero.sub" />
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#anfrage" className="btn btn-primary">
              <T k="hero.cta1" /> <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#ablauf" className="btn btn-outline">
              <T k="hero.cta2" />
            </a>
          </div>
          <p className="mt-5 text-sm font-medium text-ink-mute">
            <T k="hero.note" />
          </p>
        </div>

        <div className="lg:pl-4">
          <div className="rounded-3xl border border-forest-900/10 bg-white p-5 shadow-lift sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">
                  <T k="card.title" />
                </p>
                <p className="mt-1 font-display text-xl font-bold text-ink">
                  <T k="card.season" />
                </p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-meadow-100 text-forest-600">
                <Search className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <ul className="mt-5 space-y-3">
              {ROWS.map(({ r, f, s, n, Icon, tone }) => (
                <li key={r} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-meadow-50 px-4 py-3.5 ring-1 ring-meadow-200">
                  <div>
                    <p className="font-bold text-ink">
                      <T k={r} /> <span className="font-medium text-ink-mute">· {n}×</span>
                    </p>
                    <p className="text-sm text-ink-mute">
                      <T k={f} />
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${tone}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <T k={s} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-mute">
              <T k="card.cap" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
