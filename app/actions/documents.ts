"use server";

import { redirect } from "next/navigation";
import { getWorkspaceViewer } from "@/lib/auth/dal";
import { getBillingSnapshot } from "@/lib/db/queries";
import {
  answerDocumentQuestion,
  ingestUploadedPdf,
  runDocumentDeepResearch,
  saveDocumentNote,
} from "@/lib/documents/service";
import { isDatabaseConfigured } from "@/lib/env";

export type UploadFormState = {
  error?: string;
};

export async function uploadDocumentAction(
  _previousState: UploadFormState | undefined,
  formData: FormData,
) {
  const session = await getWorkspaceViewer();

  if (session.isDemo) {
    return {
      error:
        "Guest mode is ready for exploring the product, but uploading real PDFs still needs an account.",
    } satisfies UploadFormState;
  }

  if (!isDatabaseConfigured()) {
    return {
      error:
        "Set DATABASE_URL and run the pgvector migration to enable real PDF uploads. The UI stays usable in demo mode until then.",
    } satisfies UploadFormState;
  }

  const billing = await getBillingSnapshot(session.id);
  if (billing.uploadLimit !== null && billing.uploadCount >= billing.uploadLimit) {
    return {
      error: `Your ${billing.plan} plan allows ${billing.uploadLimit} uploaded PDFs. Upgrade to Pro for unlimited uploads.`,
    } satisfies UploadFormState;
  }

  const fileEntry = formData.get("pdf");

  if (!(fileEntry instanceof File)) {
    return {
      error: "Choose a PDF before uploading.",
    } satisfies UploadFormState;
  }

  if (!fileEntry.name.toLowerCase().endsWith(".pdf")) {
    return {
      error: "Only PDF files are supported right now.",
    } satisfies UploadFormState;
  }

  if (fileEntry.size > 25 * 1024 * 1024) {
    return {
      error: "Please upload a PDF smaller than 25 MB for this MVP.",
    } satisfies UploadFormState;
  }

  const buffer = Buffer.from(await fileEntry.arrayBuffer());

  const documentId = await ingestUploadedPdf({
    userId: session.id,
    fileName: fileEntry.name,
    mimeType: fileEntry.type || "application/pdf",
    buffer,
  });

  redirect(`/documents/${documentId}`);
}

export async function sendChatMessageAction(input: {
  documentId: string;
  prompt: string;
}) {
  const session = await getWorkspaceViewer();

  if (!input.prompt.trim()) {
    throw new Error("Ask a question before sending.");
  }

  return answerDocumentQuestion({
    userId: session.id,
    documentId: input.documentId,
    prompt: input.prompt.trim(),
  });
}

export async function runDeepResearchAction(input: {
  documentId: string;
  prompt: string;
}) {
  const session = await getWorkspaceViewer();

  if (!input.prompt.trim()) {
    throw new Error("Ask a research question before running Deep Research.");
  }

  return runDocumentDeepResearch({
    userId: session.id,
    documentId: input.documentId,
    prompt: input.prompt.trim(),
  });
}

export async function saveNoteAction(input: { documentId: string; body: string }) {
  const session = await getWorkspaceViewer();

  return saveDocumentNote({
    userId: session.id,
    documentId: input.documentId,
    body: input.body.trim(),
  });
}
