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
