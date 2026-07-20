"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";

interface Scheme {
  id: string;
  name: string;
  nameTA?: string | null;
  category: string;
  categoryTA?: string | null;
  standards: string[];
  standardText: string;
  gender: string;
  community: string[];
  communityText: string;
  incomeLimit: number | null;
  incomeLimitText: string;
  amount: number;
  amountText: string;
  amountTA?: string | null;
  description: string;
  descriptionTA?: string | null;
  eligibilityDetails: string[];
  documentsRequired: string[];
  deadline: string;
  contactDetails: string;
}

interface ScholarshipApplication {
  id: string;
  scheme: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";
  appliedDate: string;
  approvedDate: string | null;
  disbursedDate: string | null;
  remarks: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; bg: string; text: string; icon: string; border: string }> = {
  PENDING:   { label: "Pending Review", bg: "bg-amber-500/10 dark:bg-amber-500/10",   text: "text-amber-600 dark:text-amber-455",  border: "border-amber-500/20 dark:border-amber-500/25",  icon: "fi fi-rr-time-past" },
  APPROVED:  { label: "Approved",      bg: "bg-emerald-500/10 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-455", border: "border-emerald-500/20 dark:border-emerald-500/25", icon: "fi fi-rr-check-circle" },
  REJECTED:  { label: "Rejected",      bg: "bg-red-500/10 dark:bg-red-500/10",         text: "text-red-600 dark:text-red-455",         border: "border-red-500/20 dark:border-red-500/25",         icon: "fi fi-rr-cross-circle" },
  DISBURSED: { label: "Disbursed",     bg: "bg-blue-500/10 dark:bg-blue-500/10",       text: "text-blue-600 dark:text-blue-455",       border: "border-blue-500/20 dark:border-blue-500/25",       icon: "fi fi-rr-coins" },
};

function ChildSwitcher({ childList, active, onChange }: { childList: Child[]; active: Child | null; onChange: (c: Child) => void }) {
  if (childList.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl flex-wrap shadow-sm">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1.5 shrink-0">
        <i className="fi fi-rr-portrait text-slate-400"></i> Select Child:
      </span>
      <div className="flex flex-wrap gap-2">
        {childList.map(c => (
          <button
            key={c.studentId}
            onClick={() => onChange(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              active?.studentId === c.studentId
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-105"
                : "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/85 border border-slate-200 dark:border-slate-700/40"
            }`}
          >
            <i className="fi fi-rr-user"></i>
            <span>{c.name.split(" ")[0]}</span>
            <span className="opacity-60 font-medium">Class {c.class}-{c.section}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ScholarshipPage() {
  const { parentId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();

  // Tab State: "applications" | "directory" | "eligibility"
  const [activeTab, setActiveTab] = useState<"applications" | "directory" | "eligibility">("applications");

  // DB Applications State
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [loading, setLoading]           = useState(false);

  // Search & Filter state for Applications
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("ALL");
  const [appPage, setAppPage] = useState(1);

  // Search & Filter state for Scheme Directory
  const [dirSearch, setDirSearch] = useState("");
  const [dirStandardFilter, setDirStandardFilter] = useState<string>("ALL");
  const [dirCategoryFilter, setDirCategoryFilter] = useState<string>("ALL");
  const [dirShowOnlyEligible, setDirShowOnlyEligible] = useState(false);
  const [dirPage, setDirPage] = useState(1);

  // Drawer modal state
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // DB Schemes State
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [schemesLoading, setSchemesLoading] = useState(true);

  const fetchSchemes = useCallback(async () => {
    setSchemesLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/parent/scholarship-schemes`);
      const json = await res.json();
      if (json.success) {
        setSchemes(json.data);
      }
    } catch (e) {
      console.error("Error loading schemes:", e);
    } finally {
      setSchemesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const itemsPerPage = 5;

  const fetchApplications = useCallback(async (child: Child) => {
    if (!parentId) return;
    setLoading(true);
    try {
      const res  = await fetch(`${getApiBase()}/api/parent/${parentId}/child/${child.studentId}/scholarship`);
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      }
    } catch (e) {
      console.error("Offline or error fetching scholarships", e);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    if (activeChild) {
      fetchApplications(activeChild);
      // Reset page numbers on child switch
      setAppPage(1);
      setDirPage(1);
    }
  }, [activeChild, fetchApplications]);

  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  // Eligibility Matcher logic
  const getEligibility = useCallback((child: Child | null, scheme: Scheme): { isEligible: boolean; reasons: string[] } => {
    if (!child) return { isEligible: false, reasons: ["No student selected."] };
    const reasons: string[] = [];

    // Class/Standard Check
    const studentClass = child.class ? child.class.trim() : "";
    if (studentClass && !scheme.standards.includes(studentClass)) {
      reasons.push(`Student is in Class ${studentClass}, but scheme is designed for Class(es): ${scheme.standards.join(", ")}`);
    }

    // Gender Check
    if (scheme.gender !== "All") {
      const studentGender = child.gender ? child.gender.trim().toLowerCase() : "";
      const schemeGender = scheme.gender.toLowerCase();
      if (studentGender && studentGender !== schemeGender) {
        reasons.push(`Scheme is restricted to ${scheme.gender} candidates (student is ${child.gender})`);
      }
    }

    // Community Check
    if (!scheme.community.includes("All")) {
      const studentComm = child.community ? child.community.trim().toUpperCase() : "";

      if (scheme.community.includes("Minority")) {
        // Minority schemes match parents flagged as minority or specific communities
        if (studentComm !== "MINORITY") {
          reasons.push(`Scheme is restricted to Minority communities`);
        }
      } else {
        const isMatched = scheme.community.some(c => c.toUpperCase() === studentComm);
        if (!isMatched) {
          reasons.push(`Scheme is for ${scheme.communityText} (student community is ${child.community || "Not Specified"})`);
        }
      }
    }

    return {
      isEligible: reasons.length === 0,
      reasons
    };
  }, []);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.scheme.toLowerCase().includes(appSearch.toLowerCase()) || 
        (app.remarks && app.remarks.toLowerCase().includes(appSearch.toLowerCase()));
      const matchesStatus = appStatusFilter === "ALL" || app.status === appStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, appSearch, appStatusFilter]);

  // Paginated Applications
  const paginatedApplications = useMemo(() => {
    const start = (appPage - 1) * itemsPerPage;
    return filteredApplications.slice(start, start + itemsPerPage);
  }, [filteredApplications, appPage]);

  const totalAppPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Filtered Scheme Directory
  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const matchesSearch = scheme.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
        scheme.description.toLowerCase().includes(dirSearch.toLowerCase());
      
      let matchesStandard = true;
      if (dirStandardFilter !== "ALL") {
        if (dirStandardFilter === "PRIMARY") {
          matchesStandard = scheme.standards.some(s => ["1", "2", "3", "4", "5"].includes(s));
        } else if (dirStandardFilter === "MIDDLE") {
          matchesStandard = scheme.standards.some(s => ["6", "7", "8"].includes(s));
        } else if (dirStandardFilter === "HIGH") {
          matchesStandard = scheme.standards.some(s => ["9", "10"].includes(s));
        } else if (dirStandardFilter === "HIGHER_SEC") {
          matchesStandard = scheme.standards.some(s => ["11", "12"].includes(s));
        }
      }

      const matchesCategory = dirCategoryFilter === "ALL" || scheme.category === dirCategoryFilter;

      let matchesEligibility = true;
      if (dirShowOnlyEligible && activeChild) {
        const { isEligible } = getEligibility(activeChild, scheme);
        matchesEligibility = isEligible;
      }

      return matchesSearch && matchesStandard && matchesCategory && matchesEligibility;
    });
  }, [dirSearch, dirStandardFilter, dirCategoryFilter, dirShowOnlyEligible, activeChild, getEligibility]);

  // Paginated Schemes
  const paginatedSchemes = useMemo(() => {
    const start = (dirPage - 1) * itemsPerPage;
    return filteredSchemes.slice(start, start + itemsPerPage);
  }, [filteredSchemes, dirPage]);

  const totalDirPages = Math.ceil(filteredSchemes.length / itemsPerPage);

  // Math stats for KPIs
  const disbursedTotal = useMemo(() => {
    return applications
      .filter(s => s.status === "DISBURSED")
      .reduce((sum, s) => sum + s.amount, 0);
  }, [applications]);

  const approvedTotal = useMemo(() => {
    return applications
      .filter(s => s.status === "APPROVED" || s.status === "DISBURSED")
      .reduce((sum, s) => sum + s.amount, 0);
  }, [applications]);

  const pendingCount = useMemo(() => {
    return applications.filter(s => s.status === "PENDING").length;
  }, [applications]);

  const eligibleSchemesCount = useMemo(() => {
    if (!activeChild) return 0;
    return schemes.filter(scheme => getEligibility(activeChild, scheme).isEligible).length;
  }, [activeChild, getEligibility, schemes]);

  return (
    <PortalLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <i className="fi fi-rr-graduation-cap text-emerald-500"></i> Scholarships & Schemes
          </h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">
            Track active scholarship disbursements and explore welfare schemes available for your children.
          </p>
        </div>
      </div>

      <ChildSwitcher childList={children} active={activeChild} onChange={setActiveChild} />

      {/* KPI Cards Grid - Responsive columns to prevent text clipping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Disbursed", value: formatINR(disbursedTotal), icon: "fi fi-rr-coins", color: "text-emerald-600 dark:text-emerald-450", border: "border-slate-200 dark:border-slate-800/80", bg: "bg-white dark:bg-slate-900/50 from-emerald-500/5 to-teal-500/5" },
          { label: "Total Approved",  value: formatINR(approvedTotal),  icon: "fi fi-rr-check-circle", color: "text-sky-600 dark:text-sky-400",     border: "border-slate-200 dark:border-slate-800/80", bg: "bg-white dark:bg-slate-900/50 from-sky-500/5 to-indigo-500/5" },
          { label: "Pending Review",  value: String(pendingCount),        icon: "fi fi-rr-time-past", color: "text-amber-600 dark:text-amber-400",   border: "border-slate-200 dark:border-slate-800/80", bg: "bg-white dark:bg-slate-900/50 from-amber-500/5 to-orange-500/5" },
          { label: "Eligible Schemes",value: `${eligibleSchemesCount} Available`, icon: "fi fi-rr-bullseye", color: "text-purple-600 dark:text-purple-400",  border: "border-slate-200 dark:border-slate-800/80", bg: "bg-white dark:bg-slate-900/50 from-purple-500/5 to-violet-500/5" },
        ].map(k => (
          <div
            key={k.label}
            className={`backdrop-blur-xl border ${k.border} rounded-2xl p-4 sm:p-5 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 shadow-sm dark:shadow-xl bg-gradient-to-br ${k.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{k.label}</span>
              <i className={`${k.icon} text-slate-450 dark:text-slate-400 text-lg shrink-0`}></i>
            </div>
            {loading || childrenLoading ? (
              <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            ) : (
              <div className={`text-base sm:text-lg font-bold ${k.color} tracking-tight`}>{k.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Tabs Layout with horizontal scroll hide on mobile */}
      <div 
        className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2 overflow-x-auto whitespace-nowrap scroll-smooth w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => setActiveTab("applications")}
          className={`py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] sm:text-xs font-semibold tracking-wider uppercase border-b-2 transition-all duration-300 flex items-center gap-2 active:scale-95 shrink-0 ${
            activeTab === "applications"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-450 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-800"
          }`}
        >
          <i className="fi fi-rr-document-signed"></i> Child's Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab("directory")}
          className={`py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] sm:text-xs font-semibold tracking-wider uppercase border-b-2 transition-all duration-300 flex items-center gap-2 active:scale-95 shrink-0 ${
            activeTab === "directory"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-450 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-800"
          }`}
        >
          <i className="fi fi-rr-search"></i> Explore Welfare Schemes ({schemes.length})
        </button>
        <button
          onClick={() => setActiveTab("eligibility")}
          className={`py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] sm:text-xs font-semibold tracking-wider uppercase border-b-2 transition-all duration-300 flex items-center gap-2 active:scale-95 shrink-0 ${
            activeTab === "eligibility"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-450 font-bold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-800"
          }`}
        >
          <i className="fi fi-rr-bolt"></i> Smart Match Checker
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "applications" && (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fi fi-rr-document-signed text-emerald-500"></i> Application Status History
            </h2>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center w-full md:w-auto">
              <input
                type="text"
                value={appSearch}
                onChange={e => { setAppSearch(e.target.value); setAppPage(1); }}
                placeholder="Search scheme..."
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs outline-none focus:border-emerald-500/80 transition-all duration-300 w-full md:w-56"
              />
              <select
                value={appStatusFilter}
                onChange={e => { setAppStatusFilter(e.target.value); setAppPage(1); }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-xl text-xs outline-none cursor-pointer focus:border-emerald-500/80 w-full sm:w-auto"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="DISBURSED">Disbursed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />)}</div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
              <i className="fi fi-rr-document-signed text-slate-400 dark:text-slate-600 text-4xl block mb-3"></i>
              <h3 className="text-slate-700 dark:text-white font-semibold text-sm">No Applications Found</h3>
              <p className="text-slate-550 dark:text-slate-400 text-xs mt-1 max-w-md mx-auto font-normal">
                {appSearch || appStatusFilter !== "ALL"
                  ? "Adjust your filters to see other records."
                  : activeChild
                  ? `${activeChild.name} does not have any active or previous scholarship application records in the database.`
                  : "Please select a child above."}
              </p>
            </div>
          ) : (
            <>
              {/* Responsive Cards/List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {paginatedApplications.map(app => {
                  const meta = STATUS_META[app.status] ?? STATUS_META.PENDING;
                  return (
                    <div
                      key={app.id}
                      className="bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900/95 border border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-snug">{app.scheme}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${meta.bg} ${meta.text} ${meta.border} shrink-0`}>
                            <i className={meta.icon}></i> <span>{meta.label}</span>
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-xs text-slate-500 font-normal">Amount:</span>
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(app.amount)}</span>
                        </div>
                      </div>

                      {/* Application details timeline */}
                      <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Applied Date:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{fmtDate(app.appliedDate)}</span>
                        </div>
                        {app.approvedDate && (
                          <div className="flex justify-between">
                            <span>Approved Date:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{fmtDate(app.approvedDate)}</span>
                          </div>
                        )}
                        {app.disbursedDate && (
                          <div className="flex justify-between">
                            <span>Disbursed Date:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{fmtDate(app.disbursedDate)}</span>
                          </div>
                        )}
                        {app.remarks && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/50 text-slate-650 dark:text-slate-400 text-xs italic bg-slate-100/60 dark:bg-slate-950/20 p-2 rounded-lg flex gap-1.5 font-normal">
                            <i className="fi fi-rr-comment-alt text-slate-400 dark:text-slate-500 mt-0.5"></i>
                            <span>Remarks: {app.remarks}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalAppPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs font-normal gap-4">
                  <span className="text-slate-500 font-medium text-center sm:text-left">
                    Showing <span className="text-slate-750 dark:text-slate-300">{(appPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="text-slate-750 dark:text-slate-300">
                      {Math.min(appPage * itemsPerPage, filteredApplications.length)}
                    </span>{" "}
                    of <span className="text-slate-750 dark:text-slate-300">{filteredApplications.length}</span> applications
                  </span>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    <button
                      onClick={() => setAppPage(p => Math.max(1, p - 1))}
                      disabled={appPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-slate-55 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-semibold"
                    >
                      ← Prev
                    </button>
                    {[...Array(totalAppPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setAppPage(i + 1)}
                        className={`px-3 py-1.5 rounded-lg font-semibold border ${
                          appPage === i + 1
                            ? "bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/35"
                            : "bg-slate-55 dark:bg-slate-900 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setAppPage(p => Math.min(totalAppPages, p + 1))}
                      disabled={appPage === totalAppPages}
                      className="px-3 py-1.5 rounded-lg bg-slate-55 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "directory" && (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fi fi-rr-book-alt text-emerald-500"></i> Scheme Directory
              </h2>
              <p className="text-slate-550 dark:text-slate-400 text-xs mt-0.5">Explore available Tamil Nadu state scholarships and details.</p>
            </div>
            {/* Filters layout optimized to stack cleanly on mobile */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 items-stretch sm:items-center w-full lg:w-auto">
              <input
                type="text"
                value={dirSearch}
                onChange={e => { setDirSearch(e.target.value); setDirPage(1); }}
                placeholder="Search scheme name/desc..."
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs outline-none focus:border-emerald-500/80 transition-all w-full sm:w-56"
              />
              <select
                value={dirStandardFilter}
                onChange={e => { setDirStandardFilter(e.target.value); setDirPage(1); }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-xl text-xs outline-none cursor-pointer focus:border-emerald-500/80 w-full sm:w-auto"
              >
                <option value="ALL">All Standards</option>
                <option value="PRIMARY">Primary (1-5)</option>
                <option value="MIDDLE">Middle School (6-8)</option>
                <option value="HIGH">High School (9-10)</option>
                <option value="HIGHER_SEC">Higher Secondary (11-12)</option>
              </select>
              <select
                value={dirCategoryFilter}
                onChange={e => { setDirCategoryFilter(e.target.value); setDirPage(1); }}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-xl text-xs outline-none cursor-pointer focus:border-emerald-500/80 w-full sm:w-auto"
              >
                <option value="ALL">All Categories</option>
                <option value="Government School Special">Government School Special</option>
                <option value="BC/MBC Welfare">BC/MBC Welfare</option>
                <option value="SC/ST Welfare">SC/ST Welfare</option>
                <option value="Minorities Welfare">Minorities Welfare</option>
                <option value="Merit / Exam-based">Merit / Exam-based</option>
                <option value="Higher Education Support">Higher Education Support</option>
              </select>

              {activeChild && (
                <label className="flex items-center gap-1.5 text-xs text-slate-750 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 w-full sm:w-auto justify-center sm:justify-start">
                  <input
                    type="checkbox"
                    checked={dirShowOnlyEligible}
                    onChange={e => { setDirShowOnlyEligible(e.target.checked); setDirPage(1); }}
                    className="accent-emerald-500 rounded focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Show Only Eligible</span>
                </label>
              )}
            </div>
          </div>

          {filteredSchemes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
              <i className="fi fi-rr-search text-slate-400 dark:text-slate-600 text-4xl block mb-3"></i>
              <h3 className="text-slate-700 dark:text-white font-semibold text-sm">No Schemes Match Criteria</h3>
              <p className="text-slate-505 dark:text-slate-400 text-xs mt-1">Try adjusting your filters, clearing your search query, or checking back later.</p>
            </div>
          ) : (
            <>
              {/* Schemes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {paginatedSchemes.map(scheme => {
                  const eligibility = getEligibility(activeChild, scheme);
                  const isApplied = applications.some(app => app.scheme.toLowerCase().includes(scheme.name.toLowerCase()) || scheme.name.toLowerCase().includes(app.scheme.toLowerCase()));
                  
                  return (
                    <div
                      key={scheme.id}
                      className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded-2xl p-4 sm:p-5 hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between shadow-sm dark:shadow-none"
                    >
                      <div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 dark:border-emerald-500/20 uppercase tracking-wider">
                            {scheme.category}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/10 dark:border-indigo-500/20">
                            {scheme.standardText.split(" (")[0]}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 leading-snug line-clamp-2 min-h-[40px]">
                          {scheme.name}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed font-normal">
                          {scheme.description}
                        </p>
                      </div>

                      <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                        {/* Amount */}
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Benefits:</span>
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{scheme.amountText}</span>
                        </div>

                        {/* Eligibility Status */}
                        {activeChild && (
                          <div className="flex items-center gap-1.5">
                            {eligibility.isEligible ? (
                              <span className="text-[10px] font-bold text-emerald-655 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25 dark:border-emerald-500/20 flex items-center gap-1">
                                <i className="fi fi-rr-check-circle text-xs"></i> Eligible Match
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                                <i className="fi fi-rr-info text-xs"></i> Check Criteria
                              </span>
                            )}
                            
                            {isApplied && (
                              <span className="text-[10px] font-bold text-blue-650 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/25 dark:border-blue-500/20">
                                Applied
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedScheme(scheme)}
                          className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 border border-slate-200 dark:border-slate-700 hover:border-emerald-600 text-slate-700 dark:text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all duration-300"
                        >
                          View Details & Rules
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalDirPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs font-normal gap-4">
                  <span className="text-slate-550 dark:text-slate-400 font-medium text-center sm:text-left">
                    Showing <span className="text-slate-750 dark:text-slate-300">{(dirPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="text-slate-750 dark:text-slate-300">
                      {Math.min(dirPage * itemsPerPage, filteredSchemes.length)}
                    </span>{" "}
                    of <span className="text-slate-750 dark:text-slate-300">{filteredSchemes.length}</span> schemes
                  </span>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    <button
                      onClick={() => setDirPage(p => Math.max(1, p - 1))}
                      disabled={dirPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-semibold"
                    >
                      ← Prev
                    </button>
                    {[...Array(totalDirPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setDirPage(i + 1)}
                        className={`px-3 py-1.5 rounded-lg font-semibold border ${
                          dirPage === i + 1
                            ? "bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/35"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setDirPage(p => Math.min(totalDirPages, p + 1))}
                      disabled={dirPage === totalDirPages}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "eligibility" && (
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-2xl">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fi fi-rr-bolt text-emerald-500"></i> Smart Eligibility Checker
            </h2>
            <p className="text-slate-555 dark:text-slate-400 text-xs mt-0.5">
              Based on the child's academic and EMIS registry profiles, we auto-match available scholarship schemes.
            </p>
          </div>

          {activeChild ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-none">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <i className="fi fi-rr-portrait"></i> Active Child Profile Info
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Name</div>
                    <div className="text-sm font-bold text-slate-850 dark:text-white">{activeChild.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Class / Section</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {activeChild.class}-{activeChild.section}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Roll Number</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{activeChild.rollNumber || "—"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Gender</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{activeChild.gender || "Not Specified"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Community / Caste</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{activeChild.community || "Not Specified"}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mt-6 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed font-normal flex gap-1.5">
                  <i className="fi fi-rr-info text-slate-500 dark:text-slate-400 mt-0.5"></i>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-300 block mb-0.5">Profiling Note:</span>
                    If child details such as Gender or Community are incorrect or missing, please contact the school administration to update the EMIS roster.
                  </div>
                </div>
              </div>

              {/* Match Output */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <i className="fi fi-rr-bullseye text-emerald-500"></i> Eligible Schemes Found ({eligibleSchemesCount})
                </h3>

                {eligibleSchemesCount === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                    <i className="fi fi-rr-shield text-slate-500 dark:text-slate-600 text-4xl block mb-2"></i>
                    <h4 className="text-slate-700 dark:text-white font-semibold text-sm">No Perfect Matches Found</h4>
                    <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">
                      Check if the student's profile information is complete. Otherwise, look through the general Directory to see if there are other schemes suitable.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                    {schemes.map(scheme => {
                      const eligibility = getEligibility(activeChild, scheme);
                      if (!eligibility.isEligible) return null;

                      return (
                        <div
                          key={scheme.id}
                          className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 rounded-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:scale-[1.01] shadow-sm dark:shadow-none"
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 dark:border-emerald-500/20 uppercase tracking-wide">
                              {scheme.category}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-snug">{scheme.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-normal">{scheme.description}</p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:min-w-[180px] border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 w-full sm:w-auto">
                            <div className="sm:text-right font-normal">
                              <div className="text-[10px] text-slate-550 font-semibold uppercase">Amount</div>
                              <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{scheme.amountText}</div>
                            </div>
                            <button
                              onClick={() => setSelectedScheme(scheme)}
                              className="px-3 py-2 bg-emerald-50 dark:bg-emerald-600/10 border border-emerald-500/25 dark:border-emerald-500/25 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-455 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 shrink-0"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-450">Please select a student above to inspect matches.</div>
          )}
        </div>
      )}

      {/* Drawer / Modal Details */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-fade-in">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 dark:bg-gradient-to-r dark:from-emerald-950/30 dark:to-slate-950/20 border-b border-slate-200 dark:border-slate-800/80 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  {selectedScheme.category}
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-2 leading-snug">{selectedScheme.name}</h3>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center w-7 h-7"
              >
                <i className="fi fi-rr-cross text-xs"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-550 dark:text-slate-455 uppercase tracking-wider mb-1.5">Description</h4>
                <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-normal">{selectedScheme.description}</p>
              </div>

              {/* Grid detail stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-205 dark:border-slate-800 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Target Standards</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedScheme.standardText}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Gender Eligibility</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedScheme.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Caste / Community</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedScheme.communityText}</span>
                </div>
              </div>

              {/* Rules and Eligibility Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-555 dark:text-slate-455 uppercase tracking-wider mb-2">Detailed Eligibility Rules</h4>
                <ul className="space-y-1.5">
                  {selectedScheme.eligibilityDetails.map((rule, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 font-normal">
                      <i className="fi fi-rr-check-circle text-emerald-500 dark:text-emerald-400 mt-0.5 text-[10px]"></i>
                      <span>{rule}</span>
                    </li>
                  ))}
                  {selectedScheme.incomeLimitText && (
                    <li className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 font-normal">
                      <i className="fi fi-rr-check-circle text-emerald-500 dark:text-emerald-400 mt-0.5 text-[10px]"></i>
                      <span className="font-semibold text-amber-600 dark:text-amber-400/90">{selectedScheme.incomeLimitText}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Documents Required */}
              <div>
                <h4 className="text-xs font-bold text-slate-555 dark:text-slate-455 uppercase tracking-wider mb-2">Required Documents</h4>
                <ul className="space-y-1.5">
                  {selectedScheme.documentsRequired.map((doc, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 font-normal">
                      <i className="fi fi-rr-document text-indigo-500 dark:text-indigo-400 mt-0.5 text-xs"></i>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critical meta parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-505 dark:text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">Application Deadline</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">{selectedScheme.deadline}</span>
                </div>
                <div>
                  <span className="text-slate-505 dark:text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">Contact Person</span>
                  <span className="text-slate-200 font-semibold">{selectedScheme.contactDetails}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer (responsive flex) */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Scholarship Amount:</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{selectedScheme.amountText}</span>
              </div>
              <div className="flex gap-2 justify-end items-center">
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all duration-200"
                >
                  Close
                </button>
                {applications.some(app => app.scheme.toLowerCase().includes(selectedScheme.name.toLowerCase()) || selectedScheme.name.toLowerCase().includes(app.scheme.toLowerCase())) ? (
                  <span className="px-4 py-2 bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                    <i className="fi fi-rr-check-circle"></i> Applied
                  </span>
                ) : (
                  <div className="text-[11px] text-right text-slate-500 dark:text-slate-400 flex flex-col justify-center font-normal shrink-0">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">To Apply:</span>
                    <span>Contact Class Teacher</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
