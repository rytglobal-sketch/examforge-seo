import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seoPages } from "@/lib/seo-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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

export default async function SeoPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-4">{page.h1}</h1>
      <p className="text-lg mb-8">{page.intro}</p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">How it works</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Upload your study material</li>
          <li>ExamForge analyzes the content</li>
          <li>Generate questions, answers, and mock exams</li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">What you can generate</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Multiple choice questions</li>
          <li>Short answer questions</li>
          <li>Mock exams</li>
          <li>Answer keys</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Example use case</h2>
        <p>
          Upload your {page.inputType || page.subject || "study material"} and
          get a ready-to-use set of questions for revision, practice, and exam
          prep.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">
              Does ExamForge generate answers too?
            </h3>
            <p>
              Yes, ExamForge generates answers and structured practice material.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Can I create a mock exam?</h3>
            <p>
              Yes, you can turn your study material into a mock exam for
              practice.
            </p>
          </div>
        </div>
      </section>

      <a
        href="https://examforge.academy"
        target="_blank"
        className="inline-block rounded-xl px-6 py-3 font-medium border"
      >
        Start generating your exam
      </a>
    </main>
  );
}
