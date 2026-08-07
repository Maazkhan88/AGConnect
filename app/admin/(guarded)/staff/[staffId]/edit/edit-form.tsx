"use client";

import { useActionState, useState } from "react";
import { updateStaffAction, type FormState } from "@/app/admin/actions";

const initialState: FormState = {};

export function EditStaffForm({
  staffId,
  firstName,
  lastName,
  workEmail,
  jobTitle,
  phone,
  whatsapp,
  brandId,
  photoPath,
  brandOptions,
}: {
  staffId: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  jobTitle: string;
  phone: string;
  whatsapp: string;
  brandId: string;
  photoPath: string | null;
  brandOptions: { id: string; displayName: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateStaffAction, initialState);
  const [removePhoto, setRemovePhoto] = useState(false);

  return (
    <form className="form-grid" action={formAction}>
      <input type="hidden" name="staffId" value={staffId} />
      <div className="color-row">
        <label>
          First name
          <input name="firstName" defaultValue={firstName} required />
        </label>
        <label>
          Last name
          <input name="lastName" defaultValue={lastName} required />
        </label>
      </div>
      <label>
        Work email
        <input name="workEmail" type="email" defaultValue={workEmail} required />
      </label>
      <label>
        Job title
        <input name="jobTitle" defaultValue={jobTitle} placeholder="e.g. Marketing Executive" />
      </label>
      <label>
        Phone
        <input name="phone" defaultValue={phone} placeholder="+9715..." />
      </label>
      <label>
        WhatsApp number
        <input name="whatsapp" defaultValue={whatsapp} placeholder="+9715... (used for the WhatsApp button on their profile)" />
      </label>
      <label>
        Photo
        {photoPath && !removePhoto ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPath} alt="" width={48} height={48} style={{ borderRadius: "50%", objectFit: "cover" }} />
            <button type="button" className="text-link" onClick={() => setRemovePhoto(true)}>
              Remove current photo
            </button>
          </div>
        ) : removePhoto ? (
          <p className="muted" style={{ fontSize: 12, margin: "6px 0" }}>
            Photo will be removed on save.{" "}
            <button type="button" className="text-link" onClick={() => setRemovePhoto(false)}>
              Undo
            </button>
          </p>
        ) : null}
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
        {removePhoto && <input type="hidden" name="removePhoto" value="on" />}
      </label>
      <label>
        Brand
        <select name="brandId" required defaultValue={brandId}>
          {brandOptions.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.displayName}
            </option>
          ))}
        </select>
      </label>
      {state.error && <p className="login-error">{state.error}</p>}
      <button className="button small" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
