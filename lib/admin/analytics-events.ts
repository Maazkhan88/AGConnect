import type { Database } from "@/db/client";
import { analyticsEvents } from "@/db/schema";

export type AnalyticsEventType = "qr_scan" | "card_tap" | "profile_view" | "lead_submitted";

/**
 * Records a raw analytics event (QR scan, NFC card tap, etc). Aggregated by
 * the admin Analytics page and dashboard overview via lib/admin/analytics.ts.
 */
export async function logAnalyticsEvent(
  db: Database,
  input: {
    eventType: AnalyticsEventType;
    groupId: string;
    brandId?: string | null;
    staffId?: string | null;
    profileId?: string | null;
    cardId?: string | null;
  },
): Promise<void> {
  await db.insert(analyticsEvents).values({
    id: crypto.randomUUID(),
    occurredAt: Date.now(),
    eventType: input.eventType,
    groupId: input.groupId,
    brandId: input.brandId ?? null,
    staffId: input.staffId ?? null,
    profileId: input.profileId ?? null,
    cardId: input.cardId ?? null,
  });
}
