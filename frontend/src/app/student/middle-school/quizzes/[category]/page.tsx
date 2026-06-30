"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useParams } from "next/navigation";

const categoryData: Record<string, any> = {
  "science-(அறிவியல்)": { 
    name: "Science (அறிவியல்)", icon: "🔬", color: "from-blue-500 to-indigo-600", desc: "Physics, Chemistry, and Biology fundamentals for standard 6 to 8.",
    quizzes: [
      { id: "q1", title: "States of Matter", time: "5 Mins", difficulty: "Easy", reward: "+50 XP", played: true, score: "100%" },
      { id: "q2", title: "Human Body Systems", time: "10 Mins", difficulty: "Hard", reward: "+150 XP", played: false, score: null },
      { id: "q3", title: "Light & Sound", time: "8 Mins", difficulty: "Medium", reward: "+100 XP", played: false, score: null },
    ]
  },
  "math-(கணிதம்)": { 
    name: "Math (கணிதம்)", icon: "📐", color: "from-emerald-500 to-teal-600", desc: "Algebra, Geometry, and Number systems for standard 6 to 8.",
    quizzes: [
      { id: "q1", title: "Fractions & Decimals", time: "5 Mins", difficulty: "Easy", reward: "+50 XP", played: true, score: "100%" },
      { id: "q2", title: "Algebraic Expressions", time: "10 Mins", difficulty: "Hard", reward: "+150 XP", played: false, score: null },
      { id: "q3", title: "Geometry Basics", time: "8 Mins", difficulty: "Medium", reward: "+100 XP", played: false, score: null },
    ]
  },
  "social-science": { 
    name: "Social Science", icon: "🌍", color: "from-amber-500 to-orange-600", desc: "History, Geography, and Civics for standard 6 to 8.",
    quizzes: [
      { id: "q1", title: "Indus Valley Civilization", time: "5 Mins", difficulty: "Easy", reward: "+50 XP", played: true, score: "100%" },
      { id: "q2", title: "Earth and Solar System", time: "10 Mins", difficulty: "Hard", reward: "+150 XP", played: false, score: null },
      { id: "q3", title: "Indian Constitution", time: "8 Mins", difficulty: "Medium", reward: "+100 XP", played: false, score: null },
    ]
  },
  "tamil-&-english": { 
    name: "Tamil & English", icon: "📖", color: "from-purple-500 to-pink-600", desc: "Grammar, Vocabulary, and Literature for standard 6 to 8.",
    quizzes: [
      { id: "q1", title: "Tenses & Verbs", time: "5 Mins", difficulty: "Easy", reward: "+50 XP", played: true, score: "100%" },
      { id: "q2", title: "Thirukkural Meanings", time: "10 Mins", difficulty: "Hard", reward: "+150 XP", played: false, score: null },
      { id: "q3", title: "Synonyms & Antonyms", time: "8 Mins", difficulty: "Medium", reward: "+100 XP", played: false, score: null },
    ]
  },
};

export default function QuizCategoryPage() {
  const params = useParams();
  const slug = decodeURIComponent(params?.category as string);
  const category = categoryData[slug] || categoryData["science-(அறிவியல்)"];
  const quizzesList = category.quizzes;

  return (
    <PortalLayout
      title={category.name}
      subtitle={category.desc}
      avatarLetter="A"
      avatarColor="#10b981"
      themeClass="theme-student"
      accentColor="#10b981"
    >
      <div className="mb-6 flex items-center justify-between">
         <Link href="/student/middle-school/quizzes" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <span>←</span> Back to Arcade
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <div className={`glass rounded-3xl p-6 border border-slate-700/50 bg-gradient-to-br ${category.color} relative overflow-hidden flex flex-col items-center text-center`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
              <div className="text-7xl mb-4 drop-shadow-xl">{category.icon}</div>
              <h2 className="text-2xl font-black text-white mb-2">{category.name}</h2>
              <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden mt-4">
                 <div className="bg-white h-full rounded-full" style={{ width: '33%' }}></div>
              </div>
              <p className="text-[10px] uppercase font-bold text-white/80 mt-2">1 of 3 Completed</p>
           </div>
        </div>

        {/* Quizzes List */}
        <div className="lg:col-span-3 space-y-4">
           {quizzesList.map((quiz: any) => (
             <div key={quiz.id} className="glass rounded-3xl p-6 border border-slate-700/50 hover:border-slate-500 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                      {quiz.played && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Completed</span>}
                   </div>
                   <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1">⏱️ {quiz.time}</span>
                      <span className="flex items-center gap-1">⚡ {quiz.difficulty}</span>
                      <span className="flex items-center gap-1 text-amber-400">🏆 {quiz.reward}</span>
                   </div>
                </div>
                
                <div className="shrink-0 flex items-center gap-4">
                   {quiz.played ? (
                     <div className="text-right">
                       <span className="block text-[10px] text-slate-500 font-bold uppercase">Best Score</span>
                       <span className="block text-2xl font-black text-white">{quiz.score}</span>
                     </div>
                   ) : (
                     <Link 
                       href={`/student/middle-school/quizzes/${slug}/${quiz.id}`}
                       className={`px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r ${category.color} hover:brightness-110`}
                     >
                       Play Now
                     </Link>
                   )}
                </div>
             </div>
           ))}
        </div>

      </div>
    </PortalLayout>
  );
}
