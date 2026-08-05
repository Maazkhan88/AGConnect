import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { cards, brands, profiles, staff } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { getSiteBaseUrl } from "@/lib/site-url";
import { qrCodeSvg } from "@/lib/qr";
import { IssueCardButton } from "./issue-card-button";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  await requireAdmin();
  const db = await getDb();
  const baseUrl = await getSiteBaseUrl();

  // Every published profile gets a QR code (it just points at /p/<slug>); a
  // physical NFC card is a separate, optional thing you issue for it. Listing
  // by profile (not by card) is what makes newly created staff show up here
  // immediately, before any card has been issued.
  const rows = await db
    .select({
      profileId: profiles.id,
      slug: profiles.slug,
      displayName: staff.displayName,
      brandName: brands.displayName,
      cardId: cards.id,
      cardDisplayNumber: cards.displayNumber,
      cardStatus: cards.status,
    })
    .from(profiles)
    .innerJoin(staff, eq(staff.id, profiles.staffId))
    .leftJoin(brands, eq(brands.id, profiles.brandId))
    .leftJoin(cards, eq(cards.profileId, profiles.id))
    .where(eq(profiles.status, "PUBLISHED"));

  const withQr = await Promise.all(
    rows.map(async (row) => ({ ...row, qr: await qrCodeSvg(`${baseUrl}/p/${row.slug}`) })),
  );

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Physical identity</p>
          <h1>Cards &amp; QR</h1>
          <p className="muted">
            Every published profile has a QR code linking to /p/&lt;slug&gt; — issue a physical NFC card for it when
            ready.
          </p>
        </div>
      </header>
      {withQr.length === 0 ? (
        <p className="muted">No published profiles yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>QR</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Profile</th>
              <th>Card</th>
            </tr>
          </thead>
          <tbody>
            {withQr.map((row) => (
              <tr key={row.profileId}>
                <td dangerouslySetInnerHTML={{ __html: row.qr }} style={{ width: 48 }} />
                <td>{row.displayName}</td>
                <td>{row.brandName ?? "—"}</td>
                <td>
                  <a className="text-link" href={`/p/${row.slug}`} target="_blank" rel="noreferrer">
                    /p/{row.slug}
                  </a>
                </td>
                <td>
                  {row.cardId ? (
                    <span className="pill">
                      {row.cardDisplayNumber} · {row.cardStatus}
                    </span>
                  ) : (
                    <IssueCardButton profileId={row.profileId} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
