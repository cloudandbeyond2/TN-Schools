"use client";

import React, { useMemo, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

/* ------------------------------- Types ------------------------------- */

type Category = "Student Scheme" | "Scholarship" | "Welfare Program";
type SchemeStatus = "Active" | "Completed" | "On Hold" | "Pending Approval";
type BenStatus = "Pending Verification" | "Verified" | "Approved" | "Disbursed";
type TabKey = "overview" | "schemes" | "beneficiaries" | "progress";

interface Milestone {
  id: number;
  label: string;
  done: boolean;
  targetDate: string;
}

interface Scheme {
  id: number;
  name: string;
  category: Category;
  department: string;
  targetGroup: string;
  benefit: string;
  budget: number;      // ₹ allotted for this school
  utilized: number;    // ₹ spent so far
  totalEligible: number;
  enrolled: number;
  disbursed: number;
  deadline: string;    // ISO date
  status: SchemeStatus;
  description: string;
  milestones: Milestone[];
}

interface Beneficiary {
  id: number;
  name: string;
  classSection: string;
  emisId: string;
  schemeId: number;
  status: BenStatus;
  updatedOn: string;
}

interface Activity {
  id: number;
  time: string;
  icon: string;
  text: string;
}

/* ----------------------------- Seed data ----------------------------- */

const SEED_SCHEMES: Scheme[] = [
  {
    id: 1, name: "Pudhumai Penn Scheme", category: "Student Scheme",
    department: "Social Welfare Dept.", targetGroup: "Class 12 Girls (College Aspirants)",
    benefit: "₹1,000 / month incentive", budget: 576000, utilized: 576000,
    totalEligible: 48, enrolled: 48, disbursed: 48,
    deadline: "2026-08-31", status: "Completed",
    description: "Monthly assistance of ₹1,000 for girl students who studied Classes 6–12 in government schools, credited until completion of undergraduate degree.",
    milestones: [
      { id: 1, label: "Eligible list pulled from EMIS", done: true, targetDate: "2026-06-05" },
      { id: 2, label: "Bank & Aadhaar seeding verified", done: true, targetDate: "2026-06-20" },
      { id: 3, label: "District office approval", done: true, targetDate: "2026-07-01" },
      { id: 4, label: "First tranche credited", done: true, targetDate: "2026-07-08" },
    ],
  },
  {
    id: 2, name: "Tamil Puthalvan Scheme", category: "Student Scheme",
    department: "BC/MBC Welfare Dept.", targetGroup: "Class 12 Boys (College Aspirants)",
    benefit: "₹1,000 / month incentive", budget: 504000, utilized: 468000,
    totalEligible: 42, enrolled: 39, disbursed: 36,
    deadline: "2026-09-15", status: "Active",
    description: "Monthly assistance of ₹1,000 for boys from government schools pursuing higher education, on the lines of Pudhumai Penn.",
    milestones: [
      { id: 1, label: "Eligible list pulled from EMIS", done: true, targetDate: "2026-06-05" },
      { id: 2, label: "Bank & Aadhaar seeding verified", done: true, targetDate: "2026-06-25" },
      { id: 3, label: "District office approval", done: true, targetDate: "2026-07-05" },
      { id: 4, label: "First tranche credited", done: false, targetDate: "2026-07-20" },
    ],
  },
  {
    id: 3, name: "Free Bicycle Scheme", category: "Welfare Program",
    department: "School Education Dept.", targetGroup: "Class 11 Students",
    benefit: "High-grade road bicycle", budget: 352000, utilized: 352000,
    totalEligible: 88, enrolled: 88, disbursed: 88,
    deadline: "2026-07-30", status: "Completed",
    description: "Free bicycles for Class 11 students of government and aided schools to ease daily commute and reduce dropouts.",
    milestones: [
      { id: 1, label: "Indent placed with district store", done: true, targetDate: "2026-05-15" },
      { id: 2, label: "Stock received & verified", done: true, targetDate: "2026-06-10" },
      { id: 3, label: "Distribution camp conducted", done: true, targetDate: "2026-06-28" },
      { id: 4, label: "Acknowledgements uploaded", done: true, targetDate: "2026-07-05" },
    ],
  },
  {
    id: 4, name: "Free Laptop Scheme", category: "Welfare Program",
    department: "School Education Dept.", targetGroup: "Class 12 Students",
    benefit: "Core computing laptop", budget: 2464000, utilized: 2090000,
    totalEligible: 112, enrolled: 112, disbursed: 95,
    deadline: "2026-08-20", status: "Active",
    description: "Government laptops for higher secondary students to support digital learning and skill development.",
    milestones: [
      { id: 1, label: "Student list ratified by HM", done: true, targetDate: "2026-05-30" },
      { id: 2, label: "Serial numbers allotted (ELCOT)", done: true, targetDate: "2026-06-18" },
      { id: 3, label: "Phase 1 distribution (95 units)", done: true, targetDate: "2026-07-02" },
      { id: 4, label: "Phase 2 distribution (17 units)", done: false, targetDate: "2026-07-25" },
    ],
  },
  {
    id: 5, name: "Free Uniforms & Textbooks", category: "Welfare Program",
    department: "School Education Dept.", targetGroup: "Classes 6 to 8",
    benefit: "4 uniform sets & textbook combo", budget: 468000, utilized: 360000,
    totalEligible: 156, enrolled: 156, disbursed: 120,
    deadline: "2026-07-31", status: "Active",
    description: "Four sets of uniforms and full textbook kits distributed at the start of the academic year under the Sarva Shiksha programme.",
    milestones: [
      { id: 1, label: "Size-wise indent submitted", done: true, targetDate: "2026-04-20" },
      { id: 2, label: "Textbook kits received", done: true, targetDate: "2026-05-25" },
      { id: 3, label: "Uniform stock received", done: true, targetDate: "2026-06-15" },
      { id: 4, label: "Class-wise distribution complete", done: false, targetDate: "2026-07-28" },
    ],
  },
  {
    id: 6, name: "Free Shoes & Socks", category: "Welfare Program",
    department: "School Education Dept.", targetGroup: "Classes 6 to 10",
    benefit: "1 pair school shoes + 2 socks", budget: 168000, utilized: 0,
    totalEligible: 280, enrolled: 280, disbursed: 0,
    deadline: "2026-09-30", status: "On Hold",
    description: "Footwear kits for all students of Classes 6–10. Awaiting stock verification report from the district supply officer.",
    milestones: [
      { id: 1, label: "Size survey completed", done: true, targetDate: "2026-06-10" },
      { id: 2, label: "Stock verification by district officer", done: false, targetDate: "2026-07-18" },
      { id: 3, label: "Distribution camp", done: false, targetDate: "2026-08-10" },
      { id: 4, label: "Acknowledgements uploaded", done: false, targetDate: "2026-08-20" },
    ],
  },
  {
    id: 7, name: "BC/MBC Welfare Scholarship", category: "Scholarship",
    department: "BC/MBC Welfare Dept.", targetGroup: "BC/MBC Students, Classes 9–12",
    benefit: "₹2,500 / year grant", budget: 150000, utilized: 87500,
    totalEligible: 60, enrolled: 52, disbursed: 35,
    deadline: "2026-08-05", status: "Active",
    description: "Annual pre-matric and post-matric grant for BC/MBC students, credited via DBT after community certificate verification.",
    milestones: [
      { id: 1, label: "Applications collected", done: true, targetDate: "2026-06-15" },
      { id: 2, label: "Community certificates verified", done: true, targetDate: "2026-06-30" },
      { id: 3, label: "HM sign-off & upload to portal", done: false, targetDate: "2026-07-15" },
      { id: 4, label: "DBT disbursement", done: false, targetDate: "2026-08-05" },
    ],
  },
  {
    id: 8, name: "SC/ST Special Scholarship", category: "Scholarship",
    department: "Adi Dravidar Welfare Dept.", targetGroup: "SC/ST Students, Classes 9–12",
    benefit: "₹4,500 / year grant", budget: 202500, utilized: 148500,
    totalEligible: 45, enrolled: 45, disbursed: 33,
    deadline: "2026-08-05", status: "Active",
    description: "Special scholarship for SC/ST students covering study material and hostel allowance, disbursed through the e-District portal.",
    milestones: [
      { id: 1, label: "Applications collected", done: true, targetDate: "2026-06-15" },
      { id: 2, label: "Certificates verified", done: true, targetDate: "2026-06-28" },
      { id: 3, label: "HM sign-off & upload to portal", done: true, targetDate: "2026-07-08" },
      { id: 4, label: "DBT disbursement", done: false, targetDate: "2026-08-05" },
    ],
  },
  {
    id: 9, name: "National Means-cum-Merit (NMMS)", category: "Scholarship",
    department: "Ministry of Education (GoI)", targetGroup: "Class 8 Merit Students",
    benefit: "₹12,000 / year till Class 12", budget: 96000, utilized: 0,
    totalEligible: 8, enrolled: 5, disbursed: 0,
    deadline: "2026-10-31", status: "Pending Approval",
    description: "Central merit scholarship for economically weaker students who clear the NMMS examination. Renewal verification pending at state nodal office.",
    milestones: [
      { id: 1, label: "NMMS exam qualifiers identified", done: true, targetDate: "2026-06-20" },
      { id: 2, label: "Income certificates collected", done: true, targetDate: "2026-07-05" },
      { id: 3, label: "NSP portal registration", done: false, targetDate: "2026-08-15" },
      { id: 4, label: "State nodal approval", done: false, targetDate: "2026-10-15" },
    ],
  },
];

const SEED_BENEFICIARIES: Beneficiary[] = [
  { id: 1,  name: "Praveen Kumar S.", classSection: "10A", emisId: "330123456711", schemeId: 7, status: "Disbursed",            updatedOn: "2026-07-02" },
  { id: 2,  name: "Shalini K.",       classSection: "12A", emisId: "330123456715", schemeId: 8, status: "Disbursed",            updatedOn: "2026-07-04" },
  { id: 3,  name: "Imran Khan J.",    classSection: "9B",  emisId: "330123456719", schemeId: 7, status: "Approved",             updatedOn: "2026-07-06" },
  { id: 4,  name: "Nivedha M.",       classSection: "10B", emisId: "330123456722", schemeId: 9, status: "Pending Verification", updatedOn: "2026-07-07" },
  { id: 5,  name: "Ajith Kumar R.",   classSection: "11C", emisId: "330123456726", schemeId: 7, status: "Approved",             updatedOn: "2026-07-05" },
  { id: 6,  name: "Fathima R.",       classSection: "12B", emisId: "330123456730", schemeId: 8, status: "Pending Verification", updatedOn: "2026-07-08" },
  { id: 7,  name: "Deepika V.",       classSection: "12A", emisId: "330123456733", schemeId: 1, status: "Disbursed",            updatedOn: "2026-07-08" },
  { id: 8,  name: "Karthik M.",       classSection: "12C", emisId: "330123456737", schemeId: 2, status: "Verified",             updatedOn: "2026-07-09" },
  { id: 9,  name: "Sowmiya P.",       classSection: "8A",  emisId: "330123456741", schemeId: 9, status: "Verified",             updatedOn: "2026-07-06" },
  { id: 10, name: "Vignesh S.",       classSection: "12B", emisId: "330123456745", schemeId: 4, status: "Approved",             updatedOn: "2026-07-09" },
  { id: 11, name: "Meena L.",         classSection: "7B",  emisId: "330123456749", schemeId: 5, status: "Disbursed",            updatedOn: "2026-07-01" },
  { id: 12, name: "Arun Prasad K.",   classSection: "11A", emisId: "330123456753", schemeId: 3, status: "Disbursed",            updatedOn: "2026-06-28" },
];

const SEED_ACTIVITY: Activity[] = [
  { id: 1, time: "Today, 9:40 AM",  icon: "💸", text: "SC/ST Scholarship — DBT batch of 12 students confirmed by treasury." },
  { id: 2, time: "Yesterday",       icon: "💻", text: "Free Laptop Scheme — Phase 1 acknowledgement sheets uploaded (95 units)." },
  { id: 3, time: "Jul 08",          icon: "✅", text: "Pudhumai Penn — first tranche credited for all 48 girls." },
  { id: 4, time: "Jul 07",          icon: "📋", text: "NMMS — 5 qualifiers registered; income certificates under review." },
  { id: 5, time: "Jul 05",          icon: "📦", text: "Free Shoes & Socks placed On Hold — awaiting district stock verification." },
];

/* ---------------------------- Small helpers --------------------------- */

const CATEGORY_META: Record<Category, { icon: string; color: string; badge: string }> = {
  "Student Scheme":  { icon: "🎓", color: "#3b82f6", badge: "badge-blue" },
  "Scholarship":     { icon: "🏅", color: "#a855f7", badge: "badge-blue" },
  "Welfare Program": { icon: "🤝", color: "#10b981", badge: "badge-green" },
};

const SCHEME_STATUS_BADGE: Record<SchemeStatus, string> = {
  Active: "badge-blue",
  Completed: "badge-green",
  "On Hold": "badge-yellow",
  "Pending Approval": "badge-yellow",
};

const BEN_STATUS_BADGE: Record<BenStatus, string> = {
  "Pending Verification": "badge-yellow",
  Verified: "badge-blue",
  Approved: "badge-blue",
  Disbursed: "badge-green",
};

const BEN_NEXT: Partial<Record<BenStatus, { next: BenStatus; action: string }>> = {
  "Pending Verification": { next: "Verified", action: "Verify EMIS" },
  Verified: { next: "Approved", action: "Approve" },
  Approved: { next: "Disbursed", action: "Mark Disbursed" },
};

function inr(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(iso: string): number {
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - Date.now()) / 86400000);
}

function milestonePct(s: Scheme): number {
  if (s.milestones.length === 0) return 0;
  return Math.round((s.milestones.filter((m) => m.done).length / s.milestones.length) * 100);
}

function coveragePct(s: Scheme): number {
  return s.totalEligible > 0 ? Math.round((s.disbursed / s.totalEligible) * 100) : 0;
}

/* ------------------------------- Page -------------------------------- */

export default function GovSchemesPage() {
  const { lang } = usePortalLanguage();
  const [schemes, setSchemes] = useState<Scheme[]>(SEED_SCHEMES);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(SEED_BENEFICIARIES);
  const [activity, setActivity] = useState<Activity[]>(SEED_ACTIVITY);

  const [tab, setTab] = useState<TabKey>("overview");
  const [toast, setToast] = useState<{ text: string; tone: "ok" | "warn" } | null>(null);

  // Schemes tab state
  const [schemeSearch, setSchemeSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"All" | Category>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | SchemeStatus>("All");
  const [expandedScheme, setExpandedScheme] = useState<number | null>(null);
  const [showAddScheme, setShowAddScheme] = useState(false);

  // Beneficiaries tab state
  const [benSearch, setBenSearch] = useState("");
  const [benSchemeFilter, setBenSchemeFilter] = useState<number | "All">("All");
  const [benStatusFilter, setBenStatusFilter] = useState<"All" | BenStatus>("All");
  const [showAddBen, setShowAddBen] = useState(false);

  // Progress tab state
  const [progressSchemeId, setProgressSchemeId] = useState<number>(2);

  const showToast = (text: string, tone: "ok" | "warn" = "ok") => {
    setToast({ text, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const logActivity = (icon: string, text: string) => {
    setActivity((prev) => [{ id: Date.now(), time: "Just now", icon, text }, ...prev].slice(0, 12));
  };

  /* --------------------------- Derived stats -------------------------- */

  const stats = useMemo(() => {
    const active = schemes.filter((s) => s.status === "Active").length;
    const totalEligible = schemes.reduce((a, s) => a + s.totalEligible, 0);
    const totalDisbursed = schemes.reduce((a, s) => a + s.disbursed, 0);
    const totalBudget = schemes.reduce((a, s) => a + s.budget, 0);
    const totalUtilized = schemes.reduce((a, s) => a + s.utilized, 0);
    const avgProgress = schemes.length
      ? Math.round(schemes.reduce((a, s) => a + milestonePct(s), 0) / schemes.length)
      : 0;
    return {
      active,
      total: schemes.length,
      totalEligible,
      totalDisbursed,
      coverage: totalEligible ? Math.round((totalDisbursed / totalEligible) * 100) : 0,
      totalBudget,
      totalUtilized,
      budgetPct: totalBudget ? Math.round((totalUtilized / totalBudget) * 100) : 0,
      avgProgress,
    };
  }, [schemes]);

  const benStatusCounts = useMemo(() => {
    const counts: Record<BenStatus, number> = { "Pending Verification": 0, Verified: 0, Approved: 0, Disbursed: 0 };
    beneficiaries.forEach((b) => { counts[b.status] += 1; });
    return counts;
  }, [beneficiaries]);

  /* ------------------------------ Actions ----------------------------- */

  const advanceBeneficiary = (benId: number) => {
    const ben = beneficiaries.find((b) => b.id === benId);
    if (!ben) return;
    const step = BEN_NEXT[ben.status];
    if (!step) return;
    setBeneficiaries((prev) =>
      prev.map((b) => (b.id === benId ? { ...b, status: step.next, updatedOn: new Date().toISOString().slice(0, 10) } : b))
    );
    const scheme = schemes.find((s) => s.id === ben.schemeId);
    if (step.next === "Disbursed" && scheme) {
      setSchemes((prev) =>
        prev.map((s) =>
          s.id === ben.schemeId ? { ...s, disbursed: Math.min(s.disbursed + 1, s.totalEligible) } : s
        )
      );
    }
    logActivity(step.next === "Disbursed" ? "💸" : "✅", `${ben.name} → ${step.next} under ${scheme?.name ?? "scheme"}.`);
    showToast(`✓ ${ben.name} moved to "${step.next}"${scheme ? ` — ${scheme.name}` : ""}.`);
  };

  const toggleMilestone = (schemeId: number, milestoneId: number) => {
    setSchemes((prev) =>
      prev.map((s) => {
        if (s.id !== schemeId) return s;
        const milestones = s.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m));
        const allDone = milestones.every((m) => m.done);
        const status: SchemeStatus =
          allDone && s.disbursed >= s.totalEligible ? "Completed" : s.status === "Completed" && !allDone ? "Active" : s.status;
        return { ...s, milestones, status };
      })
    );
    const s = schemes.find((x) => x.id === schemeId);
    const m = s?.milestones.find((x) => x.id === milestoneId);
    if (s && m) {
      logActivity("🚩", `${s.name} — milestone "${m.label}" marked ${m.done ? "pending" : "complete"}.`);
      showToast(`Milestone ${m.done ? "reopened" : "completed"}: ${m.label}`);
    }
  };

  const logDistribution = (schemeId: number, units: number) => {
    const s = schemes.find((x) => x.id === schemeId);
    if (!s || units <= 0) return;
    const newCount = Math.min(s.disbursed + units, s.totalEligible);
    setSchemes((prev) =>
      prev.map((x) =>
        x.id === schemeId
          ? { ...x, disbursed: newCount, status: newCount === x.totalEligible && x.milestones.every((m) => m.done) ? "Completed" : x.status }
          : x
      )
    );
    logActivity("📦", `${s.name} — ${newCount - s.disbursed} unit(s) distribution logged (${newCount}/${s.totalEligible}).`);
    showToast(`✓ Distribution posted for ${s.name}. Coverage now ${newCount}/${s.totalEligible}.`);
  };

  /* --------------------------- Filtered lists ------------------------- */

  const filteredSchemes = schemes.filter((s) => {
    const q = schemeSearch.trim().toLowerCase();
    const matchesQ = !q || s.name.toLowerCase().includes(q) || s.targetGroup.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
    const matchesCat = catFilter === "All" || s.category === catFilter;
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesQ && matchesCat && matchesStatus;
  });

  const filteredBens = beneficiaries.filter((b) => {
    const q = benSearch.trim().toLowerCase();
    const matchesQ = !q || b.name.toLowerCase().includes(q) || b.emisId.includes(q) || b.classSection.toLowerCase().includes(q);
    const matchesScheme = benSchemeFilter === "All" || b.schemeId === benSchemeFilter;
    const matchesStatus = benStatusFilter === "All" || b.status === benStatusFilter;
    return matchesQ && matchesScheme && matchesStatus;
  });

  const upcomingDeadlines = [...schemes]
    .filter((s) => s.status !== "Completed")
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  /* ------------------------------ Render ------------------------------ */

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview",       label: lang === "தமிழ்" ? "மேலோட்டம்"         : "Overview",        icon: "📊" },
    { key: "schemes",        label: lang === "தமிழ்" ? "திட்டங்கள்"        : "Schemes",         icon: "🏛️" },
    { key: "beneficiaries",  label: lang === "தமிழ்" ? "பயனாளர்கள்"        : "Beneficiaries",   icon: "👥" },
    { key: "progress",       label: lang === "தமிழ்" ? "செயலாக்கம்"        : "Implementation",  icon: "🚧" },
  ];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "அரசு திட்ட மேலாண்மை" : "Government Scheme Management"}
      subtitle={lang === "தமிழ்" ? "மாணவர்களுக்கான திட்டங்கள், உதவிதொகைகள் மற்றும் நலன் திட்டங்களை கண்காணிக்கவும்." : "Track and manage student schemes, scholarships and welfare programs."}
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Hero banner */}
      <div className="rounded-2xl p-6 mb-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 text-[120px] opacity-15 select-none" aria-hidden>🏛️</div>
        <div className="text-lg font-black" style={{ color: "#fff" }}>{lang === "தமிழ்" ? "அரசு திட்ட மேலாண்மை" : "Government Scheme Management"}</div>
        <p className="text-xs mt-1 max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
          {lang === "தமிழ்" ? "மாணவர் திட்டங்கள், உதவிதொகைகள் மற்றும் நலன் திட்டங்களை கண்காணிக்க ஒரு மேஜை. பயனைதாரர்களை சேர்த்து EMIS பதிவுகளை சரிபார்த்திது, விதரணங்களை பதிவு செய்து இயக்க நிலைகளை கண்காணிக்கவும்." : "Single desk to track student schemes, scholarships and welfare programs — enrol beneficiaries, verify EMIS records, log distributions and monitor implementation milestones."}
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.total}</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "திட்டங்கள்" : "Schemes"}</span></div>
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{stats.totalDisbursed}</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "பயன்கள் விதரிக்கப்பட்டன" : "Benefits delivered"}</span></div>
          <div><span className="text-xl font-black" style={{ color: "#fff" }}>{inr(stats.totalUtilized)}</span><span className="text-[10px] font-bold ml-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>{lang === "தமிழ்" ? "நிதியம் பயன்படுத்தப்பட்டது" : "Funds utilized"}</span></div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t.key ? "bg-blue-600" : "text-slate-400 hover:text-white hover:bg-slate-800"
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
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Schemes</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-blue-400">{stats.active}</span>
                <span className="text-[10px] text-slate-400 font-bold">of {stats.total} total</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-semibold">
                {schemes.filter((s) => s.status === "Completed").length} completed · {schemes.filter((s) => s.status === "On Hold" || s.status === "Pending Approval").length} awaiting action
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Benefit Coverage</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-emerald-400">{stats.coverage}%</span>
                <span className="text-[10px] text-slate-400 font-bold">{stats.totalDisbursed}/{stats.totalEligible} delivered</span>
              </div>
              <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.coverage}%` }} />
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Budget Utilization</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-white">{inr(stats.totalUtilized)}</span>
                <span className="text-[10px] text-slate-400 font-bold">of {inr(stats.totalBudget)} ({stats.budgetPct}%)</span>
              </div>
              <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.budgetPct}%` }} />
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Implementation</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-amber-400">{stats.avgProgress}%</span>
                <span className="text-[10px] text-slate-400 font-bold">milestones cleared</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-semibold">
                Across all {stats.total} schemes this academic year.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Category coverage bars */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
              <h2 className="text-base font-semibold text-white mb-1">📈 Coverage by Category</h2>
              <p className="text-xs text-slate-500 mb-5">Benefits delivered vs eligible students, grouped by scheme type.</p>
              <div className="space-y-5">
                {(["Student Scheme", "Scholarship", "Welfare Program"] as Category[]).map((cat) => {
                  const group = schemes.filter((s) => s.category === cat);
                  const eligible = group.reduce((a, s) => a + s.totalEligible, 0);
                  const disbursed = group.reduce((a, s) => a + s.disbursed, 0);
                  const pct = eligible ? Math.round((disbursed / eligible) * 100) : 0;
                  const meta = CATEGORY_META[cat];
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-300">{meta.icon} {cat} <span className="text-slate-500 font-semibold">· {group.length} scheme{group.length !== 1 ? "s" : ""}</span></span>
                        <span className="text-[11px] font-bold text-slate-400">{disbursed}/{eligible} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Deadlines */}
              <h3 className="text-sm font-semibold text-white mt-7 mb-3">⏰ Upcoming Deadlines</h3>
              <div className="space-y-2">
                {upcomingDeadlines.map((s) => {
                  const d = daysLeft(s.deadline);
                  const urgent = d <= 21;
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{CATEGORY_META[s.category].icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">{fmtDate(s.deadline)} · {s.status}</div>
                        </div>
                      </div>
                      <span className={`badge shrink-0 ${urgent ? "badge-red" : d <= 45 ? "badge-yellow" : "badge-blue"}`}>
                        {d < 0 ? "Overdue" : `${d} days`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column: beneficiary donut + activity */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6 border border-slate-800">
                <h2 className="text-base font-semibold text-white mb-1">👥 Beneficiary Pipeline</h2>
                <p className="text-xs text-slate-500 mb-4">Individual records on this desk, by verification stage.</p>
                <div className="flex items-center gap-5">
                  <DonutChart counts={benStatusCounts} total={beneficiaries.length} />
                  <div className="space-y-2 flex-1">
                    {(Object.keys(benStatusCounts) as BenStatus[]).map((st) => (
                      <div key={st} className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: DONUT_COLORS[st] }} />
                          {st}
                        </span>
                        <span className="text-[11px] font-black text-slate-300">{benStatusCounts[st]}</span>
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

      {/* ============================ SCHEMES ============================ */}
      {tab === "schemes" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">🏛️ Scheme Registry</h2>
              <p className="text-xs text-slate-500">Student schemes, scholarships and welfare programs running at this school.</p>
            </div>
            <button
              onClick={() => setShowAddScheme(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs transition-colors w-fit"
              style={{ color: "#fff" }}
            >
              + Register New Scheme
            </button>
          </div>

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              placeholder="🔍 Search scheme, target group or department…"
              value={schemeSearch}
              onChange={(e) => setSchemeSearch(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value as typeof catFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              <option>Student Scheme</option>
              <option>Scholarship</option>
              <option>Welfare Program</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option>Active</option>
              <option>Completed</option>
              <option>On Hold</option>
              <option>Pending Approval</option>
            </select>
          </div>

          {/* Scheme cards */}
          <div className="space-y-3">
            {filteredSchemes.map((s) => {
              const cov = coveragePct(s);
              const prog = milestonePct(s);
              const expanded = expandedScheme === s.id;
              const meta = CATEGORY_META[s.category];
              return (
                <div key={s.id} className="bg-slate-900/60 rounded-xl border border-slate-850 overflow-hidden">
                  <button
                    onClick={() => setExpandedScheme(expanded ? null : s.id)}
                    className="w-full text-left p-4 hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`badge ${meta.badge}`}>{meta.icon} {s.category}</span>
                          <span className={`badge ${SCHEME_STATUS_BADGE[s.status]}`}>{s.status}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{s.department}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{s.name}</h3>
                        <div className="text-xs text-slate-400 mt-0.5">{s.targetGroup} · {s.benefit}</div>
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Coverage</div>
                          <div className="text-sm font-black" style={{ color: meta.color }}>{cov}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Milestones</div>
                          <div className="text-sm font-black text-slate-300">{prog}%</div>
                        </div>
                        <span className={`text-slate-500 text-xs transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▼</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cov}%`, background: meta.color }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">{s.disbursed}/{s.totalEligible}</span>
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-850">
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{s.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <MiniStat label="Eligible" value={String(s.totalEligible)} />
                        <MiniStat label="Enrolled" value={String(s.enrolled)} />
                        <MiniStat label="Disbursed" value={String(s.disbursed)} />
                        <MiniStat label="Budget" value={`${inr(s.utilized)} / ${inr(s.budget)}`} />
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Implementation Milestones</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {s.milestones.map((m) => (
                          <div key={m.id} className={`flex items-center gap-2 p-2.5 rounded-lg border text-[11px] font-semibold ${m.done ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
                            <span>{m.done ? "✅" : "⬜"}</span>
                            <span className="flex-1">{m.label}</span>
                            <span className="text-[10px] text-slate-600 font-bold">{fmtDate(m.targetDate)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => { setTab("progress"); setProgressSchemeId(s.id); }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-[11px] font-bold transition-colors"
                          style={{ color: "#fff" }}
                        >
                          🚧 Open in Implementation Tracker
                        </button>
                        <button
                          onClick={() => { setTab("beneficiaries"); setBenSchemeFilter(s.id); }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          👥 View Beneficiaries
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredSchemes.length === 0 && (
              <div className="py-10 text-center text-slate-500 italic text-sm">No schemes match the current filters.</div>
            )}
          </div>
        </div>
      )}

      {/* ========================= BENEFICIARIES ========================= */}
      {tab === "beneficiaries" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">👥 Beneficiary Register</h2>
              <p className="text-xs text-slate-500">Verify EMIS records, approve applications and confirm disbursements.</p>
            </div>
            <button
              onClick={() => setShowAddBen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs transition-colors w-fit"
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
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <select
              value={benSchemeFilter === "All" ? "All" : String(benSchemeFilter)}
              onChange={(e) => setBenSchemeFilter(e.target.value === "All" ? "All" : Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 max-w-56"
            >
              <option value="All">All Schemes</option>
              {schemes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={benStatusFilter}
              onChange={(e) => setBenStatusFilter(e.target.value as typeof benStatusFilter)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Stages</option>
              <option>Pending Verification</option>
              <option>Verified</option>
              <option>Approved</option>
              <option>Disbursed</option>
            </select>
          </div>

          {/* Stage summary chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {(Object.keys(benStatusCounts) as BenStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setBenStatusFilter(benStatusFilter === st ? "All" : st)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                  benStatusFilter === st
                    ? "border-blue-500 bg-blue-500/10 text-blue-300"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
                }`}
              >
                {st}: {benStatusCounts[st]}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="py-2.5 pr-3 font-bold">Student</th>
                  <th className="py-2.5 pr-3 font-bold">EMIS ID</th>
                  <th className="py-2.5 pr-3 font-bold">Scheme</th>
                  <th className="py-2.5 pr-3 font-bold">Stage</th>
                  <th className="py-2.5 pr-3 font-bold">Updated</th>
                  <th className="py-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBens.map((b) => {
                  const scheme = schemes.find((s) => s.id === b.schemeId);
                  const step = BEN_NEXT[b.status];
                  return (
                    <tr key={b.id} className="border-b border-slate-850/60 hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pr-3">
                        <div className="text-xs font-bold text-white">{b.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">Class {b.classSection}</div>
                      </td>
                      <td className="py-3 pr-3 text-[11px] text-slate-400 font-mono">{b.emisId}</td>
                      <td className="py-3 pr-3">
                        <span className="text-[11px] text-slate-300 font-semibold">{scheme ? `${CATEGORY_META[scheme.category].icon} ${scheme.name}` : "—"}</span>
                      </td>
                      <td className="py-3 pr-3"><span className={`badge ${BEN_STATUS_BADGE[b.status]}`}>{b.status}</span></td>
                      <td className="py-3 pr-3 text-[11px] text-slate-500 font-semibold">{fmtDate(b.updatedOn)}</td>
                      <td className="py-3 text-right">
                        {step ? (
                          <button
                            onClick={() => advanceBeneficiary(b.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-[10px] font-bold transition-colors"
                            style={{ color: "#fff" }}
                          >
                            {step.action} →
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold">✓ Complete</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredBens.length === 0 && (
              <div className="py-10 text-center text-slate-500 italic text-sm">No beneficiaries match the current filters.</div>
            )}
          </div>
        </div>
      )}

      {/* ====================== IMPLEMENTATION PROGRESS ====================== */}
      {tab === "progress" && (
        <ProgressTab
          schemes={schemes}
          selectedId={progressSchemeId}
          onSelect={setProgressSchemeId}
          onToggleMilestone={toggleMilestone}
          onLogDistribution={logDistribution}
        />
      )}

      {/* ------------------------------ Modals ------------------------------ */}
      {showAddScheme && (
        <AddSchemeModal
          onClose={() => setShowAddScheme(false)}
          onSave={(s) => {
            setSchemes((prev) => [...prev, s]);
            setShowAddScheme(false);
            logActivity("🆕", `New scheme registered: ${s.name} (${s.category}).`);
            showToast(`✓ "${s.name}" registered and sent for district approval.`);
          }}
        />
      )}

      {showAddBen && (
        <AddBeneficiaryModal
          schemes={schemes}
          onClose={() => setShowAddBen(false)}
          onSave={(b) => {
            setBeneficiaries((prev) => [b, ...prev]);
            setSchemes((prev) => prev.map((s) => (s.id === b.schemeId ? { ...s, enrolled: Math.min(s.enrolled + 1, s.totalEligible) } : s)));
            setShowAddBen(false);
            const scheme = schemes.find((s) => s.id === b.schemeId);
            logActivity("👤", `${b.name} enrolled under ${scheme?.name ?? "scheme"} — pending EMIS verification.`);
            showToast(`✓ ${b.name} enrolled. Stage: Pending Verification.`);
          }}
        />
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

const DONUT_COLORS: Record<BenStatus, string> = {
  "Pending Verification": "#f59e0b",
  Verified: "#38bdf8",
  Approved: "#818cf8",
  Disbursed: "#10b981",
};

function DonutChart({ counts, total }: { counts: Record<BenStatus, number>; total: number }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segments = (Object.keys(counts) as BenStatus[])
    .filter((st) => counts[st] > 0)
    .map((st) => {
      const frac = total > 0 ? counts[st] / total : 0;
      const seg = { st, dash: frac * C, offset };
      offset += frac * C;
      return seg;
    });
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0 -rotate-90">
      <circle cx="48" cy="48" r={R} fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="12" />
      {segments.map((s) => (
        <circle
          key={s.st}
          cx="48" cy="48" r={R} fill="none"
          stroke={DONUT_COLORS[s.st]} strokeWidth="12"
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

function ProgressTab({
  schemes, selectedId, onSelect, onToggleMilestone, onLogDistribution,
}: {
  schemes: Scheme[];
  selectedId: number;
  onSelect: (id: number) => void;
  onToggleMilestone: (schemeId: number, milestoneId: number) => void;
  onLogDistribution: (schemeId: number, units: number) => void;
}) {
  const scheme = schemes.find((s) => s.id === selectedId) ?? schemes[0];
  const [units, setUnits] = useState("1");
  if (!scheme) return null;
  const cov = coveragePct(scheme);
  const prog = milestonePct(scheme);
  const meta = CATEGORY_META[scheme.category];
  const remaining = scheme.totalEligible - scheme.disbursed;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Scheme selector list */}
      <div className="glass rounded-2xl p-5 border border-slate-800 h-fit">
        <h2 className="text-base font-semibold text-white mb-1">🚧 Implementation Tracker</h2>
        <p className="text-xs text-slate-500 mb-4">Pick a scheme to review milestones and log ground progress.</p>
        <div className="space-y-2">
          {schemes.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                s.id === scheme.id
                  ? "border-blue-500/60 bg-blue-500/10"
                  : "border-slate-850 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white truncate">{CATEGORY_META[s.category].icon} {s.name}</span>
                <span className="text-[10px] font-black shrink-0" style={{ color: CATEGORY_META[s.category].color }}>{milestonePct(s)}%</span>
              </div>
              <div className="w-full bg-slate-850 h-1 rounded-full overflow-hidden mt-2">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${milestonePct(s)}%`, background: CATEGORY_META[s.category].color }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected scheme detail */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`badge ${meta.badge}`}>{meta.icon} {scheme.category}</span>
            <span className={`badge ${SCHEME_STATUS_BADGE[scheme.status]}`}>{scheme.status}</span>
            <span className="text-[10px] text-slate-500 font-semibold">Deadline: {fmtDate(scheme.deadline)}</span>
          </div>
          <h2 className="text-base font-semibold text-white">{scheme.name}</h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-1 mb-5">{scheme.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Benefit Coverage</span>
                <span className="text-[11px] font-black" style={{ color: meta.color }}>{cov}%</span>
              </div>
              <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cov}%`, background: meta.color }} />
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">{scheme.disbursed} of {scheme.totalEligible} students covered</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Milestone Progress</span>
                <span className="text-[11px] font-black text-amber-400">{prog}%</span>
              </div>
              <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${prog}%` }} />
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">{scheme.milestones.filter((m) => m.done).length} of {scheme.milestones.length} milestones cleared</div>
            </div>
          </div>

          {/* Milestone timeline */}
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">Milestone Timeline — click to toggle</div>
          <div className="relative pl-5">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-800" />
            <div className="space-y-3">
              {scheme.milestones.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onToggleMilestone(scheme.id, m.id)}
                  className="relative w-full text-left group"
                >
                  <span className={`absolute -left-5 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] transition-colors ${
                    m.done ? "bg-emerald-500 border-emerald-400" : "bg-slate-900 border-slate-700 group-hover:border-blue-500"
                  }`}>
                    {m.done && <span style={{ color: "#fff" }}>✓</span>}
                  </span>
                  <div className={`p-3 rounded-xl border transition-all ${
                    m.done
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-slate-900/60 border-slate-850 group-hover:border-blue-500/50"
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${m.done ? "text-emerald-300" : "text-slate-300"}`}>{m.label}</span>
                      <span className={`text-[10px] font-bold shrink-0 ${!m.done && daysLeft(m.targetDate) < 0 ? "text-red-400" : "text-slate-600"}`}>
                        {!m.done && daysLeft(m.targetDate) < 0 ? "⚠ Overdue · " : ""}{fmtDate(m.targetDate)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution logging */}
        <div className="glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-1">📦 Log Distribution / Disbursement</h2>
          <p className="text-xs text-slate-500 mb-4">
            {remaining > 0
              ? `${remaining} student(s) still awaiting benefit under this scheme.`
              : "All eligible students are covered under this scheme. 🎉"}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogDistribution(scheme.id, Number(units));
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="number"
              min={1}
              max={Math.max(remaining, 1)}
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              disabled={remaining === 0}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
              placeholder="Units distributed today"
              required
            />
            <button
              type="submit"
              disabled={remaining === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 font-bold rounded-xl text-xs transition-colors"
              style={remaining === 0 ? undefined : { color: "#fff" }}
            >
              Post Dispatch Log
            </button>
          </form>
        </div>
      </div>
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

const inputCls = "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors";
const labelCls = "block text-xs text-slate-400 mb-1.5 font-semibold";

function AddSchemeModal({ onClose, onSave }: { onClose: () => void; onSave: (s: Scheme) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Student Scheme");
  const [department, setDepartment] = useState("School Education Dept.");
  const [targetGroup, setTargetGroup] = useState("");
  const [benefit, setBenefit] = useState("");
  const [budget, setBudget] = useState("");
  const [eligible, setEligible] = useState("");
  const [deadline, setDeadline] = useState("2026-09-30");
  const [description, setDescription] = useState("");

  return (
    <ModalShell
      title="🆕 Register New Scheme"
      subtitle="Adds the scheme to this school's registry and queues it for district approval."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            id: Date.now(),
            name: name.trim(),
            category,
            department: department.trim(),
            targetGroup: targetGroup.trim(),
            benefit: benefit.trim(),
            budget: Number(budget) || 0,
            utilized: 0,
            totalEligible: Number(eligible) || 0,
            enrolled: 0,
            disbursed: 0,
            deadline,
            status: "Pending Approval",
            description: description.trim() || "Newly registered scheme awaiting district approval.",
            milestones: [
              { id: 1, label: "Eligible list pulled from EMIS", done: false, targetDate: deadline },
              { id: 2, label: "Documents verified", done: false, targetDate: deadline },
              { id: 3, label: "District office approval", done: false, targetDate: deadline },
              { id: 4, label: "Benefit distribution", done: false, targetDate: deadline },
            ],
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelCls}>Scheme Name *</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chief Minister's Breakfast Scheme" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category *</label>
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option>Student Scheme</option>
              <option>Scholarship</option>
              <option>Welfare Program</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <input className={inputCls} value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Target Group *</label>
            <input className={inputCls} value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} placeholder="e.g. Classes 1 to 5" required />
          </div>
          <div>
            <label className={labelCls}>Benefit *</label>
            <input className={inputCls} value={benefit} onChange={(e) => setBenefit(e.target.value)} placeholder="e.g. Hot breakfast daily" required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Budget (₹)</label>
            <input className={inputCls} type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className={labelCls}>Eligible Count *</label>
            <input className={inputCls} type="number" min={1} value={eligible} onChange={(e) => setEligible(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Deadline</label>
            <input className={inputCls} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea className={`${inputCls} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short note on scope and eligibility…" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Register Scheme</button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddBeneficiaryModal({ schemes, onClose, onSave }: {
  schemes: Scheme[]; onClose: () => void; onSave: (b: Beneficiary) => void;
}) {
  const openSchemes = schemes.filter((s) => s.status !== "Completed");
  const [name, setName] = useState("");
  const [classSection, setClassSection] = useState("");
  const [emisId, setEmisId] = useState("");
  const [schemeId, setSchemeId] = useState<number>(openSchemes[0]?.id ?? schemes[0]?.id ?? 0);

  return (
    <ModalShell
      title="👤 Enrol Beneficiary"
      subtitle="Links a student to a scheme. New enrolments start at 'Pending Verification'."
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
            schemeId,
            status: "Pending Verification",
            updatedOn: new Date().toISOString().slice(0, 10),
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelCls}>Student Name *</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lakshmi Priya D." required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Class & Section *</label>
            <input className={inputCls} value={classSection} onChange={(e) => setClassSection(e.target.value)} placeholder="e.g. 10A" required />
          </div>
          <div>
            <label className={labelCls}>EMIS ID *</label>
            <input className={`${inputCls} font-mono`} value={emisId} onChange={(e) => setEmisId(e.target.value)} placeholder="12-digit EMIS" pattern="\d{10,14}" title="Enter the 10–14 digit EMIS number" required />
          </div>
        </div>
        <div>
          <label className={labelCls}>Scheme *</label>
          <select className={inputCls} value={schemeId} onChange={(e) => setSchemeId(Number(e.target.value))}>
            {openSchemes.map((s) => (
              <option key={s.id} value={s.id}>{CATEGORY_META[s.category].icon} {s.name} — {s.targetGroup}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs transition-colors" style={{ color: "#fff" }}>Enrol Student</button>
        </div>
      </form>
    </ModalShell>
  );
}
