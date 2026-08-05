import { count, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { profiles, brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";

export default async function AnalyticsPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const brandRows = await db.select().from(brands).where(eq(brands.groupId, admin.context.groupId));
  const perBrand = await Promise.all(
    brandRows.map(async (brand) => {
      const [row] = await db.select({ value: count() }).from(profiles).where(eq(profiles.brandId, brand.id));
      return { name: brand.displayName, profiles: row.value };
    }),
  );

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Insights</p>
          <h1>Analytics</h1>
          <p className="muted">Published profiles per brand. Card taps and lead conversions arrive once analytics events are wired up.</p>
        </div>
      </header>
      <table className="table">
        <thead>
          <tr>
            <th>Brand</th>
            <th>Published profiles</th>
          </tr>
        </thead>
        <tbody>
          {perBrand.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.profiles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
