"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";
import { Check, X, Lock, RefreshCw, Save, Search } from "lucide-react";

type Role = "STUDENT" | "TEACHER" | "PARENT" | "HEADMASTER" | "BEO" | "DEO" | "COMMISSIONER" | "MINISTER" | "SUPERADMIN";

interface Module {
  id: string;
  label: string;
  icon: string;
  category: string;
}

const roles: Role[] = ["STUDENT", "TEACHER", "PARENT", "HEADMASTER", "BEO", "DEO", "COMMISSIONER", "MINISTER", "SUPERADMIN"];

const roleIcons: Record<Role, string> = {
  STUDENT: "🎓", TEACHER: "📚", PARENT: "👨‍👩‍👧", HEADMASTER: "🏫", BEO: "🏢",
  DEO: "🗺️", COMMISSIONER: "⚖️", MINISTER: "🏛️", SUPERADMIN: "🛠️",
};

const roleColors: Record<Role, string> = {
  STUDENT: "#6366f1", TEACHER: "#f59e0b", PARENT: "#10b981", HEADMASTER: "#3b82f6",
  BEO: "#8b5cf6", DEO: "#ec4899", COMMISSIONER: "#06b6d4", MINISTER: "#ef4444", SUPERADMIN: "#475569",
};

const modules: Module[] = [
  { id: "ai-tutor",       label: "AI Tutor",             icon: "🤖", category: "AI" },
  { id: "ai-lesson",      label: "AI Lesson Planner",    icon: "📋", category: "AI" },
  { id: "ai-eval",        label: "AI Evaluation",        icon: "✅", category: "AI" },
  { id: "ai-analytics",   label: "AI Analytics",         icon: "📊", category: "AI" },
  { id: "attendance",     label: "Attendance",           icon: "📅", category: "Academic" },
  { id: "timetable",      label: "Timetable",            icon: "🗓️", category: "Academic" },
  { id: "exams",          label: "Exam Management",      icon: "📝", category: "Academic" },
  { id: "syllabus",       label: "Syllabus View",        icon: "📚", category: "Academic" },
  { id: "materials",      label: "Material Library",     icon: "📦", category: "Content" },
  { id: "virtual-labs",   label: "Virtual Labs",         icon: "🔬", category: "Content" },
  { id: "scholarships",   label: "Scholarships",         icon: "🎓", category: "Welfare" },
  { id: "mid-day-meal",   label: "Mid-Day Meal",         icon: "🍛", category: "Welfare" },
  { id: "gov-schemes",    label: "Govt Schemes",         icon: "🏛️", category: "Welfare" },
  { id: "grievances",     label: "Grievances",           icon: "⚖️", category: "Admin" },
  { id: "announcements",  label: "Announcements",        icon: "📢", category: "Admin" },
  { id: "reports",        label: "Reports & Exports",    icon: "📈", category: "Admin" },
  { id: "communication",  label: "Communication",        icon: "💬", category: "Admin" },
  { id: "infrastructure", label: "Infrastructure",       icon: "🏗️", category: "Admin" },
  { id: "dropout",        label: "Dropout Tracking",     icon: "📉", category: "Analytics" },
  { id: "live-state",     label: "Live State View",      icon: "📡", category: "Analytics" },
];

const buildDefault = (): Record<Role, Record<string, boolean>> => {
  const matrix: Record<Role, Record<string, boolean>> = {} as any;
  const adminRoles: Role[] = ["SUPERADMIN", "MINISTER", "COMMISSIONER", "DEO", "BEO"];

  for (const r of roles) {
    matrix[r] = {};
    for (const m of modules) {
      if (r === "SUPERADMIN") { matrix[r][m.id] = true; continue; }
      if (r === "STUDENT") { matrix[r][m.id] = ["ai-tutor", "attendance", "syllabus", "materials", "virtual-labs", "scholarships", "gov-schemes", "exams", "announcements"].includes(m.id); continue; }
      if (r === "TEACHER") { matrix[r][m.id] = ["ai-lesson", "ai-eval", "attendance", "timetable", "exams", "syllabus", "materials", "scholarships", "communication", "announcements", "reports"].includes(m.id); continue; }
      if (r === "PARENT") { matrix[r][m.id] = ["attendance", "scholarships", "gov-schemes", "communication", "announcements"].includes(m.id); continue; }
      if (r === "HEADMASTER") { matrix[r][m.id] = ["attendance", "timetable", "exams", "syllabus", "materials", "scholarships", "mid-day-meal", "gov-schemes", "grievances", "announcements", "reports", "communication", "infrastructure"].includes(m.id); continue; }
      if (adminRoles.includes(r)) { matrix[r][m.id] = !["ai-tutor", "virtual-labs"].includes(m.id); continue; }
      matrix[r][m.id] = false;
    }
  }
  return matrix;
};

const categories = Array.from(new Set(modules.map((m) => m.category)));

export default function RolePermissions() {
  const [matrix, setMatrix] = useState<Record<Role, Record<string, boolean>>>(buildDefault);
  const [roleCounts, setRoleCounts] = useState<Record<string, string>>({
    STUDENT: "0", TEACHER: "0", PARENT: "0",
    HEADMASTER: "0", BEO: "0", DEO: "0",
    COMMISSIONER: "0", MINISTER: "0", SUPERADMIN: "0"
  });
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tn_role_permissions");
      if (stored) {
        setMatrix(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading permissions from localStorage:", e);
    }

    const fetchCounts = async () => {
      try {
        const res = await apiFetch("/api/users/count");
        const json = await res.json();
        if (json.success) {
          setRoleCounts({
            STUDENT: json.rolesFormatted.students,
            TEACHER: json.rolesFormatted.teachers,
            PARENT: json.rolesFormatted.parents,
            HEADMASTER: json.rolesFormatted.headmasters,
            BEO: json.rolesFormatted.beos,
            DEO: json.rolesFormatted.deos,
            COMMISSIONER: json.rolesFormatted.commissioners,
            MINISTER: json.rolesFormatted.ministers,
            SUPERADMIN: json.rolesFormatted.superAdmins
          });
          setTotalUsers(json.totalUsers || 0);
        }
      } catch (err) {
        console.error("Error fetching role counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const toggle = (role: Role, moduleId: string) => {
    if (role === "SUPERADMIN") return;
    setMatrix((prev) => {
      const updated = {
        ...prev,
        [role]: { ...prev[role], [moduleId]: !prev[role][moduleId] },
      };
      try {
        localStorage.setItem("tn_role_permissions", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const savePermissions = () => {
    try {
      localStorage.setItem("tn_role_permissions", JSON.stringify(matrix));
      setToast({ message: "🎉 Role permission configuration saved successfully!", type: "success" });
    } catch (e) {
      setToast({ message: "⚠️ Failed to save permissions.", type: "error" });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const resetDefaults = () => {
    if (!confirm("Are you sure you want to reset all permissions to system default settings?")) return;
    const defaultMat = buildDefault();
    setMatrix(defaultMat);
    try {
      localStorage.removeItem("tn_role_permissions");
      setToast({ message: "🔄 Permissions restored to default system values.", type: "success" });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setToast(null), 4000);
  };

  const filteredModules = modules.filter((m) => {
    const matchCat = filterCat === "All" || m.category === filterCat;
    const matchSearch =
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalEnabledForRole = (role: Role) => {
    if (!matrix[role]) return 0;
    return Object.values(matrix[role]).filter(Boolean).length;
  };

  const totalActivePermissions = roles.reduce((sum, r) => sum + totalEnabledForRole(r), 0);

  return (
    <PortalLayout>
      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] max-w-md p-4 rounded-2xl text-xs font-bold border shadow-2xl backdrop-blur-md transition-all flex items-center justify-between gap-3 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/25"
              : "bg-red-600 text-white border-red-500 shadow-red-500/25"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white text-sm font-bold ml-2 shrink-0">
            ✕
          </button>
        </div>
      )}

      {/* Header with Actions */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">🔐 Role & Permission Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">Control and configure live module access permissions for all system roles</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetDefaults}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition border border-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={savePermissions}
            className="text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition shadow-md flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>

      {/* Overview Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">System Users</span>
          <div className="text-xl font-bold text-white">{loading ? "..." : totalUsers}</div>
          <span className="badge bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[9px] font-bold mt-1 inline-block">Active DB Accounts</span>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Configured Roles</span>
          <div className="text-xl font-bold text-white">{roles.length}</div>
          <span className="badge bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded text-[9px] font-bold mt-1 inline-block">Portal Scope Roles</span>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">System Modules</span>
          <div className="text-xl font-bold text-white">{modules.length}</div>
          <span className="badge bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold mt-1 inline-block">Feature Modules</span>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Active Grant Rules</span>
          <div className="text-xl font-bold text-white">{totalActivePermissions}</div>
          <span className="badge bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[9px] font-bold mt-1 inline-block">Active Grants</span>
        </div>
      </div>

      {/* Role Summary Cards with Dynamic User Counts */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-6">
        {roles.map((r) => (
          <div key={r} className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 text-center transition-all hover:border-slate-700">
            <div className="text-lg">{roleIcons[r]}</div>
            <div className="text-[9px] font-bold text-white mt-0.5">{r.replace("SUPERADMIN", "S.ADMIN")}</div>
            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
              {loading ? "..." : (roleCounts[r] || "0")} users
            </div>
            <div className="text-[10px] font-bold mt-1" style={{ color: roleColors[r] }}>
              {totalEnabledForRole(r)}/{modules.length}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full transition ${
                filterCat === cat ? "bg-amber-500 text-slate-900 shadow-md" : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="glass rounded-2xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th className="w-48">Module</th>
                <th className="w-24">Category</th>
                {roles.map((r) => (
                  <th key={r} className="text-center w-20">
                    <div className="text-base">{roleIcons[r]}</div>
                    <div className="text-[8px] font-bold text-slate-400 mt-0.5">{r.replace("SUPERADMIN", "SA")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-400 text-xs">
                    No modules match the search or category filter.
                  </td>
                </tr>
              ) : (
                filteredModules.map((mod) => (
                  <tr key={mod.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{mod.icon}</span>
                        <span className="text-xs font-semibold text-white">{mod.label}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{mod.category}</span>
                    </td>
                    {roles.map((r) => {
                      const isOn = matrix[r] ? matrix[r][mod.id] : false;
                      const isLocked = r === "SUPERADMIN";
                      const cellKey = `${r}-${mod.id}`;
                      return (
                        <td key={r} className="text-center">
                          <button
                            onClick={() => toggle(r, mod.id)}
                            disabled={isLocked}
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                            title={isLocked ? "Super Admin has full access always" : `${isOn ? "Disable" : "Enable"} ${mod.label} for ${r}`}
                            className={`w-7 h-7 rounded-lg transition-all flex items-center justify-center mx-auto text-xs ${
                              isLocked
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                                : isOn
                                ? "bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-400 font-bold"
                                : "bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-600 font-bold"
                            } ${hoveredCell === cellKey && !isLocked ? "scale-110 shadow-md" : ""}`}
                          >
                            {isLocked ? (
                              <Lock className="w-3 h-3 text-slate-500" />
                            ) : isOn ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4 text-[10px] text-slate-500 items-center">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-flex items-center justify-center text-[9px] text-emerald-400 font-bold">✓</span> Enabled</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-900 border border-slate-800 inline-flex items-center justify-center text-[9px] text-slate-600 font-bold">✕</span> Disabled</span>
        <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-slate-500" /> Super Admin — always full access</span>
      </div>
    </PortalLayout>
  );
}
