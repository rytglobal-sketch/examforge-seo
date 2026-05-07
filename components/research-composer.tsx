"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type ResearchComposerToolId =
  | "citation-helper"
  | "chat-with-pdf"
  | "notes";

type ResearchComposerProps = {
  placeholder: string;
  className?: string;
  textareaMinHeightClassName?: string;
  initialPrompt?: string;
  initialToolId?: ResearchComposerToolId;
};

type ComposerTool = {
  id: ResearchComposerToolId;
  label: string;
  description: string;
  href: string;
  mode?: string;
  queryKey?: "query" | "claim" | "prompt";
};

type QuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
};

const toolOptions: ComposerTool[] = [
  {
    id: "chat-with-pdf",
    label: "Ask Questions",
    description: "Open the workspace and carry your question into grounded chat.",
    href: "/documents",
    queryKey: "prompt",
  },
  {
    id: "citation-helper",
    label: "Find Citations",
    description: "Turn a draft claim or topic into candidate sources.",
    href: "/search",
    queryKey: "claim",
  },
  {
    id: "notes",
    label: "Notes",
    description: "Save a research idea, takeaway, or writing note.",
    href: "/notes",
    queryKey: "prompt",
  },
];

const quickActions: QuickAction[] = [
  {
    id: "upload-pdf",
    label: "Open Workspace",
    description: "Go to the main research workspace and sample paper.",
    href: "/documents",
  },
  {
    id: "find-citations",
    label: "Find Citations",
    description: "Go straight to paper search and citation discovery.",
    href: "/search",
  },
  {
    id: "open-notes",
    label: "Open Notes",
    description: "Review notes attached to your research work.",
    href: "/notes",
  },
];

const defaultToolId = toolOptions[0]?.id ?? "chat-with-pdf";

function getToolById(toolId: string) {
  return toolOptions.find((tool) => tool.id === toolId) ?? toolOptions[0];
}

function buildToolHref(tool: ComposerTool, prompt: string) {
  const trimmedPrompt = prompt.trim();
  const params = new URLSearchParams();

  if (tool.mode) {
    params.set("mode", tool.mode);
  }

  if (trimmedPrompt && tool.queryKey) {
    params.set(tool.queryKey, trimmedPrompt);
  }

  const query = params.toString();
  return query ? `${tool.href}?${query}` : tool.href;
}

function MenuCard({
  title,
  items,
  onSelect,
  selectedId,
}: {
  title: string;
  items: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  onSelect: (id: string) => void;
  selectedId?: string;
}) {
  return (
    <div className="absolute left-0 top-full z-20 mt-3 w-[290px] rounded-[1.25rem] border border-[#ddd8d0] bg-white p-2 shadow-[0_20px_44px_rgba(132,112,85,0.16)]">
      <div className="px-3 pb-2 pt-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8d7f72]">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const isSelected = item.id === selectedId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-start justify-between gap-3 rounded-[1rem] px-3 py-3 text-left transition-colors ${
                isSelected ? "bg-[#f5f1eb]" : "hover:bg-[#faf7f2]"
              }`}
            >
              <span>
                <span className="block text-[0.95rem] font-semibold text-[#1b1815]">
                  {item.label}
                </span>
                <span className="mt-1 block text-[0.82rem] leading-6 text-[#6f6459]">
                  {item.description}
                </span>
              </span>
              {isSelected ? (
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#8c8277]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ResearchComposer({
  placeholder,
  className = "",
  textareaMinHeightClassName = "min-h-[120px]",
  initialPrompt = "",
  initialToolId,
}: ResearchComposerProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [activeMenu, setActiveMenu] = useState<"actions" | "tools" | null>(null);
  const [selectedToolId, setSelectedToolId] = useState(initialToolId ?? defaultToolId);
  const [helperMessage, setHelperMessage] = useState(
    initialToolId
      ? `Template loaded for ${getToolById(initialToolId)?.label}. Replace the blanks with your topic and send it.`
      : "",
  );

  const selectedTool = getToolById(selectedToolId);
  const showSelectedToolBadge = selectedTool.id !== defaultToolId;

  useEffect(() => {
    if (!activeMenu) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activeMenu]);

  useEffect(() => {
    if (!initialPrompt.trim() && !initialToolId) {
      return;
    }

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [initialPrompt, initialToolId]);

  function handleSubmit() {
    router.push(buildToolHref(selectedTool, prompt));
    setActiveMenu(null);
  }

  function handleQuickActionSelect(actionId: string) {
    const action = quickActions.find((item) => item.id === actionId);

    if (!action) {
      return;
    }

    router.push(action.href);
    setActiveMenu(null);
  }

  function handleToolSelect(toolId: string) {
    const tool = getToolById(toolId);
    setSelectedToolId(tool.id);
    setActiveMenu(null);
    setHelperMessage(`Using ${tool.label}.`);
  }

  return (
    <section
      ref={rootRef}
      className={`rounded-[1.55rem] border border-[#ddd8d0] bg-white px-4 pb-3 pt-4 shadow-[0_24px_54px_rgba(132,112,85,0.1)] sm:px-5 sm:pb-4 ${className}`}
    >
      <textarea
        ref={textareaRef}
        aria-label="Research prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        className={`${textareaMinHeightClassName} w-full resize-none bg-transparent px-2 py-1 text-[1.02rem] leading-7 text-[#212121] outline-none placeholder:text-[#8d7f72]`}
      />

      {helperMessage ? (
        <p className="px-2 pb-3 text-[0.84rem] text-[#7c7065]">{helperMessage}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-[#ebe5dc] pt-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              aria-label="Add tool"
              aria-expanded={activeMenu === "actions"}
              aria-haspopup="menu"
              onClick={() =>
                setActiveMenu((currentMenu) =>
                  currentMenu === "actions" ? null : "actions",
                )
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7d0c6] bg-white text-[1.45rem] leading-none text-[#56504b] transition-colors hover:bg-[#faf7f2]"
            >
              +
            </button>

            {activeMenu === "actions" ? (
              <MenuCard
                title="Quick Actions"
                items={quickActions}
                onSelect={handleQuickActionSelect}
              />
            ) : null}
          </div>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              aria-expanded={activeMenu === "tools"}
              aria-haspopup="menu"
              onClick={() =>
                setActiveMenu((currentMenu) =>
                  currentMenu === "tools" ? null : "tools",
                )
              }
              className="inline-flex items-center gap-1 text-[0.98rem] font-semibold text-[#171717]"
            >
              Tools
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                className={`h-3.5 w-3.5 text-[#a4998d] transition-transform ${
                  activeMenu === "tools" ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {showSelectedToolBadge ? (
              <span className="rounded-full bg-[#f5f1eb] px-2.5 py-1 text-[0.72rem] font-medium text-[#6f6459]">
                {selectedTool.label}
              </span>
            ) : null}

            {activeMenu === "tools" ? (
              <MenuCard
                title="Available Tools"
                items={toolOptions}
                selectedId={selectedTool.id}
                onSelect={handleToolSelect}
              />
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Use microphone"
            onClick={() =>
              setHelperMessage("Voice input is coming soon. Type your research task for now.")
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#544d47] transition-colors hover:bg-[#f5f1eb]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="M12 4.5a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-5 0V7A2.5 2.5 0 0 1 12 4.5Z" />
              <path d="M7.5 10.5a4.5 4.5 0 0 0 9 0" />
              <path d="M12 15v4.5" />
              <path d="M9 19.5h6" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Send prompt"
            onClick={handleSubmit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#bdb5ae] text-white transition-colors hover:bg-[#aaa198]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <path d="M12 17V7" />
              <path d="m7 12 5-5 5 5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
