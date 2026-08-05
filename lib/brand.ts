import { z } from "zod";
import { themeSchema, type Theme } from "@/lib/theme/theme";

export const SOCIAL_PLATFORMS = [
  "linkedin",
  "instagram",
  "facebook",
  "tiktok",
  "snapchat",
  "x",
  "youtube",
  "whatsapp",
  "website",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: z.string().url(),
});
export type SocialLink = z.infer<typeof socialLinkSchema>;

export const socialLinksSchema = z.array(socialLinkSchema);

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  x: "X",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  website: "Website",
};

/** Group-level baseline theme; brand themes are merged on top via `resolveTheme()`. */
export const DEFAULT_THEME: Theme = {
  primary: "#08262d",
  secondary: "#4b8065",
  accent: "#c49345",
  background: "#eef1ef",
  surface: "#ffffff",
  text: "#08262d",
  textMuted: "#6c7975",
  border: "#dfe4e1",
  buttonPrimary: "#08262d",
  buttonPrimaryText: "#ffffff",
  buttonSecondary: "#ffffff",
  buttonSecondaryText: "#08262d",
  cardRadius: 13,
  buttonRadius: 32,
  fontHeading: "system",
  fontBody: "system",
};

export function parseSocialLinks(raw: string | null | undefined): SocialLink[] {
  if (!raw) return [];
  const parsed = socialLinksSchema.safeParse(safeJson(raw));
  return parsed.success ? parsed.data : [];
}

export function parseThemeValues(raw: string | null | undefined): Partial<Theme> {
  if (!raw) return {};
  const parsed = themeSchema.partial().safeParse(safeJson(raw));
  return parsed.success ? parsed.data : {};
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** kebab-case slug generator used for brand + profile slugs. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
