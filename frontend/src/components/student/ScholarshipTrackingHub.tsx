"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
  Award,
  Calendar,
  CheckCircle,
  FileText,
  AlertTriangle,
  Info,
  ExternalLink,
  Bell,
  Clock,
  Check,
  Upload,
  User,
  ShieldCheck,
  Search,
  Filter,
  Calculator,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  DollarSign
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface ScholarshipScheme {
  id: string;
  name: string;
  nameTA: string;
  category: string;
  categoryTA: string;
  amount: string;
  amountTA: string;
  type: string;
  emoji: string;
  color: string;
  softColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  descriptionTA: string;
  eligibility: string;
  eligibilityTA: string;
  deadline: string;
  applicationLink: string;
  applicationMode: string;
  applicationModeTA: string;
  authority: string;
  authorityTA: string;
  documents: string[];
  documentsTA: string[];
  daysLeft: number | null;
  isExpired: boolean;
  isUrgent: boolean;
  classes?: number[];
}

interface Application {
  id: string;
  scheme: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";
  appliedDate: string;
  remarks: string | null;
}

interface Notification {
  id: string;
  title: string;
  titleTA: string;
  type: string;
  priority: "urgent" | "high" | "medium";
  date: string;
  description: string;
  descriptionTA: string;
  link: string;
  emoji: string;
}

interface HubProps {
  classLevel: number;
  dashboardLink: string;
  accentColor: string;
  themeClass: string;
}

export default function ScholarshipTrackingHub({
  classLevel,
  dashboardLink,
  accentColor,
  themeClass
}: HubProps) {
  const { data: session } = useSession();
  const [lang, setLang] = useState<"EN" | "TA">("EN");
  const [activeTab, setActiveTab] = useState<"discovery" | "calculator" | "tracking" | "documents" | "notifications">("discovery");
  
  // Data States
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [scholarships, setScholarships] = useState<ScholarshipScheme[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Loading & Filter States
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Dynamic Calculator Input States
  const [calcClass, setCalcClass] = useState<number>(classLevel || 10);
  const [calcIncome, setCalcIncome] = useState<number>(180000);
  const [calcMarks, setCalcMarks] = useState<number>(85);
  const [calcCommunity, setCalcCommunity] = useState<string>("BC");

  // Document Locker state
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { status: "Verified" | "Pending Approval", file: string }>>({
    "Aadhaar Card": { status: "Verified", file: "aadhaar_tn_verified.pdf" },
    "Bank Passbook": { status: "Verified", file: "bank_passbook_signed.pdf" },
    "Parent Income Certificate": { status: "Verified", file: "income_cert_tahsildar.pdf" }
  });

  // Multilingual translation helper
  const t = (en: string, ta: string) => (lang === "EN" ? en : ta);

  // Initialize Language & Locker Cache from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("portal-language");
    if (savedLang === "தமிழ்") {
      setLang("TA");
    }
    try {
      const savedLocker = localStorage.getItem("tn_scholarship_locker");
      if (savedLocker) {
        setUploadedDocs(JSON.parse(savedLocker));
      }
    } catch (e) {}
  }, []);

  // 1. Fetch Student Profile & Applications
  useEffect(() => {
    async function resolveStudentAndData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/students`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id 
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          const currentStudent = myStudent || json.data[0];
          setStudentProfile(currentStudent);
          setStudentId(currentStudent.id);

          if (currentStudent.class) {
            setCalcClass(parseInt(currentStudent.class));
          }
          if (currentStudent.community) {
            setCalcCommunity(currentStudent.community);
          }
          if (currentStudent.income) {
            setCalcIncome(currentStudent.income);
          }

          await fetchApplications(currentStudent.id);
          await fetchScholarships(currentStudent.class || classLevel, currentStudent.community || "BC");
        } else {
          await fetchScholarships(classLevel, "BC");
        }
      } catch (err) {
        console.error("Error resolving student profile", err);
        await fetchScholarships(classLevel, "BC");
      } finally {
        setLoading(false);
      }
    }

    resolveStudentAndData();
    fetchNotifications();
  }, [session, classLevel]);

  // Fetch Available Scholarships
  const fetchScholarships = async (cls: number, community: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/scholarships?class=${cls}&community=${community}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setScholarships(json.data);
      }
    } catch (err) {
      console.error("Error fetching scholarships", err);
    }
  };

  // Fetch Applications
  const fetchApplications = async (sId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/students/${sId}/scholarships`);
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error("Error loading application statuses", err);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scholarships/notifications`);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Error fetching scholarship notifications", err);
    }
  };

  // Dynamic Eligibility Calculator Logic
  const calculatedEligibleSchemes = useMemo(() => {
    return scholarships.filter((s) => {
      // 1. Class level check
      const classMatch = s.classes ? s.classes.includes(calcClass) : true;

      // 2. Community category match
      let communityMatch = true;
      const commUpper = calcCommunity.toUpperCase();
      if (s.type === "Category Based" || s.id === "sc-st-prepost") {
        communityMatch = ["SC", "ST"].includes(commUpper);
      } else if (s.type === "Minority Community" || s.id === "minority") {
        communityMatch = ["MINORITY"].includes(commUpper);
      } else if (s.id === "obc-scholarship") {
        communityMatch = ["OBC", "BC", "MBC"].includes(commUpper);
      }

      // 3. Income limit check
      let incomeLimit = 350000;
      if (s.eligibility.includes("2.5 lakh")) incomeLimit = 250000;
      if (s.eligibility.includes("1.5 lakh")) incomeLimit = 150000;
      if (s.eligibility.includes("1 lakh")) incomeLimit = 100000;
      const incomeMatch = calcIncome <= incomeLimit;
      
      // 4. Marks threshold check
      let markReq = 50;
      if (s.eligibility.includes("80%+")) markReq = 80;
      if (s.eligibility.includes("75%+")) markReq = 75;
      if (s.eligibility.includes("55%+")) markReq = 55;
      const markMatch = calcMarks >= markReq;

      return classMatch && communityMatch && incomeMatch && markMatch;
    });
  }, [scholarships, calcClass, calcCommunity, calcIncome, calcMarks]);

  const calculatedTotalBenefit = useMemo(() => {
    return calculatedEligibleSchemes.reduce((sum, item) => {
      const nums = item.amount.replace(/[^0-9]/g, "");
      const val = nums ? parseInt(nums) : 5000;
      return sum + (val > 100000 ? 80000 : val);
    }, 0);
  }, [calculatedEligibleSchemes]);

  // 1-Click Apply Handler
  const handleApply = async (scholarship: ScholarshipScheme) => {
    if (!studentId) {
      Swal.fire({
        title: t("Error", "பிழை"),
        text: t("Student record not resolved.", "மாணவர் விவரங்களை பெற முடியவில்லை."),
        icon: "error",
        confirmButtonColor: accentColor
      });
      return;
    }

    const alreadyApplied = applications.some(app => app.scheme === scholarship.name);
    if (alreadyApplied) {
      Swal.fire({
        title: t("Information", "தகவல்"),
        text: t("You have already applied for this scholarship.", "நீங்கள் ஏற்கனவே இந்த உதவித்தொகைக்கு விண்ணப்பித்துவிட்டீர்கள்."),
        icon: "info",
        confirmButtonColor: accentColor
      });
      return;
    }

    const missingDocs = scholarship.documents.filter(doc => !uploadedDocs[doc]);
    if (missingDocs.length > 0 && scholarship.id !== "nmms") {
      const docListHtml = `<ul class="text-left text-xs list-disc pl-5 mt-2 space-y-1 text-slate-300">
        ${missingDocs.map(d => `<li>${d}</li>`).join("")}
      </ul>`;
      
      const confirmUpload = await Swal.fire({
        title: t("Missing Documents", "ஆவணங்கள் இல்லை"),
        html: `<div class="text-sm text-slate-300">${t("The following required documents are missing from your e-Sanad Locker. Auto-sync from e-Sevai now?", "பின்வரும் ஆவணங்கள் உங்கள் மின்-சன்னத் லாக்கரில் இல்லை. மின்-சேவையிலிருந்து ஒத்திசைக்கவா?")}</div>${docListHtml}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("Auto-Sync & Apply", "ஒத்திசைத்து விண்ணப்பி"),
        cancelButtonText: t("Cancel", "ரத்துசெய்"),
        confirmButtonColor: accentColor,
        cancelButtonColor: "#475569"
      });

      if (confirmUpload.isConfirmed) {
        const newDocs = { ...uploadedDocs };
        missingDocs.forEach(d => {
          newDocs[d] = { status: "Verified", file: `${d.toLowerCase().replace(/ /g, "_")}_esevai.pdf` };
        });
        setUploadedDocs(newDocs);
        try {
          localStorage.setItem("tn_scholarship_locker", JSON.stringify(newDocs));
        } catch (e) {}
      } else {
        return;
      }
    }

    setSubmittingId(scholarship.id);
    const parsedAmount = parseFloat(scholarship.amount.replace(/[^0-9]/g, "")) || 5000;

    try {
      const response = await fetch(`${API_BASE}/api/students/${studentId}/scholarships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme: scholarship.name,
          amount: parsedAmount
        })
      });
      const json = await response.json();
      if (json.success) {
        Swal.fire({
          title: t("Application Submitted!", "விண்ணப்பம் சமர்ப்பிக்கப்பட்டது!"),
          text: t(
            `Your application for "${scholarship.name}" has been submitted to your Headmaster verification portal.`,
            `"${scholarship.nameTA}"-க்கான உங்கள் விண்ணப்பம் பள்ளி சரிபார்ப்பு அதிகாரியிடம் சமர்ப்பிக்கப்பட்டது.`
          ),
          icon: "success",
          confirmButtonColor: accentColor
        });
        fetchApplications(studentId);
        setActiveTab("tracking");
      } else {
        Swal.fire({
          title: t("Error", "பிழை"),
          text: json.error || t("Failed to submit application.", "விண்ணப்பத்தை சமர்ப்பிக்க முடியவில்லை."),
          icon: "error",
          confirmButtonColor: accentColor
        });
      }
    } catch (err) {
      Swal.fire({
        title: t("Error", "பிழை"),
        text: t("Unable to connect to the server.", "சேவையகத்துடன் இணைக்க முடியவில்லை."),
        icon: "error",
        confirmButtonColor: accentColor
      });
    } finally {
      setSubmittingId(null);
    }
  };

  // Upload Document Modal
  const handleUploadSimulated = (docName: string) => {
    Swal.fire({
      title: t("Upload Document", "ஆவணம் பதிவேற்று"),
      text: t(`Select a PDF or image file for: ${docName}`, `இதற்கான கோப்பைத் தேர்ந்தெடுக்கவும்: ${docName}`),
      input: "file",
      showCancelButton: true,
      confirmButtonText: t("Upload to Locker", "லாக்கரில் பதிவேற்று"),
      confirmButtonColor: accentColor,
      cancelButtonColor: "#475569"
    }).then((result) => {
      if (result.value) {
        const updated = {
          ...uploadedDocs,
          [docName]: {
            status: "Verified" as const,
            file: result.value.name
          }
        };
        setUploadedDocs(updated);
        try {
          localStorage.setItem("tn_scholarship_locker", JSON.stringify(updated));
        } catch (e) {}
        Swal.fire({
          title: t("Uploaded & Verified!", "பதிவேற்றப்பட்டு சரிபார்க்கப்பட்டது!"),
          text: t("Document uploaded to e-Sanad locker.", "ஆவணம் மின்-சன்னத் லாக்கரில் சேமிக்கப்பட்டது."),
          icon: "success",
          confirmButtonColor: accentColor
        });
      }
    });
  };

  // Filter available scholarships
  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nameTA.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusStepper = (status: string, remarks: string | null) => {
    const steps = [
      { key: "SUBMITTED", label: t("Submitted", "சமர்ப்பிக்கப்பட்டது") },
      { key: "VERIFICATION", label: t("Under Verification", "சரிபார்ப்பில் உள்ளது") },
      { key: "APPROVED", label: t("Sanctioned", "அங்கீகரிக்கப்பட்டது") },
      { key: "DISBURSED", label: t("Disbursed", "வழங்கப்பட்டது") }
    ];

    let activeIndex = 0;
    let labelColor = "text-amber-600 dark:text-amber-400";
    let statusText = t("Pending Verification", "நிலுவையில் உள்ளது");

    if (status === "PENDING") {
      activeIndex = 1;
      labelColor = "text-amber-600 dark:text-amber-400";
      statusText = t("Headmaster Verification In Progress", "தலைமையாசிரியர் சரிபார்ப்பு");
    } else if (status === "APPROVED") {
      activeIndex = 2;
      labelColor = "text-indigo-600 dark:text-indigo-400";
      statusText = t("Approved & Sanctioned", "அங்கீகரிக்கப்பட்டது");
    } else if (status === "DISBURSED") {
      activeIndex = 3;
      labelColor = "text-emerald-600 dark:text-emerald-400";
      statusText = t("Disbursed to Bank Account", "வங்கிக்கு அனுப்பப்பட்டது");
    } else if (status === "REJECTED") {
      activeIndex = 1;
      labelColor = "text-red-600 dark:text-red-400";
      statusText = t("Returned for Corrections", "திருப்பி அனுப்பப்பட்டது");
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-bold">
            {t("Application Progress:", "விண்ணப்ப முன்னேற்றம்:")}
          </span>
          <span className={`text-xs font-black uppercase tracking-wider ${labelColor}`}>
            {statusText}
          </span>
        </div>

        {status === "REJECTED" ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 dark:text-red-300 font-medium">
              <strong>{t("Remarks:", "குறிப்புகள்:")}</strong>{" "}
              {remarks || t("Document mismatch. Upload clear Tahsildar Income Certificate.", "சான்றிதழ் பொருந்தவில்லை.")}
            </div>
          </div>
        ) : (
          <div className="relative pt-6 pb-2">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${(activeIndex / 3) * 100}%` }}
            ></div>
            
            <div className="relative flex justify-between z-10">
              {steps.map((step, i) => {
                const isCompleted = i <= activeIndex;
                const isCurrent = i === activeIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500
                      ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600'}
                      ${isCurrent ? 'ring-4 ring-indigo-500/30 font-black' : ''}`}
                    >
                      {isCompleted ? <Check className="h-3 w-3 text-white" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                    </div>
                    <span className={`text-[9px] font-black tracking-wide ${isCurrent ? 'text-slate-900 dark:text-white font-black' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex justify-between items-center">
        <Link href={dashboardLink} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white flex items-center gap-2 transition-colors w-fit">
          <span>←</span> {t("Back to Dashboard", "முகப்பு பலகைக்குச் செல்")}
        </Link>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextLang = lang === "EN" ? "TA" : "EN";
              setLang(nextLang);
              localStorage.setItem("portal-language", nextLang === "EN" ? "English" : "தமிழ்");
              window.dispatchEvent(new Event("portal-language-change"));
            }}
            className="text-xs font-bold px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>🌐</span>
            <span>{lang === "EN" ? "தமிழ்" : "English"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 w-full overflow-x-auto gap-1 shadow-sm">
        {[
          { key: "discovery", label: t("Eligible Scholarships", "உதவித்தொகைகள்"), icon: Award },
          { key: "calculator", label: t("Eligibility Calculator", "தகுதி கணிப்பான்"), icon: Calculator },
          { key: "tracking", label: t("Application Tracker", "விண்ணப்பக் கண்காணிப்பு"), icon: Clock },
          { key: "documents", label: t("e-Sanad Locker", "மின்-சன்னத் லாக்கர்"), icon: FileText },
          { key: "notifications", label: t("Govt Bulletins", "அரசு அறிவிப்புகள்"), icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white shadow-md scale-105"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900/50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
              {tab.key === "notifications" && notifications.length > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse ml-0.5">
                  {notifications.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* EMIS Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-md">
            <div className="absolute right-4 top-4 text-4xl opacity-10">🎓</div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              {t("EMIS Verified Profile", "சரிபார்க்கப்பட்ட EMIS விவரம்")}
            </h3>
            
            {studentProfile ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("Student Name", "மாணவர் பெயர்")}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{studentProfile.user?.name || session?.user?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("Class Level", "வகுப்பு")}</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Class {studentProfile.class} {studentProfile.section}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("Community", "சமூகம்")}</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-amber-300">{studentProfile.community || "BC"}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("Parent Income", "வருமானம்")}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">₹{studentProfile.income?.toLocaleString() || "1,80,000"} / year</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t("Academic Average", "மதிப்பெண்")}</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">88.5% (Distinction)</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 animate-pulse">{t("Resolving student credentials...", "விவரங்களை ஏற்றுகிறது...")}</div>
            )}
            
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {t("Linked with National Scholarship Portal (NSP)", "தேசிய உதவித்தொகை போர்ட்டலுடன் இணைக்கப்பட்டுள்ளது")}
            </div>
          </div>

          {/* Quick Stats Summary Widget */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 dark:from-indigo-900/40 dark:via-purple-900/30 dark:to-slate-900 text-slate-900 dark:text-white rounded-3xl p-6 border border-indigo-200 dark:border-indigo-500/30 space-y-4 shadow-md">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              {t("Financial Aid Estimator", "நிதி உதவித் தொகை கணிப்பு")}
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-bold">{t("Matched Schemes:", "பொருந்தும் உதவித்தொகைகள்:")}</span>
                <span className="font-black text-slate-900 dark:text-white">{calculatedEligibleSchemes.length} Schemes</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-bold">{t("Estimated Annual Grant:", "ஆண்டு நிதியுதவி:")}</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{calculatedTotalBenefit.toLocaleString()} / year</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("calculator")}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>{t("Launch Calculator Widget", "கணிப்பானைத் தொடங்கு")}</span>
            </button>
          </div>

        </div>

        {/* Right Work Canvas */}
        <div className="lg:col-span-2">
          
          {/* TAB 1: DISCOVERY */}
          {activeTab === "discovery" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 min-h-full space-y-6 shadow-md">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    {t("Eligible Government Scholarships", "உங்களுக்குத் தகுதியான உதவித்தொகைகள்")}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    {t("Matched for Class level and EMIS credentials.", "உங்கள் வகுப்பு மற்றும் EMIS விவரங்களின் அடிப்படையில் தேர்ந்தெடுக்கப்பட்டுள்ளன.")}
                  </p>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 flex gap-2 bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Search className="h-4 w-4 text-slate-400 self-center ml-2" />
                  <input
                    type="text"
                    placeholder={t("Search by scholarship title, benefit, or criteria...", "தேடுக...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-white border-none focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-200 font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
                >
                  <option value="All">{t("All Categories", "அனைத்து பிரிவுகளும்")}</option>
                  <option value="Central Government">Central Government</option>
                  <option value="State Government">State Government</option>
                </select>
              </div>

              {/* Cards List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredScholarships.length > 0 ? (
                  filteredScholarships.map((s) => {
                    const alreadyApplied = applications.some(app => app.scheme === s.name);
                    return (
                      <div 
                        key={s.id}
                        className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 transition-all duration-300 relative overflow-hidden shadow-sm"
                      >
                        {s.isUrgent && (
                          <div className="absolute right-0 top-0 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                            <Clock className="h-3 w-3" />
                            {t(`${s.daysLeft} days left`, `${s.daysLeft} நாட்கள் மீதமுள்ளன`)}
                          </div>
                        )}

                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                            {s.emoji}
                          </div>
                          <div className="space-y-2 w-full">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-slate-700">
                                {t(s.category, s.categoryTA)}
                              </span>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 leading-tight">
                                {t(s.name, s.nameTA)}
                              </h4>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                              {t(s.description, s.descriptionTA)}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black">
                                <span>💰</span>
                                <span>{t("Benefit:", "உதவித் தொகை:")} {t(s.amount, s.amountTA)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>⏰</span>
                                <span>{t("Deadline:", "கடைசி தேதி:")} {new Date(s.deadline).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1 col-span-1 sm:col-span-2">
                                <span>🎯</span>
                                <span>{t("Eligibility:", "தகுதி:")} {t(s.eligibility, s.eligibilityTA)}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex flex-wrap justify-between items-center gap-3 border-t border-slate-200 dark:border-slate-800/80">
                              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                                <span>🌐</span> {t(s.applicationMode, s.applicationModeTA)}
                              </span>

                              <div className="flex gap-2">
                                {s.applicationLink && (
                                  <a 
                                    href={s.applicationLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleApply(s)}
                                  disabled={alreadyApplied || submittingId === s.id}
                                  className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all ${
                                    alreadyApplied
                                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 cursor-default"
                                      : submittingId === s.id
                                      ? "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                                  }`}
                                >
                                  {alreadyApplied ? t("✓ Applied", "✓ விண்ணப்பிக்கப்பட்டது") : submittingId === s.id ? t("Applying...", "விண்ணப்பிக்கிறது...") : t("1-Click Apply", "1-கிளிக் விண்ணப்பம்")}
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs font-bold">
                    {t("No scholarships match your criteria.", "எந்த உதவித்தொகையும் பொருந்தவில்லை.")}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 min-h-full space-y-6 shadow-md">
              
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-amber-500" />
                  {t("Interactive Scholarship & Financial Aid Calculator", "உதவித்தொகை தகுதி கணிப்பான்")}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {t("Adjust your class grade, annual family income, and academic marks to instantly estimate eligible scholarship schemes.", "உங்கள் வகுப்பையும் வருமானத்தையும் மாற்றி உதவித்தொகைத் தொகையைக் கணக்கிடவும்.")}
                </p>
              </div>

              {/* Calculator Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Class Level:", "வகுப்பு:")}</label>
                  <select
                    value={calcClass}
                    onChange={(e) => setCalcClass(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-bold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map(c => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t("Community Category:", "சமூகம்:")}</label>
                  <select
                    value={calcCommunity}
                    onChange={(e) => setCalcCommunity(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-bold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="BC">BC Community</option>
                    <option value="MBC">MBC Community</option>
                    <option value="SC">SC Community</option>
                    <option value="ST">ST Community</option>
                    <option value="MINORITY">Minority Community</option>
                    <option value="GENERAL">General Category</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{t("Annual Parental Income:", "பெற்றோர் வருமானம்:")}</span>
                    <span className="text-amber-600 dark:text-amber-400">₹{calcIncome.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="500000"
                    step="25000"
                    value={calcIncome}
                    onChange={(e) => setCalcIncome(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{t("Academic Percentage:", "மதிப்பெண் %:")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{calcMarks}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="5"
                    value={calcMarks}
                    onChange={(e) => setCalcMarks(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

              </div>

              {/* Result Summary Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/60 dark:via-slate-900 dark:to-indigo-950/60 p-5 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider">
                    {t("Estimated Total Aid", "மொத்த மதிப்பீடு")}
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{calculatedTotalBenefit.toLocaleString()} <span className="text-xs text-slate-500 font-bold">/ year</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("discovery")}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
                >
                  <span>{t("View Matched Schemes", "திட்டங்களைக் காண்க")}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Matched Schemes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  {t("Matched Schemes", "பொருந்தும் உதவித்தொகைகள்")} ({calculatedEligibleSchemes.length})
                </h4>

                {calculatedEligibleSchemes.map((scheme) => (
                  <div key={scheme.id} className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs shadow-sm">
                    <div>
                      <h5 className="font-black text-slate-900 dark:text-white">{scheme.name}</h5>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black">{scheme.amount}</span>
                    </div>
                    <button
                      onClick={() => handleApply(scheme)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg text-[10px] shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: TRACKING */}
          {activeTab === "tracking" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 min-h-full space-y-6 shadow-md">
              
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                {t("Track Application Status", "விண்ணப்பக் கண்காணிப்பு")}
              </h3>

              <div className="space-y-5">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug max-w-sm">
                          {app.scheme}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500">
                          {t("Applied on:", "விண்ணப்பித்த தேதி:")} {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                      </div>

                      {getStatusStepper(app.status, app.remarks)}

                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs space-y-3 font-bold">
                    <p>✨ {t("You haven't submitted any scholarship applications yet.", "நீங்கள் இன்னும் எந்த உதவித்தொகைக்கும் விண்ணப்பிக்கவில்லை.")}</p>
                    <button
                      onClick={() => setActiveTab("discovery")}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md"
                    >
                      {t("Discover Available Scholarships", "தகுதியான உதவித்தொகைகளைக் காண்க")}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: e-SANAD LOCKER */}
          {activeTab === "documents" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 min-h-full space-y-6 shadow-md">
              
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  {t("e-Sanad Document Locker", "மின்-சன்னத் ஆவண பெட்டகம்")}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {t(
                    "Your central locker for certificates. Headmasters verify these during scholarship processing.",
                    "சான்றிதழ்களைச் சேமிக்கும் மின்னணு பெட்டகம். பள்ளித் தலைமையாசிரியர்கள் இவற்றைச் சரிபார்ப்பார்கள்."
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Aadhaar Card",
                  "Parent Income Certificate",
                  "Community Certificate",
                  "Previous Year Marksheet",
                  "Bank Passbook",
                  "School Enrollment Certificate"
                ].map((docName) => {
                  const uploaded = uploadedDocs[docName];
                  return (
                    <div 
                      key={docName}
                      className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                          {docName}
                        </span>
                        {uploaded ? (
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1 font-bold">
                            <span className="text-emerald-500">✓</span> {uploaded.file}
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                            ⚠️ {t("Missing Document", "ஆவணம் பதிவேற்றப்படவில்லை")}
                          </span>
                        )}
                      </div>

                      {uploaded ? (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10">
                          {t("Verified", "சரிபார்க்கப்பட்டது")}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleUploadSimulated(docName)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Upload className="h-3 w-3" />
                          {t("Upload", "பதிவேற்று")}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 5: GOVT NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 min-h-full space-y-6 shadow-md">
              
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                {t("Govt Scholarship Bulletins", "அரசு உதவித்தொகை அறிவிப்புகள்")}
              </h3>

              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors relative overflow-hidden shadow-sm"
                    >
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        notif.priority === "urgent" ? "bg-red-500" : notif.priority === "high" ? "bg-amber-500" : "bg-blue-500"
                      }`}></div>

                      <div className="flex gap-3">
                        <span className="text-2xl shrink-0 mt-0.5">{notif.emoji}</span>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">
                              {t(notif.title, notif.titleTA)}
                            </h4>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                              notif.priority === "urgent" 
                                ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/20" 
                                : notif.priority === "high" 
                                ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20" 
                                : "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20"
                            }`}>
                              {notif.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {t(notif.description, notif.descriptionTA)}
                          </p>

                          <div className="flex justify-between items-center pt-2 text-[9px] font-bold text-slate-500">
                            <span>📅 {new Date(notif.date).toLocaleDateString()}</span>
                            {notif.link && (
                              <a 
                                href={notif.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                              >
                                {t("Official Portal", "அதிகாரப்பூர்வ தளம்")} <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs font-bold">
                    {t("No new notifications.", "புதிய அறிவிப்புகள் எதுவும் இல்லை.")}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
