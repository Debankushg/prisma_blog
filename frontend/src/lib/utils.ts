export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));

/** Only allow same-site relative redirects (blocks open redirects like //evil.com). */
export const safeRedirectPath = (value: string | null, fallback = "/blogs") =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;

/** Plain-text preview of a Markdown post (for cards). */
export function markdownToExcerpt(markdown: string, max = 160): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
