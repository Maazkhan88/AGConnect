import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { logoutAction } from "../logout-action";

const items = [
  { label: "Overview", href: "/admin" },
  { label: "Groups", href: "/admin/groups" },
  { label: "Brands", href: "/admin/brands" },
  { label: "Brand themes", href: "/admin/themes" },
  { label: "Staff", href: "/admin/staff" },
  { label: "Approvals", href: "/admin/approvals" },
  { label: "Cards & QR", href: "/admin/cards" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Audit logs", href: "/admin/audit-logs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="shell">
      {/* Pure CSS toggle (checkbox + label) so the mobile nav works without any client JS —
          see `.nav-toggle-checkbox:checked ~ .sidebar` in globals.css. The checkbox must come
          before .sidebar in the DOM for that sibling selector to work. */}
      <input type="checkbox" id="nav-toggle" className="nav-toggle-checkbox" aria-hidden="true" />
      <label htmlFor="nav-toggle" className="hamburger-btn" aria-label="Open menu">
        <span />
        <span />
        <span />
      </label>
      <label htmlFor="nav-toggle" className="nav-backdrop" aria-hidden="true" />
      <aside className="sidebar">
        <Link className="brand-mark" href="/">
          AG<span>CONNECT</span>
        </Link>
        <nav>
          {items.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="muted">{admin.user.email}</p>
          <form action={logoutAction}>
            <button className="text-link" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <section className="workspace">{children}</section>
    </div>
  );
}
