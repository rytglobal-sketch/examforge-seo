import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { requireSession } from "@/lib/auth/dal";
import type { LiteratureProvider } from "@/lib/db/types";
import { searchLiterature, suggestPapersForClaim } from "@/lib/research/literature";

export const metadata: Metadata = {
  title: "Search",
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function normalizeProvider(value: string): LiteratureProvider {
  if (value === "semantic-scholar" || value === "crossref") {
    return value;
  }
  return "openalex";
}

function ResultCard({
  title,
  authors,
  year,
  venue,
  abstract,
  url,
  relevanceNote,
}: {
  title: string;
  authors: string[];
  year: string;
  venue: string;
  abstract: string;
  url: string;
  relevanceNote: string;
}) {
  return (
    <article className="rounded-[1.6rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8798]">
        <span>{year}</span>
        <span>&middot;</span>
        <span>{venue}</span>
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#111727]">
        {title}
      </h3>
      <p className="mt-2 text-sm text-[#556277]">{authors.join(", ")}</p>
      <p className="mt-4 text-sm leading-7 text-[#455066]">{abstract}</p>
      <p className="mt-4 rounded-2xl bg-[#f8fbff] px-4 py-3 text-sm leading-7 text-[#4f5d73]">
        {relevanceNote}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center rounded-full bg-[#111727] px-4 py-2 text-sm font-semibold text-white"
      >
        Open paper
      </a>
    </article>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const query = getParam(params, "query");
  const claim = getParam(params, "claim");
  const provider = normalizeProvider(getParam(params, "provider"));

  const [results, claimSuggestion] = await Promise.all([
    query ? searchLiterature(query, provider) : Promise.resolve([]),
    claim ? suggestPapersForClaim(claim, provider) : Promise.resolve(null),
  ]);

  return (
    <WorkspaceShell user={session} activePath="/search">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
              Literature search
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
              Find papers and citation leads
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6d7686]">
              Use OpenAlex, Semantic Scholar, or Crossref to find relevant papers
              for a topic, question, or citation need.
            </p>

            <form className="mt-5 space-y-4">
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="e.g. lithium enrichment in acid mine drainage"
                className="w-full rounded-[1.4rem] border border-[#dce4f2] bg-[#f8fbff] px-4 py-4 text-sm text-[#111727] outline-none placeholder:text-[#8a95a8]"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  name="provider"
                  defaultValue={provider}
                  className="rounded-2xl border border-[#dce4f2] bg-white px-4 py-3 text-sm text-[#111727]"
                >
                  <option value="openalex">OpenAlex</option>
                  <option value="semantic-scholar">Semantic Scholar</option>
                  <option value="crossref">Crossref</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#1f6fff] px-5 py-3 text-sm font-semibold text-white"
                >
                  Search papers
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="rounded-[1.6rem] border border-dashed border-[#cfdae9] bg-[#f8fbff] px-5 py-6 text-sm leading-7 text-[#556277]">
                Search results will appear here once you run a literature query.
              </div>
            ) : (
              results.map((result) => <ResultCard key={result.id} {...result} />)
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
              Citation helper
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
              Turn a claim into papers you can cite
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#6d7686]">
              Type a claim from your draft and ResearchForge suggests a tighter
              search query plus candidate papers to review before you cite them.
            </p>

            <form className="mt-5 space-y-4">
              <textarea
                name="claim"
                defaultValue={claim}
                placeholder="e.g. Lithium can concentrate in mine drainage treatment sludges and may become a recovery target."
                className="min-h-[180px] w-full rounded-[1.4rem] border border-[#dce4f2] bg-[#f8fbff] px-4 py-4 text-sm leading-7 text-[#111727] outline-none placeholder:text-[#8a95a8]"
              />
              <input type="hidden" name="provider" value={provider} />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-[#111727] px-5 py-3 text-sm font-semibold text-white"
              >
                Suggest citations
              </button>
            </form>
          </div>

          {claimSuggestion ? (
            <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#111727]">
                Suggested search
              </h3>
              <p className="mt-3 rounded-[1.3rem] bg-[#f8fbff] px-4 py-3 text-sm leading-7 text-[#455066]">
                {claimSuggestion.recommendedSearch}
              </p>

              <div className="mt-5 space-y-4">
                {claimSuggestion.papers.map((paper) => (
                  <ResultCard key={paper.id} {...paper} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-[#cfdae9] bg-[#f8fbff] px-5 py-6 text-sm leading-7 text-[#556277]">
              Citation suggestions will appear here after you submit a claim.
            </div>
          )}
        </div>
      </section>
    </WorkspaceShell>
  );
}
