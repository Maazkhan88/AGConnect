import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db/client";
import { brands, profiles, staff } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { versionedAssetUrl } from "@/lib/brand";
import { EditStaffForm } from "./edit-form";

export default async function EditStaffPage({ params }: { params: Promise<{ staffId: string }> }) {
  const admin = await requireAdmin();
  const { staffId } = await params;
  const db = await getDb();

  const [staffRow, profileRow, brandOptions] = await Promise.all([
    db.query.staff.findFirst({ where: eq(staff.id, staffId) }),
    db.query.profiles.findFirst({ where: eq(profiles.staffId, staffId) }),
    db.select({ id: brands.id, displayName: brands.displayName }).from(brands).where(eq(brands.groupId, admin.context.groupId)),
  ]);

  if (!staffRow || !profileRow) notFound();

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Staff</p>
          <h1>Edit {staffRow.displayName}</h1>
          <p className="muted">
            Changes apply immediately to the published profile at /p/{profileRow.slug}.
          </p>
        </div>
      </header>
      <EditStaffForm
        staffId={staffRow.id}
        firstName={staffRow.firstName}
        lastName={staffRow.lastName}
        workEmail={staffRow.workEmail}
        jobTitle={profileRow.jobTitle ?? staffRow.jobTitleEn}
        phone={staffRow.phone ?? ""}
        whatsapp={staffRow.whatsapp ?? ""}
        brandId={profileRow.brandId}
        photoPath={versionedAssetUrl(profileRow.photoPath, profileRow.updatedAt)}
        brandOptions={brandOptions}
      />
    </>
  );
}
