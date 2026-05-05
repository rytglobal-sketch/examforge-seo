export type SubscriptionPlan = "free" | "pro";

export type DocumentStatus = "processing" | "ready" | "failed";

export type MessageRole = "user" | "assistant";

export type LiteratureProvider = "openalex" | "semantic-scholar" | "crossref";

export type AuthMode = "sign-in" | "sign-up";

export type SummaryDefinition = {
  term: string;
  meaning: string;
};

export type SummaryBundle = {
  simpleSummary: string;
  keyFindings: string[];
  methodology: string;
  limitations: string;
  importantDefinitions: SummaryDefinition[];
  possibleExamQuestions: string[];
};

export type SummaryDraft = SummaryBundle & {
  authors?: string[];
  title?: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  plan: SubscriptionPlan;
  subscriptionStatus?: string | null;
  isDemo?: boolean;
};

export type DocumentRecord = {
  id: string;
  userId: string;
  title: string;
  authors: string[];
  sourceFileName: string;
  storagePath: string;
  mimeType: string;
  pageCount: number;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  summary: SummaryBundle;
};

export type DocumentListItem = DocumentRecord & {
  excerpt: string;
  noteCount: number;
  chatCount: number;
};

export type DocumentPageRecord = {
  id: string;
  documentId: string;
  pageNumber: number;
  textContent: string;
  tokenEstimate: number;
};

export type DocumentPageDraft = {
  pageNumber: number;
  textContent: string;
  tokenEstimate: number;
};

export type DocumentChunkRecord = {
  id: string;
  documentId: string;
  pageId?: string | null;
  pageNumber: number;
  chunkIndex: number;
  content: string;
  tokenEstimate: number;
  metadata: Record<string, unknown>;
  score?: number;
};

export type DocumentChunkDraft = {
  pageNumber: number;
  chunkIndex: number;
  content: string;
  tokenEstimate: number;
  metadata: Record<string, unknown>;
  embedding?: number[] | null;
};

export type ChatMessageRecord = {
  id: string;
  documentId: string;
  userId: string;
  role: MessageRole;
  content: string;
  citations: number[];
  createdAt: string;
};

export type DocumentNoteRecord = {
  id: string;
  documentId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteListItem = DocumentNoteRecord & {
  documentTitle: string;
};

export type DocumentWorkspace = {
  document: DocumentRecord;
  pages: DocumentPageRecord[];
  messages: ChatMessageRecord[];
  note: DocumentNoteRecord | null;
};

export type GroundedAnswer = {
  answer: string;
  simplifiedAnswer: string;
  citations: number[];
  notFound: boolean;
  supportingQuotes: string[];
};

export type LiteratureResult = {
  id: string;
  title: string;
  authors: string[];
  year: string;
  venue: string;
  abstract: string;
  url: string;
  doi?: string | null;
  citationCount?: number | null;
  provider: LiteratureProvider;
  relevanceNote: string;
};

export type DeepResearchRelevanceTag =
  | "Highly Relevant"
  | "Relevant"
  | "Partially Relevant"
  | "Low Relevance";

export type DeepResearchPaper = LiteratureResult & {
  relevanceScore: number;
  relevanceTag: DeepResearchRelevanceTag;
  reasoning: string;
  sourceLabel: string;
};

export type DeepResearchSection = {
  title: string;
  body: string;
  supportingPaperIds: string[];
};

export type DeepResearchResult = {
  query: string;
  refinedQuery: string;
  model: string;
  totalCandidatePapers: number;
  searchQueries: string[];
  searchSummary: string;
  tldr: string;
  sections: DeepResearchSection[];
  papers: DeepResearchPaper[];
  relatedQuestions: string[];
};

export type ClaimSuggestion = {
  claim: string;
  recommendedSearch: string;
  papers: LiteratureResult[];
};

export type BillingSnapshot = {
  plan: SubscriptionPlan;
  paystackCustomerCode?: string | null;
  paystackSubscriptionCode?: string | null;
  paystackPlanCode?: string | null;
  paystackReference?: string | null;
  paystackEmailToken?: string | null;
  subscriptionStatus?: string | null;
  uploadCount: number;
  uploadLimit: number | null;
  questionLimit: number | null;
};
