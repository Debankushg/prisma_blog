import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BlogList, BlogListSkeleton } from "@/components/blog/blog-list";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Explore</h1>
        <p className="mt-1 text-muted">Read what everyone is writing. Search, sort, or filter by blogger.</p>
      </div>
      <Suspense fallback={<div className="skeleton mb-6 h-[4.5rem]" />}>
        <BlogFilters basePath="/explore" showAuthor />
      </Suspense>
      <div data-tour="blog-list">
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogList searchParams={searchParams} mine={false} basePath="/explore" />
        </Suspense>
      </div>
    </>
  );
}
