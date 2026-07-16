"use client";

// API layer for the PET portal's student fitness records.
//
// The backend stores records as a flat row (backend PetFitnessRecord model);
// the UI works with the nested FitnessRecord shape from petData.ts. The
// mappers below convert between the two. All calls go through apiFetch so the
// backend JWT is attached (routes require the PET/TEACHER tier).

import { apiFetch } from "@/lib/api";
import { FitnessRecord, overallFitness } from "@/lib/petData";

interface PetFitnessRow {
  id: string;
  schoolId: string | null;
  studentId: string | null;
  name: string;
  class: string;
  sport: string;
  status: string;
  heightCm: number;
  weightKg: number;
  endurance: number;
  strength: number;
  flexibility: number;
  speed: number;
  lastAssessed: string;
  activityLevel: string;
  weeklyActivityHrs: number;
  restingHeartRate: number;
  bloodGroup: string;
  vision: string;
  lastCheckup: string;
  healthNotes: string;
  mentalHealth: string;
}

const TIMEOUT_MS = 12000;

function rowToRecord(row: PetFitnessRow): FitnessRecord {
  const assessment = {
    endurance: row.endurance,
    strength: row.strength,
    flexibility: row.flexibility,
    speed: row.speed,
    lastAssessed: row.lastAssessed || undefined,
  };
  return {
    id: row.id,
    name: row.name,
    class: row.class,
    heightCm: row.heightCm,
    weightKg: row.weightKg,
    fitnessScore: overallFitness(assessment),
    assessment,
    activityLevel: (row.activityLevel as FitnessRecord["activityLevel"]) || "Moderate",
    weeklyActivityHrs: row.weeklyActivityHrs,
    health: {
      restingHeartRate: row.restingHeartRate,
      bloodGroup: row.bloodGroup,
      vision: (row.vision as FitnessRecord["health"]["vision"]) || "Normal",
      lastCheckup: row.lastCheckup || undefined,
      notes: row.healthNotes || undefined,
    },
    mentalHealth: (row.mentalHealth as FitnessRecord["mentalHealth"]) || "Good",
    sport: row.sport,
    status: row.status,
  };
}

function recordToBody(rec: Omit<FitnessRecord, "id"> & { id?: string }) {
  return {
    name: rec.name,
    class: rec.class,
    sport: rec.sport,
    status: rec.status,
    heightCm: rec.heightCm,
    weightKg: rec.weightKg,
    endurance: rec.assessment.endurance,
    strength: rec.assessment.strength,
    flexibility: rec.assessment.flexibility,
    speed: rec.assessment.speed,
    lastAssessed: rec.assessment.lastAssessed || "",
    activityLevel: rec.activityLevel,
    weeklyActivityHrs: rec.weeklyActivityHrs,
    restingHeartRate: rec.health.restingHeartRate,
    bloodGroup: rec.health.bloodGroup,
    vision: rec.health.vision,
    lastCheckup: rec.health.lastCheckup || "",
    healthNotes: rec.health.notes || "",
    mentalHealth: rec.mentalHealth,
  };
}

async function request(path: string, init: RequestInit = {}): Promise<any> {
  const res = await apiFetch(`/api/pet/fitness-records${path}`, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json.data;
}

export async function fetchFitnessRecords(): Promise<FitnessRecord[]> {
  const rows: PetFitnessRow[] = await request("");
  return rows.map(rowToRecord);
}

export async function createFitnessRecord(rec: Omit<FitnessRecord, "id">): Promise<FitnessRecord> {
  const row: PetFitnessRow = await request("", {
    method: "POST",
    body: JSON.stringify(recordToBody(rec)),
  });
  return rowToRecord(row);
}

export async function createFitnessRecordsBulk(recs: Omit<FitnessRecord, "id">[]): Promise<FitnessRecord[]> {
  const rows: PetFitnessRow[] = await request("/bulk", {
    method: "POST",
    body: JSON.stringify({ records: recs.map(recordToBody) }),
  });
  return rows.map(rowToRecord);
}

export async function updateFitnessRecord(rec: FitnessRecord): Promise<FitnessRecord> {
  const row: PetFitnessRow = await request(`/${rec.id}`, {
    method: "PUT",
    body: JSON.stringify(recordToBody(rec)),
  });
  return rowToRecord(row);
}

export async function deleteFitnessRecord(id: string): Promise<void> {
  await request(`/${id}`, { method: "DELETE" });
}
