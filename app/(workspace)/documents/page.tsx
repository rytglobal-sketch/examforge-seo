import Link from "next/link";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { getWorkspaceViewer } from "@/lib/auth/dal";
import { getDocumentsForUser } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Research Workspace",
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getWorkspaceViewer();
  const params = await searchParams;
  const starterPrompt = getParam(params, "prompt");
  const documents = await getDocumentsForUser(session.id);
  const featuredDocument = documents[0];

  return (
    <WorkspaceShell user={session} activePath="/documents">
      <section className="space-y-6">
        <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-6 shadow-[0_22px_46px_rgba(16,21,34,0.04)]">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
            Research workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
            Start with a question, a source, or a sample workspace
          </h2>
          <p className="mt-3 max-w-[46rem] text-sm leading-7 text-[#6d7686]">
            Begin with a sample paper, a research question, or a citation task.
            ResearchForge helps you explain, summarize, save notes, and find sources
            as you work.
          </p>

          {starterPrompt ? (
            <div className="mt-5 rounded-[1.4rem] border border-[#e4dccf] bg-[#fbf7f1] px-4 py-4 text-sm leading-7 text-[#5d5348]">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c7f71]">
                Starter prompt
              </div>
              <p className="mt-2">&quot;{starterPrompt}&quot;</p>
            </div>
          ) : null}
        </div>

        {session.isDemo && featuredDocument ? (
          <div className="rounded-[1.7rem] border border-[#cfe0fb] bg-[#eef5ff] px-5 py-4 text-sm leading-7 text-[#325078]">
            Demo mode is ready. Start with the sample workspace below, ask a question,
            read the summary, or use it to find citations.
          </div>
        ) : null}

        {featuredDocument ? (
          <section className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_22px_46px_rgba(16,21,34,0.04)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
                  Start here
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
                  Open the sample research workspace
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[#5f6978]">
                <span className="rounded-full bg-[#f4f7fd] px-3 py-1.5">
                  Ask questions
                </span>
                <span className="rounded-full bg-[#f4f7fd] px-3 py-1.5">
                  Simple explanations
                </span>
                <span className="rounded-full bg-[#f4f7fd] px-3 py-1.5">
                  Summaries
                </span>
                <span className="rounded-full bg-[#f4f7fd] px-3 py-1.5">Notes</span>
                <span className="rounded-full bg-[#f4f7fd] px-3 py-1.5">Citations</span>
              </div>
            </div>

            <Link
              href={`/documents/${featuredDocument.id}`}
              className="mt-6 block rounded-[1.6rem] border border-[#dce4f2] bg-[#f8fbff] p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#111727]">
                    {featuredDocument.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#6d7686]">
                    {featuredDocument.pageCount} pages {"\u00b7"} {featuredDocument.status}
                  </p>
                </div>

                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f6fff]">
                  {featuredDocument.chatCount} chats
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#455066]">
                {featuredDocument.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {featuredDocument.summary.keyFindings.slice(0, 3).map((finding) => (
                  <span
                    key={finding}
                    className="rounded-full bg-white px-3 py-1 text-xs text-[#4f5d73]"
                  >
                    {finding}
                  </span>
                ))}
              </div>
            </Link>
          </section>
        ) : null}

        {documents.length > 1 ? (
          <section className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_22px_46px_rgba(16,21,34,0.04)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
              More papers
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {documents.slice(1).map((document) => (
                <Link
                  key={document.id}
                  href={`/documents/${document.id}`}
                  className="rounded-[1.4rem] border border-[#dce4f2] bg-[#f8fbff] p-4 transition-transform hover:-translate-y-0.5"
                >
                  <h3 className="text-lg font-semibold tracking-[-0.04em] text-[#111727]">
                    {document.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#6d7686]">
                    {document.pageCount} pages {"\u00b7"} {document.status}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#455066]">{document.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </WorkspaceShell>
  );
}
