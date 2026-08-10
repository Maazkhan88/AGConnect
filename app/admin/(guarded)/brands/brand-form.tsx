"use client";

import { useActionState, useState } from "react";
import { createOrUpdateBrandAction, type FormState } from "@/app/admin/actions";
import type { SocialLink, SocialPlatform } from "@/lib/brand";
import { SOCIAL_PLATFORMS } from "@/lib/brand";
import { ImageCropInput } from "@/components/image-crop-input";

// Matches the public profile's cover box (.network-cover height 220px inside
// a ~560px-wide card) so a crop here looks right there without further
// adjustment.
const BANNER_ASPECT = 560 / 220;

const initialState: FormState = {};

export function BrandForm({
  brand,
}: {
  brand?: {
    id: string;
    displayName: string;
    website: string | null;
    whatsapp: string | null;
    socials: SocialLink[];
    logoPath: string | null;
    bannerPath: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(createOrUpdateBrandAction, initialState);
  const [socials, setSocials] = useState<SocialLink[]>(brand?.socials ?? []);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);

  return (
    <form className="form-grid" action={formAction}>
      {brand && <input type="hidden" name="id" value={brand.id} />}
      <label>
        Brand name
        <input name="displayName" defaultValue={brand?.displayName} required />
      </label>
      <label>
        Website
        <input name="website" type="url" defaultValue={brand?.website ?? ""} placeholder="https://" />
      </label>
      <label>
        WhatsApp link
        <input name="whatsapp" type="url" defaultValue={brand?.whatsapp ?? ""} placeholder="https://wa.me/..." />
      </label>

      <div className="color-row">
        <label>
          Logo
          {brand?.logoPath && !removeLogo ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logoPath} alt="" style={{ maxWidth: 80, maxHeight: 50, objectFit: "contain" }} />
              <button type="button" className="text-link" onClick={() => setRemoveLogo(true)}>
                Remove
              </button>
            </div>
          ) : removeLogo ? (
            <p className="muted" style={{ fontSize: 12, margin: "6px 0" }}>
              Logo will be removed on save.{" "}
              <button type="button" className="text-link" onClick={() => setRemoveLogo(false)}>
                Undo
              </button>
            </p>
          ) : null}
          <input name="logo" type="file" accept="image/jpeg,image/png,image/webp" />
          {removeLogo && <input type="hidden" name="removeLogo" value="on" />}
        </label>
        <label>
          Banner
          {removeBanner && (
            <p className="muted" style={{ fontSize: 12, margin: "6px 0" }}>
              Banner will be removed on save.{" "}
              <button type="button" className="text-link" onClick={() => setRemoveBanner(false)}>
                Undo
              </button>
            </p>
          )}
          <ImageCropInput
            name="banner"
            aspect={BANNER_ASPECT}
            currentImage={removeBanner ? null : brand?.bannerPath}
            onRemove={() => setRemoveBanner(true)}
          />
          {removeBanner && <input type="hidden" name="removeBanner" value="on" />}
        </label>
      </div>

      <div>
        <p style={{ fontWeight: 700, fontSize: 13, margin: "4px 0 8px" }}>Social links</p>
        {socials.map((social, index) => (
          <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select
              name="social_platform"
              defaultValue={social.platform}
              style={{ padding: 8, borderRadius: 8, border: "1px solid #dfe4e1" }}
            >
              {SOCIAL_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            <input name="social_url" defaultValue={social.url} placeholder="https://" style={{ flex: 1 }} />
            <button
              type="button"
              className="text-link"
              onClick={() => setSocials((rows) => rows.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-link"
          onClick={() => setSocials((rows) => [...rows, { platform: "instagram" as SocialPlatform, url: "" }])}
        >
          + Add social link
        </button>
      </div>

      {state.error && <p className="login-error">{state.error}</p>}
      <button className="button small" type="submit" disabled={pending}>
        {pending ? "Saving…" : brand ? "Save brand" : "Create brand"}
      </button>
    </form>
  );
}
