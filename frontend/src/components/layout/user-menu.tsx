"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AuthorAvatar } from "@/components/blog/author-avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type UserMenuProps = Pick<User, "name" | "email" | "age">;

/** Avatar + name button that opens a card with the signed-in user's details. */
export function UserMenu({ name, email, age }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    // `sm:relative`: on phones the card anchors to the full-width navbar instead of the avatar.
    <div ref={rootRef} className="sm:relative" data-tour="user-menu">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="user-menu-btn"
      >
        <AuthorAvatar name={name} size={28} />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:inline">{name}</span>
        <svg
          className={cn("hidden text-muted transition-transform duration-200 sm:block", open && "rotate-180")}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        <span className="sr-only">Account details</span>
      </button>

      {open && (
        <div id={panelId} role="region" aria-label="Account details" className="user-menu-panel">
          <div className="flex items-center gap-3 pb-4">
            <AuthorAvatar name={name} size={44} />
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold leading-tight text-gold">{name}</p>
              <p className="text-xs text-muted">Signed in</p>
            </div>
          </div>
          <div className="divider-gold" />
          <dl className="space-y-3.5 pt-4">
            <div>
              <dt className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">Email</dt>
              <dd className="mt-0.5 text-sm font-medium [overflow-wrap:anywhere]">{email}</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">Age</dt>
              <dd className="mt-0.5 text-sm font-medium">{age}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
