type ResearchComposerProps = {
  placeholder: string;
  className?: string;
  textareaMinHeightClassName?: string;
};

export function ResearchComposer({
  placeholder,
  className = "",
  textareaMinHeightClassName = "min-h-[104px]",
}: ResearchComposerProps) {
  return (
    <section
      className={`rounded-[1.55rem] border border-[#dce4f2] bg-white px-4 pb-3 pt-4 shadow-[0_24px_54px_rgba(16,21,34,0.08)] sm:px-5 sm:pb-4 ${className}`}
    >
      <textarea
        aria-label="Research prompt"
        placeholder={placeholder}
        className={`${textareaMinHeightClassName} w-full resize-none bg-transparent px-2 py-1 text-[1.02rem] leading-7 text-[#212121] outline-none placeholder:text-[#8a95a8]`}
      />

      <div className="flex items-center justify-between gap-3 border-t border-[#e7edf5] pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Add tool"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#dce4f2] bg-white text-[1.45rem] leading-none text-[#565f74]"
          >
            +
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-[0.98rem] font-semibold text-[#171717]"
          >
            Tools
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              className="h-3.5 w-3.5 text-[#8a95a8]"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Use microphone"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#556277] transition-colors hover:bg-[#f5f8fc]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="M12 4.5a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-5 0V7A2.5 2.5 0 0 1 12 4.5Z" />
              <path d="M7.5 10.5a4.5 4.5 0 0 0 9 0" />
              <path d="M12 15v4.5" />
              <path d="M9 19.5h6" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Send prompt"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f6fff] text-white transition-colors hover:bg-[#195de0]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <path d="M12 17V7" />
              <path d="m7 12 5-5 5 5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
