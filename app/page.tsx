import type { Metadata } from "next";
import { workspaceHref } from "@/lib/app-navigation";

export const metadata: Metadata = {
  title: "Research Workspace",
  description:
    "A centered research task builder for literature reviews, PDF chat, writing, citations, and academic outputs.",
};

type TaskItem = {
  label: string;
  href: string;
  accent: string;
  textColor: string;
  symbol: string;
};

type TaskColumn = {
  title: string;
  items: TaskItem[];
};

const taskColumns: TaskColumn[] = [
  {
    title: "I WANT TO",
    items: [
      {
        label: "Review Literature",
        href: "/literature-review",
        accent: "bg-[#edf1ff]",
        textColor: "text-[#2f61ff]",
        symbol: "RL",
      },
      {
        label: "Write a Draft",
        href: "/ai-writer",
        accent: "bg-[#fff0ef]",
        textColor: "text-[#e32a26]",
        symbol: "WD",
      },
      {
        label: "Generate Diagram",
        href: "/agent-gallery",
        accent: "bg-[#eef3ff]",
        textColor: "text-[#2b67ff]",
        symbol: "GD",
      },
      {
        label: "Systematic Review",
        href: "/literature-review",
        accent: "bg-[#eefbf0]",
        textColor: "text-[#1c9c47]",
        symbol: "SR",
      },
      {
        label: "Search Papers",
        href: "/find-topics",
        accent: "bg-[#fff1f7]",
        textColor: "text-[#ef0b78]",
        symbol: "SP",
      },
      {
        label: "Extract Data",
        href: "/extract-data",
        accent: "bg-[#edf9ef]",
        textColor: "text-[#17a84f]",
        symbol: "ED",
      },
      {
        label: "Review my Writing",
        href: "/ai-detector",
        accent: "bg-[#fff1ef]",
        textColor: "text-[#ff241e]",
        symbol: "RW",
      },
      {
        label: "Write a Report",
        href: "/ai-writer",
        accent: "bg-[#fff0f0]",
        textColor: "text-[#df1d24]",
        symbol: "WR",
      },
    ],
  },
  {
    title: "USE",
    items: [
      {
        label: "Deep Research",
        href: "/agent-gallery",
        accent: "bg-[#eef8ff]",
        textColor: "text-[#2f78ff]",
        symbol: "DR",
      },
      {
        label: "Zotero Library",
        href: "https://www.zotero.org",
        accent: "bg-[#fff0fb]",
        textColor: "text-[#eb4ea4]",
        symbol: "Z",
      },
      {
        label: "Mendeley Library",
        href: "https://www.mendeley.com",
        accent: "bg-[#fff0f2]",
        textColor: "text-[#b71c29]",
        symbol: "M",
      },
      {
        label: "Pubmed",
        href: "https://pubmed.ncbi.nlm.nih.gov",
        accent: "bg-[#f3f7ff]",
        textColor: "text-[#5c6985]",
        symbol: "P",
      },
      {
        label: "Google Scholar",
        href: "https://scholar.google.com",
        accent: "bg-[#eef5ff]",
        textColor: "text-[#5685eb]",
        symbol: "GS",
      },
      {
        label: "ArXiV",
        href: "https://arxiv.org",
        accent: "bg-[#fff1f1]",
        textColor: "text-[#d34747]",
        symbol: "A",
      },
      {
        label: "Python Library",
        href: "https://www.python.org",
        accent: "bg-[#fff8e9]",
        textColor: "text-[#f2b41b]",
        symbol: "Py",
      },
      {
        label: "Grants.gov",
        href: "https://www.grants.gov",
        accent: "bg-[#eef5ff]",
        textColor: "text-[#0853a3]",
        symbol: "G",
      },
    ],
  },
  {
    title: "MAKE A",
    items: [
      {
        label: "Word document",
        href: workspaceHref,
        accent: "bg-[#eef2ff]",
        textColor: "text-[#245cd4]",
        symbol: "W",
      },
      {
        label: "PPT presentation",
        href: workspaceHref,
        accent: "bg-[#fff2ec]",
        textColor: "text-[#f26a2e]",
        symbol: "P",
      },
      {
        label: "LaTeX Manuscript",
        href: workspaceHref,
        accent: "bg-[#f3f3f3]",
        textColor: "text-[#292929]",
        symbol: "Tx",
      },
      {
        label: "LaTeX Poster",
        href: workspaceHref,
        accent: "bg-[#fff0f1]",
        textColor: "text-[#f20d1d]",
        symbol: "LP",
      },
      {
        label: "Data Visualization",
        href: workspaceHref,
        accent: "bg-[#eef4ff]",
        textColor: "text-[#2f78ff]",
        symbol: "DV",
      },
      {
        label: "PDF Report",
        href: workspaceHref,
        accent: "bg-[#fff1f1]",
        textColor: "text-[#ff2c23]",
        symbol: "PDF",
      },
      {
        label: "Website",
        href: workspaceHref,
        accent: "bg-[#eef4ff]",
        textColor: "text-[#2460ff]",
        symbol: "WB",
      },
      {
        label: "Infographic",
        href: workspaceHref,
        accent: "bg-[#eefbf0]",
        textColor: "text-[#17a84f]",
        symbol: "I",
      },
    ],
  },
];

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function TaskBadge({
  accent,
  textColor,
  symbol,
}: Pick<TaskItem, "accent" | "textColor" | "symbol">) {
  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[0.64rem] font-semibold tracking-[-0.01em] ${accent} ${textColor}`}
    >
      {symbol}
    </span>
  );
}

function TaskTile({ item }: { item: TaskItem }) {
  const external = isExternalHref(item.href);

  return (
    <a
      href={item.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 rounded-xl border border-[#ddd8d0] bg-white px-4 py-3 text-[0.98rem] text-[#121212] shadow-[0_4px_12px_rgba(120,104,80,0.04)] transition-transform hover:-translate-y-0.5"
    >
      <TaskBadge
        accent={item.accent}
        textColor={item.textColor}
        symbol={item.symbol}
      />
      <span>{item.label}</span>
    </a>
  );
}

function TaskColumnCard({ column }: { column: TaskColumn }) {
  return (
    <section className="rounded-[1.45rem] bg-[#f6f4ef] p-4 shadow-[0_12px_32px_rgba(120,104,80,0.06)] sm:p-5">
      <h2 className="text-[0.96rem] font-semibold tracking-[0.02em] text-[#181818]">
        {column.title}
      </h2>

      <div className="mt-3 space-y-3">
        {column.items.map((item) => (
          <TaskTile key={`${column.title}-${item.label}`} item={item} />
        ))}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl px-3 py-2 text-[0.98rem] text-[#131313] transition-colors hover:bg-white/70"
      >
        Show More
      </button>
    </section>
  );
}

function PromptComposer() {
  return (
    <section className="rounded-[1.55rem] border border-[#ddd8d0] bg-white px-4 pb-3 pt-4 shadow-[0_24px_54px_rgba(132,112,85,0.1)] sm:px-5 sm:pb-4">
      <textarea
        aria-label="Research prompt"
        placeholder="Give me any task to work on..."
        className="min-h-[104px] w-full resize-none bg-transparent px-2 py-1 text-[1.02rem] leading-7 text-[#212121] outline-none placeholder:text-[#8d7f72]"
      />

      <div className="flex items-center justify-between gap-3 border-t border-[#ebe5dc] pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Add tool"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7d0c6] bg-white text-[1.45rem] leading-none text-[#56504b]"
          >
            +
          </button>

          <button
            type="button"
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
              className="h-3.5 w-3.5 text-[#a4998d]"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Use microphone"
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

          <a
            href={workspaceHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open workspace"
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
          </a>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14">
      <div className="mx-auto max-w-[980px]">
        <header className="text-center">
          <h1 className="text-[2.3rem] font-semibold tracking-[-0.06em] text-[#0f0d0b] sm:text-[3.15rem]">
            How can I help with your research?
          </h1>
        </header>

        <div className="mx-auto mt-8 max-w-[740px]">
          <PromptComposer />
        </div>

        <p className="mt-8 text-center text-[1.04rem] text-[#7b6e62]">
          Build your task
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {taskColumns.map((column) => (
            <TaskColumnCard key={column.title} column={column} />
          ))}
        </div>
      </div>
    </main>
  );
}
