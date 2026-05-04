import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchShell } from "@/components/research-shell";
import { workspaceHref } from "@/lib/app-navigation";
import { seoPages } from "@/lib/seo-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getPageBySlug(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}

function getRelatedPages(currentSlug: string) {
  return seoPages.filter((page) => page.slug !== currentSlug).slice(0, 4);
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

export default async function SeoPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const relatedPages = getRelatedPages(page.slug);

  return (
    <ResearchShell
      activeHref={`/${page.slug}`}
      accentLabel={page.accentLabel}
      heading={page.h1}
      subheading={page.intro}
      promptPlaceholder={page.promptPlaceholder}
      footerCopy={page.description}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.8rem] border border-[#dfd7ce] bg-white/86 p-5 shadow-[0_16px_32px_rgba(149,124,91,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a06d38]">
            Capability
          </p>
          <p className="mt-3 text-xl font-semibold text-[#16120f]">
            {page.capability}
          </p>
        </article>
        <article className="rounded-[1.8rem] border border-[#dfd7ce] bg-white/86 p-5 shadow-[0_16px_32px_rgba(149,124,91,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a06d38]">
            Outcome
          </p>
          <p className="mt-3 text-xl font-semibold text-[#16120f]">
            Faster research execution
          </p>
        </article>
        <article className="rounded-[1.8rem] border border-[#dfd7ce] bg-white/86 p-5 shadow-[0_16px_32px_rgba(149,124,91,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a06d38]">
            Route
          </p>
          <p className="mt-3 truncate font-mono text-sm text-[#5f554d]">
            /{page.slug}
          </p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[2rem] border border-[#dfd7ce] bg-white/88 p-6 shadow-[0_16px_32px_rgba(149,124,91,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a06d38]">
            How it works
          </p>
          <ol className="mt-5 space-y-4">
            {page.workflow.map((step) => (
              <li
                key={step}
                className="rounded-[1.4rem] bg-[#f8f4ef] px-4 py-4 text-[#302925]"
              >
                {step}
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-[2rem] border border-[#dfd7ce] bg-white/88 p-6 shadow-[0_16px_32px_rgba(149,124,91,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a06d38]">
            What you can generate
          </p>
          <ul className="mt-5 space-y-3 text-[#332c27]">
            {page.outputs.map((output) => (
              <li
                key={output}
                className="rounded-[1.4rem] bg-[#f8f4ef] px-4 py-4"
              >
                {output}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-[2rem] border border-[#dfd7ce] bg-white/88 p-6 shadow-[0_16px_32px_rgba(149,124,91,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a06d38]">
            Example use case
          </p>
          <p className="mt-5 text-lg leading-8 text-[#433a33]">
            {page.exampleUseCase}
          </p>
        </article>

        <article className="rounded-[2rem] border border-[#dfd7ce] bg-white/88 p-6 shadow-[0_16px_32px_rgba(149,124,91,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a06d38]">
            FAQ
          </p>
          <div className="mt-5 space-y-4">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-[1.4rem] bg-[#f8f4ef] px-4 py-4">
                <h2 className="font-semibold text-[#181410]">{faq.question}</h2>
                <p className="mt-2 text-[#5f554d]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-4 rounded-[2rem] border border-[#dfd7ce] bg-white/88 p-6 shadow-[0_16px_32px_rgba(149,124,91,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a06d38]">
              Related pages
            </p>
            <p className="mt-2 text-[#64584f]">
              Explore adjacent workflows without leaving the new workspace layout.
            </p>
          </div>
          <a
            href={workspaceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-[#ff6408] px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Open full workspace
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {relatedPages.map((related) => (
            <Link
              key={related.slug}
              href={`/${related.slug}`}
              className="rounded-[1.5rem] border border-[#e6ddd4] bg-[#faf7f2] p-5 transition-transform hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9d6a36]">
                {related.accentLabel}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#16120f]">
                {related.h1}
              </h2>
              <p className="mt-3 leading-7 text-[#64584f]">{related.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </ResearchShell>
  );
}
