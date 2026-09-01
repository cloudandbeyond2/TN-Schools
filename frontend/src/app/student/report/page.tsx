"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  User, MapPin, Calendar, Eye, AlertTriangle, Clock,
  ShieldCheck, CheckCircle, ArrowLeft, ArrowRight,
  Info, Hash, Folder, Shield, Zap, UserX, UserCheck, Globe
} from "lucide-react";

// ─────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────
const t = {
  en: {
    pageTitle: "Report a Concern",
    pageSub: "Safe · Confidential · Monitored by Top Officials",
    backToCategories: "Back to Categories",
    backToCounsellor: "Back to Counsellor",
    needEmotionalSupport: "Need emotional support?",
    heroTitle: "Your Voice Matters",
    heroDesc: "Every report is reviewed by trained officials. You are protected. Critical reports are escalated to the ",
    heroDescBold: "District Education Officer & Commissioner",
    heroDescEnd: " within 24 hours.",
    anonOption: "Anonymous Option",
    escalationOption: "24h Critical Escalation",
    monitoredOption: "Monitored by Top Officials",
    selectCategoryTitle: "Select the Type of Concern",
    whoReviewsTitle: "Who Reviews Your Report",
    protectionTitle: "Your Protection Guaranteed",
    protectionDesc: "No student who files a report in good faith will face any punishment or retaliation. This is guaranteed by the ",
    emergencyTitle: "Emergency? Call Now",
    incidentDetails: "Incident Details",
    describeHappened: "Describe what happened",
    describeRequiredStar: "*",
    describePlaceholder: "Please describe the incident in detail. Include what happened, where, and how it made you feel. All information is confidential.",
    staffName: "Name of Person / Staff involved",
    optional: "(optional)",
    staffPlaceholder: "e.g., Math Teacher",
    whereHappened: "Where did it happen?",
    wherePlaceholder: "e.g., Classroom 8B",
    whenHappened: "When did it happen?",
    witnesses: "Were there any witnesses?",
    witnessPlaceholder: "e.g., My classmates",
    urgencyTitle: "Urgency Level",
    urgencyNormal: "Normal",
    urgencyNormalDesc: "Can wait for school day response (1-3 days)",
    urgencyUrgent: "Urgent",
    urgencyUrgentDesc: "Happening now or needs response today",
    identityTitle: "Identity Settings",
    anonReport: "Anonymous Report",
    anonDesc: "Name NOT shared. Tracking ID provided.",
    idReport: "Identified Report",
    idDesc: "Name shared for faster follow-up.",
    reportingAs: "Reporting as:",
    submitBtn: "Submit Report — I Am Speaking Up for My Safety",
    submitDisclaimer: "By submitting, you confirm that the information is truthful to the best of your knowledge. False reports are discouraged, but genuine concerns are always taken seriously.",
    successTitle: "Report Submitted Successfully!",
    successDesc: "Your concern has been securely received. It will be reviewed by the appropriate officials immediately.",
    refNumber: "Reference Number",
    category: "Category",
    priority: "Priority",
    identity: "Identity",
    submittedAt: "Submitted At",
    criticalAlert: "This critical report has been automatically flagged for District Education Officer and Commissioner review within 24 hours.",
    successFooter: "Please save your reference number. A school counsellor will contact you within 1–2 school days if necessary.",
    fileAnother: "File Another Report",
    backPortal: "Back to Portal",
    emergencyFooter: "If this is an emergency, please call 1098 (Child Helpline) or 100 (Police) right now."
  },
  ta: {
    pageTitle: "புகாரளிக்க",
    pageSub: "பாதுகாப்பானது · ரகசியமானது · அதிகாரிகளால் கண்காணிக்கப்படுகிறது",
    backToCategories: "வகைகளுக்குத் திரும்பு",
    backToCounsellor: "ஆலோசகரிடம் திரும்பு",
    needEmotionalSupport: "உணர்ச்சி ரீதியான ஆதரவு தேவையா?",
    heroTitle: "உங்கள் குரல் முக்கியம்",
    heroDesc: "ஒவ்வொரு புகாரும் பயிற்சி பெற்ற அதிகாரிகளால் மதிப்பாய்வு செய்யப்படுகிறது. நீங்கள் பாதுகாக்கப்படுகிறீர்கள். முக்கியமான புகார்கள் 24 மணி நேரத்திற்குள் ",
    heroDescBold: "மாவட்ட கல்வி அலுவலர் மற்றும் ஆணையருக்கு ",
    heroDescEnd: "அனுப்பப்படும்.",
    anonOption: "அனாமதேய விருப்பம்",
    escalationOption: "24 மணி நேர நேரடி நடவடிக்கை",
    monitoredOption: "உயர் அதிகாரிகளால் கண்காணிக்கப்படும்",
    selectCategoryTitle: "கவலையின் வகையைத் தேர்ந்தெடுக்கவும்",
    whoReviewsTitle: "உங்கள் புகாரை யார் மதிப்பாய்வு செய்கிறார்கள்",
    protectionTitle: "உங்கள் பாதுகாப்பு உத்தரவாதம்",
    protectionDesc: "நேர்மையான எண்ணத்தில் புகாரளிக்கும் எந்தவொரு மாணவரும் எந்தவொரு தண்டனையையும் பழிவாங்கலையும் சந்திக்க மாட்டார்கள். இது அரசாங்கத்தால் உத்தரவாதம் அளிக்கப்பட்டுள்ளது ",
    emergencyTitle: "அவசரமா? இப்போதே அழைக்கவும்",
    incidentDetails: "சம்பவ விவரங்கள்",
    describeHappened: "நடந்தது என்ன என்று விவரிக்கவும்",
    describeRequiredStar: "*",
    describePlaceholder: "தயவுசெய்து சம்பவத்தை விரிவாக விவரிக்கவும். எங்கு நடந்தது, எப்படி நடந்தது என்பதை உள்ளடக்குங்கள். அனைத்து தகவல்களும் ரகசியமானவை.",
    staffName: "சம்பந்தப்பட்ட நபர் / பணியாளரின் பெயர்",
    optional: "(விருப்பத்திற்குரியது)",
    staffPlaceholder: "உ.ம்., கணினி ஆசிரியர்",
    whereHappened: "எங்கே நடந்தது?",
    wherePlaceholder: "உ.ம்., வகுப்பு 8B",
    whenHappened: "எப்போது நடந்தது?",
    witnesses: "சாட்சிகள் யாராவது இருந்தார்களா?",
    witnessPlaceholder: "உ.ம்., என் வகுப்பு தோழர்கள்",
    urgencyTitle: "அவசர நிலை",
    urgencyNormal: "சாதாரண",
    urgencyNormalDesc: "பள்ளி நாளுக்காக காத்திருக்கலாம் (1-3 நாட்கள்)",
    urgencyUrgent: "அவசரம்",
    urgencyUrgentDesc: "இப்போது நடக்கிறது அல்லது இன்றே நடவடிக்கை தேவை",
    identityTitle: "அடையாள அமைப்புகள்",
    anonReport: "அனாமதேய புகார்",
    anonDesc: "பெயர் பகிரப்படாது. கண்காணிப்பு எண் வழங்கப்படும்.",
    idReport: "அடையாளத்துடன் புகார்",
    idDesc: "விரைவான நடவடிக்கைக்கு பெயர் பகிரப்படும்.",
    reportingAs: "புகாரளிப்பவர்:",
    submitBtn: "புகாரைச் சமர்ப்பிக்கவும் — என் பாதுகாப்பிற்காக நான் பேசுகிறேன்",
    submitDisclaimer: "சமர்ப்பிப்பதன் மூலம், உங்களுக்குத் தெரிந்தவரை தகவல் உண்மையானது என்பதை உறுதிப்படுத்துகிறீர்கள். தவறான புகார்கள் தவிர்க்கப்பட வேண்டும்.",
    successTitle: "புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
    successDesc: "உங்கள் கவலை பாதுகாப்பாகப் பெறப்பட்டது. இது சம்பந்தப்பட்ட அதிகாரிகளால் உடனடியாக மதிப்பாய்வு செய்யப்படும்.",
    refNumber: "குறிப்பு எண்",
    category: "வகை",
    priority: "முன்னுரிமை",
    identity: "அடையாளம்",
    submittedAt: "சமர்ப்பிக்கப்பட்ட நேரம்",
    criticalAlert: "இந்த முக்கியமான புகார் 24 மணி நேரத்திற்குள் மாவட்ட கல்வி அலுவலர் மற்றும் ஆணையரின் மதிப்பாய்வுக்காக தானாகவே குறிக்கப்பட்டுள்ளது.",
    successFooter: "தயவுசெய்து உங்கள் குறிப்பு எண்ணைச் சேமிக்கவும். தேவைப்பட்டால் பள்ளி ஆலோசகர் 1-2 பள்ளி நாட்களுக்குள் உங்களைத் தொடர்புகொள்வார்.",
    fileAnother: "மற்றொரு புகாரை அளிக்கவும்",
    backPortal: "முகப்புக்குத் திரும்பு",
    emergencyFooter: "இது அவசரநிலை என்றால், இப்போதே 1098 (குழந்தை உதவி எண்) அல்லது 100 (காவல்துறை) ஐ அழைக்கவும்."
  }
};

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const reportCategories = [
  {
    id: "teacher_behavior",
    icon: User,
    title: { en: "Teacher / Staff Behavior", ta: "ஆசிரியர் / பணியாளர் நடத்தை" },
    desc: { en: "Physical punishment, verbal abuse, discrimination, favouritism, inappropriate conduct", ta: "உடல் தண்டனை, வாய்மொழி துஷ்பிரயோகம், பாரபட்சம், முறையற்ற நடத்தை" },
    severity: "high",
  },
  {
    id: "sexual_harassment",
    icon: AlertTriangle,
    title: { en: "Sexual Harassment / POCSO", ta: "பாலியல் துஷ்பிரயோகம் / POCSO" },
    desc: { en: "Any inappropriate touch, sexual comment, or exploitation by anyone — reported directly to DEO & Commissioner", ta: "தகாத தொடுதல், பாலியல் கருத்துகள் — DEO மற்றும் ஆணையரிடம் நேரடியாக அறிவிக்கப்படும்" },
    severity: "critical",
  },
  {
    id: "girl_child_safety",
    icon: ShieldCheck,
    title: { en: "Girl Child Safety & Rights", ta: "பெண் குழந்தை பாதுகாப்பு & உரிமைகள்" },
    desc: { en: "Safety concerns, early marriage pressure, dropout risk, menstrual hygiene denial, gender discrimination", ta: "பாதுகாப்பு கவலைகள், திருமண அழுத்தம், பாலின பாரபட்சம்" },
    severity: "critical",
  },
  {
    id: "school_infrastructure",
    icon: Folder,
    title: { en: "School Infrastructure / Facilities", ta: "பள்ளி கட்டமைப்பு / வசதிகள்" },
    desc: { en: "Unsafe buildings, no drinking water, dirty toilets, no textbooks, mid-day meal issues", ta: "பாதுகாப்பற்ற கட்டிடம், குடிநீர் இல்லை, சுத்தமற்ற கழிவறை" },
    severity: "medium",
  },
  {
    id: "bullying_peer",
    icon: UserX,
    title: { en: "Bullying / Peer Harassment", ta: "மிரட்டல் / சக மாணவர் கொடுமை" },
    desc: { en: "Physical bullying, verbal abuse from peers, group exclusion, social media harassment, threats", ta: "உடல் மிரட்டல், சக மாணவரின் வாய்மொழி துஷ்பிரயோகம், சமூக ஊடக கொடுமை" },
    severity: "high",
  },
  {
    id: "welfare_denial",
    icon: Info,
    title: { en: "Welfare Scheme Denial", ta: "நலத்திட்ட மறுப்பு" },
    desc: { en: "Not receiving uniforms, textbooks, noon meal, laptop, scholarship, or bus pass you are eligible for", ta: "சீருடை, பாடப்புத்தகங்கள், நண்பகல் உணவு, மடிக்கணினி மறுக்கப்படுதல்" },
    severity: "medium",
  },
  {
    id: "child_labour",
    icon: Zap,
    title: { en: "Child Labour / Forced Work", ta: "குழந்தை தொழிலாளர்" },
    desc: { en: "Being forced to work instead of attending school, or working beyond permitted hours", ta: "பள்ளிக்கு பதிலாக வேலை செய்ய கட்டாயப்படுத்தப்படுதல்" },
    severity: "critical",
  },
  {
    id: "mental_health",
    icon: UserCheck,
    title: { en: "Mental Health & Personal Issue", ta: "மனநல மற்றும் தனிப்பட்ட சிக்கல்" },
    desc: { en: "Extreme stress, thoughts of self-harm, severe anxiety, suicidal thoughts — handled with utmost care", ta: "தீவிர மன அழுத்தம், சுய-தீங்கு எண்ணங்கள் — மிகுந்த கவனத்துடன் கையாளப்படும்" },
    severity: "critical",
  },
  {
    id: "other",
    icon: Hash,
    title: { en: "Other Concerns", ta: "மற்ற கவலைகள்" },
    desc: { en: "Any other issue not listed above that affects your education, safety, or wellbeing", ta: "மேலே பட்டியலிடப்படாத வேறு எந்த சிக்கலும்" },
    severity: "low",
  },
];

const severityConfig: Record<string, { label: { en: string; ta: string }; badge: string; bg: string; border: string; iconColor: string; grad: string }> = {
  critical: { label: { en: "CRITICAL", ta: "மிக முக்கியம்" }, badge: "bg-red-500 !text-white shadow-sm shadow-red-500/20", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-400 dark:border-red-600", iconColor: "text-red-500", grad: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20" },
  high: { label: { en: "HIGH", ta: "முக்கியம்" }, badge: "bg-orange-500 !text-white shadow-sm shadow-orange-500/20", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-400 dark:border-orange-600", iconColor: "text-orange-500", grad: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20" },
  medium: { label: { en: "MEDIUM", ta: "சராசரி" }, badge: "bg-amber-400 !text-amber-950 shadow-sm shadow-amber-400/20", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-400 dark:border-amber-600", iconColor: "text-amber-500", grad: "from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20" },
  low: { label: { en: "LOW", ta: "குறைவு" }, badge: "bg-slate-400 !text-white shadow-sm shadow-slate-400/20", bg: "bg-slate-50 dark:bg-slate-900/30", border: "border-slate-300 dark:border-slate-700", iconColor: "text-slate-500", grad: "from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30" },
};

const monitoringChain = [
  { level: "1", title: { en: "School Counsellor", ta: "பள்ளி ஆலோசகர்" }, icon: UserCheck, desc: { en: "Reviews all reports first; provides immediate support within 24 hours", ta: "அனைத்து புகார்களையும் முதலில் மதிப்பாய்வு செய்கிறார்" } },
  { level: "2", title: { en: "Headmaster", ta: "தலைமையாசிரியர்" }, icon: Folder, desc: { en: "Notified for High and Critical reports; takes action within 48 hours", ta: "முக்கியமான புகார்களுக்கு 48 மணி நேரத்திற்குள் நடவடிக்கை எடுக்கிறார்" } },
  { level: "3", title: { en: "BEO", ta: "வட்டாரக் கல்வி அலுவலர்" }, icon: Hash, desc: { en: "Alerted for unresolved or Critical issues; escalates to DEO", ta: "தீர்க்கப்படாத சிக்கல்களுக்கு எச்சரிக்கப்படுகிறார்" } },
  { level: "4", title: { en: "DEO", ta: "மாவட்டக் கல்வி அலுவலர்" }, icon: MapPin, desc: { en: "Reviews all Critical reports (POCSO, child labour, girl safety)", ta: "அனைத்து முக்கியமான புகார்களையும் மதிப்பாய்வு செய்கிறார்" } },
  { level: "5", title: { en: "Commissioner", ta: "ஆணையர்" }, icon: Shield, desc: { en: "Top officials receive weekly summaries and unresolved escalations", ta: "உயர் அதிகாரிகள் வாராந்திர சுருக்கங்களைப் பெறுகின்றனர்" } },
];

const renderStudentParsedDetails = (str: string) => {
  if (!str) return <p className="text-slate-500 text-xs italic">No description provided.</p>;

  if (str.includes("|")) {
    const parts = str.split("|").map(p => p.trim());
    const fields: { key: string; val: string }[] = [];
    let detailedDesc = "";

    parts.forEach(part => {
      const colonIdx = part.indexOf(":");
      if (colonIdx !== -1) {
        const k = part.substring(0, colonIdx).trim();
        const v = part.substring(colonIdx + 1).trim();
        if (k.toLowerCase() === "details") {
          detailedDesc = v;
        } else {
          fields.push({ key: k, val: v });
        }
      } else {
        detailedDesc += (detailedDesc ? " " : "") + part;
      }
    });

    return (
      <div className="space-y-3">
        {fields.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 bg-slate-100 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {fields.map((f, i) => (
              <div key={i} className="text-xs">
                <span className="text-[10px] text-red-500 dark:text-red-400 font-bold block uppercase tracking-wider mb-0.5">
                  {f.key}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{f.val}</span>
              </div>
            ))}
          </div>
        )}
        {detailedDesc && (
          <div className="bg-slate-100 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-red-500 dark:text-red-400 font-bold block uppercase tracking-wider">
              Detailed Description
            </span>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium">
              {detailedDesc}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans bg-slate-100 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
      {str}
    </p>
  );
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ReportPage() {
  const [lang, setLang] = useState<"en" | "ta">("en");
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"file" | "my_reports">("file");
  const [step, setStep] = useState<"select" | "form" | "success">("select");
  const [selectedCategory, setSelectedCategory] = useState<typeof reportCategories[0] | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [description, setDescription] = useState("");
  const [staffName, setStaffName] = useState("");
  const [location, setLocation] = useState("");
  const [dateOfIncident, setDateOfIncident] = useState("");
  const [witnessDetails, setWitnessDetails] = useState("");
  const [refNum, setRefNum] = useState("");

  const [myReports, setMyReports] = useState<any[]>([]);
  const [searchRef, setSearchRef] = useState("");
  const [selectedStudentReport, setSelectedStudentReport] = useState<any | null>(null);

  const fetchDatabaseStatuses = async (baseReports: any[]) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const dist = (session?.user as any)?.district || "Trichy";
      const res = await fetch(`${API_URL}/api/deo/grievances?district=${encodeURIComponent(dist)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // If local reports list is empty, automatically populate from database for current student
        if (baseReports.length === 0) {
          const studentNameLower = (session?.user?.name || "rathna").toLowerCase();
          const dbFetched = json.data
            .filter((g: any) =>
              g.petitioner.toLowerCase().includes(studentNameLower) ||
              g.petitioner.includes("TN-RPT") ||
              g.petitioner.includes("Anonymous Student")
            )
            .map((g: any) => {
              const refMatch = g.petitioner.match(/TN-RPT-\d+/);
              const refNum = refMatch ? refMatch[0] : `TN-RPT-${String(g.id).slice(-6).toUpperCase()}`;
              return {
                refNum,
                category: g.category || "General Concern",
                priority: g.escalation === "Critical" ? "CRITICAL" : (g.escalation === "High" ? "HIGH" : "MEDIUM"),
                date: g.filed || new Date().toISOString().split("T")[0],
                status: g.status,
                description: g.ministerAction || "Submitted concern report to school and DEO.",
                staffName: "School Staff",
                location: "Holy Cross Hr Sec School",
                dateOfIncident: g.filed || new Date().toISOString().split("T")[0],
                witnessDetails: "Classmates",
                urgency: "Normal (1-3 days)",
                isAnonymous: g.petitioner.includes("Anonymous") ? "Anonymous Report" : "Identified Report",
                officialNote: g.status === "Resolved"
                  ? "✅ Issue verified and marked as RESOLVED by District Education Officer."
                  : (g.status === "Under Review" ? "🔍 Currently under active investigation by DEO Team." : "⏳ Under active review by District Officers.")
              };
            });

          if (dbFetched.length > 0) {
            setMyReports(dbFetched);
            if (typeof window !== "undefined") {
              localStorage.setItem("tn_student_reports", JSON.stringify(dbFetched));
            }
            return;
          }
        }

        const updated = baseReports
          .filter(report => {
            // Keep report only if it still exists in the DEO database
            const dbMatch = json.data.find((g: any) =>
              g.petitioner.includes(report.refNum) ||
              g.id === report.refNum ||
              (g.category === report.category && (
                g.petitioner.toLowerCase().includes((report.name || report.studentName || session?.user?.name || "rathna").toLowerCase()) ||
                g.petitioner.includes(report.refNum)
              ))
            );
            return !!dbMatch;
          })
          .map(report => {
            const dbMatch = json.data.find((g: any) =>
              g.petitioner.includes(report.refNum) ||
              g.id === report.refNum ||
              (g.category === report.category && (
                g.petitioner.toLowerCase().includes((report.name || report.studentName || session?.user?.name || "rathna").toLowerCase()) ||
                g.petitioner.includes(report.refNum)
              ))
            );
            return {
              ...report,
              status: dbMatch.status,
              officialNote: dbMatch.status === "Resolved"
                ? "✅ Issue verified and marked as RESOLVED by District Education Officer."
                : (dbMatch.status === "Under Review" ? "🔍 Currently under active investigation by DEO Team." : report.officialNote)
            };
          });
        setMyReports(updated);
        if (typeof window !== "undefined") {
          localStorage.setItem("tn_student_reports", JSON.stringify(updated));
        }
      } else {
        setMyReports(baseReports);
      }
    } catch (err) {
      setMyReports(baseReports);
    }
  };

  useEffect(() => {
    let initialReports: any[] = [];
    const saved = typeof window !== "undefined" ? localStorage.getItem("tn_student_reports") : null;
    if (saved) {
      try {
        initialReports = JSON.parse(saved);
        if (Array.isArray(initialReports)) {
          initialReports = initialReports.filter(r => r.refNum !== "TN-RPT-806066");
        }
      } catch (e) {}
    }

    setMyReports(initialReports);
    fetchDatabaseStatuses(initialReports);

    // 3-second live auto-sync polling
    const interval = setInterval(() => {
      fetchDatabaseStatuses(initialReports);
    }, 3000);

    return () => clearInterval(interval);
  }, [session]);

  const L = t[lang];

  const handleCategorySelect = (cat: typeof reportCategories[0]) => {
    setSelectedCategory(cat);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `TN-RPT-${Date.now().toString().slice(-6)}`;
    setRefNum(ref);

    const newReportEntry = {
      refNum: ref,
      category: selectedCategory?.title.en || "General",
      priority: selectedCategory?.severity === "critical" ? "CRITICAL" : (urgency === "urgent" ? "HIGH" : "MEDIUM"),
      date: dateOfIncident || new Date().toISOString().split("T")[0],
      status: "Pending",
      description: description || "No description provided.",
      staffName: staffName || "Not specified",
      location: location || "Campus / School Grounds",
      dateOfIncident: dateOfIncident || new Date().toISOString().split("T")[0],
      witnessDetails: witnessDetails || "None recorded",
      urgency: urgency === "urgent" ? "Urgent (Same-day response)" : "Normal (1-3 days)",
      isAnonymous: isAnonymous ? "Anonymous Report" : "Identified Report",
      officialNote: selectedCategory?.severity === "critical" 
        ? "Received by DEO & Commissioner. Flagged for 24h critical escalation."
        : "Received by School Counsellor. Assigned for review within 1–3 school days."
    };

    const updated = [newReportEntry, ...myReports];
    setMyReports(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("tn_student_reports", JSON.stringify(updated));
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const userDistrict = (session?.user as any)?.district || "Trichy";
      const userSchool = (session?.user as any)?.schoolName || "Holy Cross Hr Sec School";

      const formattedAction = `School: ${userSchool} | Staff: ${staffName || "N/A"} | Location: ${location || "Campus"} | Date: ${dateOfIncident || "Today"} | Witnesses: ${witnessDetails || "None"} | Urgency: ${urgency} | Details: ${description}`;

      await fetch(`${API_URL}/api/deo/grievances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petitioner: isAnonymous ? `Anonymous Student (${ref}) (${userSchool}, Trichy)` : `${session?.user?.name || "Rathna"} (${ref}) (${userSchool}, Trichy)`,
          district: userDistrict,
          category: selectedCategory?.title.en || "General",
          filed: dateOfIncident || new Date().toISOString().split("T")[0],
          status: "Pending",
          escalation: selectedCategory?.severity === "critical" ? "Critical" : (urgency === "urgent" ? "High" : "Medium"),
          ministerAction: formattedAction
        })
      });
    } catch (err) {
      console.error("Error saving grievance to backend:", err);
    }

    setStep("success");
  };

  const sevConfig = selectedCategory ? severityConfig[selectedCategory.severity] : null;

  return (
    <PortalLayout
      title={L.pageTitle}
      subtitle={L.pageSub}
      avatarLetter="S"
      avatarColor="#ef4444"
      themeClass="theme-student"
      accentColor="#ef4444"
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => step === "form" ? setStep("select") : undefined}
          className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 md:gap-2 transition-colors w-fit group"
        >
          {step === "form" ? (
            <><ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {L.backToCategories}</>
          ) : (
            <Link href="/student/counsellor" className="flex items-center gap-1 md:gap-2 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {L.backToCounsellor}
            </Link>
          )}
        </button>

        <div className="flex items-center gap-4">
          <Link href="/student/counsellor" className="text-xs text-slate-500 hover:text-indigo-500 transition-colors hidden sm:flex items-center gap-1.5">
            {L.needEmotionalSupport} <ArrowRight size={14} />
          </Link>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
          >
            <Globe size={14} className="text-indigo-500" />
            {lang === "en" ? "தமிழ்" : "English"}
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden mb-6 md:mb-8 bg-red-600 bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 p-5 md:p-8 shadow-xl">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5" style={{ width: `${50 + i * 30}px`, height: `${50 + i * 30}px`, top: `${(i * 41) % 75}%`, left: `${(i * 31) % 80}%` }} />
          ))}
        </div>
        <div className="relative z-10 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 backdrop-blur-sm shadow-md">
              <ShieldCheck className="text-white w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-black mb-1.5 md:mb-1 leading-tight !text-white">{L.heroTitle}</p>
              <p className=" !text-white text-[10px] md:text-xs max-w-md leading-relaxed opacity-90">
                {L.heroDesc}
                <strong className="!text-white">{L.heroDescBold}</strong>
                {L.heroDescEnd}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-4">
            <span className="text-[9px] md:text-[10px] bg-white/15 border border-white/20 rounded-full px-2.5 md:px-3 py-1 md:py-1.5 font-bold uppercase tracking-wide flex items-center gap-1.5 backdrop-blur-sm !text-white">
              <Shield size={12} className="!text-white" /> {L.anonOption}
            </span>
            <span className="text-[9px] md:text-[10px] bg-white/15 border border-white/20 rounded-full px-2.5 md:px-3 py-1 md:py-1.5 font-bold uppercase tracking-wide flex items-center gap-1.5 backdrop-blur-sm !text-white">
              <Zap size={12} className="!text-white" /> {L.escalationOption}
            </span>
            <span className="text-[9px] md:text-[10px] bg-white/15 border border-white/20 rounded-full px-2.5 md:px-3 py-1 md:py-1.5 font-bold uppercase tracking-wide flex items-center gap-1.5 backdrop-blur-sm !text-white">
              <Eye size={12} className="!text-white" /> {L.monitoredOption}
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs: File Report vs My Reports & Live Status ── */}
      <div className="flex items-center gap-3 mb-6 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => { setActiveTab("file"); setStep("select"); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "file"
              ? "bg-red-600 !text-white shadow-md font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
          }`}
          style={activeTab === "file" ? { backgroundColor: "#dc2626", color: "#ffffff" } : undefined}
        >
          <ShieldCheck size={16} />
          {lang === "en" ? "File New Concern" : "புதிய புகார் சமர்ப்பிக்க"}
        </button>

        <button
          onClick={() => { setActiveTab("my_reports"); fetchDatabaseStatuses(myReports); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === "my_reports"
              ? "bg-red-600 !text-white shadow-md font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
          }`}
          style={activeTab === "my_reports" ? { backgroundColor: "#dc2626", color: "#ffffff" } : undefined}
        >
          <Clock size={16} />
          {lang === "en" ? "My Filed Reports & Live Status" : "என் புகார்கள் & நேரலை நிலை"}
          {myReports.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 !text-white font-black">
              {myReports.length}
            </span>
          )}
        </button>
      </div>

      {/* ── MY REPORTS & LIVE STATUS TRACKER ── */}
      {activeTab === "my_reports" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
                <Hash size={18} className="text-indigo-500" />
                {lang === "en" ? "Track Complaint Status by Reference Number" : "குறிப்பு எண்ணால் புகாரைக் கண்காணிக்க"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === "en" 
                  ? "Enter your TN-RPT reference number to view official response updates." 
                  : "உங்கள் TN-RPT குறிப்பு எண்ணை உள்ளிட்டு நிலையை அறியவும்."}
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                placeholder="e.g. TN-RPT-806066"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-black dark:text-white uppercase placeholder:normal-case focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {myReports.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <Hash size={32} className="mx-auto text-slate-400 mb-3" />
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {lang === "en" ? "No Reports Filed" : "எந்த புகாரும் இல்லை"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === "en" ? "You haven't filed any reports yet, or they are not saved on this device." : "நீங்கள் இதுவரை எந்த புகாரும் அளிக்கவில்லை."}
                </p>
              </div>
            ) : (
              myReports
                .filter((r) => !searchRef || r.refNum.toLowerCase().includes(searchRef.toLowerCase()))
                .map((r, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all hover:border-red-400/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                          {r.refNum}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${
                          r.priority === "CRITICAL" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-950"
                        }`}>
                          {r.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          r.status === "Resolved" 
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300"
                            : r.status === "Under Review"
                            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-300"
                            : r.status === "Closed" || r.status === "Deleted"
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-400"
                            : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-300"
                        }`}>
                          {r.status === "Resolved" ? "✅ Resolved" : r.status === "Under Review" ? "🔍 Under Review" : r.status === "Closed" || r.status === "Deleted" ? "🗑️ Closed / Archived" : "⏳ Action Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Category & Date</span>
                        <span className="font-bold text-black dark:text-white block">{r.category}</span>
                        <span className="text-slate-500 text-[11px]">{r.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Incident Summary</span>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2">{r.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-3 flex-1">
                        <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block mb-0.5">
                            Official Department Response / Action Note
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {r.officialNote || "Your report is under active review by the school counsellor and DEO."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStudentReport(r)}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 !text-white text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                        style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                      >
                        <Eye size={14} className="!text-white" />
                        {lang === "en" ? "View Full Details" : "முழு விவரங்களை பார்க்க"}
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ── STEP 1: Select Category ── */}
      {activeTab === "file" && step === "select" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Hash size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-base font-black text-black dark:text-white">{L.selectCategoryTitle}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportCategories.map((cat) => {
                const sc = severityConfig[cat.severity];
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg group bg-gradient-to-br ${sc.grad} ${sc.border}`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border ${sc.border} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon size={24} className={sc.iconColor} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="text-xs font-black text-black dark:text-white leading-tight">{cat.title[lang]}</div>
                        <span className={`shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${sc.badge}`}>{sc.label[lang]}</span>
                      </div>
                      <div className="text-[10px] text-slate-700 dark:text-slate-400 leading-relaxed mb-1">{cat.desc[lang]}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monitoring Chain */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Hash size={20} className="text-indigo-500" />
                <h3 className="text-sm font-black text-black dark:text-white">{L.whoReviewsTitle}</h3>
              </div>
              <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-[13px] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {monitoringChain.map((m) => {
                  const MIcon = m.icon;
                  return (
                    <div key={m.level} className="flex gap-4 items-start relative z-10">
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <MIcon size={12} className="text-indigo-500" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-black dark:text-white mb-0.5">{m.title[lang]}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{m.desc[lang]}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl p-5 border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-500" />
                <h3 className="text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wide">{L.emergencyTitle}</h3>
              </div>
              <div className="space-y-2">
                {[
                  { num: "1098", label: lang === "en" ? "Child Helpline" : "குழந்தை உதவி எண்", icon: Hash },
                  { num: "181", label: lang === "en" ? "Women Helpline" : "பெண்கள் உதவி எண்", icon: Shield },
                  { num: "100", label: lang === "en" ? "Police" : "காவல்துறை", icon: ShieldCheck },
                ].map((h) => {
                  const HIcon = h.icon;
                  return (
                    <a key={h.num} href={`tel:${h.num}`} className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-800/50 text-xs font-bold text-red-600 dark:text-red-400 hover:shadow-md transition-all group">
                      <div className="w-6 h-6 rounded-md bg-red-50 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HIcon size={12} />
                      </div>
                      {h.num} <span className="text-slate-400 dark:text-slate-500 font-medium ml-1">– {h.label}</span>
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3 items-start">
              <ShieldCheck size={20} className="text-indigo-500 mt-0.5" />
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-black dark:text-white block mb-1">{L.protectionTitle}</strong>
                {L.protectionDesc} <strong>RTE Act</strong> {lang === "en" ? "and" : "மற்றும்"} <strong>POCSO</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Report Form ── */}
      {step === "form" && selectedCategory && sevConfig && (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div className={`rounded-3xl p-6 border-2 flex items-center gap-5 shadow-sm bg-gradient-to-br ${sevConfig.grad} ${sevConfig.border}`}>
            <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border ${sevConfig.border} flex items-center justify-center shrink-0 shadow-sm`}>
              <selectedCategory.icon size={28} className={sevConfig.iconColor} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-base font-black text-black dark:text-white">{selectedCategory.title[lang]}</h2>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${sevConfig.badge}`}>{sevConfig.label[lang]}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">{selectedCategory.desc[lang]}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Hash size={20} className="text-indigo-500" />
              <h3 className="text-base font-black text-black dark:text-white">{L.incidentDetails}</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {L.describeHappened} <span className="text-red-500">{L.describeRequiredStar}</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder={L.describePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {L.staffName}
                  <span className="font-normal text-slate-400 ml-1">{L.optional}</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder={L.staffPlaceholder}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {L.whereHappened}
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={L.wherePlaceholder}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {L.whenHappened}
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <input
                    type="date"
                    value={dateOfIncident}
                    onChange={(e) => setDateOfIncident(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {L.witnesses}
                </label>
                <div className="relative">
                  <Eye size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={witnessDetails}
                    onChange={(e) => setWitnessDetails(e.target.value)}
                    placeholder={L.witnessPlaceholder}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-indigo-500" />
                <h3 className="text-sm font-black text-black dark:text-white">{L.urgencyTitle}</h3>
              </div>
              <div className="space-y-3">
                {[
                  { val: "normal", icon: Clock, label: L.urgencyNormal, desc: L.urgencyNormalDesc },
                  { val: "urgent", icon: AlertTriangle, label: L.urgencyUrgent, desc: L.urgencyUrgentDesc },
                ].map((u) => {
                  const UIcon = u.icon;
                  return (
                    <button
                      key={u.val}
                      type="button"
                      onClick={() => setUrgency(u.val as "normal" | "urgent")}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${urgency === u.val
                        ? u.val === "urgent"
                          ? "border-red-400 bg-red-50 dark:bg-red-900/20 shadow-sm"
                          : "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${urgency === u.val
                        ? u.val === "urgent" ? "bg-red-100 dark:bg-red-900/40" : "bg-indigo-100 dark:bg-indigo-900/40"
                        : "bg-slate-100 dark:bg-slate-800"
                        }`}>
                        <UIcon size={18} className={`${urgency === u.val
                          ? u.val === "urgent" ? "text-red-500" : "text-indigo-500"
                          : "text-slate-400"
                          }`} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-black dark:text-white">{u.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{u.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <UserX size={20} className="text-indigo-500" />
                <h3 className="text-sm font-black text-black dark:text-white">{L.identityTitle}</h3>
              </div>
              <div className="space-y-3">
                {[
                  { val: true, icon: UserX, label: L.anonReport, desc: L.anonDesc },
                  { val: false, icon: User, label: L.idReport, desc: L.idDesc },
                ].map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setIsAnonymous(opt.val)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${isAnonymous === opt.val
                        ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAnonymous === opt.val ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-slate-100 dark:bg-slate-800"
                        }`}>
                        <OptIcon size={18} className={`${isAnonymous === opt.val ? "text-indigo-500" : "text-slate-400"}`} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-black dark:text-white">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
              {!isAnonymous && session?.user?.name && (
                <div className="mt-4 text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Info size={14} className="text-indigo-400" />
                  <span>{L.reportingAs} <strong className="text-black dark:text-white">{session.user.name}</strong></span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!description.trim()}
            className="w-full py-4 !text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-red-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            style={{ background: "linear-gradient(to right, #ef4444, #e11d48)", color: "#ffffff" }}
          >
            <ShieldCheck size={20} className="!text-white" />
            <span className="!text-white font-black">{L.submitBtn}</span>
          </button>
          <p className="text-center text-[10px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            {L.submitDisclaimer}
          </p>
        </form>
      )}

      {/* ── STEP 3: Success ── */}
      {step === "success" && selectedCategory && (
        <div className="max-w-xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 rounded-3xl p-8 md:p-12 border border-emerald-200 dark:border-emerald-800 text-center shadow-lg">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mb-2">{L.successTitle}</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-500 mb-8 max-w-md mx-auto">
              {L.successDesc}
            </p>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-8 text-left space-y-4 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2"><Hash size={14} /> {L.refNumber}</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm font-mono bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md tracking-wider">{refNum}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 flex items-center gap-2"><Folder size={14} /> {L.category}</span>
                <span className="font-bold text-black dark:text-white">{selectedCategory.title[lang]}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 flex items-center gap-2"><AlertTriangle size={14} /> {L.priority}</span>
                <span className={`font-black text-[9px] px-2 py-0.5 rounded uppercase ${severityConfig[selectedCategory.severity].badge}`}>
                  {severityConfig[selectedCategory.severity].label[lang]}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 flex items-center gap-2"><UserX size={14} /> {L.identity}</span>
                <span className="font-bold text-black dark:text-white">{isAnonymous ? (lang === "en" ? "Anonymous" : "அனாமதேயம்") : session?.user?.name || (lang === "en" ? "Identified" : "அடையாளத்துடன்")}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> {L.submittedAt}</span>
                <span className="font-bold text-black dark:text-white">{new Date().toLocaleString(lang === "en" ? "en-IN" : "ta-IN")}</span>
              </div>
            </div>

            {selectedCategory.severity === "critical" && (
              <div className="text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400 flex items-start gap-3 text-left">
                <Zap size={20} className="mt-0.5 shrink-0" />
                <p>{L.criticalAlert}</p>
              </div>
            )}

            <p className="text-xs text-slate-500 mb-8 max-w-sm mx-auto">
              {L.successFooter}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setStep("select"); setSelectedCategory(null); setDescription(""); }} className="px-6 py-3 border-2 border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center gap-2">
                <Hash size={16} /> {L.fileAnother}
              </button>
              <Link href="/student" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 !text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2" style={{ backgroundColor: "#10b981", color: "#ffffff" }}>
                <span className="!text-white font-black">{L.backPortal}</span> <ArrowRight size={16} className="!text-white" />
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Info size={16} className="text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
              {L.emergencyFooter}
            </p>
          </div>
        </div>
      )}

      {/* ── Student View Details Modal ── */}
      {selectedStudentReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <ShieldCheck size={22} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-black dark:text-white">
                    {lang === "en" ? "Report Details" : "புகார் விவரங்கள்"}
                  </h3>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedStudentReport.refNum}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentReport(null)}
                className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                ✕ {lang === "en" ? "Close" : "மூடு"}
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Category</span>
                  <span className="font-bold text-black dark:text-white">{selectedStudentReport.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Priority</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    selectedStudentReport.priority === "CRITICAL" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-950"
                  }`}>
                    {selectedStudentReport.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Date Filed</span>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">{selectedStudentReport.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Current Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedStudentReport.status === "Resolved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {selectedStudentReport.status}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                  {lang === "en" ? "Full Incident Details & Description" : "சம்பவத்தின் முழு விவரங்கள்"}
                </span>
                {renderStudentParsedDetails(selectedStudentReport.description || "")}
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                    {lang === "en" ? "Official Department Action / Response" : "அதிகாரப்பூர்வ நடவடிக்கை குறிப்பு"}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                  {selectedStudentReport.officialNote || "Your report is under active review by the school counsellor and DEO."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
