import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./lib/prisma";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { Google } from "arctic";
import type { Session, User } from "@prisma/client";

// ─── SESSION TOKEN API ─────────────────────────────────────────────
// Generate a secure session token (at least 20 random bytes, base32 encoded)
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

// Create a new session in the database.
// The session ID is the SHA-256 hash (hex-encoded) of the token.
export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    },
  });
  return session;
}

// Define the result type for session validation.
export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

// Validate a session token by computing its hash and looking up the session.
// If the session has expired, it is deleted; if it is close to expiring (less than 15 days remaining),
// the expiration is extended by another 30 days.
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!result) return { session: null, user: null };

  const { user, ...session } = result;
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return { session: null, user: null };
  }
  // If less than 15 days remain, extend the session expiration.
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: newExpiresAt },
    });
    session.expiresAt = newExpiresAt;
  }
  return { session, user: user! };
}

// Invalidate a single session.
export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } });
}

// Invalidate all sessions for a given user.
export async function invalidateAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

// ─── COOKIE HANDLING API ────────────────────────────────────────────
// Set the session token cookie with attributes for security.
// (Uses the attributes recommended in the Next.js session cookies guide :contentReference[oaicite:3]{index=3}.)
export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

// Delete the session token cookie.
export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

// ─── REQUEST VALIDATION ─────────────────────────────────────────────
// A reusable function (cached with React’s cache) that validates the current request’s session.
// It reads the "session" cookie and, if present, validates the token.
// If valid and the session was updated (i.e. extended), the cookie is refreshed.
export const validateRequest = cache(async (): Promise<SessionValidationResult> => {
  const token = cookies().get("session")?.value ?? null;
  if (!token) return { session: null, user: null };

  const result = await validateSessionToken(token);
  try {
    if (result.session) {
      await setSessionTokenCookie(token, result.session.expiresAt);
    } else {
      await deleteSessionTokenCookie();
    }
  } catch (err) {
    console.error(err);
  }
  return result;
});

// ─── GOOGLE OAUTH SETUP ─────────────────────────────────────────────
// The Google instance remains the same as before.
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`
);
