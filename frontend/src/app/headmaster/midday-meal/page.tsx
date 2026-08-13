"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { apiFetch, API_URL } from "@/lib/api";

/* ------------------------------- Types ------------------------------- */

type TabKey = "overview" | "records" | "beneficiaries" | "stock" | "menu" | "quality";

type RecordStatus = "Submitted" | "Pending Sync" | "Verified";
type BenCategory = "Regular Meal" | "Egg Alternative" | "Special Diet";
type BenStatus = "Active" | "Inactive" | "Transferred";
type StockCategory = "Grains" | "Pulses" | "Oil & Condiments" | "Perishables" | "Fuel";
type MenuCompliance = "Pending" | "Compliant" | "Deviation";
type QualityStatus = "Satisfactory" | "Needs Attention" | "Escalated";

interface DailyRecord {
  id: string;
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
  id: string;
  name: string;
  classSection: string;
  emisId: string;
  category: BenCategory;
  mealsThisMonth: number;
  status: BenStatus;
  lastAvailed: string;   // ISO date
}

interface StockItem {
  id: string;
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
  id: string;
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
  id: string | number;
  time: string;
  icon: string;
  text: string;
}

/* ─── TN Government Nutritious Meal Scheme Specifications & Official Menu Cycles ─── */

const TN_SCHEME_NORMS = {
  eggWeight: "46 – 52 g per child on school working days",
  bananaWeight: "100 g (Alternative for children who do not consume eggs)",
  ricePrimary: "100 g per child (Classes 1 – 5)",
  riceUpperPrimary: "150 g per child (Classes 6 – 10)",
  legumesSchedule: "Black Bengal Gram (Tue - W1/W3), Green Gram Sundal (Thu - W2/W4)",
};

const TN_GOVT_MENU_CYCLE = {
  w1_w3: [
    { day: "Monday", menuItem: "Rice + Vegetable Sambar + Pepper Egg", accompaniment: "Pepper Egg (46–52g)", eggDay: true, calories: 620, proteinGm: 18 },
    { day: "Tuesday", menuItem: "Rice + Black Chickpea Curry + Tomato Masala Egg", accompaniment: "Black Bengal Gram Sundal & Tomato Egg", eggDay: true, calories: 635, proteinGm: 19 },
    { day: "Wednesday", menuItem: "Tomato Rice + Pepper Egg", accompaniment: "Boiled Pepper Egg", eggDay: true, calories: 590, proteinGm: 16 },
    { day: "Thursday", menuItem: "Rice + Vegetable Sambar + Boiled Egg", accompaniment: "Boiled Egg", eggDay: true, calories: 610, proteinGm: 17 },
    { day: "Friday", menuItem: "Rice + Dal with Spinach/Keerai Kootu + Masala Egg + Fried Potato with chilli powder", accompaniment: "Keerai Kootu & Spicy Potato Fry", eggDay: true, calories: 640, proteinGm: 20 },
  ],
  w2_w4: [
    { day: "Monday", menuItem: "Sambar Rice + Onion-Tomato Masala Egg", accompaniment: "Onion-Tomato Masala Egg", eggDay: true, calories: 625, proteinGm: 18 },
    { day: "Tuesday", menuItem: "Rice + Vegetable Sambar + Pepper Egg", accompaniment: "Pepper Egg", eggDay: true, calories: 610, proteinGm: 17 },
    { day: "Wednesday", menuItem: "Tamarind Rice + Tomato Masala Egg", accompaniment: "Tomato Masala Egg", eggDay: true, calories: 600, proteinGm: 16 },
    { day: "Thursday", menuItem: "Lemon Rice + Green Gram Sundal + Tomato Egg", accompaniment: "Green Gram Sundal & Tomato Egg", eggDay: true, calories: 630, proteinGm: 19 },
    { day: "Friday", menuItem: "Rice + Vegetable Sambar + Boiled Egg + Fried Potato", accompaniment: "Fried Potato & Boiled Egg", eggDay: true, calories: 635, proteinGm: 18 },
  ],
};

const TN_GOVT_MEAL_OPTIONS = [
  "Rice + Vegetable Sambar + Pepper Egg",
  "Rice + Black Chickpea Curry + Tomato Masala Egg",
  "Tomato Rice + Pepper Egg",
  "Rice + Vegetable Sambar + Boiled Egg",
  "Rice + Dal with Spinach/Keerai Kootu + Masala Egg + Fried Potato with chilli powder",
  "Sambar Rice + Onion-Tomato Masala Egg",
  "Tamarind Rice + Tomato Masala Egg",
  "Lemon Rice + Green Gram Sundal + Tomato Egg",
  "Rice + Vegetable Sambar + Boiled Egg + Fried Potato",
  "Custom / Special Diet Menu",
];

/* ─── No static seed data — all data is fetched live from the backend ─── */

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

function fmtDate(iso?: string | null): string {
  if (!iso || typeof iso !== "string" || !iso.trim() || iso === "Invalid Date") {
    return "Not yet availed";
  }
  const cleanIso = iso.trim();
  const d = new Date(cleanIso.includes("T") ? cleanIso : cleanIso + "T00:00:00");
  if (isNaN(d.getTime())) return "Not yet availed";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId as string | undefined;

  // ── Data state — starts empty, filled by API ──
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [menu, setMenu] = useState<MenuDay[]>([]);
  const [quality, setQuality] = useState<QualityReport[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
  const [editStockItem, setEditStockItem] = useState<StockItem | null>(null);
  const [showAddStock, setShowAddStock] = useState(false);

  // Menu tab state
  const [deviationDay, setDeviationDay] = useState<MenuDay | null>(null);
  const [menuCycleTab, setMenuCycleTab] = useState<"w1_w3" | "w2_w4">("w1_w3");

  // Quality tab state
  const [qualSearch, setQualSearch] = useState("");
  const [qualStatusFilter, setQualStatusFilter] = useState<"All" | QualityStatus>("All");
  const [showAddReport, setShowAddReport] = useState(false);

  // Delete confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  /* ── Fetch all MDM data for this school from the backend ── */
  const fetchAll = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const qs = `?schoolId=${encodeURIComponent(schoolId)}`;
      const [rRes, bRes, sRes, mRes, qRes] = await Promise.all([
        apiFetch(`/api/headmaster/mdm/records${qs}`),
        apiFetch(`/api/headmaster/mdm/beneficiaries${qs}`),
        apiFetch(`/api/headmaster/mdm/stock${qs}`),
        apiFetch(`/api/headmaster/mdm/menu${qs}`),
        apiFetch(`/api/headmaster/mdm/quality${qs}`),
      ]);
      const [rJson, bJson, sJson, mJson, qJson] = await Promise.all([
        rRes.json(), bRes.json(), sRes.json(), mRes.json(), qRes.json(),
      ]);
      if (rJson.success) setRecords(rJson.data ?? []);
      if (bJson.success) setBeneficiaries(bJson.data ?? []);
      if (sJson.success) setStock(sJson.data ?? []);
      if (mJson.success) setMenu(mJson.data ?? []);
      if (qJson.success) setQuality(qJson.data ?? []);
    } catch (err) {
      console.error("MDM fetch error:", err);
      setFetchError("Could not load meal data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showToast = (text: string, tone: "ok" | "warn" = "ok") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 6000);
  };

  const logActivity = (icon: string, text: string) => {
    setActivity((prev) => [{ id: Date.now(), time: "Just now", icon, text }, ...prev].slice(0, 12));
  };

  /* --------------------------- Derived stats -------------------------- */

  const today = records[0];

  const currentMonthName = useMemo(
    () => new Date().toLocaleString(lang === "தமிழ்" ? "ta-IN" : "en-IN", { month: "long" }),
    [lang]
  );

  const currentDayName = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long" }),
    []
  );

  const formattedTodayDate = useMemo(
    () => new Date().toLocaleDateString(lang === "தமிழ்" ? "ta-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [lang]
  );

  const todayMenuDay = useMemo((): MenuDay => {
    const found = menu.find((m) => m.day === currentDayName);
    if (found) return found;
    const staticDay = TN_GOVT_MENU_CYCLE.w1_w3.find((m) => m.day === currentDayName) || TN_GOVT_MENU_CYCLE.w1_w3[0];
    return {
      day: staticDay.day,
      menuItem: staticDay.menuItem,
      accompaniment: staticDay.accompaniment,
      eggDay: staticDay.eggDay,
      calories: staticDay.calories,
      proteinGm: staticDay.proteinGm,
      compliance: "Compliant" as MenuCompliance,
      deviationNote: "",
    };
  }, [menu, currentDayName]);

  const todayCoveragePct = today ? coverage(today) : 0;

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

  const verifyRecord = async (id: string) => {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;
    try {
      const res = await apiFetch(`/api/headmaster/mdm/records/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Verified" }),
      });
      const json = await res.json();
      if (json.success) {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Verified" } : r)));
        logActivity("✅", `${fmtDate(rec.date)} meal record verified against EMIS attendance.`);
        showToast(`✓ ${fmtDate(rec.date)} record marked Verified.`);
      }
    } catch { showToast("Failed to verify record.", "warn"); }
  };

  const saveMealLog = async (rec: Omit<DailyRecord, "id" | "status">) => {
    if (!schoolId) return;
    try {
      const res = await apiFetch("/api/headmaster/mdm/records", {
        method: "POST",
        body: JSON.stringify({ ...rec, schoolId }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchAll(); // refresh all data so stock deductions are reflected
        setShowLogMeal(false);
        logActivity("🍛", `Daily meal log posted — ${rec.mealsServed} of ${rec.studentsPresent} present students served.`);
        showToast(`✓ Meal record for ${fmtDate(rec.date)} posted to the TN MDM portal.`);
      }
    } catch { showToast("Failed to save meal log.", "warn"); }
  };

  const addBeneficiary = async (b: Omit<Beneficiary, "id" | "mealsThisMonth" | "lastAvailed">) => {
    if (!schoolId) return;
    try {
      const res = await apiFetch("/api/headmaster/mdm/beneficiaries", {
        method: "POST",
        body: JSON.stringify({ ...b, schoolId }),
      });
      const json = await res.json();
      if (json.success) {
        setBeneficiaries((prev) => [json.data, ...prev]);
        setShowAddBen(false);
        logActivity("👤", `${b.name} (Class ${b.classSection}) enrolled as MDM beneficiary — ${b.category}.`);
        showToast(`✓ ${b.name} enrolled under the noon meal roll.`);
      }
    } catch { showToast("Failed to add beneficiary.", "warn"); }
  };

  const toggleBenStatus = async (id: string) => {
    const ben = beneficiaries.find((b) => b.id === id);
    if (!ben || ben.status === "Transferred") return;
    const next: BenStatus = ben.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await apiFetch(`/api/headmaster/mdm/beneficiaries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (json.success) {
        setBeneficiaries((prev) => prev.map((b) => (b.id === id ? { ...b, status: next } : b)));
        logActivity(next === "Active" ? "✅" : "⏸️", `${ben.name} marked ${next} on the meal roll.`);
        showToast(`${ben.name} is now ${next}.`, next === "Active" ? "ok" : "warn");
      }
    } catch { showToast("Failed to update beneficiary.", "warn"); }
  };

  const refillStock = async (id: string, newQty: number, addedQty?: number) => {
    const item = stock.find((s) => s.id === id);
    if (!item) return;
    const lastRefilled = new Date().toISOString().slice(0, 10);
    try {
      const res = await apiFetch(`/api/headmaster/mdm/stock/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: Number(newQty), lastRefilled, reorderPlaced: false }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStock((prev) => prev.map((s) => (s.id === id ? { ...s, ...json.data } : s)));
        setRefillItem(null);
        const diffMsg = addedQty ? `+${addedQty} ${item.unit}` : `set to ${newQty} ${item.unit}`;
        logActivity("📦", `${item.item} stock updated (${diffMsg}).`);
        showToast(`✓ ${item.item} stock updated: ${newQty} ${item.unit} on hand.`);
      } else {
        showToast("Failed to update stock.", "warn");
      }
    } catch (err) {
      console.error("Refill error:", err);
      showToast("Failed to update stock.", "warn");
    }
  };

  const placeReorder = async (id: string) => {
    const item = stock.find((s) => s.id === id);
    if (!item) return;
    try {
      const res = await apiFetch(`/api/headmaster/mdm/stock/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ reorderPlaced: true }),
      });
      const json = await res.json();
      if (json.success) {
        setStock((prev) => prev.map((s) => (s.id === id ? { ...s, reorderPlaced: true } : s)));
        logActivity("🛒", `Reorder indent raised for ${item.item} with ${item.supplier}.`);
        showToast(`✓ Reorder placed for ${item.item}.`);
      }
    } catch { showToast("Failed to place reorder.", "warn"); }
  };

  const addStockItem = async (item: Omit<StockItem, "id" | "lastRefilled" | "reorderPlaced">) => {
    if (!schoolId) return;
    try {
      const res = await apiFetch("/api/headmaster/mdm/stock", {
        method: "POST",
        body: JSON.stringify({ ...item, schoolId }),
      });
      const json = await res.json();
      if (json.success) {
        setStock((prev) => [...prev, json.data]);
        setShowAddStock(false);
        logActivity("📦", `${item.item} (${item.quantity} ${item.unit}) added to kitchen stock.`);
        showToast(`✓ ${item.item} added to kitchen stock register.`);
      }
    } catch { showToast("Failed to add stock item.", "warn"); }
  };

  const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
    try {
      const res = await apiFetch(`/api/headmaster/mdm/stock/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        setStock((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
        setEditStockItem(null);
        showToast("✓ Stock item details & daily usage updated.");
        logActivity("📦", `${json.data.item} daily usage updated to ${updates.dailyUsage} ${json.data.unit}/day.`);
      }
    } catch { showToast("Failed to update stock item.", "warn"); }
  };

  const seedDefaultGovtStock = async () => {
    if (!schoolId) return;
    const defaults = [
      { item: "Fine Rice", category: "Grains", quantity: 340, unit: "kg", dailyUsage: 30, reorderLevel: 120, supplier: "TN Civil Supplies Corp." },
      { item: "Toor Dal", category: "Pulses", quantity: 85, unit: "kg", dailyUsage: 6, reorderLevel: 40, supplier: "TN Civil Supplies Corp." },
      { item: "Double Fortified Salt", category: "Oil & Condiments", quantity: 15, unit: "kg", dailyUsage: 1.5, reorderLevel: 12, supplier: "Block Godown" },
      { item: "Fortified Palm Oil", category: "Oil & Condiments", quantity: 45, unit: "litres", dailyUsage: 3, reorderLevel: 20, supplier: "TN Civil Supplies Corp." },
      { item: "Fresh Eggs", category: "Perishables", quantity: 180, unit: "pieces", dailyUsage: 225, reorderLevel: 450, supplier: "District Egg Federation" },
      { item: "Bananas", category: "Perishables", quantity: 60, unit: "pieces", dailyUsage: 14, reorderLevel: 30, supplier: "Local Farmer Co-op" },
      { item: "Bengal Gram", category: "Pulses", quantity: 110, unit: "kg", dailyUsage: 4, reorderLevel: 35, supplier: "TN Civil Supplies Corp." },
      { item: "LPG Cylinders", category: "Fuel", quantity: 3, unit: "units", dailyUsage: 0.2, reorderLevel: 2, supplier: "Indane Distributor" },
    ];
    try {
      const created = await Promise.all(
        defaults.map((d) => apiFetch("/api/headmaster/mdm/stock", { method: "POST", body: JSON.stringify({ ...d, schoolId }) }).then((r) => r.json()))
      );
      const items = created.map((c) => c.data).filter(Boolean);
      setStock(items);
      showToast("✓ Official TN Govt MDM stock items initialized!");
      logActivity("📦", "Official TN Govt kitchen stock items initialized.");
    } catch { showToast("Failed to initialize stock list.", "warn"); }
  };

  const markCompliance = async (day: string, status: MenuCompliance, note = "") => {
    // Optimistic UI update: update local state immediately for instant feedback
    setMenu((prev) => {
      const exists = prev.some((m) => m.day === day);
      if (exists) {
        return prev.map((m) => (m.day === day ? { ...m, compliance: status, deviationNote: note } : m));
      } else {
        return [...prev, { day, menuItem: "", accompaniment: "", eggDay: true, calories: 600, proteinGm: 18, compliance: status, deviationNote: note }];
      }
    });
    setDeviationDay(null);
    logActivity(status === "Compliant" ? "✅" : "⚠️", `${day} menu marked ${status}${note ? ` — ${note}` : "."}`);
    showToast(status === "Compliant" ? `✓ ${day} menu marked served as sanctioned.` : `⚠ Deviation recorded for ${day}.`, status === "Compliant" ? "ok" : "warn");

    // Sync with backend API
    if (!schoolId) return;
    try {
      await apiFetch(`/api/headmaster/mdm/menu/${encodeURIComponent(day)}`, {
        method: "PUT",
        body: JSON.stringify({ schoolId, compliance: status, deviationNote: note }),
      });
    } catch (err) {
      console.error("Background menu compliance sync error:", err);
    }
  };

  const addQualityReport = async (r: Omit<QualityReport, "id">) => {
    const targetSchoolId = schoolId || "school-50001";
    try {
      const res = await apiFetch("/api/headmaster/mdm/quality", {
        method: "POST",
        body: JSON.stringify({ ...r, schoolId: targetSchoolId }),
      });
      const json = await res.json();
      if (json.success) {
        setQuality((prev) => [json.data, ...prev]);
        setShowAddReport(false);
        logActivity("📋", `${r.role} inspection logged by ${r.inspector} — ${r.status}.`);
        showToast(`✓ Quality report filed. Status: ${r.status}.`, r.status === "Satisfactory" ? "ok" : "warn");
      }
    } catch { showToast("Failed to file quality report.", "warn"); }
  };

  const resolveReport = async (id: string) => {
    const rep = quality.find((q) => q.id === id);
    if (!rep) return;
    try {
      const res = await apiFetch(`/api/headmaster/mdm/quality/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Satisfactory", actionTaken: rep.actionTaken === "—" ? "Issue resolved and closed by HM." : rep.actionTaken }),
      });
      // Note: no dedicated PATCH for quality yet — update locally and the next fetch will sync
      setQuality((prev) => prev.map((q) => (q.id === id ? { ...q, status: "Satisfactory", actionTaken: rep.actionTaken === "—" ? "Issue resolved and closed by HM." : rep.actionTaken } : q)));
      logActivity("✅", `Quality issue of ${fmtDate(rep.date)} closed by HM.`);
      showToast(`✓ ${fmtDate(rep.date)} report closed as resolved.`);
    } catch { showToast("Failed to resolve report.", "warn"); }
  };

  const deleteBeneficiary = (id: string) => {
    const ben = beneficiaries.find((b) => b.id === id);
    if (!ben) return;
    setConfirmDelete({
      title: "🗑️ Remove Beneficiary",
      message: `Are you sure you want to remove ${ben.name} (Class ${ben.classSection}) from the meal roll?`,
      onConfirm: async () => {
        setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
        showToast(`✓ ${ben.name} removed from beneficiary list.`);
        logActivity("🗑️", `${ben.name} removed from the meal roll.`);
        try {
          await apiFetch(`/api/headmaster/mdm/beneficiaries/${id}`, { method: "DELETE" });
        } catch (err) {
          console.error("Delete beneficiary error:", err);
        }
      },
    });
  };

  const deleteDailyRecord = (id: string) => {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;
    setConfirmDelete({
      title: "🗑️ Delete Daily Meal Log",
      message: `Are you sure you want to delete the meal log for ${fmtDate(rec.date)} (${rec.menuItem})?`,
      onConfirm: async () => {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        showToast(`✓ Meal record for ${fmtDate(rec.date)} deleted.`);
        logActivity("🗑️", `Meal record for ${fmtDate(rec.date)} deleted.`);
        try {
          await apiFetch(`/api/headmaster/mdm/records/${id}`, { method: "DELETE" });
        } catch (err) {
          console.error("Delete daily record error:", err);
        }
      },
    });
  };

  const deleteStockItem = (id: string) => {
    const item = stock.find((s) => s.id === id);
    if (!item) return;
    setConfirmDelete({
      title: "🗑️ Remove Stock Item",
      message: `Are you sure you want to remove ${item.item} (${item.quantity} ${item.unit}) from kitchen stock register?`,
      onConfirm: async () => {
        setStock((prev) => prev.filter((s) => s.id !== id));
        showToast(`✓ ${item.item} removed from kitchen stock.`);
        logActivity("🗑️", `${item.item} removed from stock register.`);
        try {
          await apiFetch(`/api/headmaster/mdm/stock/${id}`, { method: "DELETE" });
        } catch (err) {
          console.error("Delete stock item error:", err);
        }
      },
    });
  };

  const deleteQualityReport = (id: string) => {
    const rep = quality.find((q) => q.id === id);
    if (!rep) return;
    setConfirmDelete({
      title: "🗑️ Delete Inspection Report",
      message: `Are you sure you want to delete the inspection report from ${fmtDate(rep.date)} by ${rep.inspector}?`,
      onConfirm: async () => {
        setQuality((prev) => prev.filter((q) => q.id !== id));
        showToast(`✓ Quality report deleted.`);
        logActivity("🗑️", `Quality report from ${fmtDate(rep.date)} deleted.`);
        try {
          await apiFetch(`/api/headmaster/mdm/quality/${id}`, { method: "DELETE" });
        } catch (err) {
          console.error("Delete quality report error:", err);
        }
      },
    });
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
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.monthMeals.toLocaleString("en-IN")}</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? `${currentMonthName} உணவுகள்` : `Meals in ${currentMonthName}`}</span></div>
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.avgCoverage}%</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "சராசரி உல்ளடக்கம்" : "Avg coverage"}</span></div>
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.avgQuality}/5</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "தரம் மதிப்பெண்" : "Quality score"}</span></div>
        </div>
      </div>

      {/* Responsive Tab Bar */}
      <div className="overflow-x-auto max-w-full pb-1 mb-6 no-scrollbar">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-max sm:w-fit min-w-full sm:min-w-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                tab === t.key
                  ? "bg-emerald-600 shadow-md text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
              style={tab === t.key ? { color: "#fff" } : undefined}
            >
              <span className="text-sm">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================ OVERVIEW ============================ */}
      {tab === "overview" && (
        <>

          {/* Quick lookup */}
          <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
            <h2 className="text-base font-semibold text-white mb-1">🔎 {lang === "தமிழ்" ? "விரைவு தேடல்" : "Quick Lookup"}</h2>
            <p className="text-xs text-slate-500 mb-4">{lang === "தமிழ்" ? "பயனாளர்கள், கைவசம் உள்ள பொருட்கள், தினசரி பதிவுகள் மற்றும் ஆய்வு அறிக்கைகளை ஒரே இடத்தில் தேடவும்." : "Search across beneficiaries, stock items, daily records and inspection reports in one place."}</p>
            <input
              type="text"
              placeholder={lang === "தமிழ்" ? "🔍 மாணவர் பெயர், EMIS ID, மளிகை பொருள், தேதி அல்லது ஆய்வாளரை தேடவும்…" : "🔍 Try a student name, EMIS ID, grocery item, date or inspector…"}
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

          {/* KPI Cards with 🟢 / 🟡 / 🔴 status indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{lang === "தமிழ்" ? "இன்று வழங்கப்பட்டது" : "Meals Served Today"}</span>
                <span className="text-xs" title="Daily status">{todayCoveragePct >= 95 ? "🟢" : todayCoveragePct >= 85 ? "🟡" : "🔴"}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-emerald-400">{today?.mealsServed ?? 0}</span>
                <span className="text-[10px] text-slate-400 font-bold">{today?.studentsPresent ?? 0} {lang === "தமிழ்" ? "வருகையில்" : "present"} ({todayCoveragePct}%)</span>
              </div>
              <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${todayCoveragePct}%` }} />
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{lang === "தமிழ்" ? "மாணவர் கவரேஜ்" : "Student Coverage"}</span>
                <span className="text-xs" title="Average coverage">{stats.avgCoverage >= 90 ? "🟢" : stats.avgCoverage >= 80 ? "🟡" : "🔴"}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-blue-400">{stats.avgCoverage}%</span>
                <span className="text-[10px] text-slate-400 font-bold">{lang === "தமிழ்" ? "சராசரி" : "average rate"}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-semibold">
                {stats.activeBens} {lang === "தமிழ்" ? "செயலில் உள்ள பயனாளிகள்" : "active beneficiaries"}
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{lang === "தமிழ்" ? "கையிருப்பு நிலை" : "Stock Alerts"}</span>
                <span className="text-xs" title="Stock alert level">{stats.criticalItems > 0 ? "🔴" : stats.lowItems > 0 ? "🟡" : "🟢"}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-2xl font-black ${stats.criticalItems > 0 ? "text-red-400" : stats.lowItems > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {stats.lowItems + stats.criticalItems}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{stock.length} {lang === "தமிழ்" ? "பொருட்களில்" : "items total"}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-semibold">
                {stats.criticalItems} {lang === "தமிழ்" ? "மிகக் குறைவு" : "critical"} · {stats.lowItems} {lang === "தமிழ்" ? "குறைவு" : "low stock"}
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{lang === "தமிழ்" ? "மெனு இணக்கம்" : "Menu Compliance"}</span>
                <span className="text-xs" title="Menu compliance level">{stats.menuCompliance >= 90 ? "🟢" : stats.menuCompliance >= 75 ? "🟡" : "🔴"}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-amber-400">{stats.menuCompliance}%</span>
                <span className="text-[10px] text-slate-400 font-bold">{lang === "தமிழ்" ? "வாராந்திர இணக்கம்" : "weekly rate"}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-semibold">
                {stats.openIssues} {lang === "தமிழ்" ? "திறந்த தர சிக்கல்கள்" : "quality reports open"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Coverage trend + stock alerts */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
              <h2 className="text-base font-semibold text-white mb-1">📈 {lang === "தமிழ்" ? "உணவு வழங்கல் கவரேஜ் — கடந்த 7 நாட்கள்" : "Serving Coverage — Last 7 School Days"}</h2>
              <p className="text-xs text-slate-500 mb-5">{lang === "தமிழ்" ? "தினசரி விநியோகப் பதிவேட்டில் இருந்து, வருகை தந்த மாணவர்களுக்கு வழங்கப்பட்ட உணவுகள்." : "Meals served against students present, from the daily distribution register."}</p>
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

              <h3 className="text-sm font-semibold text-white mt-6 mb-3">⚠️ {lang === "தமிழ்" ? "கையிருப்பு எச்சரிக்கைகள்" : "Stock Alerts"}</h3>
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
                              {s.quantity} {s.unit} {lang === "தமிழ்" ? "மீதம்" : "left"} · ~{d} {lang === "தமிழ்" ? "நாட்கள் பயன்பாடு" : `day${d !== 1 ? "s" : ""} of usage`} · {s.reorderPlaced ? (lang === "தமிழ்" ? "மறுஆர்டர் செய்யப்பட்டது" : "Reorder placed") : (lang === "தமிழ்" ? "மறுஆர்டர் செய்யப்படவில்லை" : "No reorder yet")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`badge ${STOCK_LEVEL_BADGE[lvl]}`}>
                            {lvl === "Critical" ? (lang === "தமிழ்" ? "மிகக் குறைவு" : "Critical") : lvl === "Low Stock" ? (lang === "தமிழ்" ? "குறைந்த கையிருப்பு" : "Low Stock") : (lang === "தமிழ்" ? "போதுமானது" : "Adequate")}
                          </span>
                          {!s.reorderPlaced && (
                            <button
                              onClick={() => placeReorder(s.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-colors"
                              style={{ color: "#fff" }}
                            >
                              {lang === "தமிழ்" ? "மறுஆர்டர் செய்" : "Reorder"}
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
                <h2 className="text-base font-semibold text-white mb-1">👥 {lang === "தமிழ்" ? "உணவு வகை வாரியாக பயனாளிகள்" : "Beneficiaries by Meal Type"}</h2>
                <p className="text-xs text-slate-500 mb-4">{lang === "தமிழ்" ? "உணவுப் பழக்க வகை அடிப்படையில், மதிய உணவுப் பட்டியலில் உள்ள செயலில் உள்ள மாணவர்கள்." : "Active students on the noon meal roll, by dietary category."}</p>
                <div className="flex items-center gap-5">
                  <DonutChart counts={benCatCounts} total={stats.activeBens} />
                  <div className="space-y-2 flex-1">
                    {(Object.keys(benCatCounts) as BenCategory[]).map((cat) => {
                      const catLabel = cat === "Regular Meal" ? (lang === "தமிழ்" ? "சாதாரண உணவு" : "Regular Meal") : cat === "Egg Alternative" ? (lang === "தமிழ்" ? "முட்டை மாற்று" : "Egg Alternative") : (lang === "தமிழ்" ? "சிறப்பு உணவு" : "Special Diet");
                      return (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: BEN_CAT_META[cat].color }} />
                            {catLabel}
                          </span>
                          <span className="text-[11px] font-black text-slate-300">{benCatCounts[cat]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-slate-800">
                <h2 className="text-base font-semibold text-white mb-3">🕑 {lang === "தமிழ்" ? "சமீபத்திய செயல்பாடுகள்" : "Recent Activity"}</h2>
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
                        <div className="flex items-center justify-end gap-2">
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
                          <button
                            onClick={() => deleteDailyRecord(r.id)}
                            title="Delete Daily Record"
                            className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 text-xs font-bold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
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
                  <th className="py-2.5 pr-3 font-bold">{lang === "தமிழ்" ? `${currentMonthName} உணவுகள்` : `Meals (${currentMonthName})`}</th>
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
                      <div className="flex items-center justify-end gap-2">
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
                        <button
                          onClick={() => deleteBeneficiary(b.id)}
                          title="Delete Beneficiary"
                          className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 text-xs font-bold"
                        >
                          🗑️ Delete
                        </button>
                      </div>
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
            <div className="flex items-center gap-2 flex-wrap">
              {stock.length === 0 && (
                <button
                  onClick={seedDefaultGovtStock}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl text-xs transition-colors"
                  style={{ color: "#fff" }}
                >
                  ⚡ Initialize TN Govt Stock List
                </button>
              )}
              <button
                onClick={() => setShowAddStock(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors"
                style={{ color: "#fff" }}
              >
                + Add Stock Item
              </button>
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setRefillItem(s)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-colors"
                            style={{ color: "#fff" }}
                          >
                            Log Refill
                          </button>
                          <button
                            onClick={() => setEditStockItem(s)}
                            title="Edit Stock Item & Daily Usage"
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors border border-amber-500/20 text-[10px] font-bold"
                          >
                            ✏️ Edit
                          </button>
                          {!s.reorderPlaced && lvl !== "Adequate" && (
                            <button
                              onClick={() => placeReorder(s.id)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold transition-colors"
                            >
                              Reorder
                            </button>
                          )}
                          <button
                            onClick={() => deleteStockItem(s.id)}
                            title="Delete Stock Item"
                            className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 text-xs font-bold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStock.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs space-y-3">
                <div>No kitchen stock items found in store register.</div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowAddStock(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors"
                    style={{ color: "#fff" }}
                  >
                    + Add New Stock Item
                  </button>
                  <button
                    onClick={seedDefaultGovtStock}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs transition-colors border border-amber-500/20"
                  >
                    ⚡ Auto-Populate Standard TN Govt MDM Stock Items
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================= MENU MONITORING ========================= */}
      {tab === "menu" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">📅 Tamil Nadu Government Nutritious Meal Cycle</h2>
              <p className="text-xs text-slate-500">Official revised menu cycle mandated across TN district schools with 1st/3rd & 2nd/4th week rotation.</p>
            </div>
            <span className={`badge ${stats.menuCompliance >= 80 ? "badge-green" : "badge-yellow"}`}>
              Weekly compliance: {stats.menuCompliance}%
            </span>
          </div>

          {/* Week Cycle Switcher Tabs */}
          <div className="flex items-center gap-2 mb-5 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
            <button
              onClick={() => setMenuCycleTab("w1_w3")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                menuCycleTab === "w1_w3" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              🗓️ 1st & 3rd Weeks Schedule
            </button>
            <button
              onClick={() => setMenuCycleTab("w2_w4")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                menuCycleTab === "w2_w4" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              🗓️ 2nd & 4th Weeks Schedule
            </button>
          </div>

          {/* Official Scheme Specifications Card */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-500/20 rounded-xl mb-5">
            <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <span>🥚</span> Official Scheme Entitlements & Government Norms (Puratchi Thalaivar MGR Nutritious Meal Programme)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500">Egg Entitlement</div>
                <div className="font-bold text-white mt-0.5">46 – 52 g / egg</div>
                <div className="text-[10px] text-slate-400">All school working days</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500">Banana Alternative</div>
                <div className="font-bold text-amber-400 mt-0.5">100 g / child</div>
                <div className="text-[10px] text-slate-400">For non-egg eating children</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500">Rice Quantity</div>
                <div className="font-bold text-white mt-0.5">100g (Cl 1–5) / 150g (Cl 6–10)</div>
                <div className="text-[10px] text-slate-400">Per child daily scale</div>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500">Legume Rotation</div>
                <div className="font-bold text-emerald-400 mt-0.5">Black Chana / Green Sundal</div>
                <div className="text-[10px] text-slate-400">Tue (W1/3) & Thu (W2/4)</div>
              </div>
            </div>
          </div>

          {/* Daily Schedule List */}
          <div className="space-y-3">
            {TN_GOVT_MENU_CYCLE[menuCycleTab].map((item) => {
              const dbDay = menu.find((m) => m.day === item.day);
              const complianceStatus = dbDay?.compliance ?? "Compliant";
              const isToday = item.day === currentDayName;

              return (
                <div
                  key={item.day}
                  className={`p-4 rounded-xl border ${
                    isToday ? "bg-emerald-500/5 border-emerald-500/30" : "bg-slate-900/60 border-slate-850"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{item.day}</h3>
                        {isToday && <span className="badge badge-blue">Today</span>}
                        <span className={`badge ${COMPLIANCE_BADGE[complianceStatus]}`}>{complianceStatus}</span>
                        {item.eggDay && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                            🥚 46-52g Egg / 🍌 100g Banana Day
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white font-bold">{item.menuItem}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Accompaniment: <span className="text-slate-300">{item.accompaniment}</span> · ⚡ {item.calories} kcal · 🥩 {item.proteinGm} g protein
                      </div>
                      {dbDay?.compliance === "Deviation" && dbDay?.deviationNote && (
                        <div className="text-[10px] text-red-400/90 font-semibold mt-1.5">⚠ {dbDay.deviationNote}</div>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => markCompliance(item.day, "Compliant")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                          complianceStatus === "Compliant" ? "bg-emerald-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        ✓ As Sanctioned
                      </button>
                      <button
                        onClick={() => setDeviationDay({ day: item.day, menuItem: item.menuItem, accompaniment: item.accompaniment, eggDay: true, calories: item.calories, proteinGm: item.proteinGm, compliance: dbDay?.compliance || "Pending", deviationNote: dbDay?.deviationNote || "" })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                          complianceStatus === "Deviation" ? "bg-red-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
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
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Government Nutrition Guidelines (Puratchi Thalaivar MGR Nutritious Meal Programme)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Daily Calories" value="≥ 620 - 700 kcal" />
              <MiniStat label="Protein Content" value="16 - 20 g / day" />
              <MiniStat label="Rice Scale" value="100g (Cl 1-5) / 150g (Cl 6-10)" />
              <MiniStat label="Egg Weight" value="46 - 52 g / egg" />
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
                    <div className="flex items-center gap-2 shrink-0">
                      {r.status !== "Satisfactory" && (
                        <button
                          onClick={() => resolveReport(r.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold transition-colors"
                          style={{ color: "#fff" }}
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => deleteQualityReport(r.id)}
                        title="Delete Report"
                        className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20 text-xs font-bold"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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
        <AddBeneficiaryModal
          schoolId={schoolId}
          existingBeneficiaries={beneficiaries}
          onClose={() => setShowAddBen(false)}
          onSave={addBeneficiary}
        />
      )}

      {refillItem && (
        <RefillModal item={refillItem} onClose={() => setRefillItem(null)} onSave={refillStock} />
      )}

      {editStockItem && (
        <EditStockModal item={editStockItem} onClose={() => setEditStockItem(null)} onSave={updateStockItem} />
      )}

      {showAddStock && (
        <AddStockModal onClose={() => setShowAddStock(false)} onSave={addStockItem} />
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

      {confirmDelete && (
        <DeleteConfirmModal
          title={confirmDelete.title}
          message={confirmDelete.message}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDelete.onConfirm}
        />
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] min-w-[340px] max-w-lg p-4 rounded-2xl bg-slate-950 text-white font-bold border-2 border-emerald-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 text-xs leading-relaxed">
          <div className="flex items-center gap-2.5">
            <span className="text-xl shrink-0">{toast.tone === "ok" ? "✅" : "⚠️"}</span>
            <span className="text-white text-xs font-black">{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800 shrink-0 transition-colors"
          >
            ✕
          </button>
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
  menu: MenuDay[]; onClose: () => void; onSave: (r: any) => void;
}) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const weekday = new Date().toLocaleDateString("en-IN", { weekday: "long" });
  const todaysMenu = menu.find((m) => m.day === weekday)?.menuItem ?? TN_GOVT_MEAL_OPTIONS[0];

  const [date, setDate] = useState(todayIso);
  const [selectedMenuPreset, setSelectedMenuPreset] = useState(
    TN_GOVT_MEAL_OPTIONS.includes(todaysMenu) ? todaysMenu : TN_GOVT_MEAL_OPTIONS[0]
  );
  const [customMenuItem, setCustomMenuItem] = useState(
    TN_GOVT_MEAL_OPTIONS.includes(todaysMenu) ? "" : todaysMenu
  );
  const [present, setPresent] = useState("238");
  const [served, setServed] = useState("232");
  const [eggs, setEggs] = useState("219");
  const [bananas, setBananas] = useState("13");
  const [rice, setRice] = useState("29");
  const [remarks, setRemarks] = useState("");

  const finalMenuItem = selectedMenuPreset === "Custom / Special Diet Menu" ? customMenuItem : selectedMenuPreset;

  return (
    <ModalShell
      title="🍛 Log Daily Meal Distribution"
      subtitle="Select sanctioned TN Government menu G.O., post serving count & auto-deduct stock."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            date,
            menuItem: finalMenuItem.trim(),
            studentsPresent: Number(present) || 0,
            mealsServed: Number(served) || 0,
            eggsServed: Number(eggs) || 0,
            bananasServed: Number(bananas) || 0,
            riceUsedKg: Number(rice) || 0,
            remarks: remarks.trim(),
          });
        }}
        className="space-y-4"
      >
        {/* Scheme Norms banner */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span>📜</span> TN Govt MDM Scheme Norms:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[10px]">
            <li><strong>Rice Entitlement:</strong> 100g (Cl 1–5), 150g (Cl 6–10)</li>
            <li><strong>Egg Spec:</strong> 46–52g boiled egg on working days</li>
            <li><strong>Banana Alt:</strong> 100g for non-egg eating children</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Date *</label>
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Rice Used (kg) *</label>
            <input className={inputCls} type="number" step="0.1" min={0} value={rice} onChange={(e) => setRice(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className={labelCls}>Sanctioned Menu Item *</label>
          <select
            className={inputCls}
            value={selectedMenuPreset}
            onChange={(e) => setSelectedMenuPreset(e.target.value)}
            required
          >
            {TN_GOVT_MEAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900 text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {selectedMenuPreset === "Custom / Special Diet Menu" && (
          <div>
            <label className={labelCls}>Custom Menu Description *</label>
            <input
              className={inputCls}
              value={customMenuItem}
              onChange={(e) => setCustomMenuItem(e.target.value)}
              placeholder="e.g. Special Pongal & Chana Sundal"
              required
            />
          </div>
        )}

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
            <label className={labelCls}>Eggs Distributed (46-52g)</label>
            <input className={inputCls} type="number" min={0} value={eggs} onChange={(e) => setEggs(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Bananas Distributed (100g)</label>
            <input className={inputCls} type="number" min={0} value={bananas} onChange={(e) => setBananas(e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Remarks</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. 13 egg alternatives served with 100g bananas..." />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Post Serving Log</button>
        </div>
      </form>
    </ModalShell>
  );
}

interface StudentOption {
  id: string;
  name: string;
  classVal: string;
  sectionVal: string;
  emisId: string;
}

function AddBeneficiaryModal({
  schoolId,
  existingBeneficiaries,
  onClose,
  onSave,
}: {
  schoolId?: string;
  existingBeneficiaries: Beneficiary[];
  onClose: () => void;
  onSave: (b: any) => void;
}) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [name, setName] = useState("");
  const [classSection, setClassSection] = useState("");
  const [emisId, setEmisId] = useState("");
  const [category, setCategory] = useState<BenCategory>("Regular Meal");

  useEffect(() => {
    async function loadStudents() {
      setLoadingStudents(true);
      try {
        const qs = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : "";
        const res = await apiFetch(`/api/headmaster/students${qs}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: StudentOption[] = json.data.map((s: any) => {
            const studentName = s.name && s.name !== "Unknown" ? s.name : s.user?.name || "Student";
            const rawClass = String(s.class || s.classVal || "");
            const rawSec = String(s.section || s.sectionVal || "");
            let classFormatted = rawClass;
            if (rawClass && !rawClass.toLowerCase().startsWith("class")) {
              classFormatted = `Class ${rawClass}${rawSec}`;
            } else if (rawSec && !classFormatted.includes(rawSec)) {
              classFormatted = `${classFormatted}${rawSec}`;
            }
            return {
              id: s.id,
              name: studentName,
              classVal: classFormatted || "Class 6A",
              sectionVal: "",
              emisId: String(s.emisNumber || s.emisId || ""),
            };
          });
          setStudents(mapped);
        }
      } catch (err) {
        console.error("Error loading students for dropdown:", err);
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, [schoolId]);

  // Exclude active beneficiaries already on the roll
  const availableStudents = useMemo(() => {
    return students.filter((s) => {
      const isEnrolled = existingBeneficiaries.some((b) => {
        if (b.status === "Inactive" || b.status === "Transferred") return false;
        if (s.emisId && b.emisId && s.emisId.trim().toLowerCase() === b.emisId.trim().toLowerCase()) {
          return true;
        }
        if (s.name && b.name && s.name.trim().toLowerCase() === b.name.trim().toLowerCase()) {
          return true;
        }
        return false;
      });
      return !isEnrolled;
    });
  }, [students, existingBeneficiaries]);

  // Filtered list based on search input for scalability
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableStudents;
    return availableStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.classVal.toLowerCase().includes(q) ||
        s.emisId.toLowerCase().includes(q)
    );
  }, [availableStudents, searchQuery]);

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    if (!id) return;
    const target = students.find((s) => s.id === id);
    if (target) {
      setName(target.name);
      setClassSection(target.classVal);
      setEmisId(target.emisId);
    }
  };

  return (
    <ModalShell
      title="👤 Enrol Meal Beneficiary"
      subtitle="Select an eligible student from your school's student database or enter details below."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            name: name.trim(),
            classSection: classSection.trim(),
            emisId: emisId.trim(),
            category,
          });
        }}
        className="space-y-4"
      >
        {/* Student database selector with search filter */}
        <div className="space-y-2 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <label className={labelCls}>🎓 Select Eligible Student</label>

          {/* Quick search input for larger student populations */}
          <input
            type="text"
            placeholder="🔍 Type student name, class or EMIS ID to search eligible students…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputCls} py-1.5 text-xs bg-slate-950`}
          />

          <select
            className={inputCls}
            value={selectedStudentId}
            onChange={(e) => handleSelectStudent(e.target.value)}
          >
            <option value="">
              {loadingStudents
                ? "⏳ Loading school student register…"
                : filteredStudents.length > 0
                ? `-- Select Eligible Student (${filteredStudents.length} available) --`
                : searchQuery
                ? `-- No un-enrolled student matches "${searchQuery}" --`
                : "-- Manual Entry / No un-enrolled students available --"}
            </option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.classVal} — {s.emisId || "No EMIS"}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Select an eligible student from your school's student database. Students already enrolled in the meal register are excluded.
          </p>
        </div>

        <div>
          <label className={labelCls}>Student Name *</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arun Kumar"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Class & Section *</label>
            <input
              className={inputCls}
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              placeholder="e.g. Class 6A"
              required
            />
          </div>
          <div>
            <label className={labelCls}>EMIS ID *</label>
            <input
              className={inputCls}
              value={emisId}
              onChange={(e) => setEmisId(e.target.value)}
              placeholder="e.g. EMIS600001"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Meal Category *</label>
          <select
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value as BenCategory)}
          >
            <option>Regular Meal</option>
            <option>Egg Alternative</option>
            <option>Special Diet</option>
          </select>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors"
            style={{ color: "#fff" }}
          >
            Enrol Student
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function RefillModal({
  item,
  onClose,
  onSave,
}: {
  item: StockItem;
  onClose: () => void;
  onSave: (id: string, newQty: number, addedQty?: number) => void;
}) {
  const [mode, setMode] = useState<"add" | "set">("add");
  const [val, setVal] = useState("");

  const numVal = Number(val) || 0;
  const targetNewQty = mode === "add" ? item.quantity + numVal : numVal;

  return (
    <ModalShell
      title={`📦 Log Refill — ${item.item}`}
      subtitle={`Current balance: ${item.quantity} ${item.unit}. Supplier: ${item.supplier}.`}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (targetNewQty < 0) return;
          onSave(item.id, targetNewQty, mode === "add" ? numVal : undefined);
        }}
        className="space-y-4"
      >
        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => { setMode("add"); setVal(""); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "add" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            ➕ Add Shipment Received
          </button>
          <button
            type="button"
            onClick={() => { setMode("set"); setVal(String(item.quantity)); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "set" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            ✏️ Set New Total Stock
          </button>
        </div>

        <div>
          <label className={labelCls}>
            {mode === "add"
              ? `Quantity Received to Add (${item.unit}) *`
              : `Exact Total Quantity On Hand (${item.unit}) *`}
          </label>
          <input
            className={inputCls}
            type="number"
            min={0}
            step="any"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={mode === "add" ? "e.g. 2" : `Current is ${item.quantity}`}
            required
            autoFocus
          />
        </div>

        {/* Live Calculation Preview */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Updated Store Balance:</span>
          <span className="font-bold text-emerald-400 text-sm">
            {targetNewQty} {item.unit}
            {mode === "add" && numVal > 0 && ` (${item.quantity} + ${numVal})`}
          </span>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors"
            style={{ color: "#fff" }}
          >
            Update Stock Balance
          </button>
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
      subtitle={`Sanctioned Menu: "${day.menuItem}". Deviations are automatically submitted to your Block Educational Officer (BEO) & District Education Office (DEO) for audit.`}
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

function AddReportModal({ onClose, onSave }: { onClose: () => void; onSave: (r: any) => void }) {
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
              <option>Block Educational Officer (BEO)</option>
              <option>District Educational Officer (DEO)</option>
              <option>Headmaster</option>
              <option>Teacher on Duty</option>
              <option>VEC Member</option>
              <option>Parent Volunteer</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Inspector Name *</label>
          <input className={inputCls} value={inspector} onChange={(e) => setInspector(e.target.value)} placeholder="e.g. Mrs. Kalaiselvi P." required />
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>📋</span> Quality & Safety Inspection Checklist
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Food Taste", val: taste, set: setTaste },
              { label: "Portion Quantity", val: quantity, set: setQuantity },
              { label: "Kitchen Hygiene", val: hygiene, set: setHygiene },
            ].map((f) => (
              <div key={f.label} className="bg-slate-850 p-2.5 rounded-lg border border-slate-700/60">
                <label className="text-[10px] font-bold text-slate-300 block mb-1">{f.label} *</label>
                <select className={inputCls} value={f.val} onChange={(e) => f.set(e.target.value)}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""} — {stars(n)}</option>)}
                </select>
              </div>
            ))}
          </div>
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

function DeleteConfirmModal({
  title,
  message,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell title={title} subtitle={message} onClose={onClose}>
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 flex items-start gap-3">
        <span className="text-2xl shrink-0">⚠️</span>
        <div className="text-xs text-red-300 font-semibold leading-relaxed">
          This action is permanent and will remove the record from your school's database log. Are you sure you want to proceed?
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors"
        >
          Yes, Delete Record
        </button>
      </div>
    </ModalShell>
  );
}

function AddStockModal({ onClose, onSave }: { onClose: () => void; onSave: (item: any) => void }) {
  const [item, setItem] = useState("");
  const [category, setCategory] = useState<StockCategory>("Grains");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [dailyUsage, setDailyUsage] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");
  const [supplier, setSupplier] = useState("TN Civil Supplies Corp.");

  return (
    <ModalShell
      title="📦 Add Kitchen Stock Item"
      subtitle="Adds a new commodity, perishable, condiment or fuel item to your school storeroom register."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            item: item.trim(),
            category,
            quantity: Number(quantity) || 0,
            unit: unit.trim(),
            dailyUsage: Number(dailyUsage) || 0,
            reorderLevel: Number(reorderLevel) || 0,
            supplier: supplier.trim(),
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelCls}>Item Name *</label>
          <input className={inputCls} value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Fine Rice, Fresh Eggs, LPG Cylinders" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category *</label>
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as StockCategory)}>
              <option>Grains</option>
              <option>Pulses</option>
              <option>Oil & Condiments</option>
              <option>Perishables</option>
              <option>Fuel</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Unit *</label>
            <input className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. kg, litres, pieces, units" required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Initial Qty *</label>
            <input className={inputCls} type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" required />
          </div>
          <div>
            <label className={labelCls}>Daily Usage</label>
            <input className={inputCls} type="number" min={0} step="0.1" value={dailyUsage} onChange={(e) => setDailyUsage(e.target.value)} placeholder="15" />
          </div>
          <div>
            <label className={labelCls}>Reorder At</label>
            <input className={inputCls} type="number" min={0} value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} placeholder="30" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Supplier / Depot Name *</label>
          <input className={inputCls} value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. TN Civil Supplies Corp. / Block Godown" required />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Add Stock Item</button>
        </div>
      </form>
    </ModalShell>
  );
}

function EditStockModal({
  item,
  onClose,
  onSave,
}: {
  item: StockItem;
  onClose: () => void;
  onSave: (id: string, updates: Partial<StockItem>) => void;
}) {
  const [itemName, setItemName] = useState(item.item);
  const [category, setCategory] = useState(item.category);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [dailyUsage, setDailyUsage] = useState(String(item.dailyUsage));
  const [reorderLevel, setReorderLevel] = useState(String(item.reorderLevel));
  const [supplier, setSupplier] = useState(item.supplier);

  return (
    <ModalShell
      title={`✏️ Edit Stock Item — ${item.item}`}
      subtitle="Adjust daily consumption rate (burn rate), quantity on hand, or reorder thresholds."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(item.id, {
            item: itemName.trim(),
            category,
            quantity: Number(quantity) || 0,
            dailyUsage: Number(dailyUsage) || 0,
            reorderLevel: Number(reorderLevel) || 0,
            supplier: supplier.trim(),
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelCls}>Item Name *</label>
          <input className={inputCls} value={itemName} onChange={(e) => setItemName(e.target.value)} required />
        </div>
        <div
          className="p-3.5 rounded-xl border text-xs space-y-1.5 shadow-sm"
          style={{ backgroundColor: "#fff7ed", borderColor: "#fdba74" }}
        >
          <div className="font-extrabold flex items-center gap-1.5 text-xs" style={{ color: "#c2410c" }}>
            <span>🔥</span> Daily Usage Burn Rate
          </div>
          <p className="leading-relaxed font-semibold text-[11px]" style={{ color: "#7c2d12" }}>
            This value determines how fast stock depletes per working day and calculates remaining stock days. Reduce this number if your daily consumption rate is lower.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Daily Usage ({item.unit}/day) *</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              step="0.1"
              value={dailyUsage}
              onChange={(e) => setDailyUsage(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Quantity On Hand ({item.unit}) *</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Reorder Threshold ({item.unit})</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Supplier / Depot</label>
            <input
              className={inputCls}
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Save Changes</button>
        </div>
      </form>
    </ModalShell>
  );
}
