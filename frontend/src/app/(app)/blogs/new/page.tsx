import type { Metadata } from "next";
import { BlogForm } from "@/components/blog/blog-form";

export const metadata: Metadata = { title: "New blog" };

export default function NewBlogPage() {
  return <BlogForm mode="create" />;
}
