"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

// Shared with /admin so staff only sign in once.
const PASSWORD_KEY = "spill-admin-password";

/** The admin password saved on this device (null = not signed in, undefined = still checking). */
export function useAdminPassword() {
  const [password, setPasswordState] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(PASSWORD_KEY);
    } catch {
      /* storage blocked — they'll sign in below */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPasswordState(saved);
  }, []);

  const setPassword = useCallback((value: string | null) => {
    try {
      if (value) localStorage.setItem(PASSWORD_KEY, value);
      else localStorage.removeItem(PASSWORD_KEY);
    } catch {
      /* ignore */
    }
    setPasswordState(value);
  }, []);

  return [password, setPassword] as const;
}

export function AdminSignIn({ onSignIn, error }: { onSignIn: (password: string) => void; error?: string }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("password") ?? "").trim();
    if (value) onSignIn(value);
  }
  return (
    <form className="inquiryForm adminWaitlistLogin" onSubmit={submit}>
      <label>
        Admin password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="button primary" type="submit">
        Enter <span>→</span>
      </button>
      {error && <p className="formStatus waitlistStatus error">{error}</p>}
    </form>
  );
}
