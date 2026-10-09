export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#1F7A45" />
      <path d="M8.5 19.5 20 9.5l11.5 10" fill="none" stroke="#F6D96B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 24.5l4.3 4.3L26.5 20" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-display text-[1.45rem] font-bold leading-none tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Hotel<span className={light ? "text-sun-400" : "text-forest-600"}>Trust</span>
      </span>
    </span>
  );
}
