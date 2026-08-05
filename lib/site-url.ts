import { headers } from "next/headers";

/**
 * Derives the current deployment's public base URL from the incoming request
 * (works on the Cloudflare Worker's *.workers.dev URL, a future custom
 * domain, and local dev) instead of hardcoding a single origin.
 */
export async function getSiteBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
