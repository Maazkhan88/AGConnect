import QRCode from "qrcode";

/**
 * Renders a QR code as an inline SVG string (no external network call, no
 * client-side JS) pointing at the given URL. Used for the public profile
 * page's "save contact" flow and the admin Cards & QR list.
 */
export async function qrCodeSvg(url: string): Promise<string> {
  return QRCode.toString(url, { type: "svg", margin: 1, width: 160 });
}

/**
 * Same QR code as a data: URL PNG, for a plain <a download> link — no canvas,
 * no client-side JS needed.
 */
export async function qrCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 512 });
}
