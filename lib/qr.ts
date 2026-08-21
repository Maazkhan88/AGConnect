import QRCode from "qrcode";

// SVG is just path/string generation — module count (not `width`) drives its
// cost, so a large intrinsic size is free and makes exports crisp when
// scaled up. PNG generation, by contrast, is genuinely CPU-costly (real
// per-pixel raster + encode, no canvas/native codec in the Workers runtime)
// and now happens client-side instead — see
// components/download-all-png-button.tsx — precisely to avoid that cost on
// the server, so this file only ever needs to produce SVGs.
const SVG_WIDTH = 1024;

/**
 * Renders a QR code as an inline SVG string (no external network call, no
 * client-side JS) pointing at the given URL. Used for the public profile
 * page's "save contact" flow and the admin Cards & QR list.
 */
export async function qrCodeSvg(url: string, width = SVG_WIDTH): Promise<string> {
  return QRCode.toString(url, { type: "svg", margin: 1, width });
}
