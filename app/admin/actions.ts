"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { adminUsers, brands, brandThemes, cards, profiles, staff, staffBrands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { assertCan } from "@/lib/auth/permissions";
import { generateTempPassword, hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/admin/audit";
import { slugify, socialLinksSchema, type SocialLink } from "@/lib/brand";
import { themeSchema } from "@/lib/theme/theme";
import { uploadProfilePhoto } from "@/lib/storage";
import { createStaffAndProfile, type NewStaffInput } from "@/lib/admin/create-staff";

export type FormState = { error?: string; ok?: boolean };

function parseSocialRows(formData: FormData): SocialLink[] {
  const platforms = formData.getAll("social_platform") as string[];
  const urls = formData.getAll("social_url") as string[];
  const rows = platforms
    .map((platform, index) => ({ platform, url: urls[index] }))
    .filter((row) => row.platform && row.url);
  const parsed = socialLinksSchema.safeParse(rows);
  return parsed.success ? parsed.data : [];
}

export async function createOrUpdateBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const brandId = String(formData.get("id") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  if (!displayName) return { error: "Brand name is required." };

  assertCan(admin.context, brandId ? "brand.update" : "brand.create", {
    groupId: admin.context.groupId,
    brandId: brandId || null,
  });

  const db = await getDb();
  const socials = parseSocialRows(formData);

  if (brandId) {
    await db
      .update(brands)
      .set({ displayName, name: displayName, website, whatsapp, socials: JSON.stringify(socials), updatedAt: Date.now() })
      .where(eq(brands.id, brandId));
    await logAudit({ groupId: admin.context.groupId, brandId, actorId: admin.user.id, action: "brand.update", entityType: "Brand", entityId: brandId });
  } else {
    const id = crypto.randomUUID();
    const slug = slugify(displayName);
    const now = Date.now();
    await db.insert(brands).values({
      id,
      groupId: admin.context.groupId,
      name: displayName,
      displayName,
      slug,
      website,
      whatsapp,
      logoPath: null,
      socials: JSON.stringify(socials),
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    });
    await logAudit({ groupId: admin.context.groupId, brandId: id, actorId: admin.user.id, action: "brand.create", entityType: "Brand", entityId: id });
  }

  revalidatePath("/admin/brands");
  revalidatePath("/admin/themes");
  return { ok: true };
}

export async function updateBrandThemeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "");
  const themeId = String(formData.get("themeId") ?? "") || null;
  if (!brandId) return { error: "Missing brand." };

  assertCan(admin.context, "brand.theme.manage", { groupId: admin.context.groupId, brandId });

  const values = {
    primary: String(formData.get("primary")),
    secondary: String(formData.get("secondary")),
    accent: String(formData.get("accent")),
    background: String(formData.get("background")),
    surface: String(formData.get("surface")),
    text: String(formData.get("text")),
    textMuted: String(formData.get("textMuted")),
    border: String(formData.get("border")),
    buttonPrimary: String(formData.get("buttonPrimary")),
    buttonPrimaryText: String(formData.get("buttonPrimaryText")),
    buttonSecondary: String(formData.get("buttonSecondary")),
    buttonSecondaryText: String(formData.get("buttonSecondaryText")),
    cardRadius: Number(formData.get("cardRadius")),
    buttonRadius: Number(formData.get("buttonRadius")),
    fontHeading: String(formData.get("fontHeading")),
    fontBody: String(formData.get("fontBody")),
  };
  const parsed = themeSchema.safeParse(values);
  if (!parsed.success) return { error: "Some theme values are invalid — check the color fields are hex codes." };

  const db = await getDb();
  const now = Date.now();
  if (themeId) {
    await db.update(brandThemes).set({ values: JSON.stringify(parsed.data), updatedAt: now }).where(eq(brandThemes.id, themeId));
  } else {
    await db.insert(brandThemes).values({
      id: crypto.randomUUID(),
      groupId: admin.context.groupId,
      brandId,
      name: "Custom theme",
      values: JSON.stringify(parsed.data),
      createdAt: now,
      updatedAt: now,
    });
  }
  await logAudit({ groupId: admin.context.groupId, brandId, actorId: admin.user.id, action: "brand.theme.update", entityType: "BrandTheme", entityId: themeId ?? brandId });

  revalidatePath("/admin/themes");
  revalidatePath(`/admin/brands/${brandId}`);
  return { ok: true };
}

export async function createStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const workEmail = String(formData.get("workEmail") ?? "").trim().toLowerCase();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const brandId = String(formData.get("brandId") ?? "");
  const phone = String(formData.get("phone") ?? "").trim() || null;
  if (!firstName || !lastName || !workEmail || !brandId) {
    return { error: "Name, work email, and brand are required." };
  }

  assertCan(admin.context, "staff.create", { groupId: admin.context.groupId, brandId });

  const db = await getDb();
  const photoFile = formData.get("photo");

  let result: { slug: string };
  try {
    result = await createStaffAndProfile(
      db,
      admin.context.groupId,
      { firstName, lastName, workEmail, jobTitle, phone, brandId },
      photoFile instanceof File ? photoFile : null,
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create staff member." };
  }

  await logAudit({
    groupId: admin.context.groupId,
    brandId,
    actorId: admin.user.id,
    action: "staff.create",
    entityType: "Staff",
    entityId: result.slug,
    metadata: { profileSlug: result.slug },
  });

  revalidatePath("/admin/staff");
  redirect(`/admin/staff?created=${result.slug}`);
}

export async function updateStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const staffId = String(formData.get("staffId") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const workEmail = String(formData.get("workEmail") ?? "").trim().toLowerCase();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const brandId = String(formData.get("brandId") ?? "");
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const removePhoto = formData.get("removePhoto") === "on";
  if (!staffId || !firstName || !lastName || !workEmail || !brandId) {
    return { error: "Name, work email, and brand are required." };
  }

  assertCan(admin.context, "staff.update", { groupId: admin.context.groupId, brandId });

  const db = await getDb();
  const existingProfile = await db.query.profiles.findFirst({ where: eq(profiles.staffId, staffId) });
  if (!existingProfile) return { error: "Staff member not found." };

  const now = Date.now();
  await db
    .update(staff)
    .set({
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      workEmail,
      jobTitleEn: jobTitle || "Team Member",
      phone,
      updatedAt: now,
    })
    .where(eq(staff.id, staffId));

  // This app's flow keeps one brand membership per staff member — update it in place
  // rather than delete/insert, so joinedAt history is preserved.
  if (brandId !== existingProfile.brandId) {
    await db.update(staffBrands).set({ brandId }).where(eq(staffBrands.staffId, staffId));
  }

  const photoFile = formData.get("photo");
  let photoPath = existingProfile.photoPath;
  if (photoFile instanceof File && photoFile.size > 0) {
    try {
      photoPath = await uploadProfilePhoto(photoFile, staffId);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not upload photo." };
    }
  } else if (removePhoto) {
    photoPath = null;
  }

  await db
    .update(profiles)
    .set({ brandId, jobTitle: jobTitle || "Team Member", photoPath, updatedAt: now })
    .where(eq(profiles.staffId, staffId));

  await logAudit({
    groupId: admin.context.groupId,
    brandId,
    actorId: admin.user.id,
    action: "staff.update",
    entityType: "Staff",
    entityId: staffId,
    metadata: { profileSlug: existingProfile.slug },
  });

  revalidatePath("/admin/staff");
  redirect(`/admin/staff?updated=${existingProfile.slug}`);
}

// ---------------------------------------------------------------------------
// Bulk CSV import — reuses createStaffAndProfile so every row goes through the
// exact same validation/slug/photo logic as the single "new staff" form.
// Rows are submitted as JSON (already reviewed/edited client-side in
// app/admin/(guarded)/staff/import/import-client.tsx) plus optional per-row
// photo files keyed "photo_<rowId>".
// ---------------------------------------------------------------------------

export type BulkImportResult = {
  rowId: string;
  ok: boolean;
  slug?: string;
  error?: string;
};

export async function bulkImportStaffAction(formData: FormData): Promise<BulkImportResult[]> {
  const admin = await requireAdmin();
  const db = await getDb();

  const rowsJson = String(formData.get("rows") ?? "[]");
  let rows: (NewStaffInput & { rowId: string })[];
  try {
    rows = JSON.parse(rowsJson);
  } catch {
    return [{ rowId: "_all", ok: false, error: "Malformed import payload." }];
  }

  const results: BulkImportResult[] = [];
  for (const row of rows) {
    if (!row.firstName || !row.lastName || !row.workEmail || !row.brandId) {
      results.push({ rowId: row.rowId, ok: false, error: "Missing required field." });
      continue;
    }
    try {
      assertCan(admin.context, "staff.create", { groupId: admin.context.groupId, brandId: row.brandId });
      const photoFile = formData.get(`photo_${row.rowId}`);
      const { slug } = await createStaffAndProfile(
        db,
        admin.context.groupId,
        row,
        photoFile instanceof File ? photoFile : null,
      );
      await logAudit({
        groupId: admin.context.groupId,
        brandId: row.brandId,
        actorId: admin.user.id,
        action: "staff.create",
        entityType: "Staff",
        entityId: slug,
        metadata: { profileSlug: slug, via: "bulk_import" },
      });
      results.push({ rowId: row.rowId, ok: true, slug });
    } catch (error) {
      results.push({ rowId: row.rowId, ok: false, error: error instanceof Error ? error.message : "Failed." });
    }
  }

  revalidatePath("/admin/staff");
  return results;
}

// ---------------------------------------------------------------------------
// Admin-user management (invite / revoke) — gated to super-admins (GROUP_ADMIN,
// the only role that holds "group.manage") via can()/assertCan(). Reuses the
// same session/password stack as the login flow — no parallel auth system.
// ---------------------------------------------------------------------------

export type InviteAdminState = FormState & { tempPassword?: string; email?: string };

export async function inviteAdminAction(_prev: InviteAdminState, formData: FormData): Promise<InviteAdminState> {
  const admin = await requireAdmin();
  assertCan(admin.context, "group.manage", { groupId: admin.context.groupId });

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "BRAND_ADMIN");
  const brandId = String(formData.get("brandId") ?? "");
  if (!name || !email) return { error: "Name and email are required." };
  if (role !== "GROUP_ADMIN" && role !== "BRAND_ADMIN") return { error: "Invalid role." };

  const db = await getDb();
  const existing = await db.query.adminUsers.findFirst({ where: eq(adminUsers.email, email) });
  if (existing) return { error: "An admin with this email already exists." };

  const tempPassword = generateTempPassword();
  const now = Date.now();
  const id = crypto.randomUUID();

  await db.insert(adminUsers).values({
    id,
    groupId: admin.context.groupId,
    email,
    name,
    passwordHash: await hashPassword(tempPassword),
    role,
    // BRAND_ADMIN scoped to one brand if chosen; empty array = every brand in the group.
    brandIds: role === "BRAND_ADMIN" && brandId ? JSON.stringify([brandId]) : "[]",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });

  await logAudit({
    groupId: admin.context.groupId,
    brandId: role === "BRAND_ADMIN" ? brandId || null : null,
    actorId: admin.user.id,
    action: "admin.invite",
    entityType: "AdminUser",
    entityId: id,
    metadata: { email, role },
  });

  revalidatePath("/admin/staff");
  // The temp password is shown once, here, and never stored in plaintext or logged elsewhere.
  return { ok: true, tempPassword, email };
}

export type ResetAdminPasswordState = FormState & { tempPassword?: string; email?: string };

export async function resetAdminPasswordAction(
  _prev: ResetAdminPasswordState,
  formData: FormData,
): Promise<ResetAdminPasswordState> {
  const admin = await requireAdmin();
  assertCan(admin.context, "group.manage", { groupId: admin.context.groupId });

  const adminUserId = String(formData.get("adminUserId") ?? "");
  if (!adminUserId) return { error: "Missing admin user." };

  const db = await getDb();
  const target = await db.query.adminUsers.findFirst({ where: eq(adminUsers.id, adminUserId) });
  if (!target) return { error: "Admin not found." };

  const tempPassword = generateTempPassword();
  await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(tempPassword), updatedAt: Date.now() })
    .where(eq(adminUsers.id, adminUserId));

  await logAudit({
    groupId: admin.context.groupId,
    actorId: admin.user.id,
    action: "admin.reset_password",
    entityType: "AdminUser",
    entityId: adminUserId,
    metadata: { email: target.email },
  });

  revalidatePath("/admin/staff");
  // Same one-time-display pattern as invite: never stored in plaintext or logged elsewhere.
  return { ok: true, tempPassword, email: target.email };
}

export async function revokeAdminAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  assertCan(admin.context, "group.manage", { groupId: admin.context.groupId });

  const adminUserId = String(formData.get("adminUserId") ?? "");
  if (!adminUserId) return;
  if (adminUserId === admin.user.id) return; // cannot revoke yourself

  const db = await getDb();
  // Soft-revoke — consistent with the rest of the app's status-column pattern
  // (staff.status, profiles.status, brands.status) rather than a hard delete.
  await db.update(adminUsers).set({ status: "SUSPENDED", updatedAt: Date.now() }).where(eq(adminUsers.id, adminUserId));

  await logAudit({
    groupId: admin.context.groupId,
    actorId: admin.user.id,
    action: "admin.revoke",
    entityType: "AdminUser",
    entityId: adminUserId,
  });

  revalidatePath("/admin/staff");
}

// ---------------------------------------------------------------------------
// Cards & QR — every published profile gets a QR code for free (it's just an
// encoding of its public URL, see lib/qr.ts); a physical NFC card is a
// separate thing you issue on top of that.
// ---------------------------------------------------------------------------

export async function issueCardAction(profileId: string): Promise<void> {
  const admin = await requireAdmin();
  const db = await getDb();

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, profileId) });
  if (!profile) return;

  assertCan(admin.context, "card.create", { groupId: admin.context.groupId, brandId: profile.brandId });

  const existing = await db.query.cards.findFirst({ where: eq(cards.profileId, profileId) });
  if (existing) return;

  const now = Date.now();
  const existingCards = await db.select({ id: cards.id }).from(cards).where(eq(cards.brandId, profile.brandId));
  const cardId = crypto.randomUUID();

  await db.insert(cards).values({
    id: cardId,
    publicId: crypto.randomUUID(),
    brandId: profile.brandId,
    profileId,
    displayNumber: `CARD-${(existingCards.length + 1).toString().padStart(4, "0")}`,
    nfcToken: crypto.randomUUID(),
    status: "ASSIGNED",
    createdAt: now,
    updatedAt: now,
  });

  await logAudit({
    groupId: admin.context.groupId,
    brandId: profile.brandId,
    actorId: admin.user.id,
    action: "card.issue",
    entityType: "Card",
    entityId: cardId,
    metadata: { profileId },
  });

  revalidatePath("/admin/cards");
}
