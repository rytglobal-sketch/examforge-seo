import Link from "next/link";
import type { Metadata } from "next";
import { ResearchForgeLogo } from "@/components/app-shell/logo";
import { ResearchComposer } from "@/components/research-composer";

export const metadata: Metadata = {
  title: "ResearchForge",
  description:
    "AI research assistant for thesis students to find research gaps, summarize papers, and organize thesis sources faster.",
};

const featureCards = [
  {
    title: "Chat with academic PDFs",
    description:
      "Upload papers, extract page text, build embeddings, and answer only from retrieved PDF chunks.",
  },
  {
    title: "Automatic paper summaries",
    description:
      "Generate simple summaries, key findings, methodology, limitations, definitions, and possible exam questions.",
  },
  {
    title: "Find research gaps faster",
    description:
      "Search OpenAlex, Semantic Scholar, or Crossref to compare papers, spot open questions, and strengthen your thesis direction.",
  },
  {
    title: "Organize thesis sources",
    description:
      "Keep notes per document, track key sources in one workspace, and move from scattered files to a cleaner thesis workflow.",
  },
];

const trustRules = [
  "Never hallucinate. If the answer is not in the PDF, ResearchForge says so.",
  "Every grounded answer includes page citations.",
  "Dense academic language is rewritten in simpler terms for thesis students.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#eef4ff_100%)] text-[#101522]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-[#dce4f2] bg-white/85 px-5 py-5 shadow-[0_24px_50px_rgba(16,21,34,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <ResearchForgeLogo />

          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-2xl border border-[#dce4f2] bg-white px-4 py-3 text-sm font-semibold text-[#111727]"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-2xl bg-[#1f6fff] px-4 py-3 text-sm font-semibold text-white"
            >
              Start free
            </Link>
          </div>
        </header>

        <section className="grid gap-10 pb-12 pt-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:items-center lg:pt-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1f6fff]">
              For thesis students
            </p>
            <h1 className="mt-4 max-w-[11ch] text-5xl font-semibold tracking-[-0.08em] text-[#101522] sm:text-6xl">
              Find research gaps and move through your sources faster.
            </h1>
            <p className="mt-6 max-w-[38rem] text-lg leading-8 text-[#57637a]">
              ResearchForge helps thesis students summarize papers, find research
              gaps, and organize thesis sources faster. Upload academic PDFs,
              chat only from retrieved document context, search the literature,
              and keep citation-backed notes in one clean dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-2xl bg-[#111727] px-5 py-3 text-sm font-semibold text-white"
              >
                Create workspace
              </Link>
              <Link
                href="/documents"
                className="inline-flex items-center justify-center rounded-2xl border border-[#dce4f2] bg-white px-5 py-3 text-sm font-semibold text-[#111727]"
              >
                View product
              </Link>
            </div>

            <ul className="mt-8 space-y-3">
              {trustRules.map((rule) => (
                <li key={rule} className="flex gap-3 text-sm leading-7 text-[#4d5b71]">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#1f6fff]" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-[#dce4f2] bg-white p-5 shadow-[0_28px_70px_rgba(16,21,34,0.08)]">
            <div className="rounded-[1.8rem] bg-[#f8fbff] p-4">
              <div className="rounded-[1.4rem] border border-[#dce4f2] bg-white p-4">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
                  Prompt preview
                </p>
                <div className="mt-3">
                  <ResearchComposer placeholder="Ask a question about an uploaded paper, request a summary, or search the literature..." />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-[#dce4f2] bg-white p-4">
                  <div className="text-sm font-semibold text-[#111727]">
                    PDF chat output
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#566176]">
                    &ldquo;The paper links lithium release to acidic dissolution of
                    Li-bearing minerals and transport through mine waters. See pages
                    1 and 4.&rdquo;
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#1f6fff]">
                      Page 1
                    </span>
                    <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#1f6fff]">
                      Page 4
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[#dce4f2] bg-white p-4">
                  <div className="text-sm font-semibold text-[#111727]">
                    Summary blocks
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[#566176]">
                    <li>Simple summary</li>
                    <li>Key findings</li>
                    <li>Methodology + limitations</li>
                    <li>Definitions + exam questions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[1.7rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]"
              >
                <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#111727]">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#57637a]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
