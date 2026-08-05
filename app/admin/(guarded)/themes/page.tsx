import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";

export default async function ThemesPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const rows = await db.select().from(brands).where(eq(brands.groupId, admin.context.groupId));

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Brand themes</p>
          <h1>Choose a brand to edit its theme</h1>
          <p className="muted">Colors, radii, and fonts apply instantly to every published profile under that brand.</p>
        </div>
      </header>
      <table className="table">
        <thead>
          <tr>
            <th>Brand</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((brand) => (
            <tr key={brand.id}>
              <td>{brand.displayName}</td>
              <td>
                <Link className="text-link" href={`/admin/brands/${brand.id}`}>
                  Edit theme
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
