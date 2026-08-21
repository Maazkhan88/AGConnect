import QRCode from "qrcode";

// SVG is just path/string generation — module count (not `width`) drives its
// cost, so a large intrinsic size is free and makes exports crisp when
// scaled up. PNG is a real per-pixel raster + encode (no canvas/native
// codec available in the Workers runtime), so it's genuinely CPU-costly —
// generating many of these in one request (the bulk zip route) can trip
// Cloudflare's per-request CPU limit ("Error 1102") at very large sizes.
// 640px is still sharp for a printed card at normal viewing distance while
// staying well within budget even for a few dozen profiles in one request.
const SVG_WIDTH = 1024;
const PNG_WIDTH = 640;

/**
 * Renders a QR code as an inline SVG string (no external network call, no
 * client-side JS) pointing at the given URL. Used for the public profile
 * page's "save contact" flow and the admin Cards & QR list.
 */
export async function qrCodeSvg(url: string, width = SVG_WIDTH): Promise<string> {
  return QRCode.toString(url, { type: "svg", margin: 1, width });
}

/**
 * Same QR code as a PNG data: URL, for a plain <a download> link or
 * embedding directly — no canvas, no client-side JS needed.
 */
export async function qrCodePngDataUrl(url: string, width = PNG_WIDTH): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width });
}

/** Same as qrCodePngDataUrl but returns raw PNG bytes (for zipping). */
export async function qrCodePngBytes(url: string, width = PNG_WIDTH): Promise<Uint8Array> {
  const dataUrl = await qrCodePngDataUrl(url, width);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
