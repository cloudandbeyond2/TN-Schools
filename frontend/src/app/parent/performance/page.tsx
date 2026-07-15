"use client";
import { useEffect, useState, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";
import { 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Languages, 
  Sparkles, 
  RefreshCw, 
  User, 
  ArrowUpRight, 
  CheckCircle2
} from "lucide-react";

interface SubjectMark {
  subject: string;
  [examType: string]: string | number;
}

interface RawMark {
  id: string;
  subject: string;
  examType: string;
  maxMarks: number;
  scored: number;
  grade: string | null;
  academicYear: string;
}

interface PerformanceSummary {
  studentId: string;
  name: string;
  class: string;
  section: string;
  overallAvg: number;
  attendancePct: number;
  strengths: string[];
  weaknesses: string[];
  feedbacks: { source: string; text: string; date: string }[];
  aiSummary: string;
  aiTips: string[];
  tamilSummary: string;
  tamilTips: string[];
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"];

function ChildSwitcher({ childList, active, onChange }: { childList: Child[]; active: Child | null; onChange: (c: Child) => void }) {
  if (childList.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-6 p-3 glass rounded-2xl flex-wrap">
      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
        <User className="w-3.5 h-3.5 text-emerald-400" /> Viewing:
      </span>
      {childList.map(c => (
        <button key={c.studentId} onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            active?.studentId === c.studentId ? "bg-emerald-600 text-white shadow-md" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}>
          {c.name.split(" ")[0]} · Class {c.class}{c.section}
        </button>
      ))}
    </div>
  );
}

function ScoreBar({ scored, maxMarks, color }: { scored: number; maxMarks: number; color: string }) {
  const pct = Math.round((scored / maxMarks) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{pct}%</span>
    </div>
  );
}

// ─── Custom Responsive SVG Subject Performance Chart ─────────────────
const SubjectBarChart = ({ data }: { data: { subject: string; avg: number }[] }) => {
  if (data.length === 0) return <div className="text-center py-8 text-slate-500 text-sm">No subject data available</div>;

  const width = 500;
  const rowHeight = 55;
  const paddingX = 20;
  const height = data.length * rowHeight + 40;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grid Lines */}
      {[0, 25, 50, 75, 100].map(pct => {
        const x = paddingX + (pct / 100) * 440;
        return (
          <g key={pct} className="opacity-10 stroke-slate-400">
            <line x1={x} y1={10} x2={x} y2={height - 25} strokeDasharray="3 3" />
            <text x={x} y={height - 8} fill="currentColor" stroke="none" textAnchor="middle" className="fill-slate-400 font-semibold">{pct}%</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((s, idx) => {
        const y = 15 + idx * rowHeight;
        const barWidth = (s.avg / 100) * 440;
        const color = COLORS[idx % COLORS.length];

        return (
          <g key={s.subject} className="group">
            {/* Subject Label */}
            <text x={paddingX} y={y + 12} fill="currentColor" className="fill-slate-700 dark:fill-slate-200 font-bold text-[13px]">
              {s.subject}
            </text>
            
            {/* Background track */}
            <rect x={paddingX} y={y + 20} width={440} height={14} rx={7} className="fill-slate-800/80" />

            {/* Filled bar with hover transition */}
            <rect x={paddingX} y={y + 20} width={barWidth} height={14} rx={7} fill={color} className="transition-all duration-300 ease-out hover:opacity-90">
              <animate attributeName="width" from="0" to={barWidth} dur="0.8s" fill="freeze" />
            </rect>

            {/* Percentage Badge */}
            <text x={Math.max(paddingX + barWidth - 8, paddingX + 25)} y={y + 31} fill="white" textAnchor="end" className="font-bold text-[9px] fill-white opacity-95">
              {s.avg}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Custom Responsive SVG Academic Trends Line Chart ─────────────────
const AcademicTrendsChart = ({ points }: { points: { exam: string; avg: number }[] }) => {
  if (points.length === 0) return <div className="text-center py-10 text-slate-500 text-sm">No trend data available</div>;

  const width = 500;
  const height = 230;
  const paddingX = 50;
  const paddingY = 35;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Compute point coordinates
  const pts = points.map((p, idx) => {
    const x = paddingX + (points.length > 1 ? (idx / (points.length - 1)) * chartWidth : chartWidth / 2);
    const y = height - paddingY - (p.avg / 100) * chartHeight;
    return { ...p, x, y };
  });

  let pathD = "";
  let areaD = "";
  if (pts.length > 0) {
    pathD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    areaD = pathD + ` L ${pts[pts.length - 1].x} ${height - paddingY} L ${pts[0].x} ${height - paddingY} Z`;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Grid lines (Y Axis) */}
      {[25, 50, 75, 100].map(val => {
        const y = height - paddingY - (val / 100) * chartHeight;
        return (
          <g key={val} className="opacity-10 stroke-slate-400">
            <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} />
            <text x={paddingX - 10} y={y + 4} fill="currentColor" stroke="none" textAnchor="end" className="fill-slate-400 font-semibold">{val}%</text>
          </g>
        );
      })}

      {/* Area Gradient */}
      {pts.length > 0 && <path d={areaD} fill="url(#areaGrad)" />}

      {/* Connection Line */}
      {pts.length > 0 && (
        <path d={pathD} stroke="url(#lineGrad)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Nodes & Tooltips */}
      {pts.map((p) => (
        <g key={p.exam} className="group">
          {/* Hover indicator lines */}
          <line x1={p.x} y1={paddingY} x2={p.x} y2={height - paddingY} stroke="white" strokeWidth={1} strokeDasharray="2 2" className="opacity-0 group-hover:opacity-10 transition-opacity" />

          {/* Point Dot */}
          <circle cx={p.x} cy={p.y} r={6} className="fill-emerald-500 stroke-slate-950 stroke-2 hover:r-8 transition-all duration-300 cursor-pointer" />
          <circle cx={p.x} cy={p.y} r={12} className="stroke-emerald-400/40 fill-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Invisible large overlay circle for easy hovering */}
          <circle cx={p.x} cy={p.y} r={20} className="fill-transparent stroke-none cursor-pointer" />

          {/* Score Tooltip bubble */}
          <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <rect x={p.x - 22} y={p.y - 32} width={44} height={22} rx={6} className="fill-slate-950 stroke-slate-800 shadow-xl" />
            <text x={p.x} y={p.y - 17} fill="white" textAnchor="middle" className="font-bold text-[10px] fill-emerald-400">{p.avg}%</text>
          </g>

          {/* X Label */}
          <text x={p.x} y={height - paddingY + 18} fill="currentColor" stroke="none" textAnchor="middle" className="fill-slate-400 font-bold uppercase tracking-wider text-[8px]">
            {p.exam}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default function PerformancePage() {
  const { parentId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();

  const [subjects, setSubjects]   = useState<SubjectMark[]>([]);
  const [rawMarks, setRawMarks]   = useState<RawMark[]>([]);
  const [years, setYears]         = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [examTypes, setExamTypes] = useState<string[]>([]);
  
  const [summaryData, setSummaryData] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading]     = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [langMode, setLangMode]   = useState<"en" | "ta">("en");

  // Filters for detailed records
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("");
  const [selectedExamFilter, setSelectedExamFilter]       = useState<string>("");
  const [sortByFilter, setSortByFilter]                   = useState<string>("term");

  const fetchPerformance = useCallback(async (child: Child, year?: string) => {
    if (!parentId) return;
    setLoading(true);
    setSummaryLoading(true);
    try {
      const perfUrl = `${getApiBase()}/api/parent/${parentId}/child/${child.studentId}/performance${year ? `?academicYear=${year}` : ""}`;
      const summaryUrl = `${getApiBase()}/api/parent/${parentId}/child/${child.studentId}/performance-summary`;
      
      const [perfRes, sumRes] = await Promise.all([
        fetch(perfUrl),
        fetch(summaryUrl)
      ]);
      
      const perfJson = await perfRes.json();
      const sumJson  = await sumRes.json();
      
      if (perfJson.success) {
        setSubjects(perfJson.data.subjects);
        setRawMarks(perfJson.data.rawMarks);
        setYears(perfJson.data.availableYears);
        if (!year && perfJson.data.availableYears.length > 0) {
          setSelectedYear(perfJson.data.availableYears[perfJson.data.availableYears.length - 1]);
        }
        if (perfJson.data.subjects.length > 0) {
          setExamTypes(Object.keys(perfJson.data.subjects[0]).filter(k => k !== "subject"));
        }
      }

      if (sumJson.success) {
        setSummaryData(sumJson.data);
      } else {
        setSummaryData(null);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally { 
      setLoading(false); 
      setSummaryLoading(false);
    }
  }, [parentId]);

  useEffect(() => { 
    if (activeChild) fetchPerformance(activeChild); 
  }, [activeChild, fetchPerformance]);

  // Compute calculated metrics
  const avgPct = rawMarks.length > 0
    ? Math.round(rawMarks.reduce((s, m) => s + (m.scored / m.maxMarks) * 100, 0) / rawMarks.length)
    : 0;

  const topSubject = subjects.reduce((best, s) => {
    const avg = examTypes.reduce((sum, et) => sum + (Number(s[et]) || 0), 0) / (examTypes.length || 1);
    const bestAvg = examTypes.reduce((sum, et) => sum + (Number((best as any)[et]) || 0), 0) / (examTypes.length || 1);
    return avg > bestAvg ? s : best;
  }, subjects[0] ?? {});

  const lowestSubject = subjects.reduce((low, s) => {
    const avg = examTypes.reduce((sum, et) => sum + (Number(s[et]) || 0), 0) / (examTypes.length || 1);
    const lowAvg = examTypes.reduce((sum, et) => sum + (Number((low as any)[et]) || 0), 0) / (examTypes.length || 1);
    return avg < lowAvg ? s : low;
  }, subjects[0] ?? {});

  // Compute subject list averages for dynamic chart
  const chartSubjectAvgs = subjects.map((s, idx) => {
    const vals = examTypes.map(et => Number(s[et]) || 0);
    const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return { subject: s.subject, avg };
  }).sort((a, b) => b.avg - a.avg);

  // Group trend details chronologically
  const examOrder = ["unit", "mid", "quarter", "half", "annual", "board", "term", "final"];
  const sortedExamTypes = [...examTypes].sort((a, b) => {
    const aIdx = examOrder.findIndex(o => a.toLowerCase().includes(o));
    const bIdx = examOrder.findIndex(o => b.toLowerCase().includes(o));
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  const trendPoints = sortedExamTypes.map(et => {
    let sum = 0;
    let count = 0;
    for (const s of subjects) {
      if (s[et] !== undefined && s[et] !== null && s[et] !== "—") {
        sum += Number(s[et]);
        count++;
      }
    }
    return {
      exam: et,
      avg: count > 0 ? Math.round(sum / count) : 0
    };
  }).filter(pt => pt.avg > 0);

  return (
    <PortalLayout>
      {/* sibling selector */}
      <ChildSwitcher childList={children} active={activeChild} onChange={setActiveChild} />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "Overall Average", value: summaryData ? `${summaryData.overallAvg}%` : `${avgPct}%`, icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
          { label: "Academic Grade", value: (summaryData ? summaryData.overallAvg : avgPct) >= 90 ? "A+" : (summaryData ? summaryData.overallAvg : avgPct) >= 75 ? "A" : (summaryData ? summaryData.overallAvg : avgPct) >= 60 ? "B" : (summaryData ? summaryData.overallAvg : avgPct) >= 50 ? "C" : "D", icon: <Award className="w-5 h-5 text-amber-400" />, color: "text-amber-400" },
          { label: "Best Subject", value: (topSubject as any)?.subject?.split(" ")[0] ?? "—", icon: <BookOpen className="w-5 h-5 text-blue-400" />, color: "text-blue-400" },
          { label: "Needs Attention", value: (lowestSubject as any)?.subject?.split(" ")[0] ?? "—", icon: <AlertTriangle className="w-5 h-5 text-rose-400" />, color: "text-rose-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card flex flex-col items-center justify-center text-center p-4 glass rounded-2xl hover:scale-[1.02] transition-all duration-300 gap-3">
            <div className="flex flex-col items-center text-center w-full">
              <div className="text-xs text-slate-500 font-semibold mb-1 text-center">{k.label}</div>
              {loading || childrenLoading
                ? <div className="h-7 w-16 bg-slate-700/60 rounded animate-pulse mx-auto" />
                : <div className={`text-2xl font-black tracking-tight text-center ${k.color}`}>{k.value}</div>
              }
            </div>
            <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-center">{k.icon}</div>
          </div>
        ))}
      </div>

      {/* Year Selector row */}
      {years.length > 1 && (
        <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-slate-900/30 w-fit">
          <span className="text-xs text-slate-400 font-medium px-2">Academic Year:</span>
          {years.map(y => (
            <button key={y} onClick={() => { setSelectedYear(y); if (activeChild) fetchPerformance(activeChild, y); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedYear === y ? "bg-emerald-600 text-white shadow" : "bg-slate-800/80 text-slate-400 hover:bg-slate-700"}`}>
              {y}
            </button>
          ))}
        </div>
      )}

      {/* AI Counselor Summary Section */}
      <div className="grid grid-cols-1 gap-6 mb-6 fade-in-2">
        <div className="glass rounded-3xl p-6 border border-emerald-500/10 relative overflow-hidden bg-slate-50 dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20">
          {/* decoration background */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">AI Performance Counseling Summary</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Smart insights and home advisory by TN-Schools AI</p>
              </div>
            </div>

            {/* Language toggle selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-bold">
              <Languages className="w-3.5 h-3.5 ml-1 text-slate-400" />
              <button onClick={() => setLangMode("en")} className={`px-2 py-1 rounded-lg font-bold transition-all ${langMode === "en" ? "bg-emerald-600 text-white shadow" : "hover:text-slate-800 dark:hover:text-slate-200"}`}>
                English
              </button>
              <button onClick={() => setLangMode("ta")} className={`px-2 py-1 rounded-lg font-bold transition-all ${langMode === "ta" ? "bg-emerald-600 text-white shadow" : "hover:text-slate-800 dark:hover:text-slate-200"}`}>
                தமிழ்
              </button>
            </div>
          </div>

          {summaryLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-800/80 rounded w-11/12" />
              <div className="h-4 bg-slate-800/80 rounded w-10/12" />
              <div className="h-4 bg-slate-800/80 rounded w-8/12" />
              <div className="pt-2 space-y-2">
                <div className="h-3 bg-slate-800/80 rounded w-1/3" />
                <div className="h-3 bg-slate-800/80 rounded w-3/4" />
                <div className="h-3 bg-slate-800/80 rounded w-2/3" />
              </div>
            </div>
          ) : summaryData ? (
            <div>
              {/* Summary paragraph */}
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-5 font-medium italic">
                "{langMode === "en" ? summaryData.aiSummary : summaryData.tamilSummary}"
              </p>

              {/* Tips cards for parents */}
              <div className="border-t border-slate-200 dark:border-slate-800/60 pt-4">
                <h4 className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 
                  {langMode === "en" ? "Home Parenting Action Tips" : "வீட்டில் செய்ய வேண்டிய கல்விப் பரிந்துரைகள்"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(langMode === "en" ? summaryData.aiTips : summaryData.tamilTips).map((tip, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                      <div className="flex gap-2">
                        <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0">{idx + 1}</span>
                        <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">
              Insufficient performance data to build counseling summary. Record more test marks to load.
            </div>
          )}
        </div>
      </div>

      {/* SVG Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 fade-in-3">
        {/* Subject performance */}
        <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800/60 flex flex-col justify-between">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Subject-wise Performance (Averages)
            </h3>
            <p className="text-[10px] text-slate-500">Student score percentages aggregated across all exams</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {loading ? (
              <div className="w-full space-y-4 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
              </div>
            ) : (
              <SubjectBarChart data={chartSubjectAvgs} />
            )}
          </div>
        </div>

        {/* Academic progression trends */}
        <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800/60 flex flex-col justify-between">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Academic Progression Trends
            </h3>
            <p className="text-[10px] text-slate-550 dark:text-slate-500">Exam-wise growth indicators tracking overall scores</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {loading ? (
              <div className="w-full h-48 bg-slate-800 rounded-2xl animate-pulse" />
            ) : (
              <AcademicTrendsChart points={trendPoints} />
            )}
          </div>
        </div>
      </div>

      {/* Strengths & Weak Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 fade-in-4">
        {/* Strengths */}
        <div className="glass rounded-3xl p-6 border border-emerald-500/15 bg-emerald-50/20 dark:bg-emerald-955/5">
          <div className="border-b border-slate-205 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Key Strengths & Bright Spots</h3>
          </div>
          <ul className="space-y-2.5">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-8 bg-slate-205 dark:bg-slate-800 rounded-xl animate-pulse" />)
            ) : summaryData && summaryData.strengths.length > 0 ? (
              summaryData.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl">
                  <span className="text-emerald-500 dark:text-emerald-400 text-sm mt-0.5">🌟</span>
                  <span className="text-xs text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{str}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic py-2">No special performance strengths flagged yet.</li>
            )}
          </ul>
        </div>

        {/* Weak Areas */}
        <div className="glass rounded-3xl p-6 border border-amber-500/15 bg-amber-50/20 dark:bg-amber-955/5">
          <div className="border-b border-slate-205 dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-505 dark:text-amber-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Areas for Focus & Improvement</h3>
          </div>
          <ul className="space-y-2.5">
            {loading ? (
              [1, 2].map(i => <div key={i} className="h-8 bg-slate-205 dark:bg-slate-800 rounded-xl animate-pulse" />)
            ) : summaryData && summaryData.weaknesses.length > 0 ? (
              summaryData.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl">
                  <span className="text-amber-505 dark:text-amber-400 text-sm mt-0.5">⚠️</span>
                  <span className="text-xs text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{weak}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic py-2">All parameters are currently stabilized. Good progress!</li>
            )}
          </ul>
        </div>
      </div>

      {/* Teacher Feedback Timeline */}
      <div className="glass rounded-3xl p-6 mb-6 border border-slate-200 dark:border-slate-800/60 fade-in-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Recent Teacher Remarks & Feedback
          </h3>
          <p className="text-[10px] text-slate-550 dark:text-slate-550">Mentorship notes and homework comments from school teachers</p>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-slate-205 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 bg-slate-205 dark:bg-slate-800 rounded-xl" />
          </div>
        ) : summaryData && summaryData.feedbacks.length > 0 ? (
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
            {summaryData.feedbacks.slice(0, 5).map((f, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 group-hover:scale-125 transition-all" />
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-955/60 border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-800 transition-all">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {f.source}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3" /> {f.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                    "{f.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            No remarks from teachers logged yet.
          </div>
        )}
      </div>

      {/* Subject Marks Table */}
      <div className="glass rounded-3xl p-6 mb-6 border border-slate-205 dark:border-slate-800/60 fade-in-2">
        <div className="border-b border-slate-205 dark:border-slate-800 pb-3 mb-5">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Complete Subject-wise Mark Sheet
          </h2>
          <p className="text-[10px] text-slate-555 dark:text-slate-550">Consolidated score percentages per subject for the active year</p>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />)}</div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No marks recorded yet{activeChild ? ` for ${activeChild.name}` : ""}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="w-44" style={{ textAlign: "left" }}>Subject</th>
                  {sortedExamTypes.map(et => (
                    <th key={et} style={{ textAlign: "center" }}>{et}</th>
                  ))}
                  <th style={{ textAlign: "center" }}>Avg %</th>
                  <th className="w-36" style={{ textAlign: "left" }}>Progress</th>
                  <th style={{ textAlign: "center" }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, idx) => {
                  const color = COLORS[idx % COLORS.length];
                  // Use sortedExamTypes for chronological order (Quarterly -> Half-Yearly -> Annual)
                  const vals = sortedExamTypes.map(et => Number(s[et]) || 0);
                  const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
                  
                  // For trend comparison (last exam vs previous exam)
                  const last = vals[vals.length - 1] ?? 0;
                  const prev = vals[vals.length - 2] ?? last;
                  return (
                    <tr key={s.subject}>
                      <td className="font-semibold text-slate-800 dark:text-slate-100" style={{ borderLeft: `3px solid ${color}`, textAlign: "left" }}>
                        <span className="pl-3">{s.subject}</span>
                      </td>
                      {sortedExamTypes.map(et => (
                        <td key={et} style={{ textAlign: "center" }}>
                          <span className={`font-bold ${Number(s[et]) >= 75 ? "text-emerald-400" : Number(s[et]) >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                            {s[et] ?? "—"}
                          </span>
                        </td>
                      ))}
                      <td className="font-extrabold text-blue-400" style={{ textAlign: "center" }}>{avg}%</td>
                      <td className="w-36" style={{ textAlign: "left" }}><ScoreBar scored={avg} maxMarks={100} color={color} /></td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge ${last >= prev ? "badge-green" : "badge-red"} font-semibold text-[10px]`}>
                          {last >= prev ? "↑ Up" : "↓ Down"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Raw Marks */}
      {rawMarks.length > 0 && (() => {
        const uniqueSubjects = Array.from(new Set(rawMarks.map(m => m.subject))).sort();
        const uniqueExams = Array.from(new Set(rawMarks.map(m => m.examType))).sort();

        const filteredMarks = rawMarks
          .filter(m => {
            const matchSubject = selectedSubjectFilter === "" || m.subject === selectedSubjectFilter;
            const matchExam = selectedExamFilter === "" || m.examType === selectedExamFilter;
            return matchSubject && matchExam;
          })
          .sort((a, b) => {
            if (sortByFilter === "score-desc") {
              return (b.scored / b.maxMarks) - (a.scored / a.maxMarks);
            }
            if (sortByFilter === "score-asc") {
              return (a.scored / a.maxMarks) - (b.scored / b.maxMarks);
            }
            const aIdx = sortedExamTypes.indexOf(a.examType);
            const bIdx = sortedExamTypes.indexOf(b.examType);
            if (aIdx === -1 && bIdx === -1) return a.subject.localeCompare(b.subject);
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx || a.subject.localeCompare(b.subject);
          });

        return (
          <div className="glass rounded-3xl p-6 border border-slate-205 dark:border-slate-800/60 fade-in-4">
            <div className="border-b border-slate-205 dark:border-slate-800 pb-3 mb-5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Detailed Exam Records
                </h2>
                <p className="text-[10px] text-slate-555 dark:text-slate-550">Granular exam listings and maximum grading reference</p>
              </div>
            </div>

            {/* Filter Base Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-205 dark:border-slate-800/50">
              <div className="flex flex-wrap items-center gap-4">
                {/* Subject Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-550 font-extrabold uppercase tracking-wider">Subject</span>
                  <select 
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-705 dark:text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="">All Subjects</option>
                    {uniqueSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Exam Type Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-555 font-extrabold uppercase tracking-wider">Exam Type</span>
                  <select 
                    value={selectedExamFilter}
                    onChange={(e) => setSelectedExamFilter(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-705 dark:text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="">All Exam Types</option>
                    {uniqueExams.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort controls */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-555 font-extrabold uppercase tracking-wider">Sort By</span>
                <select 
                  value={sortByFilter}
                  onChange={(e) => setSortByFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-705 dark:text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="term">Term Sequence</option>
                  <option value="score-desc">Score: High to Low</option>
                  <option value="score-asc">Score: Low to High</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredMarks.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs italic">
                  No records matching the selected filter criteria.
                </div>
              ) : (
                <table className="data-table w-full min-w-[700px]">
                  <thead>
                    <tr>
                      <th className="text-left">Subject</th>
                      <th className="text-left">Exam Type</th>
                      <th className="text-center">Scored</th>
                      <th className="text-center">Max Marks</th>
                      <th className="text-center">Percentage</th>
                      <th className="text-center">Grade</th>
                      <th className="text-center">Academic Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarks.map(m => {
                      const pct = Math.round((m.scored / m.maxMarks) * 100);
                      return (
                        <tr key={m.id}>
                          <td className="font-semibold text-slate-800 dark:text-slate-100 text-left">{m.subject}</td>
                          <td className="text-left"><span className="badge badge-blue text-[10px] font-semibold">{m.examType}</span></td>
                          <td className="font-extrabold text-emerald-400 text-center">{m.scored}</td>
                          <td className="text-slate-400 text-center font-medium">{m.maxMarks}</td>
                          <td className={`font-extrabold text-center ${pct >= 75 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-rose-400"}`}>{pct}%</td>
                          <td className="text-center"><span className="badge badge-green text-[10px] font-semibold">{m.grade ?? "—"}</span></td>
                          <td className="text-slate-400 text-xs text-center font-medium">{m.academicYear}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })()}
    </PortalLayout>
  );
}
