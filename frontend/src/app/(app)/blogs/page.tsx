import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BlogList, BlogListSkeleton } from "@/components/blog/blog-list";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = { title: "My blogs" };

export default function MyBlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">My blogs</h1>
        <Link href="/blogs/new" className={buttonStyles("primary")} data-tour="new-blog">
          New blog
        </Link>
      </div>
      <Suspense fallback={<div className="skeleton mb-6 h-[4.5rem]" />}>
        <BlogFilters basePath="/blogs" showAuthor={false} />
      </Suspense>
      <div data-tour="blog-list">
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogList searchParams={searchParams} mine basePath="/blogs" />
        </Suspense>
      </div>
    </>
  );
}
