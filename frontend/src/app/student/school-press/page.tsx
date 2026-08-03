"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { Camera, Send, CheckCircle, Upload, Star, Calendar, Clock, Filter } from "lucide-react";
import Swal from "sweetalert2";

export default function SchoolPressPage() {
  const { data: session } = useSession();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState<"all" | "mine" | "pending">("all");

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
          // 2. Fetch class-filtered activities + student's own pending submissions
          const actRes = await fetch(`${API_URL}/api/teacher/school-press?schoolId=${profile.schoolId}&class=${profile.class}&approvedOnly=true&studentId=${profile.id}`);
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
          title: "Submitted for Approval! 📰",
          text: "Your post has been submitted. It will be reviewed by your teacher before public publication.",
          icon: "info",
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

  const mySubmissions = useMemo(() => {
    if (!studentProfile) return [];
    return recentActivities.filter((a) => a.studentId === studentProfile.id || a.student?.id === studentProfile.id);
  }, [recentActivities, studentProfile]);

  const pendingSubmissions = useMemo(() => {
    return mySubmissions.filter((a) => !a.isApproved);
  }, [mySubmissions]);

  const filteredActivities = useMemo(() => {
    if (feedFilter === "mine") return mySubmissions;
    if (feedFilter === "pending") return pendingSubmissions;
    return recentActivities;
  }, [feedFilter, recentActivities, mySubmissions, pendingSubmissions]);

  return (
    <PortalLayout title="School Press" subtitle="Publish student activities and achievements - Tamil Nadu Schools" accentColor="#7c3aed" themeClass="theme-student">
      <div className="flex flex-col gap-6 w-full text-left animate-in fade-in duration-300">
        
        {/* 📰 Hero Banner - School Press */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 glass rounded-3xl p-5 border border-violet-200 dark:border-violet-800/40 bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-violet-950/30 dark:via-slate-900/60 dark:to-blue-950/30 backdrop-blur-md shadow-sm">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide mb-1 flex items-center gap-2">
              <i className="fi fi-sr-newspaper text-violet-600 dark:text-violet-400 flex items-center" />
              The School Press
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {studentProfile ? (
                <>Record your special moments, sports awards, academic accomplishments, and projects to display in the feed for Class {studentProfile.class}!</>
              ) : (
                <>Record your special moments, sports awards, and accomplishments to display in the feed!</>
              )}
            </p>
          </div>
          {/* Right - chips */}
          <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 shrink-0 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 font-bold text-xs rounded-xl border border-violet-200/40 dark:border-violet-700/30 whitespace-nowrap">
              <i className="fi fi-sr-camera flex items-center text-xs" />
              Share Your Moments
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200/40 dark:border-blue-700/30 whitespace-nowrap">
              <i className="fi fi-sr-star flex items-center text-xs" />
              Student Achievements
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Submission Form */}
          <div className="lg:col-span-2 space-y-6">

          {/* Submission Form Card */}
          <div className="bg-[var(--bg-card)] border-2 md:border-4 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-sm">
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {submitStatus === "loading" ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : submitStatus === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submitted for Approval!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit to School Press
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Recent Activity Feed & Status Tracker */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border-2 md:border-4 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 shadow-sm flex flex-col h-auto lg:h-[calc(100vh-140px)] lg:sticky lg:top-24">
            
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2">
                <span className="text-xl">📰</span>
                School Press Feed
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-4 gap-1">
              <button
                onClick={() => setFeedFilter("all")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  feedFilter === "all"
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                All Feed ({recentActivities.length})
              </button>
              <button
                onClick={() => setFeedFilter("mine")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  feedFilter === "mine"
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                My Posts ({mySubmissions.length})
              </button>
              <button
                onClick={() => setFeedFilter("pending")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all relative ${
                  feedFilter === "pending"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Pending ({pendingSubmissions.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {loading ? (
                <div className="text-center py-10 text-[var(--text-muted)] text-sm">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto mb-4" />
                  <span>Loading feed...</span>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-10 text-[var(--text-muted)] text-sm italic">
                  {feedFilter === "pending"
                    ? "No pending submissions awaiting approval."
                    : feedFilter === "mine"
                    ? "You haven't submitted any activities yet."
                    : "No activities published yet."}
                </div>
              ) : (
                filteredActivities.map((act) => {
                  const isMyPost = studentProfile && (act.studentId === studentProfile.id || act.student?.id === studentProfile.id);

                  return (
                    <div 
                      key={act.id} 
                      className={`p-4 rounded-2xl border transition-all group ${
                        !act.isApproved 
                          ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-900/20 dark:border-amber-700/50" 
                          : "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {act.student?.user?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[var(--text-heading)] leading-none flex items-center gap-1.5">
                            {act.student?.user?.name || "Unknown Student"}
                            {isMyPost && <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded font-black">YOU</span>}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-1">
                            Class {act.student?.class} - {act.student?.section}
                          </div>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                          {/* Approval Status Badge */}
                          {isMyPost && (
                            !act.isApproved ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300/50 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> Pending Approval
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300/50 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> Published
                              </span>
                            )
                          )}
                          <div className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-emerald-500" />
                            {new Date(act.createdAt).toLocaleDateString()}
                          </div>
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
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </PortalLayout>
  );
}
