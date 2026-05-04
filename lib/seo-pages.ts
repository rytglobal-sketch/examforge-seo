export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  accentLabel: string;
  capability: string;
  promptPlaceholder: string;
  workflow: string[];
  outputs: string[];
  exampleUseCase: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export const seoPages: SeoPage[] = [
  {
    slug: "agent-gallery",
    title: "Agent Gallery",
    description:
      "Browse specialized AI research agents for search, synthesis, drafting, extraction, and evidence-backed writing.",
    h1: "Agent Gallery for Research Workflows",
    intro:
      "Launch focused agents for search, summarization, academic drafting, citation work, and evidence synthesis from one workspace.",
    accentLabel: "Agent workflows",
    capability: "Specialized research agents",
    promptPlaceholder:
      "Ask for the right agent to help with search, synthesis, drafting, or citation-heavy research work...",
    workflow: [
      "Choose an agent tuned for search, writing, summarization, or extraction.",
      "Describe your topic, paper set, or research question in plain language.",
      "Compare outputs and move the best result into your notes, review, or bibliography.",
    ],
    outputs: [
      "Paper shortlists",
      "Evidence summaries",
      "Draft sections",
      "Reference-ready notes",
    ],
    exampleUseCase:
      "A graduate student can start with a literature-review agent to cluster studies, then switch to an AI writing agent to draft a related-work section.",
    faqs: [
      {
        question: "Can I use different agents for the same project?",
        answer:
          "Yes. The workspace is designed so you can move from search to synthesis to writing without restarting your context.",
      },
      {
        question: "Do agents only work with keywords?",
        answer:
          "No. Agents can work from natural-language goals and semantic context, which makes paper discovery more relevant.",
      },
    ],
  },
  {
    slug: "ai-writer",
    title: "AI Writer",
    description:
      "Draft faster with an academic AI writer that helps outline arguments, clarify ideas, and keep evidence connected to your source material.",
    h1: "Write Faster with an Academic AI Writer",
    intro:
      "Turn rough ideas into polished academic prose, structured outlines, and cleaner explanations without losing the meaning of your sources.",
    accentLabel: "Writing copilot",
    capability: "Academic drafting and rewriting",
    promptPlaceholder:
      "Draft an introduction, improve a methods section, or rewrite dense academic language into a clearer version...",
    workflow: [
      "Start with your topic, notes, or research question.",
      "Ask the writer to generate outlines, transitions, or paragraph-level revisions.",
      "Refine the response with source-backed edits before exporting it into your paper.",
    ],
    outputs: [
      "Abstract drafts",
      "Related-work outlines",
      "Methods rewrites",
      "Clearer academic prose",
    ],
    exampleUseCase:
      "A researcher working on a deadline can turn scattered reading notes into a structured literature-review draft in a fraction of the usual time.",
    faqs: [
      {
        question: "Can the writer simplify complex research language?",
        answer:
          "Yes. It can break dense academic wording into clearer explanations while preserving the original concept.",
      },
      {
        question: "Can it help with section structure?",
        answer:
          "Yes. It can generate outlines, headings, transitions, and first drafts for common academic sections.",
      },
    ],
  },
  {
    slug: "chat-with-pdf",
    title: "Chat with PDF",
    description:
      "Ask questions directly against PDFs to uncover key findings, methods, definitions, and evidence without reading every page manually.",
    h1: "Chat with PDFs Using Natural Language",
    intro:
      "Move through long papers faster by asking direct questions, extracting evidence, and summarizing sections from the document itself.",
    accentLabel: "Document chat",
    capability: "PDF understanding and extraction",
    promptPlaceholder:
      "Ask what the paper argues, where the methodology is explained, or which findings support your claim...",
    workflow: [
      "Upload a paper, chapter, report, or supporting appendix.",
      "Ask targeted questions about methods, results, definitions, or claims.",
      "Use the extracted evidence to support writing, review, or comparison tasks.",
    ],
    outputs: [
      "Section summaries",
      "Quoted findings",
      "Methods breakdowns",
      "Fast evidence lookup",
    ],
    exampleUseCase:
      "Instead of manually searching a 40-page article, a user can ask for the main findings, sample size, and limitations in one conversation.",
    faqs: [
      {
        question: "Can I ask follow-up questions on the same PDF?",
        answer:
          "Yes. The chat flow is designed for iterative questioning, so you can dig deeper into the same document.",
      },
      {
        question: "Is it useful for dense technical material?",
        answer:
          "Yes. It helps surface relevant sections quickly and can simplify dense language when you need a clearer explanation.",
      },
    ],
  },
  {
    slug: "literature-review",
    title: "Literature Review",
    description:
      "Automate the slowest parts of literature reviews by finding relevant studies, pulling key insights, and organizing themes faster.",
    h1: "Accelerate Literature Reviews with AI",
    intro:
      "Reduce hours of manual searching and summarizing by letting the platform surface relevant studies, cluster themes, and organize findings.",
    accentLabel: "Review automation",
    capability: "Literature review synthesis",
    promptPlaceholder:
      "Summarize the main themes in this topic, compare findings across studies, or identify research gaps...",
    workflow: [
      "Start with a research question or topic area.",
      "Let the platform gather relevant studies using contextual understanding rather than exact keyword matches.",
      "Group findings into themes, gaps, and reference-ready notes for a systematic review flow.",
    ],
    outputs: [
      "Thematic clusters",
      "Study comparisons",
      "Research gaps",
      "Reference-organized notes",
    ],
    exampleUseCase:
      "A PhD candidate can input a review topic and quickly get a curated base of studies, a theme map, and a starting summary for the review chapter.",
    faqs: [
      {
        question: "Does it help organize findings across papers?",
        answer:
          "Yes. It can group findings by theme, methodology, outcome, or relevance to your research question.",
      },
      {
        question: "Can it save time on early-stage reviews?",
        answer:
          "Yes. It is especially useful at the stage where researchers usually spend hours finding and summarizing relevant papers manually.",
      },
    ],
  },
  {
    slug: "find-topics",
    title: "Find Topics",
    description:
      "Use semantic search to find relevant papers and discover research directions based on meaning, context, and intent.",
    h1: "Find Topics with Semantic Search",
    intro:
      "Search for ideas, not just phrases. Semantic search helps you discover papers based on contextual understanding rather than exact keywords alone.",
    accentLabel: "Semantic search",
    capability: "Context-aware paper discovery",
    promptPlaceholder:
      "Find studies related to my topic, surface adjacent research directions, or search beyond exact keyword matches...",
    workflow: [
      "Enter a research question, concept, or problem statement.",
      "The system interprets meaning and returns studies aligned with the context of your query.",
      "Review the curated results, then branch into literature review, PDF chat, or citation work.",
    ],
    outputs: [
      "Curated paper lists",
      "Adjacent topic suggestions",
      "Contextual search results",
      "Higher-relevance discovery",
    ],
    exampleUseCase:
      "A user researching trust in AI systems can surface papers on interpretability, transparency, and human oversight even when those exact words are not in the original query.",
    faqs: [
      {
        question: "How is this different from keyword search?",
        answer:
          "Semantic search uses contextual understanding, so it can return relevant studies even when the exact wording differs from your query.",
      },
      {
        question: "Can I search with a full research question?",
        answer:
          "Yes. Natural-language questions often work well because the search system is built to understand intent and meaning.",
      },
    ],
  },
  {
    slug: "paraphraser",
    title: "Paraphraser",
    description:
      "Paraphrase academic text into clearer, more readable language while keeping the core idea intact.",
    h1: "Paraphrase Dense Academic Language",
    intro:
      "Make complicated passages easier to understand, rewrite, and reuse in your notes without flattening the meaning behind the research.",
    accentLabel: "Clarity tools",
    capability: "Academic paraphrasing",
    promptPlaceholder:
      "Rewrite this paragraph more clearly, simplify this explanation, or preserve the meaning while improving readability...",
    workflow: [
      "Paste a difficult paragraph, explanation, or section from your notes.",
      "Ask for a clearer, shorter, or more academically polished version.",
      "Use the paraphrased output to improve comprehension, note-taking, or drafting.",
    ],
    outputs: [
      "Simplified explanations",
      "Clearer note versions",
      "Polished rewrites",
      "Readability improvements",
    ],
    exampleUseCase:
      "A student reading a technical methods section can paraphrase it into plain language before translating it into a discussion or summary paragraph.",
    faqs: [
      {
        question: "Will paraphrasing remove important detail?",
        answer:
          "The goal is to preserve the core meaning while making the language easier to understand and use.",
      },
      {
        question: "Can it help me understand difficult concepts?",
        answer:
          "Yes. Many users rely on paraphrasing to break down dense academic language into more digestible terms.",
      },
    ],
  },
  {
    slug: "citation-generator",
    title: "Citation Generator",
    description:
      "Generate citations and manage references more efficiently while keeping supporting sources close to your writing workflow.",
    h1: "Generate Citations and Manage References",
    intro:
      "Spend less time formatting references and more time writing by letting the platform organize source details and citation-ready outputs.",
    accentLabel: "Citation tools",
    capability: "Citation management",
    promptPlaceholder:
      "Create citations, organize source metadata, or help me keep references aligned with my draft...",
    workflow: [
      "Collect source details from articles, PDFs, and search results.",
      "Generate citation-ready reference information as you write.",
      "Keep supporting sources organized so your literature review stays systematic.",
    ],
    outputs: [
      "Citation-ready entries",
      "Reference organization",
      "Source metadata cleanup",
      "Faster academic formatting",
    ],
    exampleUseCase:
      "A researcher preparing a review article can store relevant studies, generate clean references, and keep writing linked to the right supporting sources.",
    faqs: [
      {
        question: "Can it help with citation-heavy writing?",
        answer:
          "Yes. It is built to keep relevant sources close to the writing process so citations are easier to manage.",
      },
      {
        question: "Does it also support reference organization?",
        answer:
          "Yes. The platform helps users categorize findings and manage references in a more systematic workflow.",
      },
    ],
  },
  {
    slug: "extract-data",
    title: "Extract Data",
    description:
      "Pull key data points, findings, definitions, and methodological details out of research papers quickly.",
    h1: "Extract Key Data from Research Papers",
    intro:
      "Stop hunting through PDFs line by line. Extract the information you need and move it straight into your analysis, notes, or review matrix.",
    accentLabel: "Structured extraction",
    capability: "Research data extraction",
    promptPlaceholder:
      "Extract the sample size, methods, variables, findings, or limitations from these papers...",
    workflow: [
      "Upload a paper or open a saved source from your workspace.",
      "Ask for the exact fields you need, such as findings, methods, limitations, or variables.",
      "Use the extracted data to compare studies or populate a review table more quickly.",
    ],
    outputs: [
      "Methods summaries",
      "Findings tables",
      "Limitations lists",
      "Comparison-ready notes",
    ],
    exampleUseCase:
      "A systematic-review team can extract comparable study details from multiple papers and move them into a shared evidence table much faster.",
    faqs: [
      {
        question: "Can it help me compare papers side by side?",
        answer:
          "Yes. Structured extraction makes it easier to compare methods, findings, variables, and limitations across studies.",
      },
      {
        question: "Is it only for quantitative data?",
        answer:
          "No. It can also pull conceptual definitions, claims, themes, and qualitative insights from papers.",
      },
    ],
  },
  {
    slug: "ai-detector",
    title: "AI Detector",
    description:
      "Review writing for tone, originality signals, and revision opportunities before sharing academic work.",
    h1: "Check Writing with an AI Detector Workflow",
    intro:
      "Use detection as a review step to inspect phrasing, improve natural tone, and decide where a draft needs more human revision.",
    accentLabel: "Review safeguards",
    capability: "AI-assisted writing checks",
    promptPlaceholder:
      "Review this passage for tone, originality concerns, and places that need stronger human revision...",
    workflow: [
      "Paste or upload the text you want to review.",
      "Inspect tone, phrasing patterns, and areas that may need refinement.",
      "Revise the draft so it reads more naturally and aligns better with your own academic voice.",
    ],
    outputs: [
      "Revision flags",
      "Tone checks",
      "Natural-language improvements",
      "Review-ready drafts",
    ],
    exampleUseCase:
      "A user can review a generated draft before submission and strengthen sections that feel generic, repetitive, or insufficiently grounded in the source material.",
    faqs: [
      {
        question: "Does this replace careful editing?",
        answer:
          "No. It is best used as a review aid that helps identify where your writing may need stronger human revision.",
      },
      {
        question: "Can I combine this with the paraphraser or writer?",
        answer:
          "Yes. Many users draft with the writer, refine with the paraphraser, and then run a final detector-style review pass.",
      },
    ],
  },
];
