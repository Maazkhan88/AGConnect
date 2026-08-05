import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { brands, profiles, staff } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { getSiteBaseUrl } from "@/lib/site-url";
import { qrCodeSvg } from "@/lib/qr";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export default async function CardsExportPage() {
  await requireAdmin();
  const db = await getDb();
  const baseUrl = await getSiteBaseUrl();

  const rows = await db
    .select({
      slug: profiles.slug,
      displayName: staff.displayName,
      brandName: brands.displayName,
    })
    .from(profiles)
    .innerJoin(staff, eq(staff.id, profiles.staffId))
    .leftJoin(brands, eq(brands.id, profiles.brandId))
    .where(eq(profiles.status, "PUBLISHED"));

  const withQr = await Promise.all(
    rows.map(async (row) => ({ ...row, qr: await qrCodeSvg(`${baseUrl}/p/${row.slug}?src=qr`) })),
  );

  return (
    <div style={{ padding: 24 }}>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <p className="eyebrow">Physical identity</p>
          <h1 style={{ fontSize: 22 }}>Export all QR codes</h1>
        </div>
        <PrintButton />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 24,
        }}
      >
        {withQr.map((row) => (
          <div
            key={row.slug}
            style={{
              border: "1px solid #dfe4e1",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              breakInside: "avoid",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: row.qr }} />
            <strong style={{ display: "block", fontSize: 14, marginTop: 8 }}>{row.displayName}</strong>
            <span style={{ display: "block", fontSize: 12, color: "#6c7975" }}>{row.brandName ?? "—"}</span>
            <span style={{ display: "block", fontSize: 11, color: "#6c7975", marginTop: 4 }}>/p/{row.slug}</span>
          </div>
        ))}
      </div>
      <style>{`@media print { .no-print { display: none; } body { background: white; } }`}</style>
    </div>
  );
}
