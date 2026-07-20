"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { Camera, Send, CheckCircle, Search, Upload, Trash2, Check, X, Newspaper } from "lucide-react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

export default function SchoolPressPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchStudents();
    fetchActivities();
  }, [session]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/students?schoolId=${(session?.user as any)?.schoolId || ''}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const schoolId = (session?.user as any)?.schoolId;
      const res = await fetch(`${API_URL}/api/teacher/school-press?schoolId=${schoolId || ''}`);
      const data = await res.json();
      if (data.success) {
        setRecentActivities(data.data);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

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
    if (!selectedStudent || !description) return;
    setSubmitStatus("loading");

    try {
      const teacherId = (session?.user as any)?.id;
      const res = await fetch(`${API_URL}/api/teacher/school-press`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent,
          teacherId,
          description,
          photos
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitStatus("success");
        setDescription("");
        setSelectedStudent("");
        setPhotos([]);
        fetchActivities();
        Swal.fire({
          title: "Published!",
          text: "Achievement has been published successfully!",
          icon: "success",
          confirmButtonColor: "#10b981"
        });
        setTimeout(() => setSubmitStatus("idle"), 3000);
      } else {
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Error submitting activity:", err);
      setSubmitStatus("error");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/teacher/school-press/${id}/approve`, {
        method: "PUT"
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          title: "Approved!",
          text: "The post has been approved and published to the student feed.",
          icon: "success",
          confirmButtonColor: "#10b981"
        });
        fetchActivities();
      }
    } catch (err) {
      console.error("Error approving activity:", err);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this post!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/teacher/school-press/${id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Deleted!", "The post has been deleted.", "success");
          fetchActivities();
        }
      } catch (err) {
        console.error("Error deleting activity:", err);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.class?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalLayout title={lang === "தமிழ்" ? "பள்ளி செய்தி" : "School Press"} subtitle={lang === "தமிழ்" ? "மாணவர் சாதனைகள் மற்றும் சாதனைகள் வெளியிடு" : "Publish student activities and achievements"} accentColor="#10b981">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
        
        {/* Left Column - Submission Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-heading)]">{lang === "தமிழ்" ? "புதிய செயல்பாடு" : "New Activity"}</h2>
                <p className="text-xs text-[var(--text-muted)]">{lang === "தமிழ்" ? "ஒரு சாதனை மற்றும் சிறப்பு தருணத்தை பதிவு செய்" : "Record an achievement or special moment"}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Student Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-heading)]">Select Student *</label>
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                >
                  <option value="">-- Choose a student --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.user?.name} (Class {student.class} - {student.section})
                    </option>
                  ))}
                </select>
                {students.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">Make sure you have students assigned to you in the backend.</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-heading)]">Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., He got the first prize in the district science exhibition..."
                  rows={4}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all resize-none"
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
                          <X className="w-4 h-4 inline-block mr-1 text-inherit" />
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

        {/* Right Column - Recent Activity */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm flex flex-col h-auto xl:h-[calc(100vh-140px)] xl:sticky xl:top-24">
            <h3 className="text-base font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
              <span className="text-xl"><Newspaper className="w-4 h-4 inline-block mr-1 text-inherit" /></span>
              Recent Publications
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {recentActivities.length === 0 ? (
                <div className="text-center py-10 text-[var(--text-muted)] text-sm">
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
                      <div className="ml-auto flex flex-col items-end gap-1">
                        <span className="text-[9px] text-[var(--text-muted)]">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${act.isApproved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {act.isApproved ? 'Approved' : 'Pending'}
                        </span>
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
                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex justify-end gap-2">
                      {!act.isApproved && (
                        <button
                          onClick={() => handleApprove(act.id)}
                          className="flex items-center gap-1 text-[10px] font-bold bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(act.id)}
                        className="flex items-center gap-1 text-[10px] font-bold bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors border border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
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
