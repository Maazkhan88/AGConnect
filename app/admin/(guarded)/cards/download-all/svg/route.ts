import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { getSiteBaseUrl } from "@/lib/site-url";
import { qrCodeSvg } from "@/lib/qr";
import { createZip } from "@/lib/zip";

export const dynamic = "force-dynamic";

// PNG used to be generated here too, but rasterizing many QR codes
// server-side (no canvas/native codec in the Workers runtime) blew
// Cloudflare's per-request CPU budget — PNG export now happens client-side
// via canvas instead (components/download-all-png-button.tsx). SVG is cheap
// (string generation, not per-pixel work) so it stays server-side.
export async function GET() {
  await requireAdmin();

  const db = await getDb();
  const baseUrl = await getSiteBaseUrl();
  const rows = await db
    .select({ slug: profiles.slug })
    .from(profiles)
    .where(eq(profiles.status, "PUBLISHED"));

  const files = [];
  for (const row of rows) {
    const url = `${baseUrl}/p/${row.slug}?src=qr`;
    files.push({ name: `${row.slug}.svg`, content: await qrCodeSvg(url) });
  }

  const zip = createZip(files);
  return new NextResponse(zip as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="agconnect-qr-codes-svg.zip"`,
    },
  });
}
