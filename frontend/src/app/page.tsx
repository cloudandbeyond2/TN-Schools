"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { portals } from "@/lib/navConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MoreVertical } from "lucide-react";
import { LucideIcon } from "@/components/LucideIcon";

/* ─── Government Color Palette ─── */
// New Palette: Deep Purple (#065F46), Lavender (#10B981), Golden Yellow (#F59E0B), Warm Orange (#F97316), Red-Orange (#0D9488)

/* ─── Translations Dictionary ─── */
const t = {
  en: {
    govtName: "Government of Tamil Nadu",
    deptName: "School Education Department",
    navFeatures: "Features",
    navPortals: "Portals",
    navImpact: "Statistics",
    navTestimonials: "Testimonials",
    navSignIn: "Sign In",
    navSignOut: "Sign Out",

    heroBadge: "Official AI-Powered Education Platform — 2026",
    heroTitle1: "Tamil Nadu Smart",
    heroTitle2: "Education Portal",
    heroSub: "An integrated digital governance platform for students, teachers, parents and administrators across 37,000+ government schools of Tamil Nadu",
    heroType1: "Class 6–12 · 37,000+ Schools · 47.2 Lakh Students",
    heroType2: "AI Tutoring · Adaptive Learning · Real-time Analytics",
    heroType3: "8 Role-based Portals · State-wide Governance",
    heroBtnGo: "Go to Your Portal",
    heroBtnSignIn: "Sign In to Portal",
    heroBtnExplore: "Explore Portals",

    announcementText: "🔔 New: AI-Powered Adaptive Learning Module now live for Classes 9–12 across all Tamil Nadu Government Schools.",

    statTitleSub: "Platform Impact",
    statTitle1: "Transforming Education",
    statTitle2: "Across Tamil Nadu",
    statDesc: "Real-time data-driven insights powering the entire state education ecosystem.",
    stats: [
      { label: "Total Students", value: "47.2L", icon: <i className="fi fi-rr-graduation-cap"></i>, color: "#065F46" },
      { label: "Government Schools", value: "37,000+", icon: <i className="fi fi-rr-building"></i>, color: "#10B981" },
      { label: "Dedicated Teachers", value: "2.1L", icon: <i className="fi fi-rr-book-alt"></i>, color: "#F97316" },
      { label: "Districts Covered", value: "38", icon: <i className="fi fi-rr-map"></i>, color: "#F59E0B" },
    ],

    featTitleSub: "Platform Features",
    featTitle1: "Comprehensive Digital",
    featTitle2: "Education Tools",
    featDesc: "Purpose-built AI and analytics tools for every stakeholder in the Tamil Nadu education ecosystem.",
    features: [
      { title: "AI-Powered Tutoring", desc: "Personalized adaptive learning pathways using advanced AI for every student across Class 6–12.", icon: <i className="fi fi-rr-robot"></i>, color: "#065F46" },
      { title: "Real-time Analytics", desc: "Live dashboards tracking attendance, performance, and learning outcomes at every administrative level.", icon: <i className="fi fi-rr-chart-histogram"></i>, color: "#10B981" },
      { title: "Adaptive Assessments", desc: "Smart question generation and AI-evaluated tests with instant feedback and personalized guidance.", icon: <i className="fi fi-rr-bullseye"></i>, color: "#F97316" },
      { title: "Multi-Role Governance", desc: "8 dedicated portals from Student to Minister, each with role-specific insights and controls.", icon: <i className="fi fi-rr-shield"></i>, color: "#065F46" },
      { title: "Live State Monitoring", desc: "Real-time command center for state-wide education health, KPI tracking and policy compliance.", icon: <i className="fi fi-rr-rss"></i>, color: "#10B981" },
      { title: "Career & Scholarship", desc: "AI-driven career guidance, college admissions support, scholarship tracking and welfare schemes.", icon: <i className="fi fi-rr-graduation-cap"></i>, color: "#0D9488" },
    ],

    portalTitleSub: "Role-Based Access",
    portalTitle1: "Select Your",
    portalTitle2: "Portal",
    portalDesc: "8 dedicated portals designed for every role in the Tamil Nadu education hierarchy.",
    portalEnter: "Enter Portal",

    testTitleSub: "Testimonials",
    testTitle1: "Trusted by Educators",
    testTitle2: "Across Tamil Nadu",
    testDesc: "Hear from the educators, students, and parents transforming education in Tamil Nadu.",

    ctaBadge: "Platform is Live",
    ctaTitle: "Join the Digital Education Revolution",
    ctaDesc: "Join 47.2 lakh students and 2.1 lakh teachers already using the platform across Tamil Nadu.",
    ctaBtnIn: "Sign In to Portal",
    ctaBtnBrowse: "Browse Portals",

    ftPortals: "Portals",
    ftAdmin: "Administration",
    ftRes: "Resources",
    ftHelp: "Help Center",
    ftDoc: "Documentation",
    ftPrivacy: "Privacy Policy",
    ftTerms: "Terms of Service",
    ftCopy: "© 2026 Tamil Nadu School Education Department. All rights reserved.",
    ftStatus: "All Systems Operational",
    ftGovt: "Government of Tamil Nadu"
  },
  ta: {
    govtName: "தமிழ்நாடு அரசு",
    deptName: "பள்ளிக்கல்வி துறை",
    navFeatures: "அம்சங்கள்",
    navPortals: "இணையதளங்கள்",
    navImpact: "புள்ளிவிவரங்கள்",
    navTestimonials: "சான்றளிப்புகள்",
    navSignIn: "உள்நுழைக",
    navSignOut: "வெளியேறு",

    heroBadge: "அதிகாரப்பூர்வ AI கல்வி தளம் — 2026",
    heroTitle1: "தமிழ்நாடு ஸ்மார்ட்",
    heroTitle2: "கல்விப் போர்ட்டல்",
    heroSub: "தமிழ்நாட்டில் 37,000+ அரசு பள்ளிகளில் மாணவர்கள், ஆசிரியர்கள், பெற்றோர்கள் மற்றும் நிர்வாகிகளுக்கான ஒருங்கிணைந்த டிஜிட்டல் ஆட்சி தளம்",
    heroType1: "வகுப்பு 6–12 · 37,000+ பள்ளிகள் · 47.2 லட்சம் மாணவர்கள்",
    heroType2: "AI பயிற்சி · தழுவல் கற்றல் · நிகழ்நேர பகுப்பாய்வு",
    heroType3: "8 பங்கு அடிப்படையிலான இணையதளங்கள் · மாநில நிர்வாகம்",
    heroBtnGo: "உங்கள் தளத்திற்கு செல்க",
    heroBtnSignIn: "தளத்தில் உள்நுழைக",
    heroBtnExplore: "இணையதளங்களை ஆராய்க",

    announcementText: "🔔 புதிது: AI-இயக்கும் தழுவல் கற்றல் தொகுதி இப்போது வகுப்பு 9–12 க்கு நேரலையில்.",

    statTitleSub: "தளத்தின் தாக்கம்",
    statTitle1: "தமிழ்நாடு முழுவதும்",
    statTitle2: "கல்வி மாற்றம்",
    statDesc: "முழு மாநில கல்வி அமைப்பையும் இயக்கும் நிகழ்நேர தரவு உந்துதல் நுண்ணறிவு.",
    stats: [
      { label: "மொத்த மாணவர்கள்", value: "47.2L", icon: <i className="fi fi-rr-graduation-cap"></i>, color: "#065F46" },
      { label: "அரசு பள்ளிகள்", value: "37,000+", icon: <i className="fi fi-rr-building"></i>, color: "#10B981" },
      { label: "அர்ப்பணிப்புள்ள ஆசிரியர்கள்", value: "2.1L", icon: <i className="fi fi-rr-book-alt"></i>, color: "#F97316" },
      { label: "மாவட்டங்கள்", value: "38", icon: <i className="fi fi-rr-map"></i>, color: "#F59E0B" },
    ],

    featTitleSub: "தளத்தின் அம்சங்கள்",
    featTitle1: "விரிவான டிஜிட்டல்",
    featTitle2: "கல்வி கருவிகள்",
    featDesc: "தமிழ்நாடு கல்வி சூழல்மண்டலத்தில் உள்ள ஒவ்வொரு பங்குதாரருக்கும் AI மற்றும் பகுப்பாய்வு கருவிகள்.",
    features: [
      { title: "AI-ஆதரவு பயிற்சி", desc: "வகுப்பு 6 முதல் 12 வரையிலான அனைத்து மாணவர்களுக்கும் AI மூலம் தனிப்பயனாக்கப்பட்ட கற்றல் வழிகள்.", icon: <i className="fi fi-rr-robot"></i>, color: "#065F46" },
      { title: "நிகழ்நேர பகுப்பாய்வு", desc: "ஒவ்வொரு நிலையிலும் வருகை, செயல்திறன் மற்றும் கற்றல் முடிவுகளைக் கண்காணிக்கும் நேரடி டாஷ்போர்டுகள்.", icon: <i className="fi fi-rr-chart-histogram"></i>, color: "#10B981" },
      { title: "தழுவல் மதிப்பீடுகள்", desc: "உடனடி கருத்துக்களுடன் AI மதிப்பீடு செய்யும் தேர்வுகள் மற்றும் தனிப்பயன் வழிகாட்டுதல்.", icon: <i className="fi fi-rr-bullseye"></i>, color: "#F97316" },
      { title: "பல-பங்கு நிர்வாகம்", desc: "மாணவர் முதல் அமைச்சர் வரை 8 பிரத்யேக இணையதளங்கள்.", icon: <i className="fi fi-rr-shield"></i>, color: "#065F46" },
      { title: "நேரடி மாநில கண்காணிப்பு", desc: "மாநில அளவிலான KPI கண்காணிப்பு மற்றும் கொள்கை இணக்கத்திற்கான நிகழ்நேர மையம்.", icon: <i className="fi fi-rr-rss"></i>, color: "#10B981" },
      { title: "தொழில் & உதவித்தொகை", desc: "AI வழிகாட்டுதல், கல்லூரி சேர்க்கை ஆதரவு மற்றும் உதவித்தொகை கண்காணிப்பு.", icon: <i className="fi fi-rr-graduation-cap"></i>, color: "#0D9488" },
    ],

    portalTitleSub: "பங்கு-அடிப்படையிலான அணுகல்",
    portalTitle1: "உங்கள்",
    portalTitle2: "இணையதளத்தை தேர்வு செய்க",
    portalDesc: "தமிழ்நாடு கல்விப் படிநிலையில் ஒவ்வொரு பொறுப்புக்கும் 8 பிரத்யேக இணையதளங்கள்.",
    portalEnter: "உள்ளே நுழைய",

    testTitleSub: "சான்றளிப்புகள்",
    testTitle1: "கல்வியாளர்களால்",
    testTitle2: "நம்பப்படுகிறது",
    testDesc: "தமிழ்நாட்டில் கல்வியை மாற்றிவரும் கல்வியாளர்கள், மாணவர்கள் மற்றும் பெற்றோர்களிடம் கேளுங்கள்.",

    ctaBadge: "தளம் நேரலையில் உள்ளது",
    ctaTitle: "டிஜிட்டல் கல்வி புரட்சியில் இணைங்கள்",
    ctaDesc: "தமிழ்நாடு முழுவதும் இந்த தளத்தை பயன்படுத்தும் 47.2 லட்சம் மாணவர்கள் மற்றும் 2.1 லட்சம் ஆசிரியர்களுடன் நீங்களும் சேருங்கள்.",
    ctaBtnIn: "தளத்தில் உள்நுழைக",
    ctaBtnBrowse: "இணையதளங்களை உலாவு",

    ftPortals: "இணையதளங்கள்",
    ftAdmin: "நிர்வாகம்",
    ftRes: "வளங்கள்",
    ftHelp: "உதவி மையம்",
    ftDoc: "ஆவணங்கள்",
    ftPrivacy: "தனியுரிமை கொள்கை",
    ftTerms: "சேவை விதிமுறைகள்",
    ftCopy: "© 2026 தமிழ்நாடு பள்ளிக்கல்வி துறை. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    ftStatus: "அனைத்து அமைப்புகளும் செயல்படுகின்றன",
    ftGovt: "தமிழ்நாடு அரசு"
  }
};

const testimonials = [
  { name: "Mrs. Sumathi Devi", role: "Mathematics Teacher, GHS Coimbatore", text: "The AI Lesson Planner has transformed how I prepare classes. My students' engagement has increased by 40% this semester.", avatar: "S", color: "#065F46" },
  { name: "Arjun Kumar", role: "Class 10 Student, GHSS Madurai", text: "The adaptive quizzes and AI tutor helped me understand concepts I struggled with. I scored 95% in my board exams!", avatar: "A", color: "#10B981" },
  { name: "Mr. Rajesh", role: "Parent, Chennai District", text: "I can track my daughter's progress in real-time. The notifications keep me connected with her school activities.", avatar: "R", color: "#F97316" },
  { name: "Mr. Venkatesh R.", role: "Headmaster, GHS Coimbatore", text: "Managing 1200+ students has never been this efficient. The dashboard gives me a complete 360° view of the school.", avatar: "V", color: "#0D9488" },
];

const portalColors: Record<string, { bg: string; border: string; text: string }> = {
  "/student": { bg: "#F0FDF4", border: "#166534", text: "#166534" },
  "/parent": { bg: "#ECFDF5", border: "#059669", text: "#047857" },
  "/teacher": { bg: "#F0FDFA", border: "#0D9488", text: "#0F766E" },
  "/headmaster": { bg: "#FFFBEB", border: "#D97706", text: "#B45309" },
  "/block-education-officer": { bg: "#FEFCE8", border: "#CA8A04", text: "#A16207" },
  "/district-education-officer": { bg: "#FFF7ED", border: "#EA580C", text: "#C2410C" },
  "/commissioner": { bg: "#F0F9FF", border: "#0284C7", text: "#0369A1" },
  "/minister": { bg: "#F5F3FF", border: "#7C3AED", text: "#6D28D9" },
};

/* ─── Typed Text Effect ─── */
function TypedText({ texts, speed = 60, pause = 2000 }: { texts: string[]; speed?: number; pause?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        if (charIndex + 1 === currentText.length) {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        setDisplayText(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  return (
    <span style={{ color: "inherit" }}>
      {displayText}
      <span className="typing-cursor" style={{ background: "currentColor" }} />
    </span>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function HomePage() {
  const { data: session } = useSession();
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const text = t[lang];

  const getPortalLink = () => {
    if (!session?.user) return "/login";
    const role = (session.user as any).role || "STUDENT";
    if (role === "SUPERADMIN") return "/super-admin";
    if (role === "TEACHER") return "/teacher";
    if (role === "PARENT") return "/parent";
    if (role === "HEADMASTER") return "/headmaster";
    if (role === "BEO") return "/block-education-officer";
    if (role === "DEO") return "/district-education-officer";
    if (role === "COMMISSIONER") return "/commissioner";
    if (role === "MINISTER") return "/minister";
    return "/student";
  };

  useEffect(() => {
    const handleScroll = () => setIsNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ background: "#FAFAFA", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#064E3B", overflowX: "hidden" }}>
      {/* ═══════ GOVERNMENT TOP STRIP ═══════ */}
      <div style={{ background: "#022C22", color: "#A7F3D0", padding: "8px 0", fontSize: "11px", borderBottom: "1px solid rgba(167,243,208,0.2)" }}>
        <div className="px-4 md:px-8" style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="text-white" style={{ fontSize: "13px" }}><i className="fi fi-rr-flag"></i></span>
            <span style={{ fontWeight: 600, color: "#ffffff" }}>{text.govtName}</span>
            <span style={{ opacity: 0.5, color: "#ffffff" }}>|</span>
            <span style={{ opacity: 0.9, color: "#ffffff" }}>{text.deptName}</span>
          </div>
          <div className="hidden sm:flex" style={{ alignItems: "center", gap: "16px", fontWeight: 500 }}>
            <span className="text-white" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34D399", display: "inline-block", boxShadow: "0 0 8px rgba(52,211,153,0.6)" }}></span>
              {text.ftStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ MAIN NAVBAR ═══════ */}
      <nav
        id="main-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: isNavScrolled ? "rgba(255, 255, 255, 0.95)" : "#FAFAFA",
          backdropFilter: isNavScrolled ? "blur(12px)" : "none",
          borderBottom: isNavScrolled ? "1px solid rgba(6, 95, 70, 0.1)" : "1px solid transparent",
          transition: "all 0.3s ease",
          padding: "16px 0"
        }}
      >
        <div className="px-4 md:px-8" style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{ width: "42px", height: "42px", background: "#065F46", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 12px rgba(6,95,70,0.2)", transform: "rotate(-3deg)", color: "white" }}>
              <i className="fi fi-rr-bank"></i>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#065F46", lineHeight: "1.1", letterSpacing: "-0.5px" }}>TN Schools</div>
              <div className="hidden sm:block" style={{ fontSize: "11px", color: "#10B981", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Digital Campus</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-full px-6 py-2 shadow-sm" style={{ gap: "32px" }}>
            {[
              { label: text.navFeatures, href: "#features" },
              { label: text.navPortals, href: "#portals" },
              { label: text.navImpact, href: "#stats" },
              { label: text.navTestimonials, href: "#testimonials" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{ fontSize: "14px", color: "#374151", fontWeight: 600, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10B981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Lang Toggle */}
            <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "20px", overflow: "hidden", padding: "2px" }}>
              <button
                onClick={() => setLang("en")}
                style={{ fontSize: "12px", padding: "6px 14px", border: "none", borderRadius: "18px", cursor: "pointer", fontWeight: 700, background: lang === "en" ? "#ffffff" : "transparent", color: lang === "en" ? "#065F46" : "#6B7280", boxShadow: lang === "en" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
              >EN</button>
              <button
                onClick={() => setLang("ta")}
                style={{ fontSize: "12px", padding: "6px 14px", border: "none", borderRadius: "18px", cursor: "pointer", fontWeight: 700, background: lang === "ta" ? "#ffffff" : "transparent", color: lang === "ta" ? "#065F46" : "#6B7280", boxShadow: lang === "ta" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
              >தமிழ்</button>
            </div>

            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getPortalLink()}
                  style={{ fontSize: "14px", color: "#065F46", background: "#ECFDF5", border: "2px solid #A7F3D0", padding: "8px 20px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", fontWeight: 700, transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#D1FAE5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#ECFDF5"; }}
                >
                  <span><i className="fi fi-rr-hand-wave"></i> {(session.user as any)?.name}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{ fontSize: "14px", fontWeight: 700, color: "#DC2626", background: "#FEF2F2", padding: "10px 16px", borderRadius: "24px", cursor: "pointer", border: "none" }}
                >
                  {text.navSignOut}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", background: "#065F46", padding: "10px 24px", borderRadius: "24px", textDecoration: "none", boxShadow: "0 4px 12px rgba(6,95,70,0.3)", display: "flex", alignItems: "center", gap: "8px", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {text.navSignIn} →
              </Link>
            )}
          </div>

          <div className="lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-emerald-800">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
              className="lg:hidden w-full border-t border-emerald-900/10 bg-white/95 backdrop-blur-md"
            >
              <div className="px-6 py-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
                <div className="flex flex-col gap-4">
                  {[
                    { label: text.navFeatures, href: "#features" },
                    { label: text.navPortals, href: "#portals" },
                    { label: text.navImpact, href: "#stats" },
                    { label: text.navTestimonials, href: "#testimonials" },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-semibold text-emerald-950 hover:text-emerald-500 transition-colors py-1"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                
                <hr className="border-emerald-800/10" />

                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-800/60">Language / மொழி</span>
                    <div style={{ display: "flex", background: "#F3F4F6", borderRadius: "20px", overflow: "hidden", padding: "2px" }}>
                      <button
                        onClick={() => { setLang("en"); setIsMobileMenuOpen(false); }}
                        style={{ fontSize: "11px", padding: "5px 12px", border: "none", borderRadius: "18px", cursor: "pointer", fontWeight: 700, background: lang === "en" ? "#ffffff" : "transparent", color: lang === "en" ? "#065F46" : "#6B7280", boxShadow: lang === "en" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
                      >EN</button>
                      <button
                        onClick={() => { setLang("ta"); setIsMobileMenuOpen(false); }}
                        style={{ fontSize: "11px", padding: "5px 12px", border: "none", borderRadius: "18px", cursor: "pointer", fontWeight: 700, background: lang === "ta" ? "#ffffff" : "transparent", color: lang === "ta" ? "#065F46" : "#6B7280", boxShadow: lang === "ta" ? "0 2px 4px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}
                      >தமிழ்</button>
                    </div>
                  </div>

                  <div className="pt-2">
                    {session ? (
                      <div className="flex flex-col gap-3">
                        <Link
                          href={getPortalLink()}
                          onClick={() => setIsMobileMenuOpen(false)}
                          style={{ fontSize: "14px", color: "#065F46", background: "#ECFDF5", border: "2px solid #A7F3D0", padding: "10px 20px", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", fontWeight: 700 }}
                        >
                          <i className="fi fi-rr-hand-wave"></i> {(session.user as any)?.name}
                        </Link>
                        <button
                          onClick={() => { signOut({ callbackUrl: "/" }); setIsMobileMenuOpen(false); }}
                          style={{ width: "100%", fontSize: "14px", fontWeight: 700, color: "#DC2626", background: "#FEF2F2", padding: "12px 16px", borderRadius: "24px", cursor: "pointer", border: "none" }}
                        >
                          {text.navSignOut}
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", background: "#065F46", padding: "12px 24px", borderRadius: "24px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                      >
                        {text.navSignIn} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════ SPLIT HERO SECTION ═══════════════ */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "#D1FAE5", filter: "blur(80px)", zIndex: 0, opacity: 0.6 }} />
        <div style={{ position: "absolute", bottom: "-50px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "#FEF3C7", filter: "blur(60px)", zIndex: 0, opacity: 0.5 }} />

        <div className="px-4 md:px-8 max-w-[1320px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-center">

            {/* Left Content */}
            <div style={{ maxWidth: "600px" }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div style={{ display: "inline-block", background: "#ECFDF5", border: "1px solid #10B981", color: "#065F46", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, marginBottom: "24px" }}>
                  <i className="fi fi-rr-star"></i> {text.heroBadge}
                </div>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, color: "#022C22", lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-2px" }}>
                {text.heroTitle1}
                <br />
                <span style={{ color: "#10B981", position: "relative" }}>
                  {text.heroTitle2}
                  <svg style={{ position: "absolute", bottom: "-12px", left: 0, width: "100%", height: "16px" }} viewBox="0 0 200 16" preserveAspectRatio="none">
                    <path d="M0,12 Q100,0 200,12" stroke="#F59E0B" strokeWidth="6" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                style={{ fontSize: "18px", color: "#4B5563", lineHeight: 1.7, marginBottom: "20px" }}>
                {text.heroSub}
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ fontSize: "16px", color: "#065F46", fontWeight: 700, background: "#D1FAE5", display: "inline-block", padding: "8px 16px", borderRadius: "8px", marginBottom: "40px" }}>
                <TypedText key={lang} texts={[text.heroType1, text.heroType2, text.heroType3]} speed={50} pause={3000} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {session ? (
                  <Link href={getPortalLink()} style={{ background: "#065F46", color: "white", padding: "16px 32px", borderRadius: "30px", fontWeight: 800, fontSize: "16px", textDecoration: "none", boxShadow: "0 8px 24px rgba(6,95,70,0.3)" }}>
                    {text.heroBtnGo} →
                  </Link>
                ) : (
                  <Link href="/login" style={{ background: "#065F46", color: "white", padding: "16px 32px", borderRadius: "30px", fontWeight: 800, fontSize: "16px", textDecoration: "none", boxShadow: "0 8px 24px rgba(6,95,70,0.3)" }}>
                    {text.heroBtnSignIn} →
                  </Link>
                )}
                <a href="#portals" style={{ background: "white", color: "#065F46", border: "2px solid #E5E7EB", padding: "16px 32px", borderRadius: "30px", fontWeight: 800, fontSize: "16px", textDecoration: "none" }}>
                  {text.heroBtnExplore} ↓
                </a>
              </motion.div>
            </div>

            {/* Right Content: Dynamic School Collage */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative h-[320px] sm:h-[420px] md:h-[500px] w-full">
              <div style={{ position: "absolute", top: "10%", right: "10%", width: "60%", height: "50%", borderRadius: "24px", overflow: "hidden", border: "8px solid white", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", zIndex: 3, transform: "rotate(4deg)" }}>
                <img src="/bg-school.png" alt="School" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "55%", height: "45%", borderRadius: "24px", overflow: "hidden", border: "8px solid white", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", zIndex: 2, transform: "rotate(-6deg)" }}>
                <img src="/bg-classroom.png" alt="Classroom" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", top: "35%", right: "0%", width: "45%", height: "40%", borderRadius: "50%", overflow: "hidden", border: "8px solid white", boxShadow: "0 10px 30px rgba(16,185,129,0.3)", zIndex: 4 }}>
                <img src="/bg-digital.png" alt="Digital" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Floating elements */}
              <div style={{ position: "absolute", top: "0", left: "20%", background: "#F59E0B", padding: "12px 24px", borderRadius: "20px", color: "white", fontWeight: 800, transform: "rotate(-10deg)", boxShadow: "0 8px 20px rgba(245,158,11,0.3)", zIndex: 5 }}>
                <i className="fi fi-rr-rocket"></i> AI Powered
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ EMERALD STATS RIBBON ═══════════════ */}
      <section id="stats" className="relative z-10 -mt-10 mx-4 bg-[#065F46] py-10 md:py-16 px-6 md:px-12 rounded-[30px] md:rounded-[40px]" style={{ boxShadow: "0 20px 50px rgba(6,95,70,0.2)" }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {text.stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div style={{ fontSize: "40px", marginBottom: "8px", color: "#FCD34D" }}>{s.icon}</div>
                <div style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, color: "#FCD34D", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "14px", color: "#A7F3D0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginTop: "8px" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PORTALS: BENTO BOX ═══════════════ */}
      <section id="portals" className="py-16 md:py-24 bg-[#FAFAFA]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#10B981", display: "inline-block", background: "#ECFDF5", padding: "6px 16px", borderRadius: "20px", marginBottom: "12px" }}>{text.portalTitleSub}</span>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "#022C22", marginBottom: "16px" }}>
              {text.portalTitle1} <span style={{ color: "#F59E0B" }}>{text.portalTitle2}</span>
            </h2>
            <p style={{ color: "#4B5563", maxWidth: "600px", margin: "0 auto", fontSize: "16px", lineHeight: 1.6 }}>{text.portalDesc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-flow-row-dense gap-6 auto-rows-auto lg:auto-rows-[200px]">
            {portals.map((portal, i) => {
              const pColor = portalColors[portal.href] || { bg: "#f3f4f6", border: "#6b7280", text: "#374151" };
              // Make Student & Teacher larger in the grid
              const isLarge = portal.href === "/student" || portal.href === "/teacher";
              return (
                <Link
                  key={portal.href}
                  href={portal.href}
                  className={`flex flex-col justify-center bg-white rounded-[32px] p-5 sm:p-7 relative overflow-hidden shadow-sm transition-all duration-300 ${
                    isLarge ? "col-span-1 sm:col-span-2 row-span-1 sm:row-span-2" : "col-span-1 row-span-1"
                  }`}
                  style={{
                    border: `2px solid ${pColor.border}20`,
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = `0 16px 40px ${pColor.border}30`;
                    e.currentTarget.style.borderColor = pColor.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)";
                    e.currentTarget.style.borderColor = `${pColor.border}20`;
                  }}
                >
                  <div
                    className="rounded-[16px] flex items-center justify-center mb-3 sm:mb-4 w-11 h-11 sm:w-12 sm:h-12"
                    style={{ background: pColor.bg, color: pColor.text }}
                  >
                    <LucideIcon name={portal.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1 sm:mb-2">{portal.label}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                    {portal.desc}
                  </p>
                  <div
                    className="inline-flex items-center text-[10px] sm:text-xs font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mt-auto"
                    style={{ color: pColor.text, background: pColor.bg }}
                  >
                    {text.portalEnter} →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES: ZIG-ZAG ═══════════════ */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "#022C22", marginBottom: "16px" }}>
              {text.featTitle1} <span style={{ color: "#10B981" }}>{text.featTitle2}</span>
            </h2>
            <p style={{ color: "#4B5563", maxWidth: "600px", margin: "0 auto", fontSize: "16px", lineHeight: 1.6 }}>{text.featDesc}</p>
          </div>

          <div className="flex flex-col gap-16 md:gap-24">
            {text.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col md:flex-row ${i % 2 === 0 ? "" : "md:flex-row-reverse"} items-center gap-10 md:gap-[60px]`}
              >
                <div className="w-full md:w-1/2">
                  <div style={{ width: "100%", height: "300px", background: `${f.color}10`, borderRadius: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "100px", position: "relative", color: f.color }}>
                    {f.icon}
                    <div style={{ position: "absolute", bottom: "-20px", right: i % 2 === 0 ? "-20px" : "auto", left: i % 2 !== 0 ? "-20px" : "auto", width: "100px", height: "100px", background: f.color, borderRadius: "50%", opacity: 0.1 }} />
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", background: f.color, color: "white", borderRadius: "16px", fontSize: "20px", marginBottom: "20px" }}>
                    {i + 1}
                  </div>
                  <h3 style={{ fontSize: "32px", fontWeight: 800, color: "#022C22", marginBottom: "16px", lineHeight: 1.2 }}>{f.title}</h3>
                  <p style={{ fontSize: "18px", color: "#4B5563", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS: SPOTLIGHT ═══════════════ */}
      <section id="testimonials" style={{ padding: "100px 0", background: "#ECFDF5", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "400px", color: "#D1FAE5", opacity: 0.5, fontWeight: 900, pointerEvents: "none" }}>"</div>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 1, textAlign: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#065F46", display: "inline-block", marginBottom: "24px" }}>{text.testTitleSub}</span>

          <AnimatePresence mode="wait">
            <motion.div key={activeTestimonial} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.5 }}>
              <p style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#022C22", fontWeight: 700, lineHeight: 1.5, fontStyle: "italic", marginBottom: "40px" }}>
                "{testimonials[activeTestimonial].text}"
              </p>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: testimonials[activeTestimonial].color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#022C22" }}>{testimonials[activeTestimonial].name}</div>
                <div style={{ fontSize: "14px", color: "#065F46", fontWeight: 600 }}>{testimonials[activeTestimonial].role}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "40px" }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{ width: i === activeTestimonial ? "40px" : "12px", height: "12px", borderRadius: "6px", background: i === activeTestimonial ? "#065F46" : "#A7F3D0", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PLAYFUL CTA SECTION ═══════════════ */}
      <section className="py-12 px-4 md:py-20 md:px-8">
        <div className="max-w-[1200px] mx-auto rounded-[30px] md:rounded-[40px] py-12 px-6 md:py-20 md:px-10 text-center relative overflow-hidden bg-gradient-to-br from-[#065F46] to-[#10B981]" style={{ boxShadow: "0 24px 50px rgba(6,95,70,0.3)" }}>
          <div style={{ position: "absolute", top: "-50px", right: "10%", fontSize: "100px", opacity: 0.1, transform: "rotate(15deg)" }}><i className="fi fi-rr-graduation-cap"></i></div>
          <div style={{ position: "absolute", bottom: "-20px", left: "10%", fontSize: "80px", opacity: 0.1, transform: "rotate(-15deg)" }}><i className="fi fi-rr-backpack"></i></div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 className="text-white" style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, marginBottom: "20px", color: "#ffffff" }}>{text.ctaTitle}</h2>

            <p style={{ color: "#D1FAE5", fontSize: "20px", maxWidth: "600px", margin: "0 auto 40px" }}>{text.ctaDesc}</p>

            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" style={{ background: "#F59E0B", color: "#78350F", padding: "16px 40px", borderRadius: "30px", fontWeight: 800, fontSize: "18px", textDecoration: "none", boxShadow: "0 8px 24px rgba(245,158,11,0.4)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <i className="fi fi-rr-rocket"></i> {text.ctaBtnIn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{ background: "#022C22", color: "#A7F3D0", paddingTop: "80px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "60px", marginBottom: "60px" }}>
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", marginBottom: "20px" }}>
              <div style={{ width: "42px", height: "42px", background: "white", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#065F46" }}><i className="fi fi-rr-bank"></i></div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "white" }}>TN Schools</div>
                <div style={{ fontSize: "12px", color: "#34D399", fontWeight: 700, textTransform: "uppercase" }}>Digital Campus</div>
              </div>
            </Link>
            <p style={{ fontSize: "14px", lineHeight: 1.8, color: "#6EE7B7", maxWidth: "260px" }}>An official AI-powered platform for the Tamil Nadu School Education Department.</p>
          </div>

          <div>
            <h4 className="text-white" style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", marginBottom: "24px" }}>{text.ftPortals}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {portals.slice(0, 4).map(p => <Link key={p.href} href={p.href} style={{ color: "#A7F3D0", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>{p.label}</Link>)}
            </div>
          </div>

          <div>
            <h4 className="text-white" style={{ fontSize: "14px", fontWeight: 800, color: "white", textTransform: "uppercase", marginBottom: "24px" }}>{text.ftAdmin}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {portals.slice(4).map(p => <Link key={p.href} href={p.href} style={{ color: "#A7F3D0", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>{p.label}</Link>)}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(167,243,208,0.1)", padding: "30px 2rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <p className="text-white" style={{ fontSize: "13px", margin: 0 }}>{text.ftCopy}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <span className="text-white" ><i className="fi fi-rr-flag"></i></span> <span style={{ fontWeight: 600, color: "white" }}>{text.ftGovt}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
