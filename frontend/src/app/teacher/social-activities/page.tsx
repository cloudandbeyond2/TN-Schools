"use client";
import React, { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { 
  Check, X, Star, Clock, Calendar, MapPin, User, Loader2, BarChart2,
  ListTodo, AlertCircle, Award, CheckCircle2, ShieldAlert, FileText, Image
} from 'lucide-react';
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
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  student: {
    class?: string;
    section?: string;
    user: {
      name: string;
    }
  }
}

interface AnalyticsData {
  totalHours: number;
  totalPoints: number;
  totalActivities: number;
  pendingApprovals: number;
  categoryStats: Array<{ category: string; hours: number; count: number }>;
  classLeaderboard: Array<{ class: string; hours: number }>;
  topActiveStudents: Array<{ name: string; class: string; hours: number }>;
}

export default function TeacherSocialActivitiesPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verification states
  const [reviewingActivity, setReviewingActivity] = useState<ActivityLog | null>(null);
  const [remarks, setRemarks] = useState("");
  const [rating, setRating] = useState(5);
  const [isVerifying, setIsVerifying] = useState(false);

  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'analytics'>('pending');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const schoolId = (session?.user as any)?.schoolId;
      if (!schoolId) return;

      // Get activities
      const res = await fetch(`${API_URL}/api/social-activities/school/${schoolId}`);
      const json = await res.json();
      if (json.success) {
        setActivities(json.data);
      }

      // Get school analytics
      const analyticsRes = await fetch(`${API_URL}/api/social-activities/analytics/${schoolId}`);
      const analyticsJson = await analyticsRes.json();
      if (analyticsJson.success) {
        setAnalytics(analyticsJson.data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (status: 'Approved' | 'Rejected') => {
    if (!reviewingActivity) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_URL}/api/social-activities/${reviewingActivity.id}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          rating: status === 'Approved' ? rating : null,
          teacherRemarks: remarks,
          verifiedBy: (session?.user as any)?.id || "Teacher"
        })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Verified", `Activity log status updated to ${status}!`, "success");
        // Update local list
        setActivities(activities.map(a => a.id === reviewingActivity.id ? { ...a, status, teacherRemarks: remarks, rating: status === 'Approved' ? rating : undefined } : a));
        setReviewingActivity(null);
        setRemarks("");
        setRating(5);
        // Refresh analytics
        const schoolId = (session?.user as any)?.schoolId;
        const analyticsRes = await fetch(`${API_URL}/api/social-activities/analytics/${schoolId}`);
        const analyticsJson = await analyticsRes.json();
        if (analyticsJson.success) {
          setAnalytics(analyticsJson.data);
        }
      } else {
        Swal.fire("Error", json.message || "Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update status.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const pendingList = activities.filter(a => a.status === 'Pending');

  return (
    <PortalLayout 
      title={lang === "தமிழ்" ? "கூடுதல் பாடச் செயல்பாடுகள் மதிப்பாய்வு" : "Extracurricular Reviews"} 
      subtitle={lang === "தமிழ்" ? "மாணவர்களின் சமூக சேவைச் செயல்களைச் சரிபார்க்கவும், தாக்கத்தை மதிப்பிடவும், பள்ளி அளவிலான பங்கேற்பைக் கண்காணிக்கவும்." : "Verify student community service actions, rate impact, and monitor school-wide participation."}
      avatarLetter="T"
      avatarColor="#4f46e5"
      accentColor="#4f46e5"
      themeClass="theme-teacher"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-150 dark:border-indigo-900 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-955/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <ListTodo className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white">{lang === "தமிழ்" ? "சமூக சேவை ஒப்புதல்கள்" : "Community Service Approvals"}</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">{lang === "தமிழ்" ? "மாணவர்களின் சமூகப் பங்களிப்புப் பதிவுகளை மதிப்பாய்வு செய்யவும், AI மதிப்புகளைச் சரிபார்க்கவும், பேட்ஜ்களை வழங்கவும்." : "Review student community participation logs, check AI values, and award badges."}</p>
              </div>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start">
              {[
                { id: 'pending', label: lang === "தமிழ்" ? `நிலுவையில் உள்ளவை (${pendingList.length})` : `Pending (${pendingList.length})` },
                { id: 'all', label: lang === "தமிழ்" ? "அனைத்துப் பதிவுகள்" : "All Logs" },
                { id: 'analytics', label: lang === "தமிழ்" ? "வகுப்பு பகுப்பாய்வு" : "Class Analytics" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Analytics Bar */}
        {analytics && activeTab !== 'analytics' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: lang === "தமிழ்" ? "நிலுவையில் உள்ள மதிப்பாய்வுகள்" : "Pending Reviews", value: analytics.pendingApprovals, sub: lang === "தமிழ்" ? "நடவடிக்கை தேவை" : "Action required", icon: AlertCircle, color: "text-amber-500 bg-amber-50 dark:bg-amber-955/20 border-amber-250/30" },
              { label: lang === "தமிழ்" ? "ஒப்புதல் அளிக்கப்பட்ட மணிநேரம்" : "Approved Hours", value: `${analytics.totalHours} hrs`, sub: lang === "தமிழ்" ? "பள்ளி முழுவதும் மொத்தம்" : "Total School-wide", icon: Clock, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-955/20 border-emerald-250/30" },
              { label: lang === "தமிழ்" ? "சமூக நடவடிக்கைகள்" : "Community Actions", value: analytics.totalActivities, sub: lang === "தமிழ்" ? "மொத்தம் முடிந்தது" : "Total completed", icon: CheckCircle2, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-955/20 border-indigo-250/30" },
              { label: lang === "தமிழ்" ? "பெறப்பட்ட புள்ளிகள்" : "Points Earned", value: `${analytics.totalPoints} Pts`, sub: lang === "தமிழ்" ? "பாடநெறி சாரா மதிப்பெண்" : "Extracurricular score", icon: Award, color: "text-purple-500 bg-purple-50 dark:bg-purple-955/20 border-purple-250/30" }
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 flex justify-between items-center text-left ${stat.color}`}>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">{stat.label}</span>
                  <span className="text-xl sm:text-2xl font-black text-black dark:text-white mt-1 block leading-none">{stat.value}</span>
                  <span className="text-[10px] text-slate-450 font-semibold mt-1 block">{stat.sub}</span>
                </div>
                <stat.icon className="w-8 h-8 shrink-0 opacity-80" />
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        ) : activeTab === 'analytics' ? (
          /* Analytics Tab Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Class Leaderboard */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
              <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" /> Class Leaderboard (Hours)
              </h3>
              <div className="space-y-4">
                {analytics?.classLeaderboard.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-500 w-5">#{idx + 1}</span>
                      <span className="text-xs font-bold text-black dark:text-white">{item.class}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-500">{item.hours} hours</span>
                  </div>
                ))}
                {(!analytics?.classLeaderboard || analytics.classLeaderboard.length === 0) && (
                  <p className="text-xs text-slate-500 text-center py-6">No class leaderboard data available.</p>
                )}
              </div>
            </div>

            {/* Top Active Students */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
              <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" /> Top Active Volunteers
              </h3>
              <div className="space-y-4">
                {analytics?.topActiveStudents.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-purple-500 w-5">#{idx + 1}</span>
                      <div>
                        <span className="text-xs font-bold text-black dark:text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-500">Class {item.class}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-500">{item.hours} hours</span>
                  </div>
                ))}
                {(!analytics?.topActiveStudents || analytics.topActiveStudents.length === 0) && (
                  <p className="text-xs text-slate-500 text-center py-6">No top student volunteer data available.</p>
                )}
              </div>
            </div>

            {/* Category Stats */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
              <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Activity Distribution
              </h3>
              <div className="space-y-4">
                {analytics?.categoryStats.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-xs font-bold text-black dark:text-white block truncate max-w-[200px]">{item.category}</span>
                      <span className="text-[10px] text-slate-500">{item.count} activities logged</span>
                    </div>
                    <span className="text-xs font-black text-indigo-500">{item.hours} hours</span>
                  </div>
                ))}
                {(!analytics?.categoryStats || analytics.categoryStats.length === 0) && (
                  <p className="text-xs text-slate-500 text-center py-6">No activity distribution data available.</p>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* List Tab Content */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
            <h2 className="text-lg font-bold text-black dark:text-white mb-6">
              {activeTab === 'pending' ? "Pending Approvals Requests" : "All Extracurricular Action Logs"}
            </h2>

            {((activeTab === 'pending' ? pendingList : activities).length === 0) ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No activity logs found matching the filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeTab === 'pending' ? pendingList : activities).map(act => {
                  let statusBg = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  if (act.status === "Approved") statusBg = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                  if (act.status === "Rejected") statusBg = "bg-rose-500/10 text-rose-500 border-rose-500/20";

                  let refData: any = null;
                  if (act.aiReflection) {
                    try {
                      refData = typeof act.aiReflection === "string" ? JSON.parse(act.aiReflection) : act.aiReflection;
                    } catch (e) {}
                  }

                  return (
                    <div key={act.id} className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/30 transition-all">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div>
                            <span className="text-[10px] uppercase font-black tracking-wider text-indigo-500">{act.activityType}</span>
                            <h3 className="text-base font-bold text-black dark:text-white leading-tight mt-0.5">{act.activityName}</h3>
                            <span className="text-xs text-slate-500 font-bold mt-1 block flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-450" /> {act.student.user.name} (Class {act.student.class || ""}-{act.student.section || ""})</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${statusBg}`}>{act.status}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold mb-3 border-y border-slate-200/55 dark:border-slate-800 py-1.5">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(act.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {act.location || "Community"}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> {act.hours} hrs</span>
                        </div>

                        <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold mb-4">{act.description}</p>
                        
                        {/* Display certificate/photo links */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {act.photoUrl && (
                            <a href={act.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-350 transition-colors">
                              <Image className="w-3.5 h-3.5 text-emerald-500" /> Activity Photo
                            </a>
                          )}
                          {act.certificateUrl && (
                            <a href={act.certificateUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-350 transition-colors">
                              <FileText className="w-3.5 h-3.5 text-blue-500" /> Service Certificate
                            </a>
                          )}
                        </div>

                        {/* AI Reflection Analysis */}
                        {refData && (
                          <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-left mb-4">
                            <span className="block font-bold text-indigo-500 mb-1.5 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" /> AI Reflection Analysis</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                              <div><span className="font-bold text-slate-500">Skills Learned:</span> {refData.skillsLearned}</div>
                              <div><span className="font-bold text-slate-500">Empathy:</span> {refData.empathy}</div>
                              <div><span className="font-bold text-slate-500">Teamwork:</span> {refData.teamwork}</div>
                              <div><span className="font-bold text-slate-500">Social Responsibility:</span> {refData.socialResponsibility}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Verification triggers */}
                      {act.status === 'Pending' && (
                        <div className="border-t border-slate-200 dark:border-slate-850 pt-4 flex gap-2 mt-auto">
                          <button
                            onClick={() => setReviewingActivity(act)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" /> Verify Activity
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Verification Remarks & Rating Modal */}
        {reviewingActivity && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-black dark:text-white">Verify Social Action Log</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Submit remarks and rating for student {reviewingActivity.student.user.name}.</p>
                </div>
                <button 
                  onClick={() => setReviewingActivity(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Rating selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Impact Rating (1-5 Stars)</label>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="p-0.5 rounded transition-transform hover:scale-110"
                    >
                      <Star className={`w-7 h-7 ${rating > i ? "text-amber-500 fill-amber-500" : "text-slate-350 dark:text-slate-700"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Verification Feedback Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Provide constructive feedback or commendation remarks..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-black dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleVerify('Rejected')}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs py-3 rounded-xl transition-all border border-rose-500/20 disabled:opacity-50"
                >
                  Reject / Return
                </button>
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => handleVerify('Approved')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Approve & Award</>}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
