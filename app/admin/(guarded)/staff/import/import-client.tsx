"use client";

import { useMemo, useRef, useState } from "react";
import { bulkImportStaffAction, type BulkImportResult } from "@/app/admin/actions";

type BrandOption = { id: string; displayName: string; slug: string };

type Row = {
  rowId: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  jobTitle: string;
  phone: string;
  brandId: string;
  selected: boolean;
  photo: File | null;
  photoPreview: string | null;
  result?: BulkImportResult;
};

const REQUIRED_HEADERS = ["firstname", "lastname", "workemail"];

// Minimal CSV parser: handles quoted fields with embedded commas/quotes, no external dependency.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  return rows;
}

export function ImportClient({ brandOptions }: { brandOptions: BrandOption[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = rows.filter((r) => r.selected).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  function resolveBrandId(value: string): string {
    const needle = value.trim().toLowerCase();
    if (!needle) return "";
    const match = brandOptions.find(
      (b) => b.slug.toLowerCase() === needle || b.displayName.toLowerCase() === needle,
    );
    return match?.id ?? "";
  }

  function handleCsvFile(file: File) {
    setParseError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const table = parseCsv(text);
      if (table.length < 2) {
        setParseError("CSV needs a header row plus at least one data row.");
        return;
      }
      const header = table[0].map((h) => h.trim().toLowerCase());
      const missing = REQUIRED_HEADERS.filter((h) => !header.includes(h));
      if (missing.length > 0) {
        setParseError(`Missing required column(s): ${missing.join(", ")}.`);
        return;
      }
      const col = (name: string) => header.indexOf(name);
      const parsed: Row[] = table.slice(1).map((cells, index) => ({
        rowId: `row-${index}-${crypto.randomUUID().slice(0, 8)}`,
        firstName: cells[col("firstname")]?.trim() ?? "",
        lastName: cells[col("lastname")]?.trim() ?? "",
        workEmail: cells[col("workemail")]?.trim() ?? "",
        jobTitle: col("jobtitle") >= 0 ? (cells[col("jobtitle")]?.trim() ?? "") : "",
        phone: col("phone") >= 0 ? (cells[col("phone")]?.trim() ?? "") : "",
        brandId: col("brand") >= 0 ? resolveBrandId(cells[col("brand")] ?? "") : "",
        selected: true,
        photo: null,
        photoPreview: null,
      }));
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  function updateRow(rowId: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  }

  function setAllSelected(value: boolean) {
    setRows((prev) => prev.map((r) => ({ ...r, selected: value })));
  }

  function handlePhotoChange(rowId: string, file: File | null) {
    updateRow(rowId, { photo: file, photoPreview: file ? URL.createObjectURL(file) : null });
  }

  const readyToSubmit = useMemo(
    () => rows.some((r) => r.selected && r.firstName && r.lastName && r.workEmail && r.brandId),
    [rows],
  );

  async function handleImport() {
    setSubmitting(true);
    const selected = rows.filter((r) => r.selected);
    const formData = new FormData();
    formData.set(
      "rows",
      JSON.stringify(
        selected.map((r) => ({
          rowId: r.rowId,
          firstName: r.firstName,
          lastName: r.lastName,
          workEmail: r.workEmail,
          jobTitle: r.jobTitle,
          phone: r.phone || null,
          brandId: r.brandId,
        })),
      ),
    );
    for (const r of selected) {
      if (r.photo) formData.set(`photo_${r.rowId}`, r.photo);
    }
    const results = await bulkImportStaffAction(formData);
    setRows((prev) => {
      const byId = new Map(results.map((res) => [res.rowId, res]));
      return prev.map((r) => (byId.has(r.rowId) ? { ...r, result: byId.get(r.rowId) } : r));
    });
    setSubmitting(false);
  }

  return (
    <div>
      {rows.length === 0 ? (
        <div className="panel" style={{ padding: 24 }}>
          <label className="button small" style={{ display: "inline-block", cursor: "pointer" }}>
            Choose CSV file
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCsvFile(file);
              }}
            />
          </label>
          {parseError && <p className="login-error">{parseError}</p>}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "16px 0" }}>
            <button className="text-link" type="button" onClick={() => setAllSelected(true)}>
              Select all
            </button>
            <button className="text-link" type="button" onClick={() => setAllSelected(false)}>
              Deselect all
            </button>
            <span className="muted">{selectedCount} of {rows.length} selected</span>
            <button
              className="text-link"
              type="button"
              onClick={() => {
                setRows([]);
                setParseError(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Start over with a new file
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => setAllSelected(e.target.checked)}
                      aria-label="Select all rows"
                    />
                  </th>
                  <th>Photo</th>
                  <th>First name</th>
                  <th>Last name</th>
                  <th>Work email</th>
                  <th>Job title</th>
                  <th>Phone</th>
                  <th>Brand</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(e) => updateRow(row.rowId, { selected: e.target.checked })}
                        aria-label={`Select ${row.firstName} ${row.lastName}`}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {row.photoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.photoPreview}
                            alt=""
                            width={32}
                            height={32}
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <span className="muted" style={{ fontSize: 11 }}>
                            No photo
                          </span>
                        )}
                        <label className="text-link" style={{ cursor: "pointer" }}>
                          {row.photo ? "Change" : "Add"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: "none" }}
                            onChange={(e) => handlePhotoChange(row.rowId, e.target.files?.[0] ?? null)}
                          />
                        </label>
                        {row.photo && (
                          <button
                            className="text-link"
                            type="button"
                            onClick={() => handlePhotoChange(row.rowId, null)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <input value={row.firstName} onChange={(e) => updateRow(row.rowId, { firstName: e.target.value })} />
                    </td>
                    <td>
                      <input value={row.lastName} onChange={(e) => updateRow(row.rowId, { lastName: e.target.value })} />
                    </td>
                    <td>
                      <input
                        value={row.workEmail}
                        type="email"
                        onChange={(e) => updateRow(row.rowId, { workEmail: e.target.value })}
                      />
                    </td>
                    <td>
                      <input value={row.jobTitle} onChange={(e) => updateRow(row.rowId, { jobTitle: e.target.value })} />
                    </td>
                    <td>
                      <input value={row.phone} onChange={(e) => updateRow(row.rowId, { phone: e.target.value })} />
                    </td>
                    <td>
                      <select value={row.brandId} onChange={(e) => updateRow(row.rowId, { brandId: e.target.value })}>
                        <option value="">Choose a brand</option>
                        {brandOptions.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.displayName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {row.result?.ok && row.result.slug ? (
                        <a className="text-link" href={`/p/${row.result.slug}`} target="_blank" rel="noreferrer">
                          Published
                        </a>
                      ) : row.result?.error ? (
                        <span className="login-error">{row.result.error}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            className="button small"
            type="button"
            style={{ marginTop: 20 }}
            disabled={!readyToSubmit || submitting}
            onClick={handleImport}
          >
            {submitting ? "Importing…" : `Import ${selectedCount} selected`}
          </button>
        </>
      )}
    </div>
  );
}
