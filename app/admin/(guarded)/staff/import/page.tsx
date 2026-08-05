import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { brands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { ImportClient } from "./import-client";

export default async function StaffImportPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const brandOptions = await db
    .select({ id: brands.id, displayName: brands.displayName, slug: brands.slug })
    .from(brands)
    .where(eq(brands.groupId, admin.context.groupId));

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Staff</p>
          <h1>Bulk import from CSV</h1>
          <p className="muted">
            Columns: firstName, lastName, workEmail, jobTitle, phone, brand (brand name or slug). Review, edit, and
            attach photos below before publishing — nothing is created until you click Import.
          </p>
        </div>
      </header>
      <ImportClient brandOptions={brandOptions} />
    </>
  );
}
