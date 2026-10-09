import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

/** Gelb markierte Lücke, die vor dem Livegang ausgefüllt werden muss. */
export function Todo({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-sun-400 px-1.5 py-0.5 font-semibold text-ink">[BITTE ERGÄNZEN: {children}]</mark>;
}

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="inhalt" className="bg-white">
        <div className="container-x max-w-3xl py-14 sm:py-20">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-forest-700 hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> HotelTrust
          </Link>
          <h1 className="mt-6 text-4xl font-bold text-ink sm:text-5xl">{title}</h1>
          <div className="mt-8 space-y-6 text-[1.02rem] leading-relaxed text-ink-soft [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
