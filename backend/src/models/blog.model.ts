import type { Prisma } from "@prisma/client";
import { prisma } from "../configs/database";
import type { BlogDto } from "../types";
import type { BLOG_SORT_FIELDS } from "../validators/blog.validator";

const withAuthor = {
  author: { select: { id: true, name: true } },
} satisfies Prisma.BlogInclude;

export interface BlogFilters {
  /** Restrict to one author's posts (used for "mine"). */
  authorId?: string | undefined;
  /** Search text matched against title and content. */
  q?: string | undefined;
  /** Blogger-name filter. */
  authorName?: string | undefined;
}

export type BlogSort = (typeof BLOG_SORT_FIELDS)[number];

const buildWhere = ({
  authorId,
  q,
  authorName,
}: BlogFilters): Prisma.BlogWhereInput => ({
  ...(authorId && { authorId }),
  ...(authorName && {
    author: { name: { contains: authorName, mode: "insensitive" } },
  }),
  ...(q && {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ],
  }),
});

// Ties (same blogger, same title) fall back to newest first, then `id`, so pagination is stable
// and the order inside a group is predictable.
const buildOrderBy = (
  sort: BlogSort,
  order: "asc" | "desc",
): Prisma.BlogOrderByWithRelationInput[] => {
  const primary: Prisma.BlogOrderByWithRelationInput =
    sort === "author"
      ? { author: { name: order } }
      : sort === "title"
        ? { title: order }
        : sort === "updatedAt"
          ? { updatedAt: order }
          : { createdAt: order };
  // Sorting by blogger or title groups rows; inside a group, newest first.
  const byDate: Prisma.BlogOrderByWithRelationInput[] =
    sort === "createdAt" || sort === "updatedAt" ? [] : [{ createdAt: "desc" }];
  return [primary, ...byDate, { id: "asc" }];
};

// Reads are open to any signed-in user; writes are always scoped by authorId so
// a user can never change another user's blog.
export const BlogModel = {
  create: (
    authorId: string,
    data: { title: string; content: string },
  ): Promise<BlogDto> =>
    prisma.blog.create({ data: { ...data, authorId }, include: withAuthor }),

  list: async (
    filters: BlogFilters,
    sort: BlogSort,
    order: "asc" | "desc",
    skip: number,
    take: number,
  ): Promise<{ items: BlogDto[]; total: number }> => {
    const where = buildWhere(filters);
    const [items, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        orderBy: buildOrderBy(sort, order),
        skip,
        take,
        include: withAuthor,
      }),
      prisma.blog.count({ where }),
    ]);
    return { items, total };
  },

  findById: (id: string): Promise<BlogDto | null> =>
    prisma.blog.findUnique({ where: { id }, include: withAuthor }),

  /** Returns null when the blog doesn't exist or isn't owned by the user. */
  updateOwned: async (
    id: string,
    authorId: string,
    data: { title?: string; content?: string },
  ): Promise<BlogDto | null> => {
    const { count } = await prisma.blog.updateMany({
      where: { id, authorId },
      data,
    });
    return count
      ? prisma.blog.findUnique({ where: { id }, include: withAuthor })
      : null;
  },

  deleteOwned: async (id: string, authorId: string): Promise<boolean> => {
    const { count } = await prisma.blog.deleteMany({ where: { id, authorId } });
    return count > 0;
  },
};
