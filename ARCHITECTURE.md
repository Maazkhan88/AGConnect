# Architecture

AG Connect is a Next.js App Router modular monolith. PostgreSQL is authoritative; Prisma provides migrations and typed persistence; S3-compatible storage holds binary assets. Vercel runs the web application against managed external services.

## Boundaries

Domains are authentication, groups/brands, organization, staff/profiles, themes/templates, cards/redirects/QR, leads/campaigns, analytics, files, approvals/audit, notifications, and integrations. Domain functions accept explicit tenant and authorization context. Route handlers validate input, authorize server-side, call domain services, and return DTOs—not Prisma rows.

Public identifiers and random redirect tokens are distinct from internal database IDs. Immutable or historical records use `Restrict`; lifecycle deletion is soft. Multi-record changes use transactions. The initial UI shells are thin consumers of these foundations.
