"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import type { RefObject } from "react";
import {
  runDeepResearchAction,
  saveNoteAction,
  sendChatMessageAction,
} from "@/app/actions/documents";
import type {
  ChatMessageRecord,
  DeepResearchComparisonRow,
  DeepResearchResult,
  DocumentPageRecord,
  DocumentWorkspace,
} from "@/lib/db/types";

type DocumentWorkspaceProps = {
  workspace: DocumentWorkspace;
  initialPrompt?: string;
  initialTab?: "chat" | "summary" | "notes";
  initialMode?: ComposerTool;
  autoRunInitialPrompt?: boolean;
};

type WorkspaceFileId = "insights" | "dashboard" | "evidence";
type ComposerTool = "deep-research" | "chat-with-pdf" | "notes";
type SidebarPanel = "sources" | "chat" | "files";
type PendingRequest = {
  tool: ComposerTool;
  prompt: string;
};

const composerTools: Array<{
  id: ComposerTool;
  label: string;
  helper: string;
  placeholder: string;
}> = [
  {
    id: "deep-research",
    label: "Deep Research",
    helper: "Find related papers and broader citation support from this document.",
    placeholder: "Ask Deep Research to map related papers, gaps, and patterns...",
  },
  {
    id: "chat-with-pdf",
    label: "Ask Questions",
    helper: "Ask a direct question and get a simple, page-backed answer.",
    placeholder: "Ask a question about this research...",
  },
  {
    id: "notes",
    label: "Notes",
    helper: "Save a takeaway, reminder, or writing note from this paper.",
    placeholder: "Write a note to save from this paper...",
  },
];

const quickActions = [
  "Explain the paper in simpler terms",
  "List the strongest findings with citations",
  "Show the main limitations I should mention",
] as const;

type DeepResearchThinkingStage = {
  id: string;
  label: string;
  description: string;
  output: string;
};

const deepResearchThinkingStages: DeepResearchThinkingStage[] = [
  {
    id: "scope",
    label: "Clarifying the research scope",
    description:
      "Parsing the question, constraints, and evidence standard before searching.",
    output: "Working research brief",
  },
  {
    id: "search",
    label: "Searching the literature",
    description:
      "Looking across related papers, source links, and citation paths to build a candidate set.",
    output: "Candidate paper pool",
  },
  {
    id: "screen",
    label: "Screening and ranking evidence",
    description:
      "Comparing scope, methods, context, and citation usefulness to keep the strongest papers.",
    output: "Ranked evidence table",
  },
  {
    id: "extract",
    label: "Extracting mechanisms and contrasts",
    description:
      "Pulling out the underlying drivers, patterns, and context-specific differences across sources.",
    output: "Mechanisms and comparison notes",
  },
  {
    id: "synthesis",
    label: "Writing the research briefing",
    description:
      "Drafting the cited summary, references, and downloadable outputs for the final answer.",
    output: "Structured report and downloads",
  },
];

const deepResearchStageDurationsMs = [1100, 1300, 1450, 1600] as const;

function useStagedThinkingProgress(enabled: boolean, stageCount: number) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    if (!enabled || stageCount <= 1) {
      return;
    }

    const timers: number[] = [];
    let elapsedMs = 0;

    for (let index = 1; index < stageCount; index += 1) {
      elapsedMs +=
        deepResearchStageDurationsMs[index - 1] ??
        deepResearchStageDurationsMs[deepResearchStageDurationsMs.length - 1] ??
        1400;

      const timer = window.setTimeout(() => {
        setActiveStageIndex(index);
      }, elapsedMs);

      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [enabled, stageCount]);

  return activeStageIndex;
}

function stageStatusForIndex(index: number, activeStageIndex: number) {
  if (index < activeStageIndex) {
    return "complete" as const;
  }

  if (index === activeStageIndex) {
    return "active" as const;
  }

  return "queued" as const;
}

function DeepResearchStageTimeline({
  activeStageIndex,
  compact = false,
}: {
  activeStageIndex: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-2.5" : "space-y-3"}>
      {deepResearchThinkingStages.map((stage, index) => {
        const status = stageStatusForIndex(index, activeStageIndex);

        return (
          <div
            key={stage.id}
            className={`rounded-[1.1rem] border px-4 py-3 transition-colors ${
              status === "active"
                ? "border-[#cddafb] bg-[#f5f8ff]"
                : status === "complete"
                  ? "border-[#dbe5f3] bg-white"
                  : "border-[#e8ecf2] bg-[#fbfcfe]"
            } ${compact ? "" : "shadow-[0_8px_24px_rgba(16,21,34,0.04)]"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  status === "active"
                    ? "bg-[#2963ff] text-white"
                    : status === "complete"
                      ? "bg-[#e9f7ef] text-[#1e8a4c]"
                      : "bg-[#edf1f6] text-[#7a8596]"
                }`}
              >
                {status === "complete" ? "OK" : index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-[#111727]">
                    {stage.label}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${
                      status === "active"
                        ? "bg-[#e5eeff] text-[#2963ff]"
                        : status === "complete"
                          ? "bg-[#eaf7ef] text-[#1e8a4c]"
                          : "bg-[#eef2f6] text-[#7b8696]"
                    }`}
                  >
                    {status === "active"
                      ? "Running"
                      : status === "complete"
                        ? "Done"
                        : "Queued"}
                  </span>
                </div>

                <p
                  className={`mt-1.5 leading-6 ${
                    compact ? "text-[0.82rem]" : "text-[0.9rem]"
                  } text-[#556173]`}
                >
                  {stage.description}
                </p>

                {!compact ? (
                  <div className="mt-2 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-[#7f8896]">
                    Output: {stage.output}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 42);
}

function trimText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function splitIntoSentences(value: string) {
  return value
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function inferPageHeading(page: DocumentPageRecord) {
  const sentences = splitIntoSentences(page.textContent);
  const firstSentence = sentences[0] ?? `Evidence from page ${page.pageNumber}`;

  return trimText(firstSentence.replace(/\.$/, ""), 72);
}

function formatPagesLabel(citations: number[]) {
  if (citations.length === 0) {
    return "No supporting pages";
  }

  return `Pages ${citations.join(", ")}`;
}

function renderFileLabel(title: string, suffix: string) {
  return `${slugify(title) || "researchforge_output"}_${suffix}`;
}

function activeFileLabelForDownload(
  title: string,
  selectedFile: WorkspaceFileId,
  hasDeepResearchResult: boolean,
) {
  if (hasDeepResearchResult) {
    if (selectedFile === "insights") {
      return renderFileLabel(title, "deep_research_report.md");
    }

    if (selectedFile === "dashboard") {
      return renderFileLabel(title, "paper_discovery_dashboard.html");
    }

    return renderFileLabel(title, "ranked_papers.md");
  }

  return selectedFile === "insights"
    ? renderFileLabel(title, "insights.md")
    : renderFileLabel(title, "evidence.md");
}

function buildInsightsMarkdown(workspace: DocumentWorkspace) {
  const { document, pages } = workspace;
  const findings = document.summary.keyFindings.length
    ? document.summary.keyFindings
    : ["Key findings were not generated yet for this document."];

  const definitions = document.summary.importantDefinitions.length
    ? document.summary.importantDefinitions
    : [{ term: "Definition pending", meaning: "Run summary generation to fill this section." }];

  return [
    `# ${document.title}`,
    "",
    "## TL;DR",
    document.summary.simpleSummary,
    "",
    "## Key findings",
    ...findings.map((finding, index) => `- ${finding} [Page ${pages[index % pages.length]?.pageNumber ?? 1}]`),
    "",
    "## Methodology",
    document.summary.methodology,
    "",
    "## Limitations",
    document.summary.limitations,
    "",
    "## Definitions",
    ...definitions.map((definition) => `- ${definition.term}: ${definition.meaning}`),
    "",
    "## Possible questions",
    ...document.summary.possibleExamQuestions.map((question) => `- ${question}`),
  ].join("\n");
}

function buildEvidenceMarkdown(workspace: DocumentWorkspace) {
  return [
    `# ${workspace.document.title} Evidence Matrix`,
    "",
    ...workspace.pages.map((page) =>
      [
        `## Page ${page.pageNumber}`,
        inferPageHeading(page),
        "",
        trimText(page.textContent, 360),
      ].join("\n"),
    ),
  ].join("\n\n");
}

function buildDeepResearchReportMarkdown(result: DeepResearchResult) {
  const referenceLines = result.papers.map((paper, index) => {
    const authors = paper.authors.length ? paper.authors.join(", ") : "Unknown authors";
    const doi = paper.doi ? ` DOI: ${paper.doi}.` : "";
    return `${index + 1}. ${authors} (${paper.year}). ${paper.title}. ${paper.venue}.${doi} ${paper.url}`;
  });

  return [
    `# Deep Research Report`,
    "",
    `Original query: ${result.query}`,
    `Refined query: ${result.refinedQuery}`,
    `Model: ${result.model}`,
    "",
    "## TL;DR",
    result.tldr,
    "",
    "## Search summary",
    result.searchSummary,
    "",
    "## Thematic analysis",
    ...result.sections.flatMap((section) => [
      `### ${section.title}`,
      section.body,
      section.supportingPaperIds.length
        ? `Supporting papers: ${section.supportingPaperIds.join(", ")}`
        : "Supporting papers: none tagged",
      "",
    ]),
    "## Mechanisms and process drivers",
    result.mechanismsSection.body,
    "",
    "## Comparative analysis",
    "| Context / Setting | Typical Levels / Observations | Primary Sources | Dominant Mechanisms |",
    "| --- | --- | --- | --- |",
    ...result.comparisonRows.map((row) => {
      const sourceLabels = row.primarySourceIds
        .map((paperId) => {
          const paperIndex = result.papers.findIndex((paper) => paper.id === paperId);
          return paperIndex === -1 ? null : String(paperIndex + 1);
        })
        .filter(Boolean)
        .join(", ");

      return `| ${row.context} | ${row.observations} | ${sourceLabels || "Insufficient evidence"} | ${row.dominantMechanisms} |`;
    }),
    "",
    `## ${result.synthesisSection.title}`,
    result.synthesisSection.body,
    "",
    `## ${result.practicalImplicationsSection.title}`,
    result.practicalImplicationsSection.body,
    "",
    "## References",
    ...referenceLines,
    "",
    "## Related questions",
    ...result.relatedQuestions.map((question) => `- ${question}`),
  ].join("\n");
}

function buildDeepResearchPapersMarkdown(result: DeepResearchResult) {
  return [
    "# Ranked Papers",
    "",
    ...result.papers.map((paper, index) =>
      [
        `## ${index + 1}. ${paper.title}`,
        `Authors: ${paper.authors.join(", ") || "Unknown authors"}`,
        `Source: ${paper.sourceLabel}`,
        `Relevance: ${paper.relevanceScore}/100 (${paper.relevanceTag})`,
        `Reasoning: ${paper.reasoning}`,
        `Abstract: ${paper.abstract}`,
        `URL: ${paper.url}`,
      ].join("\n"),
    ),
  ].join("\n\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRelevanceTone(score: number) {
  if (score >= 80) {
    return {
      bg: "#e9f2ff",
      fg: "#2158d4",
    };
  }

  if (score >= 60) {
    return {
      bg: "#eef6ef",
      fg: "#26734d",
    };
  }

  return {
    bg: "#fff2e8",
    fg: "#b86427",
  };
}

function buildDeepResearchDashboardHtml(result: DeepResearchResult) {
  const rows = result.papers
    .map((paper, index) => {
      const tone = renderRelevanceTone(paper.relevanceScore);
      const abstractPreview = paper.abstract
        ? `${escapeHtml(trimText(paper.abstract, 260))}${paper.abstract.length > 260 ? ' <span class="more">More</span>' : ""}`
        : "N/A";

      return `
        <tr>
          <td class="checkbox-cell"><input type="checkbox" aria-label="Select paper ${index + 1}" /></td>
          <td class="paper-cell">
            <a class="paper-link" href="${escapeHtml(paper.url)}" target="_blank" rel="noopener noreferrer">${index + 1}. ${escapeHtml(paper.title)}</a>
            <div class="paper-meta">${escapeHtml(paper.sourceLabel)}</div>
            <div class="paper-meta">${escapeHtml(paper.authors.join(", ") || "Unknown authors")}</div>
          </td>
          <td class="cite-cell">${paper.citationCount ?? 0} Cite</td>
          <td class="actions-cell">
            <a class="action-link" href="${escapeHtml(paper.url)}" target="_blank" rel="noopener noreferrer">Get PDF</a>
            <button type="button" aria-label="Bookmark paper">☆</button>
            <button type="button" aria-label="More options">⋯</button>
          </td>
          <td class="relevance-cell">
            <div class="score-row">
              <span class="score">${paper.relevanceScore}/100</span>
              <span class="tag" style="background:${tone.bg};color:${tone.fg};">${escapeHtml(paper.relevanceTag)}</span>
            </div>
            <div class="reasoning-label">Reasoning</div>
            <p class="reasoning-text">${escapeHtml(paper.reasoning)}</p>
          </td>
          <td class="abstract-cell">${abstractPreview}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(result.refinedQuery)} - Research Dashboard</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --panel: #ffffff;
        --line: #e2e7f0;
        --text: #101522;
        --muted: #667084;
        --link: #2158d4;
        --soft: #f8fbff;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%);
        color: var(--text);
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .page {
        width: min(1480px, calc(100vw - 48px));
        margin: 24px auto;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(16, 21, 34, 0.07);
      }
      .topbar {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding: 20px 24px;
        border-bottom: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.94);
      }
      .eyebrow {
        margin: 0;
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #7d8798;
        font-weight: 700;
      }
      h1 {
        margin: 8px 0 0;
        font-size: 30px;
        line-height: 1.15;
      }
      .subtext {
        margin: 10px 0 0;
        max-width: 780px;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.7;
      }
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
      .toolbar-pill {
        border: 1px solid var(--line);
        background: #fff;
        border-radius: 999px;
        padding: 10px 14px;
        font-size: 13px;
        color: #465266;
      }
      .content {
        padding: 20px 24px 26px;
      }
      .summary {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 16px;
        margin-bottom: 18px;
      }
      .summary-card {
        border: 1px solid var(--line);
        background: var(--soft);
        border-radius: 18px;
        padding: 16px;
      }
      .summary-label {
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #7d8798;
        font-weight: 700;
      }
      .summary-card p {
        margin: 10px 0 0;
        font-size: 14px;
        line-height: 1.75;
        color: #445066;
      }
      .table-shell {
        border: 1px solid var(--line);
        border-radius: 20px;
        overflow: hidden;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      thead th {
        background: #f7f9fc;
        border-bottom: 1px solid var(--line);
        padding: 14px 12px;
        text-align: left;
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #667084;
      }
      tbody td {
        border-bottom: 1px solid var(--line);
        padding: 16px 12px;
        vertical-align: top;
        font-size: 14px;
        line-height: 1.6;
      }
      tbody tr:last-child td {
        border-bottom: 0;
      }
      .checkbox-cell { width: 44px; }
      .paper-cell { width: 28%; }
      .cite-cell { width: 110px; white-space: nowrap; color: #1d2736; font-weight: 600; }
      .actions-cell { width: 150px; }
      .relevance-cell { width: 28%; }
      .abstract-cell { width: 22%; color: #4c586a; }
      .paper-link {
        color: var(--link);
        font-size: 20px;
        line-height: 1.35;
        font-weight: 700;
        text-decoration: none;
      }
      .paper-meta {
        margin-top: 6px;
        color: var(--muted);
        font-size: 13px;
      }
      .actions-cell {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .actions-cell button,
      .action-link {
        border: 0;
        background: transparent;
        padding: 0;
        color: #1a2433;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
      }
      .score-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .score {
        font-size: 18px;
        font-weight: 700;
        color: #111727;
      }
      .tag {
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 700;
      }
      .reasoning-label {
        margin-top: 10px;
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #7d8798;
        font-weight: 700;
      }
      .reasoning-text {
        margin: 6px 0 0;
        color: #485468;
      }
      .more {
        color: var(--link);
        font-weight: 600;
      }
      @media (max-width: 1200px) {
        .summary {
          grid-template-columns: 1fr;
        }
        .table-shell {
          overflow-x: auto;
        }
        table {
          min-width: 1180px;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="topbar">
        <div>
          <p class="eyebrow">Research paper discovery dashboard</p>
          <h1>${escapeHtml(result.refinedQuery || result.query)}</h1>
          <p class="subtext">${escapeHtml(result.searchSummary)}</p>
        </div>
        <div class="toolbar">
          <div class="toolbar-pill">Papers (${result.totalCandidatePapers})</div>
          <div class="toolbar-pill">Sorted by relevance</div>
          <div class="toolbar-pill">Model: ${escapeHtml(result.model)}</div>
        </div>
      </div>

      <div class="content">
        <div class="summary">
          <div class="summary-card">
            <div class="summary-label">TL;DR</div>
            <p>${escapeHtml(result.tldr)}</p>
          </div>
          <div class="summary-card">
            <div class="summary-label">Synthesis cue</div>
            <p>${escapeHtml(result.synthesisSection.body)}</p>
          </div>
        </div>

        <div class="table-shell">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Paper Title</th>
                <th>Citations</th>
                <th>Actions</th>
                <th>Relevance Panel</th>
                <th>Abstract Preview</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function triggerTextDownload({
  filename,
  content,
  mimeType = "text/markdown;charset=utf-8",
}: {
  filename: string;
  content: string;
  mimeType?: string;
}) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ReferenceBadge({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center rounded-full border border-[#d9dee7] bg-white px-2 py-0.5 text-[11px] font-medium text-[#6d7584] transition-colors hover:border-[#b7c6dd] hover:bg-[#f7f9fd]"
      >
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-[#d9dee7] bg-white px-2 py-0.5 text-[11px] font-medium text-[#6d7584]">
      {label}
    </span>
  );
}

function CitationBadge({
  pageNumber,
  onClick,
}: {
  pageNumber: number;
  onClick?: () => void;
}) {
  return <ReferenceBadge label={String(pageNumber)} onClick={onClick} />;
}

function getPaperReferenceNumber(
  result: DeepResearchResult,
  paperId: string,
) {
  const paperIndex = result.papers.findIndex((paper) => paper.id === paperId);
  return paperIndex === -1 ? null : paperIndex + 1;
}

function InlinePaperCitations({
  result,
  paperIds,
  onSelectPaper,
}: {
  result: DeepResearchResult;
  paperIds: string[];
  onSelectPaper: (paperId: string) => void;
}) {
  const uniquePaperIds = Array.from(new Set(paperIds));

  if (uniquePaperIds.length === 0) {
    return null;
  }

  return (
    <span className="ml-2 inline-flex flex-wrap gap-1 align-super">
      {uniquePaperIds.map((paperId) => {
        const referenceNumber = getPaperReferenceNumber(result, paperId);

        if (!referenceNumber) {
          return null;
        }

        return (
          <button
            key={paperId}
            type="button"
            onClick={() => onSelectPaper(paperId)}
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#d8dee8] bg-[#f8fbff] px-1.5 text-[10px] font-semibold text-[#5b6474] transition-colors hover:bg-white"
          >
            {referenceNumber}
          </button>
        );
      })}
    </span>
  );
}

function getCitedPages(
  pages: DocumentPageRecord[],
  citations: number[],
) {
  const seen = new Set<number>();

  return citations
    .filter((pageNumber) => {
      if (seen.has(pageNumber)) {
        return false;
      }

      seen.add(pageNumber);
      return true;
    })
    .map((pageNumber) => pages.find((page) => page.pageNumber === pageNumber))
    .filter(Boolean) as DocumentPageRecord[];
}

function PageSourceList({
  pages,
  citations,
  onSelectPage,
}: {
  pages: DocumentPageRecord[];
  citations: number[];
  onSelectPage: (pageNumber: number) => void;
}) {
  const citedPages = getCitedPages(pages, citations);

  if (citedPages.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
        Sources
      </div>
      {citedPages.map((page) => (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelectPage(page.pageNumber)}
          className="block w-full rounded-[1rem] border border-[#dfe5ee] bg-[#fbfcfe] px-4 py-3 text-left transition-colors hover:bg-white"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#111727]">
              Page {page.pageNumber}
            </span>
            <ReferenceBadge label="Open source" />
          </div>
          <div className="mt-2 text-sm font-medium text-[#243042]">
            {inferPageHeading(page)}
          </div>
          <p className="mt-2 text-sm leading-7 text-[#556277]">
            {trimText(page.textContent, 220)}
          </p>
        </button>
      ))}
    </div>
  );
}

function PaperSourceList({
  result,
  paperIds,
  onSelectPaper,
}: {
  result: DeepResearchResult;
  paperIds: string[];
  onSelectPaper: (paperId: string) => void;
}) {
  const uniquePaperIds = Array.from(new Set(paperIds));
  const citedPapers = uniquePaperIds
    .map((paperId) => result.papers.find((paper) => paper.id === paperId))
    .filter((paper): paper is DeepResearchResult["papers"][number] => Boolean(paper));

  if (citedPapers.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
        Sources
      </div>
      {citedPapers.map((paper) => (
        <div
          key={paper.id}
          className="rounded-[1rem] border border-[#dfe5ee] bg-[#fbfcfe] px-4 py-3"
        >
          <button
            type="button"
            onClick={() => onSelectPaper(paper.id)}
            className="text-left"
          >
            <div className="text-sm font-semibold text-[#2158d4]">{paper.title}</div>
          </button>
          <div className="mt-1 text-sm text-[#556277]">
            {paper.authors.join(", ") || "Unknown authors"}
          </div>
          <div className="mt-1 text-sm text-[#556277]">{paper.sourceLabel}</div>
          <p className="mt-2 text-sm leading-7 text-[#4a5565]">{paper.reasoning}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ReferenceBadge label={`${paper.relevanceScore}/100`} />
            <ReferenceBadge label={paper.relevanceTag} />
            {paper.url ? (
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-[#d9dee7] bg-white px-2 py-0.5 text-[11px] font-medium text-[#2158d4] transition-colors hover:bg-[#f7f9fd]"
              >
                Open source
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function EvidenceReferenceList({
  pages,
  onSelectPage,
  activePage,
}: {
  pages: DocumentPageRecord[];
  onSelectPage: (pageNumber: number) => void;
  activePage: number | null;
}) {
  return (
    <div className="space-y-5">
      {pages.map((page, index) => (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelectPage(page.pageNumber)}
          className={`w-full rounded-[1.2rem] px-4 py-3 text-left transition-colors ${
            activePage === page.pageNumber
              ? "bg-[#f5f8fe]"
              : "hover:bg-[#f8f9fc]"
          }`}
        >
          <div className="text-sm leading-7 text-[#263142]">
            <span className="font-semibold text-[#1a2332]">[{index + 1}]</span>{" "}
            {trimText(page.textContent, 210)}
          </div>
        </button>
      ))}
    </div>
  );
}

function DeepResearchSourcesList({
  result,
  focusedPaperId,
  onSelectPaper,
}: {
  result: DeepResearchResult;
  focusedPaperId: string | null;
  onSelectPaper: (paperId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {result.papers.slice(0, 8).map((paper, index) => (
        <button
          key={paper.id}
          type="button"
          onClick={() => onSelectPaper(paper.id)}
          className={`w-full rounded-[1.2rem] px-4 py-3 text-left transition-colors ${
            focusedPaperId === paper.id ? "bg-[#f5f8fe]" : "hover:bg-[#f8f9fc]"
          }`}
        >
          <div className="text-sm font-semibold leading-7 text-[#1a2332]">
            [{index + 1}] {paper.title}
          </div>
          <div className="mt-1 text-sm leading-6 text-[#586374]">
            {paper.reasoning}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ReferenceBadge label={`${paper.relevanceScore}/100`} />
            <ReferenceBadge label={paper.relevanceTag} />
          </div>
        </button>
      ))}
    </div>
  );
}

function ConversationList({
  messages,
  pages,
  onSelectPage,
  pendingRequest,
}: {
  messages: ChatMessageRecord[];
  pages: DocumentPageRecord[];
  onSelectPage: (pageNumber: number) => void;
  pendingRequest: PendingRequest | null;
}) {
  if (messages.length === 0 && !pendingRequest) {
    return (
      <div className="rounded-[1.2rem] border border-dashed border-[#d8dee7] bg-[#fbfcfe] px-4 py-4 text-sm leading-7 text-[#637084]">
        Ask a grounded question about this paper and ResearchForge will answer
        from retrieved pages only.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] rounded-[1.25rem] px-4 py-3 text-sm leading-7 ${
                isUser
                  ? "bg-[#f2f3f6] text-[#111727]"
                  : "border border-[#dde2eb] bg-white text-[#243042]"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {!isUser && message.citations.length > 0 ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.citations.map((citation) => (
                      <CitationBadge
                        key={`${message.id}-${citation}`}
                        pageNumber={citation}
                        onClick={() => onSelectPage(citation)}
                      />
                    ))}
                  </div>
                  <PageSourceList
                    pages={pages}
                    citations={message.citations}
                    onSelectPage={onSelectPage}
                  />
                </>
              ) : null}
            </div>
          </div>
        );
      })}

      {pendingRequest ? (
        <>
          <div className="flex justify-end">
            <div className="max-w-[92%] rounded-[1.25rem] bg-[#f2f3f6] px-4 py-3 text-sm leading-7 text-[#111727]">
              <div className="whitespace-pre-wrap">{pendingRequest.prompt}</div>
            </div>
          </div>

          <div className="flex justify-start">
            <div
              role="status"
              aria-live="polite"
              className="max-w-[92%] rounded-[1.25rem] border border-[#dde2eb] bg-white px-4 py-3 text-sm leading-7 text-[#243042]"
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#9aa4b2]" />
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#9aa4b2] [animation-delay:120ms]" />
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#9aa4b2] [animation-delay:240ms]" />
                </div>
                <span className="font-medium text-[#111727]">
                  {pendingRequest.tool === "deep-research"
                    ? "Thinking through your research question..."
                    : "Thinking through the paper..."}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-[#5a6576]">
                {pendingRequest.tool === "deep-research" ? (
                  <DeepResearchPendingTimeline />
                ) : (
                  <>
                    <p>Finding the most relevant pages</p>
                    <p>Checking the source evidence</p>
                    <p>Preparing a simple cited answer</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function DeepResearchPendingTimeline() {
  const activeStageIndex = useStagedThinkingProgress(
    true,
    deepResearchThinkingStages.length,
  );

  return (
    <DeepResearchStageTimeline activeStageIndex={activeStageIndex} compact />
  );
}

function DeepResearchThinkingPanel({
  prompt,
}: {
  prompt: string;
}) {
  const activeStageIndex = useStagedThinkingProgress(
    true,
    deepResearchThinkingStages.length,
  );
  const progressPercent = Math.round(
    ((activeStageIndex + 1) / deepResearchThinkingStages.length) * 100,
  );

  const activeStage =
    deepResearchThinkingStages[activeStageIndex] ??
    deepResearchThinkingStages[0];

  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <div className="rounded-[1.4rem] border border-[#e1e6ef] bg-[#fbfcfe] p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
          Deep Research
        </div>
        <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-[#111727]">
          Running a staged research workflow
        </h2>
        <p className="mt-3 text-[15px] leading-8 text-[#283342]">{prompt}</p>
        <div className="mt-5 rounded-[1.2rem] border border-[#e3e8f1] bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
                Current stage
              </div>
              <div className="mt-1 text-sm font-semibold text-[#111727]">
                {activeStage.label}
              </div>
            </div>
            <div className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2963ff]">
              {progressPercent}% complete
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[#ecf0f6]">
            <div
              className="h-full rounded-full bg-[#2963ff] transition-[width] duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-7 text-[#5a6576]">
            {activeStage.description}
          </p>
        </div>
      </div>

      <DeepResearchStageTimeline activeStageIndex={activeStageIndex} />
    </div>
  );
}

function OutputFileCard({
  label,
  description,
  isActive,
  onClick,
}: {
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[1rem] border px-3 py-3 text-left transition-colors ${
        isActive
          ? "border-[#cfd8e7] bg-[#f3f6fc]"
          : "border-transparent bg-white hover:border-[#d8dee8]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f6ff] text-sm font-semibold text-[#2963ff]">
          F
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[#172132]">{label}</div>
          <div className="truncate text-xs text-[#7b8492]">{description}</div>
        </div>
      </div>
      <span className="text-[#8e97a3]">{">"}</span>
    </button>
  );
}

function Suggestions({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className="flex w-full items-center justify-between border-b border-[#eceff4] px-2 py-3 text-left text-sm text-[#243042] transition-colors hover:bg-[#fafbfe]"
        >
          <span>{suggestion}</span>
          <span className="text-[#838c99]">{">"}</span>
        </button>
      ))}
    </div>
  );
}

function Composer({
  prompt,
  onPromptChange,
  onSubmit,
  onQuickAction,
  isSending,
  selectedTool,
  onToolChange,
  onVoiceClick,
  helperMessage,
  inputRef,
  placeholder,
}: {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onQuickAction: (value: string) => void;
  isSending: boolean;
  selectedTool: ComposerTool;
  onToolChange: (tool: ComposerTool) => void;
  onVoiceClick: () => void;
  helperMessage: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  placeholder: string;
}) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    if (!showQuickActions && !showTools) {
      return;
    }

    function closeMenus() {
      setShowQuickActions(false);
      setShowTools(false);
    }

    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, [showQuickActions, showTools]);

  return (
    <form
      className="rounded-[1.5rem] border border-[#d8dee7] bg-white p-3 shadow-[0_18px_48px_rgba(16,21,34,0.08)]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <textarea
        ref={inputRef}
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[108px] w-full resize-none rounded-[1.2rem] border-0 bg-transparent px-3 py-3 text-sm leading-7 text-[#1a2433] outline-none placeholder:text-[#9aa2ae]"
      />

      <div className="flex items-center justify-between gap-3 px-1 pt-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowQuickActions((value) => !value);
                setShowTools(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d9dee7] bg-white text-xl text-[#495467]"
            >
              +
            </button>
            {showQuickActions ? (
              <div
                className="absolute bottom-12 left-0 z-20 w-64 rounded-2xl border border-[#d8dee7] bg-white p-2 shadow-[0_18px_42px_rgba(16,21,34,0.12)]"
                onClick={(event) => event.stopPropagation()}
              >
                {quickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => {
                      onQuickAction(action);
                      setShowQuickActions(false);
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[#243042] hover:bg-[#f6f8fc]"
                  >
                    {action}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowTools((value) => !value);
                setShowQuickActions(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#111727]"
            >
              <span>Tools</span>
              <span className="text-[#8d96a2]">v</span>
            </button>
            {showTools ? (
              <div
                className="absolute bottom-12 left-0 z-20 w-72 rounded-2xl border border-[#d8dee7] bg-white p-2 shadow-[0_18px_42px_rgba(16,21,34,0.12)]"
                onClick={(event) => event.stopPropagation()}
              >
                {composerTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      onToolChange(tool.id);
                      setShowTools(false);
                    }}
                    className={`block w-full rounded-xl px-3 py-2 text-left ${
                      selectedTool === tool.id ? "bg-[#f4f7fd]" : "hover:bg-[#f6f8fc]"
                    }`}
                  >
                    <div className="text-sm font-medium text-[#1a2433]">{tool.label}</div>
                    <div className="mt-1 text-xs leading-5 text-[#7c8694]">
                      {tool.helper}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onVoiceClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#374151]"
          >
            m
          </button>
          <button
            type="submit"
            disabled={isSending}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c7c2be] text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            ^
          </button>
        </div>
      </div>

      <div className="px-2 pt-2 text-xs text-[#7c8694]">{helperMessage}</div>
    </form>
  );
}

function ReportSection({
  title,
  body,
  citations,
  pages,
  onSelectPage,
}: {
  title: string;
  body: string;
  citations: number[];
  pages: DocumentPageRecord[];
  onSelectPage: (pageNumber: number) => void;
}) {
  return (
    <section className="border-b border-[#e8ebf0] pb-7">
      <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
        {title}
      </h2>
      <p className="mt-3 text-[15px] leading-8 text-[#283342]">
        {body}
        {citations.length > 0 ? " " : null}
        {citations.map((citation) => (
          <span key={`${title}-${citation}`} className="ml-2 inline-block align-middle">
            <CitationBadge
              pageNumber={citation}
              onClick={() => onSelectPage(citation)}
            />
          </span>
        ))}
      </p>
      <PageSourceList
        pages={pages}
        citations={citations}
        onSelectPage={onSelectPage}
      />
    </section>
  );
}

function DeepResearchSectionBlock({
  result,
  section,
  onSelectPaper,
}: {
  result: DeepResearchResult;
  section: {
    title: string;
    body: string;
    supportingPaperIds: string[];
  };
  onSelectPaper: (paperId: string) => void;
}) {
  return (
    <section className="border-b border-[#e8ebf0] pb-7">
      <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
        {section.title}
      </h2>
      <p className="mt-3 text-[15px] leading-8 text-[#283342]">
        {section.body}
        <InlinePaperCitations
          result={result}
          paperIds={section.supportingPaperIds}
          onSelectPaper={onSelectPaper}
        />
      </p>
      <PaperSourceList
        result={result}
        paperIds={section.supportingPaperIds}
        onSelectPaper={onSelectPaper}
      />
    </section>
  );
}

function DeepResearchComparisonTable({
  result,
  rows,
  onSelectPaper,
}: {
  result: DeepResearchResult;
  rows: DeepResearchComparisonRow[];
  onSelectPaper: (paperId: string) => void;
}) {
  return (
    <section className="space-y-4 border-b border-[#e8ebf0] pb-7">
      <div>
        <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
          Comparative analysis
        </h2>
        <p className="mt-3 text-[15px] leading-8 text-[#283342]">
          The table below compares the main contexts and mechanisms reported across the
          ranked literature set.
        </p>
      </div>

      <div className="overflow-x-auto rounded-[1.2rem] border border-[#e3e7ee]">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#f7f8fb] text-[#111727]">
            <tr>
              <th className="border-b border-r border-[#e3e7ee] px-4 py-3 font-semibold">
                Context / Setting
              </th>
              <th className="border-b border-r border-[#e3e7ee] px-4 py-3 font-semibold">
                Typical Levels / Observations
              </th>
              <th className="border-b border-r border-[#e3e7ee] px-4 py-3 font-semibold">
                Primary Sources
              </th>
              <th className="border-b border-[#e3e7ee] px-4 py-3 font-semibold">
                Dominant Mechanisms
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.context}-${row.dominantMechanisms.slice(0, 24)}`}>
                <td className="border-b border-r border-[#e9edf3] px-4 py-4 align-top text-[#111727]">
                  {row.context}
                </td>
                <td className="border-b border-r border-[#e9edf3] px-4 py-4 align-top text-[#455066]">
                  {row.observations}
                </td>
                <td className="border-b border-r border-[#e9edf3] px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    {row.primarySourceIds.length > 0 ? (
                      row.primarySourceIds.map((paperId) => {
                        const referenceNumber = getPaperReferenceNumber(result, paperId);

                        if (!referenceNumber) {
                          return null;
                        }

                        return (
                          <ReferenceBadge
                            key={`${row.context}-${paperId}`}
                            label={String(referenceNumber)}
                            onClick={() => onSelectPaper(paperId)}
                          />
                        );
                      })
                    ) : (
                      <span className="text-sm text-[#6d7686]">Insufficient evidence</span>
                    )}
                  </div>
                </td>
                <td className="border-b border-[#e9edf3] px-4 py-4 align-top text-[#455066]">
                  {row.dominantMechanisms}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DeepResearchReferenceList({
  result,
  onSelectPaper,
}: {
  result: DeepResearchResult;
  onSelectPaper: (paperId: string) => void;
}) {
  return (
    <section className="space-y-4 border-b border-[#e8ebf0] pb-7">
      <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
        References
      </h2>
      <div className="space-y-4">
        {result.papers.map((paper, index) => (
          <div key={paper.id} className="flex gap-3 text-[15px] leading-8 text-[#283342]">
            <button
              type="button"
              onClick={() => onSelectPaper(paper.id)}
              className="mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#d8dee8] bg-[#f8fbff] px-1.5 text-[11px] font-semibold text-[#5b6474]"
            >
              {index + 1}
            </button>
            <p>
              {paper.authors.length ? paper.authors.join(", ") : "Unknown authors"} (
              {paper.year}). <span className="font-medium text-[#111727]">{paper.title}</span>.
              {" "}{paper.venue}.
              {paper.doi ? ` DOI: ${paper.doi}.` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DeepResearchPapersTable({
  result,
  focusedPaperId,
  onSelectPaper,
}: {
  result: DeepResearchResult;
  focusedPaperId: string | null;
  onSelectPaper: (paperId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
          Ranked literature set
        </h2>
        <p className="mt-3 text-[15px] leading-8 text-[#283342]">
          ResearchForge searched external literature, ranked the papers for fit, and
          summarized why each paper matters before you start writing.
        </p>
      </div>

      <div className="overflow-x-auto rounded-[1.2rem] border border-[#e3e7ee]">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#f7f8fb] text-[#111727]">
            <tr>
              <th className="border-b border-r border-[#e3e7ee] px-4 py-3 font-semibold">
                Papers ({result.totalCandidatePapers})
              </th>
              <th className="border-b border-r border-[#e3e7ee] px-4 py-3 font-semibold">
                Relevance
              </th>
              <th className="border-b border-[#e3e7ee] px-4 py-3 font-semibold">
                Abstract
              </th>
            </tr>
          </thead>
          <tbody>
            {result.papers.map((paper, index) => (
              <tr
                key={paper.id}
                className={focusedPaperId === paper.id ? "bg-[#f6f8fc]" : "bg-white"}
              >
                <td className="border-b border-r border-[#e9edf3] px-4 py-4 align-top">
                  <button
                    type="button"
                    onClick={() => onSelectPaper(paper.id)}
                    className="text-left"
                  >
                    <div className="text-sm font-semibold text-[#2158d4]">
                      {index + 1}. {paper.title}
                    </div>
                    <div className="mt-2 text-sm text-[#5f6978]">{paper.sourceLabel}</div>
                    <div className="mt-2 text-sm text-[#5f6978]">
                      {paper.authors.join(", ") || "Unknown authors"}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#586374]">
                      <span>{paper.citationCount ?? 0} citations</span>
                      {paper.doi ? <span>DOI</span> : null}
                    </div>
                  </button>
                </td>
                <td className="border-b border-r border-[#e9edf3] px-4 py-4 align-top text-[#243042]">
                  <div className="space-y-2">
                    <div className="font-semibold text-[#111727]">
                      Relevance Score: {paper.relevanceScore}/100
                    </div>
                    <div>{paper.relevanceTag}</div>
                    <div className="leading-7 text-[#4a5565]">{paper.reasoning}</div>
                  </div>
                </td>
                <td className="border-b border-[#e9edf3] px-4 py-4 align-top text-[#4a5565]">
                  {paper.abstract || "No abstract was returned for this paper."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeepResearchDashboardPreview({ result }: { result: DeepResearchResult }) {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-[#dce4f2] bg-white shadow-[0_18px_34px_rgba(16,21,34,0.04)]">
      <iframe
        title="Research paper discovery dashboard"
        srcDoc={buildDeepResearchDashboardHtml(result)}
        className="min-h-[980px] w-full border-0 bg-white"
      />
    </div>
  );
}

export function DocumentWorkspaceView({
  workspace,
  initialPrompt = "",
  initialTab = "chat",
  initialMode = "deep-research",
  autoRunInitialPrompt = false,
}: DocumentWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<WorkspaceFileId>(
    initialTab === "notes" ? "evidence" : "insights",
  );
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>(
    initialTab === "notes" ? "files" : initialTab === "chat" ? "chat" : "sources",
  );
  const [messages, setMessages] = useState(workspace.messages);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState<ComposerTool>(initialMode);
  const [deepResearchResult, setDeepResearchResult] = useState<DeepResearchResult | null>(
    null,
  );
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [supportingQuotes, setSupportingQuotes] = useState<string[]>([]);
  const [focusedPageNumber, setFocusedPageNumber] = useState<number | null>(
    workspace.pages[0]?.pageNumber ?? null,
  );
  const [focusedPaperId, setFocusedPaperId] = useState<string | null>(null);
  const [helperMessage, setHelperMessage] = useState(
    initialMode === "deep-research"
      ? "Deep Research ranks external papers and turns them into a clearer report."
      : "Answers stay grounded in retrieved page chunks and include citations.",
  );
  const [isSending, startSending] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [saveMessage, setSaveMessage] = useState(
    workspace.note?.updatedAt ? "Notes synced." : "",
  );
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const autoRunStartedRef = useRef(false);
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);

  const hasDeepResearchResult = deepResearchResult !== null;
  const isDeepResearchSession =
    hasDeepResearchResult || pendingRequest?.tool === "deep-research";
  const outputFiles = isDeepResearchSession
    ? [
        {
          id: "insights" as const,
          label: renderFileLabel(workspace.document.title, "deep_research_report.md"),
          description: "Summary",
        },
        {
          id: "dashboard" as const,
          label: renderFileLabel(workspace.document.title, "paper_discovery_dashboard.html"),
          description: "Dashboard",
        },
        {
          id: "evidence" as const,
          label: renderFileLabel(workspace.document.title, "ranked_papers.md"),
          description: "Citations",
        },
      ]
    : [
        {
          id: "insights" as const,
          label: renderFileLabel(workspace.document.title, "insights.md"),
          description: "Summary",
        },
        {
          id: "evidence" as const,
          label: renderFileLabel(workspace.document.title, "evidence.md"),
          description: "Evidence",
        },
      ];

  const filteredFiles = outputFiles.filter((file) =>
    `${file.label} ${file.description}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase()),
  );

  const pageCount = workspace.pages.length || 1;
  const findings = workspace.document.summary.keyFindings.length
    ? workspace.document.summary.keyFindings
    : ["Key findings will appear here after summary generation."];
  const definitions = workspace.document.summary.importantDefinitions.length
    ? workspace.document.summary.importantDefinitions
    : [{ term: "Definition pending", meaning: "No definitions were generated yet." }];
  const questions = workspace.document.summary.possibleExamQuestions.length
    ? workspace.document.summary.possibleExamQuestions
    : ["Suggested questions will appear here after processing."];

  const evidenceRows = workspace.pages.map((page, index) => ({
    id: page.id,
    pageNumber: page.pageNumber,
    heading: inferPageHeading(page),
    supportingText: trimText(page.textContent, 170),
    implication:
      findings[index % findings.length] ??
      "This page contributes supporting evidence to the document synthesis.",
  }));

  const notebookPayload =
    hasDeepResearchResult && deepResearchResult
      ? selectedFile === "insights"
        ? buildDeepResearchReportMarkdown(deepResearchResult)
        : selectedFile === "dashboard"
          ? buildDeepResearchDashboardHtml(deepResearchResult)
          : buildDeepResearchPapersMarkdown(deepResearchResult)
      : selectedFile === "insights"
        ? buildInsightsMarkdown(workspace)
        : buildEvidenceMarkdown(workspace);
  const activeDownload = {
    filename: activeFileLabelForDownload(
      workspace.document.title,
      selectedFile,
      hasDeepResearchResult,
    ),
    content: notebookPayload,
    mimeType:
      hasDeepResearchResult && selectedFile === "dashboard"
        ? "text/html;charset=utf-8"
        : "text/markdown;charset=utf-8",
  };

  function handleSendPrompt() {
    if (!prompt.trim()) {
      setHelperMessage("Add a question first so I know what to retrieve.");
      return;
    }

    const userPrompt = prompt.trim();
    setPrompt("");

    if (selectedTool === "notes") {
      setPendingRequest(null);
      setHelperMessage("Saving your note into the document notebook...");

      startSaving(async () => {
        try {
          await saveNoteAction({
            documentId: workspace.document.id,
            body: userPrompt,
          });

          setSaveMessage("Notes updated with your note.");
          setHelperMessage("Saved your note. You can keep writing or ask another question.");
        } catch {
          setHelperMessage("The note could not be saved right now. Try again in a moment.");
        }
      });

      return;
    }

    if (selectedTool === "deep-research") {
      setSidebarPanel("chat");
      setPendingRequest({ tool: "deep-research", prompt: userPrompt });
      setSelectedFile("insights");
      setSupportingQuotes([]);
      setHelperMessage(
        "Running Deep Research with OpenRouter and ranking external literature...",
      );

      startSending(async () => {
        try {
          const result = await runDeepResearchAction({
            documentId: workspace.document.id,
            prompt: userPrompt,
          });

          setDeepResearchResult(result);
          setSelectedFile("insights");
          setFocusedPaperId(result.papers[0]?.id ?? null);
          setHelperMessage(
            `Deep Research complete: ${result.papers.length} ranked papers using ${result.model}.`,
          );
        } catch {
          setPrompt(userPrompt);
          setHelperMessage(
            "Deep Research could not finish right now. Check your OpenRouter key or try again.",
          );
        } finally {
          setPendingRequest(null);
        }
      });

      return;
    }

    setSidebarPanel("chat");
    setPendingRequest({ tool: "chat-with-pdf", prompt: userPrompt });
    setHelperMessage("Searching the document and grounding the answer in retrieved pages...");

    startSending(async () => {
      try {
        const response = await sendChatMessageAction({
          documentId: workspace.document.id,
          prompt: userPrompt,
        });

        setMessages((current) => [
          ...current,
          response.userMessage,
          response.assistantMessage,
        ]);
        setSupportingQuotes(response.supportingQuotes);
        setFocusedPageNumber(response.assistantMessage.citations[0] ?? focusedPageNumber);
        setHelperMessage(formatPagesLabel(response.assistantMessage.citations));
      } catch {
        setPrompt(userPrompt);
        setHelperMessage("The PDF answer could not be generated right now. Try again.");
      } finally {
        setPendingRequest(null);
      }
    });
  }

  function handleNotebookSave() {
    startSaving(async () => {
      await saveNoteAction({
        documentId: workspace.document.id,
        body: notebookPayload,
      });

      setSaveMessage(
        `Saved ${selectedFile === "insights" ? "insights" : "evidence"} to notebook.`,
      );
    });
  }

  function handleDownloadActiveFile() {
    triggerTextDownload({
      filename: activeDownload.filename,
      content: activeDownload.content,
      mimeType: activeDownload.mimeType,
    });
    setHelperMessage(`Downloaded ${activeDownload.filename}.`);
  }

  function handleDownloadBundle() {
    const bundle =
      hasDeepResearchResult && deepResearchResult
        ? [
            buildDeepResearchReportMarkdown(deepResearchResult),
            "",
            "-----",
            "",
            buildDeepResearchDashboardHtml(deepResearchResult),
            "",
            "-----",
            "",
            buildDeepResearchPapersMarkdown(deepResearchResult),
          ].join("\n")
        : [
            buildInsightsMarkdown(workspace),
            "",
            "-----",
            "",
            buildEvidenceMarkdown(workspace),
          ].join("\n");

    triggerTextDownload({
      filename: `${slugify(workspace.document.title) || "researchforge"}_research_bundle.md`,
      content: bundle,
    });
    setHelperMessage("Downloaded the full research bundle.");
  }

  function focusComposerWithPrompt(value: string) {
    setPrompt(value);
    setHelperMessage("Prompt loaded. Send it when you are ready.");
    window.setTimeout(() => composerRef.current?.focus(), 0);
  }

  const handleInitialAutoRun = useEffectEvent(() => {
    handleSendPrompt();
  });

  useEffect(() => {
    if (
      !autoRunInitialPrompt ||
      autoRunStartedRef.current ||
      initialMode !== "deep-research" ||
      !initialPrompt.trim()
    ) {
      return;
    }

    autoRunStartedRef.current = true;
    window.setTimeout(() => {
      handleInitialAutoRun();
    }, 0);
  }, [autoRunInitialPrompt, initialMode, initialPrompt]);

  useEffect(() => {
    if (sidebarPanel !== "chat") {
      return;
    }

    const scrollContainer = sidebarScrollRef.current;

    if (!scrollContainer) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: pendingRequest ? "smooth" : "auto",
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [messages.length, pendingRequest, sidebarPanel]);

  const activeFile = outputFiles.find((file) => file.id === selectedFile) ?? outputFiles[0];
  const activeTool = composerTools.find((item) => item.id === selectedTool) ?? composerTools[0];
  const suggestionItems = hasDeepResearchResult
    ? deepResearchResult.relatedQuestions
    : [
        "Find papers I can cite alongside this document",
        "Create a simple summary of this document",
      ];
  const deepResearchStarters = [
    "Use Deep Research to find related studies this paper should be compared with.",
    "Identify the main research gaps that still remain after reading this document.",
    "Find recent papers that support or challenge the core argument of this document.",
  ];
  const activeFileDescription =
    selectedFile === "insights"
      ? isDeepResearchSession
        ? "Readable deep-research report"
        : "Simple summary and key takeaways"
      : selectedFile === "dashboard"
        ? "Paper discovery dashboard UI"
        : isDeepResearchSession
          ? "Ranked papers and citation notes"
          : "Grounded evidence from the PDF";

  function handleSelectPageSource(pageNumber: number) {
    setSidebarPanel("sources");
    setSelectedFile("evidence");
    setFocusedPageNumber(pageNumber);
  }

  function handleSelectDeepResearchPaper(paperId: string) {
    setSidebarPanel("sources");
    setSelectedFile("evidence");
    setFocusedPaperId(paperId);
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#101522]">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col xl:grid xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="border-b border-[#e6e9ef] bg-white xl:border-b-0 xl:border-r">
          <div className="border-b border-[#e9edf3] px-5 py-4">
            <div className="truncate text-base font-semibold text-[#172132]">
              {workspace.document.title}
            </div>
            <p className="mt-1 text-sm leading-6 text-[#667084]">
              One place to ask questions, inspect sources, and switch between your
              generated outputs.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { id: "chat", label: "Ask" },
                { id: "sources", label: "Citations" },
                { id: "files", label: "Outputs" },
              ].map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => setSidebarPanel(panel.id as SidebarPanel)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    sidebarPanel === panel.id
                      ? "bg-[#eef3fd] font-medium text-[#111727]"
                      : "text-[#6b7483] hover:bg-[#f6f8fb]"
                  }`}
                >
                  {panel.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
                Assistant Mode
              </div>
              <div className="flex flex-wrap gap-2">
                {composerTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      setSelectedTool(tool.id);
                      setHelperMessage(tool.helper);
                      if (tool.id === "notes") {
                        setSidebarPanel("files");
                      }
                    }}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                      selectedTool === tool.id
                        ? "bg-[#111727] font-medium text-white"
                        : "border border-[#d8dee7] text-[#667084] hover:bg-[#f7f8fb]"
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#627086]">
              <span className="rounded-full bg-[#f6f8fb] px-3 py-1.5">
                {pendingRequest?.tool === "deep-research"
                  ? "Research in progress"
                  : hasDeepResearchResult && deepResearchResult
                  ? `${deepResearchResult.papers.length} ranked papers`
                  : `${workspace.document.pageCount} pages extracted`}
              </span>
              <span className="rounded-full bg-[#f6f8fb] px-3 py-1.5">
                Tool: {activeTool.label}
              </span>
              <span className="rounded-full bg-[#f6f8fb] px-3 py-1.5">
                Viewing: {activeFile.description}
              </span>
            </div>
          </div>

          <div
            ref={sidebarScrollRef}
            className="max-h-[calc(100vh-360px)] space-y-5 overflow-y-auto px-5 py-5"
          >
            {selectedTool === "deep-research" &&
            !hasDeepResearchResult &&
            pendingRequest?.tool !== "deep-research" ? (
              <div className="rounded-[1.2rem] border border-[#d9dee7] bg-[#fbfcfe] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
                  Deep Research is ready
                </div>
                <p className="mt-3 text-sm leading-7 text-[#293444]">
                  ResearchForge can use this document as a starting point, search
                  for related literature through OpenRouter, rank the best papers,
                  and generate a broader research report.
                </p>
                <div className="mt-4 space-y-2">
                  {deepResearchStarters.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => focusComposerWithPrompt(starter)}
                      className="block w-full rounded-xl border border-[#e3e7ee] bg-white px-3 py-3 text-left text-sm text-[#243042] hover:bg-[#f7f9fd]"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {sidebarPanel === "sources" ? (
              <>
                {hasDeepResearchResult && deepResearchResult ? (
                  <DeepResearchSourcesList
                    result={deepResearchResult}
                    focusedPaperId={focusedPaperId}
                    onSelectPaper={(paperId) => {
                      setFocusedPaperId(paperId);
                      setSelectedFile("evidence");
                    }}
                  />
                ) : (
                  <EvidenceReferenceList
                    pages={workspace.pages}
                    onSelectPage={(pageNumber) => {
                      setFocusedPageNumber(pageNumber);
                      setSelectedFile("evidence");
                    }}
                    activePage={focusedPageNumber}
                  />
                )}

                {hasDeepResearchResult && deepResearchResult ? (
                  <div className="rounded-[1.2rem] border border-[#d9dee7] bg-[#fbfcfe] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
                      Citation overview
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#293444]">
                      {deepResearchResult.searchSummary}
                    </p>
                  </div>
                ) : supportingQuotes.length > 0 ? (
                  <div className="rounded-[1.2rem] border border-[#d9dee7] bg-[#fbfcfe] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
                      Last supporting excerpts
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-[#293444]">
                      {supportingQuotes.map((quote) => (
                        <p key={quote}>{quote}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : sidebarPanel === "files" ? (
              <div className="space-y-5">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search outputs"
                  className="w-full rounded-xl border border-[#d7ddea] bg-white px-3 py-2 text-sm text-[#1a2433] outline-none placeholder:text-[#9aa2ae]"
                />

                <div className="space-y-3">
                  {filteredFiles.map((file) => (
                    <OutputFileCard
                      key={file.id}
                      label={file.label}
                      description={file.description}
                      isActive={selectedFile === file.id}
                      onClick={() => setSelectedFile(file.id)}
                    />
                  ))}
                  {filteredFiles.length === 0 ? (
                    <div className="rounded-[1rem] border border-dashed border-[#d7dde8] bg-[#fbfcfe] px-3 py-4 text-sm text-[#6f7988]">
                      No outputs matched your search.
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[1.2rem] border border-[#d9dee8] bg-[#fbfcfe] p-4 text-sm leading-7 text-[#293444]">
                  <div className="font-semibold text-[#111727]">Current workspace</div>
                  <div className="mt-2">Source file: {workspace.document.sourceFileName}</div>
                  <div>Active file: {activeFile.label}</div>
                  <div>
                    {hasDeepResearchResult && deepResearchResult
                      ? `Model used: ${deepResearchResult.model}`
                      : `Messages in thread: ${messages.length}`}
                  </div>
                  {saveMessage ? <div className="mt-2 text-[#2158d4]">{saveMessage}</div> : null}
                </div>

                <button
                  type="button"
                  onClick={handleDownloadBundle}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[#d7dde7] px-4 py-2.5 text-sm font-medium text-[#111727] transition-colors hover:bg-[#f7f8fb]"
                >
                  Download research bundle
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <ConversationList
                  messages={messages}
                  pages={workspace.pages}
                  onSelectPage={handleSelectPageSource}
                  pendingRequest={pendingRequest}
                />

                {supportingQuotes.length > 0 ? (
                  <div className="rounded-[1.2rem] border border-[#d9dee7] bg-[#fbfcfe] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
                      Last supporting excerpts
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-[#293444]">
                      {supportingQuotes.map((quote) => (
                        <p key={quote}>{quote}</p>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7e8795]">
                    Try next
                  </div>
                  <Suggestions
                    items={suggestionItems}
                    onSelect={(value) => {
                      if (hasDeepResearchResult) {
                        setSelectedTool("deep-research");
                      }
                      focusComposerWithPrompt(value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#e9edf3] bg-[#fbfbfc] px-4 py-4">
            <Composer
              prompt={prompt}
              onPromptChange={setPrompt}
              onSubmit={handleSendPrompt}
              onQuickAction={focusComposerWithPrompt}
              isSending={isSending}
              selectedTool={selectedTool}
              onToolChange={(tool) => {
                setSelectedTool(tool);
                if (tool === "notes") {
                  setHelperMessage("Notes mode selected. Save your current view when ready.");
                } else {
                  setHelperMessage(
                    composerTools.find((item) => item.id === tool)?.helper ??
                      "Tool selected.",
                  );
                }
              }}
              onVoiceClick={() =>
                setHelperMessage(
                  "Voice input is not connected yet, so type your question for now.",
                )
              }
              helperMessage={helperMessage}
              inputRef={composerRef}
              placeholder={activeTool.placeholder}
            />
          </div>
        </section>

        <section className="min-w-0 bg-white">
          <div className="border-b border-[#e9edf3] px-5 py-4 sm:px-7 xl:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[#172132]">
                  {activeFile.label}
                </div>
                <div className="mt-1 text-sm text-[#667084]">{activeFileDescription}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {outputFiles.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setSelectedFile(file.id)}
                    className={`rounded-full px-3 py-2 text-sm transition-colors ${
                      selectedFile === file.id
                        ? "bg-[#eef3fd] font-medium text-[#111727]"
                        : "border border-[#d8dee7] text-[#667084] hover:bg-[#f7f8fb]"
                    }`}
                  >
                    {file.description}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleDownloadActiveFile}
                  className="rounded-xl border border-[#d8dee7] px-3 py-2 text-sm text-[#6d7686] transition-colors hover:bg-[#f7f8fb] hover:text-[#111727]"
                >
                  Download file
                </button>
                <button
                  type="button"
                  onClick={handleNotebookSave}
                  disabled={isSaving}
                  className="rounded-xl border border-[#d8dee7] px-3 py-2 text-sm text-[#111727] transition-colors hover:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? "Saving..." : "Save to Notes"}
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-[calc(100vh-74px)] overflow-y-auto px-5 py-6 sm:px-7 xl:px-8">
            {pendingRequest?.tool === "deep-research" ? (
              <DeepResearchThinkingPanel prompt={pendingRequest.prompt} />
            ) : hasDeepResearchResult && deepResearchResult ? (
              selectedFile === "insights" ? (
                <div className="space-y-7">
                  <ReportSection
                    title="TL;DR"
                    body={deepResearchResult.tldr}
                    citations={[]}
                    pages={workspace.pages}
                    onSelectPage={handleSelectPageSource}
                  />

                  <section className="border-b border-[#e8ebf0] pb-7">
                    <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
                      Deep research overview
                    </h2>
                    <p className="mt-3 text-[15px] leading-8 text-[#283342]">
                      {deepResearchResult.searchSummary}
                    </p>
                  </section>

                  {deepResearchResult.sections.map((section) => (
                    <DeepResearchSectionBlock
                      key={section.title}
                      result={deepResearchResult}
                      section={section}
                      onSelectPaper={handleSelectDeepResearchPaper}
                    />
                  ))}

                  <DeepResearchSectionBlock
                    result={deepResearchResult}
                    section={deepResearchResult.mechanismsSection}
                    onSelectPaper={handleSelectDeepResearchPaper}
                  />

                  <DeepResearchComparisonTable
                    result={deepResearchResult}
                    rows={deepResearchResult.comparisonRows}
                    onSelectPaper={handleSelectDeepResearchPaper}
                  />

                  <DeepResearchSectionBlock
                    result={deepResearchResult}
                    section={deepResearchResult.synthesisSection}
                    onSelectPaper={handleSelectDeepResearchPaper}
                  />

                  <DeepResearchSectionBlock
                    result={deepResearchResult}
                    section={deepResearchResult.practicalImplicationsSection}
                    onSelectPaper={handleSelectDeepResearchPaper}
                  />

                  <DeepResearchReferenceList
                    result={deepResearchResult}
                    onSelectPaper={handleSelectDeepResearchPaper}
                  />

                  <section className="space-y-4">
                    <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
                      Recommended follow-up questions
                    </h2>
                    <div className="space-y-2">
                      {deepResearchResult.relatedQuestions.map((question) => (
                        <button
                          key={question}
                          type="button"
                          onClick={() => {
                            setSelectedTool("deep-research");
                            focusComposerWithPrompt(question);
                          }}
                          className="block w-full rounded-xl border border-[#e3e7ee] bg-[#fbfbfd] px-4 py-3 text-left text-sm text-[#243042] hover:bg-white"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              ) : selectedFile === "dashboard" ? (
                <DeepResearchDashboardPreview result={deepResearchResult} />
              ) : (
                <DeepResearchPapersTable
                  result={deepResearchResult}
                  focusedPaperId={focusedPaperId}
                  onSelectPaper={setFocusedPaperId}
                />
              )
            ) : selectedFile === "insights" ? (
              <div className="space-y-7">
                <ReportSection
                  title="TL;DR"
                  body={workspace.document.summary.simpleSummary}
                  citations={workspace.pages.slice(0, 2).map((page) => page.pageNumber)}
                  pages={workspace.pages}
                  onSelectPage={handleSelectPageSource}
                />

                <section className="border-b border-[#e8ebf0] pb-7">
                  <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
                    Key findings driving this paper
                  </h2>
                  <div className="mt-4 space-y-4 text-[15px] leading-8 text-[#283342]">
                    {findings.map((finding, index) => (
                      <div key={finding} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#c6ced9]" />
                        <div>
                          <span className="font-semibold text-[#111727]">{finding}</span>{" "}
                          <CitationBadge
                            pageNumber={
                              workspace.pages[index % pageCount]?.pageNumber ??
                              workspace.pages[0]?.pageNumber ??
                              1
                            }
                            onClick={() =>
                              handleSelectPageSource(
                                workspace.pages[index % pageCount]?.pageNumber ??
                                  workspace.pages[0]?.pageNumber ??
                                  1,
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <PageSourceList
                    pages={workspace.pages}
                    citations={findings.map(
                      (_, index) =>
                        workspace.pages[index % pageCount]?.pageNumber ??
                        workspace.pages[0]?.pageNumber ??
                        1,
                    )}
                    onSelectPage={handleSelectPageSource}
                  />
                </section>

                <ReportSection
                  title="Methodology in simple terms"
                  body={workspace.document.summary.methodology}
                  citations={[workspace.pages[1]?.pageNumber ?? workspace.pages[0]?.pageNumber ?? 1]}
                  pages={workspace.pages}
                  onSelectPage={handleSelectPageSource}
                />

                <ReportSection
                  title="Limitations and caution"
                  body={workspace.document.summary.limitations}
                  citations={[workspace.pages[pageCount - 1]?.pageNumber ?? 1]}
                  pages={workspace.pages}
                  onSelectPage={handleSelectPageSource}
                />

                <section className="border-b border-[#e8ebf0] pb-7">
                  <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
                    Important definitions
                  </h2>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {definitions.map((definition, index) => (
                      <div
                        key={definition.term}
                        className="rounded-[1.2rem] border border-[#e3e7ee] bg-[#fbfbfd] p-4"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#111727]">
                            {definition.term}
                          </h3>
                          <CitationBadge
                            pageNumber={
                              workspace.pages[index % pageCount]?.pageNumber ??
                              workspace.pages[0]?.pageNumber ??
                              1
                            }
                            onClick={() =>
                              handleSelectPageSource(
                                workspace.pages[index % pageCount]?.pageNumber ??
                                  workspace.pages[0]?.pageNumber ??
                                  1,
                              )
                            }
                          />
                        </div>
                        <p className="mt-2 text-sm leading-7 text-[#4a5565]">
                          {definition.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                  <PageSourceList
                    pages={workspace.pages}
                    citations={definitions.map(
                      (_, index) =>
                        workspace.pages[index % pageCount]?.pageNumber ??
                        workspace.pages[0]?.pageNumber ??
                        1,
                    )}
                    onSelectPage={handleSelectPageSource}
                  />
                </section>

                <section className="space-y-4">
                  <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
                    Evidence by page
                  </h2>
                  <p className="text-[15px] leading-8 text-[#283342]">
                    This table compares the strongest evidence extracted from
                    each page of the uploaded paper and turns it into a report
                    structure you can reuse in notes or writing.
                  </p>

                  <div className="overflow-x-auto rounded-[1.2rem] border border-[#e3e7ee]">
                    <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                      <thead className="bg-[#f7f8fb] text-[#111727]">
                        <tr>
                          <th className="border-b border-r border-[#e3e7ee] px-4 py-3 font-semibold">
                            Page
                          </th>
                          <th className="border-b border-r border-[#e3e7ee] px-4 py-3 font-semibold">
                            Main theme
                          </th>
                          <th className="border-b border-r border-[#e3e7ee] px-4 py-3 font-semibold">
                            Supporting excerpt
                          </th>
                          <th className="border-b border-[#e3e7ee] px-4 py-3 font-semibold">
                            Why it matters
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {evidenceRows.map((row) => (
                          <tr
                            key={row.id}
                            className={
                              focusedPageNumber === row.pageNumber
                                ? "bg-[#f6f8fc]"
                                : "bg-white"
                            }
                          >
                            <td className="border-b border-r border-[#e9edf3] px-4 py-4 align-top text-[#111727]">
                              Page {row.pageNumber}
                            </td>
                            <td className="border-b border-r border-[#e9edf3] px-4 py-4 align-top text-[#243042]">
                              {row.heading}
                            </td>
                            <td className="border-b border-r border-[#e9edf3] px-4 py-4 align-top text-[#4a5565]">
                              {row.supportingText}
                            </td>
                            <td className="border-b border-[#e9edf3] px-4 py-4 align-top text-[#243042]">
                              {row.implication}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-6">
                <ReportSection
                  title="Evidence file overview"
                  body="This file collects the most useful page excerpts from the PDF so you can inspect the grounded evidence behind the generated report."
                  citations={workspace.pages.map((page) => page.pageNumber)}
                  pages={workspace.pages}
                  onSelectPage={handleSelectPageSource}
                />

                <div className="space-y-4">
                  {workspace.pages.map((page) => (
                    <article
                      key={page.id}
                      className={`rounded-[1.2rem] border p-4 ${
                        focusedPageNumber === page.pageNumber
                          ? "border-[#cfd8e7] bg-[#f5f8fe]"
                          : "border-[#e3e7ee] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[#111727]">
                          Page {page.pageNumber}
                        </h3>
                        <CitationBadge
                          pageNumber={page.pageNumber}
                          onClick={() => handleSelectPageSource(page.pageNumber)}
                        />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#435062]">
                        {page.textContent}
                      </p>
                    </article>
                  ))}
                </div>

                <section className="rounded-[1.2rem] border border-[#e3e7ee] bg-[#fbfbfd] p-4">
                  <h3 className="text-sm font-semibold text-[#111727]">
                    Suggested follow-up questions
                  </h3>
                  <div className="mt-3 space-y-2">
                    {questions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => focusComposerWithPrompt(question)}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[#243042] hover:bg-white"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {saveMessage ? (
              <div className="mt-6 text-sm text-[#5f6978]">{saveMessage}</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
