# AG Connect

Production-oriented foundation for AG Holding's multi-brand digital identity, NFC card, public profile, and lead-capture platform.

## Local setup

```bash
pnpm install
Copy-Item .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`, `/admin`, `/brand-admin`, `/staff`, or `/p/amna-haddad`.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The current delivery establishes Milestone 0 and technical foundations for Milestone 1. Password/session flows are architected but deliberately not presented as complete authentication.
