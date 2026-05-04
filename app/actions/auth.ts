"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { issueMagicLink } from "@/lib/auth/magic-links";
import { destroySession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/queries";
import { isDatabaseConfigured } from "@/lib/env";

export type AuthFormState = {
  error?: string;
  success?: string;
  email?: string;
  magicLink?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
  };
};

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid academic or personal email."),
});

const signInSchema = emailSchema;

const signUpSchema = emailSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
});

async function sendMagicLink(input: {
  mode: "sign-in" | "sign-up";
  email: string;
  name?: string;
}) {
  if (isDatabaseConfigured()) {
    const existingUser = await findUserByEmail(input.email);

    if (input.mode === "sign-in" && !existingUser) {
      return {
        error: "No account matched that email. Create one first to use magic links.",
      } satisfies AuthFormState;
    }

    if (input.mode === "sign-up" && existingUser) {
      return {
        error: "An account with that email already exists. Try signing in instead.",
      } satisfies AuthFormState;
    }
  }

  const result = await issueMagicLink({
    email: input.email,
    name: input.name,
    intent: input.mode,
  });

  if (!result.ok) {
    return {
      error: result.error,
    } satisfies AuthFormState;
  }

  return {
    email: result.email,
    magicLink: result.magicLink,
    success: result.preview
      ? `Magic link preview ready. Open the link below within ${result.expiresInMinutes} minutes.`
      : `Check ${result.email} for your secure ResearchForge link. It expires in ${result.expiresInMinutes} minutes.`,
  } satisfies AuthFormState;
}

export async function signInAction(
  _previousState: AuthFormState | undefined,
  formData: FormData,
) {
  const validated = signInSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    } satisfies AuthFormState;
  }

  return sendMagicLink({
    mode: "sign-in",
    email: validated.data.email,
  });
}

export async function signUpAction(
  _previousState: AuthFormState | undefined,
  formData: FormData,
) {
  const validated = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    } satisfies AuthFormState;
  }

  return sendMagicLink({
    mode: "sign-up",
    name: validated.data.name,
    email: validated.data.email,
  });
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}
