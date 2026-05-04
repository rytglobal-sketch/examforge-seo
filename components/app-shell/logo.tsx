import Link from "next/link";

type ResearchForgeLogoProps = {
  href?: string;
  compact?: boolean;
};

export function ResearchForgeLogo({
  href = "/",
  compact = false,
}: ResearchForgeLogoProps) {
  const content = (
    <>
      <span className="relative block h-10 w-10 shrink-0">
        <span className="absolute left-1 top-0 h-5 w-5 rotate-[32deg] rounded-[0.55rem] bg-[#1f6fff]" />
        <span className="absolute left-4 top-3 h-5 w-5 rotate-[32deg] rounded-[0.55rem] bg-[#f59f63]" />
        <span className="absolute left-2.5 top-5 h-2 w-5 rounded-full bg-[#12315c]/15" />
      </span>
      {!compact ? (
        <span className="flex flex-col">
          <span className="text-lg font-semibold tracking-[-0.04em] text-[#101522]">
            ResearchForge
          </span>
          <span className="text-xs text-[#6d7686]">
            Grounded AI for academic work
          </span>
        </span>
      ) : null}
    </>
  );

  return (
    <Link href={href} className="inline-flex items-center gap-3">
      {content}
    </Link>
  );
}
