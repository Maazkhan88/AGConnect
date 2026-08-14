import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { leads, brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";

export default async function LeadsPage() {
  await requireAdmin();
  const db = await getDb();
  const rows = await db
    .select({ id: leads.id, fullName: leads.fullName, email: leads.email, phone: leads.phone, status: leads.status, brandName: brands.displayName })
    .from(leads)
    .leftJoin(brands, eq(brands.id, leads.brandId));

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1>Leads</h1>
          <p className="muted">Contacts captured from public profiles across all brands.</p>
        </div>
      </header>
      {rows.length === 0 ? (
        <div className="empty-state">
          <strong>No leads captured yet</strong>
          <p>
            Leads appear here as soon as a visitor shares their details from a published profile.
          </p>
        </div>
      ) : (
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.fullName}</td>
                <td>{row.brandName ?? "—"}</td>
                <td>{row.email ?? row.phone ?? "—"}</td>
                <td>
                  <span className="pill">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}
