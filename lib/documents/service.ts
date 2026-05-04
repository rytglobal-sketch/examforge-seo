import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  appendChatExchange,
  createDocumentSkeleton,
  getDocumentWorkspace,
  markDocumentFailed,
  persistProcessedDocument,
  upsertDocumentNote,
} from "@/lib/db/queries";
import type { ChatMessageRecord } from "@/lib/db/types";
import { splitPageIntoChunks } from "@/lib/documents/chunking";
import { extractPdfPages } from "@/lib/documents/pdf";
import { answerFromDocumentContext, embedTexts, generateDocumentSummary } from "@/lib/research/openai";
import { retrieveRelevantChunks } from "@/lib/research/retrieval";

function slugFromFileName(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function saveUploadBuffer(documentId: string, buffer: Buffer) {
  const uploadsDirectory = join(process.cwd(), "storage", "uploads");
  await mkdir(uploadsDirectory, { recursive: true });

  const storagePath = join(uploadsDirectory, `${documentId}.pdf`);
  await writeFile(storagePath, buffer);

  return storagePath;
}

export async function ingestUploadedPdf(input: {
  userId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const documentId = randomUUID();
  const title = slugFromFileName(input.fileName) || "Uploaded Paper";
  const storagePath = await saveUploadBuffer(documentId, input.buffer);

  await createDocumentSkeleton({
    documentId,
    userId: input.userId,
    title,
    sourceFileName: input.fileName,
    storagePath,
    mimeType: input.mimeType || "application/pdf",
  });

  try {
    const pages = await extractPdfPages(input.buffer);
    const chunks = pages.flatMap((page) =>
      splitPageIntoChunks(page.pageNumber, page.textContent),
    );

    const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
    const enrichedChunks = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index] ?? null,
    }));

    const summary = await generateDocumentSummary(pages, title);

    await persistProcessedDocument({
      documentId,
      title,
      authors: summary.authors ?? [],
      pages,
      chunks: enrichedChunks,
      summary,
    });

    return documentId;
  } catch (error) {
    await markDocumentFailed(documentId);
    throw error;
  }
}

export async function answerDocumentQuestion(input: {
  userId: string;
  documentId: string;
  prompt: string;
}) {
  const workspace = await getDocumentWorkspace(input.userId, input.documentId);

  if (!workspace) {
    throw new Error("Document not found.");
  }

  const chunks = await retrieveRelevantChunks(input.documentId, input.prompt);
  const groundedAnswer = await answerFromDocumentContext(input.prompt, chunks);

  const persisted = await appendChatExchange({
    userId: input.userId,
    documentId: input.documentId,
    prompt: input.prompt,
    answer: groundedAnswer.notFound
      ? `${groundedAnswer.answer} ${groundedAnswer.simplifiedAnswer}`.trim()
      : `${groundedAnswer.answer}\n\nIn simple terms: ${groundedAnswer.simplifiedAnswer}`.trim(),
    citations: groundedAnswer.citations,
  });

  return {
    userMessage: persisted.userMessage,
    assistantMessage: persisted.assistantMessage,
    supportingQuotes: groundedAnswer.supportingQuotes,
  } satisfies {
    userMessage: ChatMessageRecord;
    assistantMessage: ChatMessageRecord;
    supportingQuotes: string[];
  };
}

export async function saveDocumentNote(input: {
  userId: string;
  documentId: string;
  body: string;
}) {
  return upsertDocumentNote(input);
}
