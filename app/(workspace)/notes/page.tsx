import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { getWorkspaceViewer } from "@/lib/auth/dal";
import { getNotesForUser } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Notes",
};

function withParams(
  pathname: string,
  params: Record<string, string | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function formatNoteDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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

function getModeDetails(mode: string) {
  switch (mode) {
    case "review-writing":
      return {
        title: "Writing review workflow",
        description:
          "Use this note idea to capture where your draft needs stronger evidence, simpler phrasing, or better structure.",
      };
    default:
      return null;
  }
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getWorkspaceViewer();
  const params = await searchParams;
  const starterPrompt = getParam(params, "prompt");
  const launchMode = getParam(params, "mode");
  const modeDetails = getModeDetails(launchMode);
  const notes = await getNotesForUser(session.id);
  const uniqueDocumentCount = new Set(notes.map((note) => note.documentId)).size;
  const latestNote = notes[0] ?? null;

  return (
    <WorkspaceShell user={session} activePath="/notes">
      <div className="mx-auto max-w-[980px] space-y-6">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-6 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
              Notes
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
              Keep the useful parts, skip the clutter
            </h2>
            <p className="mt-3 max-w-[42rem] text-sm leading-7 text-[#6d7686]">
              Save only what you will actually reuse later: the main takeaway, one
              useful definition, a citation reminder, or the next question you want to
              ask.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#5e6878]">
              <div className="rounded-full bg-[#f4f7fd] px-3 py-1.5">Main ideas</div>
              <div className="rounded-full bg-[#f4f7fd] px-3 py-1.5">
                Writing reminders
              </div>
              <div className="rounded-full bg-[#f4f7fd] px-3 py-1.5">Citation cues</div>
            </div>

            {starterPrompt ? (
              <div className="mt-5 rounded-[1.4rem] border border-[#e4dccf] bg-[#fbf7f1] px-5 py-4 text-sm leading-7 text-[#5d5348]">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8c7f71]">
                  {modeDetails?.title ?? "Starter note idea"}
                </div>
                <p className="mt-2">&quot;{starterPrompt}&quot;</p>
                <p className="mt-2 text-[#786d62]">
                  {modeDetails?.description ??
                    "Keep it short, then turn it into a reusable note attached to a paper."}
                </p>
              </div>
            ) : null}
          </div>

          <aside className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
              Quick view
            </p>

            <div className="mt-4 space-y-4">
              <div className="rounded-[1.2rem] bg-[#f6f8fc] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[#7d8798]">
                  Saved notes
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#111727]">
                  {notes.length}
                </div>
              </div>

              <div className="rounded-[1.2rem] bg-[#f6f8fc] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[#7d8798]">
                  Papers covered
                </div>
                <div className="mt-1 text-2xl font-semibold text-[#111727]">
                  {uniqueDocumentCount}
                </div>
              </div>

              <div className="rounded-[1.2rem] bg-[#f6f8fc] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-[#7d8798]">
                  Latest update
                </div>
                <div className="mt-1 text-sm font-medium text-[#111727]">
                  {latestNote ? formatNoteDate(latestNote.updatedAt) : "No notes yet"}
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="space-y-4">
          {notes.length === 0 ? (
            <div className="rounded-[1.8rem] border border-dashed border-[#d6deeb] bg-white px-6 py-10 text-center shadow-[0_20px_40px_rgba(16,21,34,0.03)]">
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#111727]">
                No notes yet
              </h3>
              <p className="mx-auto mt-3 max-w-[32rem] text-sm leading-7 text-[#6d7686]">
                Open a paper, ask a question, and save only the parts you want to reuse
                in your writing later.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <article
                key={note.id}
                className="rounded-[1.6rem] border border-[#dce4f2] bg-white p-5 shadow-[0_18px_34px_rgba(16,21,34,0.04)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
                      {note.documentTitle}
                    </div>
                    <p className="mt-3 max-w-[44rem] whitespace-pre-wrap text-sm leading-7 text-[#455066]">
                      {note.body}
                    </p>
                  </div>

                  <div className="rounded-full bg-[#f4f7fd] px-3 py-1.5 text-xs font-medium text-[#5d6a80]">
                    Updated {formatNoteDate(note.updatedAt)}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <a
                    href={`/documents/${note.documentId}`}
                    className="rounded-full border border-[#dce4f2] bg-[#f8fbff] px-4 py-2 font-medium text-[#111727] transition-colors hover:bg-white"
                  >
                    Open paper
                  </a>
                  <a
                    href={withParams(`/documents/${note.documentId}`, {
                      tab: "chat",
                      mode: "chat-with-pdf",
                      prompt: `Use this note to help answer my next question: ${note.body}`,
                    })}
                    className="rounded-full border border-[#dce4f2] bg-[#f8fbff] px-4 py-2 font-medium text-[#111727] transition-colors hover:bg-white"
                  >
                    Ask from this note
                  </a>
                  <a
                    href={withParams("/search", {
                      claim: note.body,
                    })}
                    className="rounded-full border border-[#dce4f2] bg-[#f8fbff] px-4 py-2 font-medium text-[#111727] transition-colors hover:bg-white"
                  >
                    Find citations
                  </a>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}
