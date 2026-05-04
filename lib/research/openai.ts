import "server-only";
import OpenAI from "openai";
import { z } from "zod";
import { getChatModel, getEmbeddingModel, isOpenAIConfigured } from "@/lib/env";
import type {
  DocumentChunkRecord,
  DocumentPageDraft,
  GroundedAnswer,
  SummaryDraft,
} from "@/lib/db/types";

let openAiClient: OpenAI | null | undefined;

const summarySchema = z.object({
  title: z.string().optional(),
  authors: z.array(z.string()).optional(),
  simpleSummary: z.string(),
  keyFindings: z.array(z.string()).min(1),
  methodology: z.string(),
  limitations: z.string(),
  importantDefinitions: z.array(
    z.object({
      term: z.string(),
      meaning: z.string(),
    }),
  ),
  possibleExamQuestions: z.array(z.string()).min(1),
});

const groundedAnswerSchema = z.object({
  answer: z.string(),
  simplifiedAnswer: z.string(),
  citations: z.array(z.number().int().positive()),
  notFound: z.boolean(),
  supportingQuotes: z.array(z.string()),
});

function getOpenAIClient() {
  if (openAiClient !== undefined) {
    return openAiClient;
  }

  if (!process.env.OPENAI_API_KEY) {
    openAiClient = null;
    return openAiClient;
  }

  openAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openAiClient;
}

function flattenContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part === "object" && "text" in part) {
          const textValue = part.text;
          return typeof textValue === "string" ? textValue : "";
        }

        return "";
      })
      .join("");
  }

  return "";
}

function fallbackSummary(text: string, titleHint: string): SummaryDraft {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const firstSentence =
    sentences[0] ??
    "This paper discusses the uploaded research document, but a richer summary requires model access.";

  const secondSentence = sentences[1] ?? sentences[0] ?? "";
  const topSentences = sentences.slice(0, 3);

  const methodologySentence =
    sentences.find((sentence) =>
      /(method|methodology|approach|analysis|experiment|survey|review)/i.test(
        sentence,
      ),
    ) ?? "The methodology was not explicitly extracted from the uploaded text.";

  const limitationSentence =
    sentences.find((sentence) =>
      /(limit|constraint|future work|uncertain|however|caution)/i.test(sentence),
    ) ??
    "The paper's limitations were not clearly stated in the extracted pages that were available.";

  return {
    title: titleHint,
    authors: [],
    simpleSummary: `${firstSentence} ${secondSentence}`.trim(),
    keyFindings:
      topSentences.length > 0
        ? topSentences
        : [
            "The PDF text was extracted successfully, but richer key findings require an available AI model.",
          ],
    methodology: methodologySentence,
    limitations: limitationSentence,
    importantDefinitions: [
      {
        term: "Grounded answer",
        meaning:
          "An answer based only on the uploaded PDF text instead of general model knowledge.",
      },
    ],
    possibleExamQuestions: [
      `Summarize the central argument of ${titleHint}.`,
      "Which methodology or evidence does the paper rely on most heavily?",
      "What limitations should a student mention before citing this document?",
    ],
  };
}

function fallbackAnswer(
  question: string,
  chunks: DocumentChunkRecord[],
): GroundedAnswer {
  const uniquePages = Array.from(new Set(chunks.map((chunk) => chunk.pageNumber)));

  if (chunks.length === 0) {
    return {
      answer:
        "I could not find that answer in the uploaded PDF context, so I cannot answer it reliably.",
      simplifiedAnswer:
        "The document pages I searched do not clearly contain the answer.",
      citations: [],
      notFound: true,
      supportingQuotes: [],
    };
  }

  const supportingQuotes = chunks.slice(0, 2).map((chunk) => chunk.content.slice(0, 240));

  return {
    answer: `Based on the most relevant extracted pages, the document links your question to the following evidence: ${supportingQuotes.join(
      " ",
    )}`,
    simplifiedAnswer: `In simple terms, the paper discusses this topic on pages ${uniquePages.join(
      ", ",
    )}, but the fallback mode is extractive rather than fully synthesized.`,
    citations: uniquePages,
    notFound: false,
    supportingQuotes,
  };
}

export async function embedTexts(texts: string[]) {
  const client = getOpenAIClient();

  if (!client || texts.length === 0) {
    return [];
  }

  const response = await client.embeddings.create({
    model: getEmbeddingModel(),
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

export async function generateDocumentSummary(
  pages: DocumentPageDraft[],
  titleHint: string,
) {
  const combinedText = pages
    .slice(0, 10)
    .map((page) => `[Page ${page.pageNumber}] ${page.textContent}`)
    .join("\n\n");

  if (!isOpenAIConfigured()) {
    return fallbackSummary(combinedText, titleHint);
  }

  const client = getOpenAIClient();

  if (!client) {
    return fallbackSummary(combinedText, titleHint);
  }

  try {
    const completion = await client.chat.completions.create({
      model: getChatModel(),
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You summarize academic PDFs for students. Return valid JSON with keys title, authors, simpleSummary, keyFindings, methodology, limitations, importantDefinitions, possibleExamQuestions. Explain academic language clearly and simply. Do not invent facts that are missing from the supplied pages.",
        },
        {
          role: "user",
          content: `Title hint: ${titleHint}\n\nExtracted pages:\n${combinedText}`,
        },
      ],
    });

    const payload = flattenContent(completion.choices[0]?.message?.content);
    return summarySchema.parse(JSON.parse(payload));
  } catch {
    return fallbackSummary(combinedText, titleHint);
  }
}

export async function answerFromDocumentContext(
  question: string,
  chunks: DocumentChunkRecord[],
) {
  if (chunks.length === 0 || !isOpenAIConfigured()) {
    return fallbackAnswer(question, chunks);
  }

  const client = getOpenAIClient();

  if (!client) {
    return fallbackAnswer(question, chunks);
  }

  const context = chunks
    .map(
      (chunk) =>
        `[Page ${chunk.pageNumber}] ${chunk.content}\nRelevance score: ${chunk.score?.toFixed(2) ?? "n/a"}`,
    )
    .join("\n\n");

  try {
    const completion = await client.chat.completions.create({
      model: getChatModel(),
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are ResearchForge, an academic research assistant. You may answer only from the supplied PDF chunks. If the answer is not present, set notFound to true and say so plainly. Always simplify dense academic language. Return valid JSON with keys answer, simplifiedAnswer, citations, notFound, supportingQuotes. citations must be page numbers drawn only from the provided chunks.",
        },
        {
          role: "user",
          content: `Question: ${question}\n\nContext chunks:\n${context}`,
        },
      ],
    });

    const payload = flattenContent(completion.choices[0]?.message?.content);
    return groundedAnswerSchema.parse(JSON.parse(payload));
  } catch {
    return fallbackAnswer(question, chunks);
  }
}
