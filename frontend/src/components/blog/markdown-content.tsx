import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

/**
 * Renders a post's Markdown. Raw HTML in the source is NOT rendered (react-markdown's default),
 * and unsafe link protocols such as javascript: are stripped, so stored posts can't inject script.
 */
export function MarkdownContent({ source }: { source: string }) {
  return (
    <div className="prose-luxe">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer nofollow" />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
