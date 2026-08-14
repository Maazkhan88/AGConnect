"use client";

import { useActionState, useState } from "react";
import { UserRoundPlus, X } from "lucide-react";
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

  return (
    <>
      <button type="button" className="share-fab" onClick={() => setOpen(true)} aria-label="Share your details">
        <UserRoundPlus size={20} />
        <span>Share your details</span>
      </button>

      {open && (
        <div className="share-fab-backdrop" onClick={() => setOpen(false)}>
          <div className="share-fab-panel" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="share-fab-close" onClick={() => setOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            {state.ok ? (
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                Thanks — {staffName.split(" ")[0]} now has your details.
              </p>
            ) : (
              <form action={formAction} className="share-fab-form">
                <h3>Share your details with {staffName.split(" ")[0]}</h3>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="brandId" value={brandId} />
                <input type="hidden" name="staffId" value={staffId} />
                <input type="hidden" name="profileId" value={profileId} />
                <input name="fullName" type="text" placeholder="Your name" required aria-label="Your name" />
                <input name="email" type="email" placeholder="Email" aria-label="Email" />
                <input name="phone" type="tel" placeholder="Phone" aria-label="Phone" />
                <label className="share-fab-consent">
                  <input type="checkbox" name="consent" required />
                  <span>I agree to be contacted by {staffName.split(" ")[0]} using these details.</span>
                </label>
                {state.error && (
                  <p className="login-error" role="alert">
                    {state.error}
                  </p>
                )}
                <button type="submit" className="button" disabled={pending}>
                  {pending ? "Sending…" : "Share details"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
