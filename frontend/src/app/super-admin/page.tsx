"use client";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState } from "react";

const systemStats = [
  { label: "Total Users", value: "49.3L+", icon: "👥", color: "text-violet-400", sub: "All roles combined", bg: "bg-violet-500/10 border-violet-500/20" },
  { label: "Active Schools", value: "37,404", icon: "🏫", color: "text-emerald-400", sub: "State-wide", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { label: "AI API Status", value: "Online", icon: "🤖", color: "text-cyan-400", sub: "All models active", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { label: "System Uptime", value: "99.9%", icon: "✅", color: "text-amber-400", sub: "Last 30 days", bg: "bg-amber-500/10 border-amber-500/20" },
  { label: "Active Portals", value: "9 / 9", icon: "🏛️", color: "text-blue-400", sub: "All online", bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "Modules Enabled", value: "42", icon: "🔧", color: "text-orange-400", sub: "of 48 total", bg: "bg-orange-500/10 border-orange-500/20" },
  { label: "Syllabus Items", value: "2,840", icon: "📚", color: "text-pink-400", sub: "Class 6–12", bg: "bg-pink-500/10 border-pink-500/20" },
  { label: "Data Sync", value: "Live", icon: "🔄", color: "text-green-400", sub: "All pipelines OK", bg: "bg-green-500/10 border-green-500/20" },
];

const quickActions = [
  { label: "User Management", href: "/super-admin/users", icon: "👥", desc: "Create, edit & deactivate users", color: "from-violet-600 to-purple-700", badge: "49.3L users" },
  { label: "Role & Permissions", href: "/super-admin/roles", icon: "🔐", desc: "Permission matrix for all roles", color: "from-blue-600 to-indigo-700", badge: "9 roles" },
  { label: "School Management", href: "/super-admin/schools", icon: "🏫", desc: "Add, edit & manage all schools", color: "from-emerald-600 to-teal-700", badge: "37,404 schools" },
  { label: "Headmaster Mgmt", href: "/super-admin/headmasters", icon: "👤", desc: "Assign & transfer headmasters", color: "from-cyan-600 to-sky-700", badge: "37K+ HMs" },
  { label: "Learning Hub Admin", href: "/super-admin/learning-hub", icon: "📚", desc: "Manage central learning content, materials & AI", color: "from-indigo-650 to-indigo-850", badge: "Active" },
  { label: "Syllabus Manager", href: "/super-admin/syllabus", icon: "📖", desc: "Class/subject/chapter management", color: "from-amber-600 to-orange-700", badge: "Class 6–12" },
  { label: "Material Library", href: "/super-admin/materials", icon: "📦", desc: "Upload & manage learning content", color: "from-pink-600 to-rose-700", badge: "2.8K items" },
  { label: "Department Modules", href: "/super-admin/modules", icon: "🗓️", desc: "Enable/disable portal modules", color: "from-fuchsia-600 to-violet-700", badge: "48 modules" },
  { label: "AI Integration", href: "/super-admin/ai-config", icon: "🤖", desc: "API keys, models & token limits", color: "from-slate-600 to-slate-800", badge: "3 APIs" },
  { label: "Data Flow Monitor", href: "/super-admin/data-flow", icon: "🔄", desc: "Pipeline health & sync status", color: "from-green-600 to-emerald-800", badge: "Live" },
  { label: "Feature Toggles", href: "/super-admin/features", icon: "🔧", desc: "Global feature flag control", color: "from-orange-600 to-red-700", badge: "42 on / 6 off" },
  { label: "Announcements", href: "/super-admin/announcements", icon: "📢", desc: "Broadcast to all portals", color: "from-yellow-600 to-amber-700", badge: "Push now" },
  { label: "Page Management", href: "/super-admin/pages", icon: "📄", desc: "Dynamic portal pages", color: "from-indigo-600 to-blue-700", badge: "12 pages" },
  { label: "Manage Ministers", href: "/super-admin/ministers", icon: "🏛️", desc: "Top-level governance users", color: "from-red-600 to-rose-700", badge: "1 active" },
  { label: "System Logs", href: "/super-admin/logs", icon: "📋", desc: "Audit trail & event history", color: "from-slate-700 to-gray-800", badge: "Real-time" },
  { label: "Portal Settings", href: "/super-admin/settings", icon: "⚙️", desc: "Global platform configuration", color: "from-slate-600 to-slate-800", badge: "Config" },
];

const recentActivity = [
  { action: "School Added", target: "GHS Palayamkottai — DISE: 33014567", user: "Super Admin", time: "2 min ago", type: "success" },
  { action: "AI Model Changed", target: "Gemini 1.5 Pro → Flash for Student Portal", user: "Super Admin", time: "18 min ago", type: "warning" },
  { action: "Feature Enabled", target: "Virtual Labs — Student Portal", user: "Super Admin", time: "45 min ago", type: "success" },
  { action: "HM Assigned", target: "Mr. Ramesh K. → GHS Coimbatore North", user: "Super Admin", time: "1 hr ago", type: "info" },
  { action: "Syllabus Updated", target: "Class 10 Maths — Chapter 5 added", user: "Super Admin", time: "2 hrs ago", type: "info" },
  { action: "Announcement Sent", target: "Holiday notice to all portals", user: "Super Admin", time: "3 hrs ago", type: "warning" },
  { action: "New User Created", target: "teacher@madurai.tn.gov.in (TEACHER)", user: "Super Admin", time: "4 hrs ago", type: "success" },
  { action: "Module Disabled", target: "Career Aptitude — BEO Portal", user: "Super Admin", time: "5 hrs ago", type: "warning" },
];

const portalHealth = [
  { name: "Student", status: "active", users: "47.2L", load: 82 },
  { name: "Teacher", status: "active", users: "2.1L", load: 65 },
  { name: "Parent", status: "active", users: "38L", load: 44 },
  { name: "Headmaster", status: "active", users: "37K", load: 38 },
  { name: "BEO", status: "active", users: "385", load: 21 },
  { name: "DEO", status: "active", users: "38", load: 15 },
  { name: "Commissioner", status: "active", users: "12", load: 9 },
  { name: "Minister", status: "active", users: "1", load: 5 },
  { name: "Super Admin", status: "active", users: "3", load: 3 },
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "people" | "academics" | "system" | "governance">("all");

  const filterMap: Record<string, string[]> = {
    all: quickActions.map((q) => q.href),
    people: ["/super-admin/users", "/super-admin/roles", "/super-admin/schools", "/super-admin/headmasters"],
    academics: ["/super-admin/learning-hub", "/super-admin/syllabus", "/super-admin/materials", "/super-admin/modules"],
    system: ["/super-admin/features", "/super-admin/ai-config", "/super-admin/data-flow"],
    governance: ["/super-admin/ministers", "/super-admin/pages", "/super-admin/announcements", "/super-admin/logs", "/super-admin/settings"],
  };

  const filteredActions = quickActions.filter((q) => filterMap[activeTab].includes(q.href));

  return (
    <PortalLayout>
      {/* Header Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">🛠️ Super Admin Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Full system governance — users, schools, AI, content, and portal management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/super-admin/announcements" className="text-xs font-bold bg-amber-500 text-slate-900 px-3 py-1.5 rounded-lg hover:bg-amber-400 transition">
            📢 Broadcast
          </Link>
          <Link href="/super-admin/schools" className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-500 transition">
            + Add School
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6 fade-in">
        {systemStats.map((kpi) => (
          <div key={kpi.label} className={`rounded-xl p-3 border ${kpi.bg} text-center`}>
            <div className="text-xl mb-1">{kpi.icon}</div>
            <div className={`text-base font-extrabold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[9px] text-slate-500 leading-tight mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions — Tabbed */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in-2">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-white">⚡ Management Modules</h2>
          <div className="flex gap-2 flex-wrap">
            {(["all", "people", "academics", "system", "governance"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition capitalize ${
                  activeTab === tab
                    ? "bg-amber-500 text-slate-900"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                {tab === "all" ? "All Modules" : tab === "people" ? "👥 People" : tab === "academics" ? "📚 Academics" : tab === "system" ? "⚙️ System" : "🏛️ Governance"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-600 rounded-xl p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl mb-3 shadow-lg`}>
                {action.icon}
              </div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">{action.label}</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-snug">{action.desc}</div>
              <div className="text-[9px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-2">{action.badge}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Row: Activity + Portal Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in-3">

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">📋 Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-900/40 rounded-xl px-3 py-2.5 border border-slate-800/50">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  item.type === "success" ? "bg-emerald-500" : item.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white">{item.action}</div>
                  <div className="text-[10px] text-slate-500 truncate">{item.target}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[9px] text-slate-500">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portal Health */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">🏛️ Portal Health Monitor</h2>
          <div className="space-y-2.5">
            {portalHealth.map((portal) => (
              <div key={portal.name} className="flex items-center gap-3">
                <div className="w-20 text-[10px] font-semibold text-slate-300 shrink-0">{portal.name}</div>
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      portal.load > 70 ? "bg-amber-500" : portal.load > 40 ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${portal.load}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-500 w-8 text-right">{portal.load}%</div>
                <div className="text-[9px] text-slate-600 w-10 text-right">{portal.users}</div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
