// "use client";

// import PortalLayout from "@/components/PortalLayout";
// import Link from "next/link";
// import { useState } from "react";

// const quizCategories = [
//   { name: "Science Space", icon: "🚀", color: "from-blue-500 to-indigo-600", active: 4, completed: 12 },
//   { name: "Math Puzzles", icon: "🧩", color: "from-emerald-500 to-teal-600", active: 2, completed: 8 },
//   { name: "History Quest", icon: "👑", color: "from-amber-500 to-orange-600", active: 5, completed: 15 },
//   { name: "Word Master", icon: "📚", color: "from-purple-500 to-pink-600", active: 3, completed: 10 },
// ];

// const dailyChallenges = [
//   { title: "Solar System Speed Run", category: "Science", reward: "+50 XP", difficulty: "Medium", timeLimit: "5 mins", color: "text-blue-400", bgBorder: "border-blue-500/30" },
//   { title: "Fractions Ninja", category: "Math", reward: "+75 XP", difficulty: "Hard", timeLimit: "10 mins", color: "text-emerald-400", bgBorder: "border-emerald-500/30" },
// ];

// const recentBadges = [
//   { name: "Science Whiz", icon: "🔬", date: "Today" },
//   { name: "7-Day Streak", icon: "🔥", date: "Yesterday" },
//   { name: "Perfect Score", icon: "🌟", date: "Oct 15" },
// ];

// export default function FunQuizzesPage() {
//   const [activeTab, setActiveTab] = useState("all");

//   return (
//     <PortalLayout
//       title="Fun Quizzes Arcade"
//       subtitle="Play games, earn XP, and level up your knowledge!"
//       avatarLetter="A"
//       avatarColor="#10b981"
//       themeClass="theme-student"
//       accentColor="#10b981"
//     >
//       <div className="mb-6 flex items-center justify-between">
//          <Link href="/student/middle-school" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
//             <span>←</span> Back to Dashboard
//          </Link>
         
//          {/* Gamification Stats */}
//          <div className="flex gap-3">
//             <div className="bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/10">
//                <span className="text-xl">🔥</span>
//                <div>
//                   <span className="block text-[10px] uppercase font-bold text-amber-500 leading-none">Streak</span>
//                   <span className="block text-sm font-black text-white leading-none mt-1">12 Days</span>
//                </div>
//             </div>
//             <div className="bg-slate-900/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10">
//                <span className="text-xl">⭐</span>
//                <div>
//                   <span className="block text-[10px] uppercase font-bold text-emerald-500 leading-none">Total XP</span>
//                   <span className="block text-sm font-black text-white leading-none mt-1">4,250</span>
//                </div>
//             </div>
//          </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Left Column */}
//         <div className="lg:col-span-2 space-y-6">
           
//            {/* Daily Challenges Hero */}
//            <div className="glass rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 relative overflow-hidden">
//              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>
//              <div className="absolute bottom-0 right-10 text-9xl opacity-10 rotate-12 pointer-events-none">🎮</div>
             
//              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2 relative z-10">
//                <span className="text-3xl">🎯</span> Daily Challenges
//              </h2>

//              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
//                {dailyChallenges.map((challenge, idx) => (
//                  <div key={idx} className={`bg-slate-900/80 p-5 rounded-2xl border ${challenge.bgBorder} hover:-translate-y-1 transition-transform cursor-pointer group`}>
//                     <div className="flex justify-between items-start mb-3">
//                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-1 bg-slate-800 rounded-md ${challenge.color}`}>
//                          {challenge.category}
//                        </span>
//                        <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
//                          {challenge.reward}
//                        </span>
//                     </div>
//                     <h3 className="text-lg font-bold text-white mb-2">{challenge.title}</h3>
//                     <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
//                        <span className="flex items-center gap-1"><span>⏱️</span> {challenge.timeLimit}</span>
//                        <span className="flex items-center gap-1"><span>⚡</span> {challenge.difficulty}</span>
//                     </div>
//                     <Link 
//                       href={`/student/middle-school/quizzes/${challenge.category.toLowerCase().replace(" ", "-")}/daily`}
//                       className={`block text-center w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r ${challenge.category === 'Science' ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'} hover:brightness-110`}
//                     >
//                       Play Now
//                     </Link>
//                  </div>
//                ))}
//              </div>
//            </div>

//            {/* Quiz Categories Grid */}
//            <div className="glass rounded-3xl p-6 border border-slate-700/50">
//              <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
//                   <span className="text-xl">📚</span> Explore Topics
//                 </h2>
//                 <div className="flex gap-2">
//                    <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">←</button>
//                    <button className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">→</button>
//                 </div>
//              </div>

//              <div className="grid grid-cols-2 gap-4">
//                 {quizCategories.map((cat, idx) => (
//                   <Link 
//                     href={`/student/middle-school/quizzes/${cat.name.toLowerCase().replace(" ", "-")}`}
//                     key={idx} 
//                     className="block bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-500 transition-all cursor-pointer group"
//                   >
//                      <div className="flex items-center gap-4 mb-4">
//                         <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform origin-bottom-left`}>
//                            {cat.icon}
//                         </div>
//                         <div>
//                            <h3 className="font-bold text-white text-lg leading-tight">{cat.name}</h3>
//                            <p className="text-xs text-slate-400 font-medium mt-1">{cat.active} New Quizzes</p>
//                         </div>
//                      </div>
//                      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
//                         <div className={`bg-gradient-to-r ${cat.color} h-1.5 rounded-full`} style={{ width: `${(cat.completed / (cat.completed + cat.active)) * 100}%` }}></div>
//                      </div>
//                      <div className="text-[10px] text-right font-bold text-slate-500 uppercase tracking-wider">{cat.completed} Completed</div>
//                   </Link>
//                 ))}
//              </div>
//            </div>

//         </div>

//         {/* Right Column */}
//         <div className="space-y-6">
           
//            {/* Player Profile & Level */}
//            <div className="glass rounded-3xl p-6 border border-slate-700/50 text-center relative overflow-hidden">
//               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
              
//               <div className="relative inline-block mb-4">
//                  <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-700 mx-auto overflow-hidden">
//                     {/* Placeholder Avatar Image */}
//                     <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl">👦🏽</div>
//                  </div>
//                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-lg">
//                     Lv. 14
//                  </div>
//               </div>
              
//               <h3 className="font-black text-xl text-white mb-1">Arjun K.</h3>
//               <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-6">Quiz Master Rank</p>
              
//               <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
//                  <div className="flex justify-between text-xs font-bold mb-2">
//                     <span className="text-slate-400">Level 14 Progress</span>
//                     <span className="text-white">4,250 / 5,000 XP</span>
//                  </div>
//                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
//                     <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[85%] relative">
//                        <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/40 to-transparent"></div>
//                     </div>
//                  </div>
//                  <p className="text-[10px] text-slate-500 mt-2">Just 750 XP to reach Level 15!</p>
//               </div>
//            </div>

//            {/* Badge Cabinet */}
//            <div className="glass rounded-3xl p-6 border border-slate-700/50">
//              <div className="flex items-center justify-between mb-4">
//                <h2 className="text-lg font-bold text-white flex items-center gap-2">
//                  <span className="text-xl">🏅</span> Recent Badges
//                </h2>
//                <Link href="/student/middle-school/badges" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">View All</Link>
//              </div>
             
//              <div className="grid grid-cols-3 gap-2">
//                 {recentBadges.map((badge, idx) => (
//                   <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-amber-500/50 hover:bg-slate-800 transition-all">
//                      <div className="text-3xl mb-2 group-hover:-translate-y-1 group-hover:scale-110 transition-transform drop-shadow-lg filter">{badge.icon}</div>
//                      <span className="text-[10px] font-bold text-white leading-tight mb-1">{badge.name}</span>
//                      <span className="text-[8px] uppercase text-slate-500">{badge.date}</span>
//                   </div>
//                 ))}
//              </div>
//            </div>

//            {/* AI Multiplayer Teaser */}
//            <div className="glass rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-br from-indigo-900/30 to-transparent">
//               <h3 className="font-bold text-white mb-2 flex items-center gap-2">
//                 <span className="text-xl">🤖</span> Challenge the AI
//               </h3>
//               <p className="text-xs text-slate-400 mb-4 leading-relaxed">Think you're fast? Race against our AI tutor in a rapid-fire quiz battle to earn double XP!</p>
//               <Link href="/student/middle-school/quizzes/ai-battle" className="block text-center w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
//                 Start AI Battle →
//               </Link>
//            </div>

//         </div>

//       </div>
//     </PortalLayout>
//   );
// }

"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState } from "react";

const quizCategories = [
  { name: "Science (அறிவியல்)", icon: "🔬", color: "from-blue-500 to-indigo-600", active: 5, completed: 10 },
  { name: "Math (கணிதம்)", icon: "📐", color: "from-emerald-500 to-teal-600", active: 4, completed: 8 },
  { name: "Social Science", icon: "🌍", color: "from-amber-500 to-orange-600", active: 3, completed: 15 },
  { name: "Tamil & English", icon: "📖", color: "from-purple-500 to-pink-600", active: 6, completed: 12 },
];

const dailyRotations = [
  // Sunday
  [
    { title: "Solar System Speed Run (சூரிய குடும்பம்)", category: "Science", reward: "+50 XP", difficulty: "Easy", timeLimit: "4 mins", color: "text-blue-650 dark:text-blue-400", bgBorder: "border-blue-500/30" },
    { title: "Decimal Division Quest (தசம வகுத்தல்)", category: "Math", reward: "+75 XP", difficulty: "Medium", timeLimit: "8 mins", color: "text-emerald-650 dark:text-emerald-400", bgBorder: "border-emerald-500/30" }
  ],
  // Monday
  [
    { title: "Ohm's Law Explorer (மின்னோட்டம்)", category: "Science", reward: "+60 XP", difficulty: "Medium", timeLimit: "6 mins", color: "text-blue-650 dark:text-blue-400", bgBorder: "border-blue-500/30" },
    { title: "Fractions Master (பின்னங்கள்)", category: "Math", reward: "+40 XP", difficulty: "Easy", timeLimit: "5 mins", color: "text-emerald-650 dark:text-emerald-400", bgBorder: "border-emerald-500/30" }
  ],
  // Tuesday
  [
    { title: "Indus Valley Secrets (சிந்துவெளி நாகரிகம்)", category: "Social", reward: "+70 XP", difficulty: "Hard", timeLimit: "10 mins", color: "text-amber-650 dark:text-amber-400", bgBorder: "border-amber-500/30" },
    { title: "Bilingual Synonyms Race (இணைச்சொற்கள்)", category: "Languages", reward: "+50 XP", difficulty: "Easy", timeLimit: "5 mins", color: "text-purple-650 dark:text-purple-400", bgBorder: "border-purple-500/30" }
  ],
  // Wednesday
  [
    { title: "Cell Structure Quiz (செல் அமைப்பு)", category: "Science", reward: "+80 XP", difficulty: "Hard", timeLimit: "12 mins", color: "text-blue-650 dark:text-blue-400", bgBorder: "border-blue-500/30" },
    { title: "Algebra Sprint (இயற்கணிதம்)", category: "Math", reward: "+50 XP", difficulty: "Medium", timeLimit: "7 mins", color: "text-emerald-650 dark:text-emerald-400", bgBorder: "border-emerald-500/30" }
  ],
  // Thursday
  [
    { title: "Brave Tamil Kings (தமிழ் மன்னர்கள்)", category: "Social", reward: "+75 XP", difficulty: "Medium", timeLimit: "8 mins", color: "text-amber-650 dark:text-amber-400", bgBorder: "border-amber-500/30" },
    { title: "English Grammar Mastery (இலக்கணம்)", category: "Languages", reward: "+40 XP", difficulty: "Easy", timeLimit: "5 mins", color: "text-purple-650 dark:text-purple-400", bgBorder: "border-purple-500/30" }
  ],
  // Friday
  [
    { title: "Force and Motion (விசை மற்றும் இயக்கம்)", category: "Science", reward: "+60 XP", difficulty: "Medium", timeLimit: "6 mins", color: "text-blue-650 dark:text-blue-400", bgBorder: "border-blue-500/30" },
    { title: "Percentage Power Up (சதவீதம்)", category: "Math", reward: "+70 XP", difficulty: "Hard", timeLimit: "9 mins", color: "text-emerald-650 dark:text-emerald-400", bgBorder: "border-emerald-500/30" }
  ],
  // Saturday
  [
    { title: "Indian Freedom Struggle (விடுதலைப் போராட்டம்)", category: "Social", reward: "+90 XP", difficulty: "Hard", timeLimit: "15 mins", color: "text-amber-650 dark:text-amber-400", bgBorder: "border-amber-500/30" },
    { title: "Sentence Transformation (வாக்கியம்)", category: "Languages", reward: "+50 XP", difficulty: "Medium", timeLimit: "6 mins", color: "text-purple-650 dark:text-purple-400", bgBorder: "border-purple-500/30" }
  ]
];

const recentBadges = [
  { name: "Science Whiz", icon: "🔬", date: "Today" },
  { name: "7-Day Streak", icon: "🔥", date: "Yesterday" },
  { name: "Perfect Score", icon: "🌟", date: "Oct 15" },
];

export default function FunQuizzesPage() {
  const [activeTab, setActiveTab] = useState("all");

  const dayOfWeek = new Date().getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayNamesTa = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];
  
  const dailyChallenges = dailyRotations[dayOfWeek];
  const currentDayName = dayNames[dayOfWeek];
  const currentDayNameTa = dayNamesTa[dayOfWeek];

  return (
    <PortalLayout
      title="Fun Quizzes Arcade"
      subtitle="Play games, earn XP, and level up your knowledge!"
      avatarLetter="A"
      avatarColor="#10b981"
      themeClass="theme-student"
      accentColor="#10b981"
    >
      <div className="mb-6 flex items-center justify-between">
         <Link href="/student/middle-school" className="text-sm font-bold text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 transition-colors">
            <span>←</span> Back to Dashboard
         </Link>
         
         {/* Gamification Stats */}
         <div className="flex gap-3">
            <div className="bg-white dark:bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/10">
               <span className="text-xl">🔥</span>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500 leading-none">Streak</span>
                  <span className="block text-sm font-black text-black dark:text-white leading-none mt-1">12 Days</span>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10">
               <span className="text-xl">⭐</span>
               <div>
                  <span className="block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-500 leading-none">Total XP</span>
                  <span className="block text-sm font-black text-black dark:text-white leading-none mt-1">4,250</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Daily Challenges Hero */}
           <div className="glass rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>
             <div className="absolute bottom-0 right-10 text-9xl opacity-10 rotate-12 pointer-events-none">🎮</div>
             
              <h2 className="text-2xl font-black text-black dark:text-white mb-2 flex items-center gap-2 relative z-10">
                <span className="text-3xl">🎯</span> Daily Challenges
              </h2>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-6 relative z-10">
                📅 Today is {currentDayName} ({currentDayNameTa}) — Complete today's puzzles to extend your streak!
              </p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
               {dailyChallenges.map((challenge, idx) => (
                 <div key={idx} className={`bg-white dark:bg-slate-900/80 p-5 rounded-2xl border ${challenge.bgBorder} hover:-translate-y-1 transition-transform cursor-pointer group`}>
                    <div className="flex justify-between items-start mb-3">
                       <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md ${challenge.color}`}>
                         {challenge.category}
                       </span>
                       <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                         {challenge.reward}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2">{challenge.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-black dark:text-white font-medium">
                       <span className="flex items-center gap-1"><span>⏱️</span> {challenge.timeLimit}</span>
                       <span className="flex items-center gap-1"><span>⚡</span> {challenge.difficulty}</span>
                    </div>
                    <Link 
                      href={`/student/middle-school/quizzes/${challenge.category.toLowerCase().replace(" ", "-")}/daily`}
                      className={`block text-center w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r ${challenge.category === 'Science' ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'} hover:brightness-110`}
                    >
                      Play Now
                    </Link>
                 </div>
               ))}
             </div>
           </div>

           {/* Quiz Categories Grid */}
           <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <span className="text-xl">📚</span> Explore Topics
                </h2>
                <div className="flex gap-2">
                   <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-black dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">←</button>
                   <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-black dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">→</button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                {quizCategories.map((cat, idx) => (
                  <Link 
                    href={`/student/middle-school/quizzes/${cat.name.toLowerCase().replace(" ", "-")}`}
                    key={idx} 
                    className="block bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer group"
                  >
                     <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform origin-bottom-left`}>
                           {cat.icon}
                        </div>
                        <div>
                           <h3 className="font-bold text-black dark:text-white text-lg leading-tight">{cat.name}</h3>
                           <p className="text-xs text-black dark:text-white font-medium mt-1">{cat.active} New Quizzes</p>
                        </div>
                     </div>
                     <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
                        <div className={`bg-gradient-to-r ${cat.color} h-1.5 rounded-full`} style={{ width: `${(cat.completed / (cat.completed + cat.active)) * 100}%` }}></div>
                     </div>
                     <div className="text-[10px] text-right font-bold text-black dark:text-white uppercase tracking-wider">{cat.completed} Completed</div>
                  </Link>
                ))}
             </div>
           </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
           
           {/* Player Profile & Level */}
           <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 text-center relative overflow-hidden bg-white dark:bg-transparent">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
              
              <div className="relative inline-block mb-4">
                 <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 mx-auto overflow-hidden">
                    {/* Placeholder Avatar Image */}
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl">👦🏽</div>
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
                    Lv. 14
                 </div>
              </div>
              
              <h3 className="font-black text-xl text-black dark:text-white mb-1">Arjun K.</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mb-6">Quiz Master Rank</p>
              
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-black dark:text-white">Level 14 Progress</span>
                    <span className="text-black dark:text-white">4,250 / 5,000 XP</span>
                 </div>
                 <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[85%] relative">
                       <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/40 to-transparent"></div>
                    </div>
                 </div>
                 <p className="text-[10px] text-black dark:text-white mt-2">Just 750 XP to reach Level 15!</p>
              </div>
           </div>

           {/* Badge Cabinet */}
           <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                 <span className="text-xl">🏅</span> Recent Badges
               </h2>
               <Link href="/student/middle-school/badges" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">View All</Link>
             </div>
             
             <div className="grid grid-cols-3 gap-2">
                {recentBadges.map((badge, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-amber-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                     <div className="text-3xl mb-2 group-hover:-translate-y-1 group-hover:scale-110 transition-transform drop-shadow-lg filter">{badge.icon}</div>
                     <span className="text-[10px] font-bold text-black dark:text-white leading-tight mb-1">{badge.name}</span>
                     <span className="text-[8px] uppercase text-black dark:text-white">{badge.date}</span>
                  </div>
                ))}
             </div>
           </div>

           {/* AI Multiplayer Teaser */}
           <div className="glass rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/30 dark:to-transparent">
              <h3 className="font-bold text-black dark:text-white mb-2 flex items-center gap-2">
                <span className="text-xl">🤖</span> Challenge the AI
              </h3>
              <p className="text-xs text-black dark:text-white mb-4 leading-relaxed">Think you're fast? Race against our AI tutor in a rapid-fire quiz battle to earn double XP!</p>
              <Link href="/student/middle-school/quizzes/ai-battle" className="block text-center w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                Start AI Battle →
              </Link>
           </div>

        </div>

      </div>
    </PortalLayout>
  );
}