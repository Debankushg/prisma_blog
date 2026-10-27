import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicBlog } from "@/lib/data/public-blogs";
import { formatDate } from "@/lib/utils";
import { AuthorAvatar } from "./author-avatar";
import { MarkdownContent } from "./markdown-content";

export async function PublicPostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPublicBlog(id);
  if (!post) notFound();

  const edited = post.updatedAt !== post.publishedAt;

  return (
    <article className="space-y-6">
      <Link href="/#posts" className="text-sm text-gold hover:underline">
        ← All posts
      </Link>
      <Card className="p-7 sm:p-9">
        <h1 className="gold-text text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
          <AuthorAvatar name={post.author.name} size={28} />
          <span className="font-medium text-ink">{post.author.name}</span>
          <span aria-hidden>·</span>
          <span>
            Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {edited && <> · updated {formatDate(post.updatedAt)}</>}
          </span>
        </p>
        <div className="mt-8">
          <MarkdownContent source={post.content} />
        </div>
      </Card>
      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <h2 className="text-xl font-semibold text-gold">Have a story of your own?</h2>
        <p className="text-sm text-muted">Create a free account and publish your first post in minutes.</p>
        <div className="flex gap-3 pt-1">
          <Link href="/register" className={buttonStyles("primary")}>
            Get started
          </Link>
          <Link href="/login" className={buttonStyles("secondary")}>
            Log in
          </Link>
        </div>
      </Card>
    </article>
  );
}

export function PublicPostDetailSkeleton() {
  return <div className="skeleton h-80" aria-busy="true" />;
}
