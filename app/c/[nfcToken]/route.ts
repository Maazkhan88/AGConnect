import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { brands, cards, profiles } from "@/db/schema";
import { logAnalyticsEvent } from "@/lib/admin/analytics-events";

export const dynamic = "force-dynamic";

/**
 * What a physical NFC card is programmed to open. Logs a card_tap analytics
 * event, then redirects to the assigned profile's public page.
 */
export async function GET(request: Request, { params }: { params: Promise<{ nfcToken: string }> }) {
  const { nfcToken } = await params;
  const db = await getDb();

  const card = await db.query.cards.findFirst({ where: eq(cards.nfcToken, nfcToken) });
  if (!card || !card.profileId) {
    return new NextResponse("Card not found or not assigned to a profile.", { status: 404 });
  }

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, card.profileId) });
  if (!profile) return new NextResponse("Profile not found.", { status: 404 });

  const brand = await db.query.brands.findFirst({ where: eq(brands.id, card.brandId) });

  await logAnalyticsEvent(db, {
    eventType: "card_tap",
    groupId: brand?.groupId ?? "",
    brandId: card.brandId,
    staffId: profile.staffId,
    profileId: profile.id,
    cardId: card.id,
  });

  return NextResponse.redirect(new URL(`/p/${profile.slug}`, request.url), { status: 307 });
}
