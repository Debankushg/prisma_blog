import { z } from "zod";

export const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "title:desc", label: "Title Z–A" },
  { value: "author:asc", label: "Blogger A–Z" },
  { value: "author:desc", label: "Blogger Z–A" },
] as const;

/** The public API sorts by publish date, title or blogger only. */
export const PUBLIC_SORT_OPTIONS = SORT_OPTIONS.filter((o) => !o.value.startsWith("updatedAt"));

// `.catch` makes hand-edited or stale URLs fall back to defaults instead of erroring.
const text = z.string().trim().max(100).catch("");

export const listParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  q: text,
  author: text,
  sort: z.enum(["createdAt", "updatedAt", "title", "author"]).catch("createdAt"),
  order: z.enum(["asc", "desc"]).catch("desc"),
});

export type ListParams = z.infer<typeof listParamsSchema>;

type RawParams = Record<string, string | string[] | undefined>;

export function parseListParams(raw: RawParams): ListParams {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return listParamsSchema.parse({
    page: first(raw.page),
    q: first(raw.q),
    author: first(raw.author),
    sort: first(raw.sort),
    order: first(raw.order),
  });
}

export const isFiltered = (p: ListParams) => p.q !== "" || p.author !== "";

/** Builds a clean URL, leaving out defaults so shared links stay short. */
export function listHref(basePath: string, p: Partial<ListParams>): string {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.author) sp.set("author", p.author);
  if (p.sort && p.sort !== "createdAt") sp.set("sort", p.sort);
  if (p.order && p.order !== "desc") sp.set("order", p.order);
  if (p.page && p.page > 1) sp.set("page", String(p.page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
