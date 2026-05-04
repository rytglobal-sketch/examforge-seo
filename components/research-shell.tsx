import Link from "next/link";
import type { ReactNode } from "react";
import {
  defaultQuickActions,
  sidebarItems,
  type IconName,
  type QuickAction,
  workspaceHref,
} from "@/lib/app-navigation";

type ResearchShellProps = {
  activeHref: string;
  heading: string;
  subheading: string;
  promptPlaceholder: string;
  accentLabel?: string;
  footerCopy?: string;
  quickActions?: QuickAction[];
  children?: ReactNode;
};

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="relative h-10 w-10">
        <span className="absolute left-0 top-1 h-5 w-5 rotate-[35deg] rounded-[5px] bg-[#5cb4e6]" />
        <span className="absolute left-3 top-4 h-5 w-5 rotate-[35deg] rounded-[5px] bg-[#f59f63]" />
      </div>
      <span className="text-[1.7rem] font-semibold tracking-[-0.04em] text-[#111111]">
        ExamForge
      </span>
    </div>
  );
}

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...shared}>
          <path d="M4.5 10.5L12 4l7.5 6.5" />
          <path d="M6.5 9.75V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.75" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "pdf":
      return (
        <svg {...shared}>
          <path d="M8 3.5h6l4 4V20a1 1 0 0 1-1 1H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
          <path d="M14 3.5V8h4" />
          <path d="M8.5 12.5h7" />
          <path d="M8.5 16h7" />
        </svg>
      );
    case "pen":
      return (
        <svg {...shared}>
          <path d="M4 20l4.5-1 9.2-9.2a2.5 2.5 0 1 0-3.5-3.5L5 15.5 4 20Z" />
          <path d="M12.5 6.5l5 5" />
        </svg>
      );
    case "slides":
      return (
        <svg {...shared}>
          <rect x="4" y="5" width="16" height="11" rx="2" />
          <path d="M8 20h8" />
          <path d="M12 16v4" />
          <path d="M7.5 9h9" />
          <path d="M7.5 12h5.5" />
        </svg>
      );
    case "check":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 12 2.2 2.2 4.8-4.8" />
        </svg>
      );
    case "draft":
      return (
        <svg {...shared}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M8 8.5h8" />
          <path d="M8 12h8" />
          <path d="M8 15.5h5" />
        </svg>
      );
    case "clock":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5l3 1.8" />
        </svg>
      );
    case "biology":
      return (
        <svg {...shared}>
          <path d="M8 6.5c2.5-2.8 5.5-2.8 8 0" />
          <path d="M8 17.5c2.5 2.8 5.5 2.8 8 0" />
          <path d="M10 4c-2.8 2.5-2.8 13.5 0 16" />
          <path d="M14 4c2.8 2.5 2.8 13.5 0 16" />
          <path d="M7 12h10" />
        </svg>
      );
    case "law":
      return (
        <svg {...shared}>
          <path d="M12 4v15.5" />
          <path d="M6 8h12" />
          <path d="m8.5 8-3 5h6l-3-5Z" />
          <path d="m15.5 8-3 5h6l-3-5Z" />
          <path d="M7.5 20h9" />
        </svg>
      );
    case "chart":
      return (
        <svg {...shared}>
          <path d="M5 19.5h14" />
          <path d="M7.5 16v-5" />
          <path d="M12 16V7.5" />
          <path d="M16.5 16v-3.5" />
        </svg>
      );
    case "users":
      return (
        <svg {...shared}>
          <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M15.5 9.5a2.5 2.5 0 1 0 0-5" />
          <path d="M4.5 18c.9-2.4 3-3.8 5.5-3.8s4.6 1.4 5.5 3.8" />
          <path d="M15.2 14.6c1.9.2 3.4 1.4 4.3 3.4" />
        </svg>
      );
    case "search":
      return (
        <svg {...shared}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4 4" />
        </svg>
      );
    case "review":
      return (
        <svg {...shared}>
          <path d="M7.5 5.5h9a1.5 1.5 0 0 1 1.5 1.5v10.5l-3-2-3 2-3-2-3 2V7a1.5 1.5 0 0 1 1.5-1.5Z" />
          <path d="M9 9h6" />
          <path d="M9 12h4.5" />
        </svg>
      );
    case "diagram":
      return (
        <svg {...shared}>
          <circle cx="6.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="6.5" r="2.5" />
          <circle cx="12" cy="17.5" r="2.5" />
          <path d="M8.8 7.7 15.2 16" />
          <path d="M15.2 7.7 8.8 16" />
        </svg>
      );
    case "presentation":
      return (
        <svg {...shared}>
          <rect x="4" y="5" width="16" height="11" rx="2" />
          <path d="M8 20h8" />
          <path d="M12 16v4" />
          <path d="M9 9.5h6" />
          <path d="m11 13 1.5-2L14 13" />
        </svg>
      );
  }
}

function SidebarNav({ activeHref }: { activeHref: string }) {
  return (
    <nav aria-label="Primary" className="px-3 sm:px-4">
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {sidebarItems.map((item) => {
          const isActive = activeHref === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.98rem] transition-colors ${
                  isActive
                    ? "bg-white text-[#13110f] shadow-[0_14px_28px_rgba(143,118,83,0.12)]"
                    : "text-[#3e3731] hover:bg-white/70"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? "bg-[#f5eee5]" : "bg-transparent"
                  }`}
                >
                  <Icon name={item.icon} className="h-[1.1rem] w-[1.1rem]" />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AuthPanel() {
  return (
    <div className="mt-auto border-t border-[#ddd5cb] px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
      <div className="rounded-[1.6rem] border border-[#d8d0c7] bg-white/80 p-4 text-center shadow-[0_16px_36px_rgba(155,131,99,0.1)]">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f1d59d] bg-[#fff7df] text-[#d39a13]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="M12 4.5a6 6 0 0 0-3.8 10.7V18h7.6v-2.8A6 6 0 0 0 12 4.5Z" />
            <path d="M10 21h4" />
          </svg>
        </div>
        <p className="mt-3 text-[1.02rem] leading-8 text-[#5e544c]">
          Log in to keep your study history and access your workspace library
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <a
          href={workspaceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-2xl border border-[#d5ccc2] bg-white px-4 py-3 text-base font-semibold text-[#1a1714] transition-colors hover:bg-[#fbfaf8]"
        >
          Login
        </a>
        <a
          href={workspaceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-2xl bg-[#ff6408] px-4 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Sign up
        </a>
      </div>
    </div>
  );
}

function QuickActionPills({ quickActions }: { quickActions: QuickAction[] }) {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      {quickActions.map((action) => (
        <Link
          key={`${action.href}-${action.label}`}
          href={action.href}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#d9d1c7] bg-white/85 px-4 py-3 text-[1.03rem] font-medium text-[#1b1815] shadow-[0_8px_18px_rgba(143,118,83,0.08)] transition-transform hover:-translate-y-0.5"
        >
          <Icon name={action.icon} className="h-4 w-4 text-[#8a7766]" />
          <span>{action.label}</span>
        </Link>
      ))}
    </div>
  );
}

export function ResearchShell({
  activeHref,
  heading,
  subheading,
  promptPlaceholder,
  accentLabel,
  footerCopy,
  quickActions = defaultQuickActions,
  children,
}: ResearchShellProps) {
  const isDocumentView = Boolean(children);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative isolate min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(245,202,153,0.16),transparent_24%),radial-gradient(circle_at_top,rgba(105,180,225,0.12),transparent_28%)]" />

        <div className="mx-auto grid min-h-screen max-w-[1820px] lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-[#dcd3ca] bg-[#f4efe9]/90 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col pt-4 sm:pt-6 lg:pt-8">
              <Link
                href="/"
                className="mb-5 flex items-center justify-center px-6 text-[#201c19] lg:hidden"
              >
                <BrandMark />
              </Link>
              <SidebarNav activeHref={activeHref} />
              <AuthPanel />
            </div>
          </aside>

          <main className="relative min-w-0">
            <div
              className={`mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-5 pb-16 pt-8 sm:px-10 lg:px-16 ${
                isDocumentView ? "" : "justify-center"
              }`}
            >
              <div className="mx-auto w-full max-w-[930px]">
                <div className="flex justify-center">
                  <Link href="/" className="text-[#201c19]">
                    <BrandMark />
                  </Link>
                </div>

                {accentLabel ? (
                  <div className="mt-8 flex justify-center">
                    <span className="rounded-full border border-[#dfd4c8] bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#9a6a35]">
                      {accentLabel}
                    </span>
                  </div>
                ) : null}

                <header className="mt-7 text-center">
                  <h1 className="mx-auto max-w-[15ch] text-[2.6rem] font-semibold tracking-[-0.06em] text-[#0f0d0b] sm:text-[3.6rem] lg:text-[4rem]">
                    {heading}
                  </h1>
                  <p className="mx-auto mt-4 max-w-[32rem] text-lg leading-8 text-[#74685e] sm:text-[1.55rem]">
                    {subheading}
                  </p>
                </header>

                <section className="mt-11 rounded-[2.1rem] border border-[#e2d9ce] bg-white/92 p-4 shadow-[0_28px_80px_rgba(162,136,103,0.14)] sm:p-7">
                  <textarea
                    aria-label="Research prompt"
                    placeholder={promptPlaceholder}
                    className="min-h-[170px] w-full resize-none bg-transparent px-2 py-2 text-[1.18rem] leading-8 text-[#27221e] outline-none placeholder:text-[#8d7f72] sm:min-h-[190px] sm:text-[1.3rem]"
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#e5ddd3] pt-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Add tool"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d9d0c6] bg-[#fbf9f6] text-[#544b43]"
                      >
                        <span className="text-2xl leading-none">+</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-[1.07rem] font-semibold text-[#1e1a17]"
                      >
                        Tools
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          className="h-4 w-4 text-[#8c7e71]"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Use microphone"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#443c35] transition-colors hover:bg-[#f6f0ea]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          className="h-5 w-5"
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
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bcb4ab] text-white transition-colors hover:bg-[#a99f95]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path d="M12 18V6" />
                          <path d="m7 11 5-5 5 5" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </section>

                <QuickActionPills quickActions={quickActions} />

                {footerCopy ? (
                  <p className="mt-8 text-center text-sm tracking-[0.02em] text-[#817468]">
                    {footerCopy}
                  </p>
                ) : null}

                {children ? <div className="mt-12">{children}</div> : null}
              </div>
            </div>

            <a
              href={workspaceHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open support"
              className="fixed bottom-6 right-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#0a84cf] text-white shadow-[0_18px_45px_rgba(10,132,207,0.3)] transition-transform hover:-translate-y-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <path d="M12 15.5c2.8 0 5-2.1 5-4.8S14.8 6 12 6s-5 2.1-5 4.7 2.2 4.8 5 4.8Z" />
                <path d="M6.8 18.8c1.4-1.7 3.2-2.5 5.2-2.5s3.8.8 5.2 2.5" />
                <path d="M7 10.8H4.8A1.8 1.8 0 0 1 3 9V7.8A1.8 1.8 0 0 1 4.8 6H7" />
                <path d="M17 10.8h2.2A1.8 1.8 0 0 0 21 9V7.8A1.8 1.8 0 0 0 19.2 6H17" />
              </svg>
            </a>
          </main>
        </div>
      </div>
    </div>
  );
}
