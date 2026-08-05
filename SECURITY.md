# Security

## Controls

- Server-side permission and tenant checks on every protected operation.
- Argon2id/bcrypt-compatible password hashing adapter, HTTP-only secure cookies, verification/reset tokens, session revocation, suspension, and login audits in the authentication milestone.
- Zod validation at trust boundaries, Prisma parameterization, output DTOs, CSP/security headers, CSRF protections, rate limits, and open-redirect allowlists.
- Random public tokens, signed uploads, server-detected MIME, size/dimension limits, malware-scan interface, and public/private storage separation.
- Append-oriented audit and business history; secret references never enter logs or API responses.
- IP addresses processed transiently into rotated hashes/truncated geolocation and removed per retention policy.

Backups are provider-managed encrypted PostgreSQL snapshots plus object-store versioning. Restore exercises and retention schedules are deployment requirements. Authentication is not complete in Milestone 0.
