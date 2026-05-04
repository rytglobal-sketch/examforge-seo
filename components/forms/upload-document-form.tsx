"use client";

import { useActionState } from "react";
import { uploadDocumentAction } from "@/app/actions/documents";

export function UploadDocumentForm({ disabled }: { disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, undefined);

  return (
    <form
      action={formAction}
      className="rounded-[1.75rem] border border-[#dce4f2] bg-white p-5 shadow-[0_22px_46px_rgba(16,21,34,0.05)]"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label
            htmlFor="pdf"
            className="text-sm font-medium uppercase tracking-[0.16em] text-[#7d8798]"
          >
            Upload an academic PDF
          </label>
          <div className="mt-3 rounded-[1.35rem] border border-dashed border-[#bfd1f4] bg-[#f8fbff] px-4 py-6">
            <input
              id="pdf"
              name="pdf"
              type="file"
              accept="application/pdf,.pdf"
              disabled={disabled || pending}
              className="block w-full text-sm text-[#33415a] file:mr-4 file:rounded-full file:border-0 file:bg-[#1f6fff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#195de0]"
            />
            <p className="mt-3 text-sm leading-6 text-[#6d7686]">
              Upload a paper and ResearchForge extracts page text, creates
              page-based chunks, stores embeddings, and prepares grounded
              question answering, summaries, notes, and citations.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || pending}
          className="inline-flex items-center justify-center rounded-2xl bg-[#111727] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1b2740] disabled:cursor-not-allowed disabled:bg-[#aeb6c4]"
        >
          {pending ? "Processing paper..." : "Upload paper"}
        </button>
      </div>

      {state?.error ? (
        <div className="mt-4 rounded-2xl border border-[#f4caca] bg-[#fff5f5] px-4 py-3 text-sm text-[#a63b3b]">
          {state.error}
        </div>
      ) : null}
    </form>
  );
}
