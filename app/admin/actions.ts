"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { adminUsers, brands, brandThemes, profiles, staff, staffBrands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { assertCan } from "@/lib/auth/permissions";
import { generateTempPassword, hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/admin/audit";
import { slugify, socialLinksSchema, type SocialLink } from "@/lib/brand";
import { themeSchema } from "@/lib/theme/theme";
import { uploadProfilePhoto } from "@/lib/storage";

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
  const displayName = `${firstName} ${lastName}`;
  const staffId = crypto.randomUUID();
  const now = Date.now();

  await db.insert(staff).values({
    id: staffId,
    groupId: admin.context.groupId,
    userId: null,
    employeeNumber: `AGH-${now.toString().slice(-6)}`,
    firstName,
    lastName,
    displayName,
    workEmail,
    jobTitleEn: jobTitle || "Team Member",
    phone,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(staffBrands).values({
    id: crypto.randomUUID(),
    staffId,
    brandId,
    isPrimary: true,
    joinedAt: now,
  });

  // Generate a unique, permanent public slug — this is what makes the profile visible at /p/<slug>.
  const base = slugify(displayName) || "team-member";
  let slug = base;
  let suffix = 1;
  while (await db.query.profiles.findFirst({ where: eq(profiles.slug, slug) })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  const photoFile = formData.get("photo");
  let photoPath: string | null = null;
  if (photoFile instanceof File && photoFile.size > 0) {
    try {
      photoPath = await uploadProfilePhoto(photoFile, staffId);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not upload photo." };
    }
  }

  const profileId = crypto.randomUUID();
  await db.insert(profiles).values({
    id: profileId,
    publicId: crypto.randomUUID(),
    slug,
    staffId,
    brandId,
    status: "PUBLISHED",
    indexable: false,
    jobTitle: jobTitle || "Team Member",
    photoPath,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  });

  await logAudit({
    groupId: admin.context.groupId,
    brandId,
    actorId: admin.user.id,
    action: "staff.create",
    entityType: "Staff",
    entityId: staffId,
    metadata: { profileSlug: slug },
  });

  revalidatePath("/admin/staff");
  redirect(`/admin/staff?created=${slug}`);
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
