"use client";

import React, { useMemo, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

/* ------------------------------- Types ------------------------------- */

type TabKey = "overview" | "records" | "beneficiaries" | "stock" | "menu" | "quality";

type RecordStatus = "Submitted" | "Pending Sync" | "Verified";
type BenCategory = "Regular Meal" | "Egg Alternative" | "Special Diet";
type BenStatus = "Active" | "Inactive" | "Transferred";
type StockCategory = "Grains" | "Pulses" | "Oil & Condiments" | "Perishables" | "Fuel";
type MenuCompliance = "Pending" | "Compliant" | "Deviation";
type QualityStatus = "Satisfactory" | "Needs Attention" | "Escalated";

interface DailyRecord {
  id: number;
  date: string;          // ISO date
  menuItem: string;
  studentsPresent: number;
  mealsServed: number;
  eggsServed: number;
  bananasServed: number;
  riceUsedKg: number;
  status: RecordStatus;
  remarks: string;
}

interface Beneficiary {
  id: number;
  name: string;
  classSection: string;
  emisId: string;
  category: BenCategory;
  mealsThisMonth: number;
  status: BenStatus;
  lastAvailed: string;   // ISO date
}

interface StockItem {
  id: number;
  item: string;
  category: StockCategory;
  quantity: number;
  unit: string;
  dailyUsage: number;    // avg consumed per school day
  reorderLevel: number;
  lastRefilled: string;  // ISO date
  supplier: string;
  reorderPlaced: boolean;
}

interface MenuDay {
  day: string;
  menuItem: string;
  accompaniment: string;
  eggDay: boolean;
  calories: number;
  proteinGm: number;
  compliance: MenuCompliance;
  deviationNote: string;
}

interface QualityReport {
  id: number;
  date: string;          // ISO date
  inspector: string;
  role: string;
  tasteRating: number;   // 1–5
  quantityRating: number;
  hygieneRating: number;
  issues: string;
  actionTaken: string;
  status: QualityStatus;
}

interface Activity {
  id: number;
  time: string;
  icon: string;
  text: string;
}

/* ----------------------------- Seed data ----------------------------- */

const TOTAL_ON_ROLL = 248;

const SEED_RECORDS: DailyRecord[] = [
  { id: 1, date: "2026-07-10", menuItem: "Curry Leaf Rice + Boiled Egg / Banana", studentsPresent: 238, mealsServed: 232, eggsServed: 219, bananasServed: 13, riceUsedKg: 29, status: "Submitted", remarks: "Egg tray shortfall of 6 covered with bananas." },
  { id: 2, date: "2026-07-09", menuItem: "Lemon Rice + Boiled Egg / Banana", studentsPresent: 241, mealsServed: 239, eggsServed: 226, bananasServed: 13, riceUsedKg: 30, status: "Verified", remarks: "" },
  { id: 3, date: "2026-07-08", menuItem: "Vegetable Pulav + Boiled Egg / Banana", studentsPresent: 236, mealsServed: 234, eggsServed: 221, bananasServed: 13, riceUsedKg: 29, status: "Verified", remarks: "" },
  { id: 4, date: "2026-07-07", menuItem: "Mixed Vegetable Rice + Boiled Egg / Banana", studentsPresent: 244, mealsServed: 241, eggsServed: 228, bananasServed: 13, riceUsedKg: 30, status: "Verified", remarks: "" },
  { id: 5, date: "2026-07-06", menuItem: "Sambar Rice + Boiled Egg / Banana", studentsPresent: 240, mealsServed: 238, eggsServed: 225, bananasServed: 13, riceUsedKg: 30, status: "Verified", remarks: "" },
  { id: 6, date: "2026-07-03", menuItem: "Curry Leaf Rice + Boiled Egg / Banana", studentsPresent: 233, mealsServed: 229, eggsServed: 216, bananasServed: 13, riceUsedKg: 28, status: "Verified", remarks: "Two students on leave after serving count." },
  { id: 7, date: "2026-07-02", menuItem: "Lemon Rice + Boiled Egg / Banana", studentsPresent: 246, mealsServed: 244, eggsServed: 231, bananasServed: 13, riceUsedKg: 31, status: "Verified", remarks: "" },
];

const SEED_BENEFICIARIES: Beneficiary[] = [
  { id: 1,  name: "Praveen Kumar S.", classSection: "10A", emisId: "330123456711", category: "Regular Meal",    mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 2,  name: "Shalini K.",       classSection: "12A", emisId: "330123456715", category: "Regular Meal",    mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 3,  name: "Imran Khan J.",    classSection: "9B",  emisId: "330123456719", category: "Egg Alternative", mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 4,  name: "Nivedha M.",       classSection: "10B", emisId: "330123456722", category: "Regular Meal",    mealsThisMonth: 7, status: "Active",      lastAvailed: "2026-07-09" },
  { id: 5,  name: "Ajith Kumar R.",   classSection: "11C", emisId: "330123456726", category: "Regular Meal",    mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 6,  name: "Fathima R.",       classSection: "12B", emisId: "330123456730", category: "Egg Alternative", mealsThisMonth: 6, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 7,  name: "Deepika V.",       classSection: "12A", emisId: "330123456733", category: "Regular Meal",    mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 8,  name: "Karthik M.",       classSection: "12C", emisId: "330123456737", category: "Special Diet",    mealsThisMonth: 7, status: "Active",      lastAvailed: "2026-07-09" },
  { id: 9,  name: "Sowmiya P.",       classSection: "8A",  emisId: "330123456741", category: "Regular Meal",    mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 10, name: "Vignesh S.",       classSection: "12B", emisId: "330123456745", category: "Regular Meal",    mealsThisMonth: 5, status: "Inactive",    lastAvailed: "2026-07-03" },
  { id: 11, name: "Meena L.",         classSection: "7B",  emisId: "330123456749", category: "Egg Alternative", mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 12, name: "Arun Prasad K.",   classSection: "11A", emisId: "330123456753", category: "Regular Meal",    mealsThisMonth: 0, status: "Transferred", lastAvailed: "2026-06-26" },
  { id: 13, name: "Lakshmi Priya D.", classSection: "6A",  emisId: "330123456757", category: "Special Diet",    mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
  { id: 14, name: "Surya Narayanan",  classSection: "9A",  emisId: "330123456761", category: "Regular Meal",    mealsThisMonth: 8, status: "Active",      lastAvailed: "2026-07-10" },
];

const SEED_STOCK: StockItem[] = [
  { id: 1, item: "Fine Rice",              category: "Grains",           quantity: 340, unit: "kg",     dailyUsage: 30,  reorderLevel: 120, lastRefilled: "2026-07-05", supplier: "TN Civil Supplies Corp.",  reorderPlaced: false },
  { id: 2, item: "Toor Dal",               category: "Pulses",           quantity: 85,  unit: "kg",     dailyUsage: 6,   reorderLevel: 40,  lastRefilled: "2026-07-05", supplier: "TN Civil Supplies Corp.",  reorderPlaced: false },
  { id: 3, item: "Double Fortified Salt",  category: "Oil & Condiments", quantity: 15,  unit: "kg",     dailyUsage: 1.5, reorderLevel: 12,  lastRefilled: "2026-06-20", supplier: "Block Godown, Coimbatore", reorderPlaced: false },
  { id: 4, item: "Fortified Palm Oil",     category: "Oil & Condiments", quantity: 45,  unit: "litres", dailyUsage: 3,   reorderLevel: 20,  lastRefilled: "2026-07-05", supplier: "TN Civil Supplies Corp.",  reorderPlaced: false },
  { id: 5, item: "Fresh Eggs",             category: "Perishables",      quantity: 180, unit: "pieces", dailyUsage: 225, reorderLevel: 450, lastRefilled: "2026-07-08", supplier: "District Egg Federation",  reorderPlaced: true },
  { id: 6, item: "Bananas",                category: "Perishables",      quantity: 60,  unit: "pieces", dailyUsage: 14,  reorderLevel: 30,  lastRefilled: "2026-07-09", supplier: "Local Farmer Co-op",       reorderPlaced: false },
  { id: 7, item: "Bengal Gram",            category: "Pulses",           quantity: 110, unit: "kg",     dailyUsage: 4,   reorderLevel: 35,  lastRefilled: "2026-07-05", supplier: "TN Civil Supplies Corp.",  reorderPlaced: false },
  { id: 8, item: "LPG Cylinders",          category: "Fuel",             quantity: 3,   unit: "units",  dailyUsage: 0.2, reorderLevel: 2,   lastRefilled: "2026-06-28", supplier: "Indane Distributor",       reorderPlaced: false },
];

const SEED_MENU: MenuDay[] = [
  { day: "Monday",    menuItem: "Sambar Rice + Boiled Egg / Banana",          accompaniment: "Potato Fry",              eggDay: true, calories: 620, proteinGm: 18, compliance: "Compliant", deviationNote: "" },
  { day: "Tuesday",   menuItem: "Mixed Vegetable Rice + Boiled Egg / Banana", accompaniment: "Black Bengal Gram Sundal", eggDay: true, calories: 605, proteinGm: 17, compliance: "Compliant", deviationNote: "" },
  { day: "Wednesday", menuItem: "Vegetable Pulav + Boiled Egg / Banana",      accompaniment: "Boiled Potatoes",         eggDay: true, calories: 615, proteinGm: 17, compliance: "Compliant", deviationNote: "" },
  { day: "Thursday",  menuItem: "Lemon Rice + Boiled Egg / Banana",           accompaniment: "Fried Potatoes",          eggDay: true, calories: 590, proteinGm: 16, compliance: "Deviation", deviationNote: "Potato stock exhausted — sundal served as accompaniment." },
  { day: "Friday",    menuItem: "Curry Leaf Rice + Boiled Egg / Banana",      accompaniment: "Fried Bengal Gram",       eggDay: true, calories: 600, proteinGm: 17, compliance: "Pending",   deviationNote: "" },
];

const SEED_QUALITY: QualityReport[] = [
  { id: 1, date: "2026-07-10", inspector: "Mrs. Kalaiselvi P.", role: "Teacher on Duty",  tasteRating: 4, quantityRating: 5, hygieneRating: 4, issues: "None. Sample tasted 30 min before serving.", actionTaken: "—", status: "Satisfactory" },
  { id: 2, date: "2026-07-09", inspector: "Mr. Venkatesh R.",   role: "Headmaster",       tasteRating: 4, quantityRating: 4, hygieneRating: 5, issues: "None.", actionTaken: "—", status: "Satisfactory" },
  { id: 3, date: "2026-07-08", inspector: "Mrs. Revathi S.",    role: "VEC Member",       tasteRating: 3, quantityRating: 4, hygieneRating: 3, issues: "Kitchen drainage slow; water pooling near washing area.", actionTaken: "Plumber engaged; drainage cleared on Jul 09.", status: "Needs Attention" },
  { id: 4, date: "2026-07-04", inspector: "Mr. Manikandan T.",  role: "Block MDM Officer", tasteRating: 4, quantityRating: 4, hygieneRating: 4, issues: "Egg storage tray uncovered.", actionTaken: "Covered storage bins issued same day.", status: "Satisfactory" },
  { id: 5, date: "2026-07-01", inspector: "Mrs. Kalaiselvi P.", role: "Teacher on Duty",  tasteRating: 2, quantityRating: 3, hygieneRating: 4, issues: "Sambar found watery; dal proportion below scale.", actionTaken: "Cook counselled; dal issue escalated to block office.", status: "Escalated" },
];

const SEED_ACTIVITY: Activity[] = [
  { id: 1, time: "Today, 12:45 PM", icon: "🍛", text: "Daily meal log posted — 232 of 238 present students served." },
  { id: 2, time: "Today, 9:10 AM",  icon: "🥚", text: "Egg stock low (180 pcs) — reorder confirmed with District Egg Federation." },
  { id: 3, time: "Yesterday",       icon: "✅", text: "Jul 09 meal record verified against EMIS attendance." },
  { id: 4, time: "Jul 09",          icon: "🧂", text: "Fortified salt flagged Low Stock — indent raised to block godown." },
  { id: 5, time: "Jul 08",          icon: "📋", text: "VEC inspection logged — kitchen drainage issue marked Needs Attention." },
];

/* ---------------------------- Small helpers --------------------------- */

const RECORD_BADGE: Record<RecordStatus, string> = {
  Submitted: "badge-blue",
  "Pending Sync": "badge-yellow",
  Verified: "badge-green",
};

const BEN_CAT_META: Record<BenCategory, { icon: string; color: string }> = {
  "Regular Meal":    { icon: "🍛", color: "#3b82f6" },
  "Egg Alternative": { icon: "🍌", color: "#f59e0b" },
  "Special Diet":    { icon: "🥗", color: "#10b981" },
};

const BEN_STATUS_BADGE: Record<BenStatus, string> = {
  Active: "badge-green",
  Inactive: "badge-yellow",
  Transferred: "badge-red",
};

const STOCK_CAT_ICON: Record<StockCategory, string> = {
  Grains: "🌾",
  Pulses: "🫘",
  "Oil & Condiments": "🧂",
  Perishables: "🥚",
  Fuel: "🔥",
};

const QUALITY_BADGE: Record<QualityStatus, string> = {
  Satisfactory: "badge-green",
  "Needs Attention": "badge-yellow",
  Escalated: "badge-red",
};

const COMPLIANCE_BADGE: Record<MenuCompliance, string> = {
  Compliant: "badge-green",
  Deviation: "badge-red",
  Pending: "badge-yellow",
};

type StockLevel = "Adequate" | "Low Stock" | "Critical";

function stockLevel(s: StockItem): StockLevel {
  if (s.quantity <= s.reorderLevel * 0.5) return "Critical";
  if (s.quantity <= s.reorderLevel) return "Low Stock";
  return "Adequate";
}

const STOCK_LEVEL_BADGE: Record<StockLevel, string> = {
  Adequate: "badge-green",
  "Low Stock": "badge-yellow",
  Critical: "badge-red",
};

function stockDaysLeft(s: StockItem): number {
  return s.dailyUsage > 0 ? Math.floor(s.quantity / s.dailyUsage) : 99;
}

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function coverage(r: DailyRecord): number {
  return r.studentsPresent > 0 ? Math.round((r.mealsServed / r.studentsPresent) * 100) : 0;
}

function stars(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

/* ------------------------------- Page -------------------------------- */

export default function MiddayMealPage() {
  const { lang } = usePortalLanguage();
  const [records, setRecords] = useState<DailyRecord[]>(SEED_RECORDS);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(SEED_BENEFICIARIES);
  const [stock, setStock] = useState<StockItem[]>(SEED_STOCK);
  const [menu, setMenu] = useState<MenuDay[]>(SEED_MENU);
  const [quality, setQuality] = useState<QualityReport[]>(SEED_QUALITY);
  const [activity, setActivity] = useState<Activity[]>(SEED_ACTIVITY);

  const [tab, setTab] = useState<TabKey>("overview");
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "warn" } | null>(null);

  // Overview lookup
  const [lookup, setLookup] = useState("");

  // Records tab state
  const [recSearch, setRecSearch] = useState("");
  const [recStatusFilter, setRecStatusFilter] = useState<"All" | RecordStatus>("All");
  const [showLogMeal, setShowLogMeal] = useState(false);

  // Beneficiaries tab state
  const [benSearch, setBenSearch] = useState("");
  const [benCatFilter, setBenCatFilter] = useState<"All" | BenCategory>("All");
  const [benStatusFilter, setBenStatusFilter] = useState<"All" | BenStatus>("All");
  const [showAddBen, setShowAddBen] = useState(false);

  // Stock tab state
  const [stockSearch, setStockSearch] = useState("");
  const [stockCatFilter, setStockCatFilter] = useState<"All" | StockCategory>("All");
  const [refillItem, setRefillItem] = useState<StockItem | null>(null);

  // Menu tab state
  const [deviationDay, setDeviationDay] = useState<MenuDay | null>(null);

  // Quality tab state
  const [qualSearch, setQualSearch] = useState("");
  const [qualStatusFilter, setQualStatusFilter] = useState<"All" | QualityStatus>("All");
  const [showAddReport, setShowAddReport] = useState(false);

  const showToast = (text: string, tone: "ok" | "warn" = "ok") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const logActivity = (icon: string, text: string) => {
    setActivity((prev) => [{ id: Date.now(), time: "Just now", icon, text }, ...prev].slice(0, 12));
  };

  /* --------------------------- Derived stats -------------------------- */

  const today = records[0];

  const stats = useMemo(() => {
    const activeBens = beneficiaries.filter((b) => b.status === "Active").length;
    const monthMeals = records.reduce((a, r) => a + r.mealsServed, 0);
    const avgCoverage = records.length
      ? Math.round(records.reduce((a, r) => a + coverage(r), 0) / records.length)
      : 0;
    const lowItems = stock.filter((s) => stockLevel(s) === "Low Stock").length;
    const criticalItems = stock.filter((s) => stockLevel(s) === "Critical").length;
    const avgQuality = quality.length
      ? (quality.reduce((a, q) => a + (q.tasteRating + q.quantityRating + q.hygieneRating) / 3, 0) / quality.length)
      : 0;
    const openIssues = quality.filter((q) => q.status !== "Satisfactory").length;
    const compliantDays = menu.filter((m) => m.compliance === "Compliant").length;
    const markedDays = menu.filter((m) => m.compliance !== "Pending").length;
    const pendingSync = records.filter((r) => r.status !== "Verified").length;
    return {
      activeBens,
      monthMeals,
      avgCoverage,
      lowItems,
      criticalItems,
      avgQuality: Math.round(avgQuality * 10) / 10,
      openIssues,
      menuCompliance: markedDays ? Math.round((compliantDays / markedDays) * 100) : 0,
      pendingSync,
    };
  }, [beneficiaries, records, stock, quality, menu]);

  const benCatCounts = useMemo(() => {
    const counts: Record<BenCategory, number> = { "Regular Meal": 0, "Egg Alternative": 0, "Special Diet": 0 };
    beneficiaries.filter((b) => b.status === "Active").forEach((b) => { counts[b.category] += 1; });
    return counts;
  }, [beneficiaries]);

  const stockAlerts = useMemo(
    () => stock.filter((s) => stockLevel(s) !== "Adequate").sort((a, b) => stockDaysLeft(a) - stockDaysLeft(b)),
    [stock]
  );

  const coverageTrend = useMemo(
    () => [...records].sort((a, b) => a.date.localeCompare(b.date)).slice(-7),
    [records]
  );

  /* ------------------------------ Lookup ------------------------------ */

  const lookupResults = useMemo(() => {
    const q = lookup.trim().toLowerCase();
    if (q.length < 2) return null;
    const bens = beneficiaries.filter(
      (b) => b.name.toLowerCase().includes(q) || b.emisId.includes(q) || b.classSection.toLowerCase().includes(q)
    ).slice(0, 5);
    const items = stock.filter(
      (s) => s.item.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.supplier.toLowerCase().includes(q)
    ).slice(0, 5);
    const recs = records.filter(
      (r) => r.menuItem.toLowerCase().includes(q) || fmtDate(r.date).toLowerCase().includes(q) || r.date.includes(q)
    ).slice(0, 5);
    const reports = quality.filter(
      (r) => r.inspector.toLowerCase().includes(q) || r.role.toLowerCase().includes(q) || r.issues.toLowerCase().includes(q)
    ).slice(0, 5);
    return { bens, items, recs, reports, empty: !bens.length && !items.length && !recs.length && !reports.length };
  }, [lookup, beneficiaries, stock, records, quality]);

  const openLookupBen = (b: Beneficiary) => { setTab("beneficiaries"); setBenSearch(b.emisId); setBenCatFilter("All"); setBenStatusFilter("All"); };
  const openLookupStock = (s: StockItem) => { setTab("stock"); setStockSearch(s.item); setStockCatFilter("All"); };
  const openLookupRecord = (r: DailyRecord) => { setTab("records"); setRecSearch(r.date); setRecStatusFilter("All"); };
  const openLookupReport = (r: QualityReport) => { setTab("quality"); setQualSearch(r.inspector); setQualStatusFilter("All"); };

  /* ------------------------------ Actions ----------------------------- */

  const verifyRecord = (id: number) => {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Verified" } : r)));
    logActivity("✅", `${fmtDate(rec.date)} meal record verified against EMIS attendance.`);
    showToast(`✓ ${fmtDate(rec.date)} record marked Verified.`);
  };

  const saveMealLog = (rec: DailyRecord) => {
    setRecords((prev) => [rec, ...prev.filter((r) => r.date !== rec.date)]);
    // consume stock: rice + eggs + bananas
    setStock((prev) =>
      prev.map((s) => {
        if (s.item === "Fine Rice") return { ...s, quantity: Math.max(0, s.quantity - rec.riceUsedKg) };
        if (s.item === "Fresh Eggs") return { ...s, quantity: Math.max(0, s.quantity - rec.eggsServed) };
        if (s.item === "Bananas") return { ...s, quantity: Math.max(0, s.quantity - rec.bananasServed) };
        return s;
      })
    );
    setShowLogMeal(false);
    logActivity("🍛", `Daily meal log posted — ${rec.mealsServed} of ${rec.studentsPresent} present students served.`);
    showToast(`✓ Meal record for ${fmtDate(rec.date)} posted to the TN MDM portal. Stock auto-deducted.`);
  };

  const addBeneficiary = (b: Beneficiary) => {
    setBeneficiaries((prev) => [b, ...prev]);
    setShowAddBen(false);
    logActivity("👤", `${b.name} (Class ${b.classSection}) enrolled as MDM beneficiary — ${b.category}.`);
    showToast(`✓ ${b.name} enrolled under the noon meal roll.`);
  };

  const toggleBenStatus = (id: number) => {
    const ben = beneficiaries.find((b) => b.id === id);
    if (!ben || ben.status === "Transferred") return;
    const next: BenStatus = ben.status === "Active" ? "Inactive" : "Active";
    setBeneficiaries((prev) => prev.map((b) => (b.id === id ? { ...b, status: next } : b)));
    logActivity(next === "Active" ? "✅" : "⏸️", `${ben.name} marked ${next} on the meal roll.`);
    showToast(`${ben.name} is now ${next}.`, next === "Active" ? "ok" : "warn");
  };

  const refillStock = (id: number, qty: number) => {
    const item = stock.find((s) => s.id === id);
    if (!item || qty <= 0) return;
    setStock((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, quantity: s.quantity + qty, lastRefilled: new Date().toISOString().slice(0, 10), reorderPlaced: false }
          : s
      )
    );
    setRefillItem(null);
    logActivity("📦", `${item.item} refilled with ${qty} ${item.unit} from ${item.supplier}.`);
    showToast(`✓ ${item.item} stock updated: +${qty} ${item.unit}.`);
  };

  const placeReorder = (id: number) => {
    const item = stock.find((s) => s.id === id);
    if (!item) return;
    setStock((prev) => prev.map((s) => (s.id === id ? { ...s, reorderPlaced: true } : s)));
    logActivity("🛒", `Reorder indent raised for ${item.item} with ${item.supplier}.`);
    showToast(`✓ Reorder placed for ${item.item}.`);
  };

  const markCompliance = (day: string, status: MenuCompliance, note = "") => {
    setMenu((prev) => prev.map((m) => (m.day === day ? { ...m, compliance: status, deviationNote: note } : m)));
    setDeviationDay(null);
    logActivity(status === "Compliant" ? "✅" : "⚠️", `${day} menu marked ${status}${note ? ` — ${note}` : "."}`);
    showToast(status === "Compliant" ? `✓ ${day} menu marked served as sanctioned.` : `⚠ Deviation recorded for ${day}.`, status === "Compliant" ? "ok" : "warn");
  };

  const addQualityReport = (r: QualityReport) => {
    setQuality((prev) => [r, ...prev]);
    setShowAddReport(false);
    logActivity("📋", `${r.role} inspection logged by ${r.inspector} — ${r.status}.`);
    showToast(`✓ Quality report filed. Status: ${r.status}.`, r.status === "Satisfactory" ? "ok" : "warn");
  };

  const resolveReport = (id: number) => {
    const rep = quality.find((q) => q.id === id);
    if (!rep) return;
    setQuality((prev) => prev.map((q) => (q.id === id ? { ...q, status: "Satisfactory", actionTaken: q.actionTaken === "—" ? "Issue resolved and closed by HM." : q.actionTaken } : q)));
    logActivity("✅", `Quality issue of ${fmtDate(rep.date)} closed by HM.`);
    showToast(`✓ ${fmtDate(rep.date)} report closed as resolved.`);
  };

  /* --------------------------- Filtered lists ------------------------- */

  const filteredRecords = records.filter((r) => {
    const q = recSearch.trim().toLowerCase();
    const matchesQ = !q || r.menuItem.toLowerCase().includes(q) || r.date.includes(q) || fmtDate(r.date).toLowerCase().includes(q);
    const matchesStatus = recStatusFilter === "All" || r.status === recStatusFilter;
    return matchesQ && matchesStatus;
  });

  const filteredBens = beneficiaries.filter((b) => {
    const q = benSearch.trim().toLowerCase();
    const matchesQ = !q || b.name.toLowerCase().includes(q) || b.emisId.includes(q) || b.classSection.toLowerCase().includes(q);
    const matchesCat = benCatFilter === "All" || b.category === benCatFilter;
    const matchesStatus = benStatusFilter === "All" || b.status === benStatusFilter;
    return matchesQ && matchesCat && matchesStatus;
  });

  const filteredStock = stock.filter((s) => {
    const q = stockSearch.trim().toLowerCase();
    const matchesQ = !q || s.item.toLowerCase().includes(q) || s.supplier.toLowerCase().includes(q);
    const matchesCat = stockCatFilter === "All" || s.category === stockCatFilter;
    return matchesQ && matchesCat;
  });

  const filteredQuality = quality.filter((r) => {
    const q = qualSearch.trim().toLowerCase();
    const matchesQ = !q || r.inspector.toLowerCase().includes(q) || r.role.toLowerCase().includes(q) || r.issues.toLowerCase().includes(q);
    const matchesStatus = qualStatusFilter === "All" || r.status === qualStatusFilter;
    return matchesQ && matchesStatus;
  });

  /* ------------------------------ Render ------------------------------ */

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview",      label: lang === "தமிழ்" ? "மேலோட்டம்"              : "Overview",         icon: "📊" },
    { key: "records",       label: lang === "தமிழ்" ? "உணவு பதிவுகள்"          : "Daily Records",    icon: "🍛" },
    { key: "beneficiaries", label: lang === "தமிழ்" ? "பயனாளர்கள்"             : "Beneficiaries",    icon: "👥" },
    { key: "stock",         label: lang === "தமிழ்" ? "உணவு கிடங்கு"           : "Kitchen Stock",    icon: "📦" },
    { key: "menu",          label: lang === "தமிழ்" ? "மெனு கண்காணிப்பு"      : "Menu Monitoring",  icon: "📅" },
    { key: "quality",       label: lang === "தமிழ்" ? "தரம் அறிக்கைகள்"       : "Quality Reports",  icon: "🧪" },
  ];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "மதியம் உணவு கண்காணிப்பு" : "Mid-Day Meal Monitoring"}
      subtitle={lang === "தமிழ்" ? "மாணவர்களுக்கான தினசரி உணவு பரிமாற்றம், பயனாளர்கள் மற்றும் உணவு தரம் கண்காணிக்கவும்." : "Monitor daily meal servings, beneficiaries and kitchen stock."}
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Hero banner */}
      <div className="rounded-2xl p-6 mb-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 text-[120px] opacity-15 select-none" aria-hidden>🍛</div>
        <div className="text-lg font-black" style={{ color: "#fff" }}>{lang === "தமிழ்" ? "மதியம் உணவு கண்காணிப்பு" : "Mid-Day Meal Monitoring"}</div>
        <p className="text-xs mt-1 max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
          {lang === "தமிழ்" ? "மாணவர்களுக்கான தினசரி உணவு பரிமாற்றம், பயனாளர்கள் மற்றும் உணவுமக சரகுகள், அனுமதிக்கப்பட்ட மெனுவை கண்காணித்து தரம் ஆய்வுகளை பதிவு செய்யவும்." : "Single desk for the PM POSHAN / Puratchi Thalaivar MGR Nutritious Meal Programme — log daily servings, track beneficiaries and kitchen stock, monitor the sanctioned menu and file quality inspections."}
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.activeBens}</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "வினையொளிர்" : "Active beneficiaries"}</span></div>
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.monthMeals.toLocaleString("en-IN")}</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "ஜூலையில் உணவு பரிமாற்றம்" : "Meals served in July"}</span></div>
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.avgCoverage}%</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "சராசரி உல்ளடக்கம்" : "Avg coverage"}</span></div>
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.avgQuality}/5</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "தரம் மதிப்பெண்" : "Quality score"}</span></div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t.key ? "bg-emerald-600" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            style={tab === t.key ? { color: "#fff" } : undefined}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ============================ OVERVIEW ============================ */}
      {tab === "overview" && (
        <>
          {/* Quick lookup */}
          <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
            <h2 className="text-base font-semibold text-white mb-1">🔎 Quick Lookup</h2>
            <p className="text-xs text-slate-500 mb-4">Search across beneficiaries, stock items, daily records and inspection reports in one place.</p>
            <input
              type="text"
              placeholder="🔍 Try a student name, EMIS ID, grocery item, date (2026-07-09) or inspector…"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {lookupResults && (
              <div className="mt-4">
                {lookupResults.empty ? (
                  <div className="text-xs text-slate-500 italic py-2">No matches for “{lookup}” across the meal desk.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lookupResults.bens.map((b) => (
                      <button key={`b${b.id}`} onClick={() => openLookupBen(b)} className="text-left p-3 bg-slate-900/60 rounded-xl border border-slate-850 hover:border-emerald-500/50 transition-all">
                        <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-0.5">👥 Beneficiary</div>
                        <div className="text-xs font-bold text-white">{b.name} · Class {b.classSection}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">EMIS {b.emisId} · {b.category} · {b.status}</div>
                      </button>
                    ))}
                    {lookupResults.items.map((s) => (
                      <button key={`s${s.id}`} onClick={() => openLookupStock(s)} className="text-left p-3 bg-slate-900/60 rounded-xl border border-slate-850 hover:border-emerald-500/50 transition-all">
                        <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-0.5">📦 Stock Item</div>
                        <div className="text-xs font-bold text-white">{STOCK_CAT_ICON[s.category]} {s.item}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{s.quantity} {s.unit} on hand · {stockLevel(s)} · ~{stockDaysLeft(s)} days left</div>
                      </button>
                    ))}
                    {lookupResults.recs.map((r) => (
                      <button key={`r${r.id}`} onClick={() => openLookupRecord(r)} className="text-left p-3 bg-slate-900/60 rounded-xl border border-slate-850 hover:border-emerald-500/50 transition-all">
                        <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-0.5">🍛 Daily Record</div>
                        <div className="text-xs font-bold text-white">{fmtDate(r.date)} — {r.mealsServed}/{r.studentsPresent} served</div>
                        <div className="text-[10px] text-slate-500 font-semibold truncate">{r.menuItem} · {r.status}</div>
                      </button>
                    ))}
                    {lookupResults.reports.map((r) => (
                      <button key={`q${r.id}`} onClick={() => openLookupReport(r)} className="text-left p-3 bg-slate-900/60 rounded-xl border border-slate-850 hover:border-emerald-500/50 transition-all">
                        <div className="text-[10px] uppercase font-bold text-violet-400 tracking-wider mb-0.5">🧪 Quality Report</div>
                        <div className="text-xs font-bold text-white">{r.inspector} · {fmtDate(r.date)}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{r.role} · {r.status}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Served Today</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-emerald-400">{today?.mealsServed ?? 0}</span>
                <span className="text-[10px] text-slate-400 font-bold">of {today?.studentsPresent ?? 0} present ({today ? coverage(today) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${today ? coverage(today) : 0}%` }} />
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Beneficiary Roll</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-blue-400">{stats.activeBens}</span>
                <span className="text-[10px] text-slate-400 font-bold">of {TOTAL_ON_ROLL} on roll active</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-semibold">
                {benCatCounts["Egg Alternative"]} on banana alternative · {benCatCounts["Special Diet"]} special diet
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Stock Health</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-2xl font-black ${stats.criticalItems > 0 ? "text-red-400" : stats.lowItems > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {stats.lowItems + stats.criticalItems}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">of {stock.length} items flagged</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-semibold">
                {stats.criticalItems} critical · {stats.lowItems} low stock · rest adequate
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Menu Compliance</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-amber-400">{stats.menuCompliance}%</span>
                <span className="text-[10px] text-slate-400 font-bold">this week</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-semibold">
                {stats.openIssues} quality issue{stats.openIssues !== 1 ? "s" : ""} open · {stats.pendingSync} record{stats.pendingSync !== 1 ? "s" : ""} awaiting EMIS sync
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Coverage trend + stock alerts */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
              <h2 className="text-base font-semibold text-white mb-1">📈 Serving Coverage — Last 7 School Days</h2>
              <p className="text-xs text-slate-500 mb-5">Meals served against students present, from the daily distribution register.</p>
              <div className="flex items-end gap-3 h-40 mb-2">
                {coverageTrend.map((r) => {
                  const pct = coverage(r);
                  return (
                    <div key={r.id} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-black text-slate-300">{pct}%</span>
                      <div
                        className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-500"
                        style={{ height: `${Math.max(pct - 40, 5)}%` }}
                        title={`${fmtDate(r.date)} — ${r.mealsServed}/${r.studentsPresent}`}
                      />
                      <span className="text-[9px] font-bold text-slate-500">
                        {new Date(r.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-sm font-semibold text-white mt-6 mb-3">⚠️ Stock Alerts</h3>
              {stockAlerts.length === 0 ? (
                <div className="text-xs text-slate-500 italic">All storeroom items are at adequate levels. 🎉</div>
              ) : (
                <div className="space-y-2">
                  {stockAlerts.map((s) => {
                    const lvl = stockLevel(s);
                    const d = stockDaysLeft(s);
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0">{STOCK_CAT_ICON[s.category]}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{s.item}</div>
                            <div className="text-[10px] text-slate-500 font-semibold">
                              {s.quantity} {s.unit} left · ~{d} day{d !== 1 ? "s" : ""} of usage · {s.reorderPlaced ? "Reorder placed" : "No reorder yet"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`badge ${STOCK_LEVEL_BADGE[lvl]}`}>{lvl}</span>
                          {!s.reorderPlaced && (
                            <button
                              onClick={() => placeReorder(s.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-colors"
                              style={{ color: "#fff" }}
                            >
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right column: category donut + activity */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 border border-slate-800">
                <h2 className="text-base font-semibold text-white mb-1">👥 Beneficiaries by Meal Type</h2>
                <p className="text-xs text-slate-500 mb-4">Active students on the noon meal roll, by dietary category.</p>
                <div className="flex items-center gap-5">
                  <DonutChart counts={benCatCounts} total={stats.activeBens} />
                  <div className="space-y-2 flex-1">
                    {(Object.keys(benCatCounts) as BenCategory[]).map((cat) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: BEN_CAT_META[cat].color }} />
                          {cat}
                        </span>
                        <span className="text-[11px] font-black text-slate-300">{benCatCounts[cat]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-slate-800">
                <h2 className="text-base font-semibold text-white mb-3">🕑 Recent Activity</h2>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {activity.map((a) => (
                    <div key={a.id} className="flex gap-2.5 items-start">
                      <span className="text-sm shrink-0 mt-0.5">{a.icon}</span>
                      <div>
                        <div className="text-[11px] text-slate-300 leading-relaxed font-medium">{a.text}</div>
                        <div className="text-[10px] text-slate-600 font-bold mt-0.5">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================== DAILY RECORDS ========================== */}
      {tab === "records" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">🍛 Daily Meal Register</h2>
              <p className="text-xs text-slate-500">Serving counts posted to the TN Mid-Day Meal portal, verified against EMIS attendance.</p>
            </div>
            <button
              onClick={() => setShowLogMeal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors w-fit"
              style={{ color: "#fff" }}
            >
              + Log Today’s Meal
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              placeholder="🔍 Search by date (2026-07-09) or menu…"
              value={recSearch}
              onChange={(e) => setRecSearch(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <select
              value={recStatusFilter}
              onChange={(e) => setRecStatusFilter(e.target.value as typeof recStatusFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option>Submitted</option>
              <option>Pending Sync</option>
              <option>Verified</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[820px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="py-2.5 pr-3 font-bold">Date</th>
                  <th className="py-2.5 pr-3 font-bold">Menu Served</th>
                  <th className="py-2.5 pr-3 font-bold">Present</th>
                  <th className="py-2.5 pr-3 font-bold">Served</th>
                  <th className="py-2.5 pr-3 font-bold">Coverage</th>
                  <th className="py-2.5 pr-3 font-bold">Eggs / Bananas</th>
                  <th className="py-2.5 pr-3 font-bold">Rice Used</th>
                  <th className="py-2.5 pr-3 font-bold">Status</th>
                  <th className="py-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => {
                  const pct = coverage(r);
                  return (
                    <tr key={r.id} className="border-b border-slate-850/60 hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pr-3">
                        <div className="text-xs font-bold text-white whitespace-nowrap">{fmtDate(r.date)}</div>
                        {r.remarks && <div className="text-[10px] text-amber-400/80 font-semibold max-w-44 truncate" title={r.remarks}>📝 {r.remarks}</div>}
                      </td>
                      <td className="py-3 pr-3 text-[11px] text-slate-300 font-semibold max-w-56">{r.menuItem}</td>
                      <td className="py-3 pr-3 text-xs text-slate-400 font-bold">{r.studentsPresent}</td>
                      <td className="py-3 pr-3 text-xs text-emerald-400 font-black">{r.mealsServed}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-850 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 98 ? "bg-emerald-500" : pct >= 90 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-300">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-[11px] text-slate-400 font-semibold whitespace-nowrap">🥚 {r.eggsServed} · 🍌 {r.bananasServed}</td>
                      <td className="py-3 pr-3 text-[11px] text-slate-400 font-semibold">{r.riceUsedKg} kg</td>
                      <td className="py-3 pr-3"><span className={`badge ${RECORD_BADGE[r.status]}`}>{r.status}</span></td>
                      <td className="py-3 text-right">
                        {r.status !== "Verified" ? (
                          <button
                            onClick={() => verifyRecord(r.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-colors"
                            style={{ color: "#fff" }}
                          >
                            Verify vs EMIS →
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold">✓ Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="py-10 text-center text-slate-500 italic text-sm">No meal records match the current filters.</div>
            )}
          </div>
        </div>
      )}

      {/* ========================== BENEFICIARIES ========================== */}
      {tab === "beneficiaries" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">👥 Beneficiary Register</h2>
              <p className="text-xs text-slate-500">Students enrolled on the noon meal roll with dietary category and availing history.</p>
            </div>
            <button
              onClick={() => setShowAddBen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors w-fit"
              style={{ color: "#fff" }}
            >
              + Enrol Beneficiary
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              placeholder="🔍 Search name, EMIS ID or class…"
              value={benSearch}
              onChange={(e) => setBenSearch(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <select
              value={benCatFilter}
              onChange={(e) => setBenCatFilter(e.target.value as typeof benCatFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Meal Types</option>
              <option>Regular Meal</option>
              <option>Egg Alternative</option>
              <option>Special Diet</option>
            </select>
            <select
              value={benStatusFilter}
              onChange={(e) => setBenStatusFilter(e.target.value as typeof benStatusFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Transferred</option>
            </select>
          </div>

          {/* Category summary chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {(Object.keys(benCatCounts) as BenCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setBenCatFilter(benCatFilter === cat ? "All" : cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  benCatFilter === cat
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
                }`}
              >
                {BEN_CAT_META[cat].icon} {cat}: {benCatCounts[cat]}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="py-2.5 pr-3 font-bold">Student</th>
                  <th className="py-2.5 pr-3 font-bold">EMIS ID</th>
                  <th className="py-2.5 pr-3 font-bold">Meal Type</th>
                  <th className="py-2.5 pr-3 font-bold">Meals (July)</th>
                  <th className="py-2.5 pr-3 font-bold">Last Availed</th>
                  <th className="py-2.5 pr-3 font-bold">Status</th>
                  <th className="py-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBens.map((b) => (
                  <tr key={b.id} className="border-b border-slate-850/60 hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 pr-3">
                      <div className="text-xs font-bold text-white">{b.name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">Class {b.classSection}</div>
                    </td>
                    <td className="py-3 pr-3 text-[11px] text-slate-400 font-mono">{b.emisId}</td>
                    <td className="py-3 pr-3">
                      <span className="text-[11px] font-semibold" style={{ color: BEN_CAT_META[b.category].color }}>
                        {BEN_CAT_META[b.category].icon} {b.category}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-slate-300 font-black">{b.mealsThisMonth}<span className="text-[10px] text-slate-500 font-bold"> / 8 days</span></td>
                    <td className="py-3 pr-3 text-[11px] text-slate-500 font-semibold">{fmtDate(b.lastAvailed)}</td>
                    <td className="py-3 pr-3"><span className={`badge ${BEN_STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                    <td className="py-3 text-right">
                      {b.status === "Transferred" ? (
                        <span className="text-[10px] text-slate-600 font-bold">TC Issued</span>
                      ) : (
                        <button
                          onClick={() => toggleBenStatus(b.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                            b.status === "Active"
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                          style={b.status === "Active" ? undefined : { color: "#fff" }}
                        >
                          {b.status === "Active" ? "Mark Inactive" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBens.length === 0 && (
              <div className="py-10 text-center text-slate-500 italic text-sm">No beneficiaries match the current filters.</div>
            )}
          </div>
        </div>
      )}

      {/* ============================ FOOD STOCK ============================ */}
      {tab === "stock" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">📦 Kitchen Store Inventory</h2>
              <p className="text-xs text-slate-500">Storeroom balances with burn-rate projections. Posting a daily meal log auto-deducts rice, eggs and bananas.</p>
            </div>
            <div className="flex gap-2">
              <span className="badge badge-green">{stock.filter((s) => stockLevel(s) === "Adequate").length} Adequate</span>
              <span className="badge badge-yellow">{stats.lowItems} Low</span>
              <span className="badge badge-red">{stats.criticalItems} Critical</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              placeholder="🔍 Search item or supplier…"
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <select
              value={stockCatFilter}
              onChange={(e) => setStockCatFilter(e.target.value as typeof stockCatFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option>Grains</option>
              <option>Pulses</option>
              <option>Oil & Condiments</option>
              <option>Perishables</option>
              <option>Fuel</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="py-2.5 pr-3 font-bold">Item</th>
                  <th className="py-2.5 pr-3 font-bold">On Hand</th>
                  <th className="py-2.5 pr-3 font-bold">Daily Usage</th>
                  <th className="py-2.5 pr-3 font-bold">Days Left</th>
                  <th className="py-2.5 pr-3 font-bold">Reorder At</th>
                  <th className="py-2.5 pr-3 font-bold">Last Refill</th>
                  <th className="py-2.5 pr-3 font-bold">Status</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((s) => {
                  const lvl = stockLevel(s);
                  const d = stockDaysLeft(s);
                  return (
                    <tr key={s.id} className="border-b border-slate-850/60 hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pr-3">
                        <div className="text-xs font-bold text-white">{STOCK_CAT_ICON[s.category]} {s.item}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{s.category} · {s.supplier}</div>
                      </td>
                      <td className="py-3 pr-3 text-xs font-black" style={{ color: lvl === "Adequate" ? "#34d399" : lvl === "Low Stock" ? "#fbbf24" : "#f87171" }}>
                        {s.quantity} <span className="text-[10px] text-slate-500 font-bold">{s.unit}</span>
                      </td>
                      <td className="py-3 pr-3 text-[11px] text-slate-400 font-semibold">{s.dailyUsage} {s.unit}/day</td>
                      <td className="py-3 pr-3">
                        <span className={`text-xs font-black ${d <= 2 ? "text-red-400" : d <= 5 ? "text-amber-400" : "text-slate-300"}`}>
                          ~{d} day{d !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-[11px] text-slate-500 font-semibold">{s.reorderLevel} {s.unit}</td>
                      <td className="py-3 pr-3 text-[11px] text-slate-500 font-semibold whitespace-nowrap">{fmtDate(s.lastRefilled)}</td>
                      <td className="py-3 pr-3">
                        <span className={`badge ${STOCK_LEVEL_BADGE[lvl]}`}>{lvl}</span>
                        {s.reorderPlaced && <div className="text-[9px] text-blue-400 font-bold mt-1">🛒 Reorder placed</div>}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setRefillItem(s)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-colors mr-2"
                          style={{ color: "#fff" }}
                        >
                          Log Refill
                        </button>
                        {!s.reorderPlaced && lvl !== "Adequate" && (
                          <button
                            onClick={() => placeReorder(s.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            Reorder
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStock.length === 0 && (
              <div className="py-10 text-center text-slate-500 italic text-sm">No stock items match the current filters.</div>
            )}
          </div>
        </div>
      )}

      {/* ========================= MENU MONITORING ========================= */}
      {tab === "menu" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">📅 Government Sanctioned Weekly Menu</h2>
              <p className="text-xs text-slate-500">Mandated nutrition schedule with egg/banana provision. Mark each day as served-as-sanctioned or record a deviation.</p>
            </div>
            <span className={`badge ${stats.menuCompliance >= 80 ? "badge-green" : "badge-yellow"}`}>
              Weekly compliance: {stats.menuCompliance}%
            </span>
          </div>

          <div className="space-y-3">
            {menu.map((m) => {
              const isToday = m.day === "Friday";
              return (
                <div
                  key={m.day}
                  className={`p-4 rounded-xl border ${isToday ? "bg-emerald-500/5 border-emerald-500/30" : "bg-slate-900/60 border-slate-850"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{m.day}</h3>
                        {isToday && <span className="badge badge-blue">Today</span>}
                        <span className={`badge ${COMPLIANCE_BADGE[m.compliance]}`}>{m.compliance}</span>
                        {m.eggDay && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                            🥚 Egg / 🍌 Banana Day
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-semibold">{m.menuItem}</div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Accompaniment: {m.accompaniment} · ⚡ {m.calories} kcal · 🥩 {m.proteinGm} g protein
                      </div>
                      {m.compliance === "Deviation" && m.deviationNote && (
                        <div className="text-[10px] text-red-400/90 font-semibold mt-1.5">⚠ {m.deviationNote}</div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => markCompliance(m.day, "Compliant")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                          m.compliance === "Compliant" ? "bg-emerald-600" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                        style={m.compliance === "Compliant" ? { color: "#fff" } : undefined}
                      >
                        ✓ As Sanctioned
                      </button>
                      <button
                        onClick={() => setDeviationDay(m)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                          m.compliance === "Deviation" ? "bg-red-600" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                        style={m.compliance === "Deviation" ? { color: "#fff" } : undefined}
                      >
                        ⚠ Deviation
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-4 bg-slate-900/60 rounded-xl border border-slate-850">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Nutrition Norms — Upper Primary (per child / day)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Calories" value="≥ 700 kcal (with breakfast)" />
              <MiniStat label="Protein" value="≥ 20 g" />
              <MiniStat label="Rice Scale" value="150 g / child" />
              <MiniStat label="Egg Provision" value="5 days / week" />
            </div>
          </div>
        </div>
      )}

      {/* ========================= QUALITY REPORTS ========================= */}
      {tab === "quality" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Taste Rating</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-amber-400">
                  {(quality.reduce((a, q) => a + q.tasteRating, 0) / Math.max(quality.length, 1)).toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">/ 5 across {quality.length} inspections</span>
              </div>
            </div>
            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Hygiene Rating</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-blue-400">
                  {(quality.reduce((a, q) => a + q.hygieneRating, 0) / Math.max(quality.length, 1)).toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">/ 5 kitchen & serving area</span>
              </div>
            </div>
            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Open Issues</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-2xl font-black ${stats.openIssues > 0 ? "text-red-400" : "text-emerald-400"}`}>{stats.openIssues}</span>
                <span className="text-[10px] text-slate-400 font-bold">needing attention / escalated</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-base font-semibold text-white">🧪 Inspection & Taste Register</h2>
                <p className="text-xs text-slate-500">Daily taste-testing and periodic inspections by HM, teachers on duty, VEC members and block officials.</p>
              </div>
              <button
                onClick={() => setShowAddReport(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors w-fit"
                style={{ color: "#fff" }}
              >
                + File Quality Report
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                type="text"
                placeholder="🔍 Search inspector, role or issue…"
                value={qualSearch}
                onChange={(e) => setQualSearch(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <select
                value={qualStatusFilter}
                onChange={(e) => setQualStatusFilter(e.target.value as typeof qualStatusFilter)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Statuses</option>
                <option>Satisfactory</option>
                <option>Needs Attention</option>
                <option>Escalated</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredQuality.map((r) => (
                <div key={r.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-850">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`badge ${QUALITY_BADGE[r.status]}`}>{r.status}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{fmtDate(r.date)} · {r.role}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{r.inspector}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 mt-2">
                        <span className="text-[11px] text-slate-400 font-semibold">Taste: <span className="text-amber-400 tracking-wider">{stars(r.tasteRating)}</span></span>
                        <span className="text-[11px] text-slate-400 font-semibold">Quantity: <span className="text-amber-400 tracking-wider">{stars(r.quantityRating)}</span></span>
                        <span className="text-[11px] text-slate-400 font-semibold">Hygiene: <span className="text-amber-400 tracking-wider">{stars(r.hygieneRating)}</span></span>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed mt-2"><strong className="text-slate-300">Observations:</strong> {r.issues}</div>
                      {r.actionTaken !== "—" && (
                        <div className="text-[11px] text-slate-500 leading-relaxed mt-1"><strong className="text-slate-400">Action taken:</strong> {r.actionTaken}</div>
                      )}
                    </div>
                    {r.status !== "Satisfactory" && (
                      <button
                        onClick={() => resolveReport(r.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-colors shrink-0"
                        style={{ color: "#fff" }}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredQuality.length === 0 && (
                <div className="py-10 text-center text-slate-500 italic text-sm">No quality reports match the current filters.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ------------------------------ Modals ------------------------------ */}
      {showLogMeal && (
        <LogMealModal
          menu={menu}
          onClose={() => setShowLogMeal(false)}
          onSave={saveMealLog}
        />
      )}

      {showAddBen && (
        <AddBeneficiaryModal onClose={() => setShowAddBen(false)} onSave={addBeneficiary} />
      )}

      {refillItem && (
        <RefillModal item={refillItem} onClose={() => setRefillItem(null)} onSave={refillStock} />
      )}

      {deviationDay && (
        <DeviationModal
          day={deviationDay}
          onClose={() => setDeviationDay(null)}
          onSave={(note) => markCompliance(deviationDay.day, "Deviation", note)}
        />
      )}

      {showAddReport && (
        <AddReportModal onClose={() => setShowAddReport(false)} onSave={addQualityReport} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl border text-xs leading-relaxed shadow-2xl animate-[fadeIn_.2s_ease] ${
          toast.tone === "ok"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 backdrop-blur-md"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300 backdrop-blur-md"
        }`}>
          {toast.text}
        </div>
      )}
    </PortalLayout>
  );
}

/* --------------------------- Sub-components --------------------------- */

function DonutChart({ counts, total }: { counts: Record<BenCategory, number>; total: number }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segments = (Object.keys(counts) as BenCategory[])
    .filter((cat) => counts[cat] > 0)
    .map((cat) => {
      const frac = total > 0 ? counts[cat] / total : 0;
      const seg = { cat, dash: frac * C, offset };
      offset += frac * C;
      return seg;
    });
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0 -rotate-90">
      <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="12" />
      {segments.map((s) => (
        <circle
          key={s.cat}
          cx="48" cy="48" r={R} fill="none"
          stroke={BEN_CAT_META[s.cat].color} strokeWidth="12"
          strokeDasharray={`${s.dash} ${C - s.dash}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="butt"
          style={{ transition: "stroke-dasharray .4s ease" }}
        />
      ))}
      <text x="48" y="48" textAnchor="middle" dominantBaseline="central" transform="rotate(90 48 48)" fill="currentColor" className="text-slate-300" fontSize="16" fontWeight="900">
        {total}
      </text>
    </svg>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</div>
      <div className="text-xs font-black text-slate-200 mt-0.5">{value}</div>
    </div>
  );
}

/* ------------------------------- Modals ------------------------------- */

function ModalShell({ title, subtitle, onClose, children }: {
  title: string; subtitle: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-strong w-full max-w-lg rounded-2xl border border-slate-700 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none transition-colors" aria-label="Close">✕</button>
        </div>
        <p className="text-xs text-slate-500 mb-5">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

const inputCls = "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors";
const labelCls = "block text-xs text-slate-400 mb-1.5 font-semibold";

function LogMealModal({ menu, onClose, onSave }: {
  menu: MenuDay[]; onClose: () => void; onSave: (r: DailyRecord) => void;
}) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const weekday = new Date().toLocaleDateString("en-IN", { weekday: "long" });
  const todaysMenu = menu.find((m) => m.day === weekday)?.menuItem ?? menu[0]?.menuItem ?? "";

  const [date, setDate] = useState(todayIso);
  const [menuItem, setMenuItem] = useState(todaysMenu);
  const [present, setPresent] = useState("238");
  const [served, setServed] = useState("232");
  const [eggs, setEggs] = useState("219");
  const [bananas, setBananas] = useState("13");
  const [rice, setRice] = useState("29");
  const [remarks, setRemarks] = useState("");

  return (
    <ModalShell
      title="🍛 Log Daily Meal Distribution"
      subtitle="Posts the serving count to the TN Mid-Day Meal portal and auto-deducts rice, eggs and bananas from stock."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            id: Date.now(),
            date,
            menuItem: menuItem.trim(),
            studentsPresent: Number(present) || 0,
            mealsServed: Number(served) || 0,
            eggsServed: Number(eggs) || 0,
            bananasServed: Number(bananas) || 0,
            riceUsedKg: Number(rice) || 0,
            status: "Submitted",
            remarks: remarks.trim(),
          });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Date *</label>
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Rice Used (kg) *</label>
            <input className={inputCls} type="number" min={0} value={rice} onChange={(e) => setRice(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className={labelCls}>Menu Served *</label>
          <input className={inputCls} value={menuItem} onChange={(e) => setMenuItem(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Students Present *</label>
            <input className={inputCls} type="number" min={0} value={present} onChange={(e) => setPresent(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Meals Served *</label>
            <input className={inputCls} type="number" min={0} value={served} onChange={(e) => setServed(e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Eggs Distributed</label>
            <input className={inputCls} type="number" min={0} value={eggs} onChange={(e) => setEggs(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Bananas Distributed</label>
            <input className={inputCls} type="number" min={0} value={bananas} onChange={(e) => setBananas(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Remarks</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Egg shortfall covered with bananas…" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Post Serving Log</button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddBeneficiaryModal({ onClose, onSave }: { onClose: () => void; onSave: (b: Beneficiary) => void }) {
  const [name, setName] = useState("");
  const [classSection, setClassSection] = useState("");
  const [emisId, setEmisId] = useState("");
  const [category, setCategory] = useState<BenCategory>("Regular Meal");

  return (
    <ModalShell
      title="👤 Enrol Meal Beneficiary"
      subtitle="Adds the student to the noon meal roll. EMIS ID is validated against the state student registry."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            id: Date.now(),
            name: name.trim(),
            classSection: classSection.trim(),
            emisId: emisId.trim(),
            category,
            mealsThisMonth: 0,
            status: "Active",
            lastAvailed: new Date().toISOString().slice(0, 10),
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelCls}>Student Name *</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kavya S." required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Class & Section *</label>
            <input className={inputCls} value={classSection} onChange={(e) => setClassSection(e.target.value)} placeholder="e.g. 8B" required />
          </div>
          <div>
            <label className={labelCls}>EMIS ID *</label>
            <input className={inputCls} value={emisId} onChange={(e) => setEmisId(e.target.value)} placeholder="12-digit EMIS number" required />
          </div>
        </div>
        <div>
          <label className={labelCls}>Meal Category *</label>
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as BenCategory)}>
            <option>Regular Meal</option>
            <option>Egg Alternative</option>
            <option>Special Diet</option>
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Enrol Student</button>
        </div>
      </form>
    </ModalShell>
  );
}

function RefillModal({ item, onClose, onSave }: {
  item: StockItem; onClose: () => void; onSave: (id: number, qty: number) => void;
}) {
  const [qty, setQty] = useState("");
  return (
    <ModalShell
      title={`📦 Log Refill — ${item.item}`}
      subtitle={`Current balance: ${item.quantity} ${item.unit}. Supplier: ${item.supplier}.`}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(item.id, Number(qty) || 0);
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelCls}>Quantity Received ({item.unit}) *</label>
          <input className={inputCls} type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder={`e.g. ${item.reorderLevel * 2}`} required autoFocus />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Update Stock</button>
        </div>
      </form>
    </ModalShell>
  );
}

function DeviationModal({ day, onClose, onSave }: {
  day: MenuDay; onClose: () => void; onSave: (note: string) => void;
}) {
  const [note, setNote] = useState(day.deviationNote);
  return (
    <ModalShell
      title={`⚠ Record Menu Deviation — ${day.day}`}
      subtitle={`Sanctioned: ${day.menuItem}. Deviations are visible to the block MDM officer.`}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(note.trim() || "Deviation recorded without note.");
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelCls}>Reason / What was served instead *</label>
          <textarea className={`${inputCls} resize-none`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Vegetable supply delayed — plain sambar rice served without accompaniment." required autoFocus />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Record Deviation</button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddReportModal({ onClose, onSave }: { onClose: () => void; onSave: (r: QualityReport) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [inspector, setInspector] = useState("");
  const [role, setRole] = useState("Teacher on Duty");
  const [taste, setTaste] = useState("4");
  const [quantity, setQuantity] = useState("4");
  const [hygiene, setHygiene] = useState("4");
  const [issues, setIssues] = useState("");
  const [status, setStatus] = useState<QualityStatus>("Satisfactory");

  return (
    <ModalShell
      title="🧪 File Quality Inspection Report"
      subtitle="Taste-testing and hygiene checks are mandatory before every serving under MDM norms."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            id: Date.now(),
            date,
            inspector: inspector.trim(),
            role,
            tasteRating: Number(taste),
            quantityRating: Number(quantity),
            hygieneRating: Number(hygiene),
            issues: issues.trim() || "None.",
            actionTaken: "—",
            status,
          });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Inspection Date *</label>
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Inspector Role *</label>
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Headmaster</option>
              <option>Teacher on Duty</option>
              <option>VEC Member</option>
              <option>Block MDM Officer</option>
              <option>Parent Volunteer</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Inspector Name *</label>
          <input className={inputCls} value={inspector} onChange={(e) => setInspector(e.target.value)} placeholder="e.g. Mrs. Kalaiselvi P." required />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Taste", val: taste, set: setTaste },
            { label: "Quantity", val: quantity, set: setQuantity },
            { label: "Hygiene", val: hygiene, set: setHygiene },
          ].map((f) => (
            <div key={f.label}>
              <label className={labelCls}>{f.label} (1–5) *</label>
              <select className={inputCls} value={f.val} onChange={(e) => f.set(e.target.value)}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} — {stars(n)}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div>
          <label className={labelCls}>Observations / Issues</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={issues} onChange={(e) => setIssues(e.target.value)} placeholder="e.g. Sample tasted 30 min before serving; no issues found." />
        </div>
        <div>
          <label className={labelCls}>Outcome *</label>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as QualityStatus)}>
            <option>Satisfactory</option>
            <option>Needs Attention</option>
            <option>Escalated</option>
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>File Report</button>
        </div>
      </form>
    </ModalShell>
  );
}
