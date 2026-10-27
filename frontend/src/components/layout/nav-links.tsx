"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/explore", label: "Explore", tour: "nav-explore", match: (p: string) => p.startsWith("/explore") },
  { href: "/blogs", label: "My blogs", tour: "nav-mine", match: (p: string) => p.startsWith("/blogs") },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex items-center gap-0.5 sm:gap-1">
      {links.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            data-tour={l.tour}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-2.5",
              active ? "bg-[rgba(212,175,55,0.16)] text-gold" : "text-muted hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
