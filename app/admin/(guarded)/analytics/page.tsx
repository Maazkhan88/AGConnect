import { count, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { profiles, brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { countEvents } from "@/lib/admin/analytics";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const brandRows = await db.select().from(brands).where(eq(brands.groupId, admin.context.groupId));
  const perBrand = await Promise.all(
    brandRows.map(async (brand) => {
      const [profileRow, qrScans, cardTaps] = await Promise.all([
        db.select({ value: count() }).from(profiles).where(eq(profiles.brandId, brand.id)),
        countEvents(db, admin.context.groupId, "qr_scan", brand.id),
        countEvents(db, admin.context.groupId, "card_tap", brand.id),
      ]);
      return { name: brand.displayName, profiles: profileRow[0].value, qrScans, cardTaps };
    }),
  );

  const totalQrScans = perBrand.reduce((sum, row) => sum + row.qrScans, 0);
  const totalCardTaps = perBrand.reduce((sum, row) => sum + row.cardTaps, 0);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Insights</p>
          <h1>Analytics</h1>
          <p className="muted">QR scans and NFC card taps per brand.</p>
        </div>
      </header>
      <div className="metric-grid">
        <article className="metric">
          <span className="muted">QR scans (all time)</span>
          <strong>{totalQrScans}</strong>
        </article>
        <article className="metric">
          <span className="muted">Card taps (all time)</span>
          <strong>{totalCardTaps}</strong>
        </article>
      </div>
      <table className="table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Published profiles</th>
            <th>QR scans</th>
            <th>Card taps</th>
          </tr>
        </thead>
        <tbody>
          {perBrand.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.profiles}</td>
              <td>{row.qrScans}</td>
              <td>{row.cardTaps}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
