import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { getSiteBaseUrl } from "@/lib/site-url";
import { qrCodeSvg, qrCodePngBytes } from "@/lib/qr";
import { createZip } from "@/lib/zip";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ format: string }> }) {
  await requireAdmin();
  const { format } = await params;
  if (format !== "svg" && format !== "png") {
    return new NextResponse("Unknown format — use svg or png.", { status: 400 });
  }

  const db = await getDb();
  const baseUrl = await getSiteBaseUrl();
  const rows = await db
    .select({ slug: profiles.slug })
    .from(profiles)
    .where(eq(profiles.status, "PUBLISHED"));

  // Sequential, not Promise.all — PNG generation is real per-pixel CPU work
  // with no native codec available here, so holding every profile's buffer
  // in memory at once is worth avoiding even though it doesn't change the
  // total CPU spent either way.
  const files: { name: string; content: string | Uint8Array }[] = [];
  for (const row of rows) {
    const url = `${baseUrl}/p/${row.slug}?src=qr`;
    if (format === "svg") {
      files.push({ name: `${row.slug}.svg`, content: await qrCodeSvg(url) });
    } else {
      files.push({ name: `${row.slug}.png`, content: await qrCodePngBytes(url) });
    }
  }

  const zip = createZip(files);
  return new NextResponse(zip as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="agconnect-qr-codes-${format}.zip"`,
    },
  });
}
