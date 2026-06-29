import React, { useState } from "react";
import { MoveRight, RefreshCcw, Scale } from "lucide-react";

// ==========================================
// 1. GEOMETRY SANDBOXES (Area & Perimeter)
// ==========================================

const RectangleSandbox = ({ mode }: { mode: "area" | "perimeter" }) => {
  const [l, setL] = useState(8);
  const [w, setW] = useState(5);
  
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         {mode === "area" ? (
           <rect x={80 - (l*8)/2} y={80 - (w*8)/2} width={l*8} height={w*8} fill="#fde04740" stroke="#eab308" strokeWidth="3" rx="4" />
         ) : (
           <rect x={80 - (l*8)/2} y={80 - (w*8)/2} width={l*8} height={w*8} fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="6 4" rx="4" className="animate-[spin_10s_linear_infinite_reverse]" style={{ animationDuration: '30s' }} />
         )}
         <text x="80" y={80 - (w*8)/2 - 8} className="text-[10px] font-black fill-slate-500" textAnchor="middle">Length = {l}</text>
         <text x={80 + (l*8)/2 + 8} y="80" className="text-[10px] font-black fill-slate-500" textAnchor="start" alignmentBaseline="middle">Width = {w}</text>
       </svg>
       
       <div className="flex w-full gap-4 px-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Length: {l}</label>
           <input type="range" min="2" max="14" value={l} onChange={(e) => setL(Number(e.target.value))} className="w-full accent-yellow-500" />
         </div>
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Width: {w}</label>
           <input type="range" min="2" max="10" value={w} onChange={(e) => setW(Number(e.target.value))} className="w-full accent-yellow-500" />
         </div>
       </div>

       <div className="w-full bg-slate-800 text-white p-4 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center border-4 border-slate-700">
         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
           {mode === "area" ? "Area (l × w)" : "Perimeter 2(l + w)"}
         </div>
         <div className="text-3xl font-black font-mono text-yellow-400 drop-shadow-md">
           {mode === "area" ? l * w : 2 * (l + w)} <span className="text-lg opacity-50">units{mode === "area" ? "²" : ""}</span>
         </div>
       </div>
    </div>
  );
};

const SquareSandbox = ({ mode }: { mode: "area" | "perimeter" }) => {
  const [a, setA] = useState(6);
  
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         {mode === "area" ? (
           <rect x={80 - (a*10)/2} y={80 - (a*10)/2} width={a*10} height={a*10} fill="#38bdf840" stroke="#0284c7" strokeWidth="3" rx="4" />
         ) : (
           <rect x={80 - (a*10)/2} y={80 - (a*10)/2} width={a*10} height={a*10} fill="transparent" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="6 4" rx="4" className="animate-[spin_10s_linear_infinite_reverse]" style={{ animationDuration: '30s' }} />
         )}
         <text x="80" y={80 - (a*10)/2 - 8} className="text-[10px] font-black fill-slate-500" textAnchor="middle">Side = {a}</text>
       </svg>
       
       <div className="flex w-full gap-4 px-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Side Length (a): {a}</label>
           <input type="range" min="2" max="12" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full accent-sky-500" />
         </div>
       </div>

       <div className="w-full bg-slate-800 text-white p-4 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center border-4 border-slate-700">
         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
           {mode === "area" ? "Area (a × a)" : "Perimeter (4a)"}
         </div>
         <div className="text-3xl font-black font-mono text-sky-400 drop-shadow-md">
           {mode === "area" ? a * a : 4 * a} <span className="text-lg opacity-50">units{mode === "area" ? "²" : ""}</span>
         </div>
       </div>
    </div>
  );
};

const RightTriangleSandbox = ({ mode }: { mode: "area" | "perimeter" }) => {
  const [b, setB] = useState(8);
  const [h, setH] = useState(6);
  // hypotenuse
  const c = Math.sqrt(b*b + h*h);

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <svg width="100%" height="160" viewBox="0 0 160 160" className="overflow-visible mb-2">
         <polygon 
           points={`80,${120 - h*10} 80,120 ${80 + b*10},120`} 
           fill={mode === "area" ? "#6366f140" : "transparent"} 
           stroke={mode === "area" ? "#4f46e5" : "#14b8a6"} 
           strokeWidth="3" 
           strokeDasharray={mode === "perimeter" ? "6 4" : ""}
         />
         {/* Right angle square */}
         <rect x="80" y="110" width="10" height="10" fill="transparent" stroke="#4f46e5" />
         
         <text x={80 + (b*10)/2} y="135" className="text-[10px] font-black fill-slate-500" textAnchor="middle">Base = {b}</text>
         <text x="70" y={120 - (h*10)/2} className="text-[10px] font-black fill-slate-500" textAnchor="end" alignmentBaseline="middle">Height = {h}</text>
         {mode === "perimeter" && (
           <text x={80 + (b*10)/2 + 5} y={120 - (h*10)/2 - 5} className="text-[10px] font-black fill-teal-600" textAnchor="middle">Hyp = {c.toFixed(1)}</text>
         )}
       </svg>
       
       <div className="flex w-full gap-4 px-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Base: {b}</label>
           <input type="range" min="4" max="12" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full accent-indigo-500" />
         </div>
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Height: {h}</label>
           <input type="range" min="4" max="10" value={h} onChange={(e) => setH(Number(e.target.value))} className="w-full accent-indigo-500" />
         </div>
       </div>

       <div className="w-full bg-slate-800 text-white p-4 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center border-4 border-slate-700">
         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
           {mode === "area" ? "Area (1/2 × b × h)" : "Perimeter (a + b + c)"}
         </div>
         <div className="text-3xl font-black font-mono text-indigo-400 drop-shadow-md">
           {mode === "area" ? (0.5 * b * h) : (b + h + c).toFixed(1)} <span className="text-lg opacity-50">units{mode === "area" ? "²" : ""}</span>
         </div>
       </div>
    </div>
  );
};


// ==========================================
// 2. PROFIT & LOSS / COMMERCIAL MATH
// ==========================================

const CommercialSandbox = ({ mode }: { mode: "profit-loss" | "discount" }) => {
  const [val1, setVal1] = useState(100); // CP or MP
  const [val2, setVal2] = useState(120); // SP or Discount

  const result = mode === "profit-loss" ? val2 - val1 : val1 - val2;
  const isProfit = mode === "profit-loss" ? result > 0 : null;

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      
      {/* Visualizer */}
      <div className="h-32 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center mb-4 relative overflow-hidden">
        {mode === "profit-loss" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-end gap-4 h-16">
              <div className="w-16 bg-rose-400 rounded-t-md flex items-end justify-center pb-2 text-white font-bold" style={{ height: `${(val1 / 200) * 100}%`, minHeight: '20px' }}>CP</div>
              <div className="w-16 bg-emerald-400 rounded-t-md flex items-end justify-center pb-2 text-white font-bold" style={{ height: `${(val2 / 200) * 100}%`, minHeight: '20px' }}>SP</div>
            </div>
            <div className={`px-4 py-1 rounded-full text-xs font-black text-white ${isProfit ? 'bg-emerald-500' : result === 0 ? 'bg-slate-400' : 'bg-rose-500'}`}>
               {isProfit ? 'PROFIT!' : result === 0 ? 'NO PROFIT/LOSS' : 'LOSS!'}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <div className="px-6 py-4 bg-slate-800 text-white rounded-xl shadow-lg border-2 border-slate-700 flex flex-col items-center relative">
               <span className="text-[10px] text-slate-400 uppercase font-black">Marked Price</span>
               <span className="text-xl font-black">₹{val1}</span>
               <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm rotate-12">
                 -₹{val2} OFF!
               </div>
             </div>
             <MoveRight className="text-slate-300" />
             <div className="px-6 py-4 bg-emerald-50 text-emerald-700 rounded-xl shadow-inner border-2 border-emerald-200 flex flex-col items-center">
               <span className="text-[10px] uppercase font-black">Selling Price</span>
               <span className="text-xl font-black">₹{result}</span>
             </div>
          </div>
        )}
      </div>

      <div className="flex w-full gap-4 px-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
             {mode === "profit-loss" ? `Cost Price: ₹${val1}` : `Marked Price: ₹${val1}`}
           </label>
           <input type="range" min="50" max="200" step="5" value={val1} onChange={(e) => setVal1(Number(e.target.value))} className={`w-full ${mode === "profit-loss" ? 'accent-rose-500' : 'accent-slate-800'}`} />
         </div>
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
             {mode === "profit-loss" ? `Selling Price: ₹${val2}` : `Discount: ₹${val2}`}
           </label>
           <input type="range" min="0" max="200" step="5" value={val2} onChange={(e) => setVal2(Number(e.target.value))} className={`w-full ${mode === "profit-loss" ? 'accent-emerald-500' : 'accent-rose-500'}`} />
         </div>
       </div>

       <div className={`w-full text-white p-4 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center border-4 ${
         mode === "profit-loss" 
           ? (isProfit ? 'bg-emerald-900 border-emerald-700' : 'bg-rose-900 border-rose-700')
           : 'bg-slate-800 border-slate-700'
       }`}>
         <div className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">
           {mode === "profit-loss" ? (isProfit ? "Profit = SP - CP" : "Loss = CP - SP") : "Selling Price = MP - Discount"}
         </div>
         <div className="text-3xl font-black font-mono drop-shadow-md">
           ₹{Math.abs(result)}
         </div>
       </div>
    </div>
  );
};


// ==========================================
// 3. MEASUREMENTS
// ==========================================

const MetricSandbox = () => {
  const [km, setKm] = useState(1);
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <div className="h-32 w-full bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center mb-4 relative overflow-hidden px-4">
         <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden relative">
           <div className="absolute top-0 left-0 h-full bg-cyan-400 transition-all duration-300" style={{ width: `${(km / 5) * 100}%` }}></div>
         </div>
         <div className="absolute top-8 left-4 text-xs font-black text-slate-400">0 km</div>
         <div className="absolute top-8 right-4 text-xs font-black text-slate-400">5 km</div>
         
         {/* Runner emoji */}
         <div className="absolute top-[4.5rem] transition-all duration-300 text-2xl" style={{ left: `calc(${(km / 5) * 100}% - 12px)` }}>
           🏃
         </div>
       </div>

       <div className="flex w-full px-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
             <span>Kilometers: {km.toFixed(1)} km</span>
           </label>
           <input type="range" min="0" max="5" step="0.1" value={km} onChange={(e) => setKm(Number(e.target.value))} className="w-full accent-cyan-500" />
         </div>
       </div>

       <div className="w-full bg-slate-800 text-white p-4 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center border-4 border-slate-700">
         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Meters (km × 1000)</div>
         <div className="text-3xl font-black font-mono text-cyan-400 drop-shadow-md">
           {(km * 1000).toFixed(0)} <span className="text-lg opacity-50">m</span>
         </div>
       </div>
    </div>
  );
};


// ==========================================
// 4. NUMBERS / BIDMAS
// ==========================================

const BidmasSandbox = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { calc: "3 + 4 × (2²)", active: "B", desc: "Brackets first! But wait, there's an Index inside." },
    { calc: "3 + 4 × (4)", active: "I", desc: "Indices! 2² becomes 4. Now Brackets are resolved." },
    { calc: "3 + 16", active: "M", desc: "Multiplication! 4 × 4 is 16." },
    { calc: "19", active: "A", desc: "Addition! 3 + 16 is 19. Done!" }
  ];

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <div className="flex gap-2 mb-6">
         {['B','I','D','M','A','S'].map(l => (
           <div key={l} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border-2 transition-all ${steps[step].active === l ? 'bg-amber-400 text-amber-900 border-amber-500 scale-110 shadow-amber-400/50' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
             {l}
           </div>
         ))}
       </div>

       <div className="h-32 w-full bg-slate-800 text-white rounded-2xl border-4 border-slate-700 flex flex-col items-center justify-center mb-4 shadow-inner relative overflow-hidden group">
          <div className="text-3xl font-mono font-black text-amber-400 tracking-wider">
            {steps[step].calc}
          </div>
          <div className="absolute bottom-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-8 text-center">
            {steps[step].desc}
          </div>
       </div>

       <button 
         onClick={() => setStep((s) => (s + 1) % steps.length)}
         className="w-full py-4 bg-amber-100 hover:bg-amber-200 text-amber-800 font-black rounded-2xl border-2 border-amber-300 transition-all flex items-center justify-center gap-2 active:scale-95"
       >
         <RefreshCcw className="w-4 h-4" /> Next Step
       </button>
    </div>
  );
};


// ==========================================
// 5. RATIO & PROPORTION
// ==========================================

const RatioSandbox = ({ isProportion }: { isProportion?: boolean }) => {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  
  if (isProportion) {
    // Proportions visualizer (a:b = c:d -> ad = bc)
    return (
      <div className="flex flex-col w-full animate-in fade-in duration-500">
        <div className="h-32 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center mb-4 relative p-4">
           <Scale className="absolute opacity-10 w-24 h-24 text-indigo-500" />
           <div className="flex gap-4 items-center z-10 w-full justify-between">
             <div className="flex flex-col items-center bg-white p-3 rounded-xl shadow-sm border-2 border-indigo-100">
               <span className="text-xs font-black text-indigo-400 mb-1">Extremes (a × d)</span>
               <span className="text-2xl font-black font-mono">{a} × {a*2} = {a * (a*2)}</span>
             </div>
             <span className="font-black text-2xl text-slate-300">=</span>
             <div className="flex flex-col items-center bg-white p-3 rounded-xl shadow-sm border-2 border-indigo-100">
               <span className="text-xs font-black text-indigo-400 mb-1">Means (b × c)</span>
               <span className="text-2xl font-black font-mono">{b} × {(a*a*2)/b} = {a * (a*2)}</span>
             </div>
           </div>
        </div>
        <div className="text-center text-xs text-slate-500 font-black mb-4">
          Visualizing {a}:{b} :: {(a*a*2)/b}:{a*2}
        </div>
        
        <div className="flex w-full px-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4 gap-4">
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Adjust A</label>
           <input type="range" min="1" max="5" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full accent-indigo-500" />
         </div>
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Adjust B</label>
           <input type="range" min="1" max="5" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full accent-indigo-500" />
         </div>
       </div>
      </div>
    );
  }

  // Basic Ratio
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <div className="flex items-center justify-center gap-8 h-32 w-full bg-slate-50 rounded-2xl border-2 border-slate-100 mb-4 relative overflow-hidden">
         <div className="flex flex-wrap gap-1 w-24 justify-end">
           {Array.from({length: a}).map((_,i) => <div key={i} className="w-4 h-4 bg-lime-400 rounded-full shadow-sm border border-lime-500 animate-in zoom-in"></div>)}
         </div>
         <div className="text-3xl font-black text-slate-300">:</div>
         <div className="flex flex-wrap gap-1 w-24 justify-start">
           {Array.from({length: b}).map((_,i) => <div key={i} className="w-4 h-4 bg-green-500 rounded-full shadow-sm border border-green-600 animate-in zoom-in"></div>)}
         </div>
       </div>

       <div className="flex w-full gap-4 px-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Group A: {a}</label>
           <input type="range" min="1" max="12" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full accent-lime-500" />
         </div>
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Group B: {b}</label>
           <input type="range" min="1" max="12" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full accent-green-500" />
         </div>
       </div>

       <div className="w-full bg-slate-800 text-white p-4 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center border-4 border-slate-700">
         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Fraction Equivalent</div>
         <div className="text-3xl font-black font-mono text-lime-400 drop-shadow-md">
           {a} / {b}
         </div>
       </div>
    </div>
  );
};


// ==========================================
// 6. FRACTIONS
// ==========================================

const FractionSandbox = () => {
  const [num, setNum] = useState(3);
  const [den, setDen] = useState(8);

  if (num > den) setNum(den); // Auto-correct

  const pieAngle = 360 / den;

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
       <div className="flex items-center justify-center h-40 w-full bg-slate-50 rounded-2xl border-2 border-slate-100 mb-4 relative overflow-hidden">
         <svg viewBox="-10 -10 120 120" width="120" height="120" className="drop-shadow-md">
           <circle cx="50" cy="50" r="50" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
           {Array.from({length: den}).map((_, i) => {
             const startAngle = (i * pieAngle - 90) * (Math.PI / 180);
             const endAngle = ((i + 1) * pieAngle - 90) * (Math.PI / 180);
             const x1 = 50 + 50 * Math.cos(startAngle);
             const y1 = 50 + 50 * Math.sin(startAngle);
             const x2 = 50 + 50 * Math.cos(endAngle);
             const y2 = 50 + 50 * Math.sin(endAngle);
             const largeArc = pieAngle > 180 ? 1 : 0;
             const isFilled = i < num;

             const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
             return (
               <path 
                 key={i} 
                 d={path} 
                 fill={isFilled ? "#fb7185" : "transparent"} 
                 stroke="#fff" 
                 strokeWidth="2"
                 className="transition-all duration-300"
               />
             );
           })}
         </svg>
       </div>

       <div className="flex w-full gap-4 px-4 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 mb-4">
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Numerator: {num}</label>
           <input type="range" min="0" max={den} value={num} onChange={(e) => setNum(Number(e.target.value))} className="w-full accent-rose-500" />
         </div>
         <div className="flex-1 flex flex-col">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Denominator: {den}</label>
           <input type="range" min="1" max="12" value={den} onChange={(e) => setDen(Number(e.target.value))} className="w-full accent-slate-500" />
         </div>
       </div>

       <div className="w-full bg-slate-800 text-white p-4 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center border-4 border-slate-700">
         <div className="flex flex-col items-center">
            <span className="text-3xl font-black font-mono text-rose-400">{num}</span>
            <div className="w-12 h-1 bg-white/50 rounded-full my-1"></div>
            <span className="text-3xl font-black font-mono text-slate-300">{den}</span>
         </div>
       </div>
    </div>
  );
};


// ==========================================
// EXPORT LOADER
// ==========================================

export const FormulaSandboxLoader = ({ formulaId }: { formulaId: number }) => {
  // Rectangle
  if (formulaId === 101) return <RectangleSandbox mode="area" />;
  if (formulaId === 102) return <RectangleSandbox mode="perimeter" />;
  
  // Square
  if (formulaId === 103) return <SquareSandbox mode="area" />;
  if (formulaId === 104) return <SquareSandbox mode="perimeter" />;
  
  // Right Triangle
  if (formulaId === 114) return <RightTriangleSandbox mode="perimeter" />;
  if (formulaId === 115) return <RightTriangleSandbox mode="area" />;
  
  // Profit & Loss
  if (formulaId === 105) return <CommercialSandbox mode="profit-loss" />;
  if (formulaId === 106) return <CommercialSandbox mode="profit-loss" />; // Same UI handles both
  
  // Discount
  if (formulaId === 107) return <CommercialSandbox mode="discount" />;
  if (formulaId === 108) return <CommercialSandbox mode="discount" />;
  
  // Metric
  if (formulaId === 109) return <MetricSandbox />;
  
  // BIDMAS
  if (formulaId === 110) return <BidmasSandbox />;
  
  // Ratio
  if (formulaId === 111) return <RatioSandbox />;
  if (formulaId === 112) return <RatioSandbox isProportion={true} />;
  
  // Fractions
  if (formulaId === 113) return <FractionSandbox />;

  // Default Fallback
  return (
    <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <div className="text-3xl mb-4">🛠️</div>
      <h3 className="font-black text-slate-500 mb-2">Sandbox Under Construction</h3>
      <p className="text-xs text-slate-400">The magical interactive playground for this formula is being built by the math wizards.</p>
    </div>
  );
};
