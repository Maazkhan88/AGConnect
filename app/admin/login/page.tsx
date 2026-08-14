"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="login-shell">
      <form className="login-card" action={formAction}>
        <span className="wordmark">
          <Image src="/brands/ag-holding/logo.png" alt="AG Holding" width={110} height={28} unoptimized priority />
          <span className="wordmark-text">AGConnect</span>
        </span>
        <h1>Admin login</h1>
        <p className="muted">Sign in to manage profiles, brands, and cards.</p>

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />

        <p className="muted" style={{ fontSize: 12, margin: "-2px 0 0" }}>
          Forgotten your password? A super-admin can reset it from Staff → Admin access.
        </p>

        {state.error && (
          <p className="login-error" role="alert">
            {state.error}
          </p>
        )}

        <button className="button" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>

        <p className="login-back">
          <Link className="text-link" href="/">
            Back to AGConnect
          </Link>
        </p>
      </form>
    </main>
  );
}
