import { z } from 'zod';

const titleSchema = z.string().trim().min(3, 'Title must be at least 3 characters').max(200);
const contentSchema = z.string().trim().min(1, 'Content is required').max(50_000);

export const createBlogBodySchema = z.object({ title: titleSchema, content: contentSchema });

export const updateBlogBodySchema = z
  .object({ title: titleSchema, content: contentSchema })
  .partial()
  .refine((d) => d.title !== undefined || d.content !== undefined, { message: 'Provide a title or content to update' });

export const blogParamsSchema = z.object({ id: z.uuid('Invalid blog id') });

export const BLOG_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'author'] as const;

// Empty strings (e.g. `?q=`) mean "no filter".
const optionalText = z
  .string()
  .trim()
  .max(100, 'Must be at most 100 characters')
  .transform((v) => v || undefined)
  .optional();

export const listBlogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  /** Case-insensitive search in title and content. */
  q: optionalText,
  /** Case-insensitive filter on the blogger's name. */
  author: optionalText,
  sort: z.enum(BLOG_SORT_FIELDS).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  /** Only the signed-in user's own posts. */
  mine: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

// Public sort keys use the public field names (`publishedAt`), not the database column names.
export const PUBLIC_SORT_FIELDS = ['publishedAt', 'title', 'author'] as const;

// Public listing: pagination, blogger-name search and sorting. Anything else is rejected, not ignored.
export const publicListQuerySchema = listBlogsQuerySchema.pick({ page: true, limit: true, author: true, order: true }).extend({
  sort: z.enum(PUBLIC_SORT_FIELDS).default('publishedAt'),
});

export const createBlogSchema = z.object({ body: createBlogBodySchema });
export const updateBlogSchema = z.object({ params: blogParamsSchema, body: updateBlogBodySchema });
export const blogIdSchema = z.object({ params: blogParamsSchema });
export const listBlogsSchema = z.object({ query: listBlogsQuerySchema });
export const publicListBlogsSchema = z.object({ query: publicListQuerySchema });

export type CreateBlogInput = z.infer<typeof createBlogBodySchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogBodySchema>;
export type BlogParams = z.infer<typeof blogParamsSchema>;
export type ListBlogsQuery = z.infer<typeof listBlogsQuerySchema>;
export type PublicListQuery = z.infer<typeof publicListQuerySchema>;
