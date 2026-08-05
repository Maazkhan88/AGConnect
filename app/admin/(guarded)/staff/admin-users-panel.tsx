"use client";

import { useActionState, useState } from "react";
import {
  inviteAdminAction,
  resetAdminPasswordAction,
  revokeAdminAction,
  type InviteAdminState,
  type ResetAdminPasswordState,
} from "../../actions";

const initialState: InviteAdminState = {};
const initialResetState: ResetAdminPasswordState = {};

export type AdminUserRowView = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isSelf: boolean;
};

export function AdminUsersPanel({
  admins,
  brandOptions,
}: {
  admins: AdminUserRowView[];
  brandOptions: { id: string; displayName: string }[];
}) {
  const [state, formAction, pending] = useActionState(inviteAdminAction, initialState);
  const [resetState, resetFormAction] = useActionState(resetAdminPasswordAction, initialResetState);
  const [role, setRole] = useState("BRAND_ADMIN");

  return (
    <section style={{ marginTop: 40 }}>
      <h2>Admin access</h2>
      <p className="muted">
        Super-admins (Group Admin) manage other admin accounts. Removing an admin revokes access without deleting
        their history. There is no email service connected yet, so invites and resets don&apos;t send an email —
        copy the temporary password shown below and share it with them directly (Slack, WhatsApp, etc).
      </p>

      {resetState.ok && resetState.tempPassword ? (
        <p className="login-error" style={{ color: "#236342", background: "#e5f2ea", padding: 12, borderRadius: 8 }}>
          Password reset for {resetState.email}. New temporary password (shown once, share it securely):{" "}
          <strong>{resetState.tempPassword}</strong>
        </p>
      ) : null}
      {resetState.error && <p className="login-error">{resetState.error}</p>}

      <table className="table" style={{ marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {admins.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.role === "GROUP_ADMIN" ? "Super admin" : "Brand admin"}</td>
              <td>
                <span className="pill">{row.status}</span>
              </td>
              <td>
                {row.status === "ACTIVE" ? (
                  <div style={{ display: "flex", gap: 12 }}>
                    <form action={resetFormAction}>
                      <input type="hidden" name="adminUserId" value={row.id} />
                      <button className="text-link" type="submit">
                        Reset password
                      </button>
                    </form>
                    {!row.isSelf && (
                      <form action={revokeAdminAction}>
                        <input type="hidden" name="adminUserId" value={row.id} />
                        <button className="text-link" type="submit">
                          Remove
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginBottom: 10 }}>Invite an admin</h3>
      {state.ok && state.tempPassword ? (
        <p className="login-error" style={{ color: "#236342", background: "#e5f2ea", padding: 12, borderRadius: 8 }}>
          Invited {state.email}. Temporary password (shown once, share it securely):{" "}
          <strong>{state.tempPassword}</strong>
        </p>
      ) : null}
      <form className="form-grid" action={formAction}>
        <div className="color-row">
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
        </div>
        <label>
          Role
          <select name="role" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="BRAND_ADMIN">Brand admin</option>
            <option value="GROUP_ADMIN">Super admin (all permissions)</option>
          </select>
        </label>
        {role === "BRAND_ADMIN" && (
          <label>
            Scope to a single brand (optional — leave blank for every brand)
            <select name="brandId" defaultValue="">
              <option value="">All brands</option>
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.displayName}
                </option>
              ))}
            </select>
          </label>
        )}
        {state.error && <p className="login-error">{state.error}</p>}
        <button className="button small" type="submit" disabled={pending}>
          {pending ? "Inviting…" : "Send invite"}
        </button>
      </form>
    </section>
  );
}
