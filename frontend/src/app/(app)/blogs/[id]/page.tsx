import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogDetail, BlogDetailSkeleton } from "@/components/blog/blog-detail";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<BlogDetailSkeleton />}>
      <BlogDetail params={params} />
    </Suspense>
  );
}
