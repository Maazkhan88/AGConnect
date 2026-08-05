import type { R2Bucket } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

async function getUploadsBucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  const binding = (env as unknown as { UPLOADS?: R2Bucket }).UPLOADS;
  if (!binding) {
    throw new Error("R2 binding `UPLOADS` is missing. Run `wrangler r2 bucket create agconnect-uploads` and update wrangler.jsonc.");
  }
  return binding;
}

async function uploadImage(file: File | null, key: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Image must be a JPEG, PNG, or WebP file.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 5MB.");
  }
  const bucket = await getUploadsBucket();
  await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return `/uploads/${key}`;
}

function extOf(file: File): string {
  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
}

/**
 * Uploads a staff/profile photo to R2 and returns the public-facing path
 * (served by app/uploads/[...key]/route.ts) to store in profiles.photoPath.
 * Returns null if no file was provided — callers should treat that as "no photo".
 */
export async function uploadProfilePhoto(file: File | null, profileId: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  return uploadImage(file, `profiles/${profileId}.${extOf(file)}`);
}

/**
 * Uploads a brand logo or cover banner to R2, returned path stored in
 * brands.logoPath / brands.bannerPath. Returns null if no file was provided.
 */
export async function uploadBrandAsset(file: File | null, brandId: string, kind: "logo" | "banner"): Promise<string | null> {
  if (!file || file.size === 0) return null;
  return uploadImage(file, `brands/${brandId}/${kind}.${extOf(file)}`);
}
