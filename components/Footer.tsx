import Link from "next/link";
import { Logo } from "./Logo";
import { T } from "./Lang";

export function Footer() {
  return (
    <footer className="bg-forest-900 text-white">
      <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            <T k="foot.tag" />
          </p>
        </div>
        <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
          <Link href="/impressum" className="text-white/85 hover:text-sun-400">
            <T k="foot.imp" />
          </Link>
          <Link href="/datenschutz" className="text-white/85 hover:text-sun-400">
            <T k="foot.dat" />
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-5 text-xs text-white/55">
          <T k="foot.copy" />
        </p>
      </div>
    </footer>
  );
}
