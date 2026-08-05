import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { adminUsers, brands, type AdminUserRow } from "@/db/schema";
import { PERMISSIONS, type AuthorizationContext, type Permission } from "@/lib/auth/permissions";
import { readSession } from "@/lib/auth/session";

export type CurrentAdmin = { user: AdminUserRow; context: AuthorizationContext };

const BRAND_ADMIN_PERMISSIONS: readonly Permission[] = [
  "brand.read",
  "brand.update",
  "brand.theme.manage",
  "staff.create",
  "staff.read",
  "staff.update",
  "staff.assign_brand",
  "profile.read",
  "profile.update",
  "profile.publish",
  "card.read",
  "card.assign",
  "lead.read",
  "analytics.brand",
];

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const session = await readSession();
  if (!session) return null;
  const db = await getDb();
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, session.sub)).limit(1);
  if (!user || user.status !== "ACTIVE") return null;

  const groupBrands = await db
    .select({ id: brands.id })
    .from(brands)
    .where(eq(brands.groupId, user.groupId));

  const scoped = JSON.parse(user.brandIds || "[]") as string[];
  const brandIds =
    user.role === "GROUP_ADMIN" || scoped.length === 0
      ? groupBrands.map((brand) => brand.id)
      : scoped;

  const permissions =
    user.role === "GROUP_ADMIN" ? [...PERMISSIONS] : [...BRAND_ADMIN_PERMISSIONS];

  return {
    user,
    context: {
      groupId: user.groupId,
      brandIds: new Set(brandIds),
      permissions: new Set(permissions),
    },
  };
}

/** Server-side guard for every `/admin/*` server component and server action. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
