import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { ResearchForgeLogo } from "@/components/app-shell/logo";
import type { SessionUser } from "@/lib/db/types";

type WorkspaceShellProps = {
  user: SessionUser;
  activePath: "/documents" | "/search" | "/notes" | "/billing";
  children: React.ReactNode;
};

const navigationItems = [
  {
    href: "/documents",
    label: "Workspace",
    description: "Ask, explain, and summarize",
  },
  {
    href: "/search",
    label: "Citations",
    description: "Find relevant papers fast",
  },
  {
    href: "/notes",
    label: "Notes",
    description: "Save takeaways and reminders",
  },
] as const;

const pageCopy = {
  "/documents": {
    eyebrow: "Research workspace",
    title: "Ask better questions and get grounded answers",
    chips: ["Ask", "Explain", "Summarize"],
    helperTitle: "Best way to use this",
    helperItems: [
      "Start with one clear question.",
      "Open the source when you need proof.",
      "Turn useful answers into notes.",
    ],
  },
  "/search": {
    eyebrow: "Citations",
    title: "Find papers you can actually cite",
    chips: ["Claims", "Sources", "Support"],
    helperTitle: "Best way to use this",
    helperItems: [
      "Paste one claim at a time.",
      "Look for the papers with the clearest fit.",
      "Bring the best sources back into your notes.",
    ],
  },
  "/notes": {
    eyebrow: "Notes",
    title: "Keep only the takeaways worth reusing",
    chips: ["Takeaways", "Definitions", "Writing reminders"],
    helperTitle: "Good notes are short",
    helperItems: [
      "Capture the main point in one sentence.",
      "Save one quote or citation cue if needed.",
      "Add the next question you want to explore.",
    ],
  },
  "/billing": {
    eyebrow: "Billing",
    title: "Manage your plan without the noise",
    chips: ["Plans", "Usage", "Upgrade"],
    helperTitle: "Before you upgrade",
    helperItems: [
      "Use the free flow first.",
      "Upgrade only when you need more capacity.",
      "Keep the setup simple.",
    ],
  },
} as const;

function SidebarLink({
  href,
  label,
  description,
  isActive,
}: {
  href: string;
  label: string;
  description: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-[1.1rem] border px-4 py-3 transition-all ${
        isActive
          ? "border-[#b4cdfd] bg-white shadow-[0_16px_34px_rgba(31,111,255,0.08)]"
          : "border-transparent bg-transparent hover:border-[#dce4f2] hover:bg-white/80"
      }`}
    >
      <div className="text-sm font-semibold text-[#111727]">{label}</div>
      <div className="mt-1 text-[0.92rem] leading-6 text-[#6d7686]">{description}</div>
    </Link>
  );
}

export function WorkspaceShell({
  user,
  activePath,
  children,
}: WorkspaceShellProps) {
  const isGuestMode = user.isDemo;
  const activePage = pageCopy[activePath];

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#101522]">
      <div className="mx-auto grid min-h-screen max-w-[1560px] lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="border-b border-[#e1e7f0] bg-white/75 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-5 py-6 sm:px-6">
            <ResearchForgeLogo />

            <div className="mt-8 grid gap-2.5">
              {navigationItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  description={item.description}
                  isActive={activePath === item.href}
                />
              ))}
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-[#dce4f2] bg-[#f8fbff] p-4">
              <div className="text-sm font-semibold text-[#23324b]">
                {activePage.helperTitle}
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#667287]">
                {activePage.helperItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-auto rounded-[1.5rem] border border-[#dce4f2] bg-white p-4 shadow-[0_18px_34px_rgba(16,21,34,0.05)]">
              <div className="text-sm text-[#6d7686]">
                {isGuestMode ? "Guest mode" : "Signed in as"}
              </div>
              <div className="mt-1 font-semibold text-[#111727]">{user.name}</div>
              <div className="truncate text-sm text-[#6d7686]">{user.email}</div>
              <div className="mt-3 inline-flex rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f6fff]">
                {user.plan}
                {user.isDemo ? " demo" : ""}
              </div>

              {isGuestMode ? (
                <Link
                  href="/sign-in"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#d8e1ee] px-4 py-3 text-sm font-semibold text-[#111727] transition-colors hover:bg-[#f6f8fc]"
                >
                  Sign in to save work
                </Link>
              ) : (
                <form action={signOutAction} className="mt-4">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d8e1ee] px-4 py-3 text-sm font-semibold text-[#111727] transition-colors hover:bg-[#f6f8fc]"
                  >
                    Sign out
                  </button>
                </form>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-[#e1e7f0] bg-white/80 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7d8798]">
                  {activePage.eyebrow}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
                  {activePage.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-[#5d697d]">
                {activePage.chips.map((chip) => (
                  <div
                    key={chip}
                    className="rounded-full border border-[#dce4f2] bg-white px-4 py-2"
                  >
                    {chip}
                  </div>
                ))}
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
