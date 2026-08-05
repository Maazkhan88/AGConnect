import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { organizationGroups, brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";

export default async function GroupsPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const group = await db.query.organizationGroups.findFirst({ where: eq(organizationGroups.id, admin.context.groupId) });
  const brandRows = await db.select().from(brands).where(eq(brands.groupId, admin.context.groupId));

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Organization</p>
          <h1>{group?.name ?? "Group"}</h1>
          <p className="muted">
            Slug: {group?.slug} · Status: {group?.status}
          </p>
        </div>
      </header>
      <table className="table">
        <thead>
          <tr>
            <th>Brand</th>
            <th>Slug</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {brandRows.map((brand) => (
            <tr key={brand.id}>
              <td>{brand.displayName}</td>
              <td>{brand.slug}</td>
              <td>
                <span className="pill">{brand.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
