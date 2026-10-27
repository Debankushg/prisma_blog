import { notFound } from "next/navigation";
import { getBlog } from "@/lib/data/blogs";
import { requireUser } from "@/lib/data/user";
import { BlogForm } from "./blog-form";

export async function EditBlog({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, blog] = await Promise.all([requireUser(), getBlog(id)]);
  // Anyone can read a post, but only its author can edit it.
  if (!blog || blog.authorId !== user.id) notFound();
  return <BlogForm mode="edit" blog={blog} />;
}
