"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isFiltered, listHref, parseListParams, SORT_OPTIONS, type ListParams } from "@/lib/validators/blog-list";

interface BlogFiltersProps {
  basePath: "/blogs" | "/explore" | "/";
  /** The blogger-name filter only makes sense when viewing everyone's posts. */
  showAuthor: boolean;
  /** Title/content search box. Off for the public listing, which searches by blogger only. */
  showSearch?: boolean;
  sortOptions?: readonly { value: string; label: string }[];
  /** #anchor appended to every URL, so filtering keeps the reader's place on the page. */
  hash?: string;
}

/** URL-driven search/sort/filter bar: the URL is the source of truth, so links and Back/Forward just work. */
export function BlogFilters({ basePath, showAuthor, showSearch = true, sortOptions, hash }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const current = parseListParams(Object.fromEntries(searchParams.entries()));

  const [q, setQ] = useState(current.q);
  const [author, setAuthor] = useState(current.author);
  // What we last wrote to the URL. Lets us tell our own update apart from Back/Forward or "Clear".
  const pushed = useRef({ q: current.q, author: current.author });

  useEffect(() => {
    if (current.q !== pushed.current.q) {
      pushed.current.q = current.q;
      setQ(current.q);
    }
    if (current.author !== pushed.current.author) {
      pushed.current.author = current.author;
      setAuthor(current.author);
    }
  }, [current.q, current.author]);

  function go(next: Partial<ListParams>, mode: "push" | "replace" = "push") {
    const href = listHref(basePath, { ...current, page: 1, ...next }) + (hash ? `#${hash}` : "");
    startTransition(() => (mode === "push" ? router.push(href, { scroll: false }) : router.replace(href, { scroll: false })));
  }

  // Debounce typing so we don't refetch on every keystroke.
  useEffect(() => {
    if (q === pushed.current.q && author === pushed.current.author) return;
    const timer = setTimeout(() => {
      pushed.current = { q, author };
      go({ q: q.trim(), author: author.trim() }, "replace");
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, author]);

  const options = sortOptions ?? (showAuthor ? SORT_OPTIONS : SORT_OPTIONS.filter((o) => !o.value.startsWith("author")));
  const active = isFiltered(current) || q !== "" || author !== "";

  return (
    <div className={cn("surface-card mb-6 grid gap-3 p-4 sm:grid-cols-2", showSearch && showAuthor ? "lg:grid-cols-[1fr_14rem_12rem_auto]" : "lg:grid-cols-[1fr_12rem_auto]")} role="search" aria-busy={pending}>
      {showSearch && (
        <label className="relative block">
          <span className="sr-only">Search posts</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or content…"
            className="field pl-10"
            data-tour="filter-search"
            maxLength={100}
          />
          <SearchIcon />
        </label>
      )}

      {showAuthor && (
        <label className="relative block">
          <span className="sr-only">{showSearch ? "Filter by blogger name" : "Search by blogger name"}</span>
          <input
            type={showSearch ? "text" : "search"}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={showSearch ? "Blogger name…" : "Search by blogger name…"}
            className={cn("field", !showSearch && "pl-10")}
            data-tour="filter-author"
            maxLength={100}
          />
          {!showSearch && <SearchIcon />}
        </label>
      )}

      <label className="block">
        <span className="sr-only">Sort posts</span>
        <select
          value={`${current.sort}:${current.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split(":") as [ListParams["sort"], ListParams["order"]];
            go({ sort, order });
          }}
          className="field field-select"
          data-tour="filter-sort"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      {active && (
        <Button
          variant="secondary"
          onClick={() => {
            pushed.current = { q: "", author: "" };
            setQ("");
            setAuthor("");
            go({ q: "", author: "", sort: "createdAt", order: "desc" });
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-[0.85rem] top-1/2 -translate-y-1/2 text-muted"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
