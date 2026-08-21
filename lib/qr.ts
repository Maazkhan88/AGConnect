import QRCode from "qrcode";

// 1024px is plenty for print-quality output at typical business-card sizes;
// since these are vector paths either way, a large intrinsic size costs
// nothing but makes the exported files crisp when scaled up.
const HI_RES = 1024;

/**
 * Renders a QR code as an inline SVG string (no external network call, no
 * client-side JS) pointing at the given URL. Used for the public profile
 * page's "save contact" flow and the admin Cards & QR list.
 */
export async function qrCodeSvg(url: string, width = HI_RES): Promise<string> {
  return QRCode.toString(url, { type: "svg", margin: 1, width });
}

/**
 * Same QR code as a high-resolution PNG data: URL, for a plain <a download>
 * link or embedding directly — no canvas, no client-side JS needed.
 */
export async function qrCodePngDataUrl(url: string, width = HI_RES): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width });
}

/** Same as qrCodePngDataUrl but returns raw PNG bytes (for zipping). */
export async function qrCodePngBytes(url: string, width = HI_RES): Promise<Uint8Array> {
  const dataUrl = await qrCodePngDataUrl(url, width);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
