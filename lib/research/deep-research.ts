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
  DeepResearchComparisonRow,
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
    .max(5),
  mechanismsSection: z.object({
    title: z.string(),
    body: z.string(),
    supportingPaperIds: z.array(z.string()),
  }),
  comparisonRows: z
    .array(
      z.object({
        context: z.string(),
        observations: z.string(),
        primarySourceIds: z.array(z.string()),
        dominantMechanisms: z.string(),
      }),
    )
    .min(2)
    .max(6),
  synthesisSection: z.object({
    title: z.string(),
    body: z.string(),
    supportingPaperIds: z.array(z.string()),
  }),
  practicalImplicationsSection: z.object({
    title: z.string(),
    body: z.string(),
    supportingPaperIds: z.array(z.string()),
  }),
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
      title: "Scope of the available literature",
      body: `${summaryLead} The strongest matching external paper is "${topPaper?.title ?? "the top-ranked paper"}", which should be reviewed first because it anchors the query most directly in the available evidence base.`,
      supportingPaperIds: topPaper ? [topPaper.id] : [],
    },
    {
      title: "Key evidence clusters",
      body: `The ranked set suggests that "${topPaper?.title ?? "the first paper"}" and "${secondPaper?.title ?? "the second paper"}" are the best starting points because their titles, abstracts, and venues align most closely with the query and provide the clearest foundation for synthesis.`,
      supportingPaperIds: [topPaper?.id, secondPaper?.id].filter(Boolean) as string[],
    },
    {
      title: "Research gaps and unresolved questions",
      body: `Compare the methods, populations, and limits reported across "${secondPaper?.title ?? "the second paper"}" and "${thirdPaper?.title ?? "the third paper"}" to identify what still looks under-explained, inconsistent, or geographically narrow in the current evidence base.`,
      supportingPaperIds: [secondPaper?.id, thirdPaper?.id].filter(Boolean) as string[],
    },
  ];
}

function buildFallbackMechanismsSection(
  rankedPapers: DeepResearchPaper[],
): DeepResearchSection {
  const topPaper = rankedPapers[0];
  const secondPaper = rankedPapers[1] ?? rankedPapers[0];

  return {
    title: "Mechanisms and process drivers",
    body: topPaper && secondPaper
      ? `Across the highest-ranked papers, the dominant processes appear to be defined by the interaction between system conditions, source inputs, and transport or transformation pathways. In practical terms, "${topPaper.title}" and "${secondPaper.title}" should be read closely to isolate which causal drivers are consistently reported and which remain context-dependent. If a mechanism is not explicitly described in the candidate papers, it should be treated as insufficiently evidenced rather than inferred.`
      : "Insufficient evidence to describe the dominant mechanisms with confidence from the current candidate papers.",
    supportingPaperIds: [topPaper?.id, secondPaper?.id].filter(Boolean) as string[],
  };
}

function buildFallbackComparisonRows(
  rankedPapers: DeepResearchPaper[],
): DeepResearchComparisonRow[] {
  if (rankedPapers.length === 0) {
    return [
      {
        context: "Direct evidence",
        observations: "Insufficient evidence to summarize observations from the current search set.",
        primarySourceIds: [],
        dominantMechanisms: "Insufficient evidence to identify dominant mechanisms.",
      },
      {
        context: "Comparative context",
        observations: "Insufficient evidence to compare contexts or settings from the current search set.",
        primarySourceIds: [],
        dominantMechanisms: "Insufficient evidence to identify dominant mechanisms.",
      },
    ];
  }

  return rankedPapers.slice(0, 3).map((paper, index) => ({
    context:
      index === 0
        ? "Highest-fit literature"
        : index === 1
          ? "Secondary supporting literature"
          : "Broader contextual literature",
    observations:
      paper.abstract
        ? trimToSentenceCount(paper.abstract, 2)
        : "Insufficient evidence to summarize observations from the returned metadata alone.",
    primarySourceIds: [paper.id],
    dominantMechanisms:
      "Use the full paper to verify which drivers are explicitly reported; metadata alone is not enough to confirm a mechanism in detail.",
  }));
}

function buildFallbackSynthesisSection(
  rankedPapers: DeepResearchPaper[],
): DeepResearchSection {
  const topPaper = rankedPapers[0];
  const thirdPaper = rankedPapers[2] ?? rankedPapers[1] ?? rankedPapers[0];

  return {
    title: "Synthesis and key contrasts",
    body: topPaper && thirdPaper
      ? `The main contrast in the current evidence base is between papers that directly address the query and papers that only contribute partial contextual support. This means "${topPaper.title}" is likely to be central for the core argument, while "${thirdPaper.title}" may be more useful for comparison, boundary conditions, or identifying uncertainty that still matters in real-world application.`
      : "Insufficient evidence to synthesize key contrasts across the current ranked papers.",
    supportingPaperIds: [topPaper?.id, thirdPaper?.id].filter(Boolean) as string[],
  };
}

function buildFallbackPracticalImplicationsSection(
  rankedPapers: DeepResearchPaper[],
): DeepResearchSection {
  const topPaper = rankedPapers[0];

  return {
    title: "Practical implications",
    body: topPaper
      ? `A practical next step is to validate the monitoring, intervention, or application strategies described in "${topPaper.title}" against the narrower details of the target context. Decision-making should prioritize directly measured evidence, explicitly reported mechanisms, and any limitations that affect transferability into operational settings.`
      : "Insufficient evidence to derive practical implications from the current ranked papers.",
    supportingPaperIds: topPaper ? [topPaper.id] : [],
  };
}

function trimToSentenceCount(value: string, maxSentences: number) {
  const sentences = value
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.slice(0, maxSentences).join(" ");
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
    mechanismsSection: buildFallbackMechanismsSection(rankedPapers),
    comparisonRows: buildFallbackComparisonRows(rankedPapers),
    synthesisSection: buildFallbackSynthesisSection(rankedPapers),
    practicalImplicationsSection: buildFallbackPracticalImplicationsSection(rankedPapers),
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
            "You are ResearchForge Deep Research. Use only the supplied candidate papers and uploaded-document context. Do not invent papers, authors, results, citations, mechanisms, datasets, or quantitative claims. Write in a formal scientific tone suitable for a technical briefing or literature review. The output must be dense, evidence-based, highly structured, and free of speculation. If evidence is uncertain, inconsistent, or absent, explicitly say 'Insufficient evidence...' instead of guessing. Return valid JSON with keys refinedQuery, searchSummary, tldr, sections, mechanismsSection, comparisonRows, synthesisSection, practicalImplicationsSection, rankedPapers, relatedQuestions. The 'tldr' must be 2-3 sentences. The 'sections' array should contain 2-5 thematic sections with descriptive academic headings. 'mechanismsSection' must explain underlying scientific or technical drivers in detail. 'comparisonRows' must support a comparative analysis table with columns for context, observations, primary sources, and dominant mechanisms. 'synthesisSection' must highlight contrasts, implications, and real-world significance. 'practicalImplicationsSection' must contain actionable monitoring, recovery, application, or decision-use insights. Every section body must stay grounded in the provided papers only.",
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
      mechanismsSection: parsed.mechanismsSection,
      comparisonRows: parsed.comparisonRows,
      synthesisSection: parsed.synthesisSection,
      practicalImplicationsSection: parsed.practicalImplicationsSection,
      papers,
      relatedQuestions: parsed.relatedQuestions,
    } satisfies DeepResearchResult;
  } catch {
    return buildFallbackDeepResearch(trimmedQuery, limitedCandidates, context);
  }
}
