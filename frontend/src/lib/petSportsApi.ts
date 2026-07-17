"use client";

// API layer for the PET portal's sports events & competitions.
// Syncs events with the PostgreSQL database. All calls go through apiFetch so the
// backend JWT is attached (routes require the PET/TEACHER tier).

import { apiFetch } from "@/lib/api";
import { SportsEvent } from "@/lib/petData";

const TIMEOUT_MS = 12000;

async function request(path: string, init: RequestInit = {}): Promise<any> {
  const res = await apiFetch(`/api/pet/sports-conducted${path}`, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json.data;
}

export async function fetchSportsEvents(): Promise<SportsEvent[]> {
  return request("");
}

export async function createSportsEvent(ev: Omit<SportsEvent, "id">): Promise<SportsEvent> {
  return request("", {
    method: "POST",
    body: JSON.stringify(ev),
  });
}

export async function createSportsEventsBulk(events: Omit<SportsEvent, "id">[]): Promise<SportsEvent[]> {
  return request("/bulk", {
    method: "POST",
    body: JSON.stringify({ events }),
  });
}

export async function updateSportsEvent(ev: SportsEvent): Promise<SportsEvent> {
  return request(`/${ev.id}`, {
    method: "PUT",
    body: JSON.stringify(ev),
  });
}

export async function deleteSportsEvent(id: string): Promise<void> {
  await request(`/${id}`, { method: "DELETE" });
}

export async function fetchStudents(schoolId: string): Promise<any[]> {
  const res = await apiFetch(`/api/students?schoolId=${schoolId}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json.data;
}
