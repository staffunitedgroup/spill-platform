"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import { unlockSite } from "@/app/actions/lockscreen";

export function SiteLockscreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      const res = await unlockSite(password);
      if (res.success) {
        window.location.reload();
      } else {
        setError(res.error || "Incorrect password. Access denied.");
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
        inputRef.current?.select();
      }
    });
  };

  return (
    <div className="lockscreen">
      {/* Full-screen hero video background */}
      <video
        className="lockscreenVideo"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/spill/home/hero-v2-poster.jpg"
        aria-hidden="true"
      >
        <source src="/assets/spill/home/hero-v2.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="lockscreenOverlay" aria-hidden="true" />

      {/* Glassmorphism card */}
      <div className={`lockscreenCard ${isShaking ? "lockscreenCard--shake" : ""}`}>
        {/* Icon logo */}
        <div className="lockscreenLogoWrap">
          <Image
            src="/assets/spill/brand/logo-icon.png"
            alt="SPILL"
            width={360}
            height={360}
            priority
            className="lockscreenLogo"
          />
        </div>

        {/* Header */}
        <div className="lockscreenText">
          <h1 className="lockscreenTitle">PRIVATE ACCESS</h1>
          <p className="lockscreenSubtitle">
            This platform is currently private. Please enter your access password to continue.
          </p>
        </div>

        {/* Password Form */}
        <form className="lockscreenForm" onSubmit={handleSubmit}>
          <div className="lockscreenField">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter access password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={isPending}
              autoComplete="current-password"
              aria-label="Access password"
              required
              className="lockscreenInput"
            />
            <button
              type="button"
              className="lockscreenToggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div className="lockscreenError" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="lockscreenButton"
            disabled={isPending || !password.trim()}
          >
            {isPending ? (
              <span className="lockscreenSpinner" />
            ) : (
              <>
                <span>ENTER</span>
                <span className="lockscreenArrow">→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
