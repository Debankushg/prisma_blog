import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { listHref, type ListParams } from "@/lib/validators/blog-list";

interface PaginationProps {
  basePath: string;
  params: ListParams;
  totalPages: number;
  /** Optional #anchor appended to the links, so paging keeps the reader's position. */
  hash?: string;
}

/** Prev/next links that keep the active search, filter and sort. */
export function Pagination({ basePath, params, totalPages, hash }: PaginationProps) {
  if (totalPages <= 1) return null;
  const { page } = params;
  const href = (target: number) => `${listHref(basePath, { ...params, page: target })}${hash ? `#${hash}` : ""}`;
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonStyles("secondary")}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={buttonStyles("secondary")}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
