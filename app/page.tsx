import Link from "next/link";
import type { Metadata } from "next";
import {
  LandingTaskBuilder,
  type LandingTaskColumn,
} from "@/components/landing-task-builder";
import { LandingAccountMenu } from "@/components/landing-account-menu";
import { demoDocument } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "ResearchForge",
  description:
    "An AI research assistant for students to ask questions, get simple explanations, generate summaries, create notes, and find citations.",
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
  | "pdf"
  | "cite"
  | "plus"
  | "chevron";

const recentChatHref = `/documents/${demoDocument.id}`;

function withParams(
  pathname: string,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

const askPdfHref = withParams(`/documents/${demoDocument.id}`, {
  tab: "chat",
  prompt:
    "Answer my question from this paper and include the page citations that support the answer.",
  mode: "chat-with-pdf",
});

const explainSimplyHref = withParams(`/documents/${demoDocument.id}`, {
  tab: "chat",
  prompt:
    "Explain this paper in simple terms and show me the pages that support the explanation.",
  mode: "chat-with-pdf",
});

const summaryHref = withParams(`/documents/${demoDocument.id}`, {
  tab: "summary",
  prompt:
    "Summarize this paper with a simple overview, key findings, methodology, limitations, and important definitions.",
  mode: "chat-with-pdf",
});

const citationHelperHref = withParams("/search", {
  claim:
    "Structured note-taking improves source synthesis during thesis writing.",
});

const sidebarItems: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Workspace", href: "/documents", icon: "library" },
  { label: "Ask Questions", href: askPdfHref, icon: "pdf" },
  { label: "Find Citations", href: citationHelperHref, icon: "cite" },
  { label: "Notes", href: "/notes", icon: "notebook", hasChevron: true },
];

const taskColumns: LandingTaskColumn[] = [
  {
    title: "START WITH YOUR RESEARCH",
    items: [
      {
        label: "Open Workspace",
        href: "/documents",
        accent: "bg-[#eef3ff]",
        textColor: "text-[#2b67ff]",
        symbol: "WS",
      },
      {
        label: "Ask a Question",
        href: askPdfHref,
        accent: "bg-[#edf1ff]",
        textColor: "text-[#2f61ff]",
        symbol: "AQ",
        toolId: "chat-with-pdf",
        promptTemplate:
          "Help me answer this research question: ________. If the answer depends on a source, explain it simply and include supporting citations.",
      },
      {
        label: "Explain Simply",
        href: explainSimplyHref,
        accent: "bg-[#fff4ec]",
        textColor: "text-[#f26a2e]",
        symbol: "ES",
        toolId: "chat-with-pdf",
        promptTemplate:
          "Explain ________ in simple academic language. If you use a source, point me to the parts that support the explanation.",
      },
      {
        label: "Generate Summary",
        href: summaryHref,
        accent: "bg-[#eefbf0]",
        textColor: "text-[#1c9c47]",
        symbol: "GS",
        toolId: "chat-with-pdf",
        promptTemplate:
          "Generate a clear summary of ________. Include the main points, key findings, methods, limitations, and important terms with supporting citations when available.",
      },
    ],
  },
  {
    title: "WORK WITH IDEAS AND SOURCES",
    items: [
      {
        label: "Create Notes",
        href: withParams("/notes", {
          prompt:
            "Create a concise note from this paper with the core argument, strongest evidence, useful definitions, and anything I should cite later.",
        }),
        accent: "bg-[#fff1ef]",
        textColor: "text-[#ff241e]",
        symbol: "N",
        toolId: "notes",
        promptTemplate:
          "Create notes from this paper about ________. Capture the main argument, strongest evidence, definitions, and follow-up ideas I should keep.",
      },
      {
        label: "Find Citations",
        href: citationHelperHref,
        accent: "bg-[#fff1f7]",
        textColor: "text-[#ef0b78]",
        symbol: "FC",
        toolId: "citation-helper",
        promptTemplate:
          "Find papers I can cite for the claim that ________. Suggest relevant sources and explain briefly why each one fits.",
      },
      {
        label: "Find Supporting Papers",
        href: withParams("/search", {
          query: "supporting papers for thesis writing workflows and source synthesis",
        }),
        accent: "bg-[#f3f7ff]",
        textColor: "text-[#5c6985]",
        symbol: "SP",
        toolId: "citation-helper",
        promptTemplate:
          "Find supporting papers for research on ________. Prioritize relevant and recent sources that I can review for citations.",
      },
      {
        label: "Save a Writing Reminder",
        href: withParams("/notes", {
          prompt:
            "Write a reminder note for my draft about where I still need clearer evidence, better wording, or stronger citations.",
        }),
        accent: "bg-[#fff8e9]",
        textColor: "text-[#c48c11]",
        symbol: "WR",
        toolId: "notes",
        promptTemplate:
          "Create a writing reminder for my topic on ________. Note where I need stronger evidence, clearer wording, or more citations.",
      },
    ],
  },
];

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
    case "pdf":
      return (
        <svg {...shared}>
          <path d="M7.5 4.5h7l3 3V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6.5 19V6A1.5 1.5 0 0 1 7.5 4.5Z" />
          <path d="M14.5 4.5V8h3" />
          <path d="M9 12h5" />
          <path d="M9 15h4" />
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
    case "plus":
      return (
        <svg {...shared}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
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
              Open Workspace
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
              Recent Chat
            </p>
            <Link
              href={recentChatHref}
              className="mt-2 block rounded-xl px-2 py-2 text-[0.94rem] text-[#312b26] hover:bg-white/70"
            >
              {demoDocument.title}
            </Link>
          </div>

          <div className="border-t border-[#e8e1d8] bg-[#f5f1eb] px-3 py-4">
            <LandingAccountMenu />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="flex items-center justify-between px-4 py-3 lg:hidden">
            <Link
              href="/documents"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#ddd5cb] bg-white px-4 text-[0.92rem] font-medium text-[#4f463f]"
            >
              Workspace
            </Link>
            <Link
              href={citationHelperHref}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ddd5cb] bg-white px-3 py-2 text-[0.92rem] text-[#171411]"
            >
              <NavIcon name="cite" className="h-4 w-4" />
              Find Citations
            </Link>
          </div>

          <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-2 sm:px-6 lg:px-8 lg:pt-0 xl:px-10">
            <div className="mx-auto max-w-[1080px] pt-8 lg:pt-10">
              <header className="mx-auto max-w-[760px] text-center">
                <h1 className="text-[2.15rem] font-semibold tracking-[-0.06em] text-[#0f0d0b] sm:text-[3rem]">
                  AI research help for students
                </h1>
                <p className="mx-auto mt-4 max-w-[660px] text-[1.02rem] leading-7 text-[#6f6459]">
                  Start from a question, a topic, a claim, or a paper. ResearchForge helps you explain, summarize, organize notes, and find citations without the extra clutter.
                </p>
              </header>

              <LandingTaskBuilder columns={taskColumns} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
