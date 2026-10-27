"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "@tiptap/markdown";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);

const CODE_LANGUAGES = [
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["python", "Python"],
  ["bash", "Bash"],
  ["json", "JSON"],
  ["html", "HTML"],
  ["css", "CSS"],
  ["sql", "SQL"],
  ["java", "Java"],
  ["go", "Go"],
  ["rust", "Rust"],
  ["yaml", "YAML"],
  ["diff", "Diff"],
] as const;

interface RichTextEditorProps {
  /** Initial Markdown. The editor is uncontrolled after mount. */
  value: string;
  onChange: (markdown: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
  labelledBy?: string;
}

export function RichTextEditor({ value, onChange, onBlur, placeholder, invalid, labelledBy }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by the syntax-highlighting version below
        underline: false, // Markdown has no underline, so it would be lost on save
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Markdown,
      Placeholder.configure({ placeholder: placeholder ?? "Write your story…" }),
    ],
    content: value,
    contentType: "markdown",
    immediatelyRender: false, // avoids an SSR/hydration mismatch
    editorProps: {
      attributes: { class: "prose-luxe editor-content", role: "textbox", "aria-multiline": "true", ...(labelledBy ? { "aria-labelledby": labelledBy } : {}) },
    },
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
    onBlur: () => onBlur?.(),
  });

  return (
    <div className="editor-frame" data-invalid={invalid ? "true" : undefined}>
      {editor ? <Toolbar editor={editor} /> : <div className="editor-toolbar h-[3.1rem]" />}
      <div data-tour="editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  className,
  tour,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  tour?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // keep the text selection/focus in the editor when clicking the toolbar
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      data-tour={tour}
      className={cn("tool-btn", className)}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="tool-sep" aria-hidden />;

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      code: e.isActive("code"),
      codeBlock: e.isActive("codeBlock"),
      codeLang: (e.getAttributes("codeBlock").language as string | null | undefined) ?? "",
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return; // cancelled
    const href = url.trim();
    if (href === "") {
      chain().extendMarkRange("link").unsetLink().run();
      return;
    }
    // The Link extension rejects unsafe protocols such as javascript:
    chain().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
      <ToolButton label="Heading 1" tour="tool-heading" active={s.h1} onClick={() => chain().toggleHeading({ level: 1 }).run()}>
        H1
      </ToolButton>
      <ToolButton label="Heading 2" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolButton>
      <ToolButton label="Heading 3" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolButton>
      <Sep />
      <ToolButton label="Bold (Ctrl+B)" tour="tool-bold" active={s.bold} onClick={() => chain().toggleBold().run()} className="font-bold">
        B
      </ToolButton>
      <ToolButton label="Italic (Ctrl+I)" active={s.italic} onClick={() => chain().toggleItalic().run()} className="italic">
        I
      </ToolButton>
      <ToolButton label="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()} className="line-through">
        S
      </ToolButton>
      <Sep />
      <ToolButton label="Link" tour="tool-link" active={s.link} onClick={setLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
        </svg>
      </ToolButton>
      <Sep />
      <ToolButton label="Bulleted list" tour="tool-bullet" active={s.bullet} onClick={() => chain().toggleBulletList().run()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M9 6h12M9 12h12M9 18h12" />
          <circle cx="4.5" cy="6" r="1" fill="currentColor" />
          <circle cx="4.5" cy="12" r="1" fill="currentColor" />
          <circle cx="4.5" cy="18" r="1" fill="currentColor" />
        </svg>
      </ToolButton>
      <ToolButton label="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M10 6h11M10 12h11M10 18h11" />
          <path d="M3.5 5 5 4v4M3.5 14.5c.4-.9 2.5-.9 2.5.3 0 1.1-2.5 1.6-2.5 2.7H6" strokeWidth="1.4" />
        </svg>
      </ToolButton>
      <ToolButton label="Quote" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>
        <span className="font-display text-lg leading-none">&ldquo;</span>
      </ToolButton>
      <Sep />
      <ToolButton label="Inline code" active={s.code} onClick={() => chain().toggleCode().run()} className="font-mono">
        {"</>"}
      </ToolButton>
      <ToolButton label="Code snippet" tour="tool-code" active={s.codeBlock} onClick={() => chain().toggleCodeBlock().run()} className="font-mono">
        {"{ }"}
      </ToolButton>
      {s.codeBlock && (
        <select
          aria-label="Code language"
          className="tool-select"
          value={s.codeLang}
          onChange={(e) => chain().updateAttributes("codeBlock", { language: e.target.value || null }).run()}
        >
          <option value="">Auto-detect</option>
          {CODE_LANGUAGES.map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
      )}
      <ToolButton label="Divider" onClick={() => chain().setHorizontalRule().run()}>
        &mdash;
      </ToolButton>
      <span className="flex-1" />
      <ToolButton label="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
        &#x21B6;
      </ToolButton>
      <ToolButton label="Redo (Ctrl+Shift+Z)" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
        &#x21B7;
      </ToolButton>
    </div>
  );
}
