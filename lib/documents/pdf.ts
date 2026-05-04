import "server-only";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { estimateTokenCount, normalizeExtractedText } from "@/lib/documents/chunking";
import type { DocumentPageDraft } from "@/lib/db/types";

type TextItem = {
  str?: string;
  hasEOL?: boolean;
};

export async function extractPdfPages(buffer: Buffer) {
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pages: DocumentPageDraft[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => {
        const textItem = item as TextItem;
        const fragment = textItem.str ?? "";
        return textItem.hasEOL ? `${fragment}\n` : `${fragment} `;
      })
      .join("");

    const normalized = normalizeExtractedText(pageText);

    pages.push({
      pageNumber,
      textContent: normalized,
      tokenEstimate: estimateTokenCount(normalized),
    });
  }

  return pages;
}
