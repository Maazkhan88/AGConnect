"use client";

import { useActionState } from "react";
import { createStaffAction, type FormState } from "@/app/admin/actions";

const initialState: FormState = {};

export function StaffForm({ brandOptions }: { brandOptions: { id: string; displayName: string }[] }) {
  const [state, formAction, pending] = useActionState(createStaffAction, initialState);

  return (
    <form className="form-grid" action={formAction}>
      <div className="color-row">
        <label>
          First name
          <input name="firstName" required />
        </label>
        <label>
          Last name
          <input name="lastName" required />
        </label>
      </div>
      <label>
        Work email
        <input name="workEmail" type="email" required />
      </label>
      <label>
        Job title
        <input name="jobTitle" placeholder="e.g. Marketing Executive" />
      </label>
      <label>
        Phone
        <input name="phone" placeholder="+9715..." />
      </label>
      <label>
        Photo
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
      </label>
      <label>
        Brand
        <select name="brandId" required defaultValue="">
          <option value="" disabled>
            Choose a brand
          </option>
          {brandOptions.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.displayName}
            </option>
          ))}
        </select>
      </label>
      {state.error && <p className="login-error">{state.error}</p>}
      <button className="button small" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create staff & publish profile"}
      </button>
    </form>
  );
}
