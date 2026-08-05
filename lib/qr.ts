import QRCode from "qrcode";

/**
 * Renders a QR code as an inline SVG string (no external network call, no
 * client-side JS) pointing at the given URL. Used for the public profile
 * page's "save contact" flow and the admin Cards & QR list.
 */
export async function qrCodeSvg(url: string): Promise<string> {
  return QRCode.toString(url, { type: "svg", margin: 1, width: 160 });
}
