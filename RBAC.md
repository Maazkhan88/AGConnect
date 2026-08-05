# RBAC

Authentication identifies the user; authorization evaluates permissions plus resource scope. System role labels are defaults, not security decisions.

`can(context, permission, resource)` requires the requested permission, matching group, and either assigned brand or `group.manage`. Every server action and route must invoke this policy after loading tenant scope from trusted persistence. Client-side controls improve usability only.

Roles are group-scoped. `UserBrandRole` supports group-wide or brand-scoped assignments; permissions are normalized through `RolePermission`. Initial roles are Super Admin, Group Admin, Brand Admin, Manager, Staff Member, and Analyst. Tests prove cross-brand and cross-group denial.

## Admin accounts (implemented)

`admin_users` (`db/schema.ts`) currently implements two of the roles above:

- **`GROUP_ADMIN`** — every permission in `lib/auth/permissions.ts`, including `group.manage`. This is the "Super Admin" role: it is the only role that can invite or remove other admin accounts (see Admin panel → Staff → "Admin access", gated by `can(context, "group.manage", ...)`).
- **`BRAND_ADMIN`** — a fixed subset of permissions (`lib/auth/current-user.ts`'s `BRAND_ADMIN_PERMISSIONS`), optionally scoped to a single brand via `brandIds`; empty `brandIds` means every brand in the group.

The first `GROUP_ADMIN` is created by `db/seed.ts` using the product owner's real email (`maaz.n.khan@gmail.com`) with a randomly generated, hashed initial password (see DEPLOYMENT.md "First login"). Every admin created after that goes through Admin → Staff → "Invite an admin", which reuses the exact same session/password stack (`lib/auth/session.ts`, `lib/auth/password.ts`) — there is no separate invite-token system. Removing an admin sets `status = "SUSPENDED"` (soft-revoke, consistent with `staff.status`/`profiles.status`/`brands.status` elsewhere) rather than deleting the row, and is logged to `audit_logs`.
