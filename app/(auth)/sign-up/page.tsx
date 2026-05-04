import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signUpAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/forms/auth-form";
import { getOptionalSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Create Account",
};

export default async function SignUpPage() {
  const session = await getOptionalSession();

  if (session) {
    redirect("/documents");
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d8798]">
        Start free
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111727]">
        Create your ResearchForge account
      </h2>
      <p className="mt-3 text-sm leading-7 text-[#6d7686]">
        Upload papers, chat with PDFs using only retrieved context, generate
        summaries, and grow into Pro when you need more capacity.
      </p>

      <div className="mt-8">
        <AuthForm mode="sign-up" action={signUpAction} />
      </div>
    </div>
  );
}
