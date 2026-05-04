import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";

export const getOptionalSession = cache(async () => {
  return readSession();
});

export const requireSession = cache(async () => {
  const session = await readSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
});
