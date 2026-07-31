import { type FormEvent, useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import "./auth.css";

export function AuthScreen() {
  const { error, notice, submitting, signIn, signUp, clearMessages } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => clearMessages, [clearMessages]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === "sign-in") await signIn(email, password);
    else await signUp(email, password);
  }

  function switchMode(nextMode: "sign-in" | "sign-up") {
    clearMessages();
    setMode(nextMode);
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <img src="/aionis-logo-transparent.png" alt="Aionis Timeline Formula" width="92" height="92" />
        <p className="eyebrow">Aionis Timeline Formula</p>
        <h1 id="auth-title">{mode === "sign-in" ? "Sign in to your charts" : "Create your private account"}</h1>
        <p className="auth-intro">Your saved people are kept in your signed-in account and isolated with database access policies.</p>
        <div className="auth-mode" role="group" aria-label="Authentication mode">
          <button className={mode === "sign-in" ? "active" : ""} type="button" onClick={() => switchMode("sign-in")}>Sign in</button>
          <button className={mode === "sign-up" ? "active" : ""} type="button" onClick={() => switchMode("sign-up")}>Create account</button>
        </div>
        <form className="person-form auth-form" onSubmit={submit}>
          <label>
            Email address
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <button className="primary-button full-button" type="submit" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="auth-connectivity">The installable app shell can open offline. Signing in and accessing cloud records require an internet connection.</p>
      </section>
    </main>
  );
}

export function AuthLoadingScreen() {
  return <main className="auth-shell"><section className="auth-card auth-state-card" role="status"><h1>Restoring your session…</h1></section></main>;
}

export function AuthConfigurationScreen() {
  return (
    <main className="auth-shell">
      <section className="auth-card auth-state-card" role="alert">
        <h1>Cloud connection not configured</h1>
        <p>Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, then rebuild the app.</p>
      </section>
    </main>
  );
}
