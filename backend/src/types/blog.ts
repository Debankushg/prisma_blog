import type { Prisma } from '@prisma/client';

/** A blog plus its author's public details (never the email or password). */
export type BlogDto = Prisma.BlogGetPayload<{ include: { author: { select: { id: true; name: true } } } }>;

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * What anonymous visitors may see. Deliberately has no author id, email or other internals:
 * only the author's display name and the publish date.
 */
export interface PublicBlogSummary {
  id: string;
  title: string;
  /** Plain-text preview of the post. */
  excerpt: string;
  author: { name: string };
  publishedAt: Date;
}

export interface PublicBlogDetail extends Omit<PublicBlogSummary, 'excerpt'> {
  /** Full post body (Markdown). */
  content: string;
  updatedAt: Date;
}
