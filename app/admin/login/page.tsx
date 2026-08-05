"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="login-shell">
      <form className="login-card" action={formAction}>
        <p className="brand-mark">
          AG<span>CONNECT</span>
        </p>
        <h1>Admin sign in</h1>
        <p className="muted">Sign in with your AG Connect admin credentials.</p>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
        <p className="muted" style={{ fontSize: 12, margin: "-2px 0 0" }}>
          Forgot your password? Ask a super-admin to reset it from Admin → Staff → Admin access.
        </p>
        {state.error && <p className="login-error">{state.error}</p>}
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
