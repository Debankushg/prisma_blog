import { Prisma } from "@prisma/client";
import { BlogModel } from "../models/blog.model";
import type { BlogDto, Paginated } from "../types";
import { ApiError } from "../utils/ApiError";
import { toApiError } from "../utils/handleError";
import type {
  CreateBlogInput,
  ListBlogsQuery,
  UpdateBlogInput,
} from "../validators/blog.validator";

const notFound = () => ApiError.notFound("Blog not found");

export const BlogService = {
  async create(userId: string, input: CreateBlogInput): Promise<BlogDto> {
    try {
      return await BlogModel.create(userId, input);
    } catch (error) {
      // A valid token whose account has since been deleted: the author FK no longer resolves.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        throw ApiError.unauthorized("Account no longer exists");
      }
      throw toApiError(error, "creating blog");
    }
  },

  async list(
    userId: string,
    { page, limit, q, author, sort, order, mine }: ListBlogsQuery,
  ): Promise<Paginated<BlogDto>> {
    try {
      const { items, total } = await BlogModel.list(
        { authorId: mine ? userId : undefined, q, authorName: author },
        sort,
        order,
        (page - 1) * limit,
        limit,
      );
      return {
        items,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw toApiError(error, "listing blogs");
    }
  },

  /** Any signed-in user may read any blog. */
  async getById(id: string): Promise<BlogDto> {
    try {
      const blog = await BlogModel.findById(id);
      if (!blog) throw notFound();
      return blog;
    } catch (error) {
      throw toApiError(error, "loading blog");
    }
  },

  // Foreign and missing blogs both yield 404, so a non-author learns nothing about ownership.
  async update(
    userId: string,
    id: string,
    input: UpdateBlogInput,
  ): Promise<BlogDto> {
    try {
      const blog = await BlogModel.updateOwned(id, userId, input);
      if (!blog) throw notFound();
      return blog;
    } catch (error) {
      throw toApiError(error, "updating blog");
    }
  },

  async remove(userId: string, id: string): Promise<void> {
    try {
      if (!(await BlogModel.deleteOwned(id, userId))) throw notFound();
    } catch (error) {
      throw toApiError(error, "deleting blog");
    }
  },
};
