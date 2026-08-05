# Data model

The Prisma schema normalizes tenant hierarchy, identity, RBAC, theme versioning, profile content, inventory history, leads, consent, analytics, files, approvals, audit, and integrations.

Tenant-bearing queries start from `groupId` and, where applicable, `brandId`. `StaffBrand` models primary/secondary brand membership; `CardAssignment` preserves reassignment history. Theme versions, lead activity, approval, analytics, and audit records are retained. Public routes expose `publicId`, slug, or high-entropy token only.

Deletion policy favors archive timestamps and status changes. Cascades are limited to dependent configuration/join rows; business history uses `Restrict`. Indexes cover tenant/status/date and common ownership lookups.
