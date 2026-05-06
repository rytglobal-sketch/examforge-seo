"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const accountActions = [
  {
    href: "/documents",
    label: "My papers",
    description: "Open uploaded PDFs, summaries, and grounded chat.",
  },
  {
    href: "/search",
    label: "Find citations",
    description: "Search for supporting papers and citation leads.",
  },
  {
    href: "/notes",
    label: "View notes",
    description: "Open saved research notes and writing ideas.",
  },
  {
    href: "/sign-in",
    label: "Sign in",
    description: "Use your magic link to access ResearchForge.",
  },
] as const;

export function LandingAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-3 text-left shadow-[0_4px_10px_rgba(120,104,80,0.04)] transition-colors hover:bg-[#fcfaf6]"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#dff0d8] text-[#4c9c3d]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            className="h-4 w-4"
          >
            <path d="M12 4 13.8 8.2 18 10l-4.2 1.8L12 16l-1.8-4.2L6 10l4.2-1.8L12 4Z" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.95rem] font-medium text-[#171411]">
            ryt global
          </span>
          <span className="block truncate text-[0.8rem] text-[#776d63]">
            rytglobal@gmail.com
          </span>
        </span>
        <span className="text-[#8b8075]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div className="absolute bottom-full left-0 z-20 mb-3 w-[280px] rounded-[1.25rem] border border-[#ddd8d0] bg-white p-2 shadow-[0_20px_44px_rgba(132,112,85,0.16)]">
          <div className="px-3 pb-2 pt-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8d7f72]">
            Account
          </div>
          <div className="space-y-1">
            {accountActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-[1rem] px-3 py-3 transition-colors hover:bg-[#faf7f2]"
              >
                <span className="block text-[0.95rem] font-semibold text-[#1b1815]">
                  {action.label}
                </span>
                <span className="mt-1 block text-[0.82rem] leading-6 text-[#6f6459]">
                  {action.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
