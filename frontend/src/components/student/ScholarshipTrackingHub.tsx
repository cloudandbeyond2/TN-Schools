"use client";

import React, { useState, useEffect } from "react";
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
  Filter
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
  const [activeTab, setActiveTab] = useState<"discovery" | "tracking" | "documents" | "notifications">("discovery");
  
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

  // Document Locker uploads simulated state
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { status: "Verified" | "Pending Approval", file: string }>>({
    "Aadhaar Card": { status: "Verified", file: "aadhaar_verified.pdf" },
    "Bank Passbook": { status: "Verified", file: "passbook_signed.pdf" },
  });

  // Multilingual translation helper
  const t = (en: string, ta: string) => (lang === "EN" ? en : ta);

  // Initialize Language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("portal-language");
    if (savedLang === "தமிழ்") {
      setLang("TA");
    }
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

          // Fetch related applications
          await fetchApplications(currentStudent.id);
          // Fetch scholarships based on student class and community
          await fetchScholarships(currentStudent.class, currentStudent.community);
        }
      } catch (err) {
        console.error("Error resolving student profile", err);
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
      if (json.success) {
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

    // Verify if already applied
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

    // Check if required documents are in e-Sanad locker
    const missingDocs = scholarship.documents.filter(doc => !uploadedDocs[doc]);
    if (missingDocs.length > 0 && scholarship.id !== "nmms") {
      const docListHtml = `<ul class="text-left text-xs list-disc pl-5 mt-2 space-y-1 text-slate-300">
        ${missingDocs.map(d => `<li>${d}</li>`).join("")}
      </ul>`;
      
      const confirmUpload = await Swal.fire({
        title: t("Missing Documents", "ஆவணங்கள் இல்லை"),
        html: `<div class="text-sm text-slate-300">${t("The following required documents are missing from your e-Sanad Locker. Would you like to upload them now?", "பின்வரும் தேவையான ஆவணங்கள் உங்கள் மின்-சன்னத் லாக்கரில் இல்லை. அவற்றை இப்போது பதிவேற்ற விரும்புகிறீர்களா?")}</div>${docListHtml}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("Upload & Apply", "பதிவேற்றி விண்ணப்பி"),
        cancelButtonText: t("Cancel", "ரத்துசெய்"),
        confirmButtonColor: accentColor,
        cancelButtonColor: "#475569"
      });

      if (confirmUpload.isConfirmed) {
        // Add documents to simulated locker
        const newDocs = { ...uploadedDocs };
        missingDocs.forEach(d => {
          newDocs[d] = { status: "Verified", file: `${d.toLowerCase().replace(/ /g, "_")}_auto.pdf` };
        });
        setUploadedDocs(newDocs);
        Swal.fire({
          title: t("Documents Synced!", "ஆவணங்கள் இணைக்கப்பட்டன!"),
          text: t("Your profile documents have been synced from e-Sevai. Proceeding to apply...", "உங்கள் சுயவிவர ஆவணங்கள் மின்-சேவையிலிருந்து ஒத்திசைக்கப்பட்டன. விண்ணப்பிக்க தொடர்கிறது..."),
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        return;
      }
    }

    setSubmittingId(scholarship.id);
    const parsedAmount = parseFloat(scholarship.amount.replace(/[^0-9]/g, "")) || 0;

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
            `Your application for "${scholarship.name}" has been successfully submitted to your School Verification Officer.`,
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

  // Simulate Document Upload
  const handleUploadSimulated = (docName: string) => {
    Swal.fire({
      title: t("Upload Document", "ஆவணம் பதிவேற்று"),
      text: t(`Select a file to upload for: ${docName}`, `இதற்கான கோப்பைத் தேர்ந்தெடுக்கவும்: ${docName}`),
      input: "file",
      showCancelButton: true,
      confirmButtonText: t("Upload", "பதிவேற்று"),
      confirmButtonColor: accentColor,
      cancelButtonColor: "#475569"
    }).then((result) => {
      if (result.value) {
        setUploadedDocs(prev => ({
          ...prev,
          [docName]: {
            status: "Pending Approval",
            file: result.value.name
          }
        }));
        Swal.fire({
          title: t("Uploaded!", "பதிவேற்றப்பட்டது!"),
          text: t("Document uploaded successfully. Verification in progress.", "ஆவணம் வெற்றிகரமாக பதிவேற்றப்பட்டது. சரிபார்ப்பு செயல்பாட்டில் உள்ளது."),
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
    let labelColor = "text-amber-400";
    let statusText = t("Pending", "நிலுவையில் உள்ளது");

    if (status === "PENDING") {
      activeIndex = 1;
      labelColor = "text-amber-400";
      statusText = t("Verification In Progress", "சரிபார்ப்பு செயல்பாட்டில் உள்ளது");
    } else if (status === "APPROVED") {
      activeIndex = 2;
      labelColor = "text-indigo-400";
      statusText = t("Approved & Sanctioned", "அங்கீகரிக்கப்பட்டு அனுமதிக்கப்பட்டது");
    } else if (status === "DISBURSED") {
      activeIndex = 3;
      labelColor = "text-emerald-400";
      statusText = t("Disbursed to Bank", "வங்கிக்கு அனுப்பப்பட்டது");
    } else if (status === "REJECTED") {
      activeIndex = 1;
      labelColor = "text-red-400";
      statusText = t("Returned / Deficient", "திருப்பி அனுப்பப்பட்டது / குறைபாடு உள்ளது");
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-bold">
            {t("Application Status:", "விண்ணப்ப நிலை:")}
          </span>
          <span className={`text-xs font-black uppercase tracking-wider ${labelColor}`}>
            {statusText}
          </span>
        </div>

        {status === "REJECTED" ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-300">
              <strong>{t("Remarks / Deficiencies:", "குறிப்புகள் / குறைபாடுகள்:")}</strong>{" "}
              {remarks || t("Document mismatch or ineligible parent income.", "ஆவணங்கள் பொருந்தவில்லை அல்லது பெற்றோர் வருமானம் தகுதி பெறவில்லை.")}
            </div>
          </div>
        ) : (
          <div className="relative pt-6 pb-2">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-slate-800 rounded-full"></div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${(activeIndex / 3) * 100}%` }}
            ></div>
            
            <div className="relative flex justify-between z-10">
              {steps.map((step, i) => {
                const isCompleted = i <= activeIndex;
                const isCurrent = i === activeIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500
                      ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-600'}
                      ${isCurrent ? 'ring-4 ring-indigo-500/30 font-black' : ''}`}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                    </div>
                    <span className={`text-[9px] font-black tracking-wide ${isCurrent ? 'text-white font-black' : 'text-slate-500'}`}>
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
      {/* Back to Dashboard Navigation */}
      <div className="flex justify-between items-center">
        <Link href={dashboardLink} className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors w-fit">
          <span>←</span> {t("Back to Dashboard", "முகப்பு பலகைக்குச் செல்")}
        </Link>
        <button
          onClick={() => {
            const nextLang = lang === "EN" ? "TA" : "EN";
            setLang(nextLang);
            localStorage.setItem("portal-language", nextLang === "EN" ? "English" : "தமிழ்");
            window.dispatchEvent(new Event("portal-language-change"));
          }}
          className="text-xs font-bold px-3 py-1.5 bg-slate-900/40 rounded-xl border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          🌐 {lang === "EN" ? "தமிழ்" : "English"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800/80 w-full overflow-x-auto gap-1">
        {[
          { key: "discovery", label: t("Eligible Scholarships", "உதவித்தொகைகள்"), icon: Award },
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
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
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

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Info Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* EMIS Verified Profile Card */}
          <div className="glass rounded-3xl p-6 border border-slate-700/50 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20">
            <div className="absolute right-4 top-4 text-4xl opacity-10">👤</div>
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="h-4 w-4 text-indigo-400" />
              {t("Verified EMIS Profile", "சரிபார்க்கப்பட்ட EMIS விவரம்")}
            </h3>
            
            {studentProfile ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-500">{t("Student Name", "மாணவர் பெயர்")}</span>
                  <span className="text-xs font-black text-white">{studentProfile.user?.name || session?.user?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-500">{t("Class Level", "வகுப்பு")}</span>
                  <span className="text-xs font-black text-indigo-400">Class {studentProfile.class} {studentProfile.section}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-500">{t("Community Group", "வகுப்புப் பிரிவு")}</span>
                  <span className="text-xs font-black text-white">{studentProfile.community}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-500">{t("Parent Income", "பெற்றோர் வருமானம்")}</span>
                  <span className="text-xs font-black text-white">₹{studentProfile.income?.toLocaleString() || "1,20,000"} / year</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-slate-500">{t("Academic Average", "கல்விச் சராசரி")}</span>
                  <span className="text-xs font-black text-emerald-400">88.5%</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 animate-pulse">{t("Resolving profile data...", "விவரங்களை ஏற்றுகிறது...")}</div>
            )}
            
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {t("Linked with National Scholarship Portal (NSP)", "தேசிய உதவித்தொகை போர்ட்டலுடன் இணைக்கப்பட்டுள்ளது")}
            </div>
          </div>

          {/* Quick Help Tip */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-black text-indigo-400 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t("Important Instructions", "முக்கிய வழிமுறைகள்")}
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(
                "All application status updates are linked live to the School Headmaster's verification dashboard. If your application status is returned, upload the requested corrections immediately.",
                "அனைத்து விண்ணப்ப நிலைகளும் பள்ளி தலைமையாசிரியரின் சரிபார்ப்பு பலகையுடன் நேரடியாக இணைக்கப்பட்டுள்ளன. விண்ணப்பம் திருப்பி அனுப்பப்பட்டால் உடனடியாக திருத்தங்களைச் சமர்ப்பிக்கவும்."
              )}
            </p>
          </div>

        </div>

        {/* Right Side Work Area */}
        <div className="lg:col-span-2">
          
          {/* TAB 1: ELIGIBLE SCHOLARSHIPS */}
          {activeTab === "discovery" && (
            <div className="glass rounded-3xl p-6 border border-slate-700/50 min-h-full space-y-6">
              
              {/* Header and filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-400 animate-pulse" />
                    {t("Eligible Scholarships", "உங்களுக்குத் தகுதியான உதவித்தொகைகள்")}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t("We matched these scholarships based on your Class and EMIS credentials.", "உங்கள் வகுப்பு மற்றும் EMIS விவரங்களின் அடிப்படையில் இவை தேர்ந்தெடுக்கப்பட்டுள்ளன.")}
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <Search className="h-4 w-4 text-slate-500 self-center ml-2" />
                <input
                  type="text"
                  placeholder={t("Search by scholarship name or description...", "தேடுக...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs text-white border-none focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Scholarship Cards List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredScholarships.length > 0 ? (
                  filteredScholarships.map((s) => {
                    const alreadyApplied = applications.some(app => app.scheme === s.name);
                    return (
                      <div 
                        key={s.id}
                        className={`bg-slate-900/40 p-5 rounded-2xl border ${s.borderColor} hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden`}
                      >
                        {/* Red urgent tag or yellow renewable tag */}
                        {s.isUrgent && (
                          <div className="absolute right-0 top-0 bg-red-600 text-white text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                            <Clock className="h-3 w-3" />
                            {t(`${s.daysLeft} days left`, `${s.daysLeft} நாட்கள் மீதமுள்ளன`)}
                          </div>
                        )}

                        <div className="flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 border border-slate-700">
                            {s.emoji}
                          </div>
                          <div className="space-y-2 w-full">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                                {t(s.category, s.categoryTA)}
                              </span>
                              <h4 className="text-sm font-black text-white mt-1 leading-tight">
                                {t(s.name, s.nameTA)}
                              </h4>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed">
                              {t(s.description, s.descriptionTA)}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[10px] font-bold text-slate-400">
                              <div className="flex items-center gap-1 text-amber-400">
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

                            {/* Required documents preview */}
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 mt-3">
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                                📋 {t("Required Documents:", "தேவையான ஆவணங்கள்:")}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {t(s.documents, s.documentsTA).map((doc, dIdx) => (
                                  <span key={dIdx} className="text-[8px] px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-slate-400 font-medium">
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 flex flex-wrap justify-between items-center gap-3">
                              <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                                <span>🌐</span> {t("Apply via", "விண்ணப்பிக்கும் முறை")} {t(s.applicationMode, s.applicationModeTA)}
                              </span>

                              <div className="flex gap-2">
                                {s.applicationLink && (
                                  <a 
                                    href={s.applicationLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleApply(s)}
                                  disabled={alreadyApplied || submittingId === s.id}
                                  className={`px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all ${
                                    alreadyApplied
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default shadow-none"
                                      : submittingId === s.id
                                      ? "bg-slate-800 text-slate-500"
                                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10"
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
                  <div className="text-center py-12 text-slate-500 text-xs">
                    {t("No scholarships match your search.", "உங்களது தேடலுக்கு எந்த உதவித்தொகையும் பொருந்தவில்லை.")}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: APPLICATION TRACKER */}
          {activeTab === "tracking" && (
            <div className="glass rounded-3xl p-6 border border-slate-700/50 min-h-full space-y-6">
              
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                {t("Track Application Status", "விண்ணப்பக் கண்காணிப்பு")}
              </h3>

              <div className="space-y-5">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-850 pb-3 mb-4">
                        <h4 className="text-sm font-black text-white leading-snug max-w-sm">
                          {app.scheme}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-500">
                          {t("Applied on:", "விண்ணப்பித்த தேதி:")} {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Status Stepper */}
                      {getStatusStepper(app.status, app.remarks)}

                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs space-y-3">
                    <p>✨ {t("You haven't submitted any scholarship applications yet.", "நீங்கள் இன்னும் எந்த உதவித்தொகைக்கும் விண்ணப்பிக்கவில்லை.")}</p>
                    <button
                      onClick={() => setActiveTab("discovery")}
                      className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-xs font-black border border-indigo-500/20 transition-all"
                    >
                      {t("Discover Available Scholarships", "தகுதியான உதவித்தொகைகளைக் காண்க")}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: DOCUMENT LOCKER */}
          {activeTab === "documents" && (
            <div className="glass rounded-3xl p-6 border border-slate-700/50 min-h-full space-y-6">
              
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  {t("e-Sanad Document Locker", "மின்-சன்னத் ஆவண பெட்டகம்")}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t(
                    "Your central locker for certificates. Headmasters verify these during scholarship processing.",
                    "சான்றிதழ்களைச் சேமிக்கும் மின்னணு பெட்டகம். பள்ளித் தலைமையாசிரியர்கள் இவற்றைச் சரிபார்ப்பார்கள்."
                  )}
                </p>
              </div>

              {/* Master Docs List */}
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
                      className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex justify-between items-center gap-4 hover:border-slate-750 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-black text-slate-200 block">
                          {t(docName, docName)}
                        </span>
                        {uploaded ? (
                          <span className="text-[9px] text-slate-500 flex items-center gap-1 font-medium">
                            <span className="text-emerald-400">✓</span> {uploaded.file}
                          </span>
                        ) : (
                          <span className="text-[9px] text-red-400 font-bold">
                            ⚠️ {t("Missing Document", "ஆவணம் பதிவேற்றப்படவில்லை")}
                          </span>
                        )}
                      </div>

                      {uploaded ? (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-slate-950 ${
                          uploaded.status === "Verified" 
                            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" 
                            : "text-amber-400 border-amber-500/20 bg-amber-500/5"
                        }`}>
                          {uploaded.status === "Verified" ? t("Verified", "சரிபார்க்கப்பட்டது") : t("Pending", "செயல்பாட்டில் உள்ளது")}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleUploadSimulated(docName)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all"
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

          {/* TAB 4: GOVT SCHOLARSHIP NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="glass rounded-3xl p-6 border border-slate-700/50 min-h-full space-y-6">
              
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-400 animate-pulse" />
                {t("Govt Scholarship Bulletins", "அரசு உதவித்தொகை அறிவிப்புகள்")}
              </h3>

              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors relative overflow-hidden"
                    >
                      {/* Priority strip */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${
                        notif.priority === "urgent" ? "bg-red-500" : notif.priority === "high" ? "bg-amber-500" : "bg-blue-500"
                      }`}></div>

                      <div className="flex gap-3">
                        <span className="text-2xl shrink-0 mt-0.5">{notif.emoji}</span>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-white">
                              {t(notif.title, notif.titleTA)}
                            </h4>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                              notif.priority === "urgent" 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                : notif.priority === "high" 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {t(notif.priority.toUpperCase(), notif.priority.toUpperCase())}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {t(notif.description, notif.descriptionTA)}
                          </p>

                          <div className="flex justify-between items-center pt-2 text-[9px] font-bold text-slate-500">
                            <span>📅 {new Date(notif.date).toLocaleDateString()}</span>
                            {notif.link && (
                              <a 
                                href={notif.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:underline flex items-center gap-1"
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
                  <div className="text-center py-16 text-slate-500 text-xs">
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
