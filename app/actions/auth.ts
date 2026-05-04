"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession } from "@/lib/auth/session";
import { createUserRecord, findUserByEmail } from "@/lib/db/queries";
import { isDatabaseConfigured } from "@/lib/env";

export type AuthFormState = {
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
};

const signInSchema = z.object({
  email: z.string().email("Enter a valid academic or personal email."),
  password: z.string().min(1, "Enter your password."),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Za-z]/, "Password must include a letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export async function signInAction(
  _previousState: AuthFormState | undefined,
  formData: FormData,
) {
  const validated = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    } satisfies AuthFormState;
  }

  const { email, password } = validated.data;

  if (!isDatabaseConfigured()) {
    await createSession({
      id: "demo-user",
      name: email.split("@")[0] || "Researcher",
      email,
      plan: "free",
      isDemo: true,
    });

    redirect("/documents");
  }

  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    return {
      error: "No account matched that email. Try signing up instead.",
    } satisfies AuthFormState;
  }

  const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash);

  if (!passwordMatches) {
    return {
      error: "That password was incorrect.",
    } satisfies AuthFormState;
  }

  await createSession({
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    plan: existingUser.plan,
    stripeCustomerId: existingUser.stripeCustomerId,
    subscriptionStatus: existingUser.subscriptionStatus,
  });

  redirect("/documents");
}

export async function signUpAction(
  _previousState: AuthFormState | undefined,
  formData: FormData,
) {
  const validated = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    } satisfies AuthFormState;
  }

  const { name, email, password } = validated.data;

  if (!isDatabaseConfigured()) {
    await createSession({
      id: "demo-user",
      name,
      email,
      plan: "free",
      isDemo: true,
    });

    redirect("/documents");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return {
      error: "An account with that email already exists.",
    } satisfies AuthFormState;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser = await createUserRecord({
    name,
    email,
    passwordHash,
  });

  await createSession(newUser);
  redirect("/documents");
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}
