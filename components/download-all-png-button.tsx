"use client";

import { useState } from "react";
import { createZip } from "@/lib/zip";

const PNG_SIZE = 640;

function svgToPngBytes(svg: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PNG_SIZE;
      canvas.height = PNG_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported."));
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, PNG_SIZE, PNG_SIZE);
      ctx.drawImage(img, 0, 0, PNG_SIZE, PNG_SIZE);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Could not export PNG."));
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Could not render QR code."));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/**
 * Rasterizing ~a dozen+ QR codes to PNG server-side (no canvas/native codec
 * in the Workers runtime, so it's real per-pixel JS work) was blowing
 * Cloudflare's per-request CPU budget ("Error 1102"). Doing it in the
 * browser instead is fast (hardware-accelerated canvas) and has no such
 * limit — the server only ever needs to hand over cheap SVGs.
 */
export function DownloadAllPngButton({ items }: { items: { slug: string; svg: string }[] }) {
  const [state, setState] = useState<"idle" | "working" | "error">("idle");

  async function handleClick() {
    setState("working");
    try {
      const files = [];
      for (const item of items) {
        files.push({ name: `${item.slug}.png`, content: await svgToPngBytes(item.svg) });
      }
      const zip = createZip(files);
      const blob = new Blob([zip as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "agconnect-qr-codes-png.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <button type="button" className="button small secondary" onClick={handleClick} disabled={state === "working"}>
      {state === "working" ? "Preparing…" : state === "error" ? "Failed — try again" : "Download all (PNG)"}
    </button>
  );
}
