// ============================================================================
// PET (Physical Education Teacher) portal — shared types, default seed data
// and localStorage persistence helpers.
//
// Every PET module (inventory, events, awards, grounds, records) works out of
// the box with a sensible TN-school default dataset, and any edits the PET
// staff makes are persisted locally under the "pet-*" keys.
// ============================================================================

export const PET_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

export function isSeedEvent(name?: string): boolean {
  return false;
}

export function isSeedId(id: string): boolean {
  return false;
}

export function petLoad<T>(key: string, defaults: T): T {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter(
        (item: any) => item && item.id && !isSeedId(String(item.id))
      );
      return cleaned as unknown as T;
    }
    return parsed as T;
  } catch {
    return defaults;
  }
}

export function petSave<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / unavailable — ignore, page still works in memory
  }
}

export function petId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Inventory — default school sports material stock list
// ---------------------------------------------------------------------------

export type StockCategory =
  | "Ball Games"
  | "Athletics"
  | "Indoor Games"
  | "Fitness & Training"
  | "First Aid";

export interface InventoryItem {
  id: string;
  item: string;
  category: StockCategory;
  qty: number; // total units owned
  qtyIssued: number; // units currently issued out (in use)
  qtyDamaged: number; // units damaged, awaiting repair or write-off
  minQty: number; // low-stock threshold (on available units)
  condition: "New" | "Good" | "Fair" | "Needs Repair" | "Damaged";
  location: string;
  lastChecked: string; // ISO date
  expiryDate?: string; // ISO date — first-aid consumables
  remarks?: string;
}

export const INVENTORY_KEY = "pet-inventory";

// Units on the shelf right now.
export function availableQty(item: InventoryItem): number {
  return Math.max(0, item.qty - (item.qtyIssued || 0) - (item.qtyDamaged || 0));
}

export function isExpired(item: InventoryItem): boolean {
  return !!item.expiryDate && item.expiryDate < new Date().toISOString().slice(0, 10);
}

export function expiresSoon(item: InventoryItem): boolean {
  if (!item.expiryDate || isExpired(item)) return false;
  const soon = new Date();
  soon.setDate(soon.getDate() + 60);
  return item.expiryDate <= soon.toISOString().slice(0, 10);
}

/** Fill availability fields missing from older localStorage snapshots. */
export function normalizeInventoryItem(raw: Partial<InventoryItem> & { id: string; item: string }): InventoryItem {
  return {
    category: raw.category || inferCategory(raw.item),
    qty: 0,
    minQty: 0,
    condition: "Good",
    location: "",
    lastChecked: "",
    ...raw,
    qtyIssued: raw.qtyIssued ?? 0,
    qtyDamaged: raw.qtyDamaged ?? 0,
  } as InventoryItem;
}

const RAW_DEFAULT_INVENTORY: (Partial<InventoryItem> & { id: string; item: string })[] = [];

export const DEFAULT_INVENTORY: InventoryItem[] = [];

export function stockStatus(item: InventoryItem): "ok" | "warning" | "critical" {
  const avail = availableQty(item);
  if (item.condition === "Damaged" || avail === 0 || isExpired(item)) return "critical";
  if (avail < item.minQty || item.condition === "Needs Repair" || (item.qtyDamaged || 0) > 0 || expiresSoon(item)) {
    return "warning";
  }
  return "ok";
}

// ---------------------------------------------------------------------------
// Equipment requests — issue existing stock or purchase new equipment
// ---------------------------------------------------------------------------

export type RequestType = "Issue" | "Purchase";
export type RequestStatus = "Pending" | "Approved" | "Issued" | "Returned" | "Received" | "Rejected";

export interface EquipmentRequest {
  id: string;
  type: RequestType;
  item: string; // free text for purchases; equipment name for issues
  itemId?: string; // linked inventory item (Issue requests)
  category?: StockCategory | string;
  qty: number;
  requestedBy: string; // teacher / class / house / team
  purpose: string;
  date: string; // ISO date requested
  neededBy?: string; // ISO date
  status: RequestStatus;
  notes?: string;
}

export function inferCategory(item: string, existingCategory?: string): StockCategory {
  if (existingCategory && ["Ball Games", "Athletics", "Indoor Games", "Fitness & Training", "First Aid"].includes(existingCategory)) {
    return existingCategory as StockCategory;
  }
  const name = (item || "").toLowerCase();
  if (name.includes("first aid") || name.includes("medical") || name.includes("bandage")) return "First Aid";
  if (name.includes("run") || name.includes("jump") || name.includes("javelin") || name.includes("shot put") || name.includes("track") || name.includes("athletic")) return "Athletics";
  if (name.includes("chess") || name.includes("carrom") || name.includes("table tennis")) return "Indoor Games";
  if (name.includes("rope") || name.includes("dumb") || name.includes("mat") || name.includes("gym") || name.includes("fit")) return "Fitness & Training";
  return "Ball Games";
}

export const REQUESTS_KEY = "pet-equipment-requests";

// Statuses a request can move to next, per type.
export function nextRequestStatuses(req: EquipmentRequest): RequestStatus[] {
  switch (req.status) {
    case "Pending":
      return ["Approved", "Rejected"];
    case "Approved":
      return req.type === "Issue" ? ["Issued", "Rejected"] : ["Received", "Rejected"];
    case "Issued":
      return ["Returned"];
    default:
      return [];
  }
}

export const DEFAULT_REQUESTS: EquipmentRequest[] = [];

// ---------------------------------------------------------------------------
// Sports events & competitions — default TN school games calendar
// ---------------------------------------------------------------------------

export type EventLevel = "Intra-School" | "Inter-School" | "District" | "State" | "National";
export type EventKind = "Event" | "Competition";
export type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export interface SportsEvent {
  id: string;
  name: string;
  kind: EventKind;
  sport: string;
  level: EventLevel;
  date: string; // ISO date
  venue: string;
  participants: number;
  status: EventStatus;
  result?: string; // e.g. "Winners — District Champions", "2 Gold, 1 Silver"
  notes?: string;
  targetClasses?: string;
  ageGroup?: string;
}

export const EVENTS_KEY = "pet-sports-events";

export const DEFAULT_EVENTS: SportsEvent[] = [];

// ---------------------------------------------------------------------------
// Awards & certifications — wall of fame
// ---------------------------------------------------------------------------

export type MedalType = "Gold" | "Silver" | "Bronze" | "Certificate" | "Trophy";

export interface AwardRecord {
  id: string;
  student: string;
  class: string;
  sport: string;
  event: string;
  level: EventLevel;
  medal: MedalType;
  date: string; // ISO date
  certificateIssued: boolean;
}

export const AWARDS_KEY = "pet-awards";

export const DEFAULT_AWARDS: AwardRecord[] = [];

// ---------------------------------------------------------------------------
// Ground / facility condition
// ---------------------------------------------------------------------------

export type FacilityStatus = "Ready for Use" | "Needs Maintenance" | "Under Maintenance" | "Unusable";

export interface Facility {
  id: string;
  name: string;
  type: string;
  status: FacilityStatus;
  surface: string;
  lastMaintained: string; // ISO date
  notes?: string;
}

export interface MaintenanceLog {
  id: string;
  facilityId: string;
  date: string;
  work: string;
  by: string;
}

export const FACILITIES_KEY = "pet-facilities";
export const MAINTENANCE_KEY = "pet-maintenance-log";

export const DEFAULT_FACILITIES: Facility[] = [];

export const DEFAULT_MAINTENANCE: MaintenanceLog[] = [];

// ---------------------------------------------------------------------------
// Student fitness & health records
// ---------------------------------------------------------------------------

export type ActivityLevel = "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active";

export interface FitnessAssessment {
  endurance: number; // 0-100 (e.g. 600m run / beep test)
  strength: number; // 0-100 (e.g. sit-ups / push-ups)
  flexibility: number; // 0-100 (e.g. sit-and-reach)
  speed: number; // 0-100 (e.g. 50m dash)
  lastAssessed?: string; // ISO date of last assessment
}

export interface HealthIndicators {
  restingHeartRate: number; // bpm, 0 = not recorded
  bloodGroup: string; // "" = unknown
  vision: "Normal" | "Glasses" | "Needs Check";
  lastCheckup?: string; // ISO date of last health checkup
  notes?: string; // allergies, conditions, doctor advice
}

export interface FitnessRecord {
  id: string;
  name: string;
  class: string;
  heightCm: number;
  weightKg: number;
  fitnessScore: number; // 0-100 overall (avg of assessment components)
  assessment: FitnessAssessment;
  activityLevel: ActivityLevel;
  weeklyActivityHrs: number; // hours of physical activity per week
  health: HealthIndicators;
  mentalHealth: "Excellent" | "Good" | "Average" | "Stressed";
  sport: string;
  status: string;
}

export const RECORDS_KEY = "pet-fitness-records";

export function computeBmi(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(bmi: number): { label: string; tone: "green" | "amber" | "red" } {
  if (bmi <= 0) return { label: "—", tone: "amber" };
  if (bmi < 18.5) return { label: "Underweight", tone: "amber" };
  if (bmi < 25) return { label: "Healthy", tone: "green" };
  if (bmi < 30) return { label: "Overweight", tone: "amber" };
  return { label: "Obese", tone: "red" };
}

export function overallFitness(a: FitnessAssessment): number {
  return Math.round((a.endurance + a.strength + a.flexibility + a.speed) / 4);
}

export function fitnessGrade(score: number): { label: string; tone: "green" | "blue" | "amber" | "red" } {
  if (score >= 85) return { label: "Excellent", tone: "green" };
  if (score >= 70) return { label: "Good", tone: "blue" };
  if (score >= 50) return { label: "Fair", tone: "amber" };
  return { label: "Needs Improvement", tone: "red" };
}

export function heartRateStatus(bpm: number): { label: string; tone: "green" | "blue" | "amber" | "red" } {
  if (!bpm) return { label: "Not recorded", tone: "amber" };
  if (bpm < 60) return { label: "Athletic", tone: "blue" };
  if (bpm <= 90) return { label: "Normal", tone: "green" };
  if (bpm <= 100) return { label: "Elevated", tone: "amber" };
  return { label: "High — refer", tone: "red" };
}

export const ACTIVITY_LEVELS: ActivityLevel[] = ["Sedentary", "Light", "Moderate", "Active", "Very Active"];

// WHO recommends ~1 hr/day of moderate-vigorous activity for 5–17 year olds.
export function activityStatus(level: ActivityLevel, weeklyHrs: number): { label: string; tone: "green" | "amber" | "red" } {
  if (level === "Sedentary" || weeklyHrs < 3) return { label: "Below target", tone: "red" };
  if (level === "Light" || weeklyHrs < 7) return { label: "Near target", tone: "amber" };
  return { label: "On target", tone: "green" };
}

/**
 * Fill any missing new-schema fields on records loaded from older
 * localStorage snapshots so every module can rely on the full shape.
 */
export function normalizeFitnessRecord(raw: Partial<FitnessRecord> & { id: string; name: string }): FitnessRecord {
  const fitnessScore = raw.fitnessScore ?? 70;
  return {
    class: "",
    heightCm: 0,
    weightKg: 0,
    mentalHealth: "Good",
    sport: "",
    status: "",
    ...raw,
    fitnessScore,
    assessment: raw.assessment ?? {
      endurance: fitnessScore,
      strength: fitnessScore,
      flexibility: fitnessScore,
      speed: fitnessScore,
    },
    activityLevel: raw.activityLevel ?? "Moderate",
    weeklyActivityHrs: raw.weeklyActivityHrs ?? 5,
    health: raw.health ?? { restingHeartRate: 0, bloodGroup: "", vision: "Normal" },
  } as FitnessRecord;
}

export const DEFAULT_RECORDS: FitnessRecord[] = [];

// ---------------------------------------------------------------------------
// Facility improvement plans — TN school sports development schemes
// ---------------------------------------------------------------------------

export type ImprovementStatus = "Proposed" | "Submitted" | "Approved" | "In Progress" | "Completed";

export interface ImprovementPlan {
  id: string;
  title: string;
  scheme: string; // funding scheme / authority
  estimate: string; // rough cost estimate
  status: ImprovementStatus;
  notes?: string;
}

export const IMPROVEMENTS_KEY = "pet-improvement-plans";

export const DEFAULT_IMPROVEMENTS: ImprovementPlan[] = [];

// ---------------------------------------------------------------------------
// Standard school-level activity units (Tamil Nadu government schools)
// ---------------------------------------------------------------------------

export interface SchoolUnit {
  name: string;
  category: string;
  icon: string;
  meetingTime: string;
  description: string;
}

export const SCHOOL_UNITS: SchoolUnit[] = [
  { name: "National Cadet Corps (NCC)", category: "NCC", icon: "🎖️", meetingTime: "Sat, 7:30–10:30 AM", description: "Discipline, drill and leadership training; Republic Day and Independence Day parade contingents." },
  { name: "National Service Scheme (NSS)", category: "NSS", icon: "🤝", meetingTime: "Fri, 3:30–4:30 PM", description: "Community service — village camps, cleaning drives, awareness rallies and social work." },
  { name: "Junior Red Cross (JRC)", category: "JRC", icon: "⛑️", meetingTime: "Wed, 3:30–4:30 PM", description: "First aid training, health & hygiene awareness and disaster-preparedness activities." },
  { name: "Scouts & Guides", category: "Scouts & Guides", icon: "🏕️", meetingTime: "Sat, 3:00–5:00 PM", description: "Bharat Scouts and Guides — camps, knots & pioneering, community service and jamborees." },
  { name: "National Green Corps (Eco Club)", category: "Green Corps", icon: "🌱", meetingTime: "Thu, 3:30–4:30 PM", description: "Tree plantation, kitchen garden, plastic-free campus and environment awareness programmes." },
  { name: "Road Safety Patrol (RSP)", category: "RSP", icon: "🚦", meetingTime: "Tue, 3:30–4:30 PM", description: "Tamil Nadu Road Safety Patrol — traffic awareness, safe-crossing duty and road safety week." },
  { name: "Red Ribbon Club (RRC)", category: "Red Ribbon", icon: "🎗️", meetingTime: "Monthly, 1st Friday", description: "Health awareness, blood donation drives and peer education (higher secondary)." },
  { name: "Sports Club", category: "Sports", icon: "🏅", meetingTime: "Daily, 4:00–5:30 PM", description: "School teams practice — athletics, ball games and indoor games under PET supervision." },
];

// ---------------------------------------------------------------------------
// Local fallback data for the Clubs page (used when the backend is offline)
// ---------------------------------------------------------------------------

export interface LocalClub {
  id: string;
  name: string;
  category: string;
  icon: string;
  coordinator: string;
  meetingTime: string;
  description: string;
  members: { id: string; name: string; class: string }[];
}

export const LOCAL_CLUBS_KEY = "pet-local-clubs";

export const DEFAULT_LOCAL_CLUBS: LocalClub[] = [];

// Roster used to add members while offline.
export const LOCAL_STUDENT_ROSTER: { id: string; name: string; class: string }[] = [
  { id: "s-1", name: "Arjun K.", class: "10A" },
  { id: "s-2", name: "Priya S.", class: "9B" },
  { id: "s-3", name: "Rahul M.", class: "12C" },
  { id: "s-4", name: "Karthik V.", class: "8A" },
  { id: "s-5", name: "Divya R.", class: "11A" },
  { id: "s-6", name: "Meena L.", class: "10B" },
  { id: "s-7", name: "Sanjay P.", class: "9A" },
  { id: "s-8", name: "Lakshmi N.", class: "7B" },
  { id: "s-9", name: "Vignesh T.", class: "10A" },
  { id: "s-10", name: "Anitha B.", class: "11B" },
  { id: "s-11", name: "Mohan D.", class: "9B" },
  { id: "s-12", name: "Kavya S.", class: "8B" },
];
