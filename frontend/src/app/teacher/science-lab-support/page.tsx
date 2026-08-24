"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";
import {
  Beaker,
  Settings,
  AlertTriangle,
  Wrench,
  ClipboardCheck,
  Package,
  PlusCircle,
  FileText,
  Search,
  Eye,
  Microscope,
  Zap,
  Flame,
  X,
  Trash2,
  CheckCircle,
  MapPin,
  Construction,
  Hash,
  Stethoscope,
  Filter,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  Square,
  Clock,
  UserCheck,
  AlertCircle
} from "lucide-react";

interface InventoryItem {
  id: string;
  item: string;
  status: string;
  count: number;
  location: string;
  icon: React.ReactNode;
  color: string;
  duplicateIds?: string[];
  raw: any;
}

interface MaintenanceTicket {
  id: string;
  itemName: string;
  issue: string;
  location: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Pending" | "In Repair" | "Resolved";
  reportedDate: string;
  reportedBy: string;
}

interface SafetyCheckItem {
  id: string;
  titleEn: string;
  titleTa: string;
  checked: boolean;
}

function MaintenanceTicketItem({
  ticket,
  isTamil,
  isHeadmasterView,
  onStatusChange
}: {
  ticket: MaintenanceTicket;
  isTamil: boolean;
  isHeadmasterView?: boolean;
  onStatusChange: (id: string, newStatus: "Pending" | "In Repair" | "Resolved") => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<"Pending" | "In Repair" | "Resolved">(ticket.status);

  useEffect(() => {
    setSelectedStatus(ticket.status);
  }, [ticket.status]);

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1 text-left flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {ticket.itemName}
          </span>
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
              ticket.severity === "Critical"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : ticket.severity === "High"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {ticket.severity} Severity
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              ticket.status === "Resolved"
                ? "bg-emerald-100 text-emerald-800"
                : ticket.status === "In Repair"
                ? "bg-indigo-100 text-indigo-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {ticket.status === "Pending" ? (isTamil ? "நிலுவையில் உள்ளது" : "Pending") : ticket.status}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          {ticket.issue}
        </p>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" /> {ticket.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> {ticket.reportedDate}
          </span>
          <span className="flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-slate-400" /> {ticket.reportedBy}
          </span>
        </div>
      </div>

      {!isHeadmasterView ? (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Pending">{isTamil ? "நிலுவையில் உள்ளது" : "Pending"}</option>
            <option value="In Repair">{isTamil ? "பழுதுபார்க்கப்படுகிறது" : "In Repair"}</option>
            <option value="Resolved">{isTamil ? "சரி செய்யப்பட்டது" : "Resolved"}</option>
          </select>

          {selectedStatus === "Pending" && (
            <button
              onClick={() => onStatusChange(ticket.id, "Pending")}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 text-xs font-bold rounded-xl transition-all shrink-0"
            >
              ⏳ {isTamil ? "நிலுவையில் மாற்று" : "Mark as Pending"}
            </button>
          )}

          {selectedStatus === "In Repair" && (
            <button
              onClick={() => onStatusChange(ticket.id, "In Repair")}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 text-xs font-bold rounded-xl transition-all shrink-0"
            >
              ⚙️ {isTamil ? "பழுதுபார்க்க மாற்று" : "Mark as In Repair"}
            </button>
          )}

          {selectedStatus === "Resolved" && (
            <button
              onClick={() => onStatusChange(ticket.id, "Resolved")}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 text-xs font-bold rounded-xl transition-all shrink-0"
            >
              ✓ {isTamil ? "சரி செய்யப்பட்டது" : "Mark as Resolved"}
            </button>
          )}
        </div>
      ) : (
        <div className="shrink-0 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          {isTamil ? "ஆசிரியர் பதிவு செய்தது" : "Logged by Teacher"}
        </div>
      )}
    </div>
  );
}

export default function ScienceLabSupportPage() {
  const { lang } = usePortalLanguage();
  const isTamil = lang === "தமிழ்";
  const { data: session } = useSession();
  const pathname = usePathname();
  const isHeadmasterView =
    pathname?.startsWith("/headmaster") ||
    (session?.user as any)?.role === "HEADMASTER";
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Maintenance Tickets State (Dynamic - No hardcoded static data)
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [userLoggedTickets, setUserLoggedTickets] = useState<MaintenanceTicket[]>([]);

  // Dynamically compute maintenance tickets from DB items with 'Needs Maintenance' status + user logged tickets
  const maintenanceTickets = useMemo(() => {
    const dbTickets: MaintenanceTicket[] = inventory
      .filter((i) => i.status === "Needs Maintenance")
      .map((i) => ({
        id: `db-${i.id}`,
        itemName: i.item,
        issue: `${i.item} flagged as requiring maintenance. Location: ${i.location}`,
        location: i.location,
        severity: "High" as const,
        status: "Pending" as const,
        reportedDate: new Date().toISOString().split("T")[0],
        reportedBy: "Science Lab"
      }));

    return [...dbTickets, ...userLoggedTickets];
  }, [inventory, userLoggedTickets]);

  // Safety Protocols Checklist State
  const [safetyChecklist, setSafetyChecklist] = useState<SafetyCheckItem[]>([
    { id: "sc-1", titleEn: "Eye-wash fountain water pressure & First-Aid kit verified", titleTa: "கண் கழுவும் நீரடைப்பு மற்றும் முதலுதவி பெட்டி சரிபார்க்கப்பட்டது", checked: true },
    { id: "sc-2", titleEn: "Master gas supply shutoff valve tested and clear", titleTa: "முக்கிய எரிவாயு வால்வு அடைப்பு சோதிக்கப்பட்டு தெளிவாக உள்ளது", checked: true },
    { id: "sc-3", titleEn: "CO₂ Fire Extinguisher pressure gauge verified (Green zone)", titleTa: "தீயணைப்பு கருவியின் அழுத்த அளவு சரிபார்க்கப்பட்டது", checked: true },
    { id: "sc-4", titleEn: "Fume hood suction ventilation operational", titleTa: "புகை உறிஞ்சும் காற்றோட்ட சாதனம் இயங்குகிறது", checked: false },
    { id: "sc-5", titleEn: "Chemical and glass waste disposal bins clearly labeled", titleTa: "வேதியியல் மற்றும் கண்ணாடி கழிவுத் தொட்டிகள் லேபிளிடப்பட்டுள்ளன", checked: true }
  ]);

  const verifiedSafetyCount = useMemo(() => safetyChecklist.filter((s) => s.checked).length, [safetyChecklist]);

  // Helper to map backend LabEquipment to UI InventoryItem
  const mapApiItemToInventoryItem = (apiItem: any): InventoryItem => {
    let icon = <Package className="w-5 h-5" />;
    let color = "indigo";
    const nameLower = (apiItem.name || "").toLowerCase();

    if (nameLower.includes("microscope")) {
      icon = <Microscope className="w-5 h-5" />;
      color = "emerald";
    } else if (nameLower.includes("burner") || nameLower.includes("flame") || nameLower.includes("fire")) {
      icon = <Flame className="w-5 h-5" />;
      color = "rose";
    } else if (nameLower.includes("beaker") || nameLower.includes("flask") || nameLower.includes("tube") || nameLower.includes("glass")) {
      icon = <Beaker className="w-5 h-5" />;
      color = "amber";
    } else if (nameLower.includes("goggles") || nameLower.includes("eye") || nameLower.includes("safety")) {
      icon = <Eye className="w-5 h-5" />;
      color = "blue";
    }

    return {
      id: apiItem.id,
      item: apiItem.name,
      status: apiItem.status || "Good",
      count: apiItem.count || 1,
      location: apiItem.location || "N/A",
      icon,
      color,
      duplicateIds: apiItem.duplicateIds || [apiItem.id],
      raw: apiItem
    };
  };

  // Fetch Inventory from DB with deduplication/grouping by item name
  const fetchInventory = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const groupedMap = new Map<string, any>();

        data.data.forEach((apiItem: any) => {
          const normName = (apiItem.name || "").trim();
          const key = normName.toLowerCase();

          if (groupedMap.has(key)) {
            const existing = groupedMap.get(key);
            existing.count += (apiItem.count || 1);
            if ((!existing.location || existing.location === "N/A") && apiItem.location) {
              existing.location = apiItem.location;
            }
            existing.duplicateIds.push(apiItem.id);
          } else {
            groupedMap.set(key, {
              ...apiItem,
              name: normName,
              count: apiItem.count || 1,
              duplicateIds: [apiItem.id]
            });
          }
        });

        const deduplicatedList = Array.from(groupedMap.values());
        setInventory(deduplicatedList.map(mapApiItemToInventoryItem));
      }
    } catch (err) {
      console.error("Error fetching lab inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_URL]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handle Add or Edit Save
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const item = formData.get("item") as string;
    const location = formData.get("location") as string;
    const count = parseInt(formData.get("count") as string) || 1;
    const status = formData.get("status") as string;

    const payload = {
      name: item,
      location,
      count,
      status,
      classSection: currentItem?.raw?.classSection || "Science Lab",
      date: currentItem?.raw?.date || new Date().toLocaleDateString("en-IN"),
      safetyCheck: true,
      schoolId
    };

    try {
      if (isEdit && currentItem) {
        const res = await fetch(`${API_URL}/api/teacher/labs/${currentItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: isTamil ? "உபகரணம் புதுப்பிக்கப்பட்டது!" : "Equipment Updated!",
            text: `${item} ${isTamil ? "வெற்றிகரமாக புதுப்பிக்கப்பட்டது." : "successfully updated."}`,
            confirmButtonColor: "#10b981"
          });
          fetchInventory();
        }
      } else {
        const res = await fetch(`${API_URL}/api/teacher/labs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: isTamil ? "உபகரணம் சேர்க்கப்பட்டது!" : "Equipment Added!",
            text: `${item} ${isTamil ? "ஆய்வக இருப்பில் சேர்க்கப்பட்டது." : "added to lab inventory."}`,
            confirmButtonColor: "#10b981"
          });
          fetchInventory();
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving lab equipment:", error);
      Swal.fire({
        icon: "error",
        title: isTamil ? "சேமிக்க முடியவில்லை" : "Save Failed",
        text: "Could not save the item. Please try again.",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  // Handle Delete
  const handleDeleteItem = async (id: string, name: string, duplicateIds?: string[]) => {
    const idsToDelete = duplicateIds && duplicateIds.length > 0 ? duplicateIds : [id];
    const confirm = await Swal.fire({
      title: `${isTamil ? "நீக்கவா" : "Remove"} ${name}?`,
      text: isTamil ? "இந்த உபகரணம் தரவுத்தளத்தில் இருந்து நிரந்தரமாக நீக்கப்படும்." : "This equipment entry will be permanently deleted from database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isTamil ? "ஆம், நீக்கு" : "Yes, delete it",
      cancelButtonText: isTamil ? "ரத்து" : "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#475569"
    });

    if (confirm.isConfirmed) {
      try {
        await Promise.all(
          idsToDelete.map((itemId) =>
            fetch(`${API_URL}/api/teacher/labs/${itemId}`, { method: "DELETE" })
          )
        );
        Swal.fire({
          icon: "success",
          title: isTamil ? "நீக்கப்பட்டது!" : "Deleted!",
          text: `${name} ${isTamil ? "நீக்கப்பட்டது." : "has been removed."}`,
          confirmButtonColor: "#10b981"
        });
        fetchInventory();
      } catch (err) {
        console.error("Error deleting lab equipment:", err);
        Swal.fire({
          icon: "error",
          title: isTamil ? "நீக்க முடியவில்லை" : "Deletion Failed",
          text: "An error occurred while deleting the item.",
          confirmButtonColor: "#ef4444"
        });
      }
    }
  };

  // Add new maintenance ticket
  const handleAddMaintenanceTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const itemName = formData.get("itemName") as string;
    const location = formData.get("location") as string;
    const severity = formData.get("severity") as any;
    const issue = formData.get("issue") as string;

    const newTicket: MaintenanceTicket = {
      id: `mkt-${Date.now()}`,
      itemName,
      location,
      severity,
      issue,
      status: "Pending",
      reportedDate: new Date().toISOString().split("T")[0],
      reportedBy: (session?.user as any)?.name || "Lab Teacher"
    };

    setUserLoggedTickets([newTicket, ...userLoggedTickets]);
    setMaintenanceModalOpen(false);
    Swal.fire({
      icon: "success",
      title: isTamil ? "பராமரிப்பு புகார் பதிவு செய்யப்பட்டது!" : "Maintenance Ticket Logged!",
      text: `${itemName} ${isTamil ? "பராமரிப்பு கோரிக்கை பதிவு செய்யப்பட்டது." : "has been logged for maintenance."}`,
      confirmButtonColor: "#10b981"
    });
  };

  const handleStatusChange = async (id: string, newStatus: "Pending" | "In Repair" | "Resolved") => {
    const dbStatus = newStatus === "Resolved" ? "Good" : "Needs Maintenance";

    if (id.startsWith("db-")) {
      const realDbId = id.replace("db-", "");
      const dbItem = inventory.find((i) => i.id === realDbId);
      if (dbItem) {
        const idsToUpdate =
          dbItem.duplicateIds && dbItem.duplicateIds.length > 0
            ? dbItem.duplicateIds
            : [realDbId];

        try {
          await Promise.all(
            idsToUpdate.map((itemId) =>
              fetch(`${API_URL}/api/teacher/labs/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...dbItem.raw, status: dbStatus })
              })
            )
          );
          await fetchInventory();
        } catch (err) {
          console.error("Error updating ticket status in DB:", err);
        }
      }
    } else {
      setUserLoggedTickets(
        userLoggedTickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }

    Swal.fire({
      icon: "success",
      title: isTamil ? "நிலை மாற்றப்பட்டது!" : "Status Updated!",
      text: `${isTamil ? "புதிய நிலை:" : "Ticket status updated to:"} ${newStatus}`,
      confirmButtonColor: "#10b981"
    });
  };

  const toggleSafetyCheck = (id: string) => {
    setSafetyChecklist(
      safetyChecklist.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setIsEdit(true);
    setCurrentItem(item);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentItem(null);
    setModalOpen(true);
  };

  // Dynamically extract unique locations from inventory
  const uniqueLocations = useMemo(() => {
    const locs = inventory.map((i) => i.location).filter(Boolean);
    return Array.from(new Set(locs));
  }, [inventory]);

  // Filter inventory based on search query, status, and location filters
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Good" && item.status !== "Needs Maintenance" && item.status !== "Low Stock") ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesLocation = locationFilter === "All" || item.location === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [inventory, searchQuery, statusFilter, locationFilter]);

  // Reset pagination when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, locationFilter]);

  // Pagination Slice
  const totalItems = filteredInventory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

  // Compute stat counts by summing up quantities (item.count)
  const brokenCount = inventory
    .filter((i) => i.status === "Needs Maintenance")
    .reduce((sum, item) => sum + item.count, 0);

  const lowStockCount = inventory
    .filter((i) => i.status === "Low Stock")
    .reduce((sum, item) => sum + item.count, 0);

  const totalCount = inventory.reduce((sum, item) => sum + item.count, 0);

  const goodCount = inventory
    .filter((i) => i.status !== "Needs Maintenance" && i.status !== "Low Stock")
    .reduce((sum, item) => sum + item.count, 0);

  const powerLevel = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 100;

  return (
    <PortalLayout
      title={isTamil ? "அறிவியல் ஆய்வக ஆதரவு" : "Science Lab Support"}
      subtitle={
        isTamil
          ? "ஆய்வக உபகரணங்களை நிர்வகித்து, பாதுகாப்பு மற்றும் பராமரிப்பு பதிவுகளைக் கண்காணியுங்கள்."
          : "Manage science laboratory inventory, track equipment maintenance, and enforce safety protocols."
      }
    >
      <div className="flex flex-col gap-6 text-left font-sans">
        {/* Top Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 rounded-xl shrink-0 border border-cyan-100 dark:border-cyan-900/50">
                <i className="fi fi-rr-flask text-xl" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  {isTamil ? "அறிவியல் ஆய்வக ஆதரவு மையம்" : "Science Lab Support Hub"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed max-w-2xl">
                  {isTamil
                    ? "ஆய்வக உபகரணங்கள், இரசாயன இருப்புகள், பழுதுபார்க்கும் பதிவுகள் மற்றும் பாதுகாப்பு நெறிமுறைகளை நிர்வகிக்கவும்."
                    : "Manage science laboratory inventory, track equipment repair tickets, and enforce safety audit protocols."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0 self-start md:self-auto">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{isTamil ? "தயார் நிலை" : "Operational"}</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{powerLevel}%</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{isTamil ? "உபகரணங்கள்" : "Total Items"}</span>
                <span className="text-base font-bold text-slate-800 dark:text-white mt-0.5">{totalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {isTamil ? "ஆய்வக நிலைப்பாடு" : "Lab Operational Readiness"}
              </p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {powerLevel}%
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {isTamil ? "பயன்பாட்டிற்கு தயார்" : "Ready for Lab Sessions"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/40 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {isTamil ? "பழுது / பராமரிப்பு" : "Maintenance Required"}
              </p>
              <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400">
                {brokenCount + maintenanceTickets.filter((t) => t.status !== "Resolved").length}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold mt-1 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                {isTamil ? "பழுதுபார்க்க வேண்டும்" : "Active Repair Tickets"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/40 shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {isTamil ? "பாதுகாப்பு சோதனை" : "Safety Checklist Status"}
              </p>
              <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {verifiedSafetyCount} / {safetyChecklist.length}
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isTamil ? "பாதுகாப்பு சோதனைகள் பூர்த்தி செய்யப்பட்டன" : "Protocols Verified"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/40 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800">
          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 mb-6 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "inventory"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Package className="w-4 h-4" />
              {isTamil ? "இருப்புப் பட்டியல்" : "Lab Inventory"}
            </button>

            <button
              onClick={() => setActiveTab("maintenance")}
              className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "maintenance"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              {isTamil ? "பராமரிப்புப் பதிவுகள்" : "Maintenance Logs"}
            </button>

            <button
              onClick={() => setActiveTab("safety")}
              className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === "safety"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              {isTamil ? "பாதுகாப்பு விதிகள்" : "Safety Protocols"}
            </button>
          </div>

          {/* TAB 1: INVENTORY CONTENT */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Search, Filter & Actions Toolbar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isTamil
                        ? "உபகரணம் அல்லது இடத்தை தேடுங்கள்..."
                        : "Search lab equipment, chemicals, location..."
                    }
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="All">{isTamil ? "அனைத்து நிலைகளும்" : "All Status"}</option>
                      <option value="Good">{isTamil ? "நல்ல நிலை (Good)" : "Good / Ready"}</option>
                      <option value="Low Stock">{isTamil ? "குறைந்த கையிருப்பு" : "Low Stock"}</option>
                      <option value="Needs Maintenance">{isTamil ? "பழுதுபார்க்கப்பட வேண்டியவை" : "Needs Maintenance"}</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="All">{isTamil ? "அனைத்து இடங்களும்" : "All Locations"}</option>
                      {uniqueLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset Filters button if filtered */}
                  {(searchQuery || statusFilter !== "All" || locationFilter !== "All") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("All");
                        setLocationFilter("All");
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-200/50 transition-colors"
                      title={isTamil ? "வடிகட்டிகளை மீட்டமை" : "Reset Filters"}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Add Equipment Button (Teacher Only) */}
                  {!isHeadmasterView && (
                    <button
                      onClick={handleOpenCreate}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{isTamil ? "புதிய உபகரணம் சேர்" : "Add Equipment"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Equipment Grid */}
              {loading ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-600 animate-spin mx-auto mb-3" />
                  <span>{isTamil ? "தரவுகள் ஏற்றப்படுகின்றன..." : "Loading lab inventory..."}</span>
                </div>
              ) : paginatedInventory.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paginatedInventory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/30">
                            {item.icon}
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              item.status === "Good" || item.status === "scheduled"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/40"
                                : item.status === "Low Stock"
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/40"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/40"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                          {item.item}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                          <span>{item.location}</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                            {isTamil ? "அளவு" : "Quantity"}
                          </span>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                            {item.count}
                          </span>
                        </div>

                        {!isHeadmasterView && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700"
                              title={isTamil ? "திருத்து" : "Edit"}
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.item, item.duplicateIds)}
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition-colors border border-rose-200/40"
                              title={isTamil ? "நீக்கு" : "Delete"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-14 text-slate-500 text-xs">
                  {isTamil
                    ? "தேடல் மற்றும் வடிகட்டலுக்கு பொருந்தும் உபகரணங்கள் எதுவும் இல்லை."
                    : "No equipment matches your search query and active filters."}
                </div>
              )}

              {/* PAGINATION CONTROLS */}
              {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500">
                    {isTamil ? (
                      <>
                        மொத்தம் <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> உபகரணங்களில்{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> முதல்{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200">{endIndex}</span> வரை காட்டப்படுகிறது
                      </>
                    ) : (
                      <>
                        Showing <span className="font-bold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200">{endIndex}</span> of{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> items
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>{isTamil ? "முந்தையது" : "Previous"}</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span>{isTamil ? "அடுத்தது" : "Next"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MAINTENANCE LOGS */}
          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {isTamil ? "ஆய்வக பராமரிப்பு மற்றும் பழுது பதிவுகள்" : "Equipment Maintenance & Repair Logs"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isTamil
                      ? "பழுதடைந்த உபகரணங்களை பதிவு செய்து பழுதுநீக்கக் கோரிக்கைகளை கண்காணியுங்கள்."
                      : "Log damaged equipment, request technical repairs, and track service history."}
                  </p>
                </div>

                {!isHeadmasterView && (
                  <button
                    onClick={() => setMaintenanceModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isTamil ? "பழுது புகார் பதிவு செய்" : "Log Repair Issue"}</span>
                  </button>
                )}
              </div>

              {/* Maintenance Tickets List */}
              {maintenanceTickets.length > 0 ? (
                <div className="space-y-3">
                  {maintenanceTickets.map((ticket) => (
                    <MaintenanceTicketItem
                      key={ticket.id}
                      ticket={ticket}
                      isTamil={isTamil}
                      isHeadmasterView={isHeadmasterView}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center text-slate-500 space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isTamil ? "பராமரிப்பு புகார்கள் எதுவும் இல்லை" : "No Active Maintenance Issues"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {isTamil
                      ? "அனைத்து ஆய்வக உபகரணங்களும் நல்ல நிலையில் இயங்குகின்றன."
                      : "All lab equipment is currently in good operational condition."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAFETY PROTOCOLS */}
          {activeTab === "safety" && (
            <div className="space-y-6 text-left">
              {/* Guidelines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <ShieldAlert className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      1. Personal Protective Equipment (PPE)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {isTamil
                      ? "ஆய்வக சோதனைகளின் போது பாதுகாப்பு கண்ணாடிகள், ஆய்வக கோட் மற்றும் பாதுகாப்பான காலணிகளை எப்போதும் அணியுங்கள்."
                      : "Always wear chemical safety goggles, laboratory coats, and closed-toe footwear during all practical experiments."}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <Flame className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      2. Chemical & Heat Handling
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {isTamil
                      ? "எரியும் பர்னர்களை கவனிக்காமல் விடாதீர்கள். அமிலத்தை தண்ணீரில் மட்டுமே மெதுவாக சேர்க்க வேண்டும்."
                      : "Never leave active Bunsen flames unattended. Always add acid slowly into water with constant stirring, never water into acid."}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      3. Biological Waste & Glass Disposal
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {isTamil
                      ? "உடைந்த கண்ணாடி பொருட்கள் மற்றும் உயிரியல் கழிவுகளை ஒதுக்கப்பட்ட கழிவுத் தொட்டிகளில் பாதுகாப்பாக அப்புறப்படுத்துங்கள்."
                      : "Dispose of broken glassware in dedicated puncture-proof containers; sterilize dissection specimens after practicals."}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      4. Emergency Response & Eyewash
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {isTamil
                      ? "கண் கழுவும் நீரடைப்பு மற்றும் CO₂ தீயணைப்புக் கருவிகளின் இருப்பிடத்தை அறிந்து அவசரக்காலத்தில் உடனடியாக செயல்படுங்கள்."
                      : "Locate eye-wash stations and CO₂ fire extinguishers. Flush affected skin/eyes with clean water for 15 minutes in case of spills."}
                  </p>
                </div>
              </div>

              {/* Interactive Daily Safety Checklist */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    {isTamil ? "தினசரி ஆய்வக பாதுகாப்பு சரிபார்ப்பு பட்டியல்" : "Daily Pre-Lab Safety Verification Checklist"}
                  </h4>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200/40">
                    {verifiedSafetyCount} / {safetyChecklist.length} Verified
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {safetyChecklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleSafetyCheck(item.id)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all text-left ${
                        item.checked
                          ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={item.checked ? "line-through opacity-80" : ""}>
                        {isTamil ? item.titleTa : item.titleEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Equipment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {isEdit
                  ? isTamil
                    ? "உபகரணத்தைத் திருத்து"
                    : "Modify Lab Equipment"
                  : isTamil
                  ? "புதிய உபகரணம் சேர்"
                  : "Add New Lab Equipment"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isTamil ? "உபகரணத்தின் பெயர்" : "Equipment Name"}
                </label>
                <input
                  required
                  name="item"
                  type="text"
                  defaultValue={currentItem?.item || ""}
                  placeholder="e.g. Compound Microscope / Glass Beaker"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isTamil ? "சேமிப்பிடம் / அலமாரி" : "Storage Location"}
                </label>
                <input
                  required
                  name="location"
                  type="text"
                  defaultValue={currentItem?.location || ""}
                  placeholder="e.g. Cabinet A / Shelf 2"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isTamil ? "எண்ணிக்கை" : "Quantity"}
                  </label>
                  <input
                    required
                    name="count"
                    type="number"
                    defaultValue={currentItem?.count || 1}
                    placeholder="1"
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isTamil ? "நிலை" : "Status"}
                  </label>
                  <select
                    required
                    name="status"
                    defaultValue={currentItem?.status || "Good"}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Good">{isTamil ? "நல்ல நிலை (Good)" : "Good / Ready"}</option>
                    <option value="Low Stock">{isTamil ? "குறைந்த கையிருப்பு" : "Low Stock"}</option>
                    <option value="Needs Maintenance">{isTamil ? "பழுது / பராமரிப்பு" : "Needs Repair"}</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {isTamil ? "ரத்து" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                >
                  {isTamil ? "சேமி" : "Save Equipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Maintenance Ticket Modal */}
      {maintenanceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {isTamil ? "பராமரிப்பு புகார் பதிவு செய்" : "Log Equipment Repair Ticket"}
              </h3>
              <button
                onClick={() => setMaintenanceModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaintenanceTicket} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isTamil ? "உபகரணத்தின் பெயர்" : "Equipment Name"}
                </label>
                <input
                  required
                  name="itemName"
                  type="text"
                  placeholder="e.g. Bunsen Burner #2"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isTamil ? "இடம் / மேஜை" : "Location / Workstation"}
                </label>
                <input
                  required
                  name="location"
                  type="text"
                  placeholder="e.g. Chemistry Station 4"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isTamil ? "தீவிரத்தன்மை" : "Severity Level"}
                </label>
                <select
                  required
                  name="severity"
                  defaultValue="High"
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isTamil ? "பழுது விவரம்" : "Issue Description"}
                </label>
                <textarea
                  required
                  name="issue"
                  rows={3}
                  placeholder="Describe the issue with the equipment..."
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMaintenanceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {isTamil ? "ரத்து" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                >
                  {isTamil ? "புகார் சேமி" : "Log Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
