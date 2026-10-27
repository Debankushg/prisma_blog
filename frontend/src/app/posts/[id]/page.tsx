import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicPostDetail, PublicPostDetailSkeleton } from "@/components/blog/public-post-detail";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = { title: "Post" };

export default function PublicPostPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4">
      <PublicHeader />
      <main className="fade-up flex-1 pb-16 pt-4">
        <Suspense fallback={<PublicPostDetailSkeleton />}>
          <PublicPostDetail params={params} />
        </Suspense>
      </main>
    </div>
  );
}
