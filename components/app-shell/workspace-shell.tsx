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
    label: "Documents",
    description: "Upload, summarize, and chat with your PDFs",
  },
  {
    href: "/search",
    label: "Search",
    description: "Search literature and support research claims",
  },
  {
    href: "/notes",
    label: "Notes",
    description: "Keep document notes and working thoughts together",
  },
  {
    href: "/billing",
    label: "Billing",
    description: "Manage Free and Pro access",
  },
] as const;

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
      className={`rounded-2xl border px-4 py-3 transition-all ${
        isActive
          ? "border-[#b4cdfd] bg-white shadow-[0_18px_40px_rgba(31,111,255,0.08)]"
          : "border-transparent bg-transparent hover:border-[#dce4f2] hover:bg-white/70"
      }`}
    >
      <div className="text-sm font-semibold text-[#111727]">{label}</div>
      <div className="mt-1 text-sm leading-6 text-[#6d7686]">{description}</div>
    </Link>
  );
}

export function WorkspaceShell({
  user,
  activePath,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#101522]">
      <div className="mx-auto grid min-h-screen max-w-[1680px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-[#e1e7f0] bg-white/75 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-5 py-6 sm:px-6">
            <ResearchForgeLogo />

            <div className="mt-8 grid gap-3">
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

            <div className="mt-8 rounded-[1.6rem] border border-[#dce4f2] bg-[#f8fbff] p-4">
              <div className="text-sm font-semibold text-[#23324b]">
                Research rules
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#667287]">
                <li>Answer only from retrieved PDF chunks.</li>
                <li>Say clearly when the document does not contain the answer.</li>
                <li>Always return page citations for grounded answers.</li>
              </ul>
            </div>

            <div className="mt-auto rounded-[1.75rem] border border-[#dce4f2] bg-white p-4 shadow-[0_20px_40px_rgba(16,21,34,0.05)]">
              <div className="text-sm text-[#6d7686]">Signed in as</div>
              <div className="mt-1 font-semibold text-[#111727]">{user.name}</div>
              <div className="text-sm text-[#6d7686]">{user.email}</div>
              <div className="mt-3 inline-flex rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f6fff]">
                {user.plan}
                {user.isDemo ? " demo" : ""}
              </div>

              <form action={signOutAction} className="mt-4">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d8e1ee] px-4 py-3 text-sm font-semibold text-[#111727] transition-colors hover:bg-[#f6f8fc]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-[#e1e7f0] bg-white/80 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7d8798]">
                  Research workspace
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
                  Build trustworthy answers from your own papers
                </h1>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-[#5d697d]">
                <div className="rounded-full border border-[#dce4f2] bg-white px-4 py-2">
                  PDF chat with citations
                </div>
                <div className="rounded-full border border-[#dce4f2] bg-white px-4 py-2">
                  Literature search
                </div>
                <div className="rounded-full border border-[#dce4f2] bg-white px-4 py-2">
                  Free + Pro billing
                </div>
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
