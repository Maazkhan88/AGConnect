import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { cards, brands, profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";

export default async function CardsPage() {
  await requireAdmin();
  const db = await getDb();
  const rows = await db
    .select({
      id: cards.id,
      displayNumber: cards.displayNumber,
      status: cards.status,
      brandName: brands.displayName,
      slug: profiles.slug,
    })
    .from(cards)
    .leftJoin(brands, eq(brands.id, cards.brandId))
    .leftJoin(profiles, eq(profiles.id, cards.profileId));

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Physical identity</p>
          <h1>Cards &amp; QR</h1>
          <p className="muted">NFC/QR cards and the profile each is currently assigned to.</p>
        </div>
      </header>
      {rows.length === 0 ? (
        <p className="muted">No cards issued yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Card</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Assigned profile</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.displayNumber}</td>
                <td>{row.brandName ?? "—"}</td>
                <td>
                  <span className="pill">{row.status}</span>
                </td>
                <td>{row.slug ? `/p/${row.slug}` : "Unassigned"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
