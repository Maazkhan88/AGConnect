import Link from "next/link";
import { ArrowRight, ContactRound, QrCode, ShieldCheck } from "lucide-react";

const features = [
  { icon: ContactRound, title: "Digital identity", copy: "Brand-controlled profiles that remain current after every card is issued." },
  { icon: QrCode, title: "NFC & dynamic QR", copy: "Safe redirect tokens, lifecycle controls, and attribution-ready interactions." },
  { icon: ShieldCheck, title: "Governed by design", copy: "Tenant-scoped permissions, approval workflows, and permanent audit history." },
];

export default function Home() {
  return (
    <main className="home-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand-mark" href="/">AG<span>CONNECT</span></Link>
        <div className="nav-actions"><Link href="/p/amna-haddad">View sample profile</Link><Link className="button small" href="/admin">Open workspace <ArrowRight size={16} /></Link></div>
      </nav>
      <section className="hero">
        <p className="eyebrow">AG Holding · Corporate identity infrastructure</p>
        <h1>One trusted identity.<br/><em>Every brand.</em></h1>
        <p className="hero-copy">A secure digital business-card platform that connects AG Holding’s people, brands, NFC cards, leads, and insight.</p>
        <div className="hero-actions"><Link className="button" href="/admin">Enter administration <ArrowRight size={18}/></Link><Link className="text-link" href="/p/amna-haddad">Experience a public profile</Link></div>
        <div className="signal"><span>Foundation status</span><strong>Milestone 0</strong><small>Architecture · Data model · RBAC · Brand theming</small></div>
      </section>
      <section className="feature-grid" aria-label="Platform foundations">{features.map(({icon: Icon, title, copy}) => <article key={title}><Icon aria-hidden="true"/><h2>{title}</h2><p>{copy}</p></article>)}</section>
    </main>
  );
}
