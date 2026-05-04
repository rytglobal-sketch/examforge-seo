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
    "Lithium in acid mine drainage appears when acidic waters dissolve lithium-bearing minerals and carry the released lithium through mine-affected water systems. In simple terms, the paper argues that the source minerals, local chemistry, and mining context all shape how much lithium shows up in drainage.",
  keyFindings: [
    "Coal waste, metal sulfide mines, and pegmatite settings can all contribute lithium to acid mine drainage, but the concentrations differ by geology and treatment history.",
    "Lithium release is closely tied to acidic dissolution, oxidation, and water-rock interaction, especially where lithium sits in micas, clays, or accessory silicates.",
    "Some studies suggest lithium can become concentrated in treatment sludges or downstream precipitates, which may matter for monitoring and possible resource recovery.",
  ],
  methodology:
    "The paper combines literature synthesis with cross-study comparison of mine drainage chemistry, source minerals, and reported lithium concentrations across several mining environments.",
  limitations:
    "The reported occurrence data are uneven across mining regions, and many papers measure lithium only as a secondary analyte, so direct cross-study comparisons remain limited.",
  importantDefinitions: [
    {
      term: "Acid mine drainage (AMD)",
      meaning:
        "Acidic water formed when sulfide-rich mine wastes react with air and water, dissolving metals and other elements into runoff.",
    },
    {
      term: "Water-rock interaction",
      meaning:
        "Chemical reactions between water and minerals that can release or trap dissolved elements such as lithium.",
    },
  ],
  possibleExamQuestions: [
    "Explain two geochemical processes that can release lithium into acid mine drainage.",
    "Compare lithium occurrence in coal-related AMD and hard-rock lithium mining settings.",
    "Why do page-level citations matter when summarizing research papers for academic work?",
  ],
};

export const demoDocumentId = "demo-lithium-amd";

export const demoPages: DocumentPageRecord[] = [
  {
    id: "page-1",
    documentId: demoDocumentId,
    pageNumber: 1,
    tokenEstimate: 158,
    textContent:
      "Lithium in acid mine drainage is mobilized by acidic dissolution of Li-bearing minerals and transport through mine waters. The review compares coal mining wastes, metal sulfide districts, and pegmatite-hosted lithium deposits, highlighting how acidity, oxidation, and hydrologic pathways influence occurrence.",
  },
  {
    id: "page-2",
    documentId: demoDocumentId,
    pageNumber: 2,
    tokenEstimate: 172,
    textContent:
      "Coal-associated settings commonly report low to moderate dissolved lithium in waters, but enrichment may occur in sludge from acid mine drainage treatment and in coal combustion residuals. Lithium may be hosted in clays, organic matter, and accessory minerals that weather during drainage formation.",
  },
  {
    id: "page-3",
    documentId: demoDocumentId,
    pageNumber: 3,
    tokenEstimate: 165,
    textContent:
      "Metal sulfide districts can show detectable to locally high dissolved lithium where country rock weathering and acidic sulfate waters mobilize trace elements. Hard-rock lithium and pegmatite systems may produce strong local enrichment near weathering fronts, especially when spodumene- or mica-bearing rocks are exposed.",
  },
  {
    id: "page-4",
    documentId: demoDocumentId,
    pageNumber: 4,
    tokenEstimate: 188,
    textContent:
      "The review notes that reported concentrations cannot always be compared directly because analytical programs, mine histories, and treatment conditions differ. Even so, most studies agree that lithium behavior is controlled by mineral source, fluid acidity, and secondary precipitation or adsorption during transport and treatment.",
  },
];

export const demoChunks: DocumentChunkRecord[] = [
  {
    id: "chunk-1",
    documentId: demoDocumentId,
    pageNumber: 1,
    chunkIndex: 0,
    tokenEstimate: 90,
    metadata: { section: "overview" },
    content:
      "Lithium in acid mine drainage is mobilized by acidic dissolution of Li-bearing minerals and transport through mine waters. The review compares coal mining wastes, metal sulfide districts, and pegmatite-hosted lithium deposits.",
    score: 0.94,
  },
  {
    id: "chunk-2",
    documentId: demoDocumentId,
    pageNumber: 2,
    chunkIndex: 0,
    tokenEstimate: 96,
    metadata: { section: "coal-context" },
    content:
      "Coal-associated settings commonly report low to moderate dissolved lithium in waters, but enrichment may occur in sludge from acid mine drainage treatment and in coal combustion residuals.",
    score: 0.87,
  },
  {
    id: "chunk-3",
    documentId: demoDocumentId,
    pageNumber: 3,
    chunkIndex: 0,
    tokenEstimate: 101,
    metadata: { section: "hard-rock-context" },
    content:
      "Metal sulfide districts can show detectable to locally high dissolved lithium where country rock weathering and acidic sulfate waters mobilize trace elements. Hard-rock lithium and pegmatite systems may produce strong local enrichment near weathering fronts.",
    score: 0.83,
  },
  {
    id: "chunk-4",
    documentId: demoDocumentId,
    pageNumber: 4,
    chunkIndex: 0,
    tokenEstimate: 109,
    metadata: { section: "limitations" },
    content:
      "Reported concentrations cannot always be compared directly because analytical programs, mine histories, and treatment conditions differ. Most studies agree that lithium behavior is controlled by mineral source, fluid acidity, and secondary precipitation or adsorption.",
    score: 0.78,
  },
];

export const demoMessages: ChatMessageRecord[] = [
  {
    id: "msg-1",
    documentId: demoDocumentId,
    userId: "demo-user",
    role: "user",
    content: "How does lithium get released into acid mine drainage?",
    citations: [1, 4],
    createdAt: new Date("2026-04-01T10:00:00Z").toISOString(),
  },
  {
    id: "msg-2",
    documentId: demoDocumentId,
    userId: "demo-user",
    role: "assistant",
    content:
      "The paper says lithium is released when acidic mine waters dissolve lithium-bearing minerals and then transport the dissolved lithium through the drainage system. It also notes that secondary precipitation and adsorption can change how much lithium stays in solution as the water moves. Pages 1 and 4 support that explanation.",
    citations: [1, 4],
    createdAt: new Date("2026-04-01T10:00:04Z").toISOString(),
  },
];

export const demoNote: DocumentNoteRecord = {
  id: "note-1",
  documentId: demoDocumentId,
  userId: "demo-user",
  body:
    "Track the contrast between coal-related AMD and pegmatite-hosted lithium settings. This note should later feed into an environmental impacts section.",
  createdAt: new Date("2026-04-01T10:15:00Z").toISOString(),
  updatedAt: new Date("2026-04-01T10:15:00Z").toISOString(),
};

export const demoDocument: DocumentListItem = {
  id: demoDocumentId,
  userId: "demo-user",
  title: "Lithium in Acid Mine Drainage",
  authors: ["V. D. Abramova", "P. Ziemkiewicz", "V. Balaram"],
  sourceFileName: "lithium_amd_insights.pdf",
  storagePath: "",
  mimeType: "application/pdf",
  pageCount: 4,
  status: "ready",
  createdAt: new Date("2026-04-01T09:55:00Z").toISOString(),
  updatedAt: new Date("2026-04-01T10:05:00Z").toISOString(),
  summary: demoSummary,
  excerpt:
    "Lithium release is linked to acidic dissolution, mine water transport, and differences between coal, sulfide, and pegmatite settings.",
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
    title: "Lithium enrichment and mobility in acid mine drainage systems",
    authors: ["A. Researcher", "B. Analyst"],
    year: "2024",
    venue: "Journal of Environmental Geochemistry",
    abstract:
      "A review of lithium occurrence, mobility, and partitioning in acidic mine waters with emphasis on coal and hard-rock systems.",
    url: "https://openalex.org/",
    doi: "10.1000/demo.1",
    citationCount: 32,
    provider: "openalex",
    relevanceNote:
      "Strong match for lithium occurrence, geochemical controls, and acid drainage context.",
  },
  {
    id: "semantic-demo-2",
    title: "Recovery prospects for lithium from mine-affected waters",
    authors: ["C. Engineer", "D. Hydrochemist"],
    year: "2023",
    venue: "Resources and Recovery Letters",
    abstract:
      "Discusses the possibility of recovering lithium from treatment solids, brines, and mine-influenced water streams.",
    url: "https://www.semanticscholar.org/",
    doi: "10.1000/demo.2",
    citationCount: 21,
    provider: "semantic-scholar",
    relevanceNote:
      "Useful when the user wants environmental recovery or treatment implications.",
  },
];

export const demoClaimSuggestion: ClaimSuggestion = {
  claim:
    "Lithium can become concentrated in treatment sludges formed during acid mine drainage remediation.",
  recommendedSearch:
    "lithium acid mine drainage treatment sludge recovery remediation",
  papers: demoSearchResults,
};

export const demoBilling: BillingSnapshot = {
  plan: "free",
  stripeCustomerId: null,
  subscriptionStatus: "inactive",
  priceId: null,
  uploadCount: 1,
  uploadLimit: 3,
  questionLimit: 25,
};
