import { eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { profiles, staff, staffBrands } from "@/db/schema";
import { slugify } from "@/lib/brand";
import { uploadProfilePhoto } from "@/lib/storage";

export type NewStaffInput = {
  firstName: string;
  lastName: string;
  workEmail: string;
  jobTitle: string;
  phone: string | null;
  brandId: string;
};

/**
 * Creates a Staff + StaffBrand + a permanently published Profile at /p/<slug>,
 * optionally uploading a photo. Shared by the single "new staff" form
 * (app/admin/actions.ts createStaffAction) and CSV bulk import
 * (bulkImportStaffAction) so both paths stay identical.
 */
export async function createStaffAndProfile(
  db: Database,
  groupId: string,
  input: NewStaffInput,
  photo: File | null,
): Promise<{ slug: string }> {
  const displayName = `${input.firstName} ${input.lastName}`;
  const staffId = crypto.randomUUID();
  const now = Date.now();

  await db.insert(staff).values({
    id: staffId,
    groupId,
    userId: null,
    employeeNumber: `AGH-${now.toString().slice(-6)}`,
    firstName: input.firstName,
    lastName: input.lastName,
    displayName,
    workEmail: input.workEmail,
    jobTitleEn: input.jobTitle || "Team Member",
    phone: input.phone,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(staffBrands).values({
    id: crypto.randomUUID(),
    staffId,
    brandId: input.brandId,
    isPrimary: true,
    joinedAt: now,
  });

  const base = slugify(displayName) || "team-member";
  let slug = base;
  let suffix = 1;
  while (await db.query.profiles.findFirst({ where: eq(profiles.slug, slug) })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  const photoPath = photo && photo.size > 0 ? await uploadProfilePhoto(photo, staffId) : null;

  await db.insert(profiles).values({
    id: crypto.randomUUID(),
    publicId: crypto.randomUUID(),
    slug,
    staffId,
    brandId: input.brandId,
    status: "PUBLISHED",
    indexable: false,
    jobTitle: input.jobTitle || "Team Member",
    photoPath,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  });

  return { slug };
}
