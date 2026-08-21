# Archive

Not part of the app — this directory is outside `app/`, so nothing here is routed or built.

## homepage-marketing.tsx

The full AG Holding–styled marketing homepage (hero, brand showcase, benefits,
how-it-works, admin preview, footer), parked here on 2026-08-21 at the site
owner's request: `agconnect.ae` should show the admin login directly for now
instead of the marketing page. `app/page.tsx` was replaced with a redirect to
`/admin/login`.

To restore: copy this file back to `app/page.tsx` (it still imports
`@/components/site-nav` and the same `lib`/`db` modules used elsewhere in the
app, so it should work as-is — just re-verify build/lint/tests after restoring
in case those modules changed in the meantime).
