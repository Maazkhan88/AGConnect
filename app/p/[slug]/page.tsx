import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Globe2, Mail, MapPin, Phone, UserRoundPlus } from "lucide-react";
import { ProfileShareButton } from "@/components/profile-share-button";
import { ShareDetailsButton } from "@/components/share-details-button";
import { getPublicProfile } from "@/lib/profile";
import { SOCIAL_LABELS } from "@/lib/brand";
import { socialIcon, WhatsAppIcon } from "@/lib/social-icons";
import { themeCssVariables } from "@/lib/theme/theme";
import { getDb } from "@/db/client";
import { logAnalyticsEvent } from "@/lib/admin/analytics-events";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.displayName} · ${profile.jobTitle} · ${profile.brand.displayName}`,
    description: `Connect with ${profile.displayName}, ${profile.jobTitle} at ${profile.brand.displayName}.`,
    robots: { index: false },
  };
}

export default async function PublicProfile({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
}) {
  const { slug } = await params;
  const { src } = await searchParams;
  const profile = await getPublicProfile(slug);
  if (!profile) notFound();

  if (src === "qr") {
    const db = await getDb();
    await logAnalyticsEvent(db, {
      eventType: "qr_scan",
      groupId: profile.brand.groupId,
      brandId: profile.brand.id,
      staffId: profile.staffId,
      profileId: profile.id,
    });
  }

  const style = themeCssVariables(profile.theme) as CSSProperties;
  const initials = profile.displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="ag-profile-shell" style={style}>
      <article className="ag-profile-card">
        <header
          className="network-cover"
          style={
            profile.brand.bannerPath
              ? { backgroundImage: `url(${profile.brand.bannerPath})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          <div className="network-cover-mark">{profile.brand.displayName.slice(0, 2).toUpperCase()}</div>
          <div className="network-share">
            <ProfileShareButton name={profile.displayName} title={profile.jobTitle} />
          </div>
        </header>
        <section className="network-intro">
          <div className="network-avatar">
            {profile.photoPath ? (
              <Image src={profile.photoPath} alt={profile.displayName} fill priority unoptimized sizes="156px" />
            ) : (
              <span className="network-avatar-fallback" aria-hidden>
                {initials}
              </span>
            )}
          </div>
          <div className="network-copy">
            <div className="network-name-row">
              <h1>{profile.displayName}</h1>
              {profile.brand.logoPath && (
                <Image
                  className="network-name-logo"
                  src={profile.brand.logoPath}
                  alt={profile.brand.displayName}
                  width={140}
                  height={48}
                  priority
                  unoptimized
                />
              )}
            </div>
            <p className="network-headline">
              {profile.jobTitle} at {profile.brand.displayName}
            </p>
            {profile.location && (
              <p className="network-location">
                {profile.location} ·{" "}
                <a href={`mailto:${profile.workEmail}`}>Contact info</a>
              </p>
            )}
          </div>
          <div className="contact-actions">
            <a
              className="save-contact-btn"
              href={`/api/vcard/${profile.slug}`}
              download={`${profile.displayName.replace(/\s+/g, "-")}.vcf`}
            >
              <UserRoundPlus size={20} /> Save contact
            </a>
            {(profile.phone || profile.whatsapp) && (
              <div className="secondary-cta-row">
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} aria-label={`Call ${profile.displayName}`}>
                    <Phone size={18} /> Call
                  </a>
                )}
                {profile.whatsapp && (
                  <a
                    className="whatsapp-action"
                    href={`https://wa.me/${profile.whatsapp.replace(/[^\d]/g, "")}`}
                    aria-label={`Message ${profile.displayName} on WhatsApp`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppIcon width={18} height={18} /> WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
        <ShareDetailsButton
          groupId={profile.brand.groupId}
          brandId={profile.brand.id}
          staffId={profile.staffId}
          profileId={profile.id}
          staffName={profile.displayName}
        />
        <section className="ag-details" aria-label="Contact information">
          <h2>Contact information</h2>
          <a href={`mailto:${profile.workEmail}`}>
            <span>
              <Mail size={19} />
            </span>
            <div>
              <small>Email</small>
              <strong>{profile.workEmail}</strong>
            </div>
          </a>
          {profile.phone && (
            <a href={`tel:${profile.phone}`}>
              <span>
                <Phone size={19} />
              </span>
              <div>
                <small>Mobile</small>
                <strong>{profile.phone}</strong>
              </div>
            </a>
          )}
          {profile.brand.website && (
            <a href={profile.brand.website}>
              <span>
                <Globe2 size={19} />
              </span>
              <div>
                <small>Website</small>
                <strong>{profile.brand.website.replace(/^https?:\/\//, "")}</strong>
              </div>
            </a>
          )}
          {profile.officeAddress && (
            <a href={profile.officeMapUrl ?? "#"}>
              <span>
                <MapPin size={19} />
              </span>
              <div>
                <small>Office</small>
                <strong>{profile.officeAddress}</strong>
              </div>
            </a>
          )}
          {profile.brand.socials.map((social) => (
            <a href={social.url} key={social.platform} target="_blank" rel="noreferrer">
              <span>{socialIcon(social.platform)}</span>
              <div>
                <small>{SOCIAL_LABELS[social.platform]}</small>
                <strong>{social.url.replace(/^https?:\/\//, "")}</strong>
              </div>
            </a>
          ))}
        </section>
        <footer className="ag-profile-footer">
          <span>AG CONNECT · DIGITAL IDENTITY</span>
        </footer>
      </article>
    </main>
  );
}
