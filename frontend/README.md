# Blogging: Frontend

A modern blogging web app. Visitors can read every published post without an account. Registered users can write posts in a rich-text editor, manage their own posts, browse everyone's posts with search, sort and filter, and use the site in a light or dark emerald-and-gold theme. A guided tour teaches new users how everything works.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS 4 · React Hook Form + Zod 4 · TipTap editor · react-markdown · driver.js

This app is the web client for the Express API in [`../backend`](../backend/README.md). It does not talk to a database; every piece of data comes from that API.

- [What the website does](#what-the-website-does)
- [Quick start](#quick-start)
- [Pages and routes](#pages-and-routes)
- [How the features are implemented](#how-the-features-are-implemented)
- [Project structure](#project-structure)
- [Data flow and the API layer](#data-flow-and-the-api-layer)
- [Next.js 16 specifics used](#nextjs-16-specifics-used)
- [Security](#security)
- [Scripts and environment](#scripts-and-environment)
- [Known limitations](#known-limitations)

---

## What the website does

| Audience | They can |
|---|---|
| **Anyone (no account)** | Read the home page, browse "Latest posts" with a blogger-name search, sort and paging, and open any post on its own public page |
| **Registered user** | Register and log in, write posts with headings, bold, links, lists and code snippets, edit and delete their own posts, browse everyone's posts on **Explore** (search, sort, filter by blogger), see their account details, switch light and dark themes, and replay a guided tour |

Posts are stored as Markdown. Authors are shown by **name** only, with the publish date.

---

## Quick start

Requires Node.js >= 20 and the backend API running (see [`../backend/README.md`](../backend/README.md)).

```bash
cd frontend
npm install
cp .env.example .env.local     # BACKEND_URL must point at the running API
npm run dev                    # http://localhost:3001
```

| Variable | Default | Meaning |
|---|---|---|
| `BACKEND_URL` | `http://localhost:3000` | URL of the Express API. **Server-side only**, never sent to the browser |
| `COOKIE_NAME` | `access_token` | Must match `COOKIE_NAME` in the backend's `.env` |

Start the backend first (`npm run dev` in `backend/`), then the frontend. If the API is down, public pages still render and show a friendly "couldn't load posts" message.

---

## Pages and routes

| Route | Who | What it shows |
|---|---|---|
| `/` | Public | Landing page and the **Latest posts** section (blogger search, sort, paging) |
| `/posts/[id]` | Public | A full post: title, author name, publish date, rendered Markdown, sign-up call to action |
| `/login` | Visitors | Email and password form. Signed-in users are redirected away |
| `/register` | Visitors | Name, email, age, password and confirm password |
| `/explore` | Login | Every blogger's posts with search, blogger filter and sort |
| `/blogs` | Login | **My blogs**: only your own posts, with search and sort |
| `/blogs/new` | Login | Rich-text editor to write a post |
| `/blogs/[id]` | Login | A post with its author. **Edit** and **Delete** appear only for the author |
| `/blogs/[id]/edit` | Login (author) | Editor pre-filled with the post. Non-authors get "not found" |
| `not-found` / `error` | Any | Friendly 404 and error pages |

The browser never talks to the API directly. All API calls go to this app's own `/api/v1/*`, which Next.js forwards to the backend (see [Data flow](#data-flow-and-the-api-layer)).

---

## How the features are implemented

### 1. Authentication (login, registration, sessions)

- **Forms:** [`login-form.tsx`](src/components/auth/login-form.tsx) and [`register-form.tsx`](src/components/auth/register-form.tsx) use React Hook Form with a Zod resolver. The schemas live in [`lib/validators/auth.ts`](src/lib/validators/auth.ts) and mirror the API's rules (password 8-72 characters with lowercase, uppercase and a digit; confirm password must match; age 13-120). The form types are `z.infer` of those schemas, so rules and types cannot drift apart.
- **Server errors on fields:** [`lib/forms.ts`](src/lib/forms.ts) (`applyApiError`) maps the API's per-field validation errors (for example "Email is already registered") onto the matching input.
- **Session:** on success the API sets an **httpOnly** cookie. The frontend never sees or stores the token. Logging out calls the API to clear it.
- **Redirects:**
  - [`proxy.ts`](src/proxy.ts) (Next 16's replacement for middleware) sends visitors without the cookie to `/login?next=<page>` for `/blogs/*` and `/explore/*`.
  - A cookie alone is not trusted. Pages call `requireUser()` ([`lib/data/user.ts`](src/lib/data/user.ts)), which asks the API who the user is, and an expired or stale cookie goes back to `/login`.
  - [`auth-guard.tsx`](src/components/auth/auth-guard.tsx) keeps signed-in users off the login and register pages (checked against the API, so there is no redirect loop).
  - The `next` parameter is sanitised ([`safeRedirectPath`](src/lib/utils.ts)) so it can only point at a path on this site.
- **Show/hide password:** [`password-field.tsx`](src/components/ui/password-field.tsx) adds an eye button. Each field toggles on its own and keeps the cursor and text.

### 2. Blog management (create, edit, delete)

- [`blog-form.tsx`](src/components/blog/blog-form.tsx) is one form used for both **create** and **edit** (a discriminated `mode` prop). Validation comes from [`lib/validators/blog.ts`](src/lib/validators/blog.ts) (title 3-200, content required).
- Writes go through [`lib/api/blogs.api.ts`](src/lib/api/blogs.api.ts), then the form navigates to the post and refreshes the server data.
- [`delete-blog-button.tsx`](src/components/blog/delete-blog-button.tsx) asks for confirmation, calls the API and returns to the list.
- **Ownership is enforced twice:** the UI hides Edit and Delete from non-authors ([`blog-detail.tsx`](src/components/blog/blog-detail.tsx)), and the edit page returns "not found" to them ([`edit-blog.tsx`](src/components/blog/edit-blog.tsx)). The API is the real gatekeeper.
- An expired session during a save sends the user back to `/login` instead of showing a confusing error.

### 3. Rich-text editor

- [`rich-text-editor.tsx`](src/components/editor/rich-text-editor.tsx) is built on **TipTap** (ProseMirror).
- **Toolbar:** H1/H2/H3, bold, italic, strikethrough, link, bulleted and numbered lists, quote, inline code, **code snippet**, divider, undo and redo. Keyboard shortcuts (Ctrl+B, Ctrl+I) and Markdown shortcuts (`# `, `- `) also work.
- **Code snippets** are syntax-highlighted with `lowlight`. When the cursor is inside a code block a **language picker** appears (13 languages), so the saved Markdown carries the language (` ```javascript `).
- **Links** open in a new tab with `rel="noopener noreferrer nofollow"`, and TipTap rejects unsafe protocols such as `javascript:`.
- **Stored as Markdown** (`@tiptap/markdown`), not HTML. This keeps the API simple and means a post can never contain raw HTML or scripts. Underline is disabled because Markdown has no underline.
- The editor is loaded **client-side only** through `next/dynamic` (`ssr: false`) with a skeleton, because TipTap uses `Math.random()`, which Next 16 refuses to prerender.

### 3b. Showing posts (Markdown rendering)

[`markdown-content.tsx`](src/components/blog/markdown-content.tsx) renders a post with `react-markdown` + `remark-gfm` (tables, lists) + `rehype-highlight` (code colours). Raw HTML in the source is not rendered and unsafe link protocols are stripped, so stored posts cannot inject script (tested with `<script>`, `<img onerror>` and `javascript:` links). Cards show a plain-text excerpt produced by `markdownToExcerpt` in [`lib/utils.ts`](src/lib/utils.ts), so Markdown symbols never appear in previews. Existing plain-text posts render fine, since plain text is valid Markdown.

### 4. Home page and public posts (no login)

- [`app/page.tsx`](src/app/page.tsx) renders the hero and a **Latest posts** section ([`public-post-list.tsx`](src/components/blog/public-post-list.tsx)) that streams in with a skeleton.
- Data comes from the public API through `publicGet` ([`lib/api/server.ts`](src/lib/api/server.ts)), which **sends no cookies**, so these pages are safe for anonymous visitors.
- Each card ([`public-post-card.tsx`](src/components/blog/public-post-card.tsx)) shows the title, an excerpt, the author's avatar and name, the publish date (`<time datetime>`) and a **Read more** link to `/posts/[id]`.
- [`/posts/[id]`](src/app/posts/[id]/page.tsx) shows the full post ([`public-post-detail.tsx`](src/components/blog/public-post-detail.tsx)) with a "write your own" call to action. Unknown or malformed ids give the 404 page.
- If the API is unreachable, the list catches the error and shows a message, so the whole home page never crashes.

### 5. Search, sort, filter and pagination

- [`blog-filters.tsx`](src/components/blog/blog-filters.tsx) is one configurable filter bar used on **Explore** (search + blogger + sort), **My blogs** (search + sort) and the **home page** (blogger + sort only).
- **The URL is the source of truth.** Typing is debounced (350 ms) and written to the query string (`/explore?q=docker&author=bob&sort=title&order=asc&page=2`). Links can be shared, and Back/Forward just work; a small ref keeps the inputs in sync with the URL without overwriting what the user is typing.
- [`lib/validators/blog-list.ts`](src/lib/validators/blog-list.ts) parses the URL with Zod `.catch()` defaults, so a hand-edited or stale URL falls back to safe values instead of erroring. It also builds clean URLs (defaults are left out) and defines the sort options.
- Changing a filter resets to page 1. [`pagination.tsx`](src/components/blog/pagination.tsx) keeps all active filters in its links and can add an `#anchor` so paging on the home page stays on the posts section.
- Pages show 9 posts. Empty results show a message with a **Clear** button.

### 6. Account details in the navbar

[`user-menu.tsx`](src/components/layout/user-menu.tsx) shows the signed-in user's avatar and name; clicking it opens a card with their name, email and age. It closes on Esc (focus returns to the button), on an outside click, or when toggled again. On phones the card anchors to the full-width navbar and the navbar itself slims down (logo mark only, no `?` button) so nothing overflows at 320 px.

### 7. Guided tour for new users

- Built with `driver.js`, loaded lazily only when a tour starts ([`lib/tour/start.ts`](src/lib/tour/start.ts)).
- Four tours, defined in one file ([`lib/tour/steps.ts`](src/lib/tour/steps.ts)): **My blogs** (9 steps), **Explore** (4), **Editor** (8) and **Single post** (3).
- Steps point at real UI through `data-tour="..."` attributes, so the tour cannot drift from the interface. Steps whose target is missing or hidden (for example on a phone) are skipped.
- **Plays once per user per page**, remembered in `localStorage` under `blogging:tour:v1:<userId>:<tour>`. Finishing or closing counts as seen; navigating away mid-tour does not.
- [`tour-controller.tsx`](src/components/tour/tour-controller.tsx) lives in the navbar. It auto-starts the current page's tour and renders the **?** button that replays it.
- Keyboard: Esc closes, arrow keys move between steps. Animations respect "reduced motion".

### 8. Theme: dark and light, emerald and gold

- All colours are CSS variables in [`globals.css`](src/app/globals.css), switched by `<html data-theme="dark|light">`, so every component restyles with no per-component logic.
- A tiny inline script in [`layout.tsx`](src/app/layout.tsx) sets the saved (or system) theme **before first paint**, so there is no flash. [`theme-toggle.tsx`](src/components/ui/theme-toggle.tsx) renders both icons and lets CSS show the right one, which avoids hydration mismatches.
- **Look:** a green gradient with a gold diamond lattice and grain texture, drifting blurred lights, frosted-glass cards with a gold hairline border, gold gradient headings and buttons with a light sweep, and Playfair Display headings over Geist body text.
- Code blocks always use a dark emerald panel, in both themes.

### 9. Favicon and branding

[`icon.svg`](src/app/icon.svg) (a faceted gold diamond), `favicon.ico` (16/32/48 px) and `apple-icon.png` (180 px) use Next's file conventions, so the `<link>` tags are generated automatically. The navbar logo ([`brand.tsx`](src/components/layout/brand.tsx)) uses the same diamond.

### 10. Accessibility and responsiveness

Labelled form fields with `aria-invalid` and error text, `aria-pressed` on toolbar toggles, `aria-expanded` on the account menu, `aria-live` result counts, "Read more about <title>" for screen readers, visible focus rings, and a layout checked at 320, 360 and 390 px wide with no horizontal overflow.

---

## Project structure

```
frontend/
├── next.config.ts            # Cache Components + rewrite of /api/* to the backend
├── .env.example
└── src/
    ├── proxy.ts              # redirects to /login when the session cookie is missing
    ├── app/
    │   ├── layout.tsx        # fonts, theme script, blurred background lights
    │   ├── page.tsx          # home (public)
    │   ├── globals.css       # theme variables, texture, components, editor, tour styles
    │   ├── (auth)/           # login, register (+ AuthGuard layout)
    │   ├── (app)/            # explore, blogs, blogs/new, blogs/[id], blogs/[id]/edit (+ navbar layout)
    │   ├── posts/[id]/       # public post page
    │   ├── icon.svg, favicon.ico, apple-icon.png
    │   └── not-found.tsx, error.tsx
    ├── components/
    │   ├── ui/               # Button, Card, Alert, TextField, PasswordField, ThemeToggle
    │   ├── layout/           # Navbar, NavLinks, UserMenu, LogoutButton, Brand, PublicHeader
    │   ├── auth/             # LoginForm, RegisterForm, AuthGuard
    │   ├── blog/             # cards, lists, detail, form, filters, pagination, markdown, public post views
    │   ├── editor/           # RichTextEditor (TipTap)
    │   └── tour/             # TourController
    ├── lib/
    │   ├── api/              # browser http client, server fetchers, typed endpoint modules, error class
    │   ├── data/             # server-side data access (user, blogs, public blogs)
    │   ├── validators/       # Zod schemas: auth, blog, list/URL params
    │   ├── tour/             # tour steps and runner
    │   ├── forms.ts, utils.ts
    ├── types/                # API envelope, User, Blog and public post types
    └── config/env.ts         # server-side env (BACKEND_URL, COOKIE_NAME)
```

---

## Data flow and the API layer

```
Browser ──► Next.js (this app, :3001) ──rewrite /api/*──► Express API (:3000) ──► PostgreSQL
```

**One origin, no CORS.** [`next.config.ts`](next.config.ts) rewrites `/api/:path*` to `BACKEND_URL`. Because the browser only ever talks to the frontend's own origin, the API's httpOnly cookie stays same-origin and the token is never readable from JavaScript.

| Where | How data is fetched |
|---|---|
| **Browser (client components)**: forms, delete, logout | [`lib/api/http.ts`](src/lib/api/http.ts) calls `/api/v1/...`; endpoint modules [`auth.api.ts`](src/lib/api/auth.api.ts) and [`blogs.api.ts`](src/lib/api/blogs.api.ts) give typed functions |
| **Server components (signed in)** | [`serverGet`](src/lib/api/server.ts) forwards the visitor's cookie to the API; wrapped in [`lib/data/*`](src/lib/data) |
| **Server components (public pages)** | [`publicGet`](src/lib/api/server.ts) sends no cookies |

- Every call returns the API's envelope `{ success, message, data }`, which [`parseApiResponse`](src/lib/api/parse.ts) unwraps into the typed `data` or throws a typed `ApiClientError` (status, message, field errors).
- A network failure becomes a friendly `ApiClientError` ("Cannot reach the server...").
- **End-to-end types:** API response types live in [`src/types`](src/types); request types are `z.infer` of the Zod schemas; functions return typed data, so a mismatch is a compile error.

---

## Next.js 16 specifics used

- **Cache Components** (`cacheComponents: true`): anything that reads cookies, route params or API data must sit inside `<Suspense>`, so pages are **partially prerendered**: the static shell is instant and user-specific data streams in with skeletons. Async content components such as `BlogList`, `BlogDetail` and `PublicPostList` exist for this reason.
- **`proxy.ts`** replaces `middleware.ts`.
- **`params` and `searchParams` are Promises**, awaited inside the Suspense'd components.
- TipTap is loaded with `next/dynamic` (`ssr: false`) because it is not prerenderable.
- driver.js and its CSS are imported lazily, only when a tour starts.

---

## Security

- The session token lives only in an **httpOnly** cookie (`Secure` in production, `SameSite=Lax`). The frontend never reads or stores it.
- Posts are Markdown rendered without raw HTML; unsafe link protocols are stripped; links get `noopener noreferrer nofollow`.
- The login `next` redirect is restricted to same-site paths.
- Public pages call the API **without** cookies, and public responses contain only the author's name.
- The proxy's cookie check is only an optimistic redirect. Authorization is always decided by the API.

---

## Scripts and environment

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:3001 |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Run the production build on port 3001 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## Known limitations

- **Validation rules are duplicated** in the Zod schemas here and in the backend. A change to a rule needs the same change in both places. A shared package or types generated from the API's `/api-docs.json` would remove this.
- **Tours are remembered per browser**, not per account, so a new device shows them again.
- **No forgot-password or reset-password pages yet.** The API endpoints exist and are ready for pages.
- **No per-post SEO metadata** (title and description for search results and link previews) on the public post pages.
- **No automated test suite.** Behaviour was verified manually and with scripted headless-browser runs.
