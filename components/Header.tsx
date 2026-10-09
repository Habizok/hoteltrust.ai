import Link from "next/link";
import { Logo } from "./Logo";
import { T } from "./Lang";

const NAV = [
  { href: "/#ablauf", k: "nav.process" },
  { href: "/#positionen", k: "nav.positions" },
  { href: "/#konditionen", k: "nav.terms" },
  { href: "/#faq", k: "nav.faq" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest-900/10 bg-white/90 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" aria-label="HotelTrust">
          <Logo />
        </Link>
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-semibold text-ink-soft transition hover:text-forest-600">
              <T k={n.k} />
            </a>
          ))}
        </nav>
        <a href="/#anfrage" className="btn btn-primary !min-h-[2.6rem] !rounded-xl !px-5 !text-sm">
          <T k="nav.cta" />
        </a>
      </div>
    </header>
  );
}
