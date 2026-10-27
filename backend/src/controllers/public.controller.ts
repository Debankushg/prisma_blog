import type { NextFunction, Request, Response } from 'express';
import { PublicBlogService } from '../services/public-blog.service';
import type { Paginated, PublicBlogDetail, PublicBlogSummary } from '../types';
import { sendSuccess } from '../utils/response';
import type { BlogParams, PublicListQuery } from '../validators/blog.validator';

// Public: no authentication. Failures are forwarded to the central error middleware.

export const listPublicBlogs = async (
  req: Request<unknown, unknown, unknown, PublicListQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await PublicBlogService.list(req.query);
    sendSuccess<Paginated<PublicBlogSummary>>(res, 200, 'Blogs fetched', result);
  } catch (error) {
    next(error);
  }
};

export const getPublicBlog = async (req: Request<BlogParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blog = await PublicBlogService.getById(req.params.id);
    sendSuccess<PublicBlogDetail>(res, 200, 'Blog fetched', blog);
  } catch (error) {
    next(error);
  }
};
