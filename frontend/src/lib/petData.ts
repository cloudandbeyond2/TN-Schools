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

export function petLoad<T>(key: string, defaults: T): T {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    return JSON.parse(raw) as T;
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
    category: "Ball Games",
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

const RAW_DEFAULT_INVENTORY: (Partial<InventoryItem> & { id: string; item: string })[] = [
  // Ball games
  { id: "inv-1", item: "Football (Size 5)", category: "Ball Games", qty: 12, qtyIssued: 4, minQty: 6, condition: "Good", location: "Sports Room A", lastChecked: "2026-07-01", remarks: "4 issued to Inter-House League" },
  { id: "inv-2", item: "Volleyball", category: "Ball Games", qty: 10, qtyIssued: 2, minQty: 6, condition: "Good", location: "Sports Room A", lastChecked: "2026-07-01" },
  { id: "inv-3", item: "Volleyball Net", category: "Ball Games", qty: 2, qtyDamaged: 1, minQty: 2, condition: "Needs Repair", location: "Sports Room A", lastChecked: "2026-06-28", remarks: "One net frayed at edges" },
  { id: "inv-4", item: "Basketball", category: "Ball Games", qty: 8, minQty: 4, condition: "Good", location: "Sports Room A", lastChecked: "2026-07-01" },
  { id: "inv-5", item: "Throwball", category: "Ball Games", qty: 6, minQty: 4, condition: "Good", location: "Sports Room A", lastChecked: "2026-07-01" },
  { id: "inv-6", item: "Cricket Bat", category: "Ball Games", qty: 6, minQty: 4, condition: "Fair", location: "Sports Room B", lastChecked: "2026-06-25" },
  { id: "inv-7", item: "Cricket Ball (Leather)", category: "Ball Games", qty: 18, minQty: 10, condition: "Good", location: "Sports Room B", lastChecked: "2026-06-25" },
  { id: "inv-8", item: "Cricket Stumps Set", category: "Ball Games", qty: 3, minQty: 2, condition: "Good", location: "Sports Room B", lastChecked: "2026-06-25" },
  { id: "inv-9", item: "Handball", category: "Ball Games", qty: 4, minQty: 3, condition: "Good", location: "Sports Room A", lastChecked: "2026-07-01" },

  // Athletics
  { id: "inv-10", item: "Shot Put (4 kg / 5 kg)", category: "Athletics", qty: 6, minQty: 4, condition: "Good", location: "Athletics Store", lastChecked: "2026-06-30" },
  { id: "inv-11", item: "Discus (1 kg / 1.5 kg)", category: "Athletics", qty: 4, minQty: 3, condition: "Good", location: "Athletics Store", lastChecked: "2026-06-30" },
  { id: "inv-12", item: "Javelin (600 g / 700 g)", category: "Athletics", qty: 4, minQty: 3, condition: "Fair", location: "Athletics Store", lastChecked: "2026-06-30" },
  { id: "inv-13", item: "Relay Baton", category: "Athletics", qty: 8, minQty: 6, condition: "Good", location: "Athletics Store", lastChecked: "2026-06-30" },
  { id: "inv-14", item: "Hurdles (Adjustable)", category: "Athletics", qty: 10, minQty: 8, condition: "Good", location: "Athletics Store", lastChecked: "2026-06-30" },
  { id: "inv-15", item: "High Jump Bar & Stand", category: "Athletics", qty: 1, minQty: 1, condition: "Good", location: "Ground Shed", lastChecked: "2026-06-30" },
  { id: "inv-16", item: "Landing Mat (High Jump)", category: "Athletics", qty: 1, minQty: 1, condition: "Fair", location: "Ground Shed", lastChecked: "2026-06-30" },
  { id: "inv-17", item: "Measuring Tape (30 m)", category: "Athletics", qty: 2, minQty: 2, condition: "Good", location: "PET Office", lastChecked: "2026-06-30" },
  { id: "inv-18", item: "Stopwatch", category: "Athletics", qty: 4, minQty: 2, condition: "Good", location: "PET Office", lastChecked: "2026-06-30" },
  { id: "inv-19", item: "Whistle", category: "Athletics", qty: 6, minQty: 3, condition: "Good", location: "PET Office", lastChecked: "2026-06-30" },
  { id: "inv-20", item: "Marking Lime / Chunnambu (kg)", category: "Athletics", qty: 25, minQty: 10, condition: "New", location: "Ground Shed", lastChecked: "2026-07-05" },

  // Indoor games
  { id: "inv-21", item: "Chess Board Set", category: "Indoor Games", qty: 12, minQty: 6, condition: "Good", location: "Indoor Hall", lastChecked: "2026-06-20" },
  { id: "inv-22", item: "Carrom Board", category: "Indoor Games", qty: 4, minQty: 2, condition: "Good", location: "Indoor Hall", lastChecked: "2026-06-20" },
  { id: "inv-23", item: "Table Tennis Bat", category: "Indoor Games", qty: 8, qtyDamaged: 2, minQty: 4, condition: "Fair", location: "Indoor Hall", lastChecked: "2026-06-20", remarks: "2 bats with worn rubber — re-rubber or replace" },
  { id: "inv-24", item: "Table Tennis Ball", category: "Indoor Games", qty: 30, minQty: 12, condition: "New", location: "Indoor Hall", lastChecked: "2026-06-20" },
  { id: "inv-25", item: "Badminton Racket", category: "Indoor Games", qty: 10, minQty: 6, condition: "Good", location: "Indoor Hall", lastChecked: "2026-06-20" },
  { id: "inv-26", item: "Shuttlecock (Box of 10)", category: "Indoor Games", qty: 3, minQty: 2, condition: "New", location: "Indoor Hall", lastChecked: "2026-06-20" },

  // Fitness & training
  { id: "inv-27", item: "Skipping Rope", category: "Fitness & Training", qty: 20, minQty: 10, condition: "Good", location: "Sports Room B", lastChecked: "2026-06-15" },
  { id: "inv-28", item: "Cones / Markers", category: "Fitness & Training", qty: 30, minQty: 20, condition: "Good", location: "Sports Room B", lastChecked: "2026-06-15" },
  { id: "inv-29", item: "Kabaddi Mat (Roll)", category: "Fitness & Training", qty: 2, minQty: 2, condition: "Good", location: "Ground Shed", lastChecked: "2026-06-15" },
  { id: "inv-30", item: "Kho-Kho Pole Set", category: "Fitness & Training", qty: 2, minQty: 2, condition: "Good", location: "Ground Shed", lastChecked: "2026-06-15" },
  { id: "inv-31", item: "Yoga Mat", category: "Fitness & Training", qty: 25, minQty: 15, condition: "Good", location: "Indoor Hall", lastChecked: "2026-06-15" },
  { id: "inv-32", item: "Tug of War Rope", category: "Fitness & Training", qty: 1, minQty: 1, condition: "Good", location: "Ground Shed", lastChecked: "2026-06-15" },

  // First aid
  { id: "inv-33", item: "First Aid Kit (Complete Box)", category: "First Aid", qty: 3, minQty: 2, condition: "Good", location: "PET Office", lastChecked: "2026-07-05", remarks: "One kit each: PET office, ground shed, indoor hall" },
  { id: "inv-34", item: "Bandages & Gauze (Packs)", category: "First Aid", qty: 40, minQty: 20, condition: "New", location: "PET Office", lastChecked: "2026-07-05", expiryDate: "2028-03-31" },
  { id: "inv-35", item: "Antiseptic Liquid (Bottles)", category: "First Aid", qty: 2, minQty: 3, condition: "Good", location: "PET Office", lastChecked: "2026-07-05", expiryDate: "2026-08-15", remarks: "Low stock — reorder" },
  { id: "inv-36", item: "Crepe Bandage", category: "First Aid", qty: 8, minQty: 5, condition: "New", location: "PET Office", lastChecked: "2026-07-05", expiryDate: "2027-12-31" },
  { id: "inv-37", item: "Ice Pack / Cold Spray", category: "First Aid", qty: 4, minQty: 3, condition: "Good", location: "PET Office", lastChecked: "2026-07-05", expiryDate: "2026-06-30", remarks: "Spray cans past expiry — replace" },
  { id: "inv-38", item: "Stretcher", category: "First Aid", qty: 1, minQty: 1, condition: "Good", location: "Indoor Hall", lastChecked: "2026-07-05" },
];

export const DEFAULT_INVENTORY: InventoryItem[] = RAW_DEFAULT_INVENTORY.map(normalizeInventoryItem);

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
  qty: number;
  requestedBy: string; // teacher / class / house / team
  purpose: string;
  date: string; // ISO date requested
  neededBy?: string; // ISO date
  status: RequestStatus;
  notes?: string;
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

export const DEFAULT_REQUESTS: EquipmentRequest[] = [
  { id: "rq-1", type: "Issue", item: "Football (Size 5)", itemId: "inv-1", qty: 4, requestedBy: "Inter-House League — Red House", purpose: "League practice sessions", date: "2026-07-08", neededBy: "2026-07-10", status: "Issued" },
  { id: "rq-2", type: "Issue", item: "Cones / Markers", itemId: "inv-28", qty: 10, requestedBy: "Class 9A (Kabaddi squad)", purpose: "Agility drills", date: "2026-07-12", status: "Pending" },
  { id: "rq-3", type: "Purchase", item: "Hockey Sticks (Junior)", qty: 12, requestedBy: "PET Staff", purpose: "New hockey coaching unit from August", date: "2026-07-05", status: "Approved", notes: "Quotation requested from 2 vendors" },
  { id: "rq-4", type: "Issue", item: "Volleyball", itemId: "inv-2", qty: 2, requestedBy: "U-19 Volleyball Team", purpose: "State-level practice", date: "2026-07-01", status: "Issued" },
  { id: "rq-5", type: "Purchase", item: "Antiseptic Liquid (Bottles)", qty: 6, requestedBy: "PET Staff", purpose: "First-aid restock — current stock expiring", date: "2026-07-10", status: "Pending" },
];

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

export const DEFAULT_EVENTS: SportsEvent[] = [
  { id: "ev-1", name: "School Annual Sports Day", kind: "Event", sport: "Athletics & All Games", level: "Intra-School", date: "2026-08-15", venue: "School Main Ground", participants: 450, status: "Upcoming", notes: "March past, track & field, prize distribution", targetClasses: "All Classes", ageGroup: "Open" },
  { id: "ev-2", name: "Zonal Athletics Meet", kind: "Competition", sport: "Athletics", level: "Inter-School", date: "2026-06-15", venue: "Nehru Stadium, Coimbatore", participants: 24, status: "Completed", result: "3 Gold, 2 Silver, 4 Bronze", targetClasses: "Class 9-10", ageGroup: "Under-17" },
  { id: "ev-3", name: "District Kabaddi Championship (U-17)", kind: "Competition", sport: "Kabaddi", level: "District", date: "2026-07-18", venue: "GHSS Sulur Ground", participants: 12, status: "Upcoming", targetClasses: "Class 9-10", ageGroup: "Under-17" },
  { id: "ev-4", name: "District Kho-Kho Tournament (U-14)", kind: "Competition", sport: "Kho-Kho", level: "District", date: "2026-07-25", venue: "Corporation Ground, Coimbatore", participants: 12, status: "Upcoming", targetClasses: "Class 6-8", ageGroup: "Under-14" },
  { id: "ev-5", name: "District Chess Championship", kind: "Competition", sport: "Chess", level: "District", date: "2026-06-28", venue: "St. Joseph's MHSS", participants: 5, status: "Completed", result: "Runner-up — R. Rahul (Class 12C)", targetClasses: "All Classes", ageGroup: "Open" },
  { id: "ev-6", name: "State Level Volleyball (U-19)", kind: "Competition", sport: "Volleyball", level: "State", date: "2026-07-20", venue: "Jawaharlal Nehru Stadium, Chennai", participants: 12, status: "Upcoming", notes: "School team qualified from district round", targetClasses: "Class 11-12", ageGroup: "Under-19" },
  { id: "ev-7", name: "Inter-House Football League", kind: "Event", sport: "Football", level: "Intra-School", date: "2026-07-10", venue: "School Main Ground", participants: 88, status: "Ongoing", notes: "4 houses, round-robin format", targetClasses: "Class 9-12", ageGroup: "Open" },
  { id: "ev-8", name: "Divisional Table Tennis Meet", kind: "Competition", sport: "Table Tennis", level: "Inter-School", date: "2026-08-10", venue: "PSG College Indoor Stadium", participants: 6, status: "Upcoming", targetClasses: "Class 6-8", ageGroup: "Under-14" },
  { id: "ev-9", name: "Independence Day March Past & Drill", kind: "Event", sport: "Drill / Parade", level: "Intra-School", date: "2026-08-15", venue: "School Assembly Ground", participants: 200, status: "Upcoming", targetClasses: "All Classes", ageGroup: "Open" },
  { id: "ev-10", name: "SGFI State Athletics Selection Trials", kind: "Competition", sport: "Athletics", level: "State", date: "2026-09-05", venue: "SDAT Track, Chennai", participants: 6, status: "Upcoming", notes: "School Games Federation of India selections", targetClasses: "Class 11-12", ageGroup: "Under-19" },
  { id: "ev-11", name: "Yoga Day Mass Demonstration", kind: "Event", sport: "Yoga", level: "Intra-School", date: "2026-06-21", venue: "School Assembly Ground", participants: 350, status: "Completed", result: "All classes participated", targetClasses: "All Classes", ageGroup: "Open" },
  { id: "ev-12", name: "District Ball Badminton Tournament", kind: "Competition", sport: "Ball Badminton", level: "District", date: "2026-09-12", venue: "GHSS Pollachi", participants: 8, status: "Upcoming", targetClasses: "Class 11-12", ageGroup: "Under-19" },
];

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

export const DEFAULT_AWARDS: AwardRecord[] = [
  { id: "aw-1", student: "Arjun K.", class: "10A", sport: "Athletics — 100m Sprint", event: "Zonal Athletics Meet", level: "Inter-School", medal: "Gold", date: "2026-06-15", certificateIssued: true },
  { id: "aw-2", student: "Priya S.", class: "9B", sport: "Athletics — Long Jump", event: "Zonal Athletics Meet", level: "Inter-School", medal: "Gold", date: "2026-06-15", certificateIssued: true },
  { id: "aw-3", student: "Rahul M.", class: "12C", sport: "Chess", event: "District Chess Championship", level: "District", medal: "Silver", date: "2026-06-28", certificateIssued: true },
  { id: "aw-4", student: "Divya R.", class: "11A", sport: "Athletics — Shot Put", event: "Zonal Athletics Meet", level: "Inter-School", medal: "Gold", date: "2026-06-15", certificateIssued: false },
  { id: "aw-5", student: "Karthik V.", class: "8A", sport: "Athletics — 400m Relay", event: "Zonal Athletics Meet", level: "Inter-School", medal: "Silver", date: "2026-06-15", certificateIssued: false },
  { id: "aw-6", student: "Meena L.", class: "10B", sport: "Athletics — 200m Sprint", event: "Zonal Athletics Meet", level: "Inter-School", medal: "Bronze", date: "2026-06-15", certificateIssued: true },
  { id: "aw-7", student: "School Volleyball Team", class: "U-19", sport: "Volleyball", event: "District Volleyball Championship", level: "District", medal: "Trophy", date: "2026-02-10", certificateIssued: true },
  { id: "aw-8", student: "Sanjay P.", class: "9A", sport: "Kabaddi", event: "District Kabaddi Championship", level: "District", medal: "Certificate", date: "2026-01-22", certificateIssued: true },
];

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

export const DEFAULT_FACILITIES: Facility[] = [
  { id: "fc-1", name: "Main Football Ground", type: "Outdoor Field", status: "Ready for Use", surface: "Natural Grass", lastMaintained: "2026-07-06", notes: "Grass at optimal 30mm, mowed 2 days ago" },
  { id: "fc-2", name: "Volleyball Court", type: "Outdoor Court", status: "Ready for Use", surface: "Clay / Sand", lastMaintained: "2026-07-04" },
  { id: "fc-3", name: "Basketball Court", type: "Outdoor Court", status: "Needs Maintenance", surface: "Concrete", lastMaintained: "2026-06-20", notes: "Needs sweeping; net frayed on north hoop" },
  { id: "fc-4", name: "Kabaddi Court", type: "Outdoor Court", status: "Ready for Use", surface: "Mud / Mat", lastMaintained: "2026-07-02" },
  { id: "fc-5", name: "Kho-Kho Court", type: "Outdoor Court", status: "Ready for Use", surface: "Mud", lastMaintained: "2026-07-02" },
  { id: "fc-6", name: "200m Athletics Track", type: "Track", status: "Needs Maintenance", surface: "Cinder", lastMaintained: "2026-06-10", notes: "Lane markings faded — re-marking before Sports Day" },
  { id: "fc-7", name: "Indoor Games Hall", type: "Indoor", status: "Ready for Use", surface: "Cement Floor", lastMaintained: "2026-07-01", notes: "TT tables and badminton court inside" },
  { id: "fc-8", name: "Long Jump Pit", type: "Field Event Area", status: "Under Maintenance", surface: "Sand", lastMaintained: "2026-07-07", notes: "Fresh sand being filled this week" },
];

export const DEFAULT_MAINTENANCE: MaintenanceLog[] = [
  { id: "ml-1", facilityId: "fc-1", date: "2026-07-06", work: "Grass mowed and watered", by: "Ground Staff" },
  { id: "ml-2", facilityId: "fc-6", date: "2026-06-10", work: "Track rolled and levelled", by: "Ground Staff" },
  { id: "ml-3", facilityId: "fc-8", date: "2026-07-07", work: "Sand replacement started", by: "Contractor" },
];

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

export const DEFAULT_RECORDS: FitnessRecord[] = [
  {
    id: "fr-1", name: "Arjun K.", class: "10A", heightCm: 168, weightKg: 60, fitnessScore: 85,
    assessment: { endurance: 88, strength: 82, flexibility: 78, speed: 92, lastAssessed: "2026-06-20" },
    activityLevel: "Very Active", weeklyActivityHrs: 12,
    health: { restingHeartRate: 58, bloodGroup: "B+", vision: "Normal", lastCheckup: "2026-06-10" },
    mentalHealth: "Good", sport: "Athletics (Sprint)", status: "Fit for Nationals",
  },
  {
    id: "fr-2", name: "Priya S.", class: "9B", heightCm: 158, weightKg: 49, fitnessScore: 78,
    assessment: { endurance: 75, strength: 70, flexibility: 90, speed: 77, lastAssessed: "2026-06-20" },
    activityLevel: "Active", weeklyActivityHrs: 9,
    health: { restingHeartRate: 72, bloodGroup: "O+", vision: "Normal", lastCheckup: "2026-06-10", notes: "Monitor training load — exam term" },
    mentalHealth: "Stressed", sport: "Long Jump", status: "Monitor workload",
  },
  {
    id: "fr-3", name: "Rahul M.", class: "12C", heightCm: 175, weightKg: 71, fitnessScore: 92,
    assessment: { endurance: 94, strength: 90, flexibility: 85, speed: 97, lastAssessed: "2026-06-22" },
    activityLevel: "Very Active", weeklyActivityHrs: 14,
    health: { restingHeartRate: 55, bloodGroup: "A+", vision: "Normal", lastCheckup: "2026-06-10" },
    mentalHealth: "Excellent", sport: "Chess / Volleyball", status: "Team Captain",
  },
  {
    id: "fr-4", name: "Karthik V.", class: "8A", heightCm: 150, weightKg: 42, fitnessScore: 60,
    assessment: { endurance: 55, strength: 58, flexibility: 65, speed: 62, lastAssessed: "2026-06-18" },
    activityLevel: "Light", weeklyActivityHrs: 4,
    health: { restingHeartRate: 84, bloodGroup: "AB+", vision: "Glasses", lastCheckup: "2026-05-28" },
    mentalHealth: "Good", sport: "Relay", status: "Needs training",
  },
  {
    id: "fr-5", name: "Divya R.", class: "11A", heightCm: 162, weightKg: 58, fitnessScore: 88,
    assessment: { endurance: 84, strength: 95, flexibility: 82, speed: 91, lastAssessed: "2026-06-22" },
    activityLevel: "Very Active", weeklyActivityHrs: 11,
    health: { restingHeartRate: 62, bloodGroup: "O-", vision: "Normal", lastCheckup: "2026-06-10" },
    mentalHealth: "Good", sport: "Shot Put", status: "District squad",
  },
  {
    id: "fr-6", name: "Meena L.", class: "10B", heightCm: 156, weightKg: 47, fitnessScore: 81,
    assessment: { endurance: 80, strength: 74, flexibility: 86, speed: 84, lastAssessed: "2026-06-20" },
    activityLevel: "Active", weeklyActivityHrs: 8,
    health: { restingHeartRate: 68, bloodGroup: "B+", vision: "Normal", lastCheckup: "2026-06-10" },
    mentalHealth: "Good", sport: "Sprint", status: "Zonal medalist",
  },
  {
    id: "fr-7", name: "Sanjay P.", class: "9A", heightCm: 160, weightKg: 55, fitnessScore: 74,
    assessment: { endurance: 78, strength: 80, flexibility: 62, speed: 76, lastAssessed: "2026-06-18" },
    activityLevel: "Moderate", weeklyActivityHrs: 6,
    health: { restingHeartRate: 76, bloodGroup: "A-", vision: "Normal", lastCheckup: "2026-05-28" },
    mentalHealth: "Average", sport: "Kabaddi", status: "Regular practice",
  },
  {
    id: "fr-8", name: "Lakshmi N.", class: "7B", heightCm: 145, weightKg: 38, fitnessScore: 66,
    assessment: { endurance: 64, strength: 60, flexibility: 78, speed: 62, lastAssessed: "2026-06-18" },
    activityLevel: "Moderate", weeklyActivityHrs: 5,
    health: { restingHeartRate: 82, bloodGroup: "", vision: "Needs Check", lastCheckup: "2026-01-15", notes: "Vision screening due" },
    mentalHealth: "Good", sport: "Kho-Kho", status: "Junior squad",
  },
  {
    id: "fr-9", name: "Teenu", class: "10A", heightCm: 145, weightKg: 40, fitnessScore: 78,
    assessment: { endurance: 76, strength: 72, flexibility: 84, speed: 80, lastAssessed: "2026-06-20" },
    activityLevel: "Active", weeklyActivityHrs: 8,
    health: { restingHeartRate: 70, bloodGroup: "O+", vision: "Normal", lastCheckup: "2026-06-10" },
    mentalHealth: "Good", sport: "Athletics", status: "Healthy — Fit",
  },
];

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

// Default proposals based on common Tamil Nadu government school sports
// development routes: SDAT grants, Khelo India, CM's Sports-for-All, NABARD/
// MP-MLA local area funds and PTA contributions.
export const DEFAULT_IMPROVEMENTS: ImprovementPlan[] = [
  { id: "im-1", title: "Re-lay 200m cinder track with proper lane marking", scheme: "SDAT Infrastructure Grant", estimate: "₹4.5 L", status: "Submitted", notes: "Applied through District Sports Office; inspection pending" },
  { id: "im-2", title: "Synthetic volleyball court with lighting", scheme: "Khelo India — School Infrastructure", estimate: "₹8 L", status: "Proposed" },
  { id: "im-3", title: "Kabaddi & Kho-Kho court upgrade with mat surface", scheme: "CM's Anaivarukkum Viliyattu (Sports for All)", estimate: "₹2.5 L", status: "Approved", notes: "Work order expected this quarter" },
  { id: "im-4", title: "Indoor hall roof repair & new TT tables", scheme: "MP / MLA Local Area Development Fund", estimate: "₹3 L", status: "Proposed" },
  { id: "im-5", title: "Drinking water point & shade near main ground", scheme: "PTA / School Management Committee", estimate: "₹60 K", status: "In Progress" },
  { id: "im-6", title: "Gallery seating for Annual Sports Day", scheme: "SDAT / Corporate CSR", estimate: "₹6 L", status: "Proposed" },
];

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

export const DEFAULT_LOCAL_CLUBS: LocalClub[] = [
  {
    id: "cl-1", name: "Athletics Club", category: "Sports", icon: "🏃", coordinator: "PET Staff",
    meetingTime: "Mon & Thu, 4–5 PM", description: "Track and field training — sprints, jumps and throws.",
    members: [
      { id: "s-1", name: "Arjun K.", class: "10A" },
      { id: "s-2", name: "Priya S.", class: "9B" },
      { id: "s-6", name: "Meena L.", class: "10B" },
    ],
  },
  {
    id: "cl-2", name: "Kabaddi Club", category: "Sports", icon: "🤼", coordinator: "PET Staff",
    meetingTime: "Tue & Fri, 4–5 PM", description: "Traditional kabaddi coaching and inter-house matches.",
    members: [{ id: "s-7", name: "Sanjay P.", class: "9A" }],
  },
  {
    id: "cl-3", name: "Chess & Indoor Games Club", category: "Indoor", icon: "♟️", coordinator: "PET Staff",
    meetingTime: "Wed, 3:30–4:30 PM", description: "Chess, carrom and table tennis practice.",
    members: [{ id: "s-3", name: "Rahul M.", class: "12C" }],
  },
  {
    id: "cl-4", name: "Yoga & Fitness Club", category: "Wellness", icon: "🧘", coordinator: "PET Staff",
    meetingTime: "Daily, 7:30–8:00 AM", description: "Morning yoga, flexibility and general fitness sessions.",
    members: [],
  },
];

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
