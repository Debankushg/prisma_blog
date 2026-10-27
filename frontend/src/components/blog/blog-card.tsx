import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDate, markdownToExcerpt } from "@/lib/utils";
import type { Blog } from "@/types";
import { AuthorAvatar } from "./author-avatar";

export function BlogCard({ blog, isOwn }: { blog: Blog; isOwn: boolean }) {
  return (
    <Link href={`/blogs/${blog.id}`} className="group card-hover block">
      <Card className="flex h-full flex-col">
        <h2 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-gold">{blog.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{markdownToExcerpt(blog.content)}</p>
        <div className="mt-auto pt-3">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-gold">
            Read more
            <span className="sr-only"> about {blog.title}</span>
            <svg
              className="transition-transform duration-300 group-hover:translate-x-1"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-3 text-xs text-muted">
          <span className="flex min-w-0 items-center gap-2">
            <AuthorAvatar name={blog.author.name} />
            <span className="truncate">{isOwn ? "You" : blog.author.name}</span>
          </span>
          <span className="shrink-0">{formatDate(blog.createdAt)}</span>
        </div>
      </Card>
    </Link>
  );
}
