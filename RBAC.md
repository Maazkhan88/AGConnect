# RBAC

Authentication identifies the user; authorization evaluates permissions plus resource scope. System role labels are defaults, not security decisions.

`can(context, permission, resource)` requires the requested permission, matching group, and either assigned brand or `group.manage`. Every server action and route must invoke this policy after loading tenant scope from trusted persistence. Client-side controls improve usability only.

Roles are group-scoped. `UserBrandRole` supports group-wide or brand-scoped assignments; permissions are normalized through `RolePermission`. Initial roles are Super Admin, Group Admin, Brand Admin, Manager, Staff Member, and Analyst. Tests prove cross-brand and cross-group denial.
