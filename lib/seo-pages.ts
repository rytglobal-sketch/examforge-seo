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
    slug: "generate-exam-questions-from-slides",
    title: "Generate Exam Questions from Slides | ExamForge",
    description:
      "Upload your slides and let ExamForge generate exam questions, answers, and mock exams instantly.",
    h1: "Generate Exam Questions from Slides",
    intro:
      "Turn your lecture slides into practice questions and mock exams with ExamForge.",
    pageType: "file",
    inputType: "slides",
    outputType: "exam questions",
  },
  {
    slug: "generate-mcq-from-pdf",
    title: "Generate MCQ from PDF | ExamForge",
    description:
      "Upload your PDF and generate multiple choice questions instantly with ExamForge.",
    h1: "Generate MCQ from PDF",
    intro:
      "Turn your PDF into multiple choice questions for fast revision and exam prep.",
    pageType: "output",
    inputType: "PDF",
    outputType: "MCQ",
  },
  {
    slug: "generate-quiz-from-notes",
    title: "Generate Quiz from Notes | ExamForge",
    description:
      "Upload your notes and turn them into a quiz with answers using ExamForge.",
    h1: "Generate Quiz from Notes",
    intro:
      "Create quizzes from your notes for quick self-testing and revision.",
    pageType: "output",
    inputType: "notes",
    outputType: "quiz",
  },
  {
    slug: "generate-mock-exam-from-notes",
    title: "Generate Mock Exam from Notes | ExamForge",
    description:
      "Turn your notes into a mock exam with answers using ExamForge.",
    h1: "Generate Mock Exam from Notes",
    intro:
      "Build a realistic mock exam from your notes in minutes with ExamForge.",
    pageType: "output",
    inputType: "notes",
    outputType: "mock exam",
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
  {
    slug: "law-exam-question-generator",
    title: "Law Exam Question Generator | ExamForge",
    description:
      "Turn your law notes into practice questions, answers, and mock exams with ExamForge.",
    h1: "Law Exam Question Generator",
    intro:
      "Create law exam questions from case notes, lecture slides, and study material.",
    pageType: "subject",
    subject: "Law",
  },
  {
    slug: "accounting-exam-question-generator",
    title: "Accounting Exam Question Generator | ExamForge",
    description:
      "Turn your accounting notes into practice questions, answers, and mock exams with ExamForge.",
    h1: "Accounting Exam Question Generator",
    intro:
      "Create accounting exam questions from notes, slides, and class material.",
    pageType: "subject",
    subject: "Accounting",
  },
  {
    slug: "exam-question-generator-for-university-students",
    title: "Exam Question Generator for University Students | ExamForge",
    description:
      "Turn your university notes and slides into practice questions and mock exams with ExamForge.",
    h1: "Exam Question Generator for University Students",
    intro:
      "Use ExamForge to turn university study material into focused exam practice.",
    pageType: "audience",
    audience: "university students",
  },
];
