type ResearchComposerProps = {
  placeholder: string;
  className?: string;
  textareaMinHeightClassName?: string;
};

export function ResearchComposer({
  placeholder,
  className = "",
  textareaMinHeightClassName = "min-h-[120px]",
}: ResearchComposerProps) {
  return (
    <section
      className={`rounded-[1.55rem] border border-[#ddd8d0] bg-white px-4 pb-3 pt-4 shadow-[0_24px_54px_rgba(132,112,85,0.1)] sm:px-5 sm:pb-4 ${className}`}
    >
      <textarea
        aria-label="Research prompt"
        placeholder={placeholder}
        className={`${textareaMinHeightClassName} w-full resize-none bg-transparent px-2 py-1 text-[1.02rem] leading-7 text-[#212121] outline-none placeholder:text-[#8d7f72]`}
      />

      <div className="flex items-center justify-between gap-3 border-t border-[#ebe5dc] pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Add tool"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7d0c6] bg-white text-[1.45rem] leading-none text-[#56504b]"
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
              className="h-3.5 w-3.5 text-[#a4998d]"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Use microphone"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#544d47] transition-colors hover:bg-[#f5f1eb]"
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#bdb5ae] text-white transition-colors hover:bg-[#aaa198]"
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
