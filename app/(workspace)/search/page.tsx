import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { getWorkspaceViewer } from "@/lib/auth/dal";
import type { LiteratureProvider } from "@/lib/db/types";
import { searchLiterature, suggestPapersForClaim } from "@/lib/research/literature";

export const metadata: Metadata = {
  title: "Citations",
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
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8798]">
            <span>{year}</span>
            <span>&middot;</span>
            <span>{venue}</span>
          </div>
          <h3 className="mt-3 max-w-[60rem] text-[1.65rem] font-semibold tracking-[-0.04em] text-[#111727]">
            {title}
          </h3>
          <p className="mt-2 text-sm text-[#556277]">{authors.join(", ")}</p>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#111727] px-4 py-2 text-sm font-semibold text-white"
        >
          Open paper
        </a>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
        <p className="text-sm leading-7 text-[#455066]">{abstract}</p>
        <p className="rounded-2xl bg-[#f8fbff] px-4 py-3 text-sm leading-7 text-[#4f5d73]">
          {relevanceNote}
        </p>
      </div>
    </article>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getWorkspaceViewer();
  const params = await searchParams;
  const query = getParam(params, "query");
  const claim = getParam(params, "claim");
  const provider = normalizeProvider(getParam(params, "provider"));
  const claimSuggestion = claim ? await suggestPapersForClaim(claim, provider) : null;
  const activeQuery = claimSuggestion?.recommendedSearch ?? query;
  const results = claimSuggestion
    ? claimSuggestion.papers
    : query
      ? await searchLiterature(query, provider)
      : [];

  return (
    <WorkspaceShell user={session} activePath="/search">
      <section className="space-y-6">
        <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
            Citations
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
            Find papers you can cite
          </h2>
          <p className="mt-3 max-w-[48rem] text-sm leading-7 text-[#6d7686]">
            Search by topic when you need sources, or paste a claim when you need
            citation support for something you wrote.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
              Search by topic
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
              Find supporting papers
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#6d7686]">
              Use OpenAlex, Semantic Scholar, or Crossref to find papers related to a
              topic, method, or research question.
            </p>

            <form className="mt-5 space-y-4">
              <input
                type="text"
                name="query"
                defaultValue={activeQuery}
                placeholder="e.g. supervisor feedback and thesis completion"
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
                  Find papers
                </button>
              </div>
            </form>

            {claimSuggestion ? (
              <div className="mt-4 rounded-[1.3rem] border border-[#dce4f2] bg-[#f8fbff] px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8798]">
                  Suggested from your claim
                </div>
                <p className="mt-2 text-sm leading-7 text-[#455066]">
                  {claimSuggestion.recommendedSearch}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
              Search by claim
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
              Match a sentence to possible citations
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#6d7686]">
              Paste a claim from your draft and ResearchForge will suggest a tighter
              search query plus papers you can inspect before you cite them.
            </p>

            <form className="mt-5 space-y-4">
              <textarea
                name="claim"
                defaultValue={claim}
                placeholder="e.g. Structured note-taking improves source synthesis during thesis writing."
                className="min-h-[180px] w-full rounded-[1.4rem] border border-[#dce4f2] bg-[#f8fbff] px-4 py-4 text-sm leading-7 text-[#111727] outline-none placeholder:text-[#8a95a8]"
              />
              <input type="hidden" name="provider" value={provider} />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-[#111727] px-5 py-3 text-sm font-semibold text-white"
              >
                Find citation matches
              </button>
            </form>

            {claimSuggestion ? (
              <div className="mt-4 rounded-[1.3rem] border border-[#dce4f2] bg-[#f8fbff] px-4 py-3 text-sm leading-7 text-[#455066]">
                The claim helper has turned your sentence into a tighter search and loaded
                the matching papers on the left and below.
              </div>
            ) : null}
          </div>
        </div>

        {results.length > 0 ? (
          <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
              {claimSuggestion ? "Claim results" : "Topic results"}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
              {claimSuggestion
                ? "Matching papers for your claim"
                : "Papers related to your topic"}
            </h3>
            {activeQuery ? (
              <p className="mt-3 rounded-[1.3rem] bg-[#f8fbff] px-4 py-3 text-sm leading-7 text-[#455066]">
                {activeQuery}
              </p>
            ) : null}
            <div className="mt-5 space-y-4">
              {results.map((result) => (
                <ResultCard key={result.id} {...result} />
              ))}
            </div>
          </div>
        ) : claim ? (
          <div className="rounded-[1.6rem] border border-dashed border-[#cfdae9] bg-[#f8fbff] px-5 py-6 text-sm leading-7 text-[#556277]">
            No citation matches were returned for that claim yet. Try simplifying the
            sentence or focusing on one idea at a time.
          </div>
        ) : query ? (
          <div className="rounded-[1.6rem] border border-dashed border-[#cfdae9] bg-[#f8fbff] px-5 py-6 text-sm leading-7 text-[#556277]">
            No topic-based results were returned for that search yet. Try a shorter
            topic, a different provider, or a more specific method or keyword.
          </div>
        ) : null}
      </section>
    </WorkspaceShell>
  );
}
