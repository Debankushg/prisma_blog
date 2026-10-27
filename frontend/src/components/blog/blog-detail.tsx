import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBlog } from "@/lib/data/blogs";
import { requireUser } from "@/lib/data/user";
import { formatDate } from "@/lib/utils";
import { AuthorAvatar } from "./author-avatar";
import { DeleteBlogButton } from "./delete-blog-button";
import { MarkdownContent } from "./markdown-content";

export async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, blog] = await Promise.all([requireUser(), getBlog(id)]);
  if (!blog) notFound();
  const isOwner = blog.authorId === user.id;

  const edited = blog.updatedAt !== blog.createdAt;

  return (
    <article className="space-y-4">
      <Link href={isOwner ? "/blogs" : "/explore"} className="text-sm text-gold hover:underline" data-tour="all-blogs">
        {isOwner ? "← My blogs" : "← Explore"}
      </Link>
      <Card>
        <h1 className="gold-text text-3xl font-semibold tracking-tight">{blog.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <AuthorAvatar name={blog.author.name} size={26} />
          <span className="font-medium text-ink">{isOwner ? "You" : blog.author.name}</span>
          <span aria-hidden>·</span>
          <span>
            {formatDate(blog.createdAt)}
            {edited && ` · edited ${formatDate(blog.updatedAt)}`}
          </span>
        </p>
        <div className="mt-6">
          <MarkdownContent source={blog.content} />
        </div>
      </Card>
      {isOwner && (
        <div className="flex items-start gap-2">
          <Link href={`/blogs/${blog.id}/edit`} className={buttonStyles("secondary")} data-tour="edit-blog">
            Edit
          </Link>
          <DeleteBlogButton id={blog.id} />
        </div>
      )}
    </article>
  );
}

export function BlogDetailSkeleton() {
  return <div className="h-72 skeleton" aria-busy="true" />;
}
