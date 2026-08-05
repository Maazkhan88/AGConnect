import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { staff, profiles, brands, staffBrands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";

export default async function StaffListPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { created } = await searchParams;
  const db = await getDb();

  const rows = await db
    .select({
      staffId: staff.id,
      displayName: staff.displayName,
      workEmail: staff.workEmail,
      jobTitle: staff.jobTitleEn,
      brandName: brands.displayName,
      slug: profiles.slug,
      status: profiles.status,
    })
    .from(staff)
    .leftJoin(staffBrands, eq(staffBrands.staffId, staff.id))
    .leftJoin(brands, eq(brands.id, staffBrands.brandId))
    .leftJoin(profiles, eq(profiles.staffId, staff.id));

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">People</p>
          <h1>Staff</h1>
          <p className="muted">Every staff member has a permanent public profile at /p/&lt;slug&gt;.</p>
        </div>
        <Link className="button small" href="/admin/staff/new">
          + New staff member
        </Link>
      </header>
      {created && (
        <p className="login-error" style={{ color: "#236342", background: "#e5f2ea", padding: 12, borderRadius: 8 }}>
          Profile published at <a href={`/p/${created}`}>/p/{created}</a>
        </p>
      )}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Title</th>
            <th>Profile</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.staffId}>
              <td>{row.displayName}</td>
              <td>{row.brandName ?? "—"}</td>
              <td>{row.jobTitle}</td>
              <td>
                {row.slug ? (
                  <a className="text-link" href={`/p/${row.slug}`} target="_blank" rel="noreferrer">
                    /p/{row.slug}
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
