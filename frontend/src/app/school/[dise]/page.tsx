"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SchoolLoginModal from "@/components/SchoolLoginModal";
import ThemeToggle from "@/components/ThemeToggle";
import {
  GraduationCap, Users, BookOpen, MapPin, Phone, Mail, CalendarDays,
  ChevronRight, X, Quote, ArrowRight, Menu, ShieldCheck, Award, Sparkles,
} from "lucide-react";

interface GalleryImage { id: string; imageUrl: string; caption: string | null; order: number; }
interface PortalData {
  tagline: string | null; about: string | null; bannerUrl: string | null;
  primaryColor: string | null; showStudentLogin: boolean; showParentLogin: boolean;
  isPublished: boolean; gallery: GalleryImage[];
}
interface SchoolEvent { id: string; title: string; date: string; description: string | null; type: string; location: string | null; }
interface TeacherItem { id: string; name: string; subject: string; performance: string; }
interface ClassItem { id: string; className: string; section: string; subject: string; totalStudents: number; }
interface PortalResponse {
  school: {
    id: string; dise: string; name: string; address: string | null;
    district: string; block: string; mediumOfInstruction: string;
    schoolType: string; headmasterName: string | null;
  };
  portal: PortalData | null;
  stats: { studentCount: number; teacherCount: number; classCount: number };
  events: SchoolEvent[]; teachers: TeacherItem[]; classes: ClassItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function resolveAsset(url: string | null | undefined): string {
  if (!url) return "/portal/banner-default.jpg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}
function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}
function dayOf(d: string) { try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit" }); } catch { return "--"; } }
function monOf(d: string) { try { return new Date(d).toLocaleDateString("en-IN", { month: "short" }).toUpperCase(); } catch { return ""; } }

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "academics", label: "Academics" },
  { id: "faculty", label: "Faculty" },
  { id: "gallery", label: "Gallery" },
  { id: "events", label: "Events" },
];

export default function SchoolPortalPage() {
  const params = useParams();
  const dise = String(params?.dise || "");

  const [data, setData] = useState<PortalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loginModal, setLoginModal] = useState<"student" | "parent" | null>(null);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  useEffect(() => {
    if (!dise) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/school-portal/public/${dise}`);
        const json = await res.json();
        if (json.success) setData(json.data);
        else setNotFound(true);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [dise]);

  const accent = data?.portal?.primaryColor || "#059669";
  const cssVars = useMemo(() => ({ ["--accent" as any]: accent }), [accent]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500">Loading school portal…</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-center p-6">
        <span className="text-5xl mb-4">🏫</span>
        <h1 className="text-xl font-black text-slate-800 dark:text-white mb-2">School Portal Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md">
          We couldn&apos;t find a published school portal for DISE code{" "}
          <span className="font-mono font-bold">{dise}</span>.
        </p>
        <Link href="/" className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const { school, portal, stats, events, teachers, classes } = data;
  const gallery = (portal?.gallery || []).slice(0, 4);
  const showStudent = portal?.showStudentLogin !== false;
  const showParent = portal?.showParentLogin !== false;
  const location = school.address || `${school.block}, ${school.district}`;

  return (
    <div style={cssVars} className="min-h-screen bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 antialiased">

      {/* ─── Top contact bar ─── */}
      <div className="hidden md:block text-white text-[11px]" style={{ background: accent }}>
        <div className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {location}</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> DISE {school.dise}</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> {school.schoolType} School</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {school.mediumOfInstruction} Medium</span>
          </div>
        </div>
      </div>

      {/* ─── Navbar ─── */}
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm" : "bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900"}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shrink-0 shadow-md" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
              🏛️
            </div>
            <div className="leading-tight min-w-0">
              <span className="block text-sm font-black text-slate-900 dark:text-white truncate max-w-[190px] sm:max-w-xs">{school.name}</span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Government of Tamil Nadu</span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="px-3 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg hover:text-[var(--accent)] hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {showStudent && (
              <button onClick={() => setLoginModal("student")} className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm hover:brightness-110 transition-all text-white" style={{ background: accent }}>
                Student Login
              </button>
            )}
            {showParent && (
              <button onClick={() => setLoginModal("parent")} className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold rounded-lg transition-colors bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                Parent Login
              </button>
            )}
            <button onClick={() => setMobileNav((v) => !v)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300" aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* mobile nav */}
        {mobileNav && (
          <div className="lg:hidden border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 py-2">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={() => setMobileNav(false)} className="block px-2 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-50 dark:border-slate-900 last:border-0">
                {n.label}
              </a>
            ))}
            <div className="flex gap-2 py-3">
              {showStudent && <button onClick={() => { setLoginModal("student"); setMobileNav(false); }} className="flex-1 py-2 text-xs font-bold rounded-lg text-white" style={{ background: accent }}>Student Login</button>}
              {showParent && <button onClick={() => { setLoginModal("parent"); setMobileNav(false); }} className="flex-1 py-2 text-xs font-bold rounded-lg bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Parent Login</button>}
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section id="home" className="relative min-h-[560px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url('${resolveAsset(portal?.bannerUrl)}')` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(105deg, ${accent}f5 0%, ${accent}cc 42%, ${accent}66 72%, transparent 100%)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-[11px] font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to our school
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] drop-shadow-xl">
              {school.name}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/95 font-medium max-w-xl drop-shadow-md">
              {portal?.tagline || "Excellence in Education, Rooted in Values"}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {[`${school.schoolType} School`, `${school.mediumOfInstruction} Medium`, `${school.district} District`].map((chip) => (
                <span key={chip} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold">{chip}</span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {showStudent && (
                <button onClick={() => setLoginModal("student")} className="group px-6 py-3.5 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-50">
                  <GraduationCap className="w-4 h-4" /> Student Login
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
              {showParent && (
                <button onClick={() => setLoginModal("parent")} className="px-6 py-3.5 bg-white/10 border border-white/40 text-white font-bold rounded-xl shadow-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-2 backdrop-blur-sm">
                  <Users className="w-4 h-4" /> Parent Login
                </button>
              )}
              <a href="#about" className="px-5 py-3.5 text-white/90 font-semibold text-sm hover:text-white flex items-center gap-1 transition-colors">
                Explore <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar (overlapping hero) ─── */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 -mt-14">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {[
            { label: "Students Enrolled", value: stats.studentCount, Icon: GraduationCap },
            { label: "Expert Teachers", value: stats.teacherCount, Icon: Users },
            { label: "Active Classes", value: stats.classCount, Icon: BookOpen },
          ].map((s) => (
            <div key={s.label} className="p-5 md:p-7 flex items-center gap-4 justify-center">
              <div className="w-11 h-11 rounded-xl hidden sm:flex items-center justify-center shrink-0" style={{ background: `${accent}14`, color: accent }}>
                <s.Icon className="w-5 h-5" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{s.value}<span style={{ color: accent }}>+</span></div>
                <div className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── About + Principal ─── */}
      <section id="about" className="max-w-6xl mx-auto px-4 pt-20 pb-8 scroll-mt-20">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-3">
            <SectionKicker accent={accent}>Who we are</SectionKicker>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight">About Our School</h2>
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              {portal?.about || "Welcome to our school. We are committed to nurturing every student to reach their full potential."}
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[
                { Icon: Award, t: "Quality Learning", d: "Modern, student-centred teaching." },
                { Icon: ShieldCheck, t: "Safe Campus", d: "A caring, secure environment." },
                { Icon: Sparkles, t: "Holistic Growth", d: "Academics, sports & culture." },
              ].map((f) => (
                <div key={f.t} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                  <f.Icon className="w-5 h-5 mb-2" style={{ color: accent }} />
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{f.t}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{f.d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="relative rounded-3xl p-7 text-white shadow-xl overflow-hidden" style={{ background: `linear-gradient(140deg, ${accent}, ${accent}bb)` }}>
              <Quote className="w-10 h-10 opacity-25 mb-3" />
              <p className="text-white text-[15px] font-medium leading-relaxed italic">
                &ldquo;Our mission is to inspire curiosity, build character, and prepare every child for a bright future.&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-white/20">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-black">
                  {(school.headmasterName && school.headmasterName !== "N/A" ? school.headmasterName : "H").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-black">{school.headmasterName && school.headmasterName !== "N/A" ? school.headmasterName : "The Headmaster"}</div>
                  <div className="text-[11px] text-white/80 font-semibold">Headmaster · Principal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Academics / Classes ─── */}
      <section id="academics" className="max-w-6xl mx-auto px-4 py-14 scroll-mt-20">
        <div className="text-center mb-10">
          <SectionKicker accent={accent} center>Learning paths</SectionKicker>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Classes &amp; Groups</h2>
        </div>
        {classes.length === 0 ? (
          <EmptyState text="Class groups will be published here once they are set up." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {classes.map((c) => (
              <div key={c.id} className="group p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[var(--accent)] hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${accent}14`, color: accent }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-base font-black truncate text-slate-900 dark:text-white">
                  Class {c.className}{c.section ? ` - ${c.section}` : ""}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{c.subject}</div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold flex items-center gap-1.5" style={{ color: accent }}>
                  <GraduationCap className="w-3.5 h-3.5" /> {c.totalStudents} students
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Faculty ─── */}
      <section id="faculty" className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <SectionKicker accent={accent} center>Meet our educators</SectionKicker>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Our Faculty</h2>
          </div>
          {teachers.length === 0 ? (
            <EmptyState text="Our teacher directory will appear here soon." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {teachers.map((t) => (
                <div key={t.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-3 shadow-md" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}>
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-sm font-black truncate text-slate-900 dark:text-white">{t.name}</h3>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${accent}14`, color: accent }}>{t.subject}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Gallery ─── */}
      <section id="gallery" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-10">
          <SectionKicker accent={accent} center>Campus moments</SectionKicker>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Photo Gallery</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setLightbox(g)}
              className={`relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group ${i === 0 ? "col-span-2 row-span-2 aspect-[16/10] md:aspect-auto" : "aspect-[4/3]"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveAsset(g.imageUrl)} alt={g.caption || "School gallery"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 inset-x-0 p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-white drop-shadow">{g.caption || "Campus"}</span>
                <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Events ─── */}
      <section id="events" className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <SectionKicker accent={accent} center>What&apos;s happening</SectionKicker>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">School Events</h2>
          </div>
          {events.length === 0 ? (
            <EmptyState text="No events have been announced yet. Check back soon!" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((ev) => (
                <div key={ev.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all flex gap-4">
                  <div className="shrink-0 w-14 rounded-xl text-white text-center py-2 shadow" style={{ background: `linear-gradient(160deg, ${accent}, ${accent}cc)` }}>
                    <div className="text-lg font-black leading-none">{dayOf(ev.date)}</div>
                    <div className="text-[9px] font-bold tracking-wider mt-1">{monOf(ev.date)}</div>
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5" style={{ background: `${accent}14`, color: accent }}>{ev.type}</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{ev.title}</h3>
                    {ev.location && <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.location}</p>}
                    {ev.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA band ─── */}
      {(showStudent || showParent) && (
        <section className="relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${accent}, ${accent}cc)` }}>
          <div className="max-w-5xl mx-auto px-4 py-14 text-center text-white relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-white">Ready to get started?</h2>
            <p className="mt-2 text-white/85 text-sm max-w-xl mx-auto">Access attendance, marks, homework and school updates through your secure portal.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {showStudent && <button onClick={() => setLoginModal("student")} className="px-7 py-3.5 font-bold rounded-xl shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-50"><GraduationCap className="w-4 h-4" /> Student Login</button>}
              {showParent && <button onClick={() => setLoginModal("parent")} className="px-7 py-3.5 bg-white/15 border border-white/40 text-white font-bold rounded-xl hover:bg-white/25 transition-colors text-sm flex items-center gap-2 backdrop-blur-sm"><Users className="w-4 h-4" /> Parent Login</button>}
            </div>
          </div>
        </section>
      )}

      {/* ─── Footer ─── */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
        <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>🏛️</div>
              <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">{school.name}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{portal?.tagline || "Excellence in Education, Rooted in Values"}</p>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {NAV.map((n) => (
                <li key={n.id}><a href={`#${n.id}`} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"><ChevronRight className="w-3 h-3" /> {n.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} /> {location}</li>
              <li className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} /> {school.mediumOfInstruction} Medium</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} /> DISE: {school.dise}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Portal Access</h4>
            <div className="space-y-2.5">
              {showStudent && <button onClick={() => setLoginModal("student")} className="w-full py-2.5 rounded-xl text-white text-xs font-bold" style={{ background: accent }}>🎓 Student Login</button>}
              {showParent && <button onClick={() => setLoginModal("parent")} className="w-full py-2.5 rounded-xl text-xs font-bold transition-colors bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">👪 Parent Login</button>}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} {school.name}. All rights reserved.</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Government of Tamil Nadu · Department of Education</span>
          </div>
        </div>
      </footer>

      {/* ─── Lightbox ─── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 text-white/80 hover:text-white" onClick={() => setLightbox(null)} aria-label="Close">
            <X className="w-7 h-7" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveAsset(lightbox.imageUrl)} alt={lightbox.caption || "Gallery"} className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
            {lightbox.caption && <p className="text-center text-white/90 text-sm font-semibold mt-4">{lightbox.caption}</p>}
          </div>
        </div>
      )}

      {/* ─── Login popups ─── */}
      {loginModal && (
        <SchoolLoginModal mode={loginModal} schoolName={school.name} accentColor={accent} onClose={() => setLoginModal(null)} />
      )}
    </div>
  );
}

function SectionKicker({ children, accent, center }: { children: React.ReactNode; accent: string; center?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${center ? "justify-center" : ""}`}>
      <span className="h-0.5 w-6 rounded-full" style={{ background: accent }} />
      <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>{children}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <p className="text-sm text-slate-400 italic">{text}</p>
    </div>
  );
}
