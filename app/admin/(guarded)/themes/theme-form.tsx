"use client";

import { useActionState } from "react";
import { updateBrandThemeAction, type FormState } from "@/app/admin/actions";
import type { Theme } from "@/lib/theme/theme";

const initialState: FormState = {};

const COLOR_FIELDS: { key: keyof Theme; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
  { key: "textMuted", label: "Muted text" },
  { key: "border", label: "Border" },
  { key: "buttonPrimary", label: "Button (primary)" },
  { key: "buttonPrimaryText", label: "Button text (primary)" },
  { key: "buttonSecondary", label: "Button (secondary)" },
  { key: "buttonSecondaryText", label: "Button text (secondary)" },
];

export function ThemeForm({ brandId, themeId, values }: { brandId: string; themeId: string | null; values: Theme }) {
  const [state, formAction, pending] = useActionState(updateBrandThemeAction, initialState);

  return (
    <form className="form-grid" action={formAction}>
      <input type="hidden" name="brandId" value={brandId} />
      {themeId && <input type="hidden" name="themeId" value={themeId} />}
      <div className="color-row">
        {COLOR_FIELDS.map((field) => (
          <label key={field.key}>
            {field.label}
            <input type="color" name={field.key} defaultValue={values[field.key] as string} />
          </label>
        ))}
      </div>
      <div className="color-row">
        <label>
          Card radius (px)
          <input type="number" name="cardRadius" min={0} max={48} defaultValue={values.cardRadius} />
        </label>
        <label>
          Button radius (px)
          <input type="number" name="buttonRadius" min={0} max={32} defaultValue={values.buttonRadius} />
        </label>
      </div>
      <div className="color-row">
        <label>
          Heading font
          <select name="fontHeading" defaultValue={values.fontHeading}>
            <option value="system">System</option>
            <option value="serif">Serif</option>
            <option value="inter">Inter</option>
          </select>
        </label>
        <label>
          Body font
          <select name="fontBody" defaultValue={values.fontBody}>
            <option value="system">System</option>
            <option value="inter">Inter</option>
          </select>
        </label>
      </div>
      {state.error && <p className="login-error">{state.error}</p>}
      <button className="button small" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save theme"}
      </button>
    </form>
  );
}
