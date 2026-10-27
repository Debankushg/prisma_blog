import Link from "next/link";

export function Brand({
  href = "/",
  className = "",
  compactOnMobile = false,
}: {
  href?: string;
  className?: string;
  /** Show only the diamond mark below the `sm` breakpoint, to save space in busy headers. */
  compactOnMobile?: boolean;
}) {
  return (
    <Link href={href} aria-label="Blogging" className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="brand-gold" x1="10" y1="4" x2="54" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fbebaa" />
            <stop offset="0.5" stopColor="#d9b640" />
            <stop offset="1" stopColor="#9a7518" />
          </linearGradient>
        </defs>
        <path d="M32 4 60 32 32 60 4 32Z" fill="url(#brand-gold)" stroke="url(#brand-gold)" strokeWidth="4" strokeLinejoin="round" />
        <path d="M32 4 60 32 32 32Z" fill="#fff" opacity="0.3" />
        <path d="M32 18 46 32 32 46 18 32Z" fill="#052e21" stroke="#052e21" strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 18 46 32 32 32Z" fill="#0f5a43" />
      </svg>
      <span className={`gold-text font-display text-xl font-semibold tracking-tight${compactOnMobile ? " hidden sm:inline" : ""}`}>
        Blogging
      </span>
    </Link>
  );
}
