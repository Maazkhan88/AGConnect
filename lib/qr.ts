import QRCode from "qrcode";

/**
 * Renders a QR code as an inline SVG string (no external network call, no
 * client-side JS) pointing at the given URL. Used for the public profile
 * page's "save contact" flow and the admin Cards & QR list.
 *
 * Pass `logoDataUri` to composite a brand logo in the center (e.g. from
 * `fetchLogoDataUri`) — this switches error correction to "H" (~30%
 * recoverable) since the logo occludes part of the code, and keeps the logo
 * itself well under that threshold so the code stays reliably scannable.
 */
export async function qrCodeSvg(url: string, opts?: { logoDataUri?: string | null }): Promise<string> {
  const logoDataUri = opts?.logoDataUri;
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width: 160,
    errorCorrectionLevel: logoDataUri ? "H" : "M",
  });
  return logoDataUri ? embedCenterLogo(svg, logoDataUri) : svg;
}

function embedCenterLogo(svg: string, logoDataUri: string): string {
  const viewBoxMatch = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) \1"/);
  if (!viewBoxMatch) return svg; // unexpected format — fail safe, no logo rather than a broken code
  const size = Number(viewBoxMatch[1]);

  // Keep the logo comfortably under the ~30% recoverable area of an
  // H-level QR code — 22% of the code's width, with a white pad plate
  // behind it so the logo doesn't blend into surrounding modules.
  const logoSize = size * 0.22;
  const padSize = logoSize * 1.35;
  const offset = (size - logoSize) / 2;
  const padOffset = (size - padSize) / 2;
  const padRadius = padSize * 0.16;

  const overlay = `<rect x="${padOffset}" y="${padOffset}" width="${padSize}" height="${padSize}" rx="${padRadius}" fill="#ffffff"/><image x="${offset}" y="${offset}" width="${logoSize}" height="${logoSize}" href="${logoDataUri}" preserveAspectRatio="xMidYMid meet"/>`;

  return svg.replace("</svg>", `${overlay}</svg>`);
}

/**
 * Same QR code as a data: URL PNG, for a plain <a download> link — no canvas,
 * no client-side JS needed. Logo compositing isn't available here (would
 * need a canvas library, which doesn't run in the Workers runtime) — use
 * qrCodeSvg for a logo'd code instead.
 */
export async function qrCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 512 });
}

/**
 * Fetches an image (a brand logo path, which may be a static /public asset
 * or an R2-backed /uploads/... path — both are just HTTP from the Worker's
 * own perspective) and returns it as a data: URI for embedding in an <image>
 * element. Returns null on any failure so a missing/broken logo degrades to
 * a plain QR code rather than breaking the page.
 */
export async function fetchLogoDataUri(baseUrl: string, logoPath: string): Promise<string | null> {
  try {
    const res = await fetch(new URL(logoPath, baseUrl));
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/png";
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return `data:${contentType};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}
