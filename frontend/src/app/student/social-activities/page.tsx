"use client";
import React, { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';

interface ActivityLog {
  id: string;
  activityType: string;
  activityName: string;
  description: string;
  points: number;
  hours: number;
  date: string;
  location: string;
  photoUrl?: string;
  certificateUrl?: string;
  aiReflection?: string;
  rating?: number;
  teacherRemarks?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

interface ReflectionData {
  skillsLearned: string;
  leadership: string;
  teamwork: string;
  communication: string;
  empathy: string;
  socialResponsibility: string;
  environmentalAwareness: string;
}



const CATEGORIES = [
  "Environmental Activities",
  "Community Service",
  "Swachh Bharat",
  "Health & Wellness",
  "Blood Donation Awareness",
  "Road Safety Awareness",
  "Water Conservation",
  "Tree Plantation",
  "Animal Welfare",
  "Education Support (Teaching Juniors)",
  "Recycling & Waste Management",
  "Disaster Relief & Awareness",
  "Digital Literacy",
  "Government Awareness Campaigns",
  "Cultural & Heritage Preservation",
  "School Volunteer Service"
];

const BADGES = [
  { name: "Young Changemaker", icon: "🌱", desc: "Log 2 hours of service", hoursRequired: 2, color: "from-blue-400 to-indigo-500" },
  { name: "Health Volunteer", icon: "🩺", desc: "Log 5 hours of service", hoursRequired: 5, color: "from-rose-400 to-pink-500" },
  { name: "Water Saver", icon: "💧", desc: "Log 10 hours of service", hoursRequired: 10, color: "from-cyan-400 to-blue-500" },
  { name: "Green Warrior", icon: "🛡️", desc: "Log 15 hours of service", hoursRequired: 15, color: "from-emerald-400 to-teal-500" },
  { name: "Community Hero", icon: "🤝", desc: "Log 20 hours of service", hoursRequired: 20, color: "from-amber-400 to-orange-500" },
  { name: "Eco Champion", icon: "🌳", desc: "Log 30 hours of service", hoursRequired: 30, color: "from-green-400 to-emerald-600" },
  { name: "Social Leader", icon: "✊", desc: "Log 45 hours of service", hoursRequired: 45, color: "from-purple-400 to-fuchsia-600" },
  { name: "School Ambassador", icon: "🎓", desc: "Log 60 hours of service", hoursRequired: 60, color: "from-indigo-500 to-violet-700" }
];



export default function StudentSocialActivitiesPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  
  // Form fields
  const [activityType, setActivityType] = useState("");
  const [activityName, setActivityName] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [teacherInChargeId, setTeacherInChargeId] = useState("");
  
  // Teachers list for dropdown
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // States
  const [previewReflection, setPreviewReflection] = useState<ReflectionData | null>(null);
  const [generatingReflection, setGeneratingReflection] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (session?.user) {
      fetchStudentData();
      fetchTeachers();
    }
  }, [session]);

  const fetchStudentData = async () => {
    try {
      const userId = (session?.user as any)?.id;
      const schoolId = (session?.user as any)?.schoolId;
      if (!userId || !schoolId) return;

      // Get profile
      const studentRes = await fetch(`${API_URL}/api/students?schoolId=${schoolId}`);
      const studentJson = await studentRes.json();
      if (studentJson.success) {
        const profile = studentJson.data.find((s: any) => s.userId === userId);
        if (profile) {
          setStudentProfile(profile);
        }
      }

      // Get activity logs
      const res = await fetch(`${API_URL}/api/social-activities/${userId}`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error("Error fetching student social activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const schoolId = (session?.user as any)?.schoolId;
      if (!schoolId) return;
      const res = await fetch(`${API_URL}/api/teacher/list?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTeachers(json.data);
      }
    } catch (err) {
      console.error("Error fetching teachers", err);
    }
  };

  const handleGenerateReflection = async () => {
    if (!description || !activityName || !activityType || !hours) {
      Swal.fire("Missing details", "Please fill in the Activity Name, Category, Hours and Description first before generating an AI reflection.", "warning");
      return;
    }
    setGeneratingReflection(true);
    try {
      const res = await fetch(`${API_URL}/api/social-activities/generate-reflection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activityType,
          activityName,
          description,
          hours,
          location
        })
      });
      const json = await res.json();
      if (json.success && json.reflection) {
        setPreviewReflection(json.reflection);
        Swal.fire("AI Reflection Generated", "Smart Assistant has successfully structured your self-reflection metrics. Review them below before submitting!", "success");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Failed", "AI Reflection failed. Please try again.", "error");
    } finally {
      setGeneratingReflection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const userId = (session?.user as any)?.id;
      if (!userId) throw new Error("User ID not found");

      const res = await fetch(`${API_URL}/api/social-activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: activityType,
          activityName,
          description,
          hours,
          date,
          location,
          photoUrl,
          certificateUrl,
          aiReflection: previewReflection,
          teacherInChargeId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire("Activity Logged", "Your community service log has been submitted for review! Check back soon for teacher verification.", "success");
        setActivities([data.data, ...activities]);
        
        // Reset form
        setActivityType("");
        setActivityName("");
        setDate("");
        setHours("");
        setLocation("");
        setDescription("");
        setPhotoUrl("");
        setCertificateUrl("");
        setTeacherInChargeId("");
        setPreviewReflection(null);
      } else {
        Swal.fire("Error", data.message || "Failed to submit log", "error");
      }
    } catch (error) {
      console.error("Error submitting activity:", error);
      Swal.fire("Error", "Network error. Failed to log activity.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this activity log? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, delete it!"
      });

      if (!result.isConfirmed) return;

      const res = await fetch(`${API_URL}/api/social-activities/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Deleted!", "Your activity log has been deleted.", "success");
        setActivities(prev => prev.filter(act => act.id !== id));
      } else {
        Swal.fire("Error", data.message || "Failed to delete activity log.", "error");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      Swal.fire("Error", "Network error. Failed to delete activity.", "error");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/social-activities/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPhotoUrl(data.url);
        Swal.fire({ title: "Success", text: "Activity photo uploaded!", icon: "success", toast: true, position: "top-end", showConfirmButton: false, timer: 2000 });
      } else {
        Swal.fire("Error", data.message || "Upload failed", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Network error. Upload failed.", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCert(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/api/social-activities/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCertificateUrl(data.url);
        Swal.fire({ title: "Success", text: "Certificate document uploaded!", icon: "success", toast: true, position: "top-end", showConfirmButton: false, timer: 2000 });
      } else {
        Swal.fire("Error", data.message || "Upload failed", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Network error. Upload failed.", "error");
    } finally {
      setIsUploadingCert(false);
    }
  };

  // Stats calculations
  const approvedLogs = activities.filter(a => a.status === 'Approved');
  const totalHours = approvedLogs.reduce((sum, a) => sum + (a.hours || 0), 0);
  const totalActivities = approvedLogs.length;
  
  // Custom metrics based on categories
  const treesPlanted = approvedLogs.filter(a => a.activityType === "Tree Plantation").length * 2;
  const campaignsParticipated = approvedLogs.filter(a => 
    ["Blood Donation Awareness", "Road Safety Awareness", "Government Awareness Campaigns", "Swachh Bharat"].includes(a.activityType)
  ).length;

  const currentBadge = BADGES.reduce((best, b) => {
    if (totalHours >= b.hoursRequired) return b;
    return best;
  }, BADGES[0]);

  const impactScore = totalHours * 15 + totalActivities * 10;

  // Dynamic monthly challenges calculation based on this month's approved logs
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthApproved = activities.filter(a => {
    if (a.status !== 'Approved') return false;
    const actDate = new Date(a.date);
    return actDate.getMonth() === currentMonth && actDate.getFullYear() === currentYear;
  });

  const monthlyTreePlantCount = thisMonthApproved.filter(a => a.activityType === "Tree Plantation").length;
  
  const monthlySwachhBharatHours = thisMonthApproved
    .filter(a => a.activityType === "Swachh Bharat")
    .reduce((sum, a) => sum + (a.hours || 0), 0);

  const monthlyEducationHours = thisMonthApproved
    .filter(a => a.activityType === "Education Support (Teaching Juniors)")
    .reduce((sum, a) => sum + (a.hours || 0), 0);

  let challengePoints = 0;
  if (monthlyTreePlantCount >= 2) challengePoints += 50;
  if (monthlySwachhBharatHours >= 4) challengePoints += 80;
  if (monthlyEducationHours >= 3) challengePoints += 60;

  const dynamicChallenges = [
    { id: "c1", title: "Plant 2 Trees", desc: "Log 2 Tree Plantation activities this month", target: 2, current: monthlyTreePlantCount, reward: 50, icon: "🌳" },
    { id: "c2", title: "Clean Campus Drive", desc: "Participate in Swachh Bharat activities for 4 hours", target: 4, current: monthlySwachhBharatHours, reward: 80, icon: "🧹" },
    { id: "c3", title: "Reading Week", desc: "Conduct 3 Education Support tutoring hours", target: 3, current: monthlyEducationHours, reward: 60, icon: "📚" }
  ];

  return (
    <PortalLayout 
      title="Social Activities Hub" 
      subtitle="Complete community service logs, track environmental impact, and build your social portfolio."
      avatarLetter="S"
      avatarColor="#10b981"
      accentColor="#10b981"
      themeClass="theme-student"
    >
      <div className="w-full space-y-6">

        {/* ── PAGE BANNER ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
          {/* Left: icon + title + subtitle */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center shrink-0 shadow-sm">
              <i className="fi fi-sr-hand-holding-heart text-xl flex items-center text-emerald-500" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2 flex-wrap">
                Community Service &amp; Social Responsibility
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-snug">
                Log service hours, track your environmental impact &amp; build your social portfolio.
              </p>
            </div>
          </div>

          {/* Right: KPI chips */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 shadow-sm">
              <i className="fi fi-sr-clock flex items-center text-emerald-500" />
              <span>{totalHours} hrs Logged</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-extrabold text-xs rounded-xl border border-blue-200/50 dark:border-blue-800/40 shadow-sm">
              <i className="fi fi-sr-checkbox flex items-center text-blue-500" />
              <span>{totalActivities} Activities</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded-xl border border-purple-200/50 dark:border-purple-800/40 shadow-sm">
              <i className="fi fi-sr-chart-line-up flex items-center text-purple-500" />
              <span>{impactScore} Impact Score</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-extrabold text-xs rounded-xl border border-amber-200/50 dark:border-amber-800/40 shadow-sm">
              <i className="fi fi-sr-badge flex items-center text-amber-500" />
              <span>{currentBadge.name}</span>
            </div>
          </div>
        </div>
        {/* ── END BANNER ──────────────────────────────────────── */}

        {/* Dashboard KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Community Hours", value: `${totalHours} hrs`, fi: "fi fi-sr-clock",           color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50" },
            { label: "Activities Done", value: totalActivities,      fi: "fi fi-sr-checkbox",        color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200/50"       },
            { label: "Trees Planted",   value: treesPlanted,         fi: "fi fi-sr-leaf",            color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-950/20 border-green-200/50"     },
            { label: "Campaigns",       value: campaignsParticipated,fi: "fi fi-sr-shield",          color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200/50"       },
            { label: "Impact Score",    value: impactScore,          fi: "fi fi-sr-chart-line-up",  color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-50 dark:bg-purple-950/20 border-purple-200/50" },
            { label: "Total Points",    value: `${(totalHours * 10) + challengePoints} Pts`, fi: "fi fi-sr-gift", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200/50" }
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 flex flex-col justify-between items-start text-left shadow-sm ${stat.bg}`}>
              <div className="flex justify-between items-center w-full mb-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">{stat.label}</span>
                <i className={`${stat.fi} flex items-center text-base ${stat.color}`} />
              </div>
              <span className="text-xl sm:text-2xl font-black text-black dark:text-white leading-none">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Form and Challenges Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form and AI Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
              <h2 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                <i className="fi fi-sr-plus flex items-center text-emerald-500" /> Log New Community Action
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Activity Category *</label>
                    <select 
                      required
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                    >
                      <option value="" disabled>Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Activity Name *</label>
                    <input 
                      type="text" 
                      required
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      placeholder="E.g., Clean Campus Initiative"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Activity Date *</label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Hours Spent *</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max="100"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="E.g., 3"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Location *</label>
                    <input 
                      type="text" 
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="E.g., School Compound"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Teacher In-charge (Optional)</label>
                    <select 
                      value={teacherInChargeId}
                      onChange={(e) => setTeacherInChargeId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                    >
                      <option value="">Select teacher for quick verification</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject || "Teacher"})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Upload Action Photo (Optional)</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-550 dark:text-slate-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20"
                      />
                      {isUploadingPhoto && (
                        <div className="absolute right-3 top-3 text-[10px] text-emerald-500 font-bold animate-pulse">Uploading...</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Activity Description *</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe in detail what you accomplished, who it helped, and the social impact of your work..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none resize-none"
                  />
                </div>

                {/* AI Reflection Assistant */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fi fi-sr-sparkles flex items-center text-emerald-500 text-lg" />
                      <div className="text-left">
                        <span className="block font-bold text-black dark:text-white text-xs">AI Reflection Generator</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Smart Assistant will analyze your description to map critical social values.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={generatingReflection}
                      onClick={handleGenerateReflection}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {generatingReflection ? "Analyzing..." : "Generate AI Reflection"}
                    </button>
                  </div>

                  {previewReflection && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <span className="block font-bold text-slate-500 mb-0.5">Skills Learned</span>
                        <p className="text-black dark:text-slate-350">{previewReflection.skillsLearned}</p>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-500 mb-0.5">Empathy</span>
                        <p className="text-black dark:text-slate-350">{previewReflection.empathy}</p>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-500 mb-0.5">Teamwork</span>
                        <p className="text-black dark:text-slate-350">{previewReflection.teamwork}</p>
                      </div>
                      <div>
                        <span className="block font-bold text-slate-500 mb-0.5">Social Responsibility</span>
                        <p className="text-black dark:text-slate-350">{previewReflection.socialResponsibility}</p>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-3.5 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <><i className="fi fi-sr-refresh animate-spin flex items-center text-base" /> Submitting to teacher review...</>
                  ) : (
                    "Submit Community Action Log"
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Sidebar: Challenges and Badges */}
          <div className="space-y-6">
            
            {/* Monthly Challenges */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
              <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                <i className="fi fi-sr-star flex items-center text-amber-500" /> Active Monthly Challenges
              </h3>
              
              <div className="space-y-4">
                {dynamicChallenges.map(ch => {
                  const percent = Math.min(Math.round((ch.current / ch.target) * 100), 100);
                  return (
                    <div key={ch.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0 mt-0.5">{ch.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-black dark:text-white text-xs truncate leading-snug">{ch.title}</h4>
                            <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">+{ch.reward} XP</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-normal">{ch.desc}</p>
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] font-black text-slate-450 mb-1.5">
                              <span>Progress ({ch.current}/{ch.target})</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges Cabinet */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
              <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                <i className="fi fi-sr-medal flex items-center text-purple-500" /> Service Badges Cabinet
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((b, i) => {
                  const unlocked = totalHours >= b.hoursRequired;
                  return (
                    <div 
                      key={i} 
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                        unlocked 
                          ? 'border-purple-500/20 bg-purple-500/5 dark:bg-purple-950/10 opacity-100 scale-100 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 opacity-40 scale-95 grayscale'
                      }`}
                      title={b.desc}
                    >
                      <span className="text-3xl mb-2">{b.icon}</span>
                      <h4 className="text-[10px] font-bold text-black dark:text-white leading-tight mb-1">{b.name}</h4>
                      <span className={`text-[8px] font-black uppercase tracking-wider ${unlocked ? 'text-purple-500' : 'text-slate-450'}`}>
                        {unlocked ? "Unlocked" : `${b.hoursRequired} hrs`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Timeline / History Logs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm mt-8">
          <h2 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
            <i className="fi fi-sr-calendar flex items-center text-emerald-500" /> Community Service Timeline & Reflections
          </h2>

          {activities.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No service logs found. Start planting trees, cleaning areas, or helping juniors to log your first action!
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-8 text-left">
              {activities.map((act) => {
                let statusColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                if (act.status === "Approved") statusColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                if (act.status === "Rejected") statusColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";

                let parsedRef: ReflectionData | null = null;
                if (act.aiReflection) {
                  try {
                    parsedRef = typeof act.aiReflection === "string" ? JSON.parse(act.aiReflection) : act.aiReflection;
                  } catch (e) {}
                }

                return (
                  <div key={act.id} className="relative group">
                    {/* Circle timeline dot */}
                    <div className={`absolute -left-[35px] top-1 w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-950 transition-all ${
                      act.status === "Approved" ? "bg-emerald-500" : act.status === "Rejected" ? "bg-rose-500" : "bg-amber-500"
                    }`} />
                    
                    <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-250/50 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-450">{act.activityType}</span>
                          <h3 className="text-base font-bold text-black dark:text-white mt-0.5">{act.activityName}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold mt-1">
                            <span className="flex items-center gap-1"><i className="fi fi-sr-calendar flex items-center text-xs" /> {new Date(act.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><i className="fi fi-sr-marker flex items-center text-xs" /> {act.location || "Community"}</span>
                            <span className="flex items-center gap-1"><i className="fi fi-sr-clock flex items-center text-emerald-500 text-xs" /> {act.hours} hrs</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}`}>{act.status}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 hover:text-rose-600 text-slate-400 dark:text-slate-500 transition-colors"
                            title="Delete activity log"
                          >
                            <i className="fi fi-sr-trash flex items-center text-sm" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold mb-4">{act.description}</p>
                      
                      {/* Teacher Remarks */}
                      {act.teacherRemarks && (
                        <div className="bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 mb-4 text-xs">
                          <span className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Teacher Feedback</span>
                          <p className="text-slate-700 dark:text-slate-300 italic">"{act.teacherRemarks}"</p>
                          {act.rating && (
                            <div className="flex items-center gap-0.5 mt-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <i key={i} className={`fi ${(act.rating ?? 0) > i ? "fi-sr-star text-amber-500" : "fi-rr-star text-slate-300"} flex items-center text-xs`} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Display files url if uploaded */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {act.photoUrl && (
                          <a href={act.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-350 transition-colors">
                            <i className="fi fi-sr-picture flex items-center text-emerald-500 text-xs" /> View Activity Photo
                          </a>
                        )}
                        {act.certificateUrl && (
                          <a href={act.certificateUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-350 transition-colors">
                            <i className="fi fi-sr-document flex items-center text-blue-500 text-xs" /> View Service Certificate
                          </a>
                        )}
                      </div>

                      {/* AI Reflection toggle/preview */}
                      {parsedRef && (
                        <div className="border-t border-slate-200 dark:border-slate-850 pt-3">
                          <button
                            onClick={() => setSelectedActivity(selectedActivity?.id === act.id ? null : act)}
                            className="text-[10px] font-black text-emerald-500 flex items-center gap-1"
                          >
                             <i className="fi fi-sr-sparkles flex items-center text-xs animate-pulse" /> {selectedActivity?.id === act.id ? "Hide Reflection Metrics" : "View AI Reflection Analysis"}
                          </button>

                          {selectedActivity?.id === act.id && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] animate-in slide-in-from-top-1 duration-200 text-left">
                              <div>
                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block mb-0.5">Skills Learned</span>
                                <p className="text-black dark:text-slate-350 leading-relaxed font-semibold">{parsedRef.skillsLearned}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block mb-0.5">Empathy</span>
                                <p className="text-black dark:text-slate-350 leading-relaxed font-semibold">{parsedRef.empathy}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block mb-0.5">Leadership</span>
                                <p className="text-black dark:text-slate-350 leading-relaxed font-semibold">{parsedRef.leadership}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block mb-0.5">Teamwork</span>
                                <p className="text-black dark:text-slate-350 leading-relaxed font-semibold">{parsedRef.teamwork}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block mb-0.5">Communication</span>
                                <p className="text-black dark:text-slate-350 leading-relaxed font-semibold">{parsedRef.communication}</p>
                              </div>
                              <div>
                                <span className="font-bold text-slate-500 uppercase tracking-wide text-[9px] block mb-0.5">Social Responsibility</span>
                                <p className="text-black dark:text-slate-350 leading-relaxed font-semibold">{parsedRef.socialResponsibility}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>



      </div>
    </PortalLayout>
  );
}
