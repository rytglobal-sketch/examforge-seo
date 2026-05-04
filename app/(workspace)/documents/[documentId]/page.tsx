import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { DocumentWorkspaceView } from "@/components/research/document-workspace";
import { requireSession } from "@/lib/auth/dal";
import { getDocumentWorkspace } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Document Workspace",
};

export default async function DocumentWorkspacePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const session = await requireSession();
  const { documentId } = await params;
  const workspace = await getDocumentWorkspace(session.id, documentId);

  if (!workspace) {
    notFound();
  }

  return (
    <WorkspaceShell user={session} activePath="/documents">
      <div className="mb-6 rounded-[1.75rem] border border-[#dce4f2] bg-white px-5 py-5 shadow-[0_22px_46px_rgba(16,21,34,0.04)]">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
          PDF workspace
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111727]">
          Chat, summarize, and annotate a single paper
        </h2>
        <p className="mt-3 max-w-[56rem] text-sm leading-7 text-[#6d7686]">
          The chat panel only uses retrieved chunks from this uploaded PDF. When
          a claim is unsupported, ResearchForge says so instead of guessing.
        </p>
      </div>

      <DocumentWorkspaceView workspace={workspace} />
    </WorkspaceShell>
  );
}
