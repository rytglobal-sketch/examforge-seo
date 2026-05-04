import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/app-shell/workspace-shell";
import { requireSession } from "@/lib/auth/dal";
import { getNotesForUser } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Notes",
};

export default async function NotesPage() {
  const session = await requireSession();
  const notes = await getNotesForUser(session.id);

  return (
    <WorkspaceShell user={session} activePath="/notes">
      <section className="rounded-[1.8rem] border border-[#dce4f2] bg-white p-5 shadow-[0_20px_40px_rgba(16,21,34,0.04)]">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
          Working notes
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111727]">
          Notes saved against your uploaded documents
        </h2>
        <p className="mt-3 max-w-[48rem] text-sm leading-7 text-[#6d7686]">
          Use notes to keep literature review thoughts, definitions, synthesis
          ideas, and future citation reminders attached to each paper.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {notes.map((note) => (
            <article
              key={note.id}
              className="rounded-[1.6rem] border border-[#dce4f2] bg-[#f8fbff] p-5"
            >
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]">
                {note.documentTitle}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#455066]">
                {note.body}
              </p>
              <p className="mt-4 text-xs text-[#7d8798]">
                Updated {new Date(note.updatedAt).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}
