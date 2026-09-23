"use client";
import PortalLayout from "@/components/PortalLayout";
import PETPortalBanner from "@/components/PETPortalBanner";
import {
  Package, Plus, AlertCircle, CheckCircle2, Search, Trash2, Minus, RotateCcw,
  Wrench, ClipboardList, Cross, Cloud, WifiOff, Boxes, ArrowRightLeft,
  CalendarClock, Download, Send, Clock,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  InventoryItem,
  StockCategory,
  EquipmentRequest,
  RequestStatus,
  DEFAULT_INVENTORY,
  DEFAULT_REQUESTS,
  INVENTORY_KEY,
  REQUESTS_KEY,
  petLoad,
  petSave,
  petId,
  stockStatus,
  availableQty,
  isExpired,
  expiresSoon,
  normalizeInventoryItem,
  nextRequestStatuses,
  isSeedId,
} from "@/lib/petData";
import {
  fetchInventoryItems,
  createInventoryItem,
  createInventoryItemsBulk,
  updateInventoryItem,
  deleteInventoryItem,
  fetchEquipmentRequests,
  createEquipmentRequest,
  updateEquipmentRequest,
  deleteEquipmentRequest,
} from "@/lib/petInventoryApi";

const CATEGORIES: ("All" | StockCategory)[] = ["All", "Ball Games", "Athletics", "Indoor Games", "Fitness & Training", "First Aid"];
const CONDITIONS: InventoryItem["condition"][] = ["New", "Good", "Fair", "Needs Repair", "Damaged"];

const STANDARD_EQUIPMENT_LIST = [
  "Football (Size 5)",
  "Volleyball (Synthetic)",
  "Cricket Bat & Leather Balls",
  "Badminton Rackets & Shuttles",
  "Basketball (Size 7)",
  "Carrom Board with Coins",
  "Chess Set (Tournament Board)",
  "Shot Put Ball (4kg/7.26kg)",
  "Medical First Aid Kit",
  "Sports Uniform / Jerseys",
  "Table Tennis Rackets & Balls",
  "Throwball",
  "Handball",
  "Skipping Ropes",
  "Cones & Markers",
];

type Tab = "equipment" | "damaged" | "requests" | "firstaid";

const TONES: Record<"green" | "blue" | "amber" | "red" | "slate", string> = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

// Button labels for advancing a request to a given status.
const STATUS_ACTION: Record<RequestStatus, string> = {
  Pending: "Pending",
  Approved: "Approve",
  Rejected: "Reject",
  Issued: "Issue Equipment",
  Returned: "Return to Stock",
  Received: "Mark Received",
};

const STATUS_TONE: Record<RequestStatus, keyof typeof TONES> = {
  Pending: "amber",
  Approved: "blue",
  Issued: "green",
  Returned: "slate",
  Received: "green",
  Rejected: "red",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState<"server" | "local">("local");
  const [tab, setTab] = useState<Tab>("equipment");
  const [category, setCategory] = useState<"All" | StockCategory>("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<EquipmentRequest | null>(null);

  useEffect(() => {
    (async () => {
      const localReqs = petLoad<EquipmentRequest[]>(REQUESTS_KEY, DEFAULT_REQUESTS);
      try {
        const [srvItems, srvRequests] = await Promise.all([fetchInventoryItems(), fetchEquipmentRequests()]);
        
        const map = new Map<string, EquipmentRequest>();
        localReqs.filter((r) => r && r.id && !isSeedId(r.id)).forEach((r) => map.set(r.id, r));
        if (Array.isArray(srvRequests)) {
          srvRequests.filter((r) => r && r.id && !isSeedId(r.id)).forEach((r) => map.set(r.id, r));
        }
        const mergedRequests = Array.from(map.values());

        setItems(srvItems);
        setRequests(mergedRequests);
        petSave(INVENTORY_KEY, srvItems);
        petSave(REQUESTS_KEY, mergedRequests);
        setSource("server");
      } catch {
        setItems(petLoad(INVENTORY_KEY, DEFAULT_INVENTORY).map(normalizeInventoryItem));
        setRequests(localReqs.filter((r) => r && r.id && !isSeedId(r.id)));
        setSource("local");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persistItems = (next: InventoryItem[]) => {
    setItems(next);
    petSave(INVENTORY_KEY, next);
  };
  const persistRequests = (next: EquipmentRequest[]) => {
    setRequests(next);
    petSave(REQUESTS_KEY, next);
  };

  const syncFailed = (action: string, err: unknown) => {
    alert(`Could not ${action} on the server — ${err instanceof Error ? err.message : "request failed"}. Please retry.`);
  };

  // ── Item mutations ───────────────────────────────────────────────

  const patchItem = async (id: string, patch: Partial<InventoryItem>) => {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    const next = { ...current, ...patch, lastChecked: today() };
    if (source === "server") {
      try {
        const updated = await updateInventoryItem(next);
        persistItems(items.map((i) => (i.id === id ? updated : i)));
      } catch (err) {
        syncFailed("update the item", err);
      }
    } else {
      persistItems(items.map((i) => (i.id === id ? next : i)));
    }
  };

  const addItem = async (item: Omit<InventoryItem, "id">) => {
    try {
      const created = await createInventoryItem(item);
      if (created && created.id) {
        persistItems([created, ...items.filter((i) => i.id !== created.id)]);
        setSource("server");
        return;
      }
    } catch (err) {
      console.warn("API add item failed, saving local fallback:", err);
    }
    persistItems([{ ...item, id: petId() }, ...items]);
  };

  const executeRemoveItem = async (item: InventoryItem) => {
    try {
      await deleteInventoryItem(item.id);
    } catch (err) {
      console.warn("Could not delete item on server API:", err);
    }
    persistItems(items.filter((i) => i.id !== item.id));
  };

  const importDefaults = async () => {
    if (items.length > 0 && !confirm("Import the default TN school stock list? Existing items are kept; defaults are added alongside them.")) return;
    if (source === "server") {
      try {
        const created = await createInventoryItemsBulk(DEFAULT_INVENTORY.map(({ id, ...rest }) => rest));
        persistItems([...created, ...items]);
      } catch (err) {
        syncFailed("import the default stock list", err);
      }
    } else {
      if (confirm("Reset the stock list to the default school sports material list? Your changes will be lost.")) {
        persistItems(DEFAULT_INVENTORY);
      }
    }
  };

  // ── Request mutations ────────────────────────────────────────────

  const addRequest = async (req: Omit<EquipmentRequest, "id" | "status">) => {
    try {
      const created = await createEquipmentRequest(req);
      if (created && created.id) {
        persistRequests([created, ...requests]);
        setSource("server");
        return;
      }
    } catch (err) {
      console.warn("API submit failed, saving to local fallback:", err);
    }
    persistRequests([{ ...req, id: petId(), status: "Pending" }, ...requests]);
  };

  // Advance a request through the workflow. Issue/Return/Receive also move
  // stock on the linked item (the backend does this atomically; offline we
  // replicate the same adjustment locally).
  const advanceRequest = async (req: EquipmentRequest, status: RequestStatus) => {
    if (source === "server") {
      try {
        const updated = await updateEquipmentRequest(req.id, { status });
        persistRequests(requests.map((r) => (r.id === req.id ? updated : r)));
        if (req.itemId && ["Issued", "Returned", "Received"].includes(status)) {
          const srvItems = await fetchInventoryItems();
          persistItems(srvItems);
        }
      } catch (err) {
        syncFailed("update the request", err);
      }
    } else {
      persistRequests(requests.map((r) => (r.id === req.id ? { ...r, status } : r)));
      if (status === "Issued" && req.type === "Issue" && req.itemId) {
        const item = items.find((i) => i.id === req.itemId);
        if (item) persistItems(items.map((i) => (i.id === item.id ? { ...i, qtyIssued: i.qtyIssued + req.qty } : i)));
      } else if (status === "Returned" && req.type === "Issue" && req.itemId) {
        const item = items.find((i) => i.id === req.itemId);
        if (item) persistItems(items.map((i) => (i.id === item.id ? { ...i, qtyIssued: Math.max(0, i.qtyIssued - req.qty) } : i)));
      } else if (status === "Received" && req.type === "Purchase") {
        const existingItem = items.find((i) => (req.itemId && i.id === req.itemId) || i.item.toLowerCase() === req.item.toLowerCase());
        if (existingItem) {
          persistItems(items.map((i) => (i.id === existingItem.id ? { ...i, qty: i.qty + req.qty } : i)));
        } else {
          const newItem: InventoryItem = {
            id: petId(),
            item: req.item,
            category: (req.category as StockCategory) || "Ball Games",
            qty: req.qty,
            qtyIssued: 0,
            qtyDamaged: 0,
            minQty: 1,
            condition: "New",
            location: "Sports Room A",
            lastChecked: today(),
            remarks: req.notes || req.purpose,
          };
          persistItems([newItem, ...items]);
        }
      }
    }
  };

  const executeRemoveRequest = async (req: EquipmentRequest) => {
    try {
      await deleteEquipmentRequest(req.id);
    } catch (err) {
      console.warn("Could not delete request on server API:", err);
    }
    persistRequests(requests.filter((r) => r.id !== req.id));
  };

  // ── Derived data ─────────────────────────────────────────────────

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items
      .filter((i) => category === "All" || i.category === category)
      .filter((i) => !q || i.item.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
  }, [items, category, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const damagedItems = useMemo(
    () => items.filter((i) => i.qtyDamaged > 0 || i.condition === "Needs Repair" || i.condition === "Damaged"),
    [items]
  );
  const firstAidItems = useMemo(() => items.filter((i) => i.category === "First Aid"), [items]);

  const stats = useMemo(() => {
    const totalUnits = items.reduce((a, i) => a + i.qty, 0);
    const available = items.reduce((a, i) => a + availableQty(i), 0);
    const issued = items.reduce((a, i) => a + (i.qtyIssued || 0), 0);
    const damagedUnits = items.reduce((a, i) => a + (i.qtyDamaged || 0), 0);
    const alerts = items.filter((i) => stockStatus(i) !== "ok").length;
    const pending = requests.filter((r) => r.status === "Pending").length;
    return { totalUnits, available, issued, damagedUnits, alerts, pending };
  }, [items, requests]);

  const tabs: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: "equipment", label: "Equipment", icon: Boxes, count: items.length },
    { key: "damaged", label: "Damaged & Repairs", icon: Wrench, count: damagedItems.length },
    { key: "requests", label: "Requests", icon: ClipboardList, count: requests.filter((r) => !isSeedId(r.id)).length },
    { key: "firstaid", label: "First Aid", icon: Cross, count: firstAidItems.length },
  ];

  return (
    <PortalLayout>
      <div className="p-4 sm:p-6 w-full space-y-6 text-slate-800 dark:text-slate-100">
        
        {/* ── Top Hero Header Banner ──────────────────────────────── */}
        <PETPortalBanner
          pageKey="inventory"
          rightElement={
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowRequest(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/10"
              >
                <Send size={15} /> New Request
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/10"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
          }
        />

        {/* ── Stat Metric Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Units</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {stats.available}
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-500" /> of {stats.totalUnits} total units
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issued Out</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {stats.issued}
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowRightLeft size={13} className="text-blue-500" /> units in active use
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Damaged Units</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {stats.damagedUnits}
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Wrench size={13} className="text-rose-500" /> {damagedItems.length} items affected
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Requests</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {stats.pending}
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ClipboardList size={13} className="text-amber-500" /> {stats.alerts} stock alerts
            </div>
          </div>
        </div>

        {/* ── Glassmorphic Segmented Tabs ───────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm flex flex-wrap gap-2">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                tab === key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} /> {label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tab === key ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Equipment tab ──────────────────────────────────────── */}
        {tab === "equipment" && (
          <>
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      category === c
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-blue-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={15} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search item or location..."
                  className="pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-blue-500 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4 font-bold">Item</th>
                      <th className="p-4 font-bold">Location</th>
                      <th className="p-4 font-bold text-center">Total</th>
                      <th className="p-4 font-bold text-center">Issued</th>
                      <th className="p-4 font-bold text-center">Damaged</th>
                      <th className="p-4 font-bold text-center">Available</th>
                      <th className="p-4 font-bold">Condition</th>
                      <th className="p-4 font-bold text-center">Status</th>
                      <th className="p-4 font-bold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {paginatedItems.map((item) => {
                      const status = stockStatus(item);
                      const avail = availableQty(item);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <td className="p-4">
                            <div className="flex items-center gap-3 font-bold text-[var(--text-heading)]">
                              <Package size={16} className="text-[var(--text-muted)] shrink-0" /> {item.item}
                            </div>
                            <div className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5 ml-7">
                              {item.category}
                              {item.remarks && <span className="text-amber-600 dark:text-amber-400"> · {item.remarks}</span>}
                            </div>
                          </td>
                          <td className="p-4 text-[var(--text-muted)] font-semibold whitespace-nowrap">{item.location}</td>
                          <td className="p-4">
                            <Stepper
                              value={item.qty}
                              min={(item.qtyIssued || 0) + (item.qtyDamaged || 0)}
                              onChange={(qty) => patchItem(item.id, { qty })}
                            />
                            <div className="text-[10px] text-[var(--text-muted)] text-center mt-1">min {item.minQty}</div>
                          </td>
                          <td className="p-4">
                            <Stepper
                              value={item.qtyIssued}
                              min={0}
                              max={item.qty - (item.qtyDamaged || 0)}
                              onChange={(qtyIssued) => patchItem(item.id, { qtyIssued })}
                            />
                          </td>
                          <td className="p-4">
                            <Stepper
                              value={item.qtyDamaged}
                              min={0}
                              max={item.qty - (item.qtyIssued || 0)}
                              onChange={(qtyDamaged) => patchItem(item.id, { qtyDamaged })}
                            />
                          </td>
                          <td className="p-4 text-center font-bold text-[var(--text-heading)]">{avail}</td>
                          <td className="p-4">
                            <select
                              value={item.condition}
                              onChange={(e) => patchItem(item.id, { condition: e.target.value as any })}
                              className="px-2.5 py-1 text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border)] rounded-lg focus:outline-none"
                            >
                              {CONDITIONS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </td>
                            {status === "ok" && <CheckCircle2 size={18} className="text-green-500 inline-block" />}
                            {status === "warning" && <AlertCircle size={18} className="text-amber-500 inline-block" />}
                            {status === "critical" && <AlertCircle size={18} className="text-red-500 inline-block" />}
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {loaded && filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-10 text-center text-[var(--text-muted)]">
                          {items.length === 0 ? 'No equipment yet — use "Add Item" or "Import Defaults" to get started.' : "No items match the current filter."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filtered.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-xs font-semibold mt-4">
                <span className="text-slate-500 dark:text-slate-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white shadow-sm"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Damaged & repairs tab ──────────────────────────────── */}
        {tab === "damaged" && (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 font-bold">Item</th>
                    <th className="p-4 font-bold">Condition</th>
                    <th className="p-4 font-bold text-center">Damaged Units</th>
                    <th className="p-4 font-bold">Remarks</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {damagedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4">
                        <div className="font-bold text-[var(--text-heading)]">{item.item}</div>
                        <div className="text-[11px] font-semibold text-[var(--text-muted)]">{item.category} · {item.location}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.condition === "Damaged" ? TONES.red : item.condition === "Needs Repair" ? TONES.amber : TONES.slate
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="p-4 text-center font-black text-red-500">{item.qtyDamaged}</td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold max-w-[220px]">
                        <div className="truncate" title={item.remarks}>{item.remarks || "—"}</div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        {item.qtyDamaged > 0 && (
                          <>
                            <button
                              onClick={() => patchItem(item.id, {
                                qtyDamaged: item.qtyDamaged - 1,
                                ...(item.qtyDamaged - 1 === 0 && item.condition === "Needs Repair" ? { condition: "Good" as const } : {}),
                              })}
                              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                              title="One unit repaired and back in stock"
                            >
                              Repaired +1
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Write off ${item.qtyDamaged} damaged unit(s) of "${item.item}"? Total stock reduces accordingly.`)) {
                                  patchItem(item.id, {
                                    qty: Math.max(0, item.qty - item.qtyDamaged),
                                    qtyDamaged: 0,
                                    ...(item.condition === "Damaged" ? { condition: "Good" as const } : {}),
                                  });
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                              title="Discard damaged units and reduce total stock"
                            >
                              Write Off
                            </button>
                          </>
                        )}
                        {item.qtyDamaged === 0 && (
                          <button
                            onClick={() => patchItem(item.id, { condition: "Good" })}
                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                            title="Mark the item's condition as Good"
                          >
                            Mark Repaired
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {loaded && damagedItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-[var(--text-muted)]">
                        No damaged equipment — everything is in working order. 🎉
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Requests tab ───────────────────────────────────────── */}
        {tab === "requests" && (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 font-bold">Request</th>
                    <th className="p-4 font-bold">Type</th>
                    <th className="p-4 font-bold text-center">Qty</th>
                    <th className="p-4 font-bold">Requested By</th>
                    <th className="p-4 font-bold">Dates</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4">
                        <div className="font-bold text-[var(--text-heading)]">{req.item}</div>
                        <div className="text-[11px] font-semibold text-[var(--text-muted)] max-w-[240px] truncate" title={req.purpose}>
                          {req.purpose || "—"}
                          {req.notes && <span> · {req.notes}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${req.type === "Issue" ? TONES.blue : TONES.slate}`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="p-4 text-center font-black">{req.qty}</td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold max-w-[180px]">
                        <div className="truncate" title={req.requestedBy}>{req.requestedBy || "—"}</div>
                      </td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold whitespace-nowrap text-xs">
                        <div>Raised {req.date || "—"}</div>
                        {req.neededBy && <div className="flex items-center gap-1 mt-0.5"><CalendarClock size={11} /> Needed {req.neededBy}</div>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TONES[STATUS_TONE[req.status]]}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                        {req.status === "Pending" ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5">
                            <Clock size={12} className="text-amber-500" /> Awaiting HM Approval
                          </span>
                        ) : (
                          nextRequestStatuses(req)
                            .filter((s) => s !== "Approved" && s !== "Rejected")
                            .map((s) => (
                              <button
                                key={s}
                                onClick={() => advanceRequest(req, s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${
                                  s === "Issued" || s === "Received" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                                title={
                                  s === "Issued" ? "Hand over the equipment (marks units as issued)"
                                  : s === "Returned" ? "Equipment returned to stock"
                                  : s === "Received" ? "Purchase received (adds units to stock)"
                                  : `Mark request as ${s.toLowerCase()}`
                                }
                              >
                                {STATUS_ACTION[s]}
                              </button>
                            ))
                        )}
                        <button onClick={() => setDeletingRequest(req)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete request">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {loaded && requests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-[var(--text-muted)]">
                        No equipment requests yet — use "New Request" to raise one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── First aid tab ──────────────────────────────────────── */}
        {tab === "firstaid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {firstAidItems.map((item) => {
              const avail = availableQty(item);
              const expired = isExpired(item);
              const soon = expiresSoon(item);
              const low = avail < item.minQty;
              return (
                <div key={item.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
                        <Cross size={18} className="text-red-500" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-heading)]">{item.item}</div>
                        <div className="text-[11px] font-semibold text-[var(--text-muted)]">{item.location}</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${low ? TONES.red : TONES.green}`}>
                      {avail} in stock
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.expiryDate && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        expired ? TONES.red : soon ? TONES.amber : TONES.green
                      }`}>
                        <CalendarClock size={10} />
                        {expired ? `Expired ${item.expiryDate}` : soon ? `Expires soon · ${item.expiryDate}` : `Expiry ${item.expiryDate}`}
                      </span>
                    )}
                    {low && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TONES.red}`}>Below minimum ({item.minQty})</span>}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TONES.slate}`}>Checked {item.lastChecked || "—"}</span>
                  </div>

                  {item.remarks && (
                    <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{item.remarks}</div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-light)]">
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Restock</span>
                    <Stepper value={item.qty} min={(item.qtyIssued || 0) + (item.qtyDamaged || 0)} onChange={(qty) => patchItem(item.id, { qty })} />
                  </div>
                </div>
              );
            })}
            {loaded && firstAidItems.length === 0 && (
              <div className="col-span-full p-10 text-center text-[var(--text-muted)] bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
                No first-aid stock tracked yet — add items under the "First Aid" category.
              </div>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <AddItemModal
          onClose={() => setShowAdd(false)}
          onAdd={(item) => {
            addRequest({
              type: "Purchase",
              item: item.item,
              category: item.category,
              qty: item.qty,
              requestedBy: "PET Staff",
              purpose: `Stock Addition - ${item.location}${item.remarks ? ` (${item.remarks})` : ""}`,
              date: today(),
              notes: item.remarks,
            });
            setShowAdd(false);
            setTab("requests");
          }}
        />
      )}

      {showRequest && (
        <NewRequestModal
          items={items}
          onClose={() => setShowRequest(false)}
          onAdd={(req) => {
            addRequest(req);
            setShowRequest(false);
            setTab("requests");
          }}
        />
      )}

      {/* Delete Item Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Remove Inventory Item</h3>
              <p className="text-xs text-slate-500">Are you sure you want to remove &quot;{deletingItem.item}&quot; from the inventory?</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeRemoveItem(deletingItem);
                  setDeletingItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Request Confirmation Modal */}
      {deletingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Equipment Request</h3>
              <p className="text-xs text-slate-500">Are you sure you want to delete the request for &quot;{deletingRequest.item}&quot;?</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingRequest(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeRemoveRequest(deletingRequest);
                  setDeletingRequest(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon, color, bg, label, value, sub,
}: {
  icon: React.ElementType; color: string; bg: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
        <div className="text-2xl font-black text-[var(--text-heading)] mt-0.5">{value}</div>
        <div className="text-xs font-semibold text-[var(--text-muted)] mt-0.5 truncate">{sub}</div>
      </div>
    </div>
  );
}

function Stepper({
  value, min = 0, max, tone, onChange,
}: {
  value: number; min?: number; max?: number; tone?: "red"; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 justify-center">
      <button
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
        className="p-1 rounded-md border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
        title="Decrease"
      >
        <Minus size={12} />
      </button>
      <span className={`font-bold w-7 text-center ${tone === "red" && value > 0 ? "text-red-500" : ""}`}>{value}</span>
      <button
        onClick={() => (max === undefined || value < max) && onChange(value + 1)}
        disabled={max !== undefined && value >= max}
        className="p-1 rounded-md border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
        title="Increase"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add item modal
// ---------------------------------------------------------------------------

function AddItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, "id" | "lastChecked" | "qtyIssued" | "qtyDamaged">) => void;
}) {
  const [item, setItem] = useState("");
  const [category, setCategory] = useState<StockCategory>("Ball Games");
  const [qty, setQty] = useState(1);
  const [minQty, setMinQty] = useState(1);
  const [condition, setCondition] = useState<InventoryItem["condition"]>("New");
  const [location, setLocation] = useState("Sports Room A");
  const [expiryDate, setExpiryDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      item, category, qty, minQty, condition, location,
      expiryDate: expiryDate || undefined,
      remarks: remarks || undefined,
    });
  };

  return (
    <ModalShell title="Add New Equipment Item (Requires HM Approval)" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Item Name">
          <input required value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Hockey Stick" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as StockCategory)} className={inputCls}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Condition">
            <select value={condition} onChange={(e) => setCondition(e.target.value as InventoryItem["condition"])} className={inputCls}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantity">
            <input required type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Low-stock Threshold">
            <input required type="number" min={0} value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
        <Field label="Storage Location">
          <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Sports Room A" className={inputCls} />
        </Field>
        {category === "First Aid" && (
          <Field label="Expiry Date (consumables)">
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputCls} />
          </Field>
        )}
        <Field label="Remarks (optional)">
          <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Reorder before Sports Day" className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          Submit Request for Approval
        </button>
      </form>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// New equipment request modal — issue existing stock or purchase new items
// ---------------------------------------------------------------------------

function NewRequestModal({
  items,
  onClose,
  onAdd,
}: {
  items: InventoryItem[];
  onClose: () => void;
  onAdd: (req: Omit<EquipmentRequest, "id" | "status">) => void;
}) {
  const [type, setType] = useState<EquipmentRequest["type"]>("Issue");
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [qty, setQty] = useState(1);
  const [requestedBy, setRequestedBy] = useState("");
  const [purpose, setPurpose] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [notes, setNotes] = useState("");

  const linked = items.find((i) => i.id === itemId);
  const maxIssue = linked ? availableQty(linked) : undefined;

  const [reqCategory, setReqCategory] = useState<StockCategory>("Ball Games");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = type === "Issue" ? (linked?.item || itemName || itemId) : itemName;
    if (!name) return;
    onAdd({
      type,
      item: name,
      itemId: type === "Issue" && linked ? itemId : undefined,
      category: linked?.category || reqCategory,
      qty,
      requestedBy,
      purpose,
      date: today(),
      neededBy: neededBy || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <ModalShell title="New Equipment Request" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Request Type">
          <div className="grid grid-cols-2 gap-2">
            {(["Issue", "Purchase"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  type === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-blue-400"
                }`}
              >
                {t === "Issue" ? "Issue from Stock" : "New Purchase"}
              </button>
            ))}
          </div>
        </Field>

        {type === "Issue" ? (
          <Field label="Equipment">
            <select
              required
              value={itemId}
              onChange={(e) => {
                const val = e.target.value;
                setItemId(val);
                const linkedItem = items.find((i) => i.id === val);
                if (linkedItem) {
                  setItemName(linkedItem.item);
                  if (linkedItem.category) setReqCategory(linkedItem.category);
                } else {
                  setItemName(val);
                }
              }}
              className={inputCls}
            >
              <option value="" disabled>Select equipment...</option>
              {items.length > 0
                ? items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.item} ({i.category}) — {availableQty(i)} available
                    </option>
                  ))
                : STANDARD_EQUIPMENT_LIST.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
            </select>
          </Field>
        ) : (
          <Field label="Item to Purchase">
            <input required value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Hockey Sticks (Junior)" className={inputCls} />
          </Field>
        )}

        <Field label="Category">
          <select value={reqCategory} onChange={(e) => setReqCategory(e.target.value as StockCategory)} className={inputCls}>
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={`Quantity${maxIssue !== undefined ? ` (max ${maxIssue})` : ""}`}>
            <input
              required type="number" min={1}
              max={type === "Issue" ? maxIssue : undefined}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Needed By (optional)">
            <input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Requested By">
          <input required value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="e.g. Class 9A, Red House, U-19 Team" className={inputCls} />
        </Field>
        <Field label="Purpose">
          <input required value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. District tournament practice" className={inputCls} />
        </Field>
        <Field label="Notes (optional)">
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Return after Sports Day" className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
          Submit Request
        </button>
      </form>
    </ModalShell>
  );
}
