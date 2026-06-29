"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Calculator, 
  Search,
  Sigma,
  Pi,
  DivideSquare,
  BookOpen,
  Copy,
  Star,
  Check,
  Zap,
  Gamepad2,
  BrainCircuit,
  Joystick,
  GraduationCap
} from "lucide-react";

interface FormulaCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const categories: FormulaCategory[] = [
  { id: "algebra", name: "Algebra", icon: <Sigma />, count: 124, color: "text-blue-600 bg-blue-100 border-blue-400" },
  { id: "geometry", name: "Geometry", icon: <DivideSquare />, count: 86, color: "text-emerald-600 bg-emerald-100 border-emerald-400" },
  { id: "trigonometry", name: "Trigonometry", icon: <Pi />, count: 52, color: "text-purple-600 bg-purple-100 border-purple-400" },
  { id: "calculus", name: "Calculus", icon: <Calculator />, count: 110, color: "text-orange-600 bg-orange-100 border-orange-400" },
];

const mockFormulas = [
  { 
    id: 7, title: "Area of a Rectangle", formula: "A = l × w", 
    category: "geometry", popular: true, bg: "from-yellow-400 to-amber-500", gradeRange: "6-8",
    mnemonicPrompt: "A glowing golden rectangle box with mathematical dimensions. Educational 3d style.",
    mnemonicText: "Just multiply the length by the width to find how many squares fit inside!"
  },
  { 
    id: 8, title: "Speed Formula", formula: "S = D / T", 
    category: "algebra", popular: true, bg: "from-sky-400 to-cyan-500", gradeRange: "6-8",
    mnemonicPrompt: "A sleek race car zooming past a distance marker and a stopwatch. Educational 3d illustration.",
    mnemonicText: "Speed is just how much Distance you cover in a certain amount of Time! (Speed = Distance ÷ Time)"
  },
  { 
    id: 2, title: "Pythagorean Theorem", formula: "a² + b² = c²", 
    category: "geometry", popular: true, bg: "from-emerald-400 to-teal-500", gradeRange: "6-8",
    mnemonicPrompt: "Ancient greek mathematician Pythagoras standing next to a glowing right angled triangle. Educational 3d illustration, vibrant.",
    mnemonicText: "The square of the hypotenuse is equal to the sum of the squares of the other two sides."
  },
  { 
    id: 3, title: "Area of a Circle", formula: "A = πr²", 
    category: "geometry", popular: false, bg: "from-pink-400 to-rose-500", gradeRange: "6-8",
    mnemonicPrompt: "A perfect glowing neon circle with a radius line. Cherry pie. Educational 3d illustration.",
    mnemonicText: "Apple pie are square? No, pi r squared! (πr²)"
  },
  { 
    id: 1, title: "Quadratic Formula", formula: "x = (-b ± √(b² - 4ac)) / 2a", 
    category: "algebra", popular: true, bg: "from-blue-400 to-indigo-500", gradeRange: "9-12",
    mnemonicPrompt: "A sad boy couldn't decide whether to go to a radical party. He was a square and lost 4 awesome chicks. It was all over at 2 am. Educational 3d illustration, cinematic.",
    mnemonicText: "A negative boy (-b) couldn't decide (±) whether to go to a radical party (√). The boy was a square (b²) and lost 4 awesome chicks (4ac). It was all over at 2 am (2a)."
  },
  { 
    id: 4, title: "Sine Rule", formula: "a/sin(A) = b/sin(B) = c/sin(C)", 
    category: "trigonometry", popular: false, bg: "from-purple-400 to-fuchsia-500", gradeRange: "9-12",
    mnemonicPrompt: "A triangle with sides and angles glowing in distinct colors, trigonometry concept, 3d educational style.",
    mnemonicText: "The ratio of a side to the sine of its opposite angle is constant for all three sides."
  },
  { 
    id: 5, title: "Euler's Identity", formula: "e^(iπ) + 1 = 0", 
    category: "algebra", popular: true, bg: "from-amber-400 to-orange-500", gradeRange: "9-12",
    mnemonicPrompt: "Euler's identity formula glowing in gold, combining five fundamental mathematical constants beautifully. Cinematic lighting.",
    mnemonicText: "The most beautiful equation in mathematics, tying together e, i, π, 1, and 0."
  },
  { 
    id: 6, title: "Fundamental Theorem of Calculus", formula: "∫(a to b) f(x)dx = F(b) - F(a)", 
    category: "calculus", popular: true, bg: "from-cyan-400 to-blue-500", gradeRange: "9-12",
    mnemonicPrompt: "An integral curve area being calculated, glowing mathematical curves, futuristic educational style.",
    mnemonicText: "Integration and differentiation are inverse operations. The area under the curve is the difference of the antiderivative at the endpoints."
  },
];

// Interactive Sandbox Components
const RectangleSandbox = () => {
  const [l, setL] = useState(8);
  const [w, setW] = useState(5);
  const area = l * w;

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         <rect x={80 - (l*8)/2} y={80 - (w*8)/2} width={l*8} height={w*8} fill="#fde04740" stroke="#eab308" strokeWidth="3" rx="4" />
         <text x="80" y={80 - (w*8)/2 - 5} className="text-[10px] font-black fill-yellow-700" textAnchor="middle">Length = {l}</text>
         <text x={80 + (l*8)/2 + 5} y="80" className="text-[10px] font-black fill-yellow-700" textAnchor="start" alignmentBaseline="middle">Width = {w}</text>
       </svg>
       <div className="w-full space-y-4 px-4 pb-4">
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Length (l): {l}</label>
           <input type="range" min="1" max="15" value={l} onChange={e=>setL(parseInt(e.target.value))} className="w-full accent-yellow-500" />
         </div>
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Width (w): {w}</label>
           <input type="range" min="1" max="15" value={w} onChange={e=>setW(parseInt(e.target.value))} className="w-full accent-yellow-500" />
         </div>
         <div className="p-4 bg-yellow-50 rounded-2xl font-mono text-center font-bold text-yellow-800 border-2 border-yellow-200 shadow-inner text-lg">
           A = {l} × {w} = <span className="text-yellow-600">{area}</span>
         </div>
       </div>
    </div>
  );
};

const SpeedSandbox = () => {
  const [d, setD] = useState(100);
  const [t, setT] = useState(5);
  const speed = (d / t).toFixed(1);

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         {/* Road */}
         <line x1="10" y1="120" x2="150" y2="120" stroke="#94a3b8" strokeWidth="4" />
         <line x1="10" y1="120" x2="10" y2="90" stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" />
         <line x1="150" y1="120" x2="150" y2="90" stroke="#22c55e" strokeWidth="2" strokeDasharray="2,2" />
         
         <text x="80" y="145" className="text-[10px] font-black fill-slate-500" textAnchor="middle">Distance: {d} m</text>
         
         {/* Car (animated position based on ratio but static for sandbox simplicity) */}
         <rect x="65" y="100" width="30" height="15" fill="#38bdf8" rx="4" />
         <circle cx="70" cy="115" r="4" fill="#0f172a" />
         <circle cx="90" cy="115" r="4" fill="#0f172a" />
         
         {/* Action lines */}
         <path d="M 45 105 L 55 105 M 50 110 L 55 110" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
         
         <text x="80" y="85" className="text-[12px] font-black fill-sky-600" textAnchor="middle">{speed} m/s</text>
       </svg>
       <div className="w-full space-y-4 px-4 pb-4">
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Distance (D): {d} m</label>
           <input type="range" min="10" max="200" step="10" value={d} onChange={e=>setD(parseInt(e.target.value))} className="w-full accent-sky-500" />
         </div>
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Time (T): {t} s</label>
           <input type="range" min="1" max="20" value={t} onChange={e=>setT(parseInt(e.target.value))} className="w-full accent-sky-500" />
         </div>
         <div className="p-4 bg-sky-50 rounded-2xl font-mono text-center font-bold text-sky-800 border-2 border-sky-200 shadow-inner text-lg">
           S = {d} ÷ {t} = <span className="text-sky-500">{speed} m/s</span>
         </div>
       </div>
    </div>
  );
};


const PythagoreanSandbox = () => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.sqrt(a*a + b*b).toFixed(2);
  
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="200" viewBox="-20 -20 160 160" className="overflow-visible mb-2">
         <polygon points={`10,${110 - a*10} 10,110 ${10 + b*10},110`} fill="#34d39940" stroke="#059669" strokeWidth="3" strokeLinejoin="round" />
         <text x="-5" y={110 - (a*5)} className="text-[8px] font-black fill-slate-500" textAnchor="end">a = {a}</text>
         <text x={10 + (b*5)} y="125" className="text-[8px] font-black fill-slate-500" textAnchor="middle">b = {b}</text>
         <text x={10 + (b*5)} y={110 - (a*5)} className="text-[10px] font-black fill-emerald-600" textAnchor="start">
           c = {c}
         </text>
       </svg>
       <div className="w-full space-y-4 px-4 pb-4">
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Height (a): {a}</label>
           <input type="range" min="1" max="10" value={a} onChange={e=>setA(parseInt(e.target.value))} className="w-full accent-emerald-500" />
         </div>
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Base (b): {b}</label>
           <input type="range" min="1" max="10" value={b} onChange={e=>setB(parseInt(e.target.value))} className="w-full accent-emerald-500" />
         </div>
         <div className="p-4 bg-emerald-50 rounded-2xl font-mono text-center font-bold text-emerald-800 border-2 border-emerald-200 shadow-inner text-lg">
           {a}² + {b}² = <span className="text-emerald-500">{c}²</span> <br/>
           <span className="text-sm text-emerald-600/80">{a*a} + {b*b} = {(a*a + b*b).toFixed(2)}</span>
         </div>
       </div>
    </div>
  );
};

const CircleSandbox = () => {
  const [r, setR] = useState(3);
  const area = (Math.PI * r * r).toFixed(2);
  
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="200" viewBox="0 0 160 160" className="overflow-visible mb-2">
         <circle cx="80" cy="80" r={r * 10} fill="#f472b640" stroke="#db2777" strokeWidth="3" />
         <circle cx="80" cy="80" r="2" fill="#831843" />
         <line x1="80" y1="80" x2={80 + r*10} y2="80" stroke="#831843" strokeWidth="2" strokeDasharray="4,4" />
         <text x={80 + (r*5)} y="75" className="text-[10px] font-black fill-pink-700" textAnchor="middle">r = {r}</text>
       </svg>
       <div className="w-full space-y-4 px-4 pb-4">
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Radius (r): {r}</label>
           <input type="range" min="1" max="7" value={r} onChange={e=>setR(parseInt(e.target.value))} className="w-full accent-pink-500" />
         </div>
         <div className="p-4 bg-pink-50 rounded-2xl font-mono text-center font-bold text-pink-800 border-2 border-pink-200 shadow-inner text-lg">
           A = π × {r}² <br/>
           A ≈ <span className="text-pink-500">{area}</span>
         </div>
       </div>
    </div>
  );
};

const QuadraticSandbox = () => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(-4);
  
  const D = b*b - 4*a*c;
  let rootsText = "";
  if (D > 0) {
    const r1 = ((-b + Math.sqrt(D)) / (2*a)).toFixed(1);
    const r2 = ((-b - Math.sqrt(D)) / (2*a)).toFixed(1);
    rootsText = `Roots: x = ${r1}, x = ${r2}`;
  } else if (D === 0) {
    const r = (-b / (2*a)).toFixed(1);
    rootsText = `One Root: x = ${r}`;
  } else {
    rootsText = "No real roots (Complex)";
  }

  let dPath = "";
  for (let x = -5; x <= 5; x += 0.5) {
    const y = a*x*x + b*x + c;
    const svgX = 80 + x * 15;
    const svgY = 80 - y * 5;
    if (x === -5) dPath += `M ${svgX} ${svgY} `;
    else dPath += `L ${svgX} ${svgY} `;
  }

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         <line x1="0" y1="80" x2="160" y2="80" stroke="#94a3b8" strokeWidth="1" />
         <line x1="80" y1="0" x2="80" y2="160" stroke="#94a3b8" strokeWidth="1" />
         <path d={dPath} fill="none" stroke="#6366f1" strokeWidth="3" />
         {D >= 0 && a !== 0 && (
            <>
               <circle cx={80 + ((-b + Math.sqrt(D)) / (2*a)) * 15} cy="80" r="4" fill="#ef4444" />
               <circle cx={80 + ((-b - Math.sqrt(D)) / (2*a)) * 15} cy="80" r="4" fill="#ef4444" />
            </>
         )}
       </svg>
       <div className="w-full space-y-3 px-4 pb-4">
         <div className="flex gap-2">
           <div className="flex-1">
             <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">a: {a}</label>
             <input type="range" min="-3" max="3" value={a} onChange={e=>{const val = parseInt(e.target.value); setA(val === 0 ? 1 : val);}} className="w-full accent-indigo-500" />
           </div>
           <div className="flex-1">
             <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">b: {b}</label>
             <input type="range" min="-5" max="5" value={b} onChange={e=>setB(parseInt(e.target.value))} className="w-full accent-indigo-500" />
           </div>
           <div className="flex-1">
             <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">c: {c}</label>
             <input type="range" min="-10" max="10" value={c} onChange={e=>setC(parseInt(e.target.value))} className="w-full accent-indigo-500" />
           </div>
         </div>
         <div className="p-3 bg-indigo-50 rounded-2xl font-mono text-center font-bold text-indigo-800 border-2 border-indigo-200 text-sm">
           y = {a}x² {b >= 0 ? '+' : '-'} {Math.abs(b)}x {c >= 0 ? '+' : '-'} {Math.abs(c)} <br/>
           <span className="text-indigo-500">{rootsText}</span>
         </div>
       </div>
    </div>
  );
};

const SineRuleSandbox = () => {
  const [a, setA] = useState(5);
  const [angleA, setAngleA] = useState(30);
  
  const ratio = (a / Math.sin(angleA * Math.PI / 180)).toFixed(2);
  
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         <polygon points={`20,120 140,120 ${80 + Math.cos(angleA * Math.PI/180)*50},${120 - Math.sin(angleA * Math.PI/180)*50}`} fill="#c084fc40" stroke="#a855f7" strokeWidth="3" strokeLinejoin="round" />
         <text x="70" y="110" className="text-[10px] font-black fill-purple-700">∠A = {angleA}°</text>
         <text x="110" y={120 - Math.sin(angleA * Math.PI/180)*25} className="text-[10px] font-black fill-purple-700">Side a = {a}</text>
       </svg>
       <div className="w-full space-y-4 px-4 pb-4">
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Side a: {a}</label>
           <input type="range" min="1" max="10" value={a} onChange={e=>setA(parseInt(e.target.value))} className="w-full accent-purple-500" />
         </div>
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Angle A: {angleA}°</label>
           <input type="range" min="10" max="80" value={angleA} onChange={e=>setAngleA(parseInt(e.target.value))} className="w-full accent-purple-500" />
         </div>
         <div className="p-3 bg-purple-50 rounded-2xl font-mono text-center font-bold text-purple-800 border-2 border-purple-200 text-lg">
           a / sin(A) = <span className="text-purple-500">{ratio}</span>
         </div>
       </div>
    </div>
  );
};

const EulerSandbox = () => {
  const [angle, setAngle] = useState(0); 
  
  const rad = angle * Math.PI / 180;
  const x = Math.cos(rad).toFixed(2);
  const y = Math.sin(rad).toFixed(2);
  
  const cx = 80 + Math.cos(rad) * 50;
  const cy = 80 - Math.sin(rad) * 50;

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         <line x1="20" y1="80" x2="140" y2="80" stroke="#94a3b8" strokeWidth="1" />
         <line x1="80" y1="20" x2="80" y2="140" stroke="#94a3b8" strokeWidth="1" />
         <circle cx="80" cy="80" r="50" fill="none" stroke="#cbd5e1" strokeDasharray="4,4" />
         <text x="145" y="85" className="text-[8px] font-bold fill-slate-400">Re</text>
         <text x="75" y="15" className="text-[8px] font-bold fill-slate-400">Im</text>
         
         <line x1="80" y1="80" x2={cx} y2={cy} stroke="#f59e0b" strokeWidth="3" />
         <circle cx={cx} cy={cy} r="4" fill="#d97706" />
         <text x={cx+5} y={cy-5} className="text-[10px] font-black fill-amber-600">
           {angle === 180 ? "-1" : `e^(i ${(angle/180).toFixed(2)}π)`}
         </text>
       </svg>
       <div className="w-full space-y-4 px-4 pb-4">
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Angle (x): {angle}°</label>
           <input type="range" min="0" max="180" value={angle} step="15" onChange={e=>setAngle(parseInt(e.target.value))} className="w-full accent-amber-500" />
         </div>
         <div className="p-3 bg-amber-50 rounded-2xl font-mono text-center font-bold text-amber-800 border-2 border-amber-200 text-sm">
           e^(ix) = cos(x) + i sin(x) <br/>
           e^(i {angle}°) = {x} + {y}i
           {angle === 180 && <div className="text-amber-600 text-lg mt-1 font-black animate-pulse">e^(iπ) + 1 = 0 ✨</div>}
         </div>
       </div>
    </div>
  );
};

const CalculusSandbox = () => {
  const [b, setB] = useState(5);
  
  let dPath = "M 20 140 "; 
  for (let x = 0; x <= b; x += 0.5) {
    const y = (x*x) / 5; 
    const svgX = 20 + x * 20;
    const svgY = 140 - y * 10;
    dPath += `L ${svgX} ${svgY} `;
  }
  dPath += `L ${20 + b*20} 140 Z`;

  const area = ((b*b*b) / 15).toFixed(2); 

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         <line x1="20" y1="140" x2="140" y2="140" stroke="#94a3b8" strokeWidth="2" />
         <line x1="20" y1="20" x2="20" y2="140" stroke="#94a3b8" strokeWidth="2" />
         
         <path d={dPath} fill="#38bdf880" stroke="none" />
         
         <path d={dPath.replace("Z", "").replace(`L ${20 + b*20} 140`, "")} fill="none" stroke="#0ea5e9" strokeWidth="3" />
         <text x={20 + b*20} y="155" className="text-[10px] font-black fill-sky-700">b={b}</text>
         <text x="50" y="100" className="text-[12px] font-black fill-sky-900">Area</text>
       </svg>
       <div className="w-full space-y-4 px-4 pb-4">
         <div>
           <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Endpoint (b): {b}</label>
           <input type="range" min="1" max="6" value={b} onChange={e=>setB(parseInt(e.target.value))} className="w-full accent-sky-500" />
         </div>
         <div className="p-3 bg-sky-50 rounded-2xl font-mono text-center font-bold text-sky-800 border-2 border-sky-200 text-sm">
           f(x) = x²/5 <br/>
           ∫(0 to {b}) f(x)dx = <span className="text-sky-500">{area}</span>
         </div>
       </div>
    </div>
  );
};


export default function MathsFormulasPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [activeGrade, setActiveGrade] = useState("6-8"); // Defaulting to middle school 6-8 per user request
  const [searchQuery, setSearchQuery] = useState("");
  
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  
  // Game Mode & Sandbox State
  const [gameMode, setGameMode] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"playground" | "memory">("playground");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCopy = (e: React.MouseEvent, id: number, textToCopy: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast("Formula magically copied! ✨");
    }).catch(() => {
      showToast("Failed to copy formula 😢");
    });
  };

  const openSandbox = (formula: any, cat: any) => {
    setSelectedFormula({ ...formula, cat });
    setActiveTab("playground");
    setModalOpen(true);
  };

  const toggleGameMode = () => {
    setGameMode(!gameMode);
    setRevealed(new Set()); 
    if (!gameMode) showToast("🎮 Game Mode Activated! Test your memory!");
    else showToast("📚 Switched back to Study Mode.");
  };

  const toggleReveal = (id: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        showToast("Great memory! +10 XP 🌟");
      }
      return next;
    });
  };

  // Filter logic
  let filteredFormulas = mockFormulas;
  if (activeGrade !== "all") {
    filteredFormulas = filteredFormulas.filter(f => f.gradeRange === activeGrade);
  }
  if (activeCat !== "all") {
    filteredFormulas = filteredFormulas.filter(f => f.category === activeCat);
  }
  if (searchQuery.trim() !== "") {
    filteredFormulas = filteredFormulas.filter(f => 
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.formula.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <PortalLayout
      title="Maths Magic Formulas"
      subtitle="Your super-powered interactive cheat sheet for math!"
    >
      <div className="flex flex-col gap-8">
        
        {/* Playful Search and Categories Header */}
        <div className="bg-white dark:bg-slate-800 p-6 flex flex-col md:flex-row gap-6 justify-between items-center rounded-[2rem] border-4 border-indigo-100 dark:border-slate-700 shadow-xl shadow-indigo-500/10 relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="w-full md:w-1/2 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 font-bold" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-indigo-100 dark:border-slate-700 text-indigo-900 dark:text-indigo-100 rounded-3xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all shadow-inner placeholder:text-indigo-300 dark:placeholder:text-indigo-700"
              />
            </div>
            
            {/* Grade Level Selector */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                <GraduationCap className="w-5 h-5" />
              </div>
              <select 
                value={activeGrade}
                onChange={(e) => {
                  setActiveGrade(e.target.value);
                  showToast(`Viewing formulas for ${e.target.options[e.target.selectedIndex].text}`);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border-4 border-indigo-100 dark:border-slate-700 text-indigo-900 dark:text-indigo-100 rounded-2xl py-3 pl-10 pr-8 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all shadow-sm cursor-pointer"
              >
                <option value="6-8">Grades 6-8 (Middle School)</option>
                <option value="9-12">Grades 9-12 (High School)</option>
                <option value="all">All Grades</option>
              </select>
            </div>
            
            <button 
              onClick={toggleGameMode}
              className={`p-3 rounded-2xl border-4 transition-all flex-shrink-0 ${
                gameMode 
                  ? "bg-amber-400 border-amber-500 text-amber-900 shadow-lg shadow-amber-500/40 scale-110 rotate-3 animate-pulse" 
                  : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-200"
              }`}
              title="Toggle Game Mode"
            >
              <Gamepad2 className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <button 
              onClick={() => setActiveCat("all")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 ${
                activeCat === "all" 
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border-2 border-transparent"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
                  activeCat === cat.id 
                    ? `${cat.color.split(' ')[1]} ${cat.color.split(' ')[2]} ${cat.color.split(' ')[0]} shadow-lg scale-105`
                    : `bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:scale-105`
                }`}
              >
                {React.cloneElement(cat.icon as React.ReactElement, { className: "w-4 h-4" })}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Playful Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFormulas.map(formula => {
            const cat = categories.find(c => c.id === formula.category);
            return (
              <div key={formula.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col relative overflow-hidden border-4 border-slate-100 dark:border-slate-700 p-2">
                
                {/* Dynamic Formula Display based on Game Mode */}
                {gameMode ? (
                  <div 
                    onClick={() => toggleReveal(formula.id)}
                    className={`w-full h-36 rounded-t-[2rem] rounded-b-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${
                      revealed.has(formula.id) 
                        ? `bg-gradient-to-br ${formula.bg}`
                        : "bg-slate-800 dark:bg-slate-900 border-2 border-dashed border-slate-600 hover:bg-slate-700"
                    }`}
                  >
                    {revealed.has(formula.id) ? (
                      <span className="font-mono text-2xl font-black text-white text-center drop-shadow-md animate-in zoom-in duration-300">
                        {formula.formula}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-amber-400 transition-colors">
                        <Gamepad2 className="w-10 h-10 mb-2 opacity-50 group-hover:opacity-100 group-hover:animate-bounce" />
                        <span className="font-black text-xs tracking-widest uppercase text-center">
                          Tap to Reveal
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`w-full h-36 rounded-t-[2rem] rounded-b-2xl bg-gradient-to-br ${formula.bg} flex items-center justify-center p-6 relative`}>
                     <span className="font-mono text-2xl font-black text-white text-center drop-shadow-md">
                       {formula.formula}
                     </span>
                     
                     <button 
                       onClick={(e) => handleCopy(e, formula.id, formula.formula)}
                       className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all shadow-sm active:scale-95 z-10"
                       title="Copy Formula"
                     >
                       {copiedId === formula.id ? (
                         <Check className="w-4 h-4" />
                       ) : (
                         <Copy className="w-4 h-4" />
                       )}
                     </button>

                     {/* Grade Badge */}
                     <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[9px] font-black text-slate-700 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm">
                       Grade {formula.gradeRange}
                     </div>

                     {formula.popular && (
                       <div className="absolute top-4 left-4 flex items-center gap-1 text-[9px] font-black text-amber-900 bg-amber-400 px-2.5 py-1 rounded-xl shadow-md rotate-[-5deg]">
                         <Star className="w-3 h-3 fill-amber-900" />
                         POPULAR
                       </div>
                     )}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                   <div className="flex justify-between items-center mb-3">
                     <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 flex items-center gap-1.5 ${cat?.color}`}>
                       {React.cloneElement(cat?.icon as React.ReactElement, { className: "w-3 h-3" })}
                       {cat?.name}
                     </div>
                   </div>

                   <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-5 leading-tight">{formula.title}</h3>
                   
                   <div className="flex gap-2 mt-auto">
                     <button 
                       onClick={() => openSandbox(formula, cat)}
                       className="flex-1 py-3 rounded-2xl text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all active:scale-95 border-2 border-indigo-200 flex items-center justify-center gap-2">
                       <Joystick className="w-4 h-4" /> Interactive Sandbox
                     </button>
                   </div>
                </div>
              </div>
            );
          })}
          
          {filteredFormulas.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-800 rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700">
               <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
               <h3 className="text-xl font-black text-slate-400">No magical formulas found!</h3>
               <p className="text-sm font-bold mt-2">Try selecting a different category or grade level.</p>
            </div>
          )}
        </div>

      </div>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/20 text-sm font-bold animate-[bounce_0.5s_ease-out] z-[150] flex items-center gap-2 border-4 border-indigo-500/30">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}
      
      {/* Interactive Sandbox & Memory Modal */}
      {modalOpen && selectedFormula && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl border-4 border-slate-100 dark:border-slate-700 animate-in zoom-in-95 flex flex-col overflow-hidden">
             
             {/* Modal Header (Formula Display) */}
             <div className={`w-full h-32 bg-gradient-to-br ${selectedFormula.bg} flex items-center justify-center p-6 relative shadow-inner`}>
                <span className="font-mono text-3xl font-black text-white text-center drop-shadow-md">
                  {selectedFormula.formula}
                </span>
                
                <button 
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
                >
                  ✕
                </button>
             </div>
             
             <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{selectedFormula.title}</h3>
                  <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 bg-white ${selectedFormula.cat?.color}`}>
                     {selectedFormula.cat?.name}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => setActiveTab("playground")} 
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      activeTab === "playground" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Joystick className="w-4 h-4" /> Sandbox
                  </button>
                  <button 
                    onClick={() => setActiveTab("memory")} 
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      activeTab === "memory" ? "bg-white dark:bg-slate-800 text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <BrainCircuit className="w-4 h-4" /> Memory Trick
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-h-[250px]">
                  {activeTab === "playground" && (
                    <div className="h-full flex flex-col justify-center">
                      {selectedFormula.id === 1 ? <QuadraticSandbox /> :
                       selectedFormula.id === 2 ? <PythagoreanSandbox /> :
                       selectedFormula.id === 3 ? <CircleSandbox /> :
                       selectedFormula.id === 4 ? <SineRuleSandbox /> :
                       selectedFormula.id === 5 ? <EulerSandbox /> :
                       selectedFormula.id === 6 ? <CalculusSandbox /> :
                       selectedFormula.id === 7 ? <RectangleSandbox /> :
                       selectedFormula.id === 8 ? <SpeedSandbox /> :
                       <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 h-full flex flex-col items-center justify-center">
                         <Calculator className="w-12 h-12 text-slate-300 mb-4" />
                         <h4 className="font-bold text-slate-500 text-sm">Interactive Sandbox coming soon for this formula!</h4>
                       </div>
                      }
                    </div>
                  )}

                  {activeTab === "memory" && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="w-full h-44 bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-200 shadow-inner group">
                         <img 
                           src={`https://image.pollinations.ai/prompt/${encodeURIComponent(selectedFormula.mnemonicPrompt)}?width=600&height=400&nologo=true`} 
                           alt="Memory Mnemonic"
                           className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                           <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1">
                             <BrainCircuit className="w-3 h-3" /> AI Generated Mnemonic
                           </span>
                         </div>
                      </div>
                      <p className="font-bold text-slate-700 text-sm leading-relaxed p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 text-center">
                        "{selectedFormula.mnemonicText}"
                      </p>
                    </div>
                  )}
                </div>

             </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
