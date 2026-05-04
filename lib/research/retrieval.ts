import "server-only";
import { getSql, vectorLiteral } from "@/lib/db/client";
import type { DocumentChunkRecord } from "@/lib/db/types";
import { demoChunks, demoDocumentId } from "@/lib/mock-data";
import { embedTexts } from "@/lib/research/openai";

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function rankChunksByKeyword(query: string, chunks: DocumentChunkRecord[]) {
  const terms = tokenize(query);

  return chunks
    .map((chunk) => {
      const body = chunk.content.toLowerCase();
      const score = terms.reduce((total, term) => {
        if (body.includes(term)) {
          return total + 1;
        }

        return total;
      }, 0);

      return {
        ...chunk,
        score,
      };
    })
    .filter((chunk) => Number(chunk.score) > 0)
    .sort((left, right) => Number(right.score) - Number(left.score));
}

async function keywordFallback(documentId: string, query: string, limit: number) {
  const sql = getSql();

  if (sql) {
    const rows = await sql<DocumentChunkRecord[]>`
      select
        id,
        document_id as "documentId",
        page_id as "pageId",
        page_number as "pageNumber",
        chunk_index as "chunkIndex",
        content,
        token_estimate as "tokenEstimate",
        metadata
      from document_chunks
      where document_id = ${documentId}
      order by page_number asc, chunk_index asc
      limit 200
    `;

    return rankChunksByKeyword(query, rows).slice(0, limit);
  }

  if (documentId === demoDocumentId) {
    return rankChunksByKeyword(query, demoChunks).slice(0, limit);
  }

  return [];
}

export async function retrieveRelevantChunks(
  documentId: string,
  query: string,
  limit = 6,
) {
  const sql = getSql();

  if (!sql) {
    if (documentId !== demoDocumentId) {
      return [];
    }

    return keywordFallback(documentId, query, limit);
  }

  const [queryEmbedding] = await embedTexts([query]);

  if (!queryEmbedding || queryEmbedding.length === 0) {
    return keywordFallback(documentId, query, limit);
  }

  const embedding = vectorLiteral(queryEmbedding);

  const rows = await sql<DocumentChunkRecord[]>`
    select
      id,
      document_id as "documentId",
      page_id as "pageId",
      page_number as "pageNumber",
      chunk_index as "chunkIndex",
      content,
      token_estimate as "tokenEstimate",
      metadata,
      1 - (embedding <=> ${embedding}::vector) as "score"
    from document_chunks
    where document_id = ${documentId}
      and embedding is not null
    order by embedding <=> ${embedding}::vector
    limit ${limit}
  `;

  const filtered = rows.filter((chunk) => Number(chunk.score ?? 0) > 0.15);

  if (filtered.length === 0) {
    return keywordFallback(documentId, query, limit);
  }

  return filtered;
}
