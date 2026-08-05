"use server";

import { getDb } from "@/db/client";
import { leads } from "@/db/schema";
import { logAnalyticsEvent } from "@/lib/admin/analytics-events";

export type ShareDetailsState = { error?: string; ok?: boolean };

/**
 * Public, unauthenticated action — a visitor on /p/<slug> shares their own
 * contact details with the staff member. Deliberately does NOT call
 * requireAdmin(): anyone viewing a published profile can submit this. The
 * resulting row shows up on Admin → Leads automatically since that page
 * already reads the leads table.
 */
export async function submitLeadAction(_prev: ShareDetailsState, formData: FormData): Promise<ShareDetailsState> {
  const groupId = String(formData.get("groupId") ?? "");
  const brandId = String(formData.get("brandId") ?? "");
  const staffId = String(formData.get("staffId") ?? "");
  const profileId = String(formData.get("profileId") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const consent = formData.get("consent") === "on";

  if (!groupId || !brandId || !profileId) return { error: "Something went wrong — please refresh and try again." };
  if (!fullName) return { error: "Name is required." };
  if (!email && !phone) return { error: "Add an email or phone number so they can reach you." };
  if (!consent) return { error: "Please confirm you're okay being contacted." };

  const db = await getDb();
  const now = Date.now();

  await db.insert(leads).values({
    id: crypto.randomUUID(),
    publicId: crypto.randomUUID(),
    brandId,
    staffId: staffId || null,
    profileId,
    status: "NEW",
    fullName,
    email,
    phone,
    consentAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await logAnalyticsEvent(db, {
    eventType: "lead_submitted",
    groupId,
    brandId,
    staffId: staffId || null,
    profileId,
  });

  return { ok: true };
}
