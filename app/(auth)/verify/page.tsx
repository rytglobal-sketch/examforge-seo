import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { consumeMagicLink } from "@/lib/auth/magic-links";
import { createSession } from "@/lib/auth/session";
import { getOptionalSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Verify Link",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const existingSession = await getOptionalSession();

  if (existingSession) {
    redirect("/documents");
  }

  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  if (!token) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d8798]">
          Magic link
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111727]">
          This link is incomplete
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#6d7686]">
          Request a new sign-in or sign-up link and open it from your email again.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center rounded-2xl bg-[#1f6fff] px-4 py-3 text-sm font-semibold text-white"
          >
            Go to sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center rounded-2xl border border-[#d9e1ee] px-4 py-3 text-sm font-semibold text-[#23324b]"
          >
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  const result = await consumeMagicLink(token);

  if (!result.ok) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7d8798]">
          Magic link
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111727]">
          We couldn&apos;t verify that link
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#6d7686]">{result.error}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center rounded-2xl bg-[#1f6fff] px-4 py-3 text-sm font-semibold text-white"
          >
            Request a new sign-in link
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center rounded-2xl border border-[#d9e1ee] px-4 py-3 text-sm font-semibold text-[#23324b]"
          >
            Start free
          </Link>
        </div>
      </div>
    );
  }

  await createSession(result.user);
  redirect("/documents");
}
