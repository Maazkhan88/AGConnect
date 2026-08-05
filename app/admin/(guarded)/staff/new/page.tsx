import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { StaffForm } from "./staff-form";

export default async function NewStaffPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const brandOptions = await db
    .select({ id: brands.id, displayName: brands.displayName })
    .from(brands)
    .where(eq(brands.groupId, admin.context.groupId));

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Staff</p>
          <h1>Add a new staff member</h1>
          <p className="muted">
            Pick a brand and we&apos;ll auto-apply its theme and logo — a permanent public profile is published
            immediately at /p/&lt;slug&gt;.
          </p>
        </div>
      </header>
      <StaffForm brandOptions={brandOptions} />
    </>
  );
}
