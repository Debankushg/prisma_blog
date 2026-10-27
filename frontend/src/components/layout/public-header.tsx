import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Brand } from "./brand";

/** Header for pages anyone can open, signed in or not. */
export function PublicHeader() {
  return (
    <header className="flex h-20 items-center justify-between">
      <Brand />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/login" className={buttonStyles("secondary")}>
          Log in
        </Link>
        <Link href="/register" className={buttonStyles("primary", "hidden sm:inline-flex")}>
          Get started
        </Link>
      </div>
    </header>
  );
}
