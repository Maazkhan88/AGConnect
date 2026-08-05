import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { profiles, cards } from "@/db/schema";

/**
 * Minimal "my workspace" view. There is no staff self-login yet (only the admin
 * panel has authentication) — this reads the seeded Maaz Khan profile as a
 * representative example until per-staff accounts are built.
 */
export default async function StaffPage() {
  const db = await getDb();
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.slug, "maaz-khan") });
  const card = profile ? await db.query.cards.findFirst({ where: eq(cards.profileId, profile.id) }) : null;

  return (
    <main className="workspace">
      <p className="eyebrow">My workspace</p>
      <h1>Your digital identity</h1>
      <p className="muted">
        {profile ? `Your public profile is ${profile.status.toLowerCase()} at /p/${profile.slug}.` : "No profile found."}
      </p>
      <div className="panel-grid">
        <section className="panel">
          <h2>Profile status</h2>
          <span className="badge">{profile?.status ?? "—"}</span>
          <p className="muted">Job title: {profile?.jobTitle ?? "—"}</p>
        </section>
        <section className="panel">
          <h2>Card status</h2>
          {card ? (
            <>
              <span className="badge">{card.status}</span>
              <p>{card.displayNumber}</p>
            </>
          ) : (
            <p className="muted">No card assigned.</p>
          )}
        </section>
      </div>
    </main>
  );
}
