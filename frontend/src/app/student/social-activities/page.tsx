"use client";
import React, { useState } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Leaf, Award, Heart, Shield, Loader2, CheckCircle2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  hours: number;
  date: string;
  status: 'Pending Review' | 'Approved';
}

export default function SocialActivitiesPage() {
  const [activityType, setActivityType] = useState("");
  const [activities, setActivities] = useState<ActivityLog[]>([
    {
      id: "1",
      type: "environmental",
      description: "Planted 5 tree saplings in the local park.",
      hours: 3,
      date: "2026-06-15",
      status: "Approved"
    },
    {
      id: "2",
      type: "teaching",
      description: "Tutored junior students in Mathematics.",
      hours: 4,
      date: "2026-06-22",
      status: "Pending Review"
    }
  ]);
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      const newActivity: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        type: activityType,
        description,
        hours: parseInt(hours),
        date: new Date().toISOString().split('T')[0],
        status: 'Pending Review'
      };
      setActivities([newActivity, ...activities]);
      setActivityType("");
      setDescription("");
      setHours("");
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  return (
    <PortalLayout title="Social Activities" subtitle="Record and manage your community service">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-900 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
          
          <div className="relative z-10 flex items-start gap-6">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Heart className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">My Social Activities</h1>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Log your community service, environmental initiatives, and social outreach activities here. 
                Your contributions help build a better society and reflect your commitment to social responsibility.
              </p>
            </div>
          </div>
        </div>

        {/* Form and Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Submission Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Log New Activity</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Activity Type
                </label>
                <select 
                  required
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                >
                  <option value="" disabled>Select an activity category</option>
                  <option value="environmental">Tree Plantation / Environmental</option>
                  <option value="teaching">Volunteer Teaching / Tutoring</option>
                  <option value="cleanliness">Swachh Bharat / Cleanliness Drive</option>
                  <option value="awareness">Social Awareness Campaign</option>
                  <option value="healthcare">Blood Donation / Health Camp</option>
                  <option value="other">Other Community Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Hours Spent
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="E.g., 5"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Activity Description
                </label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what you did, your role, and the impact..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-3.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                  ) : isSuccess ? (
                    <><CheckCircle2 className="w-5 h-5" /> Logged Successfully!</>
                  ) : (
                    "Submit Activity Log"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 h-fit">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Activity Impact
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Character Building</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Develops empathy, leadership, and social responsibility.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0 text-green-600 dark:text-green-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Community Growth</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Directly benefits society and improves local environment.</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                  Note: All social activity logs are reviewed by your class teacher. Outstanding contributions may be recognized with special badges.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Activity History Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Activity Logs</h2>
          
          {activities.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No activities logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                    <th className="pb-4 px-4 font-semibold">Date</th>
                    <th className="pb-4 px-4 font-semibold">Type</th>
                    <th className="pb-4 px-4 font-semibold">Description</th>
                    <th className="pb-4 px-4 font-semibold">Hours</th>
                    <th className="pb-4 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(activity => (
                    <tr key={activity.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {new Date(activity.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">
                          {activity.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate" title={activity.description}>
                        {activity.description}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-900 dark:text-white font-semibold">
                        {activity.hours} hrs
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          activity.status === 'Approved' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-amber-500 dark:text-amber-400'
                        }`}>
                          {activity.status === 'Approved' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Loader2 className="w-3.5 h-3.5" />
                          )}
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
