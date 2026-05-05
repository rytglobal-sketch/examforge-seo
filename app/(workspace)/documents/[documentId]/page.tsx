import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentWorkspaceView } from "@/components/research/document-workspace";
import { getWorkspaceViewer } from "@/lib/auth/dal";
import { getDocumentWorkspace } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Document Workspace",
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

export default async function DocumentWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getWorkspaceViewer();
  const { documentId } = await params;
  const resolvedSearchParams = await searchParams;
  const initialPrompt = getParam(resolvedSearchParams, "prompt");
  const requestedTab = getParam(resolvedSearchParams, "tab");
  const requestedMode = getParam(resolvedSearchParams, "mode");
  const workspace = await getDocumentWorkspace(session.id, documentId);

  if (!workspace) {
    notFound();
  }

  return (
    <DocumentWorkspaceView
      workspace={workspace}
      initialPrompt={initialPrompt}
      initialTab={
        requestedTab === "summary" || requestedTab === "notes" ? requestedTab : "chat"
      }
      initialMode={
        requestedMode === "chat-with-pdf" || requestedMode === "notes"
          ? requestedMode
          : "deep-research"
      }
      autoRunInitialPrompt={Boolean(initialPrompt && requestedMode === "deep-research")}
    />
  );
}
