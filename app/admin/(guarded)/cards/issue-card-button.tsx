"use client";

import { useTransition } from "react";
import { issueCardAction } from "@/app/admin/actions";

export function IssueCardButton({ profileId }: { profileId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="text-link"
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => issueCardAction(profileId))}
    >
      {pending ? "Issuing…" : "Issue card"}
    </button>
  );
}
