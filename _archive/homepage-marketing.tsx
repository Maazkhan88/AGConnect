import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { eq } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Handshake,
  LineChart,
  Mail,
  Nfc,
  Phone,
  QrCode,
  UserRoundPlus,
} from "lucide-react";
import { getDb } from "@/db/client";
import { brands, profiles } from "@/db/schema";
import { versionedAssetUrl } from "@/lib/brand";
import { getPublicProfile } from "@/lib/profile";
import { themeCssVariables } from "@/lib/theme/theme";
import { getSiteBaseUrl } from "@/lib/site-url";
import { qrCodeSvg } from "@/lib/qr";
import { SiteNav } from "@/components/site-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AGConnect — Digital business cards for every AG Holding company",
  description:
    "AGConnect gives every AG Holding employee a verified digital business card — centrally managed, shareable by NFC or QR, and built to turn introductions into lasting business connections.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "AGConnect",
    title: "AGConnect — Digital business cards for every AG Holding company",
    description:
      "One verified digital business card per employee, centrally managed across every company in AG Holding.",
  },
};

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Brand-controlled profiles",
    copy: "Keep every employee profile accurate, verified, and aligned with their company.",
  },
  {
    icon: Nfc,
    title: "Share by NFC or QR",
    copy: "Open a profile instantly with a tap or scan—no app required.",
  },
  {
    icon: UserRoundPlus,
    title: "Save details instantly",
    copy: "Let contacts save phone, email, company, and social details in one step.",
  },
  {
    icon: Handshake,
    title: "Turn meetings into leads",
    copy: "Allow visitors to share their details directly from an employee profile.",
  },
  {
    icon: LineChart,
    title: "See engagement clearly",
    copy: "Understand profile views, card taps, QR scans, and captured leads.",
  },
  {
    icon: Building2,
    title: "Manage every brand centrally",
    copy: "Control people, permissions, themes, and cards from one secure workspace.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create the profile",
    copy: "Add an employee, select their company, and publish a verified profile.",
  },
  {
    number: "02",
    title: "Share anywhere",
    copy: "Use an NFC card, QR code, or permanent link in person and online.",
  },
  {
    number: "03",
    title: "Continue the conversation",
    copy: "Contacts save the details, share their own information, and stay connected.",
  },
];

export default async function Home() {
  const db = await getDb();

  const brandRows = await db
    .select({
      slug: brands.slug,
      displayName: brands.displayName,
      logoPath: brands.logoPath,
      website: brands.website,
      updatedAt: brands.updatedAt,
    })
    .from(brands)
    .where(eq(brands.status, "ACTIVE"));

  // Showcase a real published profile — never a mocked-up screenshot.
  const publishedProfiles = await db
    .select({ slug: profiles.slug })
    .from(profiles)
    .where(eq(profiles.status, "PUBLISHED"));

  const featured = publishedProfiles[0];
  const profileHref = featured ? `/p/${featured.slug}` : "/admin/login";
  const preview = featured ? await getPublicProfile(featured.slug) : null;

  const baseUrl = await getSiteBaseUrl();
  const qrSvg = featured ? await qrCodeSvg(`${baseUrl}${profileHref}`) : null;

  const previewStyle = preview ? (themeCssVariables(preview.theme) as CSSProperties) : undefined;
  const previewInitials = preview
    ? preview.displayName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const year = new Date().getFullYear();

  return (
    <div className="hp">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="hp-header">
        <div className="container hp-header-inner">
          <Link className="wordmark" href="/" aria-label="AGConnect home">
            <Image src="/brands/ag-holding/logo.png" alt="AG Holding" width={120} height={30} unoptimized />
            <span className="wordmark-text">AGConnect</span>
          </Link>
          <SiteNav profileHref={profileHref} />
        </div>
      </header>

      <main id="main">
        {/* ---------------------------------------------------------- Hero */}
        <section className="hp-hero">
          <div className="container hp-hero-grid">
            <div>
              <p className="eyebrow">AG Holding Digital Identity Platform</p>
              <h1>
                One connection.
                <br />
                Every brand.
              </h1>
              <p className="hp-hero-copy">
                AGConnect gives every employee a verified digital business card—centrally managed, instantly shareable
                by NFC or QR, and designed to turn introductions into lasting business connections.
              </p>
              <div className="hp-hero-actions">
                <Link className="button" href={profileHref}>
                  View a live profile <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link className="button secondary" href="/admin/login">
                  Open admin portal
                </Link>
              </div>
              <div className="hp-hero-meta">
                <div>
                  <strong>{brandRows.length}</strong>
                  <span>Companies live on the platform</span>
                </div>
                <div>
                  <strong>{publishedProfiles.length}</strong>
                  <span>Published employee profiles</span>
                </div>
              </div>
            </div>

            {preview && (
              <figure className="hp-device" style={previewStyle}>
                <div className="hp-device-screen">
                  <div className="hp-device-cover" />
                  <div className="hp-device-body">
                    <div className="hp-device-avatar">
                      {preview.photoPath ? (
                        <Image src={preview.photoPath} alt="" width={84} height={84} unoptimized />
                      ) : (
                        <span aria-hidden="true">{previewInitials}</span>
                      )}
                    </div>
                    <div className="hp-device-name">
                      <strong>{preview.displayName}</strong>
                      {preview.brand.logoPath && (
                        <Image
                          className="hp-device-logo"
                          src={preview.brand.logoPath}
                          alt=""
                          width={62}
                          height={24}
                          unoptimized
                        />
                      )}
                    </div>
                    <p className="hp-device-role">
                      {preview.jobTitle} at {preview.brand.displayName}
                    </p>
                    <div className="hp-device-cta" aria-hidden="true">
                      <UserRoundPlus size={15} /> Save contact
                    </div>
                    <div className="hp-device-rows" aria-hidden="true">
                      <div>
                        <span>
                          <Mail size={13} />
                        </span>
                        <small>{preview.workEmail}</small>
                      </div>
                      {preview.phone && (
                        <div>
                          <span>
                            <Phone size={13} />
                          </span>
                          <small>{preview.phone}</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <figcaption className="hp-device-caption">
                  A live AGConnect profile, themed with {preview.brand.displayName}&apos;s own identity.
                </figcaption>
              </figure>
            )}
          </div>
        </section>

        {/* ------------------------------------------------ Brand showcase */}
        {brandRows.length > 0 && (
          <section className="hp-section tinted" id="platform">
            <div className="container">
              <div className="hp-section-head">
                <p className="eyebrow">The portfolio</p>
                <h2>Built for every company in AG Holding.</h2>
                <p>One platform, with each company&apos;s identity carefully preserved.</p>
              </div>

              {/* Desktop: vertical panels, expanded on hover or keyboard focus. */}
              <div className="hp-brand-panels">
                {brandRows.map((brand) => {
                  const logo = versionedAssetUrl(brand.logoPath, brand.updatedAt);
                  const body = (
                    <>
                      <span className="hp-brand-logo">
                        {logo ? (
                          <Image src={logo} alt={brand.displayName} width={140} height={56} unoptimized />
                        ) : null}
                      </span>
                      <span>
                        <span className="hp-brand-name">{brand.displayName}</span>
                        {brand.website && (
                          <span className="hp-brand-more">
                            {brand.website.replace(/^https?:\/\/(www\.)?/, "")}
                            <ArrowUpRight size={13} aria-hidden="true" />
                          </span>
                        )}
                      </span>
                    </>
                  );
                  return brand.website ? (
                    <a
                      key={brand.slug}
                      className="hp-brand-panel"
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {body}
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : (
                    <div key={brand.slug} className="hp-brand-panel">
                      {body}
                    </div>
                  );
                })}
              </div>

              {/* Mobile: scroll-snapping cards, each a real link. */}
              <div className="hp-brand-rail">
                {brandRows.map((brand) => {
                  const logo = versionedAssetUrl(brand.logoPath, brand.updatedAt);
                  const body = (
                    <>
                      <span className="hp-brand-logo">
                        {logo ? (
                          <Image src={logo} alt={brand.displayName} width={140} height={56} unoptimized />
                        ) : null}
                      </span>
                      <span>
                        <span className="hp-brand-name">{brand.displayName}</span>
                        {brand.website && (
                          <span className="hp-brand-more">
                            {brand.website.replace(/^https?:\/\/(www\.)?/, "")}
                            <ArrowUpRight size={13} aria-hidden="true" />
                          </span>
                        )}
                      </span>
                    </>
                  );
                  return brand.website ? (
                    <a key={brand.slug} className="hp-brand-card" href={brand.website} target="_blank" rel="noreferrer">
                      {body}
                    </a>
                  ) : (
                    <div key={brand.slug} className="hp-brand-card">
                      {body}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------ Benefits */}
        <section className="hp-section" id="for-employees">
          <div className="container">
            <div className="hp-section-head">
              <p className="eyebrow">Platform</p>
              <h2>Everything your team needs to connect.</h2>
              <p>One platform, with each company&apos;s identity carefully preserved.</p>
            </div>

            <div className="hp-benefits-layout">
              <div className="hp-benefit-list">
                {BENEFITS.map(({ icon: Icon, title, copy }) => (
                  <article className="hp-benefit" key={title}>
                    <span className="hp-benefit-icon">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </div>
                  </article>
                ))}
              </div>

              {qrSvg && (
                <aside className="hp-qr-aside">
                  <div className="hp-qr-frame" dangerouslySetInnerHTML={{ __html: qrSvg }} aria-hidden="true" />
                  <h3>Scan to open a real profile</h3>
                  <p>
                    Every AGConnect profile has a permanent link behind it—printed on an NFC card, shown as a QR code,
                    or sent as a message.
                  </p>
                  <Link className="text-link" href={profileHref}>
                    View live profile <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </aside>
              )}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- How it works */}
        <section className="hp-section tinted" id="how-it-works">
          <div className="container">
            <div className="hp-section-head">
              <p className="eyebrow">How it works</p>
              <h2>From introduction to connection.</h2>
            </div>
            <ol className="hp-steps">
              {STEPS.map((step) => (
                <li className="hp-step" key={step.number}>
                  <span className="hp-step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------- Administrators */}
        <section className="hp-section" id="for-administrators">
          <div className="container hp-admin-layout">
            <div>
              <p className="eyebrow">For administrators</p>
              <div className="hp-section-head" style={{ marginBottom: 24 }}>
                <h2>Control every card from one workspace.</h2>
                <p>
                  Manage employee profiles, company branding, card status, leads, permissions, approvals, analytics, and
                  audit history without losing control of individual brand identities.
                </p>
              </div>
              <Link className="button" href="/admin/login">
                Open admin portal <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            <div className="hp-admin-preview">
              <div className="hp-admin-chrome">
                <i aria-hidden="true" />
                <i aria-hidden="true" />
                <i aria-hidden="true" />
                <span>AGConnect · Overview</span>
              </div>
              <div className="hp-admin-tiles">
                <div className="hp-admin-tile">
                  <span>Active brands</span>
                  <strong>{brandRows.length}</strong>
                </div>
                <div className="hp-admin-tile">
                  <span>Published profiles</span>
                  <strong>{publishedProfiles.length}</strong>
                </div>
                <div className="hp-admin-tile private">
                  <span>Active cards</span>
                  <strong aria-hidden="true">•••</strong>
                </div>
                <div className="hp-admin-tile private">
                  <span>Leads (all time)</span>
                  <strong aria-hidden="true">•••</strong>
                </div>
                <div className="hp-admin-tile private">
                  <span>QR scans (all time)</span>
                  <strong aria-hidden="true">•••</strong>
                </div>
                <div className="hp-admin-tile private">
                  <span>Card taps (all time)</span>
                  <strong aria-hidden="true">•••</strong>
                </div>
              </div>
              <p className="hp-admin-note">
                <QrCode size={13} aria-hidden="true" style={{ verticalAlign: "-2px", marginInlineEnd: 6 }} />
                Engagement figures are visible to signed-in administrators only.
              </p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- Final CTA */}
        <section className="hp-section">
          <div className="container">
            <div className="hp-cta">
              <div>
                <h2>Make every introduction count.</h2>
                <p>
                  Give your team a faster, more professional way to share who they are and represent the companies
                  behind them.
                </p>
              </div>
              <div className="hp-cta-actions">
                <Link className="button" href={profileHref}>
                  View live profile
                </Link>
                <Link className="button secondary" href="/admin/login">
                  Admin login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="hp-footer">
        <div className="container">
          <div className="hp-footer-grid">
            <div className="hp-footer-brand">
              <Link className="wordmark" href="/" aria-label="AGConnect home">
                <Image src="/brands/ag-holding/logo.png" alt="AG Holding" width={120} height={30} unoptimized />
                <span className="wordmark-text">AGConnect</span>
              </Link>
              <p>
                A digital platform by{" "}
                <a href="https://www.agholding.ae/" target="_blank" rel="noreferrer">
                  AG Holding
                </a>
                .
              </p>
            </div>
            <nav className="hp-footer-nav" aria-label="Platform">
              <strong>Platform</strong>
              <a href="#platform">Companies</a>
              <a href="#for-employees">Capabilities</a>
              <a href="#how-it-works">How it works</a>
              <a href="#for-administrators">For administrators</a>
            </nav>
            <nav className="hp-footer-nav" aria-label="Get started">
              <strong>Get started</strong>
              <Link href={profileHref}>View live profile</Link>
              <Link href="/admin/login">Admin login</Link>
            </nav>
          </div>
          <p className="hp-footer-legal">© {year} AG Holding. AGConnect — digital identity platform.</p>
        </div>
      </footer>
    </div>
  );
}
