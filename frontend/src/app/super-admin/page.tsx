"use client";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const systemStatsStatic = [
  { label: "Total Users", value: "0", icon: <i className="fi fi-rr-users"></i>, color: "text-violet-400", sub: "Registered Users", bg: "bg-violet-500/10 border-violet-500/20" },
  { label: "Active Schools", value: "0", icon: <i className="fi fi-rr-building"></i>, color: "text-emerald-400", sub: "Active Schools", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { label: "Total Headmasters", value: "0", icon: <i className="fi fi-rr-user font-bold"></i>, color: "text-cyan-400", sub: "School Administrators", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { label: "Total Students", value: "0", icon: <i className="fi fi-rr-graduation-cap"></i>, color: "text-amber-400", sub: "Enrolled Students", bg: "bg-amber-500/10 border-amber-500/20" },
  { label: "Active Portals", value: "0 / 9", icon: <i className="fi fi-rr-bank"></i>, color: "text-blue-400", sub: "All online", bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "Modules Enabled", value: "0", icon: <i className="fi fi-rr-settings"></i>, color: "text-orange-400", sub: "of 28 total", bg: "bg-orange-500/10 border-orange-500/20" },
  { label: "Syllabus Items", value: "0", icon: <i className="fi fi-rr-book-alt"></i>, color: "text-pink-400", sub: "Curriculum Topics", bg: "bg-pink-500/10 border-pink-500/20" },
  { label: "AI API Status", value: "Online", icon: <i className="fi fi-rr-robot"></i>, color: "text-green-400", sub: "Operational", bg: "bg-green-500/10 border-green-500/20" },
];

const quickActionsStatic = [
  { label: "User Management", href: "/super-admin/users", icon: <i className="fi fi-rr-users"></i>, desc: "Create, edit & deactivate users", color: "from-violet-600 to-purple-700", badge: "49.3L users" },
  { label: "Role & Permissions", href: "/super-admin/roles", icon: <i className="fi fi-rr-shield-check"></i>, desc: "Permission matrix for all roles", color: "from-blue-600 to-indigo-700", badge: "9 roles" },
  { label: "School Management", href: "/super-admin/schools", icon: <i className="fi fi-rr-building"></i>, desc: "Add, edit & manage all schools", color: "from-emerald-600 to-teal-700", badge: "37,404 schools" },
  { label: "Headmaster Mgmt", href: "/super-admin/headmasters", icon: <i className="fi fi-rr-user-gear"></i>, desc: "Assign & transfer headmasters", color: "from-cyan-600 to-sky-700", badge: "37K+ HMs" },
  { label: "Commissioner Mgmt", href: "/super-admin/commissioners", icon: <i className="fi fi-rr-diploma"></i>, desc: "State school education commissioners", color: "from-blue-600 to-indigo-700", badge: "Commissioners" },
  { label: "DEO Management", href: "/super-admin/deos", icon: <i className="fi fi-rr-briefcase"></i>, desc: "Manage District Education Officers", color: "from-pink-650 to-rose-700", badge: "38 DEOs" },
  { label: "BEO Management", href: "/super-admin/beos", icon: <i className="fi fi-rr-sitemap"></i>, desc: "Manage Block Education Officers", color: "from-purple-600 to-violet-700", badge: "413 Blocks" },
  { label: "Academics Hub", href: "/super-admin/academics", icon: <i className="fi fi-rr-graduation-cap"></i>, desc: "Configure class subjects, syllabus & resources", color: "from-indigo-600 to-purple-650", badge: "Curriculum" },
  { label: "PDF Syllabus Upload", href: "/super-admin/syllabus-upload", icon: <i className="fi fi-rr-file-upload"></i>, desc: "Extract syllabus structure from textbook PDFs", color: "from-violet-650 to-indigo-800", badge: "AI Extract" },
  { label: "Syllabus Manager", href: "/super-admin/syllabus", icon: <i className="fi fi-rr-book-open-cover"></i>, desc: "Class/subject/chapter management", color: "from-amber-600 to-orange-700", badge: "Class 6–12" },
  { label: "Material Library", href: "/super-admin/materials", icon: <i className="fi fi-rr-box-alt"></i>, desc: "Upload & manage learning content", color: "from-pink-600 to-rose-700", badge: "2.8K items" },
  { label: "Digital Library", href: "/super-admin/digital-library", icon: <i className="fi fi-rr-book"></i>, desc: "Distribute global study resources to schools", color: "from-blue-650 to-cyan-750", badge: "Library" },
  { label: "Department Modules", href: "/super-admin/modules", icon: <i className="fi fi-rr-apps"></i>, desc: "Enable/disable portal modules", color: "from-fuchsia-600 to-violet-700", badge: "48 modules" },
  { label: "Competitive Exams", href: "/super-admin/competitive-exams", icon: <i className="fi fi-rr-trophy"></i>, desc: "Manage NEET/JEE & board preparation guides", color: "from-amber-600 to-yellow-750", badge: "Exam Prep" },
  { label: "AI Integration", href: "/super-admin/ai-config", icon: <i className="fi fi-rr-robot"></i>, desc: "API keys, models & token limits", color: "from-slate-600 to-slate-800", badge: "3 APIs" },
  { label: "External Storage", href: "/super-admin/storage", icon: <i className="fi fi-rr-database"></i>, desc: "Configure local/cloud storage providers", color: "from-emerald-600 to-teal-700", badge: "S3/Disk" },
  { label: "Data Flow Monitor", href: "/super-admin/data-flow", icon: <i className="fi fi-rr-refresh"></i>, desc: "Pipeline health & sync status", color: "from-green-600 to-emerald-800", badge: "Live" },
  { label: "Feature Toggles", href: "/super-admin/features", icon: <i className="fi fi-rr-toggle-on"></i>, desc: "Global feature flag control", color: "from-orange-600 to-red-700", badge: "42 on / 6 off" },
  { label: "Announcements", href: "/super-admin/announcements", icon: <i className="fi fi-rr-megaphone"></i>, desc: "Broadcast to all portals", color: "from-yellow-600 to-amber-700", badge: "Push now" },
  { label: "Page Management", href: "/super-admin/pages", icon: <i className="fi fi-rr-document"></i>, desc: "Dynamic portal pages", color: "from-indigo-600 to-blue-700", badge: "12 pages" },
  { label: "Manage Ministers", href: "/super-admin/ministers", icon: <i className="fi fi-rr-bank"></i>, desc: "Top-level governance users", color: "from-red-600 to-rose-700", badge: "1 active" },
  { label: "System Logs", href: "/super-admin/logs", icon: <i className="fi fi-rr-list-check"></i>, desc: "Audit trail & event history", color: "from-slate-700 to-gray-800", badge: "Real-time" },
  { label: "Portal Settings", href: "/super-admin/settings", icon: <i className="fi fi-rr-settings-sliders"></i>, desc: "Global platform configuration", color: "from-slate-600 to-slate-800", badge: "Config" },
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

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "people" | "academics" | "system" | "governance">("all");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiFetch("/api/superadmin/dashboard/stats");
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    }
    fetchStats();
  }, []);

  const dynamicStats = systemStatsStatic.map((kpi) => {
    if (!stats) return { ...kpi };
    switch (kpi.label) {
      case "Total Users":
        return { ...kpi, value: stats.totalUsers ?? "0", sub: stats.totalUsersSub || "Registered Users" };
      case "Active Schools":
        return { ...kpi, value: stats.activeSchools ?? "0", sub: stats.activeSchoolsSub || "Active Schools" };
      case "AI API Status":
        return { ...kpi, value: stats.aiStatus ?? "Online", sub: stats.aiStatusSub || "Operational" };
      case "Total Students":
        return { ...kpi, value: stats.totalStudents ?? "0", sub: stats.totalStudentsSub || "Enrolled Students" };
      case "Active Portals":
        return { ...kpi, value: stats.activePortals ?? "0 / 9", sub: stats.activePortalsSub || "All online" };
      case "Modules Enabled":
        return { ...kpi, value: stats.modulesEnabled ?? "0", sub: stats.modulesEnabledSub || "of 28 total" };
      case "Syllabus Items":
        return { ...kpi, value: stats.syllabusItems ?? "0", sub: stats.syllabusSub || "Curriculum Topics" };
      case "Total Headmasters":
        return { ...kpi, value: stats.totalHeadmasters ?? "0", sub: stats.headmastersSub || "School Administrators" };
      default:
        return kpi;
    }
  });

  const dynamicActions = quickActionsStatic.map((action) => {
    if (!stats) return { ...action, badge: "..." };
    let badge = action.badge;
    switch (action.label) {
      case "User Management":
        badge = `${stats.totalUsers || "40"} users`;
        break;
      case "Role & Permissions":
        badge = `9 roles`;
        break;
      case "School Management":
        badge = `${stats.rawSchoolCount ? stats.rawSchoolCount.toLocaleString("en-IN") : "37,404"} schools`;
        break;
      case "Headmaster Mgmt":
        badge = `${stats.hmCount ? stats.hmCount.toLocaleString("en-IN") : "37K+"} HMs`;
        break;
      case "Commissioner Mgmt":
        badge = `${stats.activeMinisters || 1} active`;
        break;
      case "DEO Management":
        badge = `${stats.deoCount ? stats.deoCount : "38"} DEOs`;
        break;
      case "BEO Management":
        badge = `${stats.beoCount ? stats.beoCount : "413"} Blocks`;
        break;
      case "Material Library":
        badge = `${stats.materialsCount ? stats.materialsCount.toLocaleString("en-IN") : "2.8K"} items`;
        break;
      case "Department Modules":
        badge = `${stats.totalModules || 28} modules`;
        break;
      case "AI Integration":
        badge = `${stats.aiApisCount || 3} APIs`;
        break;
      case "Feature Toggles":
        badge = `${stats.enabledModules || 28} on / ${(stats.totalModules || 28) - (stats.enabledModules || 28)} off`;
        break;
      case "Page Management":
        badge = `${stats.pagesCount || 12} pages`;
        break;
      case "Manage Ministers":
        badge = `${stats.activeMinisters || 1} active`;
        break;
    }
    return { ...action, badge };
  });

  const portalHealth = [
    { name: "Student", key: "student" },
    { name: "Teacher", key: "teacher" },
    { name: "Parent", key: "parent" },
    { name: "Headmaster", key: "headmaster" },
    { name: "BEO", key: "beo" },
    { name: "DEO", key: "deo" },
    { name: "Commissioner", key: "commissioner" },
    { name: "Minister", key: "minister" },
    { name: "Super Admin", key: "superadmin" },
  ].map((p) => {
    const count = stats?.roles?.[p.key] || 0;
    const load = stats?.portalLoads?.[p.key] || (count > 0 ? 10 : 0);
    return {
      name: p.name,
      users: count > 0 ? count.toLocaleString("en-IN") : "0",
      load,
      isOnline: count > 0 || p.key === "superadmin",
    };
  });

  const filterMap: Record<string, string[]> = {
    all: dynamicActions.map((q) => q.href),
    people: ["/super-admin/commissioners", "/super-admin/deos", "/super-admin/beos", "/super-admin/users", "/super-admin/roles", "/super-admin/schools", "/super-admin/headmasters"],
    academics: ["/super-admin/academics", "/super-admin/syllabus-upload", "/super-admin/syllabus", "/super-admin/materials", "/super-admin/digital-library", "/super-admin/modules", "/super-admin/competitive-exams"],
    system: ["/super-admin/features", "/super-admin/ai-config", "/super-admin/storage", "/super-admin/data-flow"],
    governance: ["/super-admin/ministers", "/super-admin/pages", "/super-admin/announcements", "/super-admin/logs", "/super-admin/settings"],
  };

  const filteredActions = dynamicActions.filter((q) => filterMap[activeTab].includes(q.href));

  return (
    <PortalLayout>
      {/* Header Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-lg font-bold text-white"><i className="fi fi-rr-tools mr-2"></i>Super Admin Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Full system governance — users, schools, AI, content, and portal management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/super-admin/announcements" className="text-xs font-bold bg-amber-500 text-slate-900 px-3 py-1.5 rounded-lg hover:bg-amber-400 transition">
            <i className="fi fi-rr-megaphone mr-1"></i> Broadcast
          </Link>
          <Link href="/super-admin/schools" className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-500 transition">
            + Add School
          </Link>
        </div>
      </div>

      {/* KPI Grid — Fully Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-6 fade-in">
        {dynamicStats.map((kpi) => (
          <div key={kpi.label} className={`rounded-xl p-3 border ${kpi.bg} text-center flex flex-col justify-between min-h-[95px] overflow-hidden`}>
            <div>
              <div className={`text-xl mb-1 ${kpi.color}`}>{kpi.icon}</div>
              <div className={`text-base xl:text-lg font-extrabold ${kpi.color} truncate`}>{kpi.value}</div>
            </div>
            <div>
              <div className="text-[10px] xl:text-xs text-slate-500 font-semibold truncate leading-tight mt-0.5">{kpi.label}</div>
              {kpi.sub && <div className="text-[9px] xl:text-[10px] text-slate-400 mt-0.5 leading-none truncate">{kpi.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions — Tabbed & Fully Responsive */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in-2">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-white"><i className="fi fi-rr-bolt text-amber-400 mr-2"></i>Management Modules</h2>
          <div className="flex gap-2 flex-wrap">
            {(["all", "people", "academics", "system", "governance"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition capitalize ${activeTab === tab
                  ? "bg-amber-500 text-slate-900"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                  }`}
              >
                <span className="flex items-center gap-1">
                  {tab === "all" ? "All Modules" : tab === "people" ? <><i className="fi fi-rr-users"></i> People</> : tab === "academics" ? <><i className="fi fi-rr-book-alt"></i> Academics</> : tab === "system" ? <><i className="fi fi-rr-settings"></i> System</> : <><i className="fi fi-rr-bank"></i> Governance</>}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {filteredActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-600 rounded-xl p-4 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl text-white mb-3 shadow-lg`}>
                  {action.icon}
                </div>
                <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">{action.label}</div>
                <div className="text-[9px] text-slate-500 mt-1 leading-snug">{action.desc}</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-2">{action.badge}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Row: Activity + Portal Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in-3">

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4"><i className="fi fi-rr-clipboard mr-2"></i>Recent Activity</h2>
          <div className="space-y-2">
            {(stats?.recentActivity || []).length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No recent system activity logged yet. New activity will appear here as users and schools are added.</div>
            ) : (
              (stats?.recentActivity || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-slate-900/40 rounded-xl px-3 py-2.5 border border-slate-800/50">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${item.type === "success" ? "bg-emerald-500" : item.type === "warning" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">{item.action}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.target}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] text-slate-500">{item.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Portal Health */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4"><i className="fi fi-rr-bank mr-2"></i>Portal Health Monitor</h2>
          <div className="space-y-2.5">
            {portalHealth.map((portal) => (
              <div key={portal.name} className="flex items-center gap-3">
                <div className="w-20 text-[10px] font-semibold text-slate-300 shrink-0">{portal.name}</div>
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${portal.load > 70 ? "bg-amber-500" : portal.load > 40 ? "bg-emerald-500" : "bg-blue-500"
                      }`}
                    style={{ width: `${portal.load}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-500 w-8 text-right">{portal.load}%</div>
                <div className="text-[9px] text-slate-600 w-10 text-right">{portal.users}</div>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${portal.isOnline ? "bg-emerald-500" : "bg-slate-600"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
