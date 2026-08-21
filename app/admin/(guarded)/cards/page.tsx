import { eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db/client";
import { cards, brands, profiles, staff } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { getSiteBaseUrl } from "@/lib/site-url";
import { qrCodeSvg, fetchLogoDataUri } from "@/lib/qr";
import { IssueCardButton } from "./issue-card-button";
import { NfcWriteButton } from "@/components/nfc-write-button";

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
      brandLogoPath: brands.logoPath,
      cardId: cards.id,
      cardDisplayNumber: cards.displayNumber,
      cardStatus: cards.status,
      cardNfcToken: cards.nfcToken,
    })
    .from(profiles)
    .innerJoin(staff, eq(staff.id, profiles.staffId))
    .leftJoin(brands, eq(brands.id, profiles.brandId))
    .leftJoin(cards, eq(cards.profileId, profiles.id))
    .where(eq(profiles.status, "PUBLISHED"));

  // Cache one logo fetch per brand rather than once per staff member.
  const logoCache = new Map<string, Promise<string | null>>();
  function getLogoDataUri(logoPath: string | null): Promise<string | null> {
    if (!logoPath) return Promise.resolve(null);
    if (!logoCache.has(logoPath)) logoCache.set(logoPath, fetchLogoDataUri(baseUrl, logoPath));
    return logoCache.get(logoPath)!;
  }

  const withQr = await Promise.all(
    // ?src=qr on the encoded URL is what lets a scan of this exact code be
    // distinguished from someone just clicking the /p/<slug> link elsewhere —
    // see the qr_scan event logged in app/p/[slug]/page.tsx.
    rows.map(async (row) => {
      const url = `${baseUrl}/p/${row.slug}?src=qr`;
      const logoDataUri = await getLogoDataUri(row.brandLogoPath);
      const svg = await qrCodeSvg(url, { logoDataUri });
      return { ...row, qr: svg };
    }),
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
        {withQr.length > 0 && (
          <Link className="button small secondary" href="/admin/cards/export">
            Export all QR codes
          </Link>
        )}
      </header>
      {withQr.length === 0 ? (
        <p className="muted">No published profiles yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>QR</th>
              <th></th>
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
                <td>
                  <a
                    className="text-link"
                    href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(row.qr)}`}
                    download={`${row.slug}-qr.svg`}
                  >
                    Download
                  </a>
                </td>
                <td>{row.displayName}</td>
                <td>{row.brandName ?? "—"}</td>
                <td>
                  <a className="text-link" href={`/p/${row.slug}`} target="_blank" rel="noreferrer">
                    /p/{row.slug}
                  </a>
                </td>
                <td>
                  {row.cardId ? (
                    <div>
                      <span className="pill">
                        {row.cardDisplayNumber} · {row.cardStatus}
                      </span>
                      <p className="muted" style={{ fontSize: 11, margin: "4px 0 0", wordBreak: "break-all" }}>
                        Program the NFC tag to open:
                        <br />
                        {baseUrl}/c/{row.cardNfcToken}
                      </p>
                      <NfcWriteButton url={`${baseUrl}/c/${row.cardNfcToken}`} />
                    </div>
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
