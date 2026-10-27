export interface BlogAuthor {
  id: string;
  name: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: BlogAuthor;
  createdAt: string;
  updatedAt: string;
}

/** Public (anonymous) views of a post: author name and publish date only. */
export interface PublicBlogSummary {
  id: string;
  title: string;
  excerpt: string;
  author: { name: string };
  publishedAt: string;
}

export interface PublicBlogDetail {
  id: string;
  title: string;
  content: string;
  author: { name: string };
  publishedAt: string;
  updatedAt: string;
}
