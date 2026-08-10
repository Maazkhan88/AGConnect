import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { ArrowRight, IdCard, QrCode, Users2, LineChart, ShieldCheck, Smartphone } from "lucide-react";
import { getDb } from "@/db/client";
import { brands } from "@/db/schema";
import { versionedAssetUrl } from "@/lib/brand";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: IdCard,
    title: "One profile per person, on-brand",
    copy: "Every staff member gets a permanent digital business card that automatically picks up their brand's logo, colors, and social links.",
  },
  {
    icon: QrCode,
    title: "NFC cards & QR, ready to share",
    copy: "Tap a physical card or scan a QR code to open a profile instantly — save the contact, call, or message on WhatsApp in one tap.",
  },
  {
    icon: LineChart,
    title: "See what's actually happening",
    copy: "Every scan and tap is tracked. Know which cards get used, which brands perform, and who's shown interest.",
  },
  {
    icon: Users2,
    title: "Capture leads from every meeting",
    copy: "Anyone viewing a profile can share their own details back — no app to install, no business card to lose.",
  },
  {
    icon: Smartphone,
    title: "Bulk onboarding in minutes",
    copy: "Add one person at a time or import a whole team from a spreadsheet — every profile publishes instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Centrally managed, brand by brand",
    copy: "A single admin workspace controls every brand's theme, staff, and card inventory — with a full audit trail.",
  },
];

const steps = [
  { step: "01", title: "Add your team", copy: "Create a staff profile — or import a CSV — and pick which brand they belong to." },
  { step: "02", title: "Share the card", copy: "Issue an NFC card or hand out the QR code. Their profile is already live at a permanent link." },
  { step: "03", title: "Track the results", copy: "Watch scans, taps, and leads roll in on the admin dashboard, broken down by brand." },
];

export default async function Home() {
  const db = await getDb();
  const brandRows = await db
    .select({ slug: brands.slug, displayName: brands.displayName, logoPath: brands.logoPath, updatedAt: brands.updatedAt })
    .from(brands)
    .where(eq(brands.status, "ACTIVE"));

  return (
    <main className="home-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand-mark" href="/">
          AG<span>CONNECT</span>
        </Link>
        <div className="nav-actions">
          <Link href="/p/maaz-khan">View a live profile</Link>
          <Link className="button small" href="/admin">
            Open workspace <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">AG Holding · Digital identity platform</p>
        <h1>
          One trusted identity.
          <br />
          <em>Every brand.</em>
        </h1>
        <p className="hero-copy">
          AG Connect gives every one of AG Holding&apos;s brands a shared, professionally managed platform for digital
          business cards — branded profiles, NFC &amp; QR cards, lead capture, and engagement analytics, all from one
          admin workspace.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/admin">
            Enter administration <ArrowRight size={18} />
          </Link>
          <Link className="text-link" href="/p/maaz-khan">
            See a live profile
          </Link>
        </div>
        <div className="signal">
          <span>Live today</span>
          <strong>{brandRows.length} brands</strong>
          <small>Each with its own theme, logo, and social links</small>
        </div>
      </section>

      {brandRows.length > 0 && (
        <section className="brand-strip" aria-label="Brands on AG Connect">
          {brandRows.map((brand) =>
            brand.logoPath ? (
              <Image
                key={brand.slug}
                src={versionedAssetUrl(brand.logoPath, brand.updatedAt)!}
                alt={brand.displayName}
                width={110}
                height={48}
                unoptimized
                style={{ objectFit: "contain", maxHeight: 40, width: "auto" }}
              />
            ) : (
              <span key={brand.slug} className="brand-strip-name">
                {brand.displayName}
              </span>
            ),
          )}
        </section>
      )}

      <section className="feature-grid" aria-label="What AG Connect does">
        {features.map(({ icon: Icon, title, copy }) => (
          <article key={title}>
            <Icon aria-hidden="true" />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="steps-section" aria-label="How it works">
        <h2 className="steps-heading">How it works</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <article key={s.step} className="step-card">
              <span className="step-number">{s.step}</span>
              <h3>{s.title}</h3>
              <p>{s.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>Ready to bring your team onto AG Connect?</h2>
          <p>Add your first staff member, issue a card, and their profile is live in minutes.</p>
        </div>
        <Link className="button" href="/admin">
          Enter administration <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
