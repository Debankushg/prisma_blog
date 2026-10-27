import Link from "next/link";
import { Suspense } from "react";
import { BlogFilters } from "@/components/blog/blog-filters";
import { PublicPostList, PublicPostListSkeleton } from "@/components/blog/public-post-list";
import { PublicHeader } from "@/components/layout/public-header";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PUBLIC_SORT_OPTIONS } from "@/lib/validators/blog-list";

const features = [
  { title: "Published for everyone", text: "Every post appears on the home page with your name and publish date, readable without an account." },
  { title: "Edit anytime", text: "Refine a title or rewrite a paragraph whenever inspiration strikes." },
  { title: "Secure sessions", text: "Your login lives in an httpOnly cookie that scripts can never read." },
];

export default function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4">
      <PublicHeader />

      <main className="flex flex-1 flex-col items-center gap-14 py-12 text-center">
        <div className="fade-up max-w-2xl space-y-6 pt-6">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">A modern writing studio</p>
          <h1 className="gold-text text-5xl font-semibold leading-[1.1] tracking-tight sm:text-7xl">Your words, in gold.</h1>
          <p className="text-lg text-muted">Write, edit and share your blog posts in one beautiful place.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/register" className={buttonStyles("primary", "px-6 py-3 text-base")}>
              Get started
            </Link>
            <Link href="/login" className={buttonStyles("secondary", "px-6 py-3 text-base")}>
              I have an account
            </Link>
          </div>
        </div>

        <div className="divider-gold w-full max-w-md" />

        <ul className="grid w-full gap-4 text-left sm:grid-cols-3">
          {features.map((f, i) => (
            <li key={f.title} className="fade-up" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
              <Card className="card-hover h-full">
                <h2 className="text-lg font-semibold text-gold">{f.title}</h2>
                <p className="mt-2 text-sm text-muted">{f.text}</p>
              </Card>
            </li>
          ))}
        </ul>

        <section id="posts" className="w-full scroll-mt-6 space-y-6">
          <div className="space-y-2">
            <h2 className="gold-text text-3xl font-semibold tracking-tight sm:text-4xl">Latest posts</h2>
            <p className="text-muted">Fresh writing from our bloggers. Open any post to read it, no account needed.</p>
          </div>
          <div className="text-left">
            <Suspense fallback={<div className="skeleton h-[4.5rem]" />}>
              <BlogFilters basePath="/" showAuthor showSearch={false} sortOptions={PUBLIC_SORT_OPTIONS} hash="posts" />
            </Suspense>
          </div>
          <Suspense fallback={<PublicPostListSkeleton />}>
            <PublicPostList searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
