import type { DocumentChunkDraft } from "@/lib/db/types";

export function normalizeExtractedText(text: string) {
  return text.replace(/\u0000/g, "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function estimateTokenCount(text: string) {
  if (!text.trim()) {
    return 0;
  }

  return Math.ceil(text.trim().split(/\s+/).length * 1.2);
}

export function splitPageIntoChunks(
  pageNumber: number,
  text: string,
  maxChars = 1400,
  overlapChars = 180,
) {
  const normalized = normalizeExtractedText(text);

  if (!normalized) {
    return [] satisfies DocumentChunkDraft[];
  }

  const chunks: DocumentChunkDraft[] = [];
  let cursor = 0;
  let chunkIndex = 0;

  while (cursor < normalized.length) {
    let end = Math.min(normalized.length, cursor + maxChars);

    if (end < normalized.length) {
      const breakPoint = normalized.lastIndexOf(" ", end);
      if (breakPoint > cursor + Math.floor(maxChars * 0.55)) {
        end = breakPoint;
      }
    }

    const content = normalized.slice(cursor, end).trim();

    if (content) {
      chunks.push({
        pageNumber,
        chunkIndex,
        content,
        tokenEstimate: estimateTokenCount(content),
        metadata: {
          charStart: cursor,
          charEnd: end,
        },
      });
      chunkIndex += 1;
    }

    if (end >= normalized.length) {
      break;
    }

    cursor = Math.max(end - overlapChars, cursor + 1);
  }

  return chunks;
}
