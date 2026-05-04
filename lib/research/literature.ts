import "server-only";
import type {
  ClaimSuggestion,
  LiteratureProvider,
  LiteratureResult,
} from "@/lib/db/types";
import {
  demoClaimSuggestion,
  demoSearchResults,
} from "@/lib/mock-data";

function firstArrayValue(value: string[] | undefined) {
  return value?.[0] ?? "";
}

function rebuildOpenAlexAbstract(
  invertedIndex: Record<string, number[]> | null | undefined,
) {
  if (!invertedIndex) {
    return "";
  }

  const tokens: string[] = [];

  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const position of positions) {
      tokens[position] = word;
    }
  }

  return tokens.filter(Boolean).join(" ");
}

function buildClaimSearch(claim: string) {
  const sanitized = claim.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const keywords = sanitized
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 10);

  return keywords.length > 0 ? keywords.join(" ") : claim;
}

async function searchOpenAlex(query: string) {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("per-page", "8");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return demoSearchResults;
  }

  const payload = (await response.json()) as {
    results?: Array<{
      id?: string;
      display_name?: string;
      publication_year?: number;
      primary_location?: {
        source?: {
          display_name?: string;
        };
        landing_page_url?: string;
      };
      authorships?: Array<{
        author?: {
          display_name?: string;
        };
      }>;
      abstract_inverted_index?: Record<string, number[]>;
      cited_by_count?: number;
      doi?: string;
    }>;
  };

  return (payload.results ?? []).map<LiteratureResult>((item) => ({
    id: item.id ?? crypto.randomUUID(),
    title: item.display_name ?? "Untitled record",
    authors:
      item.authorships
        ?.map((entry) => entry.author?.display_name ?? "")
        .filter(Boolean) ?? [],
    year: item.publication_year ? String(item.publication_year) : "Unknown",
    venue: item.primary_location?.source?.display_name ?? "OpenAlex",
    abstract:
      rebuildOpenAlexAbstract(item.abstract_inverted_index) ||
      "No abstract was provided by OpenAlex for this work.",
    url: item.primary_location?.landing_page_url ?? item.id ?? "https://openalex.org",
    doi: item.doi ?? null,
    citationCount: item.cited_by_count ?? null,
    provider: "openalex",
    relevanceNote:
      "Matched through semantic metadata in OpenAlex. Review the abstract and venue before citing.",
  }));
}

async function searchSemanticScholar(query: string) {
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", query);
  url.searchParams.set("limit", "8");
  url.searchParams.set(
    "fields",
    "title,abstract,authors,year,venue,url,citationCount,externalIds",
  );

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return demoSearchResults;
  }

  const payload = (await response.json()) as {
    data?: Array<{
      paperId?: string;
      title?: string;
      abstract?: string;
      authors?: Array<{ name?: string }>;
      year?: number;
      venue?: string;
      url?: string;
      citationCount?: number;
      externalIds?: { DOI?: string };
    }>;
  };

  return (payload.data ?? []).map<LiteratureResult>((item) => ({
    id: item.paperId ?? crypto.randomUUID(),
    title: item.title ?? "Untitled record",
    authors: item.authors?.map((author) => author.name ?? "").filter(Boolean) ?? [],
    year: item.year ? String(item.year) : "Unknown",
    venue: item.venue ?? "Semantic Scholar",
    abstract: item.abstract ?? "No abstract was provided by Semantic Scholar.",
    url: item.url ?? "https://www.semanticscholar.org",
    doi: item.externalIds?.DOI ?? null,
    citationCount: item.citationCount ?? null,
    provider: "semantic-scholar",
    relevanceNote:
      "Useful for fast relevance checking and citation counts, but still verify full-text fit before citing.",
  }));
}

async function searchCrossref(query: string) {
  const url = new URL("https://api.crossref.org/works");
  url.searchParams.set("query.bibliographic", query);
  url.searchParams.set("rows", "8");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return demoSearchResults;
  }

  const payload = (await response.json()) as {
    message?: {
      items?: Array<{
        DOI?: string;
        title?: string[];
        author?: Array<{ given?: string; family?: string }>;
        published?: { "date-parts"?: number[][] };
        "container-title"?: string[];
        URL?: string;
        abstract?: string;
        "is-referenced-by-count"?: number;
      }>;
    };
  };

  return (payload.message?.items ?? []).map<LiteratureResult>((item) => ({
    id: item.DOI ?? crypto.randomUUID(),
    title: firstArrayValue(item.title) || "Untitled record",
    authors:
      item.author
        ?.map((author) => `${author.given ?? ""} ${author.family ?? ""}`.trim())
        .filter(Boolean) ?? [],
    year: item.published?.["date-parts"]?.[0]?.[0]
      ? String(item.published["date-parts"][0][0])
      : "Unknown",
    venue: firstArrayValue(item["container-title"]) || "Crossref",
    abstract: item.abstract ?? "No abstract was provided by Crossref.",
    url: item.URL ?? "https://www.crossref.org",
    doi: item.DOI ?? null,
    citationCount: item["is-referenced-by-count"] ?? null,
    provider: "crossref",
    relevanceNote:
      "Helpful for DOI discovery and citation formatting. Check the abstract because Crossref matching can be broad.",
  }));
}

export async function searchLiterature(
  query: string,
  provider: LiteratureProvider = "openalex",
) {
  if (!query.trim()) {
    return demoSearchResults;
  }

  try {
    switch (provider) {
      case "semantic-scholar":
        return await searchSemanticScholar(query);
      case "crossref":
        return await searchCrossref(query);
      case "openalex":
      default:
        return await searchOpenAlex(query);
    }
  } catch {
    return demoSearchResults;
  }
}

export async function suggestPapersForClaim(
  claim: string,
  provider: LiteratureProvider = "openalex",
) {
  if (!claim.trim()) {
    return demoClaimSuggestion;
  }

  const recommendedSearch = buildClaimSearch(claim);
  const papers = await searchLiterature(recommendedSearch, provider);

  return {
    claim,
    recommendedSearch,
    papers,
  } satisfies ClaimSuggestion;
}
