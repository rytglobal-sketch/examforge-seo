import { ResearchForgeLogo } from "@/components/app-shell/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#eef4ff_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_460px] lg:items-center">
          <section className="hidden lg:block">
            <ResearchForgeLogo />
            <h1 className="mt-8 max-w-[12ch] text-5xl font-semibold tracking-[-0.06em] text-[#101522]">
              Ask better questions of the papers you upload.
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg leading-8 text-[#57637a]">
              Upload academic PDFs, ask questions, get simple explanations,
              generate summaries, create notes, and find citations from the same
              workspace.
            </p>
          </section>

          <section className="rounded-[2rem] border border-[#dce4f2] bg-white p-6 shadow-[0_28px_70px_rgba(16,21,34,0.08)] sm:p-8">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
