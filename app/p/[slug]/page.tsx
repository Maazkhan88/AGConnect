import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Globe2, Mail, MapPin, MessageCircle, Phone, UserRoundPlus } from "lucide-react";
import { ProfileShareButton } from "@/components/profile-share-button";

export function generateStaticParams() {
  return [{ slug: "amna-haddad" }, { slug: "maaz-khan" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return slug === "maaz-khan"
    ? { title: "Maaz Khan · Head of Marketing · AG Holding", description: "Connect with Maaz Khan, Head of Marketing at AG Holding.", robots: { index: false } }
    : { title: "Amna Haddad · Northstar Advisory", robots: { index: false } };
}

export default async function PublicProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "maaz-khan") return <main className="profile-wrap"><article className="profile-card"><div className="profile-cover"><strong>NORTHSTAR</strong></div><div className="profile-body"><div className="avatar">AH</div><h1>Amna Haddad</h1><p className="title">Director of Strategic Partnerships</p><div className="action-grid"><a href="tel:+971500000000">Call</a><a href="mailto:amna@example.test">Email</a><Link href="/api/vcard/amna-haddad">Save contact</Link></div></div></article></main>;

  return <main className="ag-profile-shell">
    <article className="ag-profile-card">
      <header className="network-cover">
        <div className="network-cover-mark">AG</div>
        <div className="network-share"><ProfileShareButton /></div>
      </header>
      <section className="network-intro">
        <div className="network-avatar"><Image src="/profiles/maaz-khan.jpeg" alt="Maaz Khan" fill priority unoptimized sizes="156px" /></div>
        <div className="network-copy">
          <div className="network-name-row">
            <h1>Maaz Khan</h1>
            <Image className="network-name-logo" src="/brands/ag-holding/logo.png" alt="AG Holding" width={94} height={67} priority unoptimized />
          </div>
          <p className="network-headline">Head of Marketing at AG Holding</p>
          <p className="network-location">Dubai, United Arab Emirates · <a href="mailto:maaz.khan@agholding.ae">Contact info</a></p>
        </div>
        <div className="ag-primary-actions network-actions">
          <a className="save-contact-action" href="/contacts/maaz-khan.vcf" download="Maaz-Khan.vcf"><UserRoundPlus size={18} /> Save contact</a>
          <a className="round-contact-action" href="tel:+971502138765" aria-label="Call Maaz Khan" title="Call"><Phone size={20} /></a>
          <a className="round-contact-action whatsapp-action" href="https://wa.me/971502138765" aria-label="Message Maaz Khan on WhatsApp" title="WhatsApp"><MessageCircle size={21} /></a>
        </div>
      </section>
      <section className="ag-details" aria-label="Contact information">
        <h2>Contact information</h2>
        <a href="mailto:maaz.khan@agholding.ae"><span><Mail size={19} /></span><div><small>Email</small><strong>maaz.khan@agholding.ae</strong></div></a>
        <a href="tel:+971502138765"><span><Phone size={19} /></span><div><small>Mobile</small><strong>+971 50 213 8765</strong></div></a>
        <a href="https://www.agholding.ae"><span><Globe2 size={19} /></span><div><small>Website</small><strong>www.agholding.ae</strong></div></a>
        <a href="https://maps.google.com/?q=AG+Holding+Building+Umm+Ramoul+Dubai+UAE"><span><MapPin size={19} /></span><div><small>Office</small><strong>2nd Floor, AG Holding Building<br />Umm Ramoul, Dubai, UAE</strong></div></a>
      </section>
      <footer className="ag-profile-footer"><span>AG CONNECT · DIGITAL IDENTITY</span></footer>
    </article>
  </main>;
}
