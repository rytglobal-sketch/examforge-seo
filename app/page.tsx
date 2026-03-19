import Link from "next/link";
import type { Metadata } from "next";
import { seoPages } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "ExamForge | AI Exam Generator",
  description:
    "Generate exam questions, answer keys, and mock exams from PDFs, notes, and study material with ExamForge.",
};

const highlights = [
  "Turn PDFs and notes into exam-ready questions",
  "Create answer keys and mock exams in minutes",
  "Publish SEO landing pages for high-intent study searches",
];

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fff7ed_24%,#fffdf8_58%,#ffffff_100%)] text-slate-950">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,rgba(249,115,22,0.18),rgba(245,158,11,0.08),transparent)]" />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-medium tracking-[0.18em] text-orange-700 uppercase shadow-sm">
              ExamForge SEO Site
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Launch exam-generation pages that feel like a product, not a
              placeholder.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              ExamForge helps students and educators turn study material into
              practice questions, answer keys, and mock exams. This homepage is
              now wired to your SEO route inventory instead of the default
              Next.js starter.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://examforge.academy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Start generating your exam
              </a>
              <Link
                href={`/${seoPages[0]?.slug ?? ""}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-950"
              >
                View sample SEO page
              </Link>
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/80 bg-white/70 px-4 py-4 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.4)] backdrop-blur"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-slate-950 p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.55)]">
            <p className="text-sm font-medium tracking-[0.2em] text-orange-300 uppercase">
              Active SEO Pages
            </p>
            <div className="mt-6 space-y-4">
              {seoPages.map((page, index) => (
                <div
                  key={page.slug}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-300">
                      Page {String(index + 1).padStart(2, "0")}
                    </p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-orange-200">
                      /{page.slug}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold">{page.h1}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {page.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {seoPages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] transition-transform hover:-translate-y-1"
            >
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-orange-600">
                {page.pageType}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {page.h1}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {page.intro}
              </p>
              <span className="mt-6 inline-flex text-sm font-semibold text-slate-950">
                Open page
              </span>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
