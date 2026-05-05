import type {
  BillingSnapshot,
  ChatMessageRecord,
  ClaimSuggestion,
  DocumentChunkRecord,
  DocumentListItem,
  DocumentNoteRecord,
  DocumentPageRecord,
  DocumentWorkspace,
  LiteratureResult,
  SummaryBundle,
} from "@/lib/db/types";

const demoSummary: SummaryBundle = {
  simpleSummary:
    "This sample review shows that thesis progress improves when students narrow their research question early, organize sources consistently, and work from clear supervisor feedback. In simple terms, the paper argues that better structure and source management help students find research gaps faster and write with more confidence.",
  keyFindings: [
    "Focused research questions reduce time spent reading unrelated papers and make literature gaps easier to identify.",
    "Regular, specific supervisor feedback improves thesis structure, revision quality, and student confidence.",
    "Strong note-taking and citation habits help students synthesize sources instead of repeatedly searching for the same evidence.",
  ],
  methodology:
    "The sample paper combines literature synthesis, student survey results, and qualitative findings on thesis-writing workflows across higher-education settings.",
  limitations:
    "Many of the underlying studies rely on self-reported student experiences and single-institution samples, so the findings should be applied carefully across different contexts.",
  importantDefinitions: [
    {
      term: "Research gap",
      meaning:
        "An unresolved question, under-studied area, or inconsistency in the literature that a thesis can investigate further.",
    },
    {
      term: "Source synthesis",
      meaning:
        "Combining ideas from multiple papers into a clear argument instead of describing each source one by one.",
    },
  ],
  possibleExamQuestions: [
    "Why does narrowing a research question early help a thesis student move faster?",
    "How can note-taking and citation systems improve literature review quality?",
    "What are the limits of self-reported studies on student research practice?",
  ],
};

export const demoDocumentId = "demo-thesis-review";

export const demoPages: DocumentPageRecord[] = [
  {
    id: "page-1",
    documentId: demoDocumentId,
    pageNumber: 1,
    tokenEstimate: 166,
    textContent:
      "The review argues that students make faster thesis progress when they narrow the topic early, define a focused research question, and use that question to filter what they read. This reduces irrelevant reading and makes it easier to detect where the literature is thin or inconsistent.",
  },
  {
    id: "page-2",
    documentId: demoDocumentId,
    pageNumber: 2,
    tokenEstimate: 171,
    textContent:
      "Several studies in the review show that regular supervisor feedback improves organization and revision quality, especially when comments are concrete and tied to the argument. The paper also reports that citation managers and structured notes reduce time lost to refinding sources.",
  },
  {
    id: "page-3",
    documentId: demoDocumentId,
    pageNumber: 3,
    tokenEstimate: 176,
    textContent:
      "The synthesis section explains that students identify research gaps more effectively when they compare methods, populations, and contradictions across papers rather than summarizing sources separately. Organized notes help them group evidence into themes and spot unanswered questions.",
  },
  {
    id: "page-4",
    documentId: demoDocumentId,
    pageNumber: 4,
    tokenEstimate: 160,
    textContent:
      "The review notes important limits: much of the evidence comes from single universities, self-reported student reflections, and short-term studies. Even so, the overall pattern suggests that topic focus, feedback cycles, and source organization are central to thesis completion.",
  },
];

export const demoChunks: DocumentChunkRecord[] = [
  {
    id: "chunk-1",
    documentId: demoDocumentId,
    pageNumber: 1,
    chunkIndex: 0,
    tokenEstimate: 92,
    metadata: { section: "focus" },
    content:
      "Students make faster thesis progress when they narrow the topic early, define a focused research question, and use that question to filter what they read.",
    score: 0.94,
  },
  {
    id: "chunk-2",
    documentId: demoDocumentId,
    pageNumber: 2,
    chunkIndex: 0,
    tokenEstimate: 96,
    metadata: { section: "feedback" },
    content:
      "Regular supervisor feedback improves organization and revision quality, and citation managers plus structured notes reduce time lost to refinding sources.",
    score: 0.88,
  },
  {
    id: "chunk-3",
    documentId: demoDocumentId,
    pageNumber: 3,
    chunkIndex: 0,
    tokenEstimate: 101,
    metadata: { section: "gap-analysis" },
    content:
      "Students identify research gaps more effectively when they compare methods, populations, and contradictions across papers rather than summarizing sources separately.",
    score: 0.84,
  },
  {
    id: "chunk-4",
    documentId: demoDocumentId,
    pageNumber: 4,
    chunkIndex: 0,
    tokenEstimate: 97,
    metadata: { section: "limitations" },
    content:
      "Much of the evidence comes from single universities, self-reported reflections, and short-term studies, which limits generalization across different thesis contexts.",
    score: 0.79,
  },
];

export const demoMessages: ChatMessageRecord[] = [
  {
    id: "msg-1",
    documentId: demoDocumentId,
    userId: "demo-user",
    role: "user",
    content: "What helps students make faster progress on a thesis literature review?",
    citations: [1, 2, 3],
    createdAt: new Date("2026-04-01T10:00:00Z").toISOString(),
  },
  {
    id: "msg-2",
    documentId: demoDocumentId,
    userId: "demo-user",
    role: "assistant",
    content:
      "The sample review says progress improves when students narrow the research question early, organize notes and citations well, and get regular supervisor feedback. It also says these habits make it easier to identify research gaps instead of rereading unrelated sources. Pages 1, 2, and 3 support that answer.",
    citations: [1, 2, 3],
    createdAt: new Date("2026-04-01T10:00:04Z").toISOString(),
  },
];

export const demoNote: DocumentNoteRecord = {
  id: "note-1",
  documentId: demoDocumentId,
  userId: "demo-user",
  body:
    "Useful example for showing how question focus, supervisor feedback, and source organization can become separate sections in a thesis workflow chapter.",
  createdAt: new Date("2026-04-01T10:15:00Z").toISOString(),
  updatedAt: new Date("2026-04-01T10:15:00Z").toISOString(),
};

export const demoDocument: DocumentListItem = {
  id: demoDocumentId,
  userId: "demo-user",
  title: "Sample Thesis Literature Review",
  authors: ["A. Student", "B. Supervisor", "C. Researcher"],
  sourceFileName: "sample_thesis_literature_review.pdf",
  storagePath: "",
  mimeType: "application/pdf",
  pageCount: 4,
  status: "ready",
  createdAt: new Date("2026-04-01T09:55:00Z").toISOString(),
  updatedAt: new Date("2026-04-01T10:05:00Z").toISOString(),
  summary: demoSummary,
  excerpt:
    "This sample review highlights question focus, note organization, and supervisor feedback as the main drivers of thesis progress.",
  noteCount: 1,
  chatCount: 2,
};

export const demoWorkspace: DocumentWorkspace = {
  document: demoDocument,
  pages: demoPages,
  messages: demoMessages,
  note: demoNote,
};

export const demoSearchResults: LiteratureResult[] = [
  {
    id: "openalex-demo-1",
    title: "Supervisor feedback timing and undergraduate thesis completion",
    authors: ["A. Researcher", "B. Analyst"],
    year: "2024",
    venue: "Journal of Higher Education Practice",
    abstract:
      "Examines how feedback frequency, turnaround time, and comment clarity affect student progress during proposal, literature review, and revision stages.",
    url: "https://openalex.org/",
    doi: "10.1000/demo.1",
    citationCount: 32,
    provider: "openalex",
    relevanceNote:
      "Useful when exploring how feedback cycles shape thesis progress and draft quality.",
  },
  {
    id: "semantic-demo-2",
    title: "Source organization strategies in student literature reviews",
    authors: ["C. Librarian", "D. Writing Coach"],
    year: "2023",
    venue: "Academic Writing Systems Review",
    abstract:
      "Reviews structured note-taking, citation manager use, and source synthesis habits among student researchers working on large writing projects.",
    url: "https://www.semanticscholar.org/",
    doi: "10.1000/demo.2",
    citationCount: 21,
    provider: "semantic-scholar",
    relevanceNote:
      "Helpful for claims about citation workflows, note systems, and literature review organization.",
  },
];

export const demoClaimSuggestion: ClaimSuggestion = {
  claim:
    "Structured note-taking can improve how students synthesize sources during thesis writing.",
  recommendedSearch:
    "structured note taking source synthesis thesis writing students literature review",
  papers: demoSearchResults,
};

export const demoBilling: BillingSnapshot = {
  plan: "free",
  paystackCustomerCode: null,
  paystackSubscriptionCode: null,
  paystackPlanCode: null,
  paystackReference: null,
  paystackEmailToken: null,
  subscriptionStatus: "inactive",
  uploadCount: 1,
  uploadLimit: 3,
  questionLimit: 25,
};
