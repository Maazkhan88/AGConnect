"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Click a QR thumbnail to open it full-size in a modal, so you can point a
 * phone camera at the screen to test the scan without squinting at the
 * 56px table thumbnail.
 */
export function QrZoomButton({ svg, label }: { svg: string; label: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" className="qr-thumb-button" onClick={() => setOpen(true)} aria-label={`Zoom in on the QR code for ${label}`}>
        <span className="qr-thumb" dangerouslySetInnerHTML={{ __html: svg }} />
      </button>

      {open && (
        <div className="qr-zoom-overlay" onClick={() => setOpen(false)}>
          <div className="qr-zoom-panel" role="dialog" aria-modal="true" aria-label={`QR code for ${label}`} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="qr-zoom-close" onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
            <div className="qr-zoom-large" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="muted qr-zoom-caption">{label} — scan with your phone camera to test</p>
          </div>
        </div>
      )}
    </>
  );
}
