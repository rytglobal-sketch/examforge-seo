import Link from "next/link";
import type { Metadata } from "next";
import { seoPages } from "@/lib/seo-pages";

export const metadata: Metadata = {
  title: "ExamForge | AI Exam Generator",
  description:
    "Generate exam questions, answer keys, and mock exams from PDFs, notes, and study material with ExamForge.",
};

const highlights = [
  "Structured exam questions from notes, slides, and PDFs",
  "Answer keys, mock exams, and timed practice in one flow",
  "Fast landing pages for high-intent course and study use cases",
];

const navItems = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pages", label: "Pages" },
];

export default function Home() {
  const samplePageHref = seoPages[0] ? `/${seoPages[0].slug}` : "/";

  return (
    <main className="min-h-screen overflow-hidden bg-[#070913] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.16),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(129,140,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.08)_1px,transparent_1px)] [background-size:88px_88px]" />

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
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="hover:text-white"
                >
                  {item.label}
                </a>
              ))}
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

        <section className="flex flex-1 flex-col items-center justify-center pb-12 pt-20 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
            <div className="flex -space-x-2">
              {["TK", "KS", "RL", "AN", "JP"].map((label, index) => (
                <span
                  key={label}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border border-[#070913] text-[10px] font-semibold ${
                    [
                      "bg-violet-500",
                      "bg-blue-500",
                      "bg-emerald-500",
                      "bg-orange-500",
                      "bg-pink-500",
                    ][index]
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
            <span>
              <strong className="text-white">4,933+</strong> students studying
              right now
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <h1 className="mt-10 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-tight sm:text-7xl lg:text-[6rem]">
            Your notes.
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              {" "}
              Exam-ready{" "}
            </span>
            in 30 seconds.
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-9 text-white/60 sm:text-2xl">
            Upload your lecture notes or slides. ExamForge generates structured
            exam questions, step-by-step solutions, and timed mock exams built
            from your exact course material.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="https://examforge.academy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[20rem] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-8 py-5 text-lg font-semibold text-white shadow-[0_22px_55px_-22px_rgba(99,102,241,0.9)] transition-transform hover:-translate-y-0.5"
            >
              Generate your first exam free
            </a>
            <Link
              href={samplePageHref}
              className="inline-flex min-w-[12rem] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 py-5 text-lg font-semibold text-white/90 backdrop-blur transition-colors hover:bg-white/10"
            >
              View sample page
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/40">
            No credit card required. Built for students, tutors, and educators.
          </p>
        </section>

        <section
          id="how-it-works"
          className="grid gap-5 border-t border-white/10 pt-12 md:grid-cols-3"
        >
          {highlights.map((item, index) => (
            <article
              key={item}
              className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl"
            >
              <span className="text-sm font-medium text-violet-300">
                0{index + 1}
              </span>
              <p className="mt-4 text-xl font-semibold tracking-tight text-white">
                {item}
              </p>
            </article>
          ))}
        </section>

        <section
          id="features"
          className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <article className="rounded-[2rem] border border-white/10 bg-white/6 p-8 backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">
              Why it works
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A product-style landing experience, backed by routes you can
              scale.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
              Each page can target a specific input type, subject, or student
              need while keeping the same premium ExamForge visual system.
            </p>
          </article>

          <article
            id="pages"
            className="rounded-[2rem] border border-white/10 bg-[#0f1220]/90 p-6 shadow-[0_30px_80px_-35px_rgba(79,70,229,0.6)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Active Pages
            </p>
            <div className="mt-5 space-y-4">
              {seoPages.map((page) => (
                <div
                  key={page.slug}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/45">
                      {page.pageType}
                    </p>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">
                      /{page.slug}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    {page.h1}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {page.description}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
