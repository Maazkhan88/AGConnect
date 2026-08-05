import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { BrandForm } from "./brand-form";

export default async function BrandsPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const rows = await db.select().from(brands).where(eq(brands.groupId, admin.context.groupId));

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Brand administration</p>
          <h1>Brands</h1>
          <p className="muted">Manage brand identity, website, and socials. Theme colors live in Brand themes.</p>
        </div>
      </header>
      <table className="table" style={{ marginBottom: 28 }}>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Website</th>
            <th>Socials</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((brand) => (
            <tr key={brand.id}>
              <td>{brand.displayName}</td>
              <td>{brand.website ?? "—"}</td>
              <td>{JSON.parse(brand.socials || "[]").length}</td>
              <td>
                <Link className="text-link" href={`/admin/brands/${brand.id}`}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Add a brand</h2>
      <BrandForm />
    </>
  );
}
