export type TourId = "blogs" | "explore" | "editor" | "detail";

export interface TourStep {
  /** CSS selector. Omit for a centred, un-anchored step. */
  element?: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
}

// Anchors are `data-tour="..."` attributes placed on the real UI, so the tour can't drift from it.
export const TOURS: Record<TourId, TourStep[]> = {
  blogs: [
    {
      title: "Welcome to Blogging ✨",
      description:
        "A private space to write and keep your blog posts. This short tour shows you around. You can leave it any time with Esc.",
    },
    {
      element: '[data-tour="new-blog"]',
      title: "Write a post",
      description: "Click New blog to open the editor. Published posts appear on the home page with your name and the date.",
      side: "bottom",
    },
    {
      element: '[data-tour="blog-list"]',
      title: "Your posts live here",
      description:
        "Newest first. Click any card to read, edit or delete that post. With more than nine posts, page links appear underneath.",
      side: "top",
    },
    {
      element: '[data-tour="filter-search"]',
      title: "Search & sort",
      description: "Find any of your posts by words in its title or content, and sort by date or title.",
      side: "bottom",
    },
    {
      element: '[data-tour="nav-explore"]',
      title: "Read other bloggers",
      description: "Explore shows posts from everyone. Search them, sort them, or filter by blogger name.",
      side: "bottom",
    },
    {
      element: '[data-tour="user-menu"]',
      title: "Your account",
      description: "Click your name to see the details on your account: name, email and age.",
      side: "bottom",
    },
    {
      element: '[data-tour="theme-toggle"]',
      title: "Light or dark",
      description: "Switch between the dark emerald and light mint themes. We remember your choice.",
      side: "bottom",
    },
    {
      element: '[data-tour="logout"]',
      title: "Signing out",
      description: "Log out when you're finished, especially on a shared computer.",
      side: "bottom",
    },
    {
      element: '[data-tour="tour-button"]',
      title: "Need this again?",
      description: "Click this ? button any time to replay the guide for the page you're on.",
      side: "bottom",
    },
  ],

  explore: [
    {
      element: '[data-tour="filter-search"]',
      title: "Search posts",
      description: "Type any word and the list narrows to posts whose title or content contains it.",
      side: "bottom",
    },
    {
      element: '[data-tour="filter-author"]',
      title: "Filter by blogger",
      description: "Type part of a blogger's name to see only their posts. It combines with the search box.",
      side: "bottom",
    },
    {
      element: '[data-tour="filter-sort"]',
      title: "Sort",
      description: "Order posts by date, title or blogger name.",
      side: "bottom",
    },
    {
      element: '[data-tour="blog-list"]',
      title: "Open a post",
      description: "Click any card to read it. Your own posts are marked \"You\", and only you can edit them.",
      side: "top",
    },
  ],

  editor: [
    {
      element: '[data-tour="blog-title"]',
      title: "Give it a title",
      description: "Pick something clear, between 3 and 200 characters.",
      side: "bottom",
    },
    {
      element: '[data-tour="editor-content"]',
      title: "Write your story",
      description:
        "Just start typing. Markdown shortcuts work too: type # and a space for a heading, or - and a space for a list.",
      side: "top",
    },
    {
      element: '[data-tour="tool-heading"]',
      title: "Headings",
      description: "Turn a line into a big title (H1) or a section heading (H2, H3).",
      side: "bottom",
    },
    {
      element: '[data-tour="tool-bold"]',
      title: "Bold & italic",
      description: "Select some words, then click B or I, or press Ctrl+B / Ctrl+I.",
      side: "bottom",
    },
    {
      element: '[data-tour="tool-link"]',
      title: "Add a link",
      description: "Select some text, click the link button and paste a web address. Leave the address empty to remove a link.",
      side: "bottom",
    },
    {
      element: '[data-tour="tool-bullet"]',
      title: "Lists",
      description: "Make a bulleted or numbered list. Press Enter twice to finish the list.",
      side: "bottom",
    },
    {
      element: '[data-tour="tool-code"]',
      title: "Code snippets",
      description:
        "Insert a code block, then pick its language from the dropdown that appears to get coloured syntax. Use the &lt;/&gt; button for short inline code.",
      side: "bottom",
    },
    {
      element: '[data-tour="publish"]',
      title: "Save it",
      description: "Publish saves your post. You can edit or delete it later from its page.",
      side: "top",
    },
  ],

  detail: [
    {
      element: '[data-tour="all-blogs"]',
      title: "Back to the list",
      description: "Return to the list of posts.",
      side: "bottom",
    },
    {
      element: '[data-tour="edit-blog"]',
      title: "Edit this post",
      description: "Reopen it in the editor to change the title or content.",
      side: "top",
    },
    {
      element: '[data-tour="delete-blog"]',
      title: "Delete",
      description: "Permanently removes the post. You'll be asked to confirm first.",
      side: "top",
    },
  ],
};

/** Which tour belongs to which page. */
export function tourIdForPath(pathname: string): TourId | null {
  if (pathname === "/blogs") return "blogs";
  if (pathname === "/explore") return "explore";
  if (pathname === "/blogs/new" || /^\/blogs\/[^/]+\/edit$/.test(pathname)) return "editor";
  if (/^\/blogs\/[^/]+$/.test(pathname)) return "detail";
  return null;
}
