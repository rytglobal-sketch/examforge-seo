import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { AuthMode, SessionUser } from "@/lib/db/types";
import {
  consumeMagicLinkRecord,
  createMagicLinkRecord,
  createUserRecord,
  findUserByEmail,
} from "@/lib/db/queries";
import {
  canPreviewMagicLinks,
  getAppUrl,
  isDatabaseConfigured,
  isMagicLinkEmailConfigured,
} from "@/lib/env";

const MAGIC_LINK_TTL_MINUTES = 20;

type PreviewMagicLinkPayload = {
  email: string;
  name?: string;
  intent: AuthMode;
  preview: true;
};

export type MagicLinkIssueResult =
  | {
      ok: true;
      email: string;
      expiresInMinutes: number;
      preview: boolean;
      magicLink?: string;
    }
  | {
      ok: false;
      error: string;
    };

export type MagicLinkConsumeResult =
  | {
      ok: true;
      user: SessionUser;
    }
  | {
      ok: false;
      error: string;
    };

function getMagicLinkKey() {
  const secret =
    process.env.SESSION_SECRET ??
    "researchforge-dev-session-secret-change-me-before-production";

  return new TextEncoder().encode(secret);
}

function hashMagicLinkToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getFallbackName(email: string) {
  const localPart = email.split("@")[0] ?? "Researcher";

  const normalizedName = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return normalizedName || "Researcher";
}

function buildMagicLinkUrl(token: string) {
  return `${getAppUrl().replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;
}

async function createPreviewMagicLinkToken(input: {
  email: string;
  name?: string;
  intent: AuthMode;
}) {
  return new SignJWT({
    email: input.email,
    name: input.name,
    intent: input.intent,
    preview: true,
  } satisfies PreviewMagicLinkPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAGIC_LINK_TTL_MINUTES}m`)
    .sign(getMagicLinkKey());
}

async function readPreviewMagicLinkToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getMagicLinkKey(), {
      algorithms: ["HS256"],
    });

    const previewPayload = payload as Partial<PreviewMagicLinkPayload>;

    if (
      previewPayload.preview !== true ||
      typeof previewPayload.email !== "string" ||
      (previewPayload.intent !== "sign-in" && previewPayload.intent !== "sign-up")
    ) {
      return null;
    }

    return {
      email: previewPayload.email,
      name: typeof previewPayload.name === "string" ? previewPayload.name : undefined,
      intent: previewPayload.intent,
    };
  } catch {
    return null;
  }
}

async function sendMagicLinkEmail(input: {
  email: string;
  magicLink: string;
  intent: AuthMode;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!isMagicLinkEmailConfigured() || !resendApiKey || !emailFrom) {
    if (!canPreviewMagicLinks()) {
      return {
        ok: false,
        error:
          "Magic link delivery is not configured yet. Add RESEND_API_KEY and EMAIL_FROM first.",
      } as const;
    }

    return {
      ok: true,
      preview: true,
    } as const;
  }

  const subject =
    input.intent === "sign-up"
      ? "Create your ResearchForge account"
      : "Your ResearchForge sign-in link";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: input.email,
      subject,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111727;">
          <p style="margin:0 0 12px;font-size:14px;letter-spacing:0.14em;text-transform:uppercase;color:#7d8798;">
            ResearchForge
          </p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;">
            ${input.intent === "sign-up" ? "Create your account" : "Sign in to your workspace"}
          </h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#4c5870;">
            This secure magic link is valid for ${MAGIC_LINK_TTL_MINUTES} minutes.
          </p>
          <a
            href="${input.magicLink}"
            style="display:inline-block;border-radius:16px;background:#1f6fff;padding:14px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;"
          >
            ${input.intent === "sign-up" ? "Open ResearchForge" : "Continue to ResearchForge"}
          </a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#6d7686;">
            If the button does not work, copy and paste this link into your browser:<br />
            <span style="word-break:break-all;color:#1f6fff;">${input.magicLink}</span>
          </p>
        </div>
      `,
      text: [
        "ResearchForge",
        "",
        `Use this secure link within ${MAGIC_LINK_TTL_MINUTES} minutes:`,
        input.magicLink,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "We could not send your magic link right now. Please try again.",
    } as const;
  }

  return {
    ok: true,
    preview: false,
  } as const;
}

export async function issueMagicLink(input: {
  email: string;
  name?: string;
  intent: AuthMode;
}): Promise<MagicLinkIssueResult> {
  let magicLink = "";

  if (isDatabaseConfigured()) {
    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000);

    await createMagicLinkRecord({
      email: input.email,
      name: input.name,
      intent: input.intent,
      tokenHash: hashMagicLinkToken(rawToken),
      expiresAt,
    });

    magicLink = buildMagicLinkUrl(rawToken);
  } else {
    const previewToken = await createPreviewMagicLinkToken(input);
    magicLink = buildMagicLinkUrl(previewToken);
  }

  const delivery = await sendMagicLinkEmail({
    email: input.email,
    magicLink,
    intent: input.intent,
  });

  if (!delivery.ok) {
    return delivery;
  }

  return {
    ok: true,
    email: input.email,
    expiresInMinutes: MAGIC_LINK_TTL_MINUTES,
    preview: delivery.preview,
    magicLink: delivery.preview ? magicLink : undefined,
  };
}

export async function consumeMagicLink(token: string): Promise<MagicLinkConsumeResult> {
  let payload:
    | {
        email: string;
        name?: string;
        intent: AuthMode;
      }
    | null = null;

  if (isDatabaseConfigured()) {
    const record = await consumeMagicLinkRecord(hashMagicLinkToken(token));

    if (!record) {
      return {
        ok: false,
        error: "That magic link is invalid, expired, or has already been used.",
      };
    }

    payload = {
      email: record.email,
      name: record.name ?? undefined,
      intent: record.intent,
    };
  } else {
    payload = await readPreviewMagicLinkToken(token);

    if (!payload) {
      return {
        ok: false,
        error: "That preview magic link is invalid or has expired.",
      };
    }
  }

  const existingUser = await findUserByEmail(payload.email);

  if (existingUser) {
    return {
      ok: true,
      user: existingUser,
    };
  }

  if (payload.intent === "sign-in" && isDatabaseConfigured()) {
    return {
      ok: false,
      error: "No account matched this email. Request a new account link instead.",
    };
  }

  try {
    const createdUser = await createUserRecord({
      name: payload.name?.trim() || getFallbackName(payload.email),
      email: payload.email,
    });

    return {
      ok: true,
      user: createdUser,
    };
  } catch {
    const retryUser = await findUserByEmail(payload.email);

    if (retryUser) {
      return {
        ok: true,
        user: retryUser,
      };
    }

    return {
      ok: false,
      error: "We could not finish your sign-in. Please request a new magic link.",
    };
  }
}
