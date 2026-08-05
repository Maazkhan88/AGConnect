"use client";

import { useActionState, useState } from "react";
import { createOrUpdateBrandAction, type FormState } from "@/app/admin/actions";
import type { SocialLink, SocialPlatform } from "@/lib/brand";
import { SOCIAL_PLATFORMS } from "@/lib/brand";

const initialState: FormState = {};

export function BrandForm({
  brand,
}: {
  brand?: { id: string; displayName: string; website: string | null; whatsapp: string | null; socials: SocialLink[] };
}) {
  const [state, formAction, pending] = useActionState(createOrUpdateBrandAction, initialState);
  const [socials, setSocials] = useState<SocialLink[]>(brand?.socials ?? []);

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
