import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBlogs } from "@/lib/data/blogs";
import { requireUser } from "@/lib/data/user";
import { isFiltered, parseListParams } from "@/lib/validators/blog-list";
import { BlogCard } from "./blog-card";
import { Pagination } from "./pagination";

interface BlogListProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  /** true = only my posts, false = everyone's posts */
  mine: boolean;
  basePath: "/blogs" | "/explore";
}

export async function BlogList({ searchParams, mine, basePath }: BlogListProps) {
  const params = parseListParams(await searchParams);
  const [user, { items, meta }] = await Promise.all([requireUser(), getBlogs(params, mine)]);

  if (items.length === 0) {
    const filtered = isFiltered(params);
    return (
      <Card className="py-12 text-center">
        <p className="font-medium">
          {filtered
            ? "No posts match your search."
            : params.page > 1
              ? "No posts on this page."
              : mine
                ? "You haven't written anything yet."
                : "Nobody has posted yet. Be the first!"}
        </p>
        <Link
          href={filtered || params.page > 1 ? basePath : "/blogs/new"}
          className={buttonStyles(filtered || params.page > 1 ? "secondary" : "primary", "mt-4")}
        >
          {filtered ? "Clear search" : params.page > 1 ? "Back to first page" : "Write a blog"}
        </Link>
      </Card>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {meta.total} {meta.total === 1 ? "post" : "posts"}
        {isFiltered(params) && " found"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((blog) => (
          <BlogCard key={blog.id} blog={blog} isOwn={blog.authorId === user.id} />
        ))}
      </div>
      <Pagination basePath={basePath} params={params} totalPages={meta.totalPages} />
    </>
  );
}

export function BlogListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-36 skeleton" />
      ))}
    </div>
  );
}
