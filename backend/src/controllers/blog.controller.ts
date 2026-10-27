import type { NextFunction, Request, Response } from 'express';
import { BlogService } from '../services/blog.service';
import type { BlogDto, Paginated } from '../types';
import { ApiError } from '../utils/ApiError';
import { sendSuccess } from '../utils/response';
import type { BlogParams, CreateBlogInput, ListBlogsQuery, UpdateBlogInput } from '../validators/blog.validator';

// `authenticate` guarantees req.auth; this narrows the type without a non-null assertion.
const userIdOf = (req: { auth?: { sub: string } }): string => {
  if (!req.auth) throw ApiError.unauthorized();
  return req.auth.sub;
};

// Every handler forwards failures to the central error middleware (src/middleware/error.ts)
// through next(error), so the response format stays consistent.

export const createBlog = async (
  req: Request<unknown, unknown, CreateBlogInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const blog = await BlogService.create(userIdOf(req), req.body);
    sendSuccess<BlogDto>(res, 201, 'Blog created', blog);
  } catch (error) {
    next(error);
  }
};

export const listBlogs = async (
  req: Request<unknown, unknown, unknown, ListBlogsQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await BlogService.list(userIdOf(req), req.query);
    sendSuccess<Paginated<BlogDto>>(res, 200, 'Blogs fetched', result);
  } catch (error) {
    next(error);
  }
};

export const getBlog = async (req: Request<BlogParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    userIdOf(req); // reading requires a signed-in user (enforced by `authenticate`)
    const blog = await BlogService.getById(req.params.id);
    sendSuccess<BlogDto>(res, 200, 'Blog fetched', blog);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (
  req: Request<BlogParams, unknown, UpdateBlogInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const blog = await BlogService.update(userIdOf(req), req.params.id, req.body);
    sendSuccess<BlogDto>(res, 200, 'Blog updated', blog);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req: Request<BlogParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await BlogService.remove(userIdOf(req), req.params.id);
    sendSuccess<null>(res, 200, 'Blog deleted', null);
  } catch (error) {
    next(error);
  }
};
