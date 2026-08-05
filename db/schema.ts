import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Drizzle/D1 port of `prisma/schema.prisma`. Field names and relations mirror the Prisma
 * models (see DATA_MODEL.md / RBAC.md) so the docs stay accurate. Prisma is superseded by
 * this file and is kept only for reference.
 */

const id = () => text("id").primaryKey();
const createdAt = () => integer("created_at").notNull();
const updatedAt = () => integer("updated_at").notNull();

export const organizationGroups = sqliteTable("organization_groups", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  archivedAt: integer("archived_at"),
});

export const brands = sqliteTable(
  "brands",
  {
    id: id(),
    groupId: text("group_id")
      .notNull()
      .references(() => organizationGroups.id),
    name: text("name").notNull(),
    legalName: text("legal_name"),
    displayName: text("display_name").notNull(),
    shortName: text("short_name"),
    slug: text("slug").notNull(),
    website: text("website"),
    email: text("email"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    logoPath: text("logo_path"),
    bannerPath: text("banner_path"),
    /** JSON array of `{ platform, url }` — see `lib/brand.ts`. */
    socials: text("socials").notNull().default("[]"),
    defaultLanguage: text("default_language").notNull().default("en"),
    supportedLanguages: text("supported_languages").notNull().default('["en","ar"]'),
    status: text("status").notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    archivedAt: integer("archived_at"),
  },
  (table) => [
    uniqueIndex("brands_group_slug_key").on(table.groupId, table.slug),
    index("brands_group_status_idx").on(table.groupId, table.status),
  ],
);

export const brandThemes = sqliteTable(
  "brand_themes",
  {
    id: id(),
    groupId: text("group_id")
      .notNull()
      .references(() => organizationGroups.id),
    brandId: text("brand_id").references(() => brands.id),
    name: text("name").notNull(),
    /** JSON blob validated by `themeSchema` in `lib/theme/theme.ts`. */
    values: text("values").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("brand_themes_group_brand_idx").on(table.groupId, table.brandId)],
);

export const staff = sqliteTable(
  "staff",
  {
    id: id(),
    groupId: text("group_id")
      .notNull()
      .references(() => organizationGroups.id),
    userId: text("user_id"),
    employeeNumber: text("employee_number").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    displayName: text("display_name").notNull(),
    workEmail: text("work_email").notNull(),
    jobTitleEn: text("job_title_en").notNull(),
    jobTitleAr: text("job_title_ar"),
    phone: text("phone"),
    status: text("status").notNull().default("ACTIVE"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    archivedAt: integer("archived_at"),
  },
  (table) => [
    uniqueIndex("staff_group_employee_number_key").on(table.groupId, table.employeeNumber),
    uniqueIndex("staff_group_work_email_key").on(table.groupId, table.workEmail),
    index("staff_group_status_idx").on(table.groupId, table.status),
  ],
);

export const staffBrands = sqliteTable(
  "staff_brands",
  {
    id: id(),
    staffId: text("staff_id")
      .notNull()
      .references(() => staff.id),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id),
    departmentId: text("department_id"),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
    joinedAt: integer("joined_at").notNull(),
    leftAt: integer("left_at"),
  },
  (table) => [
    uniqueIndex("staff_brands_staff_brand_key").on(table.staffId, table.brandId),
    index("staff_brands_brand_primary_idx").on(table.brandId, table.isPrimary),
  ],
);

export const profiles = sqliteTable(
  "profiles",
  {
    id: id(),
    publicId: text("public_id").notNull().unique(),
    slug: text("slug").notNull().unique(),
    staffId: text("staff_id")
      .notNull()
      .unique()
      .references(() => staff.id),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id),
    status: text("status").notNull().default("DRAFT"),
    indexable: integer("indexable", { mode: "boolean" }).notNull().default(false),
    jobTitle: text("job_title"),
    biography: text("biography"),
    photoPath: text("photo_path"),
    location: text("location"),
    officeAddress: text("office_address"),
    officeMapUrl: text("office_map_url"),
    publishedAt: integer("published_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("profiles_brand_status_idx").on(table.brandId, table.status)],
);

export const cards = sqliteTable(
  "cards",
  {
    id: id(),
    publicId: text("public_id").notNull().unique(),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id),
    profileId: text("profile_id").references(() => profiles.id),
    displayNumber: text("display_number").notNull(),
    nfcToken: text("nfc_token").notNull().unique(),
    status: text("status").notNull().default("UNASSIGNED"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("cards_brand_display_number_key").on(table.brandId, table.displayNumber),
    index("cards_brand_status_idx").on(table.brandId, table.status),
  ],
);

export const adminUsers = sqliteTable("admin_users", {
  id: id(),
  groupId: text("group_id")
    .notNull()
    .references(() => organizationGroups.id),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /** "GROUP_ADMIN" grants every permission; "BRAND_ADMIN" is scoped by `brandIds`. */
  role: text("role").notNull().default("GROUP_ADMIN"),
  /** JSON array of brand ids for BRAND_ADMIN scoping; empty means "all brands in group". */
  brandIds: text("brand_ids").notNull().default("[]"),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const approvalRequests = sqliteTable(
  "approval_requests",
  {
    id: id(),
    publicId: text("public_id").notNull().unique(),
    groupId: text("group_id").notNull(),
    brandId: text("brand_id"),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    field: text("field").notNull(),
    previousValue: text("previous_value"),
    proposedValue: text("proposed_value").notNull(),
    requestedById: text("requested_by_id"),
    reviewerId: text("reviewer_id"),
    status: text("status").notNull().default("PENDING"),
    requestedAt: integer("requested_at").notNull(),
    reviewedAt: integer("reviewed_at"),
  },
  (table) => [index("approval_requests_brand_status_idx").on(table.brandId, table.status)],
);

export const leads = sqliteTable(
  "leads",
  {
    id: id(),
    publicId: text("public_id").notNull().unique(),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id),
    staffId: text("staff_id").references(() => staff.id),
    profileId: text("profile_id").references(() => profiles.id),
    status: text("status").notNull().default("NEW"),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    consentAt: integer("consent_at").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("leads_brand_status_idx").on(table.brandId, table.status)],
);

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: id(),
    occurredAt: integer("occurred_at").notNull(),
    eventType: text("event_type").notNull(),
    groupId: text("group_id").notNull(),
    brandId: text("brand_id"),
    staffId: text("staff_id"),
    profileId: text("profile_id"),
    cardId: text("card_id"),
    locale: text("locale"),
    deviceCategory: text("device_category"),
    countryCode: text("country_code"),
    metadata: text("metadata"),
  },
  (table) => [
    index("analytics_events_group_occurred_idx").on(table.groupId, table.occurredAt),
    index("analytics_events_brand_type_idx").on(table.brandId, table.eventType),
  ],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: id(),
    groupId: text("group_id").notNull(),
    brandId: text("brand_id"),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: text("metadata"),
    createdAt: createdAt(),
  },
  (table) => [index("audit_logs_group_created_idx").on(table.groupId, table.createdAt)],
);

export type OrganizationGroupRow = typeof organizationGroups.$inferSelect;
export type BrandRow = typeof brands.$inferSelect;
export type BrandThemeRow = typeof brandThemes.$inferSelect;
export type StaffRow = typeof staff.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type CardRow = typeof cards.$inferSelect;
export type AdminUserRow = typeof adminUsers.$inferSelect;
export type LeadRow = typeof leads.$inferSelect;
export type AuditLogRow = typeof auditLogs.$inferSelect;
export type ApprovalRequestRow = typeof approvalRequests.$inferSelect;
export type AnalyticsEventRow = typeof analyticsEvents.$inferSelect;
