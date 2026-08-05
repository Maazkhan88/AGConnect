# Deployment

Deploy the Next.js application to Vercel with an external managed PostgreSQL database and S3-compatible object storage. Configure all `.env.example` values in the platform secret store, use pooled and direct migration database URLs where the provider requires them, and run `prisma migrate deploy` before traffic reaches a new schema.

Production requires TLS, private database networking where possible, bucket CORS restricted to the application, versioned backups, retention jobs, email provider credentials, monitoring, CSP reporting, and key rotation. Never use the Compose credentials in production.
