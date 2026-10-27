import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicBlogs } from "@/lib/data/public-blogs";
import { parseListParams } from "@/lib/validators/blog-list";
import { Pagination } from "./pagination";
import { PublicPostCard } from "./public-post-card";

export async function PublicPostList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // The public listing has no title/content search, so ignore any `q` in the URL.
  const params = { ...parseListParams(await searchParams), q: "" };

  try {
    const { items, meta } = await getPublicBlogs(params);

    if (items.length === 0) {
      return (
        <Card className="py-12 text-center">
          <p className="font-medium">
            {params.author
              ? `No posts by a blogger matching “${params.author}”.`
              : params.page > 1
                ? "No posts on this page."
                : "No posts have been published yet."}
          </p>
          {(params.author || params.page > 1) && (
            <Link href="/#posts" className={buttonStyles("secondary", "mt-4")}>
              {params.author ? "Clear search" : "Back to first page"}
            </Link>
          )}
        </Card>
      );
    }

    return (
      <>
        <p className="mb-4 text-sm text-muted" aria-live="polite">
          {meta.total} {meta.total === 1 ? "post" : "posts"}
          {params.author ? ` by bloggers matching “${params.author}”` : " published"}
        </p>
        <div className="grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <PublicPostCard key={post.id} post={post} />
          ))}
        </div>
        <Pagination basePath="/" params={params} totalPages={meta.totalPages} hash="posts" />
      </>
    );
  } catch (error) {
    // The home page must still render if the API is down.
    console.error("Could not load public posts", error);
    return (
      <Card className="py-10 text-center">
        <p className="font-medium">We couldn&apos;t load the latest posts right now.</p>
        <p className="mt-1 text-sm text-muted">Please try again in a moment.</p>
      </Card>
    );
  }
}

export function PublicPostListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton h-44" />
      ))}
    </div>
  );
}
