import { Check } from "lucide-react";
import { InquiryForm } from "./InquiryForm";
import { T } from "./Lang";

export function FormSection() {
  return (
    <section id="anfrage" className="relative overflow-hidden bg-meadow-100 section">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sun-300/50 blur-3xl" aria-hidden="true" />
      <div className="container-x relative grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <p className="eyebrow">
            <T k="form.eyebrow" />
          </p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-[2.5rem] sm:leading-[1.1]">
            <T k="form.h" />
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            <T k="form.p" />
          </p>
          <ul className="mt-7 space-y-3">
            {(["form.b1", "form.b2", "form.b3"] as const).map((k) => (
              <li key={k} className="flex items-center gap-3 font-semibold text-ink">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-forest-600 text-white">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                <T k={k} />
              </li>
            ))}
          </ul>
        </div>
        <InquiryForm />
      </div>
    </section>
  );
}
