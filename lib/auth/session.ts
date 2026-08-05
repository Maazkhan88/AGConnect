import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { fromBase64Url, timingSafeEqual, toBase64Url } from "@/lib/auth/password";

export const SESSION_COOKIE = "agc_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

export type SessionPayload = { sub: string; email: string; exp: number };

async function secret(): Promise<string> {
  let value = process.env.AUTH_SECRET;
  if (!value) {
    try {
      const { env } = await getCloudflareContext({ async: true });
      value = (env as unknown as { AUTH_SECRET?: string }).AUTH_SECRET;
    } catch {
      value = undefined;
    }
  }
  // Development fallback only — production must set AUTH_SECRET as a Worker secret.
  return value ?? "agconnect-development-secret-change-me-please";
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(await secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${body}.${await hmac(body)}`;
}

export async function readSessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if (!timingSafeEqual(await hmac(body), signature)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (!payload.sub || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionCookie(sub: string, email: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession({ sub, email, exp }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}
