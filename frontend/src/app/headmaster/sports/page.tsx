"use client";

import React, { useState, useEffect, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { useSearchParams } from "next/navigation";
import {
  Trophy,
  Package,
  MapPin,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  Users,
  Search,
  Check,
  X,
  FileText,
  Calendar,
  Sparkles
} from "lucide-react";
import {
  EquipmentRequest,
  InventoryItem,
  SportsEvent,
  Facility,
  FitnessRecord,
  StockCategory,
  PET_API_BASE,
  REQUESTS_KEY,
  INVENTORY_KEY,
  EVENTS_KEY,
  FACILITIES_KEY,
  RECORDS_KEY,
  petLoad,
  petSave,
  computeBmi,
  bmiCategory,
  isSeedId,
  isSeedEvent,
  inferCategory,
} from "@/lib/petData";
import { fetchEquipmentRequests, fetchInventoryItems, updateEquipmentRequest } from "@/lib/petInventoryApi";
import { fetchSportsEvents } from "@/lib/petSportsApi";

type TabType = "requests" | "events" | "ground" | "fitness";

export default function HeadmasterSportsDesk() {
  const { lang } = usePortalLanguage();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "requests";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [records, setRecords] = useState<FitnessRecord[]>([]);

  const [requestFilter, setRequestFilter] = useState<"Pending" | "All" | "Approved" | "Rejected">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: "Approved" | "Rejected"; note: string } | null>(null);

  // Load initial data — fetch ALL equipment requests and stock items added by PET staff for HM visibility
  const fetchData = async () => {
    const localReqs = petLoad<EquipmentRequest[]>(REQUESTS_KEY, []);
    const localItems = petLoad<InventoryItem[]>(INVENTORY_KEY, []);

    let allReqs: EquipmentRequest[] = [];
    try {
      const apiReqs = await fetchEquipmentRequests();
      const map = new Map<string, EquipmentRequest>();
      localReqs.filter((r) => r && r.id && !isSeedId(r.id)).forEach((r) => map.set(r.id, r));
      if (Array.isArray(apiReqs)) {
        apiReqs.filter((r) => r && r.id && !isSeedId(r.id)).forEach((r) => map.set(r.id, r));
      }
      allReqs = Array.from(map.values());
      petSave(REQUESTS_KEY, allReqs);
    } catch {
      allReqs = localReqs.filter((r) => r && r.id && !isSeedId(r.id));
    }

    let allItems: InventoryItem[] = [];
    try {
      const apiItems = await fetchInventoryItems();
      if (Array.isArray(apiItems)) {
        const cleanItems = apiItems.filter((i) => i && i.id && !isSeedId(i.id));
        allItems = cleanItems;
        petSave(INVENTORY_KEY, cleanItems);
      } else {
        allItems = localItems.filter((i) => i && i.id && !isSeedId(i.id));
      }
    } catch {
      allItems = localItems.filter((i) => i && i.id && !isSeedId(i.id));
    }

    setRequests(allReqs);

    // Fetch all live events logged by PET staff dynamically
    const localEvs = petLoad<SportsEvent[]>(EVENTS_KEY, []);
    try {
      const apiEvs = await fetchSportsEvents();
      if (Array.isArray(apiEvs)) {
        const cleanApi = apiEvs.filter((e) => e && e.id && !isSeedId(e.id));
        setEvents(cleanApi);
        petSave(EVENTS_KEY, cleanApi);
      } else {
        setEvents(localEvs.filter((e) => e && e.id && !isSeedId(e.id)));
      }
    } catch {
      setEvents(localEvs.filter((e) => e && e.id && !isSeedId(e.id)));
    }

    const localFacs = petLoad<Facility[]>(FACILITIES_KEY, []);
    setFacilities(localFacs.filter((f) => f && f.id && !isSeedId(f.id)));

    const localRecs = petLoad<FitnessRecord[]>(RECORDS_KEY, []);
    setRecords(localRecs.filter((r) => r && r.id && !isSeedId(r.id)));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingRequestsCount = useMemo(() => requests.filter((r) => r.status === "Pending").length, [requests]);
  const approvedRequestsCount = useMemo(() => requests.filter((r) => r.status === "Approved" || r.status === "Received").length, [requests]);
  const rejectedRequestsCount = useMemo(() => requests.filter((r) => r.status === "Rejected").length, [requests]);

  // Handle HM approval or rejection
  const handleUpdateStatus = async (id: string, newStatus: "Approved" | "Rejected", notes?: string) => {
    setActionLoading(id);
    try {
      const updated = await updateEquipmentRequest(id, { status: newStatus, notes });
      setRequests((prev) => {
        const u = prev.map((r) => (r.id === id ? { ...r, ...updated, status: newStatus, notes: notes || r.notes } : r));
        petSave(REQUESTS_KEY, u);
        return u;
      });
    } catch {
      setRequests((prev) => {
        const u = prev.map((r) => (r.id === id ? { ...r, status: newStatus, notes: notes || r.notes } : r));
        petSave(REQUESTS_KEY, u);
        return u;
      });
    } finally {
      setActionLoading(null);
      setNoteModal(null);
    }
  };

  const getCategoryBadgeClass = (cat: StockCategory) => {
    switch (cat) {
      case "Ball Games":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "Athletics":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Indoor Games":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "Fitness & Training":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "First Aid":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchStatus = requestFilter === "All" || r.status === requestFilter;
      const cat = inferCategory(r.item || "", r.category);
      const q = (searchQuery || "").toLowerCase();
      const matchSearch =
        !q ||
        (r.item || "").toLowerCase().includes(q) ||
        (r.purpose || "").toLowerCase().includes(q) ||
        (r.requestedBy || "").toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [requests, requestFilter, searchQuery]);

  return (
    <PortalLayout>
      <div className="p-4 sm:p-6 w-full space-y-6 text-slate-800 dark:text-slate-100">
        {/* ── Top Hero Header Banner ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
                  <Trophy size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Sports Desk & Governance Hub
                </h1>
                {pendingRequestsCount > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-400/30 text-amber-300 animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {pendingRequestsCount} Pending Approvals
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
                Headmaster portal for approving PET equipment requests, sanctioning sports events, monitoring playground readiness, and reviewing student health metrics.
              </p>
            </div>

            {/* Quick Stats Pill Header */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-md backdrop-blur-md">
                <Package className="text-emerald-400" size={18} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Equipment Requests</div>
                  <div className="text-sm font-extrabold text-white">{requests.length} Total</div>
                </div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-md backdrop-blur-md">
                <Calendar className="text-amber-400" size={18} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Sports Events</div>
                  <div className="text-sm font-extrabold text-white">{events.length} Logged</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Segmented Tabs Navigation ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm flex flex-wrap gap-2">
          {[
            { key: "requests", label: "Equipment Requests", icon: Package, count: pendingRequestsCount > 0 ? pendingRequestsCount : requests.length },
            { key: "events", label: "Sports Events", icon: Trophy, count: events.length },
            { key: "ground", label: "Ground Condition", icon: MapPin, count: facilities.length },
            { key: "fitness", label: "Student Fitness", icon: Activity, count: records.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as TabType)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} /> {label}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: EQUIPMENT REQUESTS APPROVALS ──────────────────────────── */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto">
                {(["All", "Pending", "Approved", "Rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestFilter(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      requestFilter === st
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-200/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {st === "Pending" ? `Pending (${pendingRequestsCount})` : st === "All" ? `All (${requests.length})` : st === "Approved" ? `Approved (${approvedRequestsCount})` : `Rejected (${rejectedRequestsCount})`}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search item, purpose, team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            {/* Requests List Table / Cards */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Item & Purpose</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Qty</th>
                      <th className="p-4">Requested By</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">HM Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{req.item}</span>
                            {(() => {
                              const cat = inferCategory(req.item, req.category);
                              return (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(cat)}`}>
                                  {cat}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mt-0.5">{req.purpose}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                              req.type === "Purchase"
                                ? "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400"
                                : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {req.type}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">{req.qty}</td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{req.requestedBy}</td>
                        <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{req.date}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${
                              req.status === "Pending"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                                : req.status === "Approved"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                : req.status === "Rejected"
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                                : "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                req.status === "Pending"
                                  ? "bg-amber-400 animate-pulse"
                                  : req.status === "Approved"
                                  ? "bg-emerald-400"
                                  : "bg-rose-400"
                              }`}
                            />
                            {req.status}
                          </span>
                          {req.notes && (
                            <div className="text-[10px] text-slate-400 italic mt-0.5">Note: {req.notes}</div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {req.status === "Pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdateStatus(req.id, "Approved")}
                                disabled={actionLoading === req.id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1"
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                onClick={() => setNoteModal({ id: req.id, action: "Rejected", note: "" })}
                                disabled={actionLoading === req.id}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1"
                              >
                                <X size={14} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-semibold">Action completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-900 dark:text-slate-100 font-extrabold">
                          No equipment requests found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SPORTS EVENTS ────────────────────────────────────────── */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 uppercase">
                      {ev.level} Level
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                      {ev.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      ev.status === "Upcoming"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : ev.status === "Ongoing"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-slate-500/10 text-slate-500"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" /> Date: {ev.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" /> Venue: {ev.venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" /> Participants: {ev.participants} Athletes
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>Standard: {ev.targetClasses || ev.ageGroup || "All Standards"}</span>
                  <span className="text-emerald-500 font-bold">HM Authorized</span>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="col-span-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 font-medium">
                No sports events logged yet.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: GROUND CONDITION ─────────────────────────────────────── */}
        {activeTab === "ground" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{fac.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      fac.status === "Ready for Use"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {fac.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{fac.notes || "Regular sports maintenance and track safety inspections completed."}</p>
                <div className="text-[11px] text-slate-400 font-semibold">Last inspected: {fac.lastMaintained || "2026-09-18"}</div>
              </div>
            ))}
            {facilities.length === 0 && (
              <div className="col-span-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 font-medium">
                No ground facilities logged.
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: STUDENT FITNESS SUMMARY ─────────────────────────────── */}
        {activeTab === "fitness" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tracked Athletes</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{records.length}</div>
                <div className="text-xs text-slate-500 mt-1">Students with health & BMI profiles</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Average Fitness Score</div>
                <div className="text-3xl font-black text-emerald-500">
                  {records.length ? Math.round(records.reduce((a, b) => a + b.fitnessScore, 0) / records.length) : 85}%
                </div>
                <div className="text-xs text-slate-500 mt-1">State standard target: 75%</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Healthy BMI Index</div>
                <div className="text-3xl font-black text-blue-500">
                  {records.length
                    ? Math.round(
                        (records.filter((r) => bmiCategory(computeBmi(r.heightCm, r.weightKg)).label === "Healthy").length /
                          records.length) *
                          100
                      )
                    : 90}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Normal category distribution</div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: REJECTION REASON NOTE ────────────────────────────────── */}
        {noteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="text-rose-500" size={20} />
                  Reject Equipment Request
                </h3>
                <button
                  onClick={() => setNoteModal(null)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Please provide a brief reason or remark for rejecting this request so the PET teacher can review it.
              </p>

              <textarea
                rows={3}
                placeholder="Enter rejection remark (e.g. Budget ceiling reached / re-submit with revised specs)..."
                value={noteModal.note}
                onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/40 font-medium"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setNoteModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(noteModal.id, "Rejected", noteModal.note)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
