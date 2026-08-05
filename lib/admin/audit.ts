import { getDb } from "@/db/client";
import { auditLogs } from "@/db/schema";

export async function logAudit(params: {
  groupId: string;
  brandId?: string | null;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: unknown;
}) {
  const db = await getDb();
  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    groupId: params.groupId,
    brandId: params.brandId ?? null,
    actorId: params.actorId ?? null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    createdAt: Date.now(),
  });
}
