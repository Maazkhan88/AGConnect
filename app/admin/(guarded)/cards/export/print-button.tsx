"use client";

export function PrintButton() {
  return (
    <button type="button" className="button small" onClick={() => window.print()}>
      Print / Save as PDF
    </button>
  );
}
