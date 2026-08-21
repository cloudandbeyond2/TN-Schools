"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  order: number;
}
interface Portal {
  tagline: string | null;
  about: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  showStudentLogin: boolean;
  showParentLogin: boolean;
  isPublished: boolean;
  gallery: GalleryImage[];
}

function resolveAsset(url: string | null | undefined): string {
  if (!url) return "/portal/banner-default.jpg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

export default function HeadmasterPortalPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId as string | undefined;
  const schoolDise = (session?.user as any)?.schoolDise as string | undefined;

  const [portal, setPortal] = useState<Portal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#059669");
  const [showStudentLogin, setShowStudentLogin] = useState(true);
  const [showParentLogin, setShowParentLogin] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const gallerySlotRef = useRef<number | undefined>(undefined);

  const flash = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPortal = async (sid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/school-portal/${sid}`);
      const json = await res.json();
      if (json.success && json.data.portal) {
        const p: Portal = json.data.portal;
        setPortal(p);
        setTagline(p.tagline || "");
        setAbout(p.about || "");
        setPrimaryColor(p.primaryColor || "#059669");
        setShowStudentLogin(p.showStudentLogin);
        setShowParentLogin(p.showParentLogin);
        setIsPublished(p.isPublished);
      } else {
        flash("Could not load portal configuration.", "error");
      }
    } catch {
      flash("Network error loading portal.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) loadPortal(schoolId);
  }, [schoolId]);

  const handleSave = async () => {
    if (!schoolId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/school-portal/${schoolId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagline, about, primaryColor, showStudentLogin, showParentLogin, isPublished }),
      });
      const json = await res.json();
      if (json.success) {
        setPortal(json.data);
        flash("🎉 Portal updated successfully!", "success");
      } else {
        flash(json.error || "Save failed.", "error");
      }
    } catch {
      flash("Network error while saving.", "error");
    } finally {
      setSaving(false);
    }
  };

  const uploadBanner = async (file: File) => {
    if (!schoolId) return;
    const fd = new FormData();
    fd.append("banner", file);
    try {
      const res = await fetch(`${API_URL}/api/school-portal/${schoolId}/banner`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        setPortal(json.data);
        flash("🖼️ Banner updated!", "success");
      } else {
        flash(json.error || "Banner upload failed.", "error");
      }
    } catch {
      flash("Network error uploading banner.", "error");
    }
  };

  const uploadGallery = async (file: File, slot?: number) => {
    if (!schoolId) return;
    const fd = new FormData();
    fd.append("image", file);
    if (slot !== undefined) fd.append("order", String(slot));
    try {
      const res = await fetch(`${API_URL}/api/school-portal/${schoolId}/gallery`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        await loadPortal(schoolId);
        flash("🖼️ Gallery image saved!", "success");
      } else {
        flash(json.error || "Gallery upload failed.", "error");
      }
    } catch {
      flash("Network error uploading image.", "error");
    }
  };

  const deleteGallery = async (imageId: string) => {
    if (!schoolId) return;
    if (!confirm("Remove this gallery image?")) return;
    try {
      const res = await fetch(`${API_URL}/api/school-portal/${schoolId}/gallery/${imageId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        await loadPortal(schoolId);
        flash("🗑️ Image removed.", "success");
      } else {
        flash(json.error || "Delete failed.", "error");
      }
    } catch {
      flash("Network error deleting image.", "error");
    }
  };

  const galleryImages = portal?.gallery || [];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "பொது பள்ளி தளம்" : "Public School Portal"}
      themeClass="theme-headmaster"
      accentColor="#3b82f6">
      {toast && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold border shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-xl shrink-0 border border-blue-100 dark:border-blue-900/50">
              <i className="fi fi-rr-globe text-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {lang === "தமிழ்" ? "பொது பள்ளி தளம் மையம்" : "Public School Portal Hub"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed max-w-2xl">
                {lang === "தமிழ்"
                  ? "பார்வையாளர்கள் காணும் முகப்புப் பக்க பேனர், கருப்பொருள், புகைப்பட தொகுப்பகம் மற்றும் உள்நுழைவு விருப்பங்களை நிர்வகிக்கவும்."
                  : "Customize your school's public landing page banner, tagline, photo showcase, and visitor portal access options."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-start md:self-auto">
            {schoolDise && (
              <a
                href={`/school/${schoolDise}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
              >
                <i className="fi fi-rr-globe" /> {lang === "தமிழ்" ? "தளத்தைக் காண் ↗" : "View Public Page ↗"}
              </a>
            )}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{lang === "தமிழ்" ? "படங்கள்" : "Gallery Photos"}</span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{(portal?.gallery || []).length}</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-3" />
          <span className="text-xs text-slate-400">Loading portal…</span>
        </div>
      ) : !schoolId ? (
        <div className="text-center py-16 text-sm text-slate-500">No school is linked to your account.</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Banner + text config ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Banner & Details</h3>

            <div>
              <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveAsset(portal?.bannerUrl)} alt="Banner" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded-xl transition-colors"
              >
                📤 Upload new banner
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadBanner(f);
                  e.target.value = "";
                }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Tagline</label>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">About the School</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Theme Colour</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-8 rounded border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-500">{primaryColor}</span>
            </div>

            <div className="space-y-2 pt-1">
              {[
                { label: "Show Student Login", value: showStudentLogin, set: setShowStudentLogin },
                { label: "Show Parent Login", value: showParentLogin, set: setShowParentLogin },
                { label: "Publish portal (visible to public)", value: isPublished, set: setIsPublished },
              ].map((t) => (
                <label key={t.label} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={t.value} onChange={(e) => t.set(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                  {t.label}
                </label>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* ── Gallery ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Gallery ({galleryImages.length})</h3>
              <button
                onClick={() => {
                  gallerySlotRef.current = undefined;
                  galleryInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                + Add Image
              </button>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadGallery(f, gallerySlotRef.current);
                e.target.value = "";
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              {galleryImages.map((g) => {
                const parsedCaption = (() => {
                  if (!g.caption) return { title: "Campus Highlight", category: "Academic", description: "", gradient: "from-teal-400 to-emerald-600" };
                  try {
                    const parsed = JSON.parse(g.caption);
                    return {
                      title: parsed.title || "Campus Highlight",
                      category: parsed.category || "Academic",
                      description: parsed.description || "",
                      gradient: parsed.gradient || "from-teal-400 to-emerald-600"
                    };
                  } catch {
                    return { title: g.caption, category: "Academic", description: "", gradient: "from-teal-400 to-emerald-600" };
                  }
                })();

                return (
                  <div key={g.id} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {g.imageUrl && !imageError[g.id] ? (
                      <img
                        src={resolveAsset(g.imageUrl)}
                        alt={parsedCaption.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError((prev) => ({ ...prev, [g.id]: true }))}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${parsedCaption.gradient} flex flex-col items-center justify-center p-3 text-center`}>
                        <span className="text-white text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 bg-black/30 rounded-md mb-1">
                          {parsedCaption.category}
                        </span>
                        <span className="text-white text-[10px] font-bold truncate max-w-full">
                          {parsedCaption.title}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          gallerySlotRef.current = g.order;
                          galleryInputRef.current?.click();
                        }}
                        className="px-2 py-1 bg-white/90 text-slate-800 text-[10px] font-bold rounded-md"
                      >
                        Replace
                      </button>
                      <button
                        onClick={() => deleteGallery(g.id)}
                        className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                      <span className="text-[10px] font-semibold text-white truncate block">
                        {parsedCaption.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {galleryImages.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">No gallery images yet.</p>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
