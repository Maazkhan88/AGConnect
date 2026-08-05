import { eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { brandThemes, brands, profiles, staff } from "@/db/schema";
import { DEFAULT_THEME, parseSocialLinks, parseThemeValues, type SocialLink } from "@/lib/brand";
import { resolveTheme, themeSchema, type Theme } from "@/lib/theme/theme";

export type PublicProfile = {
  id: string;
  staffId: string;
  slug: string;
  displayName: string;
  jobTitle: string;
  biography: string | null;
  photoPath: string | null;
  location: string | null;
  officeAddress: string | null;
  officeMapUrl: string | null;
  workEmail: string;
  phone: string | null;
  brand: {
    id: string;
    groupId: string;
    slug: string;
    displayName: string;
    website: string | null;
    logoPath: string | null;
    bannerPath: string | null;
    socials: SocialLink[];
  };
  theme: Theme;
};

export async function getPublicProfile(slug: string): Promise<PublicProfile | null> {
  const db = await getDb();

  const [row] = await db
    .select({
      profileId: profiles.id,
      staffId: profiles.staffId,
      slug: profiles.slug,
      jobTitle: profiles.jobTitle,
      biography: profiles.biography,
      photoPath: profiles.photoPath,
      location: profiles.location,
      officeAddress: profiles.officeAddress,
      officeMapUrl: profiles.officeMapUrl,
      status: profiles.status,
      staffDisplayName: staff.displayName,
      staffWorkEmail: staff.workEmail,
      staffPhone: staff.phone,
      staffJobTitle: staff.jobTitleEn,
      brandId: brands.id,
      brandGroupId: brands.groupId,
      brandSlug: brands.slug,
      brandDisplayName: brands.displayName,
      brandWebsite: brands.website,
      brandLogoPath: brands.logoPath,
      brandBannerPath: brands.bannerPath,
      brandSocials: brands.socials,
    })
    .from(profiles)
    .innerJoin(staff, eq(profiles.staffId, staff.id))
    .innerJoin(brands, eq(profiles.brandId, brands.id))
    .where(eq(profiles.slug, slug))
    .limit(1);

  if (!row || row.status !== "PUBLISHED") return null;

  const [groupTheme, brandTheme] = await Promise.all([
    db.query.brandThemes.findFirst({ where: isNull(brandThemes.brandId) }),
    db.query.brandThemes.findFirst({ where: eq(brandThemes.brandId, row.brandId) }),
  ]);

  const base = groupTheme ? { ...DEFAULT_THEME, ...parseThemeValues(groupTheme.values) } : DEFAULT_THEME;
  const theme = resolveTheme(
    themeSchema.parse(base),
    brandTheme ? parseThemeValues(brandTheme.values) : {},
    {},
    new Set(),
    false,
  );

  return {
    id: row.profileId,
    staffId: row.staffId,
    slug: row.slug,
    displayName: row.staffDisplayName,
    jobTitle: row.jobTitle ?? row.staffJobTitle,
    biography: row.biography,
    photoPath: row.photoPath,
    location: row.location,
    officeAddress: row.officeAddress,
    officeMapUrl: row.officeMapUrl,
    workEmail: row.staffWorkEmail,
    phone: row.staffPhone,
    brand: {
      id: row.brandId,
      groupId: row.brandGroupId,
      slug: row.brandSlug,
      displayName: row.brandDisplayName,
      website: row.brandWebsite,
      logoPath: row.brandLogoPath,
      bannerPath: row.brandBannerPath,
      socials: parseSocialLinks(row.brandSocials),
    },
    theme,
  };
}
