import { BlogModel } from '../models/blog.model';
import type { BlogDto, Paginated, PublicBlogDetail, PublicBlogSummary } from '../types';
import { ApiError } from '../utils/ApiError';
import { toExcerpt } from '../utils/excerpt';
import { toApiError } from '../utils/handleError';
import type { PublicListQuery } from '../validators/blog.validator';

// Mapping to explicit public shapes (instead of passing the DB row through) means a field added to the
// Blog model later can never leak to anonymous visitors by accident.
const toSummary = (blog: BlogDto): PublicBlogSummary => ({
  id: blog.id,
  title: blog.title,
  excerpt: toExcerpt(blog.content),
  author: { name: blog.author.name },
  publishedAt: blog.createdAt,
});

const toDetail = (blog: BlogDto): PublicBlogDetail => ({
  id: blog.id,
  title: blog.title,
  content: blog.content,
  author: { name: blog.author.name },
  publishedAt: blog.createdAt,
  updatedAt: blog.updatedAt,
});

export const PublicBlogService = {
  /** Every blog (newest first by default), optionally narrowed to bloggers whose name matches `author`. */
  async list({ page, limit, author, sort, order }: PublicListQuery): Promise<Paginated<PublicBlogSummary>> {
    try {
      const { items, total } = await BlogModel.list(
        { authorName: author },
        sort === 'publishedAt' ? 'createdAt' : sort, // `publishedAt` is the public name for `createdAt`
        order,
        (page - 1) * limit,
        limit,
      );
      return { items: items.map(toSummary), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    } catch (error) {
      throw toApiError(error, 'listing public blogs');
    }
  },

  async getById(id: string): Promise<PublicBlogDetail> {
    try {
      const blog = await BlogModel.findById(id);
      if (!blog) throw ApiError.notFound('Blog not found');
      return toDetail(blog);
    } catch (error) {
      throw toApiError(error, 'loading public blog');
    }
  },
};
