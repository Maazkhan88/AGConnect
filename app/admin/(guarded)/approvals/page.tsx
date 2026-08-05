import { requireAdmin } from "@/lib/auth/current-user";

export default async function ApprovalsPage() {
  await requireAdmin();
  // No approval-request workflow has been triggered yet (brand/staff edits apply
  // immediately for GROUP_ADMIN today) — this view will populate once `approval_requests`
  // rows are written by a scoped BRAND_ADMIN edit flow.
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Governance</p>
          <h1>Approvals</h1>
          <p className="muted">Pending edits awaiting group-admin sign-off.</p>
        </div>
      </header>
      <p className="muted">Nothing pending review right now.</p>
    </>
  );
}
