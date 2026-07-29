"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { ChevronLeft, Trophy, Medal, Award, User, Star, TrendingUp } from "lucide-react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  return url;
};
const API_BASE = getApiBase();

interface Exam {
  id: string;
  examName: string;
  examType: string;
  class: string;
  section: string;
  group: string | null;
  academicYear: string;
  examDate: string | null;
  isLocked: boolean;
}

interface Result {
  studentId: string;
  studentName: string;
  rollNumber: string;
  total: number | null;
  percentage: number | null;
  maxTotal: number;
}

export default function TopPerformersPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    
    const fetchExamData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/headmaster/model-exams/${examId}`);
        const json = await res.json();
        if (json.success) {
          const examData = json.data;
          setExam(examData);
          
          // Determine HSC flag
          const isHsc = examData.class === "11" || examData.class === "12";
          const maxTotal = isHsc ? 600 : 500;
          
          // Calculate totals for ranking
          const rankedResults = (examData.results || []).map((r: any) => {
            const vals = [r.tamil, r.english, r.mathematics, r.science, r.socialScience]
              .filter(v => v != null) as number[];
            if (r.extraSubject != null) vals.push(r.extraSubject);
            
            const total = vals.length ? vals.reduce((a, b) => a + b, 0) : null;
            const percentage = total != null ? parseFloat(((total / maxTotal) * 100).toFixed(1)) : null;
            
            return {
              studentId: r.studentId,
              studentName: r.studentName,
              rollNumber: r.rollNumber,
              total,
              percentage,
              maxTotal
            };
          }).filter((r: Result) => r.total !== null); // Only rank students with marks entered
          
          // Sort descending by total
          rankedResults.sort((a: Result, b: Result) => (b.total || 0) - (a.total || 0));
          
          setResults(rankedResults);
        } else {
          setError(json.error || "Failed to load exam data.");
        }
      } catch (err) {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "முழுமையான தரவரிசை பட்டியல்" : "Full Class Leaderboard"}
      subtitle={exam ? `${exam.examName} · Class ${exam.class}-${exam.section}` : "Loading rankings..."}
      avatarLetter="H"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      <div className="fade-in max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          
          {exam && (
            <div className="text-right">
              <h2 className="text-xl font-black text-white">{exam.examName}</h2>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{exam.examType} · Class {exam.class}{exam.section}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Generating rankings...</p>
          </div>
        ) : error ? (
          <div className="glass rounded-3xl p-12 text-center border border-red-500/30">
            <p className="text-red-400 font-bold">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center border border-slate-800">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300 mb-2">No Rankings Available</h3>
            <p className="text-sm text-slate-500">Marks have not been entered or saved for this exam yet.</p>
          </div>
        ) : (
          <div className="glass rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-lg font-black text-white">Top Performers Ranking</h3>
                <p className="text-xs text-slate-400">Total {results.length} students ranked by total marks</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-4 px-6 w-24 text-center">Rank</th>
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6 text-center">Total Marks</th>
                    <th className="py-4 px-6 text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {results.map((student, index) => {
                    const rank = index + 1;
                    let RankIcon = null;
                    let rankStyle = "text-slate-400 bg-slate-800";
                    
                    if (rank === 1) {
                      RankIcon = <Medal className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />;
                      rankStyle = "bg-yellow-500/10 border-yellow-500/30";
                    } else if (rank === 2) {
                      RankIcon = <Medal className="w-6 h-6 text-slate-300 fill-slate-300/20" />;
                      rankStyle = "bg-slate-400/10 border-slate-400/30";
                    } else if (rank === 3) {
                      RankIcon = <Medal className="w-6 h-6 text-amber-600 fill-amber-600/20" />;
                      rankStyle = "bg-amber-600/10 border-amber-600/30";
                    }
                    
                    return (
                      <tr 
                        key={student.studentId} 
                        className={`hover:bg-slate-800/30 transition-colors ${rank <= 3 ? rankStyle : ""}`}
                      >
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center items-center h-full">
                            {RankIcon ? (
                              <div className="relative">
                                {RankIcon}
                                <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-black rounded-full w-4 h-4 flex items-center justify-center text-white border border-slate-800">
                                  {rank}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-black text-slate-500 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 shadow-inner">
                                #{rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border ${rank <= 3 ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-800 border-slate-700 text-slate-400"}`}>
                              {student.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-bold ${rank <= 3 ? "text-white text-base" : "text-slate-200 text-sm"}`}>
                                {student.studentName}
                              </p>
                              <p className="text-xs text-slate-500 font-mono tracking-wider">
                                {student.rollNumber}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-xl font-black ${rank <= 3 ? "text-emerald-400" : "text-emerald-500/80"}`}>
                              {student.total}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              Out of {student.maxTotal}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${rank <= 3 ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-slate-800 border-slate-700 text-slate-400"}`}>
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-sm font-black">{student.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
