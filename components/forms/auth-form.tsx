"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/app/actions/auth";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  action: (
    state: AuthFormState | undefined,
    formData: FormData,
  ) => Promise<AuthFormState | undefined>;
};

function SubmitButton({
  label,
  pendingLabel,
  pending,
}: {
  label: string;
  pendingLabel: string;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1f6fff] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#195de0] disabled:cursor-not-allowed disabled:bg-[#9bbcff]"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="space-y-5">
      {isSignUp ? (
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-[#23324b]">
            Full name
          </label>
          <input
            id="name"
            name="name"
            placeholder="Amina Okafor"
            className="w-full rounded-2xl border border-[#d9e1ee] bg-white px-4 py-3 text-sm text-[#111727] outline-none ring-0 placeholder:text-[#8691a3] focus:border-[#8fb4ff]"
          />
          {state?.fieldErrors?.name ? (
            <p className="text-sm text-[#c13b3b]">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-[#23324b]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@university.edu"
          defaultValue={state?.email}
          className="w-full rounded-2xl border border-[#d9e1ee] bg-white px-4 py-3 text-sm text-[#111727] outline-none ring-0 placeholder:text-[#8691a3] focus:border-[#8fb4ff]"
        />
        {state?.fieldErrors?.email ? (
          <p className="text-sm text-[#c13b3b]">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#dce4f2] bg-[#f8fbff] px-4 py-3 text-sm leading-7 text-[#5e6980]">
        No password needed. ResearchForge will email you a secure magic link so you can
        continue into your PDF workspace.
      </div>

      {state?.success ? (
        <div className="space-y-3 rounded-2xl border border-[#cfe0ff] bg-[#f4f8ff] px-4 py-4 text-sm text-[#21407c]">
          <p>{state.success}</p>
          {state.magicLink ? (
            <Link
              href={state.magicLink}
              className="inline-flex items-center rounded-2xl border border-[#b8cdfa] bg-white px-4 py-2 font-semibold text-[#1f5fde]"
            >
              Open magic link
            </Link>
          ) : null}
        </div>
      ) : null}

      {state?.error ? (
        <div className="rounded-2xl border border-[#f4caca] bg-[#fff5f5] px-4 py-3 text-sm text-[#a63b3b]">
          {state.error}
        </div>
      ) : null}

      <SubmitButton
        label={isSignUp ? "Create account" : "Email me a sign-in link"}
        pendingLabel="Sending magic link..."
        pending={pending}
      />

      <p className="text-sm text-[#6d7686]">
        {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-semibold text-[#1f6fff]"
        >
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}
