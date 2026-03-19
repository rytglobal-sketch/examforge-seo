export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  pageType: "file" | "output" | "subject" | "audience";
  inputType?: string;
  outputType?: string;
  subject?: string;
  audience?: string;
};

export const seoPages: SeoPage[] = [
  {
    slug: "generate-exam-questions-from-pdf",
    title: "Generate Exam Questions from PDF | ExamForge",
    description:
      "Upload your PDF and let ExamForge generate exam questions, answers, and mock exams from your study material.",
    h1: "Generate Exam Questions from PDF",
    intro:
      "Turn your PDF into structured exam questions, answer keys, and mock exams in minutes with ExamForge.",
    pageType: "file",
    inputType: "PDF",
    outputType: "exam questions",
  },
  {
    slug: "generate-exam-questions-from-notes",
    title: "Generate Exam Questions from Notes | ExamForge",
    description:
      "Upload your notes and let ExamForge generate exam questions, answers, and mock exams instantly.",
    h1: "Generate Exam Questions from Notes",
    intro:
      "Convert your study notes into practice questions and mock exams with ExamForge.",
    pageType: "file",
    inputType: "notes",
    outputType: "exam questions",
  },
  {
    slug: "biology-exam-question-generator",
    title: "Biology Exam Question Generator | ExamForge",
    description:
      "Turn your biology notes into practice questions, answers, and mock exams with ExamForge.",
    h1: "Biology Exam Question Generator",
    intro:
      "Create biology exam questions from lecture notes, slides, and study material.",
    pageType: "subject",
    subject: "Biology",
  },
];
