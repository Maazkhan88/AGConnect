"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { brands, brandThemes, profiles, staff, staffBrands } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { assertCan } from "@/lib/auth/permissions";
import { logAudit } from "@/lib/admin/audit";
import { slugify, socialLinksSchema, type SocialLink } from "@/lib/brand";
import { themeSchema } from "@/lib/theme/theme";

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
