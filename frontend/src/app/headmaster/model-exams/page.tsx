"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Topper {
  id: number;
  name: string;
  classSection: string;
  marks: string;
  percentage: number;
  rank: number;
  subject: string;
}

export default function ModelExamsPage() {
  const [activeTab, setActiveTab] = useState<"Class 10" | "Class 12">("Class 10");
  const [searchQuery, setSearchQuery] = useState("");

  const stats10 = {
    totalStudents: 145,
    passed: 138,
    failed: 7,
    passPercentage: 95.1,
    averageScore: 412,
    highestScore: 491,
  };

  const stats12 = {
    totalStudents: 112,
    passed: 109,
    failed: 3,
    passPercentage: 97.3,
    averageScore: 524,
    highestScore: 588,
  };

  const toppers10: Topper[] = [
    { id: 1, name: "Kavitha R.", classSection: "10A", marks: "491/500", percentage: 98.2, rank: 1, subject: "Science (100)" },
    { id: 2, name: "Arun Kumar M.", classSection: "10A", marks: "485/500", percentage: 97.0, rank: 2, subject: "Maths (99)" },
    { id: 3, name: "Suresh P.", classSection: "10B", marks: "478/500", percentage: 95.6, rank: 3, subject: "Social Science (98)" },
    { id: 4, name: "Divya K.", classSection: "10C", marks: "469/500", percentage: 93.8, rank: 4, subject: "English (97)" },
  ];

  const toppers12: Topper[] = [
    { id: 1, name: "Nandhini S.", classSection: "12A (Bio)", marks: "588/600", percentage: 98.0, rank: 1, subject: "Biology (100)" },
    { id: 2, name: "Dinesh K.", classSection: "12A (Bio)", marks: "579/600", percentage: 96.5, rank: 2, subject: "Chemistry (99)" },
    { id: 3, name: "Ramya V.", classSection: "12B (CS)", marks: "572/600", percentage: 95.3, rank: 3, subject: "Computer Sci (98)" },
    { id: 4, name: "Harish R.", classSection: "12B (CS)", marks: "565/600", percentage: 94.1, rank: 4, subject: "Physics (96)" },
  ];

  // Subject Averages
  const subjectAverages10 = [
    { name: "Tamil", score: 84, color: "from-purple-500 to-indigo-500" },
    { name: "English", score: 79, color: "from-blue-500 to-cyan-500" },
    { name: "Mathematics", score: 76, color: "from-emerald-500 to-teal-500" },
    { name: "Science", score: 82, color: "from-amber-500 to-orange-500" },
    { name: "Social Science", score: 88, color: "from-rose-500 to-pink-500" },
  ];

  const subjectAverages12 = [
    { name: "Tamil/Hindi", score: 89, color: "from-purple-500 to-indigo-500" },
    { name: "English", score: 81, color: "from-blue-500 to-cyan-500" },
    { name: "Physics", score: 74, color: "from-emerald-500 to-teal-500" },
    { name: "Chemistry", score: 78, color: "from-amber-500 to-orange-500" },
    { name: "Bio/CS", score: 85, color: "from-rose-500 to-pink-500" },
  ];

  // Interactive Target Planner State
  const [targetPass, setTargetPass] = useState(100);
  const [specialClasses, setSpecialClasses] = useState("Daily 4:30 PM - 5:30 PM");
  const [planToast, setPlanToast] = useState<string | null>(null);

  const activeStats = activeTab === "Class 10" ? stats10 : stats12;
  const activeToppers = activeTab === "Class 10" ? toppers10 : toppers12;
  const activeSubjects = activeTab === "Class 10" ? subjectAverages10 : subjectAverages12;

  const filteredToppers = activeToppers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.classSection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPlanToast(`✓ Target plan updated! Goal set to ${targetPass}% pass percentage for ${activeTab} with '${specialClasses}' schedules.`);
    setTimeout(() => setPlanToast(null), 4000);
  };

  return (
    <PortalLayout
      title="Model Exam Results & Revision Analytics"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit mb-6">
        <button
          onClick={() => {
            setActiveTab("Class 10");
            setSearchQuery("");
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "Class 10"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Class 10 SSLC Results
        </button>
        <button
          onClick={() => {
            setActiveTab("Class 12");
            setSearchQuery("");
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "Class 12"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Class 12 HSC Results
        </button>
      </div>

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pass Percentage</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-400">{activeStats.passPercentage}%</span>
            <span className="text-[10px] text-emerald-500 font-bold">State target: 90%</span>
          </div>
          <div className="w-full bg-slate-850 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${activeStats.passPercentage}%` }}
            />
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Enrolled</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{activeStats.totalStudents}</span>
            <span className="text-[10px] text-slate-400 font-bold">Candidates</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 font-semibold">
            Passed: <span className="text-slate-350">{activeStats.passed}</span> · Failed: <span className="text-red-400">{activeStats.failed}</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-blue-400">
              {activeStats.averageScore}
              <span className="text-xs font-semibold text-slate-400">/{activeTab === "Class 10" ? "500" : "600"}</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 font-semibold">
            School Target: <span className="text-slate-350">{activeTab === "Class 10" ? "420" : "530"}</span>
          </div>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Highest Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-400">
              {activeStats.highestScore}
              <span className="text-xs font-semibold text-slate-400">/{activeTab === "Class 10" ? "500" : "600"}</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 font-semibold">
            Top District Rank Potential
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Subject performance bar chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-1">📊 Subject-wise Mean Averages</h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">Average percentage marks scored across all sections in the second revision exams.</p>

          <div className="space-y-4">
            {activeSubjects.map((sub) => (
              <div key={sub.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{sub.name}</span>
                  <span className="text-slate-400">{sub.score}%</span>
                </div>
                <div className="w-full bg-slate-900 h-3 rounded-lg overflow-hidden border border-slate-850">
                  <div
                    className={`bg-gradient-to-r ${sub.color} h-full rounded-lg transition-all duration-500`}
                    style={{ width: `${sub.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action center / revision planner */}
        <div className="glass rounded-2xl p-6 border border-slate-800 h-fit">
          <h2 className="text-base font-semibold text-white mb-2">🎯 Set Board Revision Targets</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Define objectives and assign special study hours to address weak scores.
          </p>

          <form onSubmit={handleSavePlan} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Target Pass Rate (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={targetPass}
                onChange={(e) => setTargetPass(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Special Remedial Schedule</label>
              <select
                value={specialClasses}
                onChange={(e) => setSpecialClasses(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Daily 4:30 PM - 5:30 PM">Daily 4:30 PM - 5:30 PM (Weak Students)</option>
                <option value="Saturdays 9:30 AM - 12:30 PM">Saturdays 9:30 AM - 12:30 PM (All Candidates)</option>
                <option value="No Remedial Scheduled">No Remedial Scheduled</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Update Revision Directive
            </button>
          </form>

          {planToast && (
            <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl leading-relaxed">
              {planToast}
            </div>
          )}
        </div>
      </div>

      {/* Toppers list */}
      <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">🏆 Revision Toppers Roster</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Students achieving outstanding results in the latest mock rounds.</p>
          </div>

          <div className="relative max-w-xs">
            <input
              type="text"
              placeholder="Search toppers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Class Section</th>
                <th className="pb-3">Total Marks</th>
                <th className="pb-3">Percentage</th>
                <th className="pb-3">Key Achievement</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredToppers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-slate-300">
                    {t.rank === 1 ? "🥇" : t.rank === 2 ? "🥈" : t.rank === 3 ? "🥉" : `${t.rank}`}
                  </td>
                  <td className="py-3.5 font-bold text-white">{t.name}</td>
                  <td className="py-3.5 text-slate-400">{t.classSection}</td>
                  <td className="py-3.5 text-blue-400 font-bold">{t.marks}</td>
                  <td className="py-3.5 text-emerald-400 font-semibold">{t.percentage}%</td>
                  <td className="py-3.5 text-amber-400/90 font-medium">🎯 {t.subject}</td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => alert(`Sent congratulations message to ${t.name} and parent via notification!`)}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-md font-bold text-[10px] transition-all"
                    >
                      🌟 Congratulate
                    </button>
                  </td>
                </tr>
              ))}
              {filteredToppers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                    No matching toppers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
}
