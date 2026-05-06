import Link from "next/link";
import type { Metadata } from "next";
import { UploadDocumentForm } from "@/components/forms/upload-document-form";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { getWorkspaceViewer } from "@/lib/auth/dal";
import { getDocumentsForUser } from "@/lib/db/queries";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "My Papers",
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

function FocusCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
      <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-[#556277]">{body}</p>
    </div>
  );
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
  const uploadsDisabled = session.isDemo || !isDatabaseConfigured();

  return (
    <WorkspaceShell user={session} activePath="/documents">
      <section className="space-y-6">
        {uploadsDisabled ? (
          <div className="rounded-[1.7rem] border border-[#cfe0fb] bg-[#eef5ff] px-5 py-4 text-sm leading-7 text-[#325078]">
            {session.isDemo
              ? "You are exploring ResearchForge in demo mode. Sign in with a configured database to upload real papers and save your work."
              : "Add DATABASE_URL and OPENAI_API_KEY, then run the migration to unlock real uploads and saved work."}
          </div>
        ) : null}

        {starterPrompt ? (
          <div className="rounded-[1.7rem] border border-[#e4dccf] bg-[#fbf7f1] px-5 py-4 text-sm leading-7 text-[#5d5348]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c7f71]">
              Starter prompt
            </div>
            <p className="mt-2">&quot;{starterPrompt}&quot;</p>
            <p className="mt-2 text-[#786d62]">
              Upload a paper or open one below, then use this as your first grounded question.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <FocusCard
            title="Upload papers"
            body="Bring your PDFs into one place so you can ask questions and keep your research organized."
          />
          <FocusCard
            title="Ask clearly"
            body="Open any paper to get direct answers, simple explanations, and page-backed responses."
          />
          <FocusCard
            title="Summarize and note"
            body="Turn dense papers into summaries, then save the important takeaways into notes."
          />
        </div>

        <UploadDocumentForm disabled={uploadsDisabled} />

        <section className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_22px_46px_rgba(16,21,34,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
                Your papers
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
                Uploaded PDFs ready for questions and summaries
              </h2>
            </div>
            <p className="max-w-[32rem] text-sm leading-6 text-[#6d7686]">
              Each paper keeps its extracted text, grounded answers, summary output,
              and saved notes together.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {documents.map((document) => (
              <Link
                key={document.id}
                href={`/documents/${document.id}`}
                className="rounded-[1.6rem] border border-[#dce4f2] bg-[#f8fbff] p-5 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#111727]">
                      {document.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#6d7686]">
                      {document.pageCount} pages {"\u00b7"} {document.status}
                    </p>
                  </div>

                  <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f6fff]">
                    {document.chatCount} chats
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-[#455066]">
                  {document.excerpt}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {document.summary.keyFindings.slice(0, 2).map((finding) => (
                    <span
                      key={finding}
                      className="rounded-full bg-white px-3 py-1 text-xs text-[#4f5d73]"
                    >
                      {finding}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </WorkspaceShell>
  );
}
