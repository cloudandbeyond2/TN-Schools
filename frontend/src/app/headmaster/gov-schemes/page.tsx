"use client";

import React, { useState, useEffect, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

/* ------------------------------- Types ------------------------------- */

type Category = "Student Scheme" | "Scholarship" | "Welfare Program";
type SchemeStatus = "Active" | "Completed" | "On Hold" | "Pending Approval";
type BenStatus = "Pending" | "Disbursed";

interface SchemeMaster {
  id: string;
  name: string;
  nameTa: string;
  category: Category;
  targetClasses: string[]; // e.g. ["11"] or ["12"] or ["6","7","8"]
  targetGroup: string;
  benefit: string;
  department: string;
  link?: string;
  description: string;
  disbursedClasses: string[]; // Classes HM has disbursed to e.g. ["11"]
}

interface BeneficiaryRecord {
  id: string;
  studentName: string;
  classSection: string;
  emisId: string;
  schemeId: string;
  schemeName: string;
  status: BenStatus;
  updatedOn: string;
}

const MASTER_SCHEMES: SchemeMaster[] = [
  {
    id: "textbooks",
    name: "Free Textbooks & Notebooks",
    nameTa: "இலவச பாடப்புத்தகங்கள்",
    category: "Welfare Program",
    targetClasses: ["6", "7", "8", "9", "10", "11", "12"],
    targetGroup: "Classes 6 to 12 Govt & Aided School Students",
    benefit: "Complete textbook and notebook combo",
    department: "School Education Dept.",
    description: "Full set of curriculum textbooks distributed at academic start.",
    disbursedClasses: [],
  },
  {
    id: "buspass",
    name: "Free Bus Pass Scheme",
    nameTa: "இலவச பேருந்துப் பயண அட்டை",
    category: "Welfare Program",
    targetClasses: ["6", "7", "8", "9", "10", "11", "12"],
    targetGroup: "Classes 6 to 12 All School Students",
    benefit: "Free State Bus Travel Pass (TNSTC)",
    department: "Transport Department",
    link: "https://www.tnstc.in",
    description: "Free travel pass between home and school on state transport buses.",
    disbursedClasses: [],
  },
  {
    id: "bicycles",
    name: "Free Bicycles Scheme",
    nameTa: "இலவச மிதிவண்டி திட்டம்",
    category: "Welfare Program",
    targetClasses: ["9", "10", "11", "12"],
    targetGroup: "Classes 9 to 12 Govt & Aided School Students",
    benefit: "High-grade road bicycle",
    department: "School Education Dept.",
    description: "Free bicycles provided to secondary students to ease daily school commute.",
    disbursedClasses: [],
  },
  {
    id: "laptops",
    name: "Free Laptops Scheme",
    nameTa: "இலவச மடிக்கணினி திட்டம்",
    category: "Welfare Program",
    targetClasses: ["10", "11", "12"],
    targetGroup: "Classes 10 to 12 Govt & Aided School Students",
    benefit: "Computing Laptop with study tools",
    department: "School Education Dept.",
    description: "Free laptops for higher secondary students to support digital learning.",
    disbursedClasses: [],
  },
  {
    id: "uniforms",
    name: "Free Uniforms & Footwear",
    nameTa: "இலவச சீருடை மற்றும் காலணிகள்",
    category: "Welfare Program",
    targetClasses: ["6", "7", "8"],
    targetGroup: "Classes 6 to 8 Govt School Students",
    benefit: "4 uniform sets + 1 pair footwear",
    department: "Social Welfare Dept.",
    description: "Annual distribution of school uniforms and shoes for middle school students.",
    disbursedClasses: [],
  },
  {
    id: "noonmeal",
    name: "Free Noon Meal Scheme",
    nameTa: "சத்துணவு திட்டம்",
    category: "Welfare Program",
    targetClasses: ["6", "7", "8"],
    targetGroup: "Classes 6 to 8 Govt School Students",
    benefit: "Nutritious hot meal daily",
    department: "Social Welfare Dept.",
    description: "Daily nutritious meals served at school for middle school students.",
    disbursedClasses: [],
  },
  {
    id: "naanmudhalvan",
    name: "Naan Mudhalvan Skill Training",
    nameTa: "நான் முதல்வன் திறன் பயிற்சி",
    category: "Student Scheme",
    targetClasses: ["9", "10", "11", "12"],
    targetGroup: "High School & HSC Students (Grades 9-12)",
    benefit: "Free Skill Training & Career Mentorship",
    department: "TN Skill Development Corp",
    link: "https://www.naanmudhalvan.tn.gov.in",
    description: "State skill enhancement platform for career guidance and competitive skills.",
    disbursedClasses: [],
  },
  {
    id: "pudhumai_pudhalvan",
    name: "Pudhumai Penn / Tamil Pudhalvan Scheme",
    nameTa: "புதுமைப் பெண் / தமிழ்ப் புதல்வன் திட்டம்",
    category: "Scholarship",
    targetClasses: ["11", "12"],
    targetGroup: "Class 11 & 12 Govt School Graduates entering Higher Education",
    benefit: "₹1,000 / month higher study allowance",
    department: "Social Welfare / BC/MBC Dept.",
    link: "https://penkalvi.tn.gov.in",
    description: "Monthly financial assistance for government school students joining college.",
    disbursedClasses: [],
  },
  {
    id: "7_5_reservation",
    name: "7.5% Preferential Reservation",
    nameTa: "7.5% முன்னுரிமை இடஒதுக்கீடு",
    category: "Scholarship",
    targetClasses: ["11", "12"],
    targetGroup: "Class 11 & 12 Govt School Aspirants for Professional Courses",
    benefit: "7.5% Quota in Engineering / Medical Colleges",
    department: "Higher Education Dept.",
    link: "https://www.tneaonline.org",
    description: "Special government school quota for professional degree admissions.",
    disbursedClasses: [],
  },
  {
    id: "trusts",
    name: "TRUSTS Scholarship Exam",
    nameTa: "டிரஸ்ட் உதவித்தொகை தேர்வு",
    category: "Scholarship",
    targetClasses: ["9"],
    targetGroup: "Class 9 Govt School Students (Income < ₹2.5L)",
    benefit: "₹1,000 / year talent search allowance",
    department: "Directorate of Govt Examinations",
    description: "Tamil Nadu Rural Students Talent Search Examination with financial stipend.",
    disbursedClasses: [],
  },
];

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function GovSchemesPage() {
  const { lang } = usePortalLanguage();
  const [activeTab, setActiveTab] = useState<"schemes" | "beneficiaries" | "logs">("schemes");
  const [masterSchemes, setMasterSchemes] = useState<SchemeMaster[]>(MASTER_SCHEMES);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRecord[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Link Editing Modal State
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [inputLink, setInputLink] = useState("");

  // Tab 1 Schemes Filter & Search State
  const [schemeSearchQuery, setSchemeSearchQuery] = useState("");
  const [schemeCategoryFilter, setSchemeCategoryFilter] = useState<string>("All");

  // Tab 2 Beneficiaries Filter, Search & Pagination State
  const [benSearchQuery, setBenSearchQuery] = useState("");
  const [benClassFilter, setBenClassFilter] = useState("All");
  const [benStatusFilter, setBenStatusFilter] = useState("All");
  const [benPage, setBenPage] = useState(1);
  const benPageSize = 8;

  // Initialize clean state on mount & fetch from backend API
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        let parsed: Record<string, { disbursedClasses: string[]; link?: string }> | null = null;
        let fetchedBens: BeneficiaryRecord[] | null = null;

        // Try Next.js API first
        try {
          const res = await fetch("/api/headmaster/schemes/allocations");
          const json = await res.json();
          if (json.success && json.data && json.data.allocations && Object.keys(json.data.allocations).length > 0) {
            parsed = json.data.allocations;
            if (Array.isArray(json.data.beneficiaries)) fetchedBens = json.data.beneficiaries;
          }
        } catch (apiErr) {}

        // Try Express backend API
        if (!parsed) {
          try {
            const res = await fetch(`${API_BASE}/api/headmaster/schemes/allocations`);
            const json = await res.json();
            if (json.success && json.data && json.data.allocations && Object.keys(json.data.allocations).length > 0) {
              parsed = json.data.allocations;
              if (Array.isArray(json.data.beneficiaries)) fetchedBens = json.data.beneficiaries;
            }
          } catch (expressErr) {}
        }

        // Fallback to localStorage if API returned empty
        if (!parsed) {
          const savedAlloc = localStorage.getItem("tn_schemes_allocations_v2") || localStorage.getItem("tn_schemes_allocations");
          if (savedAlloc) {
            parsed = JSON.parse(savedAlloc);
          }
        }

        if (parsed) {
          setMasterSchemes((prev) =>
            prev.map((s) => ({
              ...s,
              disbursedClasses: Array.isArray(parsed![s.id]?.disbursedClasses)
                ? parsed![s.id].disbursedClasses.map(String)
                : [],
              link: parsed![s.id]?.link ?? s.link,
            }))
          );
        }

        if (fetchedBens) {
          setBeneficiaries(fetchedBens);
        } else {
          const savedBen = localStorage.getItem("tn_schemes_beneficiaries");
          if (savedBen) {
            setBeneficiaries(JSON.parse(savedBen));
          }
        }
      } catch (e) {
        console.error("Failed to load scheme allocations:", e);
      }
    };

    fetchAllocations();
  }, []);

  // Save to localStorage & backend APIs & broadcast event to sync with Student Portal
  const saveAllocations = (updated: SchemeMaster[], updatedBens?: BeneficiaryRecord[]) => {
    const allocObj: Record<string, { disbursedClasses: string[]; link?: string }> = {};
    updated.forEach((s) => {
      allocObj[s.id] = { disbursedClasses: s.disbursedClasses.map(String), link: s.link };
    });
    localStorage.setItem("tn_schemes_allocations_v2", JSON.stringify(allocObj));
    localStorage.setItem("tn_schemes_allocations", JSON.stringify(allocObj));
    if (updatedBens) {
      localStorage.setItem("tn_schemes_beneficiaries", JSON.stringify(updatedBens));
    }
    
    // Broadcast via BroadcastChannel & window storage event for instant cross-tab sync
    try {
      window.dispatchEvent(new Event("storage"));
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("tn_schemes_channel");
        bc.postMessage({ type: "SCHEMES_UPDATED", allocations: allocObj, beneficiaries: updatedBens });
        bc.close();
      }
    } catch (bcErr) {}

    // Async sync to Next.js API & Express backend API
    const payload = JSON.stringify({ allocations: allocObj, beneficiaries: updatedBens || beneficiaries });
    const headers = { "Content-Type": "application/json" };
    fetch("/api/headmaster/schemes/allocations", { method: "POST", headers, body: payload }).catch(() => {});
    fetch(`${API_BASE}/api/headmaster/schemes/allocations`, { method: "POST", headers, body: payload }).catch(() => {});
  };

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Bulk disburse scheme to all eligible classes
  const handleBulkDisburse = (schemeId: string, classNum: string) => {
    const updated = masterSchemes.map((s) => {
      if (s.id === schemeId) {
        const hasClass = s.disbursedClasses.includes(classNum);
        const nextClasses = hasClass
          ? s.disbursedClasses.filter((c) => c !== classNum)
          : [...s.disbursedClasses, classNum];
        return { ...s, disbursedClasses: nextClasses };
      }
      return s;
    });
    setMasterSchemes(updated);

    const scheme = updated.find((s) => s.id === schemeId);
    const isNowDisbursed = scheme?.disbursedClasses.includes(classNum);

    // Dynamic beneficiary logging
    let nextBens = beneficiaries;
    if (isNowDisbursed && scheme) {
      const today = new Date().toISOString().split("T")[0];
      const newLogs: BeneficiaryRecord[] = [
        {
          id: `ben-${Date.now()}-1`,
          studentName: `Class ${classNum} Student Batch`,
          classSection: `${classNum}A`,
          emisId: `3301234567${classNum}`,
          schemeId: scheme.id,
          schemeName: scheme.name,
          status: "Disbursed",
          updatedOn: today,
        },
      ];
      const filtered = beneficiaries.filter((b) => !(b.schemeId === scheme.id && b.classSection.startsWith(classNum)));
      nextBens = [...newLogs, ...filtered];
      setBeneficiaries(nextBens);
    } else if (scheme) {
      nextBens = beneficiaries.filter((b) => !(b.schemeId === scheme.id && b.classSection.startsWith(classNum)));
      setBeneficiaries(nextBens);
    }

    saveAllocations(updated, nextBens);

    showToastMsg(
      isNowDisbursed
        ? `✓ Status set to DISBURSED for Class ${classNum} under "${scheme?.name}".`
        : `Status reset to ELIGIBLE for Class ${classNum} under "${scheme?.name}".`
    );
  };

  // Update individual beneficiary status (Pending Verification / Approved / Disbursed)
  const handleUpdateBeneficiaryStatus = (id: string, newStatus: BenStatus) => {
    const updatedBens = beneficiaries.map((b) => (b.id === id ? { ...b, status: newStatus } : b));
    setBeneficiaries(updatedBens);

    // Dynamic sync: recalculate disbursedClasses for masterSchemes based on active Disbursed beneficiaries
    const updatedMaster = masterSchemes.map((s) => {
      const activeDisbursedClasses = updatedBens
        .filter((b) => b.schemeId === s.id && b.status === "Disbursed")
        .map((b) => b.classSection.replace(/\D/g, ""));
      return {
        ...s,
        disbursedClasses: Array.from(new Set(activeDisbursedClasses)),
      };
    });

    setMasterSchemes(updatedMaster);
    saveAllocations(updatedMaster, updatedBens);
    showToastMsg(`✓ Status updated to "${newStatus}". Disbursed balance updated.`);
  };

  // Save updated application link for a scheme
  const handleSaveLink = (schemeId: string) => {
    const updated = masterSchemes.map((s) => (s.id === schemeId ? { ...s, link: inputLink.trim() } : s));
    setMasterSchemes(updated);
    saveAllocations(updated, beneficiaries);
    setEditingSchemeId(null);
    setInputLink("");
    showToastMsg("✓ Application link updated & sent to student portal.");
  };

  // Reset all class allocations back to clean state (all Eligible)
  const handleResetAll = () => {
    localStorage.removeItem("tn_schemes_allocations_v2");
    localStorage.removeItem("tn_schemes_allocations");
    const resetMaster = MASTER_SCHEMES.map((s) => ({ ...s, disbursedClasses: [] }));
    setMasterSchemes(resetMaster);
    setBeneficiaries([]);
    saveAllocations(resetMaster, []);
    showToastMsg("✓ All scheme allocations reset. All student statuses set to ELIGIBLE.");
  };

  // Tab 1 Filtered Schemes
  const filteredSchemes = useMemo(() => {
    return masterSchemes.filter((s) => {
      const q = schemeSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nameTa.includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      const matchesCategory =
        schemeCategoryFilter === "All" || s.category === schemeCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [masterSchemes, schemeSearchQuery, schemeCategoryFilter]);

  // Tab 2 Filtered & Paginated Beneficiaries
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      const q = benSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.studentName.toLowerCase().includes(q) ||
        b.emisId.toLowerCase().includes(q) ||
        b.schemeName.toLowerCase().includes(q);
      const matchesClass =
        benClassFilter === "All" || b.classSection.startsWith(benClassFilter.replace("Class ", ""));
      const matchesStatus =
        benStatusFilter === "All" || b.status === benStatusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [beneficiaries, benSearchQuery, benClassFilter, benStatusFilter]);

  const totalBenPages = Math.ceil(filteredBeneficiaries.length / benPageSize) || 1;
  const paginatedBeneficiaries = useMemo(() => {
    const start = (benPage - 1) * benPageSize;
    return filteredBeneficiaries.slice(start, start + benPageSize);
  }, [filteredBeneficiaries, benPage, benPageSize]);

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "அரசு திட்ட மேலாண்மை" : "Government Scheme Allocation & Management"}
      subtitle={lang === "தமிழ்" ? "பள்ளி மாணவர்களுக்கான நலத்திட்டங்கள் மற்றும் விதரணங்களை நிர்வகிக்கவும்." : "Allocate school welfare schemes, trigger bulk student distributions, and manage application links."}
      avatarLetter="H"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Header Banner with Explicit High-Contrast Background & Text Colors */}
      <div
        className="rounded-3xl p-6 mb-6 relative overflow-hidden shadow-xl border border-blue-500/40"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%)",
          color: "#ffffff",
        }}
      >
        <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 select-none">🏛️</div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-xl sm:text-2xl font-black uppercase tracking-wider !text-white drop-shadow-sm" style={{ color: "#ffffff" }}>
              {lang === "தமிழ்" ? "அரசு நலத்திட்டங்கள் மேலாண்மை" : "Government Scheme Control Center"}
            </div>
            <p className="text-xs mt-1.5 max-w-xl font-semibold leading-relaxed" style={{ color: "#e2e8f0" }}>
              {lang === "தமிழ்"
                ? "மாணவர்களுக்கான அரசு நலத்திட்டங்களை வகுப்புகள் வாரியாக வழங்கி நிலையை உடனுக்குடன் மாற்றவும்."
                : "Select eligible classes to disburse welfare schemes seamlessly. All distribution updates sync automatically to student portals in real time!"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetAll}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all hover:scale-105 shadow-md"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.4)",
              }}
              title="Reset all class allocations back to Eligible"
            >
              🔄 Reset All Allocations
            </button>
            <div className="flex gap-2 text-center">
              <div
                className="px-4 py-2 rounded-2xl"
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                }}
              >
                <div className="text-xl font-black" style={{ color: "#ffffff" }}>{masterSchemes.length}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#cbd5e1" }}>Schemes</div>
              </div>
              <div
                className="px-4 py-2 rounded-2xl"
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                }}
              >
                <div className="text-xl font-black" style={{ color: "#34d399" }}>
                  {masterSchemes.reduce((acc, s) => acc + s.disbursedClasses.length, 0)}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#cbd5e1" }}>Disbursed</div>
              </div>
              <div
                className="px-4 py-2 rounded-2xl"
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                }}
              >
                <div className="text-xl font-black" style={{ color: "#fbbf24" }}>
                  {beneficiaries.filter((b) => b.status === "Pending").length}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#cbd5e1" }}>Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6 w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab("schemes")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "schemes" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
          }`}
        >
          🏛️ Schemes & Class Allocations
        </button>
        <button
          onClick={() => setActiveTab("beneficiaries")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "beneficiaries" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
          }`}
        >
          👥 Student Beneficiaries Log
        </button>
      </div>

      {/* TAB 1: SCHEMES & ALLOCATIONS */}
      {activeTab === "schemes" && (
        <div className="space-y-4">
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
              <span className="text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                value={schemeSearchQuery}
                onChange={(e) => setSchemeSearchQuery(e.target.value)}
                placeholder="Search scheme name, department or description..."
                className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 font-medium"
              />
              {schemeSearchQuery && (
                <button onClick={() => setSchemeSearchQuery("")} className="text-xs text-slate-400 hover:text-white px-1">✕</button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Category:</span>
              {["All", "Welfare Program", "Student Scheme", "Scholarship"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSchemeCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    schemeCategoryFilter === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📋</span> Active Master Schemes ({filteredSchemes.length})
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              💡 Click class buttons to toggle **Disbursed** status for students in real time.
            </span>
          </div>

          {filteredSchemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="glass rounded-2xl p-5 border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                        {scheme.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">{scheme.department}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {lang === "தமிழ்" ? scheme.nameTa : scheme.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">{scheme.description}</p>
                    <div className="text-[11px] text-slate-300 font-semibold mb-4 bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                      🎁 <span className="text-slate-400">Benefit:</span> {scheme.benefit}
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-3 space-y-3">
                    {/* Class Disburse Toggles */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Target Eligible Classes (Click to Disburse):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scheme.targetClasses.map((cls) => {
                          const isDisbursed = scheme.disbursedClasses.includes(cls);
                          return (
                            <button
                              key={cls}
                              onClick={() => handleBulkDisburse(scheme.id, cls)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                isDisbursed
                                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                              }`}
                            >
                              <span>Class {cls}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                                  isDisbursed ? "bg-emerald-500/30 text-emerald-200" : "bg-slate-800 text-slate-500"
                                }`}
                              >
                                {isDisbursed ? "Disbursed" : "Set Disbursed"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official Link Management */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%]">
                        <span>🔗</span>
                        <span className="text-slate-500">Link:</span>
                        {scheme.link ? (
                          <a
                            href={scheme.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline truncate"
                          >
                            {scheme.link}
                          </a>
                        ) : (
                          <span className="italic text-slate-600">No portal link attached</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingSchemeId(scheme.id);
                          setInputLink(scheme.link || "");
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors"
                      >
                        ✏️ Edit Link
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center text-slate-500 border border-slate-800">
              No master schemes found matching search criteria.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BENEFICIARIES LOG */}
      {activeTab === "beneficiaries" && (
        <div className="glass rounded-2xl p-5 border border-slate-800 bg-slate-950/60 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>👥</span> Student Distribution Register ({filteredBeneficiaries.length})
            </h2>

            {/* Filters & Search Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white flex-1 min-w-[180px]">
                <span className="text-slate-400">🔍</span>
                <input
                  type="text"
                  value={benSearchQuery}
                  onChange={(e) => { setBenSearchQuery(e.target.value); setBenPage(1); }}
                  placeholder="Search student or EMIS..."
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
                />
                {benSearchQuery && (
                  <button onClick={() => setBenSearchQuery("")} className="text-slate-400 hover:text-white text-xs">✕</button>
                )}
              </div>

              <select
                value={benClassFilter}
                onChange={(e) => { setBenClassFilter(e.target.value); setBenPage(1); }}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="All">All Classes</option>
                {["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={benStatusFilter}
                onChange={(e) => { setBenStatusFilter(e.target.value); setBenPage(1); }}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Disbursed">Disbursed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  <th className="py-3 px-3">Student Batch</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">EMIS ID</th>
                  <th className="py-3 px-3">Scheme Name</th>
                  <th className="py-3 px-3">Distribution Status</th>
                  <th className="py-3 px-3">Updated On</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBeneficiaries.length > 0 ? (
                  paginatedBeneficiaries.map((b) => (
                    <tr key={b.id} className="border-b border-slate-900 hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-bold text-white">{b.studentName}</td>
                      <td className="py-3 px-3 text-slate-300 font-semibold">{b.classSection}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{b.emisId}</td>
                      <td className="py-3 px-3 text-blue-400 font-semibold">{b.schemeName}</td>
                      <td className="py-3 px-3">
                        <select
                          value={b.status === "Disbursed" ? "Disbursed" : "Pending"}
                          onChange={(e) => handleUpdateBeneficiaryStatus(b.id, e.target.value as BenStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold outline-none cursor-pointer border transition-colors ${
                            b.status === "Disbursed"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          <option value="Pending" className="bg-slate-900 text-amber-300 font-bold">Pending</option>
                          <option value="Disbursed" className="bg-slate-900 text-emerald-300 font-bold">Disbursed</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{b.updatedOn}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      No beneficiary records found matching active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredBeneficiaries.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-850 text-xs font-semibold text-slate-400">
              <div>
                Showing <span className="text-white font-bold">{((benPage - 1) * benPageSize) + 1}</span> to{" "}
                <span className="text-white font-bold">{Math.min(benPage * benPageSize, filteredBeneficiaries.length)}</span> of{" "}
                <span className="text-white font-bold">{filteredBeneficiaries.length}</span> records
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={benPage === 1}
                  onClick={() => setBenPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold text-white"
                >
                  ← Previous
                </button>
                <span className="px-3 py-1 bg-slate-900 rounded-lg text-xs font-bold text-blue-400 border border-slate-800">
                  Page {benPage} of {totalBenPages}
                </span>
                <button
                  disabled={benPage >= totalBenPages}
                  onClick={() => setBenPage((p) => Math.min(totalBenPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold text-white"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT LINK MODAL */}
      {editingSchemeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl border border-slate-700 p-6 bg-slate-950 text-white space-y-4">
            <h3 className="text-base font-bold">🔗 Attach / Edit Official Portal Link</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add an application or registration URL (e.g. TNEA portal, Penkalvi portal, Bus Pass info). Students will see an **Apply Now** button leading directly to this link.
            </p>
            <input
              type="url"
              value={inputLink}
              onChange={(e) => setInputLink(e.target.value)}
              placeholder="https://penkalvi.tn.gov.in"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingSchemeId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveLink(editingSchemeId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
              >
                Save & Broadcast Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-black px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl animate-bounce">
          {toast}
        </div>
      )}
    </PortalLayout>
  );
}
