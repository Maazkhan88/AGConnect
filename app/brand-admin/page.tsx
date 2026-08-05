import { count, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { brands, profiles, cards, leads } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";

export default async function BrandAdminPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const [brand] = await db.select().from(brands).where(eq(brands.groupId, admin.context.groupId)).limit(1);

  const [[staffCount], [cardCount], [leadCount]] = await Promise.all([
    db.select({ value: count() }).from(profiles).where(eq(profiles.brandId, brand?.id ?? "")),
    db.select({ value: count() }).from(cards).where(eq(cards.brandId, brand?.id ?? "")),
    db.select({ value: count() }).from(leads).where(eq(leads.brandId, brand?.id ?? "")),
  ]);

  const metrics: [string, number][] = [
    ["Published profiles", staffCount.value],
    ["Active cards", cardCount.value],
    ["Leads this month", leadCount.value],
  ];

  return (
    <main className="workspace">
      <p className="eyebrow">Brand administration</p>
      <h1>{brand?.displayName ?? "Brand"}</h1>
      <p className="muted">Manage people, profiles, theme drafts, cards, and leads for this brand.</p>
      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <article className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </main>
  );
}
