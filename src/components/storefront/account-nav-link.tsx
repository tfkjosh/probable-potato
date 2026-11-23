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
      className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
    >
      {label}
    </Link>
  );
}
