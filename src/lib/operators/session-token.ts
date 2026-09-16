import { fnv1a } from "../hash";
import type { SessionPayload } from "./types";

export const SESSION_COOKIE = "nightdesk_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return process.env.NIGHTDESK_SESSION_SECRET || "nightdesk-local-session-v1";
}

function toBase64Url(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "base64url").toString("utf8");
  }
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function signSession(payload: SessionPayload): string {
  const body = toBase64Url(JSON.stringify(payload));
  const sig = fnv1a(`${body}.${secret()}`);
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (fnv1a(`${body}.${secret()}`) !== sig) return null;
  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (!payload.operatorId || !payload.handle || !payload.issuedAt) return null;
    if (Date.now() - payload.issuedAt > TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
