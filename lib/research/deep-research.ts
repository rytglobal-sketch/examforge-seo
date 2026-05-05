import "server-only";
import OpenAI from "openai";
import { z } from "zod";
import {
  getAppUrl,
  getDeepResearchModel,
  getOpenRouterBaseUrl,
  isOpenRouterConfigured,
} from "@/lib/env";
import { searchLiterature } from "@/lib/research/literature";
import type {
  DeepResearchPaper,
  DeepResearchResult,
  DeepResearchRelevanceTag,
  DeepResearchSection,
  DocumentPageRecord,
  LiteratureResult,
} from "@/lib/db/types";

type ResearchContext = {
  documentTitle?: string;
  documentSummary?: string;
  pages?: DocumentPageRecord[];
};

type RankedPaperDraft = {
  id: string;
  relevanceScore: number;
  relevanceTag: DeepResearchRelevanceTag;
  reasoning: string;
};

let openRouterClient: OpenAI | null | undefined;

const deepResearchSchema = z.object({
  refinedQuery: z.string(),
  searchSummary: z.string(),
  tldr: z.string(),
  sections: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        supportingPaperIds: z.array(z.string()),
      }),
    )
    .min(2)
    .max(6),
  rankedPapers: z
    .array(
      z.object({
        id: z.string(),
        relevanceScore: z.number().min(0).max(100),
        relevanceTag: z.enum([
          "Highly Relevant",
          "Relevant",
          "Partially Relevant",
          "Low Relevance",
        ]),
        reasoning: z.string(),
      }),
    )
    .min(1),
  relatedQuestions: z.array(z.string()).min(1).max(5),
});

function getOpenRouterClient() {
  if (openRouterClient !== undefined) {
    return openRouterClient;
  }

  if (!process.env.OPENROUTER_API_KEY) {
    openRouterClient = null;
    return openRouterClient;
  }

  openRouterClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: getOpenRouterBaseUrl(),
    defaultHeaders: {
      "HTTP-Referer": getAppUrl(),
      "X-Title": "ResearchForge",
    },
  });

  return openRouterClient;
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
          const value = part.text;
          return typeof value === "string" ? value : "";
        }

        return "";
      })
      .join("");
  }

  return "";
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function buildPaperKey(paper: LiteratureResult) {
  return (paper.doi ?? paper.title).toLowerCase();
}

function buildSourceLabel(paper: LiteratureResult) {
  return `${paper.venue} · ${paper.year}`;
}

function dedupePapers(papers: LiteratureResult[]) {
  const seen = new Set<string>();
  const deduped: LiteratureResult[] = [];

  for (const paper of papers) {
    const key = buildPaperKey(paper);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(paper);
  }

  return deduped;
}

function inferRelevanceTag(score: number): DeepResearchRelevanceTag {
  if (score >= 80) {
    return "Highly Relevant";
  }

  if (score >= 65) {
    return "Relevant";
  }

  if (score >= 45) {
    return "Partially Relevant";
  }

  return "Low Relevance";
}

function scorePaper(query: string, paper: LiteratureResult) {
  const queryTokens = tokenize(query);
  const searchable = normalizeText(
    `${paper.title} ${paper.abstract} ${paper.authors.join(" ")} ${paper.venue}`,
  );

  const tokenMatches = queryTokens.filter((token) => searchable.includes(token)).length;
  const coverage = queryTokens.length > 0 ? tokenMatches / queryTokens.length : 0;
  const citationBoost = Math.min((paper.citationCount ?? 0) / 120, 0.2);
  const titleBoost = paper.title.toLowerCase().includes(query.toLowerCase()) ? 0.15 : 0;

  return Math.min(100, Math.round((coverage * 65 + citationBoost * 100 + titleBoost * 100)));
}

function toRankedFallbackPaper(query: string, paper: LiteratureResult): DeepResearchPaper {
  const relevanceScore = scorePaper(query, paper);
  const relevanceTag = inferRelevanceTag(relevanceScore);

  return {
    ...paper,
    relevanceScore,
    relevanceTag,
    reasoning:
      relevanceTag === "Highly Relevant"
        ? "Directly matches the topic and looks useful for a core citation."
        : relevanceTag === "Relevant"
          ? "Covers important parts of the topic and can support the main synthesis."
          : relevanceTag === "Partially Relevant"
            ? "Touches the topic but may be narrower, older, or less aligned with the main question."
            : "Only loosely connected to the question, so treat it as background context.",
    sourceLabel: buildSourceLabel(paper),
  };
}

function buildFallbackSections(
  rankedPapers: DeepResearchPaper[],
  context: ResearchContext,
): DeepResearchSection[] {
  const topPaper = rankedPapers[0];
  const secondPaper = rankedPapers[1] ?? rankedPapers[0];
  const thirdPaper = rankedPapers[2] ?? rankedPapers[0];
  const summaryLead =
    context.documentSummary ??
    "The uploaded document provides a useful anchor, but the broader literature still needs to be checked against external papers.";

  return [
    {
      title: "Research direction",
      body: `${summaryLead} The strongest matching external paper is "${topPaper?.title ?? "the top-ranked paper"}", which should be reviewed first before broadening into adjacent studies.`,
      supportingPaperIds: topPaper ? [topPaper.id] : [],
    },
    {
      title: "Most relevant evidence",
      body: `The ranked set suggests that "${topPaper?.title ?? "the first paper"}" and "${secondPaper?.title ?? "the second paper"}" are the best starting points because their titles, abstracts, and venues align most closely with the query.`,
      supportingPaperIds: [topPaper?.id, secondPaper?.id].filter(Boolean) as string[],
    },
    {
      title: "Where to probe for gaps",
      body: `Compare the methods, populations, and limits reported across "${secondPaper?.title ?? "the second paper"}" and "${thirdPaper?.title ?? "the third paper"}" to identify what still looks under-explained or inconsistent.`,
      supportingPaperIds: [secondPaper?.id, thirdPaper?.id].filter(Boolean) as string[],
    },
  ];
}

function buildFallbackDeepResearch(
  query: string,
  candidatePapers: LiteratureResult[],
  context: ResearchContext,
): DeepResearchResult {
  const rankedPapers = candidatePapers
    .map((paper) => toRankedFallbackPaper(query, paper))
    .sort((left, right) => right.relevanceScore - left.relevanceScore)
    .slice(0, 12);

  return {
    query,
    refinedQuery: query,
    model: isOpenRouterConfigured() ? getDeepResearchModel() : "heuristic-fallback",
    totalCandidatePapers: candidatePapers.length,
    searchQueries: [query],
    searchSummary:
      "ResearchForge searched multiple literature providers, deduplicated the matches, and ranked the papers using title, abstract, and citation overlap.",
    tldr:
      rankedPapers[0]
        ? `The strongest starting point is "${rankedPapers[0].title}". Use the top-ranked papers to compare methods, limits, and contradictions before drafting a literature review.`
        : "No strong external papers were found, so refine the query before relying on the current search set.",
    sections: buildFallbackSections(rankedPapers, context),
    papers: rankedPapers,
    relatedQuestions: [
      "Which of these papers gives the clearest methodology I can compare?",
      "Where do the top papers disagree or leave open questions?",
      "Which paper is the best citation for my thesis background section?",
    ],
  };
}

async function searchAcrossProviders(query: string) {
  const [openAlex, semanticScholar, crossref] = await Promise.all([
    searchLiterature(query, "openalex"),
    searchLiterature(query, "semantic-scholar"),
    searchLiterature(query, "crossref"),
  ]);

  return dedupePapers([...openAlex, ...semanticScholar, ...crossref]);
}

function buildPromptContext(context: ResearchContext) {
  const title = context.documentTitle
    ? `Uploaded document title: ${context.documentTitle}`
    : "Uploaded document title: not provided";
  const summary = context.documentSummary
    ? `Uploaded document summary: ${context.documentSummary}`
    : "Uploaded document summary: not provided";
  const pageSnippets = (context.pages ?? [])
    .slice(0, 4)
    .map((page) => `[Page ${page.pageNumber}] ${page.textContent}`)
    .join("\n");

  return [title, summary, `Document snippets:\n${pageSnippets || "No snippets provided."}`].join(
    "\n\n",
  );
}

function mapModelRankingToPapers(
  rankedPapers: RankedPaperDraft[],
  candidatePapers: LiteratureResult[],
  query: string,
) {
  const paperMap = new Map(candidatePapers.map((paper) => [paper.id, paper]));

  const mapped = rankedPapers
    .map((rankedPaper) => {
      const paper = paperMap.get(rankedPaper.id);

      if (!paper) {
        return null;
      }

      return {
        ...paper,
        relevanceScore: rankedPaper.relevanceScore,
        relevanceTag: rankedPaper.relevanceTag,
        reasoning: rankedPaper.reasoning,
        sourceLabel: buildSourceLabel(paper),
      } satisfies DeepResearchPaper;
    })
    .filter(Boolean) as DeepResearchPaper[];

  if (mapped.length > 0) {
    return mapped;
  }

  return candidatePapers
    .map((paper) => toRankedFallbackPaper(query, paper))
    .sort((left, right) => right.relevanceScore - left.relevanceScore)
    .slice(0, 12);
}

export async function runDeepResearch(
  query: string,
  context: ResearchContext = {},
) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return buildFallbackDeepResearch("", [], context);
  }

  const candidatePapers = await searchAcrossProviders(trimmedQuery);
  const limitedCandidates = candidatePapers.slice(0, 18);

  if (!isOpenRouterConfigured() || limitedCandidates.length === 0) {
    return buildFallbackDeepResearch(trimmedQuery, limitedCandidates, context);
  }

  const client = getOpenRouterClient();

  if (!client) {
    return buildFallbackDeepResearch(trimmedQuery, limitedCandidates, context);
  }

  try {
    const completion = await client.chat.completions.create({
      model: getDeepResearchModel(),
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are ResearchForge Deep Research. Use only the supplied candidate papers and uploaded-document context. Do not invent papers, authors, results, or citations. Rank the papers by relevance to the query, explain relevance plainly, and write clear academic synthesis in simple language. Return valid JSON with keys refinedQuery, searchSummary, tldr, sections, rankedPapers, relatedQuestions.",
        },
        {
          role: "user",
          content: [
            `Research query: ${trimmedQuery}`,
            buildPromptContext(context),
            `Candidate papers:\n${JSON.stringify(limitedCandidates, null, 2)}`,
          ].join("\n\n"),
        },
      ],
    });

    const payload = flattenContent(completion.choices[0]?.message?.content);
    const parsed = deepResearchSchema.parse(JSON.parse(payload));
    const papers = mapModelRankingToPapers(parsed.rankedPapers, limitedCandidates, trimmedQuery);

    return {
      query: trimmedQuery,
      refinedQuery: parsed.refinedQuery,
      model: getDeepResearchModel(),
      totalCandidatePapers: candidatePapers.length,
      searchQueries: Array.from(new Set([trimmedQuery, parsed.refinedQuery])),
      searchSummary: parsed.searchSummary,
      tldr: parsed.tldr,
      sections: parsed.sections,
      papers,
      relatedQuestions: parsed.relatedQuestions,
    } satisfies DeepResearchResult;
  } catch {
    return buildFallbackDeepResearch(trimmedQuery, limitedCandidates, context);
  }
}
