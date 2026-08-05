/**
 * Seed script for the AGConnect D1 database.
 *
 * Usage:
 *   pnpm db:seed                      # writes db/seed.sql (prints the admin password once)
 *   pnpm db:seed:local                # writes it and applies it to the local D1 database
 *
 * Brand colours were sampled from the dominant pixels of each `public/brands/<slug>/logo.png`
 * and are a starting point — they are editable afterwards in Admin → Brand themes.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateTempPassword, hashPassword } from "../lib/auth/password";
import { DEFAULT_THEME, type SocialLink } from "../lib/brand";
import type { Theme } from "../lib/theme/theme";

type BrandSeed = {
  slug: string;
  name: string;
  displayName: string;
  shortName: string;
  website: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  theme: Partial<Theme>;
  socials: SocialLink[];
};

const BRANDS: BrandSeed[] = [
  {
    slug: "ag-holding",
    name: "AG Holding",
    displayName: "AG Holding",
    shortName: "AG",
    website: "https://www.agholding.ae",
    email: "info@agholding.ae",
    phone: "+97142000000",
    whatsapp: null,
    theme: {
      primary: "#08262d",
      secondary: "#4b8065",
      accent: "#c49345",
      background: "#eef1ef",
      surface: "#ffffff",
      text: "#08262d",
      textMuted: "#6c7975",
      border: "#dfe4e1",
      buttonPrimary: "#08262d",
      buttonPrimaryText: "#ffffff",
      buttonSecondary: "#ffffff",
      buttonSecondaryText: "#08262d",
    },
    socials: [{ platform: "linkedin", url: "https://www.linkedin.com/company/arms-group" }],
  },
  {
    slug: "ghezlan",
    name: "Ghezlan Equestrian",
    displayName: "Ghezlan",
    shortName: "GH",
    website: "https://ghezlan.ae",
    email: null,
    phone: null,
    whatsapp: null,
    theme: {
      primary: "#2b2b2b",
      secondary: "#f5b231",
      accent: "#b8791d",
      background: "#f6f4ef",
      surface: "#ffffff",
      text: "#221f1a",
      textMuted: "#7c766c",
      border: "#e4ded1",
      buttonPrimary: "#2b2b2b",
      buttonPrimaryText: "#ffffff",
      buttonSecondary: "#ffffff",
      buttonSecondaryText: "#2b2b2b",
    },
    socials: [
      { platform: "instagram", url: "https://www.instagram.com/ghezlan.ae" },
      { platform: "facebook", url: "https://www.facebook.com/share/15fVdw5sMy/" },
      { platform: "linkedin", url: "https://www.linkedin.com/company/ghezlan-equestrian/" },
      { platform: "tiktok", url: "https://www.tiktok.com/@ghezlan.ae4" },
      { platform: "snapchat", url: "https://www.snapchat.com/@ghezlan.ae" },
    ],
  },
  {
    slug: "ian",
    name: "IAN Sustainable Solutions",
    displayName: "IAN",
    shortName: "IAN",
    website: "https://ian.ae",
    email: null,
    phone: "+971542395760",
    whatsapp: "https://wa.me/971542395760",
    theme: {
      primary: "#1176bc",
      secondary: "#8cc540",
      accent: "#5aa02a",
      background: "#eef4f8",
      surface: "#ffffff",
      text: "#10303f",
      textMuted: "#66808e",
      border: "#d8e4ec",
      buttonPrimary: "#1176bc",
      buttonPrimaryText: "#ffffff",
      buttonSecondary: "#ffffff",
      buttonSecondaryText: "#1176bc",
    },
    socials: [
      { platform: "facebook", url: "https://www.facebook.com/profile.php?id=61572955687191" },
      { platform: "instagram", url: "https://www.instagram.com/ian.solutions" },
      { platform: "linkedin", url: "https://www.linkedin.com/company/ian-sustainable-solutions-ae" },
      { platform: "whatsapp", url: "https://wa.me/971542395760" },
    ],
  },
  {
    slug: "novascape",
    name: "Novascape Landscaping",
    displayName: "Novascape",
    shortName: "NS",
    website: "https://novascape.ae",
    email: null,
    phone: null,
    whatsapp: null,
    theme: {
      primary: "#234844",
      secondary: "#3c7a6f",
      accent: "#8fbfae",
      background: "#eef2ef",
      surface: "#ffffff",
      text: "#17302d",
      textMuted: "#6d827c",
      border: "#dbe5e0",
      buttonPrimary: "#234844",
      buttonPrimaryText: "#ffffff",
      buttonSecondary: "#ffffff",
      buttonSecondaryText: "#234844",
    },
    socials: [
      { platform: "instagram", url: "https://www.instagram.com/novascape.ae" },
      { platform: "facebook", url: "https://www.facebook.com/share/192SAFBTy8/" },
      { platform: "tiktok", url: "https://www.tiktok.com/@novascape.ae" },
      { platform: "linkedin", url: "https://www.linkedin.com/company/novascape-landscaping" },
    ],
  },
  {
    slug: "wisdom",
    name: "Wisdom Veterinary Clinic",
    displayName: "Wisdom Vet",
    shortName: "WV",
    website: "https://wisdomvet.ae",
    email: null,
    phone: null,
    whatsapp: null,
    theme: {
      primary: "#17a7dc",
      secondary: "#1a1b1c",
      accent: "#0e86b4",
      background: "#eef6fa",
      surface: "#ffffff",
      text: "#101d24",
      textMuted: "#68808c",
      border: "#d5e6ee",
      buttonPrimary: "#17a7dc",
      buttonPrimaryText: "#ffffff",
      buttonSecondary: "#ffffff",
      buttonSecondaryText: "#0e86b4",
    },
    socials: [
      { platform: "facebook", url: "https://www.facebook.com/people/Wisdom-Vet/61572897967784" },
      { platform: "instagram", url: "https://www.instagram.com/wisdomvet" },
      { platform: "linkedin", url: "https://www.linkedin.com/company/wisdom-vet" },
    ],
  },
  {
    slug: "aefm",
    name: "AEFM Facilities Management",
    displayName: "AEFM",
    shortName: "AEFM",
    website: "https://aefm.ae",
    email: null,
    phone: "+971564228343",
    whatsapp: "https://wa.me/971564228343",
    theme: {
      primary: "#213850",
      secondary: "#b79747",
      accent: "#9a7e31",
      background: "#f1f2f4",
      surface: "#ffffff",
      text: "#1a2a3a",
      textMuted: "#6f7c89",
      border: "#dde1e6",
      buttonPrimary: "#213850",
      buttonPrimaryText: "#ffffff",
      buttonSecondary: "#ffffff",
      buttonSecondaryText: "#213850",
    },
    socials: [{ platform: "whatsapp", url: "https://wa.me/971564228343" }],
  },
  {
    slug: "aepm",
    name: "AEPM Property Management",
    displayName: "AEPM",
    shortName: "AEPM",
    website: "https://aepm.ae",
    email: null,
    phone: "+971561291299",
    whatsapp: "https://wa.me/971561291299",
    theme: {
      primary: "#2b4666",
      secondary: "#c6a759",
      accent: "#a7893a",
      background: "#f2f3f6",
      surface: "#ffffff",
      text: "#1d2c40",
      textMuted: "#71809a",
      border: "#dee2ea",
      buttonPrimary: "#2b4666",
      buttonPrimaryText: "#ffffff",
      buttonSecondary: "#ffffff",
      buttonSecondaryText: "#2b4666",
    },
    socials: [{ platform: "whatsapp", url: "https://wa.me/971561291299" }],
  },
];

const now = Date.now();
const quote = (value: unknown): string =>
  value === null || value === undefined ? "NULL" : `'${String(value).replace(/'/g, "''")}'`;

function insert(table: string, row: Record<string, unknown>): string {
  const columns = Object.keys(row);
  return `INSERT OR REPLACE INTO ${table} (${columns.map((column) => `"${column}"`).join(", ")}) VALUES (${columns
    .map((column) => quote(row[column]))
    .join(", ")});`;
}

async function main() {
  const statements: string[] = [
    "-- Generated by db/seed.ts — do not edit by hand.",
    "PRAGMA defer_foreign_keys = true;",
  ];

  const groupId = "grp_ag_holding";
  statements.push(
    insert("organization_groups", {
      id: groupId,
      name: "AG Holding",
      slug: "ag-holding",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    }),
  );

  // Group baseline theme (brand themes are layered on top of this via resolveTheme()).
  statements.push(
    insert("brand_themes", {
      id: "thm_group_default",
      group_id: groupId,
      brand_id: null,
      name: "AG Holding group baseline",
      values: JSON.stringify(DEFAULT_THEME),
      created_at: now,
      updated_at: now,
    }),
  );

  for (const brand of BRANDS) {
    const brandId = `brn_${brand.slug.replace(/-/g, "_")}`;
    statements.push(
      insert("brands", {
        id: brandId,
        group_id: groupId,
        name: brand.name,
        legal_name: brand.name,
        display_name: brand.displayName,
        short_name: brand.shortName,
        slug: brand.slug,
        website: brand.website,
        email: brand.email,
        phone: brand.phone,
        whatsapp: brand.whatsapp,
        logo_path: `/brands/${brand.slug}/logo.png`,
        socials: JSON.stringify(brand.socials),
        default_language: "en",
        supported_languages: JSON.stringify(["en", "ar"]),
        status: "ACTIVE",
        created_at: now,
        updated_at: now,
      }),
    );
    statements.push(
      insert("brand_themes", {
        id: `thm_${brand.slug.replace(/-/g, "_")}`,
        group_id: groupId,
        brand_id: brandId,
        name: `${brand.displayName} theme`,
        values: JSON.stringify(brand.theme),
        created_at: now,
        updated_at: now,
      }),
    );
  }

  // The original hardcoded profile, preserved verbatim so /p/maaz-khan does not regress.
  const staffId = "stf_maaz_khan";
  const profileId = "prf_maaz_khan";
  statements.push(
    insert("staff", {
      id: staffId,
      group_id: groupId,
      user_id: null,
      employee_number: "AGH-0001",
      first_name: "Maaz",
      last_name: "Khan",
      display_name: "Maaz Khan",
      work_email: "maaz.khan@agholding.ae",
      job_title_en: "Head of Marketing",
      job_title_ar: null,
      phone: "+971502138765",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    }),
    insert("staff_brands", {
      id: "sfb_maaz_khan",
      staff_id: staffId,
      brand_id: "brn_ag_holding",
      department_id: null,
      is_primary: 1,
      joined_at: now,
    }),
    insert("profiles", {
      id: profileId,
      public_id: "pub_maaz_khan",
      slug: "maaz-khan",
      staff_id: staffId,
      brand_id: "brn_ag_holding",
      status: "PUBLISHED",
      indexable: 0,
      job_title: "Head of Marketing",
      biography: null,
      photo_path: "/profiles/maaz-khan.jpeg",
      location: "Dubai, United Arab Emirates",
      office_address: "2nd Floor, AG Holding Building\nUmm Ramoul, Dubai, UAE",
      office_map_url: "https://maps.google.com/?q=AG+Holding+Building+Umm+Ramoul+Dubai+UAE",
      published_at: now,
      created_at: now,
      updated_at: now,
    }),
    insert("cards", {
      id: "crd_maaz_khan",
      public_id: "pubcrd_maaz_khan",
      brand_id: "brn_ag_holding",
      profile_id: profileId,
      display_number: "AGC-1001",
      nfc_token: "nfc_maaz_khan_0001",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    }),
  );

  // The first super-admin (GROUP_ADMIN = every permission in lib/auth/permissions.ts,
  // including group.manage) — seeded to the product owner's real email so there is
  // always at least one account that can sign in and invite everyone else.
  const adminEmail = process.env.ADMIN_EMAIL ?? "maaz.n.khan@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? generateTempPassword();
  statements.push(
    insert("admin_users", {
      id: "adm_root",
      group_id: groupId,
      email: adminEmail,
      name: "Maaz Khan",
      password_hash: await hashPassword(adminPassword),
      role: "GROUP_ADMIN",
      brand_ids: "[]",
      status: "ACTIVE",
      created_at: now,
      updated_at: now,
    }),
    insert("audit_logs", {
      id: "aud_seed",
      group_id: groupId,
      brand_id: null,
      actor_id: "adm_root",
      action: "seed.run",
      entity_type: "OrganizationGroup",
      entity_id: groupId,
      metadata: JSON.stringify({ brands: BRANDS.length }),
      created_at: now,
    }),
  );

  const target = join(process.cwd(), "db", "seed.sql");
  writeFileSync(target, `${statements.join("\n")}\n`, "utf8");

  console.log(`Wrote ${target} (${statements.length - 2} rows).`);
  console.log("");
  console.log("Admin login");
  console.log(`  email:    ${adminEmail}`);
  console.log(
    process.env.ADMIN_PASSWORD
      ? "  password: (taken from ADMIN_PASSWORD)"
      : `  password: ${adminPassword}   <-- store this now, it is not recoverable`,
  );
}

void main();
