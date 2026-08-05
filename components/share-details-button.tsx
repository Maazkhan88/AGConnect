"use client";

import { useActionState, useState } from "react";
import { submitLeadAction, type ShareDetailsState } from "@/app/p/[slug]/actions";

const initialState: ShareDetailsState = {};

export function ShareDetailsButton({
  groupId,
  brandId,
  staffId,
  profileId,
  staffName,
}: {
  groupId: string;
  brandId: string;
  staffId: string;
  profileId: string;
  staffName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitLeadAction, initialState);

  if (state.ok) {
    return (
      <p className="muted" style={{ fontSize: 13, margin: "12px 0 0" }}>
        Thanks — {staffName.split(" ")[0]} now has your details.
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className="share-details-toggle" onClick={() => setOpen(true)} style={{ marginTop: 12 }}>
        Share your details
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: "grid", gap: 8, marginTop: 12 }}>
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="staffId" value={staffId} />
      <input type="hidden" name="profileId" value={profileId} />
      <input name="fullName" placeholder="Your name" required style={{ padding: 10, borderRadius: 8, border: "1px solid #dfe4e1" }} />
      <input name="email" type="email" placeholder="Email" style={{ padding: 10, borderRadius: 8, border: "1px solid #dfe4e1" }} />
      <input name="phone" placeholder="Phone" style={{ padding: 10, borderRadius: 8, border: "1px solid #dfe4e1" }} />
      <label style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "flex-start" }}>
        <input type="checkbox" name="consent" required style={{ marginTop: 2 }} />
        <span>I agree to be contacted by {staffName.split(" ")[0]} using these details.</span>
      </label>
      {state.error && <p className="login-error">{state.error}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="share-details-toggle" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </button>
        <button type="button" className="text-link" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
