import Link from "next/link";
import type { Metadata } from "next";
import { UploadDocumentForm } from "@/components/forms/upload-document-form";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { requireSession } from "@/lib/auth/dal";
import { getBillingSnapshot, getDocumentsForUser } from "@/lib/db/queries";
import { isDatabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Documents",
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

function getModeDetails(mode: string) {
  switch (mode) {
    case "write-draft":
      return {
        title: "Draft workflow",
        description:
          "Use the starter prompt below to begin outlining a thesis section or paper draft from one of your uploaded PDFs.",
      };
    case "generate-diagram":
      return {
        title: "Diagram workflow",
        description:
          "Open a paper and turn its model, variables, or process into a diagram-ready breakdown.",
      };
    case "extract-data":
      return {
        title: "Data extraction workflow",
        description:
          "Use the starter prompt to pull out methods, variables, samples, and findings from a paper.",
      };
    case "write-report":
      return {
        title: "Report workflow",
        description:
          "Start from an uploaded paper and turn the evidence into a structured report or write-up.",
      };
    case "word-document":
      return {
        title: "Word document workflow",
        description:
          "Launch into a Word-ready outline built from the content of your uploaded research paper.",
      };
    case "ppt-presentation":
      return {
        title: "Presentation workflow",
        description:
          "Use the starter prompt to turn one paper into slides, bullet points, and speaking notes.",
      };
    case "latex-manuscript":
      return {
        title: "LaTeX manuscript workflow",
        description:
          "Translate the document into a manuscript structure with sections and figure placeholders.",
      };
    case "latex-poster":
      return {
        title: "LaTeX poster workflow",
        description:
          "Open a paper and condense it into a poster-friendly structure with concise findings.",
      };
    case "data-visualization":
      return {
        title: "Data visualization workflow",
        description:
          "Pull out the strongest results and convert them into chart and table ideas.",
      };
    case "pdf-report":
      return {
        title: "PDF report workflow",
        description:
          "Use an uploaded paper as the basis for a compact report with summary, findings, and references.",
      };
    case "website":
      return {
        title: "Website workflow",
        description:
          "Reshape a paper into website sections, summaries, and content blocks for publishing.",
      };
    case "infographic":
      return {
        title: "Infographic workflow",
        description:
          "Turn the key points and stats into a simple visual-story outline before designing.",
      };
    default:
      return null;
  }
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
      <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111727]">
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-[#6d7686]">{hint}</p>
    </div>
  );
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const starterPrompt = getParam(params, "prompt");
  const launchMode = getParam(params, "mode");
  const modeDetails = getModeDetails(launchMode);

  const [documents, billing] = await Promise.all([
    getDocumentsForUser(session.id),
    getBillingSnapshot(session.id),
  ]);

  const uploadsDisabled = !isDatabaseConfigured();

  return (
    <WorkspaceShell user={session} activePath="/documents">
      <section className="space-y-6">
        {session.isDemo || uploadsDisabled ? (
          <div className="rounded-[1.7rem] border border-[#cfe0fb] bg-[#eef5ff] px-5 py-4 text-sm leading-7 text-[#325078]">
            {uploadsDisabled
              ? "ResearchForge is running in preview mode. Add DATABASE_URL, OPENAI_API_KEY, Stripe keys, and run the migration to unlock real uploads and persistence."
              : "You are exploring ResearchForge in demo mode. Sign up with a configured database to persist real documents and chat history."}
          </div>
        ) : null}

        {starterPrompt ? (
          <div className="rounded-[1.7rem] border border-[#e4dccf] bg-[#fbf7f1] px-5 py-4 text-sm leading-7 text-[#5d5348]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c7f71]">
              {modeDetails?.title ?? "Starter prompt"}
            </div>
            <p className="mt-2">&quot;{starterPrompt}&quot;</p>
            <p className="mt-2 text-[#786d62]">
              {modeDetails?.description ??
                "Upload a paper or open one of your documents, then use this as your first grounded PDF question."}
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard
            label="Uploaded PDFs"
            value={`${billing.uploadCount}`}
            hint={
              billing.uploadLimit === null
                ? "Your Pro plan supports unlimited uploaded papers."
                : `Your Free plan includes ${billing.uploadLimit} documents.`
            }
          />
          <StatCard
            label="Plan"
            value={billing.plan.toUpperCase()}
            hint="Upgrade to Pro for unlimited uploads and ongoing research threads."
          />
          <StatCard
            label="Chat allowance"
            value={billing.questionLimit === null ? "Unlimited" : `${billing.questionLimit}/mo`}
            hint="Every grounded answer must stay inside retrieved PDF context."
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
                Research documents with grounded chat
              </h2>
            </div>
            <p className="max-w-[32rem] text-sm leading-6 text-[#6d7686]">
              Each document stores extracted page text, page-based chunks, embeddings,
              notes, summary sections, and chat history.
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
