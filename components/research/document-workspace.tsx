"use client";

import { Activity, useState, useTransition } from "react";
import {
  saveNoteAction,
  sendChatMessageAction,
} from "@/app/actions/documents";
import type { ChatMessageRecord, DocumentWorkspace } from "@/lib/db/types";

type DocumentWorkspaceProps = {
  workspace: DocumentWorkspace;
  initialPrompt?: string;
  initialTab?: "chat" | "summary" | "notes";
};

function CitationList({ citations }: { citations: number[] }) {
  if (citations.length === 0) {
    return (
      <div className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-[#8a95a8]">
        Not found in the document
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {citations.map((citation) => (
        <span
          key={`${citation}`}
          className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold text-[#1f6fff]"
        >
          Page {citation}
        </span>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessageRecord }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-[1.4rem] px-4 py-3 text-sm leading-7 shadow-[0_16px_32px_rgba(16,21,34,0.05)] ${
          isUser
            ? "bg-[#111727] text-white"
            : "border border-[#dde5f1] bg-white text-[#1d2433]"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {!isUser ? <CitationList citations={message.citations} /> : null}
      </div>
    </div>
  );
}

function SummaryPanel({ workspace }: { workspace: DocumentWorkspace }) {
  const { summary } = workspace.document;

  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] border border-[#dce4f2] bg-white p-5">
        <h3 className="text-lg font-semibold text-[#111727]">Simple summary</h3>
        <p className="mt-3 text-sm leading-7 text-[#455066]">
          {summary.simpleSummary}
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-[#dce4f2] bg-white p-5">
        <h3 className="text-lg font-semibold text-[#111727]">Key findings</h3>
        <ul className="mt-3 space-y-3 text-sm leading-7 text-[#455066]">
          {summary.keyFindings.map((finding) => (
            <li key={finding} className="flex gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-[#1f6fff]" />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[1.5rem] border border-[#dce4f2] bg-white p-5">
          <h3 className="text-lg font-semibold text-[#111727]">Methodology</h3>
          <p className="mt-3 text-sm leading-7 text-[#455066]">
            {summary.methodology}
          </p>
        </section>

        <section className="rounded-[1.5rem] border border-[#dce4f2] bg-white p-5">
          <h3 className="text-lg font-semibold text-[#111727]">Limitations</h3>
          <p className="mt-3 text-sm leading-7 text-[#455066]">
            {summary.limitations}
          </p>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[1.5rem] border border-[#dce4f2] bg-white p-5">
          <h3 className="text-lg font-semibold text-[#111727]">
            Important definitions
          </h3>
          <div className="mt-3 space-y-3 text-sm leading-7 text-[#455066]">
            {summary.importantDefinitions.map((definition) => (
              <div key={definition.term} className="rounded-2xl bg-[#f8fbff] p-4">
                <div className="font-semibold text-[#111727]">{definition.term}</div>
                <div className="mt-1">{definition.meaning}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[#dce4f2] bg-white p-5">
          <h3 className="text-lg font-semibold text-[#111727]">
            Possible exam questions
          </h3>
          <ol className="mt-3 space-y-3 text-sm leading-7 text-[#455066]">
            {summary.possibleExamQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function NotesPanel({
  workspace,
  noteBody,
  setNoteBody,
}: {
  workspace: DocumentWorkspace;
  noteBody: string;
  setNoteBody: (value: string) => void;
}) {
  const [isSaving, startSaving] = useTransition();
  const [savedMessage, setSavedMessage] = useState(
    workspace.note?.updatedAt ? "Saved note loaded." : "",
  );

  return (
    <div className="rounded-[1.5rem] border border-[#dce4f2] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#111727]">Document notes</h3>
          <p className="mt-1 text-sm text-[#6d7686]">
            Keep your interpretation, limitations, follow-ups, and writing ideas
            next to the paper.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            startSaving(async () => {
              await saveNoteAction({
                documentId: workspace.document.id,
                body: noteBody,
              });
              setSavedMessage(`Saved at ${new Date().toLocaleTimeString()}`);
            })
          }
          className="inline-flex items-center justify-center rounded-2xl bg-[#111727] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1b2740]"
        >
          {isSaving ? "Saving..." : "Save notes"}
        </button>
      </div>

      <textarea
        value={noteBody}
        onChange={(event) => setNoteBody(event.target.value)}
        placeholder="Write what the paper argues, what evidence looks strongest, and what you want to cite later."
        className="mt-5 min-h-[280px] w-full rounded-[1.5rem] border border-[#dce4f2] bg-[#f8fbff] px-4 py-4 text-sm leading-7 text-[#1d2433] outline-none placeholder:text-[#8a95a8]"
      />

      {savedMessage ? (
        <p className="mt-3 text-sm text-[#4f5d73]">{savedMessage}</p>
      ) : null}
    </div>
  );
}

export function DocumentWorkspaceView({
  workspace,
  initialPrompt = "",
  initialTab = "chat",
}: DocumentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "summary" | "notes">(initialTab);
  const [messages, setMessages] = useState(workspace.messages);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [noteBody, setNoteBody] = useState(workspace.note?.body ?? "");
  const [isSending, startSending] = useTransition();
  const [supportingQuotes, setSupportingQuotes] = useState<string[]>([]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
      <section className="overflow-hidden rounded-[1.75rem] border border-[#dce4f2] bg-white shadow-[0_24px_52px_rgba(16,21,34,0.05)]">
        <div className="border-b border-[#e7edf5] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#111727]">
                {workspace.document.title}
              </h2>
              <p className="mt-1 text-sm text-[#6d7686]">
                {workspace.document.pageCount} pages · {workspace.document.sourceFileName}
              </p>
            </div>

            <div className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f6fff]">
              {workspace.document.status}
            </div>
          </div>
        </div>

        {workspace.document.storagePath ? (
          <iframe
            title={workspace.document.title}
            src={`/api/documents/${workspace.document.id}/file`}
            className="h-[780px] w-full bg-[#f2f5fa]"
          />
        ) : (
          <div className="max-h-[780px] overflow-y-auto bg-[#f8fbff] p-5">
            <div className="grid gap-4">
              {workspace.pages.map((page) => (
                <article
                  key={page.id}
                  className="rounded-[1.35rem] border border-[#dce4f2] bg-white p-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8798]">
                    Page {page.pageNumber}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#455066]">
                    {page.textContent}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-[#dce4f2] bg-[#f8fbff] p-4 shadow-[0_24px_52px_rgba(16,21,34,0.04)] sm:p-5">
        <div className="flex flex-wrap gap-2">
          {(["chat", "summary", "notes"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-[#111727] text-white"
                  : "bg-white text-[#556277] hover:bg-[#eef5ff]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <Activity mode={activeTab === "chat" ? "visible" : "hidden"}>
            <div className="flex min-h-[780px] flex-col rounded-[1.5rem] border border-[#dce4f2] bg-white">
              <div className="border-b border-[#e7edf5] px-5 py-4">
                <h3 className="text-lg font-semibold text-[#111727]">
                  Grounded PDF chat
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#6d7686]">
                  Answers are restricted to retrieved chunks from this PDF. If the
                  information is missing, ResearchForge will say so.
                </p>
                {initialPrompt ? (
                  <p className="mt-2 text-sm text-[#7d8798]">
                    Starter prompt loaded from your selected workflow.
                  </p>
                ) : null}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
                {messages.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-[#cfdae9] bg-[#f8fbff] px-4 py-5 text-sm leading-7 text-[#556277]">
                    Ask a question about the uploaded paper to create the first
                    citation-backed answer.
                  </div>
                ) : null}

                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                {supportingQuotes.length > 0 ? (
                  <div className="rounded-[1.4rem] border border-[#dce4f2] bg-[#f8fbff] px-4 py-4 text-sm text-[#4f5d73]">
                    <div className="font-semibold text-[#111727]">
                      Supporting excerpts used in the last answer
                    </div>
                    <ul className="mt-3 space-y-2 leading-7">
                      {supportingQuotes.map((quote) => (
                        <li key={quote}>{quote}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <form
                className="border-t border-[#e7edf5] p-4"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!prompt.trim()) {
                    return;
                  }

                  const userPrompt = prompt.trim();
                  setPrompt("");

                  startSending(async () => {
                    const response = await sendChatMessageAction({
                      documentId: workspace.document.id,
                      prompt: userPrompt,
                    });

                    setMessages((currentMessages) => [
                      ...currentMessages,
                      response.userMessage,
                      response.assistantMessage,
                    ]);
                    setSupportingQuotes(response.supportingQuotes);
                  });
                }}
              >
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask about findings, methods, limitations, definitions, or whether a claim is supported in this PDF."
                  className="min-h-[120px] w-full resize-none rounded-[1.5rem] border border-[#dce4f2] bg-[#f8fbff] px-4 py-4 text-sm leading-7 text-[#1d2433] outline-none placeholder:text-[#8a95a8]"
                />

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#6d7686]">
                    Every answer includes page citations.
                  </p>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#1f6fff] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#195de0] disabled:cursor-not-allowed disabled:bg-[#9bbcff]"
                  >
                    {isSending ? "Searching PDF..." : "Ask PDF"}
                  </button>
                </div>
              </form>
            </div>
          </Activity>

          <Activity mode={activeTab === "summary" ? "visible" : "hidden"}>
            <SummaryPanel workspace={workspace} />
          </Activity>

          <Activity mode={activeTab === "notes" ? "visible" : "hidden"}>
            <NotesPanel
              workspace={workspace}
              noteBody={noteBody}
              setNoteBody={setNoteBody}
            />
          </Activity>
        </div>
      </section>
    </div>
  );
}
