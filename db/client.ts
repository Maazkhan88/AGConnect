import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Returns a Drizzle client bound to the `DB` D1 binding declared in `wrangler.jsonc`.
 * Works both in `next dev` (miniflare-backed local D1) and on the deployed Worker.
 */
export async function getDb(): Promise<Database> {
  const { env } = await getCloudflareContext({ async: true });
  const binding = (env as unknown as { DB?: D1Database }).DB;
  if (!binding) {
    throw new Error(
      "D1 binding `DB` is missing. Run `wrangler d1 create agconnect-db` and update wrangler.jsonc.",
    );
  }
  return drizzle(binding, { schema });
}

export { schema };
