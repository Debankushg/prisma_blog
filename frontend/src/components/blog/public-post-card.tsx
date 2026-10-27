import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { PublicBlogSummary } from "@/types";
import { AuthorAvatar } from "./author-avatar";

export function PublicPostCard({ post }: { post: PublicBlogSummary }) {
  return (
    <Link href={`/posts/${post.id}`} className="group card-hover block">
      <Card className="flex h-full flex-col">
        <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-gold">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
        <div className="mt-auto pt-3">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-gold">
            Read more
            <span className="sr-only"> about {post.title}</span>
            <svg className="transition-transform duration-300 group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-3 text-xs text-muted">
          <span className="flex min-w-0 items-center gap-2">
            <AuthorAvatar name={post.author.name} />
            <span className="truncate">{post.author.name}</span>
          </span>
          <time dateTime={post.publishedAt} className="shrink-0">
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </Card>
    </Link>
  );
}
