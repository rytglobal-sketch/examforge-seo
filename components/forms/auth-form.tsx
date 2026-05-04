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
          className="w-full rounded-2xl border border-[#d9e1ee] bg-white px-4 py-3 text-sm text-[#111727] outline-none ring-0 placeholder:text-[#8691a3] focus:border-[#8fb4ff]"
        />
        {state?.fieldErrors?.email ? (
          <p className="text-sm text-[#c13b3b]">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[#23324b]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder={isSignUp ? "At least 8 characters" : "Your password"}
          className="w-full rounded-2xl border border-[#d9e1ee] bg-white px-4 py-3 text-sm text-[#111727] outline-none ring-0 placeholder:text-[#8691a3] focus:border-[#8fb4ff]"
        />
        {state?.fieldErrors?.password ? (
          <p className="text-sm text-[#c13b3b]">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      {state?.error ? (
        <div className="rounded-2xl border border-[#f4caca] bg-[#fff5f5] px-4 py-3 text-sm text-[#a63b3b]">
          {state.error}
        </div>
      ) : null}

      <SubmitButton
        label={isSignUp ? "Create account" : "Sign in"}
        pendingLabel={isSignUp ? "Creating account..." : "Signing in..."}
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
