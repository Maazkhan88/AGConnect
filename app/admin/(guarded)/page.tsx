import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db/client";
import { brands, profiles, cards, leads } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";
import { countEvents } from "@/lib/admin/analytics";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const db = await getDb();

  const [[brandCount], [profileCount], [cardCount], [leadCount], qrScans, cardTaps] = await Promise.all([
    db.select({ value: count() }).from(brands).where(eq(brands.groupId, admin.context.groupId)),
    db.select({ value: count() }).from(profiles).where(eq(profiles.status, "PUBLISHED")),
    db.select({ value: count() }).from(cards),
    db.select({ value: count() }).from(leads),
    countEvents(db, admin.context.groupId, "qr_scan"),
    countEvents(db, admin.context.groupId, "card_tap"),
  ]);

  const metrics: [string, number][] = [
    ["Active brands", brandCount.value],
    ["Published profiles", profileCount.value],
    ["Active cards", cardCount.value],
    ["Leads (all time)", leadCount.value],
    ["QR scans (all time)", qrScans],
    ["Card taps (all time)", cardTaps],
  ];

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Group administration</p>
          <h1>Welcome back, {admin.user.name}.</h1>
          <p className="muted">Here is the operating picture across {admin.context.groupId ? "AG Holding" : "your group"}.</p>
        </div>
        <span className="badge">System healthy</span>
      </header>
      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <article className="metric" key={label}>
            <span className="muted">{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="panel-grid">
        <section className="panel">
          <h2>Get started</h2>
          <div className="rows">
            <div className="row">
              <span>Create a new brand</span>
              <Link className="text-link" href="/admin/brands">
                Go to Brands
              </Link>
            </div>
            <div className="row">
              <span>Add a team member and publish their profile</span>
              <Link className="text-link" href="/admin/staff/new">
                Add staff
              </Link>
            </div>
            <div className="row">
              <span>Tune a brand&apos;s colors</span>
              <Link className="text-link" href="/admin/themes">
                Brand themes
              </Link>
            </div>
          </div>
        </section>
        <section className="panel">
          <h2>Signed in as</h2>
          <p>{admin.user.email}</p>
          <p className="muted">Role: {admin.user.role}</p>
        </section>
      </div>
    </>
  );
}
