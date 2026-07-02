"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { portals } from "@/lib/navConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MoreVertical } from "lucide-react";
import { LucideIcon } from "@/components/LucideIcon";

/* ─── Government Color Palette ─── */
// New Palette: Deep Purple (#3D3580), Lavender (#7B7FC4), Golden Yellow (#F5B800), Warm Orange (#F07800), Red-Orange (#E84400)

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
      { label: "Total Students", value: "47.2L", icon: "👨‍🎓", color: "#3D3580" },
      { label: "Government Schools", value: "37,000+", icon: "🏫", color: "#7B7FC4" },
      { label: "Dedicated Teachers", value: "2.1L", icon: "📚", color: "#F07800" },
      { label: "Districts Covered", value: "38", icon: "🗺️", color: "#F5B800" },
    ],

    featTitleSub: "Platform Features",
    featTitle1: "Comprehensive Digital",
    featTitle2: "Education Tools",
    featDesc: "Purpose-built AI and analytics tools for every stakeholder in the Tamil Nadu education ecosystem.",
    features: [
      { title: "AI-Powered Tutoring", desc: "Personalized adaptive learning pathways using advanced AI for every student across Class 6–12.", icon: "🤖", color: "#3D3580" },
      { title: "Real-time Analytics", desc: "Live dashboards tracking attendance, performance, and learning outcomes at every administrative level.", icon: "📊", color: "#7B7FC4" },
      { title: "Adaptive Assessments", desc: "Smart question generation and AI-evaluated tests with instant feedback and personalized guidance.", icon: "🎯", color: "#F07800" },
      { title: "Multi-Role Governance", desc: "8 dedicated portals from Student to Minister, each with role-specific insights and controls.", icon: "🛡️", color: "#3D3580" },
      { title: "Live State Monitoring", desc: "Real-time command center for state-wide education health, KPI tracking and policy compliance.", icon: "📡", color: "#7B7FC4" },
      { title: "Career & Scholarship", desc: "AI-driven career guidance, college admissions support, scholarship tracking and welfare schemes.", icon: "🎓", color: "#E84400" },
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
      { label: "மொத்த மாணவர்கள்", value: "47.2L", icon: "👨‍🎓", color: "#3D3580" },
      { label: "அரசு பள்ளிகள்", value: "37,000+", icon: "🏫", color: "#7B7FC4" },
      { label: "அர்ப்பணிப்புள்ள ஆசிரியர்கள்", value: "2.1L", icon: "📚", color: "#F07800" },
      { label: "மாவட்டங்கள்", value: "38", icon: "🗺️", color: "#F5B800" },
    ],

    featTitleSub: "தளத்தின் அம்சங்கள்",
    featTitle1: "விரிவான டிஜிட்டல்",
    featTitle2: "கல்வி கருவிகள்",
    featDesc: "தமிழ்நாடு கல்வி சூழல்மண்டலத்தில் உள்ள ஒவ்வொரு பங்குதாரருக்கும் AI மற்றும் பகுப்பாய்வு கருவிகள்.",
    features: [
      { title: "AI-ஆதரவு பயிற்சி", desc: "வகுப்பு 6 முதல் 12 வரையிலான அனைத்து மாணவர்களுக்கும் AI மூலம் தனிப்பயனாக்கப்பட்ட கற்றல் வழிகள்.", icon: "🤖", color: "#3D3580" },
      { title: "நிகழ்நேர பகுப்பாய்வு", desc: "ஒவ்வொரு நிலையிலும் வருகை, செயல்திறன் மற்றும் கற்றல் முடிவுகளைக் கண்காணிக்கும் நேரடி டாஷ்போர்டுகள்.", icon: "📊", color: "#7B7FC4" },
      { title: "தழுவல் மதிப்பீடுகள்", desc: "உடனடி கருத்துக்களுடன் AI மதிப்பீடு செய்யும் தேர்வுகள் மற்றும் தனிப்பயன் வழிகாட்டுதல்.", icon: "🎯", color: "#F07800" },
      { title: "பல-பங்கு நிர்வாகம்", desc: "மாணவர் முதல் அமைச்சர் வரை 8 பிரத்யேக இணையதளங்கள்.", icon: "🛡️", color: "#3D3580" },
      { title: "நேரடி மாநில கண்காணிப்பு", desc: "மாநில அளவிலான KPI கண்காணிப்பு மற்றும் கொள்கை இணக்கத்திற்கான நிகழ்நேர மையம்.", icon: "📡", color: "#7B7FC4" },
      { title: "தொழில் & உதவித்தொகை", desc: "AI வழிகாட்டுதல், கல்லூரி சேர்க்கை ஆதரவு மற்றும் உதவித்தொகை கண்காணிப்பு.", icon: "🎓", color: "#E84400" },
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
  { name: "Mrs. Sumathi Devi", role: "Mathematics Teacher, GHS Coimbatore", text: "The AI Lesson Planner has transformed how I prepare classes. My students' engagement has increased by 40% this semester.", avatar: "S", color: "#3D3580" },
  { name: "Arjun Kumar", role: "Class 10 Student, GHSS Madurai", text: "The adaptive quizzes and AI tutor helped me understand concepts I struggled with. I scored 95% in my board exams!", avatar: "A", color: "#7B7FC4" },
  { name: "Mr. Rajesh", role: "Parent, Chennai District", text: "I can track my daughter's progress in real-time. The notifications keep me connected with her school activities.", avatar: "R", color: "#F07800" },
  { name: "Mr. Venkatesh R.", role: "Headmaster, GHS Coimbatore", text: "Managing 1200+ students has never been this efficient. The dashboard gives me a complete 360° view of the school.", avatar: "V", color: "#E84400" },
];

const portalColors: Record<string, { bg: string; border: string; text: string }> = {
  "/student": { bg: "#EEEDF8", border: "#3D3580", text: "#3D3580" },
  "/parent": { bg: "#F0F0FA", border: "#7B7FC4", text: "#4a4e9e" },
  "/teacher": { bg: "#FFF5E8", border: "#F07800", text: "#a05200" },
  "/headmaster": { bg: "#FDF8E8", border: "#F5B800", text: "#8a6800" },
  "/block-education-officer": { bg: "#FFF0E5", border: "#F07800", text: "#8a4500" },
  "/district-education-officer": { bg: "#FDEEE8", border: "#E84400", text: "#c03300" },
  "/commissioner": { bg: "#F0EFF9", border: "#3D3580", text: "#3D3580" },
  "/minister": { bg: "#FBF0E8", border: "#E84400", text: "#c03300" },
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
    <span>
      {displayText}
      <span className="typing-cursor" style={{ background: "#3D3580" }} />
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
    const handleScroll = () => setIsNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ background: "#f5f5fb", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#1a1a2e" }}>

      {/* ═══════ GOVERNMENT TOP STRIP ═══════ */}
      <div className="hidden sm:block" style={{ background: "#3D3580", color: "#ffffff", padding: "6px 0", fontSize: "11px" }}>
        <div className="px-4 md:px-8" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "white" }}>🇮🇳</span>
            <span style={{ fontWeight: 600, color: "white" }}>{text.govtName}</span>
            <span style={{ opacity: 0.6, color: "white" }}>|</span>
            <span style={{ opacity: 0.85, color: "white" }}>{text.deptName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", opacity: 0.85 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "white" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block", color: "white" }}></span>
              {text.ftStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ ANNOUNCEMENT TICKER ═══════ */}
      <div style={{ background: "#F07800", color: "#fff", padding: "8px 0", fontSize: "12px", overflow: "hidden" }}>
        <div className="px-4 md:px-8" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <span style={{ fontWeight: 500, color: "white" }}>{text.announcementText}</span>
        </div>
      </div>

      {/* ═══════ MAIN NAVBAR ═══════ */}
      <nav
        id="main-nav"
        className="landing-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: isNavScrolled ? "rgba(255,255,255,0.98)" : "#ffffff",
          borderBottom: "2px solid #3D3580",
          padding: "0",
          boxShadow: isNavScrolled ? "0 2px 16px rgba(61,53,128,0.12)" : "none",
          transition: "all 0.3s"
        }}
      >
        <div className="px-4 md:px-8" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }} id="nav-logo">
            <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #3D3580 0%, #7B7FC4 100%)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 2px 8px rgba(61,53,128,0.3)" }}>
              🏛️
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#3D3580", lineHeight: "1.2", letterSpacing: "-0.3px" }}>TN Schools</div>
              <div className="hidden sm:block" style={{ fontSize: "10px", color: "#F07800", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>AI Smart Ecosystem</div>
            </div>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden lg:flex items-center" style={{ gap: "32px" }}>
            {[
              { label: text.navFeatures, href: "#features" },
              { label: text.navPortals, href: "#portals" },
              { label: text.navImpact, href: "#stats" },
              { label: text.navTestimonials, href: "#testimonials" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{ fontSize: "13px", color: "#374151", fontWeight: 600, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#3D3580")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: Lang Toggle + Auth (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Toggle */}
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <button
                onClick={() => setLang("en")}
                style={{ fontSize: "12px", padding: "6px 14px", border: "none", cursor: "pointer", fontWeight: 700, background: lang === "en" ? "#3D3580" : "transparent", color: lang === "en" ? "#fff" : "#64748b", transition: "all 0.2s" }}
              >EN</button>
              <button
                onClick={() => setLang("ta")}
                style={{ fontSize: "12px", padding: "6px 14px", border: "none", cursor: "pointer", fontWeight: 700, background: lang === "ta" ? "#3D3580" : "transparent", color: lang === "ta" ? "#fff" : "#64748b", transition: "all 0.2s" }}
              >தமிழ்</button>
            </div>

            {session ? (
              <>
                <Link
                  href={getPortalLink()}
                  style={{
                    fontSize: "12px",
                    color: "#3D3580",
                    background: "#EEEDF8",
                    border: "1.5px solid #3D3580",
                    padding: "7px 16px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(61,53,128,0.1)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#3D3580";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#EEEDF8";
                    e.currentTarget.style.color = "#3D3580";
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                  <span className="hidden sm:inline">👤 {(session.user as any)?.name}</span>
                  <span className="inline sm:hidden">👤 Portal</span>
                </Link>
                <button
                  id="nav-signout"
                  className="hidden sm:block"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#dc2626",
                    background: "#fff5f5",
                    border: "1.5px solid #fca5a5",
                    padding: "7px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#dc2626";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff5f5";
                    e.currentTarget.style.color = "#dc2626";
                    e.currentTarget.style.borderColor = "#fca5a5";
                  }}
                >
                  🚪 {text.navSignOut}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                id="nav-signin"
                style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", background: "linear-gradient(135deg, #3D3580, #7B7FC4)", padding: "8px 20px", borderRadius: "8px", textDecoration: "none", boxShadow: "0 2px 8px rgba(61,53,128,0.3)", display: "flex", alignItems: "center", gap: "6px" }}
              >
                🔒 {text.navSignIn}
              </Link>
            )}
          </div>

          {/* Right: Hamburger Menu button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#3D3580] hover:bg-[#EEEDF8] transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-6 flex flex-col">
                {/* Navigation Links */}
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
                      className="text-sm font-bold text-slate-700 hover:text-[#3D3580] transition-colors py-2 border-b border-slate-100"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                {/* Language Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-600">Language / மொழி</span>
                  <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                    <button
                      onClick={() => { setLang("en"); setIsMobileMenuOpen(false); }}
                      style={{ fontSize: "12px", padding: "6px 14px", border: "none", cursor: "pointer", fontWeight: 700, background: lang === "en" ? "#3D3580" : "transparent", color: lang === "en" ? "#fff" : "#64748b", transition: "all 0.2s" }}
                    >EN</button>
                    <button
                      onClick={() => { setLang("ta"); setIsMobileMenuOpen(false); }}
                      style={{ fontSize: "12px", padding: "6px 14px", border: "none", cursor: "pointer", fontWeight: 700, background: lang === "ta" ? "#3D3580" : "transparent", color: lang === "ta" ? "#fff" : "#64748b", transition: "all 0.2s" }}
                    >தமிழ்</button>
                  </div>
                </div>

                {/* Auth Button */}
                <div className="pt-2">
                  {session ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        href={getPortalLink()}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          fontSize: "13px",
                          color: "#3D3580",
                          background: "#EEEDF8",
                          border: "1.5px solid #3D3580",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          textDecoration: "none",
                          fontWeight: 700,
                          width: "100%"
                        }}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
                        <span>👤 {(session.user as any)?.name}</span>
                      </Link>
                      <button
                        onClick={() => { signOut({ callbackUrl: "/" }); setIsMobileMenuOpen(false); }}
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#dc2626",
                          background: "#fff5f5",
                          border: "1.5px solid #fca5a5",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        🚪 {text.navSignOut}
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", background: "linear-gradient(135deg, #3D3580, #7B7FC4)", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%" }}
                    >
                      🔒 {text.navSignIn}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════ HERO SECTION — LIGHT THEME ═══════════════ */}
      <section
        id="hero"
        style={{
          background: "linear-gradient(160deg, #ffffff 0%, #f0effe 50%, #e8e7f8 100%)",
          padding: "72px 0 80px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid #e2e8f0"
        }}
      >
        {/* Subtle grid pattern */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(rgba(61,53,128,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(61,53,128,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(61,53,128,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(240,120,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem", textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffffff", border: "1.5px solid #3D3580", borderRadius: "100px", padding: "7px 18px", marginBottom: "28px", boxShadow: "0 2px 12px rgba(61,53,128,0.12)" }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }}></span>
            <span style={{ fontSize: "12px", color: "#3D3580", fontWeight: 700, letterSpacing: "0.2px" }}>{text.heroBadge}</span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{ fontSize: "clamp(34px, 5.5vw, 68px)", fontWeight: 900, color: "#3D3580", lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-1.5px" }}
          >
            {text.heroTitle1}
            <br />
            <span style={{ color: "#F07800", display: "inline-block", position: "relative" }}>
              {text.heroTitle2}
              <span style={{ position: "absolute", bottom: "-4px", left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #F07800, #F5B800)", borderRadius: "2px", opacity: 0.5 }}></span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ fontSize: "clamp(14px, 1.8vw, 17px)", color: "#475569", maxWidth: "680px", margin: "0 auto 14px", lineHeight: 1.75 }}
          >
            {text.heroSub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: "13px", color: "#64748b", marginBottom: "36px", height: "28px" }}
          >
            <TypedText key={lang} texts={[text.heroType1, text.heroType2, text.heroType3]} speed={45} pause={2500} />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}
          >
            {session ? (
              <Link
                href={
                  (() => {
                    const role = (session.user as any)?.role?.toUpperCase() || "STUDENT";
                    if (role === "SUPERADMIN") return "/super-admin";
                    if (role === "BEO") return "/block-education-officer";
                    if (role === "DEO") return "/district-education-officer";
                    return `/${role.toLowerCase()}`;
                  })()
                }
                id="hero-goto-portal"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #F07800, #E84400)", color: "#ffffff", padding: "13px 30px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 18px rgba(240,120,0,0.35)", transition: "all 0.2s" }}
              >
                🚀 {text.heroBtnGo}
              </Link>
            ) : (
              <Link href="/login" id="hero-signin"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #F07800, #E84400)", color: "#ffffff", padding: "13px 30px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 18px rgba(240,120,0,0.35)", transition: "all 0.2s" }}
              >
                🚀 {text.heroBtnSignIn}
              </Link>
            )}
            <a href="#portals" id="hero-explore"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffffff", color: "#3D3580", padding: "13px 30px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "14px", border: "2px solid #3D3580", transition: "all 0.2s" }}
            >
              {text.heroBtnExplore} ↓
            </a>
          </motion.div>

          {/* Hero Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ display: "flex", justifyContent: "center", gap: "clamp(0px, 2vw, 12px)", marginTop: "56px", flexWrap: "wrap" }}
          >
            {[
              { label: "Students", value: "47.2L+", color: "#3D3580", icon: "👨‍🎓" },
              { label: "Schools", value: "37,000+", color: "#7B7FC4", icon: "🏫" },
              { label: "Teachers", value: "2.1L+", color: "#F07800", icon: "📚" },
              { label: "Districts", value: "38", color: "#F5B800", icon: "🗺️" },
            ].map((s, i) => (
              <div key={s.label} style={{ textAlign: "center", background: "#ffffff", border: `1.5px solid ${s.color}25`, borderTop: `3px solid ${s.color}`, borderRadius: "12px", padding: "18px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", minWidth: "140px" }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{s.icon}</div>
                <div style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ DIVIDER STRIP ═══════ */}
      <div style={{ height: "5px", background: "linear-gradient(90deg, #3D3580, #7B7FC4, #F5B800, #F07800, #E84400)" }} />

      {/* ═══════════════ STATS SECTION ═══════════════ */}
      <section id="stats" style={{ background: "#ffffff", padding: "80px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#F07800", display: "block", marginBottom: "8px" }}>{text.statTitleSub}</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#3D3580", marginBottom: "12px", lineHeight: 1.2 }}>
              {text.statTitle1} <span style={{ color: "#F07800" }}>{text.statTitle2}</span>
            </h2>
            <p style={{ color: "#6b7280", maxWidth: "520px", margin: "0 auto", fontSize: "15px", lineHeight: 1.6 }}>{text.statDesc}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
            {text.stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: "#fff",
                  border: `2px solid ${s.color}20`,
                  borderTop: `4px solid ${s.color}`,
                  borderRadius: "12px",
                  padding: "28px 24px",
                  textAlign: "center",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>{s.icon}</div>
                <div style={{ fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 900, color: s.color, marginBottom: "6px" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION DIVIDER ═══════ */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #e2e8f0, transparent)", maxWidth: "800px", margin: "0 auto" }} />

      {/* ═══════════════ FEATURES SECTION ═══════════════ */}
      <section id="features" style={{ background: "#f5f5fb", padding: "80px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#7B7FC4", display: "block", marginBottom: "8px" }}>{text.featTitleSub}</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#3D3580", marginBottom: "12px", lineHeight: 1.2 }}>
              {text.featTitle1} <span style={{ color: "#7B7FC4" }}>{text.featTitle2}</span>
            </h2>
            <p style={{ color: "#6b7280", maxWidth: "520px", margin: "0 auto", fontSize: "15px", lineHeight: 1.6 }}>{text.featDesc}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {text.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "28px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid #e5e7eb",
                  borderLeft: `4px solid ${f.color}`,
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
              >
                <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: `${f.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "16px" }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION DIVIDER ═══════ */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #e2e8f0, transparent)", maxWidth: "800px", margin: "0 auto" }} />

      {/* ═══════════════ PORTALS SECTION ═══════════════ */}
      <section id="portals" style={{ background: "#ffffff", padding: "80px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#3D3580", display: "block", marginBottom: "8px" }}>{text.portalTitleSub}</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#3D3580", marginBottom: "12px", lineHeight: 1.2 }}>
              {text.portalTitle1} <span style={{ color: "#F07800" }}>{text.portalTitle2}</span>
            </h2>
            <p style={{ color: "#6b7280", maxWidth: "520px", margin: "0 auto", fontSize: "15px", lineHeight: 1.6 }}>{text.portalDesc}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {portals.map((portal, i) => {
              const pColor = portalColors[portal.href] || { bg: "#f3f4f6", border: "#6b7280", text: "#374151" };
              return (
                <motion.div
                  key={portal.href}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -5, boxShadow: `0 12px 40px ${pColor.border}30` }}
                >
                  <Link
                    href={portal.href}
                    id={`portal-link-${portal.href.replace(/\//g, "").replace(/-/g, "_")}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      background: "#ffffff",
                      borderRadius: "12px",
                      padding: "24px",
                      border: `1px solid ${pColor.border}40`,
                      borderTop: `4px solid ${pColor.border}`,
                      textDecoration: "none",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      transition: "all 0.25s",
                      height: "100%"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: pColor.bg, display: "flex", alignItems: "center", justifyContent: "center", color: pColor.text, flexShrink: 0 }}>
                        <LucideIcon name={portal.icon} className="w-8 h-8" />
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "2px" }}>{portal.label}</div>
                        <div style={{ fontSize: "11px", color: pColor.text, fontWeight: 600, background: pColor.bg, padding: "2px 8px", borderRadius: "100px", display: "inline-block" }}>
                          {portal.href === "/student" ? "Class 6–12" :
                            portal.href === "/teacher" ? "All Teachers" :
                              portal.href === "/parent" ? "All Parents" :
                                portal.href === "/headmaster" ? "School Head" :
                                  portal.href === "/block-education-officer" ? "BEO" :
                                    portal.href === "/district-education-officer" ? "DEO" :
                                      portal.href === "/commissioner" ? "Commissioner" : "Minister"}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{portal.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "auto", paddingTop: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: pColor.text }}>{text.portalEnter}</span>
                      <span style={{ color: pColor.border, fontWeight: 700 }}>→</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ BLUE DIVIDER ═══════ */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, #3D3580, #7B7FC4, #F5B800, #F07800, #E84400)" }} />

      {/* ═══════════════ TESTIMONIALS SECTION ═══════════════ */}
      <section id="testimonials" style={{ background: "#f5f5fb", padding: "80px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#F07800", display: "block", marginBottom: "8px" }}>{text.testTitleSub}</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#3D3580", marginBottom: "12px" }}>
              {text.testTitle1} <span style={{ color: "#F07800" }}>{text.testTitle2}</span>
            </h2>
            <p style={{ color: "#6b7280", maxWidth: "520px", margin: "0 auto", fontSize: "15px", lineHeight: 1.6 }}>{text.testDesc}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "28px",
                  border: "1px solid #e5e7eb",
                  borderLeft: `4px solid ${t.color}`,
                  boxShadow: i === activeTestimonial ? `0 8px 32px ${t.color}25` : "0 2px 12px rgba(0,0,0,0.06)",
                  transition: "all 0.3s",
                  transform: i === activeTestimonial ? "translateY(-4px)" : "none"
                }}
                onMouseEnter={() => setActiveTestimonial(i)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{t.name}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>{t.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>"{t.text}"</p>
                <div style={{ display: "flex", gap: "2px", marginTop: "12px" }}>
                  {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: "#FFB800", fontSize: "14px" }}>★</span>)}
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                style={{ width: i === activeTestimonial ? "28px" : "8px", height: "8px", borderRadius: "100px", background: i === activeTestimonial ? "#3D3580" : "#d1d5db", border: "none", cursor: "pointer", transition: "all 0.3s" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ DIVIDER ═══════ */}
      <div style={{ height: "1px", background: "#e2e8f0" }} />

      {/* ═══════════════ CTA SECTION — LIGHT THEME ═══════════════ */}
      <section
        style={{
          background: "linear-gradient(160deg, #eeedf8 0%, #ffffff 50%, #fff5e8 100%)",
          padding: "80px 0",
          position: "relative",
          overflow: "hidden",
          borderTop: "1px solid #e2e8f0"
        }}
      >
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(61,53,128,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, rgba(240,120,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 2rem", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#ffffff", border: "1.5px solid #10b981", padding: "7px 18px", borderRadius: "100px", marginBottom: "24px", boxShadow: "0 2px 10px rgba(16,185,129,0.15)" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" }}></span>
              <span style={{ fontSize: "11px", color: "#065f46", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{text.ctaBadge}</span>
            </div>

            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900, color: "#3D3580", marginBottom: "16px", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
              {text.ctaTitle}
            </h2>
            <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7, marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>
              {text.ctaDesc}
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" id="cta-signin"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #F07800, #E84400)", color: "#ffffff", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "15px", boxShadow: "0 4px 18px rgba(240,120,0,0.35)", transition: "all 0.2s" }}
              >
                🚀 {text.ctaBtnIn}
              </Link>
              <a href="#portals" id="cta-explore"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffffff", color: "#3D3580", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "15px", border: "2px solid #3D3580", transition: "all 0.2s" }}
              >
                {text.ctaBtnBrowse}
              </a>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "48px", flexWrap: "wrap" }}>
              {[
                { icon: "🔒", label: "Govt. Secured Platform" },
                { icon: "🇮🇳", label: "Made in India" },
                { icon: "✅", label: "ISO Certified" },
                { icon: "🏆", label: "Award Winning" },
              ].map((b) => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "18px" }}>{b.icon}</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer id="footer" style={{ background: "#111827", color: "#9ca3af" }}>
        {/* Footer Top */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "56px 2rem 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
            {/* Brand */}
            <div style={{ gridColumn: "span 1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #3D3580, #7B7FC4)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🏛️</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>TN Schools</div>
                  <div style={{ fontSize: "10px", color: "#F07800", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>AI Smart Ecosystem</div>
                </div>
              </div>
              <p style={{ fontSize: "12px", lineHeight: 1.7, color: "#6b7280", maxWidth: "240px" }}>
                An official AI-powered platform for the Tamil Nadu School Education Department.
              </p>
              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }}></span>
                <span style={{ color: "#4ade80", fontWeight: 600 }}>{text.ftStatus}</span>
              </div>
            </div>

            {/* Portals */}
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>{text.ftPortals}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {portals.slice(0, 4).map((p) => (
                  <Link key={p.href} href={p.href} style={{ fontSize: "12px", color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F07800")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                  >{p.label}</Link>
                ))}
              </div>
            </div>

            {/* Administration */}
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>{text.ftAdmin}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {portals.slice(4).map((p) => (
                  <Link key={p.href} href={p.href} style={{ fontSize: "12px", color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F07800")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                  >{p.label}</Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>{text.ftRes}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[text.ftHelp, text.ftDoc, text.ftPrivacy, text.ftTerms].map((link) => (
                  <a key={link} href="#" style={{ fontSize: "12px", color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F07800")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                  >{link}</a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{ borderTop: "1px solid #1f2937", padding: "20px 2rem" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "11px", color: "#4b5563", margin: 0 }}>{text.ftCopy}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#4b5563" }}>
              <span>🇮🇳</span>
              <span>{text.ftGovt}</span>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}
