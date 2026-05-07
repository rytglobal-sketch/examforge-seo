"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ResearchComposer,
  type ResearchComposerToolId,
} from "@/components/research-composer";

export type LandingTaskItem = {
  label: string;
  href: string;
  accent: string;
  textColor: string;
  symbol: string;
  promptTemplate?: string;
  toolId?: ResearchComposerToolId;
};

export type LandingTaskColumn = {
  title: string;
  items: LandingTaskItem[];
};

type LandingTaskBuilderProps = {
  columns: LandingTaskColumn[];
};

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function TaskBadge({
  accent,
  textColor,
  symbol,
}: Pick<LandingTaskItem, "accent" | "textColor" | "symbol">) {
  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[0.64rem] font-semibold tracking-[-0.01em] ${accent} ${textColor}`}
    >
      {symbol}
    </span>
  );
}

function TemplateTaskTile({
  item,
  onSelectTemplate,
}: {
  item: LandingTaskItem;
  onSelectTemplate: (item: LandingTaskItem) => void;
}) {
  const content = (
    <>
      <TaskBadge
        accent={item.accent}
        textColor={item.textColor}
        symbol={item.symbol}
      />
      <span className="leading-6">{item.label}</span>
    </>
  );

  if (item.promptTemplate) {
    return (
      <button
        type="button"
        onClick={() => onSelectTemplate(item)}
        className="flex min-h-[68px] w-full items-center gap-3 rounded-xl border border-[#ddd8d0] bg-white px-4 py-3 text-left text-[0.98rem] text-[#121212] shadow-[0_4px_12px_rgba(120,104,80,0.04)] transition-transform hover:-translate-y-0.5"
      >
        {content}
      </button>
    );
  }

  if (isExternalHref(item.href)) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[68px] items-center gap-3 rounded-xl border border-[#ddd8d0] bg-white px-4 py-3 text-[0.98rem] text-[#121212] shadow-[0_4px_12px_rgba(120,104,80,0.04)] transition-transform hover:-translate-y-0.5"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className="flex min-h-[68px] items-center gap-3 rounded-xl border border-[#ddd8d0] bg-white px-4 py-3 text-[0.98rem] text-[#121212] shadow-[0_4px_12px_rgba(120,104,80,0.04)] transition-transform hover:-translate-y-0.5"
    >
      {content}
    </Link>
  );
}

function TaskColumnCard({
  column,
  onSelectTemplate,
}: {
  column: LandingTaskColumn;
  onSelectTemplate: (item: LandingTaskItem) => void;
}) {
  return (
    <section className="mx-auto flex h-full w-full max-w-[360px] flex-col rounded-[1.45rem] bg-[#f6f4ef] p-4 shadow-[0_12px_32px_rgba(120,104,80,0.06)] sm:p-5">
      <h2 className="text-center text-[0.96rem] font-semibold tracking-[0.02em] text-[#181818]">
        {column.title}
      </h2>

      <div className="mt-3 grid flex-1 content-start gap-3">
        {column.items.map((item) => (
          <TemplateTaskTile
            key={`${column.title}-${item.label}`}
            item={item}
            onSelectTemplate={onSelectTemplate}
          />
        ))}
      </div>
    </section>
  );
}

export function LandingTaskBuilder({ columns }: LandingTaskBuilderProps) {
  const [presetPrompt, setPresetPrompt] = useState("");
  const [presetToolId, setPresetToolId] = useState<ResearchComposerToolId | undefined>(
    undefined,
  );
  const [presetNonce, setPresetNonce] = useState<number | undefined>(undefined);

  function handleSelectTemplate(item: LandingTaskItem) {
    setPresetPrompt(item.promptTemplate ?? "");
    setPresetToolId(item.toolId);
    setPresetNonce((current) => (current ?? 0) + 1);
  }

  return (
    <>
      <div className="mx-auto mt-8 max-w-[760px]">
        <ResearchComposer
          key={presetNonce ?? 0}
          placeholder="Give me any task to work on..."
          initialPrompt={presetPrompt}
          initialToolId={presetToolId}
        />
      </div>

      <p className="mt-10 text-center text-[1.02rem] text-[#7b6e62]">
        Build your task
      </p>

      <div className="mx-auto mt-6 grid max-w-[860px] items-stretch justify-center gap-5 md:grid-cols-2">
        {columns.map((column) => (
          <TaskColumnCard
            key={column.title}
            column={column}
            onSelectTemplate={handleSelectTemplate}
          />
        ))}
      </div>
    </>
  );
}
