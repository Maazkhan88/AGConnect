import type { R2Bucket } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as unknown as { UPLOADS?: R2Bucket }).UPLOADS;
  if (!bucket) return new NextResponse("Storage not configured", { status: 500 });

  const object = await bucket.get(key.join("/"));
  if (!object) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(object.body as unknown as BodyInit, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
