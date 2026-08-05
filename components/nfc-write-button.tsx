"use client";

import { useState } from "react";

// Web NFC (NDEFReader) only exists in Chrome for Android, over HTTPS, opened
// directly (not inside an embedded webview) — there's no equivalent API on
// iOS Safari or desktop browsers, so this necessarily degrades to a message
// there rather than a working write.
type NdefRecordInit = { recordType: string; data: string };
type NdefReaderCtor = new () => { write: (message: { records: NdefRecordInit[] }) => Promise<void> };

export function NfcWriteButton({ url }: { url: string }) {
  const [status, setStatus] = useState<"idle" | "waiting" | "done" | "error" | "unsupported">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleWrite() {
    const NDEFReader = (window as unknown as { NDEFReader?: NdefReaderCtor }).NDEFReader;
    if (!NDEFReader) {
      setStatus("unsupported");
      setMessage("NFC writing needs Chrome on an Android phone with NFC turned on — it isn't supported on this browser/device.");
      return;
    }
    try {
      setStatus("waiting");
      setMessage("Hold your phone against the blank NFC card now…");
      const reader = new NDEFReader();
      await reader.write({ records: [{ recordType: "url", data: url }] });
      setStatus("done");
      setMessage("Card written successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not write to the card. Try again.");
    }
  }

  return (
    <div>
      <button type="button" className="text-link" onClick={handleWrite} disabled={status === "waiting"}>
        {status === "waiting" ? "Waiting for tap…" : "Write NFC card"}
      </button>
      {message && (
        <p className={status === "error" || status === "unsupported" ? "login-error" : "muted"} style={{ fontSize: 11, margin: "4px 0 0" }}>
          {message}
        </p>
      )}
    </div>
  );
}
