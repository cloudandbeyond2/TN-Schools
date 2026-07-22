"use client";
import React, { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { 
  BarChart2, Clock, Calendar, Shield, Award, Users, Download, 
  Loader2, CheckCircle2, TrendingUp, HelpCircle, Heart, Star, Leaf
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

interface ActivityLog {
  id: string;
  activityType: string;
  activityName: string;
  description: string;
  points: number;
  hours: number;
  date: string;
  location: string;
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

export default function HeadmasterSocialActivitiesPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleDownloadReport = () => {
    if (!analytics) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Hours Contributed,Total Logged Tasks\r\n";
    analytics.categoryStats.forEach(stat => {
      csvContent += `"${stat.category}",${stat.hours},${stat.count}\r\n`;
    });

    csvContent += "\r\nClass Section,Total Hours Contributed\r\n";
    analytics.classLeaderboard.forEach(cls => {
      csvContent += `"${cls.class}",${cls.hours}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `School_Community_Service_Report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire("Report Downloaded", "Community Service & Social Responsibility report downloaded successfully!", "success");
  };

  // Environmental impact stats
  const approvedLogs = activities.filter(a => a.status === 'Approved');
  const treesPlanted = approvedLogs.filter(a => a.activityType === "Tree Plantation").length * 2;
  const cleanupCampaigns = approvedLogs.filter(a => a.activityType === "Swachh Bharat").length;
  const recyclingCampHours = approvedLogs.filter(a => a.activityType === "Recycling & Waste Management").reduce((sum, a) => sum + (a.hours || 0), 0);

  return (
    <PortalLayout 
      title={lang === "தமிழ்" ? "சமூக பொறுப்பு பகுப்பாய்வு" : "Social Responsibility Analytics"} 
      subtitle={lang === "தமிழ்" ? "பள்ளி அளவிலான சமூக சேவை நேரங்கள் டாஷ்போர்டு மற்றும் வகுப்புகள் லீடர்போர்டு." : "School-wide community hours dashboard, class leaderboards, and monthly social service audits."}
      avatarLetter="H"
      avatarColor="#059669"
      accentColor="#059669"
      themeClass="theme-headmaster"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-150 dark:border-emerald-900 shadow-sm text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <BarChart2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white">{lang === "தமிழ்" ? "சமூக சேவை & சமூக தணிக்கை" : "Community Service & Social Audit"}</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">{lang === "தமிழ்" ? "சுற்றுச்சூழல், தூய்மைப்பணி மற்றும் கல்வி சேவை தாக்கங்களை பள்ளி முழுவதும் மதிப்பாய்வு செய்யவும்." : "Review environmental, cleanup, and educational volunteering impacts school-wide."}</p>
              </div>
            </div>
            <button
              onClick={handleDownloadReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow flex items-center justify-center gap-2 self-start md:self-auto"
            >
              <Download className="w-4 h-4" /> Download Social Report
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total School Hours", value: `${analytics?.totalHours || 0} hrs`, sub: "Verified service hours", icon: Clock, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250/30" },
                { label: "Community Actions", value: analytics?.totalActivities || 0, sub: "Completed projects", icon: CheckCircle2, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-250/30" },
                { label: "Active Student Ratio", value: `${Math.round((analytics?.totalActivities || 0) * 1.5)}%`, sub: "School-wide participation", icon: Users, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-250/30" },
                { label: "Pending Reviews", value: analytics?.pendingApprovals || 0, sub: "Action required by teachers", icon: Shield, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-250/30" }
              ].map((stat, idx) => (
                <div key={idx} className={`p-5 rounded-3xl border bg-white dark:bg-slate-900 flex justify-between items-center text-left ${stat.color}`}>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">{stat.label}</span>
                    <span className="text-2xl font-black text-black dark:text-white mt-1 block leading-none">{stat.value}</span>
                    <span className="text-[10px] text-slate-450 font-semibold mt-2 block">{stat.sub}</span>
                  </div>
                  <stat.icon className="w-8 h-8 shrink-0 opacity-80" />
                </div>
              ))}
            </div>

            {/* Environmental Impact Metrics */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
              <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-500" /> Environmental Sustainability Impact
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: "Trees Planted", value: treesPlanted, icon: "🌳", desc: "Saplings planted & nurtured by students in school / villages." },
                  { title: "Clean Campus Actions", value: cleanupCampaigns, icon: "🧹", desc: "Swachh Bharat cleanup activities inside the school grounds." },
                  { title: "Waste Recycled Hours", value: `${recyclingCampHours} hrs`, icon: "♻️", desc: "Recycling & waste segregation campaigns completed." }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <span className="text-[10px] text-slate-550 font-bold block">{item.title}</span>
                        <span className="text-xl font-black text-black dark:text-white block mt-0.5">{item.value}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-3 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Leaderboards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Class Participation Leaderboard */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
                <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-600" /> Class Service Leaderboard
                </h3>
                <div className="space-y-4">
                  {analytics?.classLeaderboard.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-600 w-5">#{idx + 1}</span>
                        <span className="text-xs font-bold text-black dark:text-white">{item.class}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-600">{item.hours} hours</span>
                    </div>
                  ))}
                  {(!analytics?.classLeaderboard || analytics.classLeaderboard.length === 0) && (
                    <p className="text-xs text-slate-500 text-center py-6">No class leaderboard data available.</p>
                  )}
                </div>
              </div>

              {/* Top Student Volunteers */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
                <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" /> Top Volunteer Changemakers
                </h3>
                <div className="space-y-4">
                  {analytics?.topActiveStudents.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-600 w-5">#{idx + 1}</span>
                        <div>
                          <span className="text-xs font-bold text-black dark:text-white block">{item.name}</span>
                          <span className="text-[10px] text-slate-550">Class {item.class}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600">{item.hours} hours</span>
                    </div>
                  ))}
                  {(!analytics?.topActiveStudents || analytics.topActiveStudents.length === 0) && (
                    <p className="text-xs text-slate-500 text-center py-6">No student volunteer data available.</p>
                  )}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
                <h3 className="text-base font-bold text-black dark:text-white mb-5 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Category Breakdown
                </h3>
                <div className="space-y-4">
                  {analytics?.categoryStats.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                      <div>
                        <span className="text-xs font-bold text-black dark:text-white block truncate max-w-[200px]">{item.category}</span>
                        <span className="text-[10px] text-slate-500">{item.count} logs verified</span>
                      </div>
                      <span className="text-xs font-black text-emerald-600">{item.hours} hours</span>
                    </div>
                  ))}
                  {(!analytics?.categoryStats || analytics.categoryStats.length === 0) && (
                    <p className="text-xs text-slate-500 text-center py-6">No activity distribution data available.</p>
                  )}
                </div>
              </div>

            </div>

            {/* School Service Timeline logs */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left shadow-sm">
              <h2 className="text-base font-bold text-black dark:text-white mb-6">Recent School-wide Activities Verified</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-bold uppercase">
                      <th className="pb-3 px-4">Date</th>
                      <th className="pb-3 px-4">Student</th>
                      <th className="pb-3 px-4">Activity Name</th>
                      <th className="pb-3 px-4">Category</th>
                      <th className="pb-3 px-4">Hours</th>
                      <th className="pb-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(act => (
                      <tr key={act.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-xs text-slate-700 dark:text-slate-350">
                        <td className="py-4 px-4 whitespace-nowrap">{new Date(act.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4 font-bold text-black dark:text-white">{act.student.user.name} ({act.student.class || ""}-{act.student.section || ""})</td>
                        <td className="py-4 px-4 truncate max-w-xs">{act.activityName}</td>
                        <td className="py-4 px-4 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">{act.activityType}</span></td>
                        <td className="py-4 px-4 font-black">{act.hours} hrs</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            act.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            act.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>{act.status}</span>
                        </td>
                      </tr>
                    ))}
                    {activities.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">No activities logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </PortalLayout>
  );
}
