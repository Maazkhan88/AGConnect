import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { staff, profiles, brands, staffBrands, adminUsers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/permissions";
import { AdminUsersPanel, type AdminUserRowView } from "./admin-users-panel";

export default async function StaffListPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string }>;
}) {
  const admin = await requireAdmin();
  const { created, updated } = await searchParams;
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

  // "group.manage" is only held by GROUP_ADMIN (see lib/auth/current-user.ts) — the
  // super-admin permission that gates who can invite/remove other admins.
  const canManageAdmins = can(admin.context, "group.manage", { groupId: admin.context.groupId });
  let adminRows: AdminUserRowView[] = [];
  let brandOptions: { id: string; displayName: string }[] = [];
  if (canManageAdmins) {
    const [adminList, brandList] = await Promise.all([
      db.select().from(adminUsers).where(eq(adminUsers.groupId, admin.context.groupId)),
      db.select({ id: brands.id, displayName: brands.displayName }).from(brands).where(eq(brands.groupId, admin.context.groupId)),
    ]);
    adminRows = adminList.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      isSelf: row.id === admin.user.id,
    }));
    brandOptions = brandList;
  }

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">People</p>
          <h1>Staff</h1>
          <p className="muted">Every staff member has a permanent public profile at /p/&lt;slug&gt;.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="button small secondary" href="/admin/staff/import">
            Bulk import CSV
          </Link>
          <Link className="button small" href="/admin/staff/new">
            + New staff member
          </Link>
        </div>
      </header>
      {created && (
        <p className="login-error" style={{ color: "#236342", background: "#e5f2ea", padding: 12, borderRadius: 8 }}>
          Profile published at <a href={`/p/${created}`}>/p/{created}</a>
        </p>
      )}
      {updated && (
        <p className="login-error" style={{ color: "#236342", background: "#e5f2ea", padding: 12, borderRadius: 8 }}>
          Profile updated at <a href={`/p/${updated}`}>/p/{updated}</a>
        </p>
      )}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Title</th>
            <th>Profile</th>
            <th></th>
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
              <td>
                <Link className="text-link" href={`/admin/staff/${row.staffId}/edit`}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {canManageAdmins && <AdminUsersPanel admins={adminRows} brandOptions={brandOptions} />}
    </>
  );
}
