import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { seoPages } from "@/lib/seo-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const creationSteps = [
  "Upload your source material",
  "Let ExamForge structure your content",
  "Generate questions, answers, and timed practice",
];

const outputs = [
  "Multiple choice questions",
  "Short answer questions",
  "Mock exams",
  "Answer keys",
];

function getPageBySlug(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}

export async function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found | ExamForge",
    };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function LandingPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const sourceLabel = page.inputType || page.subject || "study material";

  return (
    <main className="min-h-screen overflow-hidden bg-[#070913] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(129,140,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.08)_1px,transparent_1px)] [background-size:96px_96px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-6 sm:px-10 lg:px-12">
        <header className="sticky top-4 z-20 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 text-sm font-bold shadow-[0_0_30px_rgba(99,102,241,0.45)]">
                EF
              </span>
              <span className="text-xl font-semibold tracking-tight">
                ExamForge
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <a href="#how-it-works" className="hover:text-white">
                How it works
              </a>
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
            </nav>

            <a
              href="https://examforge.academy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-18px_rgba(99,102,241,0.85)] transition-transform hover:-translate-y-0.5"
            >
              Get started
            </a>
          </div>
        </header>

        <section className="grid flex-1 gap-8 pb-10 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-violet-200 backdrop-blur">
              {page.pageType} page
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-tight sm:text-6xl lg:text-7xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
              {page.intro}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://examforge.academy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-[0_20px_50px_-20px_rgba(99,102,241,0.88)] transition-transform hover:-translate-y-0.5"
              >
                Start generating your exam
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white/90 backdrop-blur transition-colors hover:bg-white/10"
              >
                Back to home
              </Link>
            </div>

            <p className="mt-5 text-sm text-white/40">
              Built for faster revision, timed practice, and cleaner exam prep.
            </p>
          </div>

          <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_30px_80px_-35px_rgba(79,70,229,0.65)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Overview
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              Turn {sourceLabel} into exam-ready material
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              {page.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {outputs.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-[#111526] px-4 py-4 text-sm text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section
          id="how-it-works"
          className="grid gap-5 border-t border-white/10 pt-10 md:grid-cols-3"
        >
          {creationSteps.map((step, index) => (
            <article
              key={step}
              className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl"
            >
              <span className="text-sm font-semibold text-violet-300">
                0{index + 1}
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-white">{step}</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                ExamForge keeps the workflow short so you can go from raw
                material to revision-ready output without manual formatting.
              </p>
            </article>
          ))}
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/6 p-7 backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">
              Example use case
            </p>
            <p className="mt-5 text-lg leading-8 text-white/70">
              Upload your {sourceLabel} and get a ready-to-use set of questions
              for revision, classroom practice, and mock exam preparation.
            </p>
          </article>

          <article
            id="faq"
            className="rounded-[2rem] border border-white/10 bg-[#0f1220]/90 p-7 shadow-[0_28px_80px_-40px_rgba(79,70,229,0.65)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              FAQ
            </p>
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white">
                  Does ExamForge generate answers too?
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Yes. ExamForge generates answers and structured practice
                  material alongside the questions.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white">
                  Can I create a mock exam?
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Yes. You can turn your study material into a timed mock exam
                  for focused practice.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
