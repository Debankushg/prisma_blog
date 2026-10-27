import "server-only";
import { redirect } from "next/navigation";
import { ApiClientError } from "@/lib/api/errors";
import { serverGet } from "@/lib/api/server";
import type { Blog, Paginated } from "@/types";
import type { ListParams } from "@/lib/validators/blog-list";

async function authed<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 401) redirect("/login");
    throw err;
  }
}

export const getBlogs = (params: ListParams, mine: boolean, limit = 9) => {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(limit),
    sort: params.sort,
    order: params.order,
    mine: String(mine),
  });
  if (params.q) qs.set("q", params.q);
  if (params.author) qs.set("author", params.author);
  return authed(() => serverGet<Paginated<Blog>>(`/blogs?${qs}`));
};

/** Returns null when the blog doesn't exist. Any signed-in user may read any blog. */
export const getBlog = (id: string) =>
  authed(async () => {
    try {
      return await serverGet<Blog>(`/blogs/${encodeURIComponent(id)}`);
    } catch (err) {
      if (err instanceof ApiClientError && (err.status === 404 || err.status === 422)) return null;
      throw err;
    }
  });
