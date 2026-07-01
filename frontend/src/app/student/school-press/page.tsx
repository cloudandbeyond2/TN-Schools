"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { Camera, Send, CheckCircle, Upload, Star, Calendar } from "lucide-react";
import Swal from "sweetalert2";

export default function SchoolPressPage() {
  const { data: session } = useSession();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchProfileAndActivities = async () => {
    if (!session?.user) return;
    try {
      // 1. Fetch student profile
      const res = await fetch(`${API_URL}/api/students`);
      const json = await res.json();
      if (json.success) {
        const profile = json.data.find((s: any) => s.userId === (session.user as any).id);
        if (profile) {
          setStudentProfile(profile);
          // 2. Fetch class-filtered activities
          const actRes = await fetch(`${API_URL}/api/teacher/school-press?schoolId=${profile.schoolId}&class=${profile.class}&approvedOnly=true`);
          const actData = await actRes.json();
          if (actData.success) {
            setRecentActivities(actData.data);
          }
        }
      }
    } catch (err) {
      console.error("Error loading school press for student:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndActivities();
  }, [session]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const promises = Array.from(files).map((file) => fileToBase64(file));
        const base64Photos = await Promise.all(promises);
        setPhotos((prev) => [...prev, ...base64Photos]);
      } catch (err) {
        console.error("Error reading files:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfile || !description) return;
    setSubmitStatus("loading");

    try {
      const res = await fetch(`${API_URL}/api/teacher/school-press`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentProfile.id,
          teacherId: null,
          description,
          photos
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitStatus("success");
        setDescription("");
        setPhotos([]);
        Swal.fire({
          title: "Published!",
          text: "Your achievement has been published to the School Press! 📰",
          icon: "success",
          confirmButtonColor: "#10b981"
        });
        fetchProfileAndActivities();
        setTimeout(() => setSubmitStatus("idle"), 3000);
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Error submitting activity:", err);
      setSubmitStatus("error");
    }
  };

  return (
    <PortalLayout title="School Press 📰" subtitle="Publish student activities and achievements" accentColor="#10b981">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left animate-in fade-in duration-300">
        
        {/* Left Column - Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Playful Hero Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-8 shadow-xl border-4 border-emerald-100">
            <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
              <Camera className="w-64 h-64" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-black tracking-wider text-xs uppercase mb-4 border-2 border-white/30 rotate-[-2deg]">
                <Star className="w-4 h-4 text-yellow-300" /> Share Your Moments
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md font-mono">The School Press!</h2>
              {studentProfile ? (
                <p className="text-emerald-50 font-bold max-w-xl text-base leading-relaxed">
                  Record your special moments, sports awards, academic accomplishments, and projects to display in the feed for <strong className="text-yellow-300">Class {studentProfile.class}</strong>!
                </p>
              ) : (
                <p className="text-emerald-50 font-bold max-w-xl text-base leading-relaxed">
                  Record your special moments, sports awards, and accomplishments to display in the feed!
                </p>
              )}
            </div>
          </div>

          {/* Submission Form Card */}
          <div className="bg-[var(--bg-card)] border-4 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-heading)]">New Activity Submission</h2>
                <p className="text-xs text-[var(--text-muted)]">Record an achievement or special moment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Student Identity Card */}
              {studentProfile && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">
                    {studentProfile.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold">Posting As</div>
                    <div className="text-sm font-black text-slate-800 dark:text-white">
                      {studentProfile.user?.name} (Class {studentProfile.class} - {studentProfile.section})
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-heading)]">Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what you did! e.g., I won 1st prize in the Science Fair today..."
                  rows={4}
                  className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-heading)]">Upload Photos</label>
                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:bg-[var(--sidebar-item-hover-bg)] transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
                    <Upload className="w-8 h-8 opacity-50" />
                    <span className="text-sm font-medium">Click to upload photos</span>
                    <span className="text-[10px]">JPG, PNG or GIF (Max 5MB)</span>
                  </div>
                </div>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {photos.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="w-full bg-emerald-550 hover:bg-emerald-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {submitStatus === "loading" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : submitStatus === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Published Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish to School Press
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Recent Activity Feed */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border-4 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm flex flex-col h-[calc(100vh-140px)] sticky top-24">
            <h3 className="text-base font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
              <span className="text-xl">📰</span>
              Recent Publications
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {loading ? (
                <div className="text-center py-10 text-[var(--text-muted)] text-sm">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto mb-4" />
                  <span>Loading feed...</span>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-10 text-[var(--text-muted)] text-sm italic">
                  No activities published yet.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/20 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {act.student?.user?.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-heading)] leading-none">{act.student?.user?.name || "Unknown Student"}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-1">
                          Class {act.student?.class} - {act.student?.section}
                        </div>
                      </div>
                      <div className="ml-auto text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-500" />
                        {new Date(act.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-main)] leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-[var(--border)]">
                      "{act.description}"
                    </p>
                    {act.photos && act.photos.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {act.photos.map((p: string, i: number) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[var(--border)]">
                            <img src={p} alt="Activity" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
