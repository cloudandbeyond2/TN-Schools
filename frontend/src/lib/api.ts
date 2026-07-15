"use client";

import { getSession } from "next-auth/react";

// Single source of truth for the backend base URL. New code should import
// this (and apiFetch) instead of re-declaring API_URL per page.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Fetch wrapper that attaches the backend JWT from the NextAuth session as an
// Authorization bearer header. Use for all calls to protected backend routes.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await getSession();
  const token = (session?.user as any)?.backendToken as string | undefined;

  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  return fetch(url, { ...init, headers });
}
