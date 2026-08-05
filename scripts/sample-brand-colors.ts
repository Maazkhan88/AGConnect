/**
 * Decodes each `public/brands/<slug>/logo.png` (no image-processing dependency —
 * just zlib + a hand-rolled PNG scanline unfilter) and derives a small palette of
 * distinct, saturated colors via naive k-means-ish bucketing. Prints a JSON map of
 * slug -> { primary, secondary, accent } hex colors that `db/seed.ts` imports.
 *
 * Run: pnpm brands:sample-colors
 */
import { readFileSync, existsSync } from "node:fs";
import { inflateSync } from "node:zlib";
import path from "node:path";

const BRAND_SLUGS = ["ag-holding", "ghezlan", "ian", "novascape", "wisdom", "aefm", "aepm"];

type RGB = [number, number, number];

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buffer: Buffer): { width: number; height: number; pixels: RGB[] } {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("Not a PNG");
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 6;
  const idatChunks: Buffer[] = [];
  let palette: RGB[] = [];
  let trns: Buffer | null = null;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === "PLTE") {
      palette = [];
      for (let i = 0; i < data.length; i += 3) palette.push([data[i], data[i + 1], data[i + 2]]);
    } else if (type === "tRNS") {
      trns = data;
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  if (bitDepth !== 8) throw new Error(`Unsupported bit depth ${bitDepth} (only 8-bit PNGs supported)`);

  const raw = inflateSync(Buffer.concat(idatChunks));
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType] ?? 4;
  const bytesPerPixel = channels;
  const stride = width * bytesPerPixel;
  const pixels: RGB[] = [];
  let prevLine = Buffer.alloc(stride);
  let readOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filterType = raw[readOffset];
    readOffset += 1;
    const line = Buffer.from(raw.subarray(readOffset, readOffset + stride));
    readOffset += stride;

    for (let i = 0; i < stride; i += 1) {
      const a = i >= bytesPerPixel ? line[i - bytesPerPixel] : 0;
      const b = prevLine[i];
      const c = i >= bytesPerPixel ? prevLine[i - bytesPerPixel] : 0;
      let value = line[i];
      if (filterType === 1) value = (value + a) & 0xff;
      else if (filterType === 2) value = (value + b) & 0xff;
      else if (filterType === 3) value = (value + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) value = (value + paeth(a, b, c)) & 0xff;
      line[i] = value;
    }

    for (let x = 0; x < width; x += 1) {
      const base = x * bytesPerPixel;
      let r: number, g: number, bch: number, alpha = 255;
      if (colorType === 2) {
        [r, g, bch] = [line[base], line[base + 1], line[base + 2]];
      } else if (colorType === 6) {
        [r, g, bch, alpha] = [line[base], line[base + 1], line[base + 2], line[base + 3]];
      } else if (colorType === 0) {
        r = g = bch = line[base];
      } else if (colorType === 4) {
        r = g = bch = line[base];
        alpha = line[base + 1];
      } else if (colorType === 3) {
        const entry = palette[line[base]] ?? [0, 0, 0];
        [r, g, bch] = entry;
        alpha = trns ? (trns[line[base]] ?? 255) : 255;
      } else {
        r = g = bch = 0;
      }
      if (alpha > 40) pixels.push([r, g, bch]);
    }
    prevLine = line;
  }

  return { width, height, pixels };
}

function toHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("")}`;
}

function saturation([r, g, b]: RGB): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function luminance([r, g, b]: RGB): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isNearWhiteOrGray(rgb: RGB): boolean {
  const lum = luminance(rgb);
  return lum > 235 || (saturation(rgb) < 0.08 && lum > 60);
}

/** Buckets pixels into 24x24x24 color cells, returns the top N cell-average colors, most-populous first. */
function dominantColors(pixels: RGB[], count: number): RGB[] {
  const buckets = new Map<string, { sum: RGB; n: number }>();
  const step = 24;
  for (const px of pixels) {
    if (isNearWhiteOrGray(px)) continue;
    const key = px.map((c) => Math.floor(c / step)).join(",");
    const entry = buckets.get(key) ?? { sum: [0, 0, 0], n: 0 };
    entry.sum = [entry.sum[0] + px[0], entry.sum[1] + px[1], entry.sum[2] + px[2]];
    entry.n += 1;
    buckets.set(key, entry);
  }
  const ranked = [...buckets.values()].sort((a, b) => b.n - a.n);
  return ranked.slice(0, count).map((entry) => entry.sum.map((v) => v / entry.n) as RGB);
}

function darken([r, g, b]: RGB, factor: number): RGB {
  return [r * factor, g * factor, b * factor];
}

function main() {
  const result: Record<string, { primary: string; secondary: string; accent: string }> = {};
  for (const slug of BRAND_SLUGS) {
    const logoPath = path.join(process.cwd(), "public", "brands", slug, "logo.png");
    if (!existsSync(logoPath)) {
      console.error(`Missing logo for ${slug}, skipping`);
      continue;
    }
    const { pixels } = decodePng(readFileSync(logoPath));
    const dominant = dominantColors(pixels, 3);
    const [primary, secondary, accent] = [
      dominant[0] ?? [8, 38, 45],
      dominant[1] ?? darken(dominant[0] ?? [8, 38, 45], 0.7),
      dominant[2] ?? darken(dominant[0] ?? [196, 147, 69], 1.3),
    ];
    result[slug] = { primary: toHex(primary), secondary: toHex(secondary), accent: toHex(accent) };
  }
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}

main();
