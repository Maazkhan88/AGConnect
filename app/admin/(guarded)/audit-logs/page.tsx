import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { auditLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/current-user";

export default async function AuditLogsPage() {
  const admin = await requireAdmin();
  const db = await getDb();
  const rows = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.groupId, admin.context.groupId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Governance</p>
          <h1>Audit logs</h1>
          <p className="muted">Every create/update made through the admin panel.</p>
        </div>
      </header>
      {rows.length === 0 ? (
        <p className="muted">No activity recorded yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Entity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.createdAt).toLocaleString()}</td>
                <td>{row.action}</td>
                <td>
                  {row.entityType} · {row.entityId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
