"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { API_URL } from "@/lib/api";

// Transitional bridge: the app has ~180 pages that call the backend with raw
// fetch() and no auth header, while the backend now rejects unauthenticated
// requests on protected routes. Until those pages migrate to apiFetch()
// (src/lib/api.ts), this component patches window.fetch once and injects the
// session's backend JWT as an Authorization bearer header on every request
// that targets the backend API. Remove it when the migration is complete.

let currentToken: string | null = null;
let patched = false;

function patchFetch() {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (currentToken && url.startsWith(API_URL)) {
        const headers = new Headers(
          init?.headers || (input instanceof Request ? input.headers : undefined)
        );
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${currentToken}`);
        }
        return originalFetch(input, { ...init, headers });
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
    currentToken = ((session?.user as any)?.backendToken as string) || null;
    patchFetch();
  }, [session]);

  return null;
}
