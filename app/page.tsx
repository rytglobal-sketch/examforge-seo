import Link from "next/link";
import type { Metadata } from "next";
import { ResearchComposer } from "@/components/research-composer";

export const metadata: Metadata = {
  title: "Research Workspace",
  description:
    "A research landing page with workspace navigation, task builder, and academic AI workflows.",
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

type NavItem = {
  label: string;
  href: string;
  icon: NavIconName;
  hasChevron?: boolean;
};

type NavIconName =
  | "home"
  | "library"
  | "notebook"
  | "agents"
  | "writer"
  | "pdf"
  | "review"
  | "search"
  | "paraphrase"
  | "cite"
  | "extract"
  | "detector"
  | "plus"
  | "spark"
  | "pricing"
  | "chevron";

const recentChatHref = "/documents/demo-lithium-amd";

const sidebarItems: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "My Library", href: "/documents", icon: "library" },
  { label: "My Notebooks", href: "/notes", icon: "notebook", hasChevron: true },
  { label: "Agent Gallery", href: "/documents", icon: "agents" },
  { label: "AI Writer", href: "/documents", icon: "writer" },
  { label: "Chat with PDF", href: "/documents", icon: "pdf" },
  { label: "Literature Review", href: "/search", icon: "review" },
  { label: "Find Topics", href: "/search", icon: "search" },
  { label: "Paraphraser", href: "/documents", icon: "paraphrase" },
  { label: "Citation Generator", href: "/search", icon: "cite" },
  { label: "Extract Data", href: "/documents", icon: "extract" },
  { label: "AI Detector", href: "/documents", icon: "detector" },
];

const taskColumns: TaskColumn[] = [
  {
    title: "I WANT TO",
    items: [
      {
        label: "Review Literature",
        href: "/search",
        accent: "bg-[#edf1ff]",
        textColor: "text-[#2f61ff]",
        symbol: "RL",
      },
      {
        label: "Write a Draft",
        href: "/documents",
        accent: "bg-[#fff0ef]",
        textColor: "text-[#e32a26]",
        symbol: "WD",
      },
      {
        label: "Generate Diagram",
        href: "/documents",
        accent: "bg-[#eef3ff]",
        textColor: "text-[#2b67ff]",
        symbol: "GD",
      },
      {
        label: "Systematic Review",
        href: "/search",
        accent: "bg-[#eefbf0]",
        textColor: "text-[#1c9c47]",
        symbol: "SR",
      },
      {
        label: "Search Papers",
        href: "/search",
        accent: "bg-[#fff1f7]",
        textColor: "text-[#ef0b78]",
        symbol: "SP",
      },
      {
        label: "Extract Data",
        href: "/documents",
        accent: "bg-[#edf9ef]",
        textColor: "text-[#17a84f]",
        symbol: "ED",
      },
      {
        label: "Review my Writing",
        href: "/notes",
        accent: "bg-[#fff1ef]",
        textColor: "text-[#ff241e]",
        symbol: "RW",
      },
      {
        label: "Write a Report",
        href: "/documents",
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
        href: recentChatHref,
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
        href: "/documents",
        accent: "bg-[#eef2ff]",
        textColor: "text-[#245cd4]",
        symbol: "W",
      },
      {
        label: "PPT presentation",
        href: "/documents",
        accent: "bg-[#fff2ec]",
        textColor: "text-[#f26a2e]",
        symbol: "P",
      },
      {
        label: "LaTeX Manuscript",
        href: "/documents",
        accent: "bg-[#f3f3f3]",
        textColor: "text-[#292929]",
        symbol: "Tx",
      },
      {
        label: "LaTeX Poster",
        href: "/documents",
        accent: "bg-[#fff0f1]",
        textColor: "text-[#f20d1d]",
        symbol: "LP",
      },
      {
        label: "Data Visualization",
        href: "/documents",
        accent: "bg-[#eef4ff]",
        textColor: "text-[#2f78ff]",
        symbol: "DV",
      },
      {
        label: "PDF Report",
        href: "/documents",
        accent: "bg-[#fff1f1]",
        textColor: "text-[#ff2c23]",
        symbol: "PDF",
      },
      {
        label: "Website",
        href: "/documents",
        accent: "bg-[#eef4ff]",
        textColor: "text-[#2460ff]",
        symbol: "WB",
      },
      {
        label: "Infographic",
        href: "/documents",
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

function NavIcon({
  name,
  className = "h-4 w-4",
}: {
  name: NavIconName;
  className?: string;
}) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...shared}>
          <path d="M5 10.5 12 5l7 5.5" />
          <path d="M7 9.8V19h10V9.8" />
          <path d="M10 19v-5h4v5" />
        </svg>
      );
    case "library":
      return (
        <svg {...shared}>
          <path d="M6.5 7.5 8 5l2 2.5" />
          <path d="M11 7.5 12.5 5 15 7.5" />
          <path d="M15.5 7.5 17 5l1.5 2.5" />
          <path d="M7 8.5V19" />
          <path d="M12 8.5V19" />
          <path d="M17 8.5V19" />
          <path d="M5.5 19h13" />
        </svg>
      );
    case "notebook":
      return (
        <svg {...shared}>
          <rect x="6" y="4.5" width="12" height="15" rx="2" />
          <path d="M10 4.5v15" />
          <path d="M12.5 8h3" />
          <path d="M12.5 11h3" />
        </svg>
      );
    case "agents":
      return (
        <svg {...shared}>
          <circle cx="7" cy="7" r="2.2" />
          <circle cx="17" cy="7" r="2.2" />
          <circle cx="7" cy="17" r="2.2" />
          <circle cx="17" cy="17" r="2.2" />
          <path d="M9.3 7h5.4" />
          <path d="M7 9.3v5.4" />
          <path d="M17 9.3v5.4" />
          <path d="M9.3 17h5.4" />
        </svg>
      );
    case "writer":
      return (
        <svg {...shared}>
          <path d="M4 20l4.5-1 9-9a2.4 2.4 0 1 0-3.4-3.4l-9 9L4 20Z" />
          <path d="m12.5 6.5 5 5" />
        </svg>
      );
    case "pdf":
      return (
        <svg {...shared}>
          <path d="M7.5 4.5h7l3 3V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6.5 19V6A1.5 1.5 0 0 1 7.5 4.5Z" />
          <path d="M14.5 4.5V8h3" />
          <path d="M9 12h5" />
          <path d="M9 15h4" />
        </svg>
      );
    case "review":
      return (
        <svg {...shared}>
          <path d="M7.5 5.5h9A1.5 1.5 0 0 1 18 7v10.5l-3-2-3 2-3-2-3 2V7a1.5 1.5 0 0 1 1.5-1.5Z" />
          <path d="M9 9h6" />
          <path d="M9 12h4.5" />
        </svg>
      );
    case "search":
      return (
        <svg {...shared}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4 4" />
        </svg>
      );
    case "paraphrase":
      return (
        <svg {...shared}>
          <path d="M5.5 8.5h7" />
          <path d="M5.5 12h10" />
          <path d="M5.5 15.5h7" />
          <path d="m15.5 6.5 3 3-3 3" />
          <path d="M18.5 9.5h-5" />
        </svg>
      );
    case "cite":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M10 9.5a2 2 0 1 1 4 0c0 1.5-2 2-2 3.5" />
          <path d="M12 16h.01" />
        </svg>
      );
    case "extract":
      return (
        <svg {...shared}>
          <path d="M13 3 6 13h5l-1 8 7-10h-5l1-8Z" />
        </svg>
      );
    case "detector":
      return (
        <svg {...shared}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4 4" />
          <path d="M10.5 8.5v4" />
          <path d="M10.5 15h.01" />
        </svg>
      );
    case "plus":
      return (
        <svg {...shared}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "spark":
      return (
        <svg {...shared}>
          <path d="M12 4 13.8 8.2 18 10l-4.2 1.8L12 16l-1.8-4.2L6 10l4.2-1.8L12 4Z" />
        </svg>
      );
    case "pricing":
      return (
        <svg {...shared}>
          <path d="M6 7.5 12 4l6 3.5v9L12 20l-6-3.5v-9Z" />
          <path d="M9.5 12h5" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...shared}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
  }
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

  const content = (
    <>
      <TaskBadge
        accent={item.accent}
        textColor={item.textColor}
        symbol={item.symbol}
      />
      <span>{item.label}</span>
    </>
  );

  if (!external) {
    return (
      <Link
        href={item.href}
        className="flex items-center gap-3 rounded-xl border border-[#ddd8d0] bg-white px-4 py-3 text-[0.98rem] text-[#121212] shadow-[0_4px_12px_rgba(120,104,80,0.04)] transition-transform hover:-translate-y-0.5"
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-[#ddd8d0] bg-white px-4 py-3 text-[0.98rem] text-[#121212] shadow-[0_4px_12px_rgba(120,104,80,0.04)] transition-transform hover:-translate-y-0.5"
    >
      {content}
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

function SidebarLink({ item }: { item: NavItem }) {
  const isActive = item.href === "/";

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.97rem] transition-colors ${
        isActive
          ? "bg-white text-[#141414] shadow-[0_4px_10px_rgba(120,104,80,0.05)]"
          : "text-[#3e3731] hover:bg-white/70"
      }`}
    >
      <span className="text-[#4e463f]">
        <NavIcon name={item.icon} />
      </span>
      <span className="flex-1">{item.label}</span>
      {item.hasChevron ? (
        <span className="text-[#8b8075]">
          <NavIcon name="chevron" className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fcfaf6] text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-[200px] shrink-0 border-r border-[#e8e1d8] bg-[#f7f4ee] lg:flex lg:flex-col">
          <div className="px-3 pt-4">
            <Link
              href="/documents"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ddd5cb] bg-white px-4 py-3 text-[0.98rem] font-medium text-[#1b1815] shadow-[0_4px_10px_rgba(120,104,80,0.04)]"
            >
              <NavIcon name="plus" />
              New Chat
            </Link>
          </div>

          <nav className="mt-4 px-3">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <SidebarLink key={item.label} item={item} />
              ))}
            </div>
          </nav>

          <div className="mt-auto border-t border-[#e8e1d8] px-3 pb-4 pt-4">
            <p className="px-2 text-[0.78rem] font-medium uppercase tracking-[0.08em] text-[#95887b]">
              Recent Chats
            </p>
            <Link
              href={recentChatHref}
              className="mt-2 block rounded-xl px-2 py-2 text-[0.94rem] text-[#312b26] hover:bg-white/70"
            >
              Lithium Acid Mine Research
            </Link>
          </div>

          <div className="border-t border-[#e8e1d8] bg-[#f5f1eb] px-3 py-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-3 text-left shadow-[0_4px_10px_rgba(120,104,80,0.04)]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#dff0d8] text-[#4c9c3d]">
                <NavIcon name="spark" className="h-4 w-4" />
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
                <NavIcon name="chevron" className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="flex items-center justify-between px-4 py-3 lg:hidden">
            <Link
              href="/documents"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ddd5cb] bg-white text-[#4f463f]"
            >
              <NavIcon name="plus" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-[#ddd5cb] bg-white px-3 py-2 text-[0.92rem] text-[#171411]"
              >
                Enterprise
              </button>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 rounded-xl border border-[#ddd5cb] bg-white px-3 py-2 text-[0.92rem] text-[#171411]"
              >
                <NavIcon name="pricing" className="h-4 w-4" />
                Pricing
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-[1220px] px-4 pb-12 pt-2 sm:px-6 lg:px-10 lg:pt-0">
            <div className="hidden justify-end gap-3 py-4 lg:flex">
              <button
                type="button"
                className="rounded-xl border border-transparent px-3 py-2 text-[0.95rem] font-medium text-[#171411]"
              >
                Enterprise
              </button>
              <Link
                href="/billing"
                className="inline-flex items-center gap-2 rounded-xl border border-[#ddd5cb] bg-white px-3 py-2 text-[0.95rem] font-medium text-[#171411]"
              >
                <NavIcon name="pricing" className="h-4 w-4" />
                Pricing
              </Link>
            </div>

            <div className="mx-auto max-w-[720px] pt-8 lg:pt-10">
              <header className="text-center">
                <h1 className="text-[2.15rem] font-semibold tracking-[-0.06em] text-[#0f0d0b] sm:text-[3rem]">
                  How can I help with your research?
                </h1>
              </header>

              <div className="mx-auto mt-8 max-w-[720px]">
                <ResearchComposer placeholder="Give me any task to work on..." />
              </div>

              <p className="mt-8 text-center text-[1.02rem] text-[#7b6e62]">
                Build your task
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {taskColumns.map((column) => (
                  <TaskColumnCard key={column.title} column={column} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
