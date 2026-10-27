import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogDetailSkeleton } from "@/components/blog/blog-detail";
import { EditBlog } from "@/components/blog/edit-blog";

export const metadata: Metadata = { title: "Edit blog" };

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<BlogDetailSkeleton />}>
      <EditBlog params={params} />
    </Suspense>
  );
}
