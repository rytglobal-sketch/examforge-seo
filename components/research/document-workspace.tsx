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

type WorkspaceFileId = "insights" | "evidence";
type ComposerTool = "deep-research" | "chat-with-pdf" | "notes";
type SidebarPanel = "sources" | "chat" | "files";

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
    label: "Ask PDF",
    helper: "Ask a direct question and get a simple, page-backed answer.",
    placeholder: "Ask a question about this PDF...",
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
    "## Synthesis",
    ...result.sections.flatMap((section) => [
      `### ${section.title}`,
      section.body,
      section.supportingPaperIds.length
        ? `Supporting papers: ${section.supportingPaperIds.join(", ")}`
        : "Supporting papers: none tagged",
      "",
    ]),
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

function ReferenceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#d9dee7] bg-white px-2 py-0.5 text-[11px] font-medium text-[#6d7584]">
      {label}
    </span>
  );
}

function CitationBadge({ pageNumber }: { pageNumber: number }) {
  return <ReferenceBadge label={String(pageNumber)} />;
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
}: {
  messages: ChatMessageRecord[];
}) {
  if (messages.length === 0) {
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
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.citations.map((citation) => (
                    <CitationBadge key={`${message.id}-${citation}`} pageNumber={citation} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
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
}: {
  title: string;
  body: string;
  citations: number[];
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
            <CitationBadge pageNumber={citation} />
          </span>
        ))}
      </p>
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

  const hasDeepResearchResult = deepResearchResult !== null;
  const outputFiles = hasDeepResearchResult
    ? [
        {
          id: "insights" as const,
          label: renderFileLabel(workspace.document.title, "deep_research_report.md"),
          description: "Summary",
        },
        {
          id: "evidence" as const,
          label: renderFileLabel(workspace.document.title, "ranked_papers.txt"),
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
          label: renderFileLabel(workspace.document.title, "evidence.txt"),
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
        : buildDeepResearchPapersMarkdown(deepResearchResult)
      : selectedFile === "insights"
        ? buildInsightsMarkdown(workspace)
        : buildEvidenceMarkdown(workspace);

  function handleSendPrompt() {
    if (!prompt.trim()) {
      setHelperMessage("Add a question first so I know what to retrieve.");
      return;
    }

    const userPrompt = prompt.trim();
    setPrompt("");

    if (selectedTool === "notes") {
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
      setSidebarPanel("sources");
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
          setHelperMessage(
            "Deep Research could not finish right now. Check your OpenRouter key or try again.",
          );
        }
      });

      return;
    }

    setSidebarPanel("chat");
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
        setHelperMessage("The PDF answer could not be generated right now. Try again.");
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

  function handleDownloadBundle() {
    const bundle =
      hasDeepResearchResult && deepResearchResult
        ? [
            buildDeepResearchReportMarkdown(deepResearchResult),
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

    const blob = new Blob([bundle], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slugify(workspace.document.title) || "researchforge"}_outputs.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
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
      ? hasDeepResearchResult
        ? "Readable deep-research report"
        : "Simple summary and key takeaways"
      : hasDeepResearchResult
        ? "Ranked papers and citation notes"
        : "Grounded evidence from the PDF";

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
                {hasDeepResearchResult && deepResearchResult
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

          <div className="max-h-[calc(100vh-360px)] space-y-5 overflow-y-auto px-5 py-5">
            {selectedTool === "deep-research" && !hasDeepResearchResult ? (
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
                  Download all files
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <ConversationList messages={messages} />

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
                  onClick={handleDownloadBundle}
                  className="rounded-xl border border-[#d8dee7] px-3 py-2 text-sm text-[#6d7686] transition-colors hover:bg-[#f7f8fb] hover:text-[#111727]"
                >
                  Download
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
            {hasDeepResearchResult && deepResearchResult ? (
              selectedFile === "insights" ? (
                <div className="space-y-7">
                  <ReportSection title="TL;DR" body={deepResearchResult.tldr} citations={[]} />

                  <section className="border-b border-[#e8ebf0] pb-7">
                    <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
                      Deep research overview
                    </h2>
                    <p className="mt-3 text-[15px] leading-8 text-[#283342]">
                      {deepResearchResult.searchSummary}
                    </p>
                  </section>

                  {deepResearchResult.sections.map((section) => (
                    <section
                      key={section.title}
                      className="border-b border-[#e8ebf0] pb-7"
                    >
                      <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-[#111727]">
                        {section.title}
                      </h2>
                      <p className="mt-3 text-[15px] leading-8 text-[#283342]">
                        {section.body}
                      </p>
                      {section.supportingPaperIds.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {section.supportingPaperIds.map((paperId) => {
                            const paperIndex = deepResearchResult.papers.findIndex(
                              (paper) => paper.id === paperId,
                            );

                            if (paperIndex === -1) {
                              return null;
                            }

                            return (
                              <ReferenceBadge
                                key={`${section.title}-${paperId}`}
                                label={String(paperIndex + 1)}
                              />
                            );
                          })}
                        </div>
                      ) : null}
                    </section>
                  ))}

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
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <ReportSection
                  title="Methodology in simple terms"
                  body={workspace.document.summary.methodology}
                  citations={[workspace.pages[1]?.pageNumber ?? workspace.pages[0]?.pageNumber ?? 1]}
                />

                <ReportSection
                  title="Limitations and caution"
                  body={workspace.document.summary.limitations}
                  citations={[workspace.pages[pageCount - 1]?.pageNumber ?? 1]}
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
                          />
                        </div>
                        <p className="mt-2 text-sm leading-7 text-[#4a5565]">
                          {definition.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
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
                        <CitationBadge pageNumber={page.pageNumber} />
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
