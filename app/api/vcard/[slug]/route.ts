import { NextResponse } from "next/server";
import { getPublicProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) return new NextResponse("Not found", { status: 404 });

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(profile.displayName)}`,
    `ORG:${escape(profile.brand.displayName)}`,
    `TITLE:${escape(profile.jobTitle)}`,
  ];
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${profile.phone}`);
  lines.push(`EMAIL;TYPE=WORK:${profile.workEmail}`);
  if (profile.brand.website) lines.push(`URL:${profile.brand.website}`);
  if (profile.officeAddress) lines.push(`ADR;TYPE=WORK:;;${escape(profile.officeAddress)};;;;`);
  lines.push("END:VCARD");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.vcf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
