import { and, count, eq } from "drizzle-orm";
import type { Database } from "@/db/client";
import { analyticsEvents } from "@/db/schema";

export async function countEvents(
  db: Database,
  groupId: string,
  eventType: "qr_scan" | "card_tap",
  brandId?: string,
): Promise<number> {
  const where = brandId
    ? and(eq(analyticsEvents.groupId, groupId), eq(analyticsEvents.eventType, eventType), eq(analyticsEvents.brandId, brandId))
    : and(eq(analyticsEvents.groupId, groupId), eq(analyticsEvents.eventType, eventType));
  const [row] = await db.select({ value: count() }).from(analyticsEvents).where(where);
  return row?.value ?? 0;
}
