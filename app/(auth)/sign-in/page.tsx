import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signInAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/forms/auth-form";
import { getOptionalSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function SignInPage() {
  const session = await getOptionalSession();

  if (session) {
    redirect("/documents");
  }

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d8798]">
        Welcome back
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111727]">
        Sign in to ResearchForge
      </h2>
      <p className="mt-3 text-sm leading-7 text-[#6d7686]">
        Continue to your grounded PDF workspace, literature search, notes, and
        billing dashboard.
      </p>

      <div className="mt-8">
        <AuthForm mode="sign-in" action={signInAction} />
      </div>
    </div>
  );
}
