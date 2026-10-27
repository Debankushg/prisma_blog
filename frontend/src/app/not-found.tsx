import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="gold-text text-2xl font-semibold">Page not found</h1>
      <p className="text-muted">That page doesn&apos;t exist, or it isn&apos;t yours.</p>
      <Link href="/blogs" className={buttonStyles("primary")}>
        Back to my blogs
      </Link>
    </main>
  );
}
