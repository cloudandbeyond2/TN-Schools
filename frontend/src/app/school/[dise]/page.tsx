"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SchoolLoginModal from "@/components/SchoolLoginModal";
import ThemeToggle from "@/components/ThemeToggle";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  order: number;
}
interface PortalData {
  tagline: string | null;
  about: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  showStudentLogin: boolean;
  showParentLogin: boolean;
  isPublished: boolean;
  gallery: GalleryImage[];
}
interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  description: string | null;
  type: string;
  location: string | null;
}
interface TeacherItem {
  id: string;
  name: string;
  subject: string;
  performance: string;
}
interface ClassItem {
  id: string;
  className: string;
  section: string;
  subject: string;
  totalStudents: number;
}
interface PortalResponse {
  school: {
    id: string;
    dise: string;
    name: string;
    address: string | null;
    district: string;
    block: string;
    mediumOfInstruction: string;
    schoolType: string;
    headmasterName: string | null;
  };
  portal: PortalData | null;
  stats: { studentCount: number; teacherCount: number; classCount: number };
  events: SchoolEvent[];
  teachers: TeacherItem[];
  classes: ClassItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Prefix relative uploaded/default asset paths with the correct origin.
// Portal defaults ("/portal/...") are served by the frontend; uploads ("/uploads/...") by the backend.
function resolveAsset(url: string | null | undefined): string {
  if (!url) return "/portal/banner-default.jpg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function SchoolPortalPage() {
  const params = useParams();
  const dise = String(params?.dise || "");

  const [data, setData] = useState<PortalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loginModal, setLoginModal] = useState<"student" | "parent" | null>(null);

  useEffect(() => {
    if (!dise) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/school-portal/public/${dise}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [dise]);

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
  const accent = portal?.primaryColor || "#059669";
  const gallery = (portal?.gallery || []).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <div className="leading-tight">
              <span className="block text-sm font-black text-slate-900 dark:text-white">TN Schools</span>
              <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Public Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {portal?.showStudentLogin !== false && (
              <button
                onClick={() => setLoginModal("student")}
                className="px-3 py-1.5 text-xs font-bold rounded-lg text-white shadow-sm"
                style={{ background: accent }}
              >
                🎓 Student
              </button>
            )}
            {portal?.showParentLogin !== false && (
              <button
                onClick={() => setLoginModal("parent")}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                👪 Parent
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Home banner ── */}
      <section className="relative h-[380px] md:h-[440px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${resolveAsset(portal?.bannerUrl)}')` }}
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${accent}f2, ${accent}99 55%, ${accent}55)` }} />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
            {school.schoolType} · {school.mediumOfInstruction} Medium
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg leading-tight">{school.name}</h1>
          <p className="mt-3 text-base md:text-lg text-white/90 font-medium drop-shadow">
            {portal?.tagline || "Excellence in Education"}
          </p>
          <p className="mt-2 text-sm text-white/80">
            📍 {school.address || `${school.block}, ${school.district}`} · DISE: {school.dise}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {portal?.showStudentLogin !== false && (
              <button
                onClick={() => setLoginModal("student")}
                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform text-sm"
              >
                🎓 Student Login
              </button>
            )}
            {portal?.showParentLogin !== false && (
              <button
                onClick={() => setLoginModal("parent")}
                className="px-6 py-3 bg-white/15 border border-white/40 text-white font-bold rounded-xl shadow-lg hover:bg-white/25 transition-colors text-sm backdrop-blur-sm"
              >
                👪 Parent Login
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-14">
        {/* ── Stat strip ── */}
        <section className="grid grid-cols-3 gap-3 md:gap-5 -mt-20 relative z-20">
          {[
            { label: "Students", value: stats.studentCount, icon: "🧑‍🎓" },
            { label: "Teachers", value: stats.teacherCount, icon: "👩‍🏫" },
            { label: "Classes", value: stats.classCount, icon: "📚" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-5 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl md:text-3xl font-black" style={{ color: accent }}>{s.value}</div>
              <div className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── About ── */}
        {portal?.about && (
          <section className="text-center max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">About Our School</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{portal.about}</p>
            {school.headmasterName && school.headmasterName !== "N/A" && (
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Headmaster: <span style={{ color: accent }}>{school.headmasterName}</span>
              </p>
            )}
          </section>
        )}

        {/* ── Events ── */}
        <section>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-5">📅 School Events</h2>
          {events.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No upcoming events announced yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div key={ev.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: accent }}>
                      {ev.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{formatDate(ev.date)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{ev.title}</h3>
                  {ev.location && <p className="text-[11px] text-slate-500 mt-1">📍 {ev.location}</p>}
                  {ev.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{ev.description}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Teachers ── */}
        <section>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-5">👩‍🏫 Our Teachers</h2>
          {teachers.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Teacher directory coming soon.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {teachers.map((t) => (
                <div key={t.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center shadow-sm">
                  <div
                    className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white text-lg font-black mb-2"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{t.name}</h3>
                  <p className="text-[11px] text-slate-500">{t.subject}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Classes & Groups ── */}
        <section>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-5">📚 Classes &amp; Groups</h2>
          {classes.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Class groups will be listed here once set up.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {classes.map((c) => (
                <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                  <div className="text-sm font-black text-slate-800 dark:text-white">
                    Class {c.className}{c.section ? ` - ${c.section}` : ""}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{c.subject}</div>
                  <div className="text-[11px] font-semibold mt-2" style={{ color: accent }}>
                    🧑‍🎓 {c.totalStudents} students
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Gallery ── */}
        <section>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-5">🖼️ Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gallery.map((g) => (
              <div key={g.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveAsset(g.imageUrl)} alt={g.caption || "School gallery"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {g.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-[11px] font-semibold text-white">{g.caption}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h3 className="text-sm font-black text-slate-800 dark:text-white">{school.name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {school.address || `${school.block}, ${school.district}`} · {school.mediumOfInstruction} Medium · DISE {school.dise}
          </p>
          <p className="text-[11px] text-slate-400 mt-3">© {new Date().getFullYear()} Government of Tamil Nadu · Department of Education</p>
        </div>
      </footer>

      {/* ── Login popups ── */}
      {loginModal && (
        <SchoolLoginModal
          mode={loginModal}
          schoolName={school.name}
          accentColor={accent}
          onClose={() => setLoginModal(null)}
        />
      )}
    </div>
  );
}
