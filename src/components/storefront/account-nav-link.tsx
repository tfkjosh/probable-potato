"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AccountStatus = "loading" | "authenticated" | "anonymous" | "unavailable";

export function AccountNavLink() {
  const [status, setStatus] = useState<AccountStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccountStatus() {
      try {
        const response = await fetch("/api/customer/session", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to retrieve customer session.");
        }

        const data: { authenticated?: boolean } = await response.json();
        setStatus(data.authenticated ? "authenticated" : "anonymous");
      } catch {
        if (!controller.signal.aborted) {
          setStatus("unavailable");
        }
      }
    }

    void loadAccountStatus();

    return () => controller.abort();
  }, []);

  const label =
    status === "authenticated"
      ? "My account"
      : status === "anonymous"
        ? "Sign in"
        : "Account";

  return (
    <Link
      href="/account"
      aria-label={label}
      className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-white"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-[19px] w-[19px]"
      >
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.35" />
        <path
          d="M5.5 20c.6-3.4 2.9-5.2 6.5-5.2s5.9 1.8 6.5 5.2"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
