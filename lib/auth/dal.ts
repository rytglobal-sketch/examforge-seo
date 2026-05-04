import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/db/types";

export const guestSessionUser: SessionUser = {
  id: "demo-user",
  name: "Guest Researcher",
  email: "guest@researchforge.app",
  plan: "free",
  isDemo: true,
};

export const getOptionalSession = cache(async () => {
  return readSession();
});

export const getWorkspaceViewer = cache(async () => {
  return (await readSession()) ?? guestSessionUser;
});

export const requireSession = cache(async () => {
  const session = await readSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
});
