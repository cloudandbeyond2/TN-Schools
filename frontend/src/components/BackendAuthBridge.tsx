"use client";

import { useEffect } from "react";
import { getSession, useSession, signOut } from "next-auth/react";
import { API_URL } from "@/lib/api";

// Transitional bridge: the app has ~180 pages that call the backend with raw
// fetch() and no auth header, while the backend now rejects unauthenticated
// requests on protected routes. Until those pages migrate to apiFetch()
// (src/lib/api.ts), this component patches window.fetch once and injects the
// session's backend JWT as an Authorization bearer header on every request
// that targets the backend API. It also handles auto-signout if account is deleted (401).

let currentToken: string | null = null;
let patched = false;

function patchFetch() {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.startsWith(API_URL)) {
        let token = currentToken;
        if (!token) {
          const session = await getSession();
          token = ((session?.user as any)?.backendToken as string) || null;
          currentToken = token;
        }

        const headers = new Headers(
          init?.headers || (input instanceof Request ? input.headers : undefined)
        );
        if (token && !headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        const res = await originalFetch(input, { ...init, headers });
        if (res.status === 401) {
          // Backend rejected request (e.g. account deleted/deactivated). Immediately sign out.
          currentToken = null;
          signOut({ callbackUrl: "/login?reason=deactivated" });
        }
        return res;
      }
    } catch {
      // fall through to the unmodified call
    }
    return originalFetch(input, init);
  };
}

export default function BackendAuthBridge() {
  const { data: session } = useSession();

  useEffect(() => {
    const token = ((session?.user as any)?.backendToken as string) || null;
    currentToken = token;
    patchFetch();

    if (token) {
      // Proactively verify token status on backend on mount/session update
      window.fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (res.status === 401) {
          currentToken = null;
          signOut({ callbackUrl: "/login?reason=deactivated" });
        }
      }).catch(() => {});
    }
  }, [session]);

  return null;
}
