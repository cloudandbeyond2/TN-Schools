"use client";

import React, { useState, useEffect, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  BookOpen, 
  Search, 
  Play, 
  Info,
  Clock,
  Sparkles,
  X,
  Layers,
  Sliders,
  RotateCcw
} from "lucide-react";

interface Formula {
  id: string;
  title: string;
  formula: string;
  subject: "Mathematics" | "Physics" | "Chemistry";
  topic: string;
  importance: "High" | "Medium" | "Critical";
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string; // approximate time to learn
  description: string;
  variables: { symbol: string; meaning: string }[];
  thumbnail: string; // CSS gradient class
  standard: "11" | "12";
}

const FORMULAE_DATA: Formula[] = [
  // MATHEMATICS
  {
    id: "math-1",
    title: "Fundamental Theorem of Calculus",
    formula: "∫_a^b f(x) dx = F(b) - F(a)",
    subject: "Mathematics",
    topic: "Integral Calculus",
    importance: "Critical",
    difficulty: "Medium",
    duration: "Interactive Simulation",
    description: "Connects the concept of differentiating a function with the concept of integrating a function (finding the area under a curve).",
    variables: [
      { symbol: "∫_a^b", meaning: "Definite integral from limit a to b" },
      { symbol: "f(x)", meaning: "Integrand function representing the rate of change" },
      { symbol: "F(x)", meaning: "Antiderivative function where F'(x) = f(x)" },
      { symbol: "dx", meaning: "Infinitesimal change in the variable x" }
    ],
    thumbnail: "from-blue-600 to-indigo-700",
    standard: "12"
  },
  {
    id: "math-2",
    title: "Euler's Formula",
    formula: "e^(iθ) = cos(θ) + i sin(θ)",
    subject: "Mathematics",
    topic: "Complex Numbers & Trigonometry",
    importance: "High",
    difficulty: "Hard",
    duration: "Interactive Simulation",
    description: "Establishes the fundamental relationship between the trigonometric functions and the complex exponential function using a unit circle.",
    variables: [
      { symbol: "e", meaning: "Euler's number (base of natural logarithm ~2.718)" },
      { symbol: "i", meaning: "Imaginary unit (√-1)" },
      { symbol: "θ (theta)", meaning: "Angle of rotation in radians" },
      { symbol: "cos/sin", meaning: "Trigonometric cosine and sine components on the complex plane" }
    ],
    thumbnail: "from-indigo-600 to-purple-700",
    standard: "11"
  },
  {
    id: "math-3",
    title: "Derivative of Sine Function",
    formula: "d/dx [sin(x)] = cos(x)",
    subject: "Mathematics",
    topic: "Differential Calculus",
    importance: "Critical",
    difficulty: "Easy",
    duration: "Interactive Simulation",
    description: "Demonstrates that the instantaneous slope of a sine curve at any point matches the value of the cosine curve at that same point.",
    variables: [
      { symbol: "d/dx", meaning: "Derivative operator with respect to x" },
      { symbol: "sin(x)", meaning: "Sine function wave" },
      { symbol: "cos(x)", meaning: "Cosine function wave representing the slope profile" }
    ],
    thumbnail: "from-violet-600 to-pink-700",
    standard: "11"
  },

  // PHYSICS
  {
    id: "phys-1",
    title: "Gauss's Law",
    formula: "Φ_E = ∮ E · dA = Q_enclosed / ε_0",
    subject: "Physics",
    topic: "Electrostatics",
    importance: "Critical",
    difficulty: "Hard",
    duration: "Interactive Simulation",
    description: "Relates the net flux of an electric field passing through a closed Gaussian surface to the net charge enclosed by that surface.",
    variables: [
      { symbol: "Φ_E", meaning: "Net electric flux through the surface" },
      { symbol: "∮ E · dA", meaning: "Surface integral of electric field over a closed area" },
      { symbol: "Q_enclosed", meaning: "Total electric charge enclosed within the Gaussian surface" },
      { symbol: "ε_0", meaning: "Permittivity of free space constant (8.854 × 10^-12 F/m)" }
    ],
    thumbnail: "from-amber-600 to-orange-700",
    standard: "12"
  },
  {
    id: "phys-2",
    title: "Lens Maker's Formula",
    formula: "1/f = (n - 1) [ 1/R_1 - 1/R_2 ]",
    subject: "Physics",
    topic: "Ray Optics",
    importance: "High",
    difficulty: "Medium",
    duration: "Interactive Simulation",
    description: "Calculates the focal length of a lens based on the refractive index of its material and the radii of curvature of its surfaces.",
    variables: [
      { symbol: "f", meaning: "Focal length of the lens (where parallel rays focus)" },
      { symbol: "n", meaning: "Refractive index of the lens material relative to medium" },
      { symbol: "R_1", meaning: "Radius of curvature of the first refracting surface" },
      { symbol: "R_2", meaning: "Radius of curvature of the second refracting surface" }
    ],
    thumbnail: "from-orange-600 to-red-700",
    standard: "12"
  },
  {
    id: "phys-3",
    title: "Einstein's Photoelectric Equation",
    formula: "K_max = hν - Φ",
    subject: "Physics",
    topic: "Modern Physics & Dual Nature",
    importance: "Critical",
    difficulty: "Medium",
    duration: "Interactive Simulation",
    description: "Shows how incoming light packets (photons) strike a metal surface, releasing electrons if the frequency is above the threshold.",
    variables: [
      { symbol: "K_max", meaning: "Maximum kinetic energy of ejected photoelectrons" },
      { symbol: "h", meaning: "Planck's constant (6.626 × 10^-34 J·s)" },
      { symbol: "ν (nu)", meaning: "Frequency of incident light photons" },
      { symbol: "Φ (phi)", meaning: "Work function (minimum energy required to eject an electron)" }
    ],
    thumbnail: "from-pink-600 to-rose-700",
    standard: "12"
  },

  // CHEMISTRY
  {
    id: "chem-1",
    title: "Ideal Gas Law",
    formula: "P V = n R T",
    subject: "Chemistry",
    topic: "States of Matter & Gas Laws",
    importance: "Critical",
    difficulty: "Easy",
    duration: "Interactive Simulation",
    description: "Equation of state of an ideal gas, showing how pressure, volume, temperature, and quantity of gas relate dynamically.",
    variables: [
      { symbol: "P", meaning: "Pressure of the gas (collisions on container walls)" },
      { symbol: "V", meaning: "Volume occupied by the gas" },
      { symbol: "n", meaning: "Number of moles of gas (quantity)" },
      { symbol: "R", meaning: "Universal gas constant (8.314 J/(mol·K))" },
      { symbol: "T", meaning: "Absolute temperature of the gas in Kelvin (K)" }
    ],
    thumbnail: "from-emerald-600 to-teal-700",
    standard: "11"
  },
  {
    id: "chem-2",
    title: "Arrhenius Equation",
    formula: "k = A e^(-E_a / R T)",
    subject: "Chemistry",
    topic: "Chemical Kinetics",
    importance: "High",
    difficulty: "Medium",
    duration: "Interactive Simulation",
    description: "Describes how reaction rate constant increases exponentially as temperature increases, overcoming the activation energy barrier.",
    variables: [
      { symbol: "k", meaning: "Reaction rate constant" },
      { symbol: "A", meaning: "Pre-exponential frequency factor (frequency of collisions)" },
      { symbol: "E_a", meaning: "Activation energy of the reaction (J/mol)" },
      { symbol: "R", meaning: "Universal gas constant (8.314 J/(mol·K))" },
      { symbol: "T", meaning: "Absolute temperature in Kelvin (K)" }
    ],
    thumbnail: "from-teal-600 to-cyan-700",
    standard: "12"
  },
  {
    id: "chem-3",
    title: "Gibbs Free Energy Equation",
    formula: "ΔG = ΔH - T ΔS",
    subject: "Chemistry",
    topic: "Chemical Thermodynamics",
    importance: "Critical",
    difficulty: "Hard",
    duration: "Interactive Simulation",
    description: "Determines whether a chemical reaction occurs spontaneously at constant temperature and pressure.",
    variables: [
      { symbol: "ΔG", meaning: "Change in Gibbs free energy (spontaneous if negative)" },
      { symbol: "ΔH", meaning: "Change in enthalpy (heat absorbed or released)" },
      { symbol: "T", meaning: "Absolute temperature in Kelvin (K)" },
      { symbol: "ΔS", meaning: "Change in entropy (molecular disorder / randomness)" }
    ],
    thumbnail: "from-cyan-600 to-blue-700",
    standard: "11"
  }
];

export default function FormulaeHubPage() {
  const [activeSubject, setActiveSubject] = useState<"All" | "Mathematics" | "Physics" | "Chemistry">("All");
  const [activeStandard, setActiveStandard] = useState<"All" | "11" | "12">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  // Filters
  const filteredFormulae = FORMULAE_DATA.filter((f) => {
    const matchesSubject = activeSubject === "All" || f.subject === activeSubject;
    const matchesStandard = activeStandard === "All" || f.standard === activeStandard;
    const matchesSearch = 
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesStandard && matchesSearch;
  });

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "Mathematics": return "text-indigo-400 border-indigo-500/30 bg-indigo-500/5";
      case "Physics": return "text-amber-400 border-amber-500/30 bg-amber-500/5";
      case "Chemistry": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
      default: return "text-slate-400 border-slate-700 bg-slate-800/10";
    }
  };

  const getImportanceColor = (imp: string) => {
    switch (imp) {
      case "Critical": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <PortalLayout 
      title="HSC Formulae Simulations" 
      subtitle="Interact with complex Higher Secondary formulas for Board Exams & NEET/JEE using live animations"
    >
      <div className="flex flex-col gap-6">
        
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="flex-1 space-y-3 relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-purple-300 border border-purple-500/20 bg-purple-500/10 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Interactive Animations
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">Visual Concept Simulators</h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed font-medium">
              Instead of reading flat text or playing static videos, use our custom mathematical models to adjust variables, run animations, and discover the core logic behind the formulas.
            </p>
          </div>
          <div className="flex gap-4 relative z-10 shrink-0">
            <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-slate-850 px-5 py-4 rounded-2xl">
              <span className="text-2xl font-black text-purple-400">9</span>
              <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mt-1">Simulators</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-slate-850 px-5 py-4 rounded-2xl">
              <span className="text-2xl font-black text-blue-400">3</span>
              <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider mt-1">Subjects</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-md">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search formulas or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Class Filter Tabs */}
            <div className="flex gap-1 p-1 bg-slate-950/85 border border-slate-850 rounded-xl">
              {(["All", "11", "12"] as const).map((std) => (
                <button
                  key={std}
                  onClick={() => setActiveStandard(std)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeStandard === std 
                      ? "bg-indigo-600 text-white" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {std === "All" ? "All Classes" : `Class ${std}`}
                </button>
              ))}
            </div>

            {/* Subject Tabs */}
            <div className="flex gap-1 p-1 bg-slate-950/85 border border-slate-850 rounded-xl hide-scrollbar">
              {(["All", "Mathematics", "Physics", "Chemistry"] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeSubject === sub 
                      ? "bg-purple-650 text-white shadow-md shadow-purple-600/10" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Formulae Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormulae.map((formula) => (
            <div 
              key={formula.id} 
              className="group flex flex-col bg-slate-900/40 border border-slate-800 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              {/* Formula Render Box */}
              <div className={`relative h-36 bg-gradient-to-br ${formula.thumbnail} flex items-center justify-center p-6 text-center select-none`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent)]"></div>
                
                <span className="font-mono text-xl md:text-2xl font-black text-white relative z-10 drop-shadow-md">
                  {formula.formula}
                </span>

                {/* subject & class indicator tabs */}
                <div className="absolute top-3 left-3 flex gap-1">
                  <div className="bg-black/35 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider">
                    {formula.subject}
                  </div>
                  <div className="bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-purple-200 uppercase tracking-wider">
                    Class {formula.standard}
                  </div>
                </div>

                {/* Video/Animation Play Button Hint */}
                <button
                  onClick={() => setSelectedFormula(formula)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-lg text-[10px] font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-10"
                >
                  <Play className="w-3 h-3 fill-current text-purple-600" /> Open simulator
                </button>
              </div>

              {/* Details Section */}
              <div className="p-5 flex flex-col flex-1 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                      {formula.topic}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getImportanceColor(formula.importance)}`}>
                      {formula.importance} Importance
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-purple-400 transition-colors">
                    {formula.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {formula.description}
                </p>

                {/* Meta stats */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-semibold mt-auto">
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" /> Interactive Animation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" /> {formula.variables.length} variables
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredFormulae.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-center">
              <BookOpen className="w-12 h-12 text-slate-705 mb-3" />
              <h4 className="text-sm font-bold text-slate-400">No formulae found</h4>
              <p className="text-xs text-slate-600 mt-1">Try refining your keyword search or filtering another subject.</p>
            </div>
          )}
        </div>

        {/* Video Overlay Modal replaced with Interactive Simulation */}
        {selectedFormula && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative animate-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedFormula(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-slate-950/50 hover:bg-slate-950 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Simulation Canvas Side */}
              <div className="flex-1 bg-slate-950 flex flex-col min-h-[350px] lg:min-h-[480px]">
                <InteractiveSimulation formulaId={selectedFormula.id} />
              </div>

              {/* Formula details list Side */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 space-y-4 max-h-[350px] lg:max-h-[480px] overflow-y-auto">
                <div className="space-y-1">
                  <span className={`inline-block px-2 py-0.5 rounded border text-[8px] font-bold ${getSubjectColor(selectedFormula.subject)}`}>
                    {selectedFormula.subject}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedFormula.title}</h3>
                </div>

                <div className="bg-slate-950/55 border border-slate-850 p-3 rounded-xl flex items-center justify-center font-mono text-sm font-bold text-purple-400 py-4">
                  {selectedFormula.formula}
                </div>

                {/* Variable breakdowns */}
                <div className="space-y-3.5 pt-2">
                  <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Variable Breakdown
                  </h4>
                  <div className="space-y-2">
                    {selectedFormula.variables.map((v, i) => (
                      <div key={i} className="flex gap-2 text-xs leading-relaxed bg-slate-950/20 p-2 rounded-lg border border-slate-850">
                        <span className="font-mono text-purple-400 font-bold shrink-0">{v.symbol}</span>
                        <span className="text-slate-300">{v.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}

// ─── INTERACTIVE SIMULATION PANEL ───────────────────────────────────────────
function InteractiveSimulation({ formulaId }: { formulaId: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Custom states for each equation parameters
  const [sliderVal, setSliderVal] = useState(0.5); // general purpose slider
  const [sliderVal2, setSliderVal2] = useState(0.5); // optional secondary slider
  const timeRef = useRef(0);

  // Restart simulation
  const handleReset = () => {
    timeRef.current = 0;
    setSliderVal(0.5);
    setSliderVal2(0.5);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Handle resizing context
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const W = canvas.width;
      const H = canvas.height;
      
      // Clear
      ctx.fillStyle = "#020617"; // dark slate 950
      ctx.fillRect(0, 0, W, H);

      // Increment clock if playing
      if (isPlaying) {
        timeRef.current += 1;
      }

      // Draw Grid lines (Subtle)
      ctx.strokeStyle = "rgba(100, 116, 139, 0.08)";
      ctx.lineWidth = 1;
      const gap = 30;
      for (let x = 0; x < W; x += gap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ─── SPECIFIC FORMULA DRAWERS ───
      switch (formulaId) {
        case "math-1": {
          // Fundamental Theorem of Calculus: integral area
          // sliderVal = right integration limit
          const a = W * 0.25;
          const limitB = a + (W * 0.5) * sliderVal;
          
          // Draw function curve: f(x) = sin(x/40)*40 + 120
          ctx.beginPath();
          ctx.strokeStyle = "#8b5cf6"; // purple-500
          ctx.lineWidth = 3;
          
          const f = (x: number) => H * 0.6 - Math.sin((x - a) * 0.015) * 80;
          
          // Draw shaded integral area
          ctx.fillStyle = "rgba(139, 92, 246, 0.15)";
          ctx.beginPath();
          ctx.moveTo(a, H * 0.7);
          for (let x = a; x <= limitB; x++) {
            ctx.lineTo(x, f(x));
          }
          ctx.lineTo(limitB, H * 0.7);
          ctx.closePath();
          ctx.fill();

          // Draw Riemann columns (columns growing inside)
          ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
          ctx.lineWidth = 1;
          const step = 8;
          for (let x = a; x < limitB; x += step) {
            ctx.strokeRect(x, f(x), step, H * 0.7 - f(x));
          }

          // Draw baseline
          ctx.beginPath();
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 2;
          ctx.moveTo(W * 0.1, H * 0.7);
          ctx.lineTo(W * 0.9, H * 0.7);
          ctx.stroke();

          // Draw function curve path
          ctx.beginPath();
          ctx.strokeStyle = "#8b5cf6";
          ctx.lineWidth = 3;
          for (let x = W * 0.15; x <= W * 0.85; x++) {
            if (x === W * 0.15) ctx.moveTo(x, f(x));
            else ctx.lineTo(x, f(x));
          }
          ctx.stroke();

          // Markers
          ctx.fillStyle = "#a78bfa";
          ctx.font = "bold 12px sans-serif";
          ctx.fillText("a (lower limit)", a - 40, H * 0.75);
          ctx.fillText("b (upper limit)", limitB - 40, H * 0.75);

          ctx.beginPath();
          ctx.arc(a, H * 0.7, 5, 0, Math.PI * 2);
          ctx.arc(limitB, H * 0.7, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#8b5cf6";
          ctx.fill();

          // Numerical Area representation
          const computedArea = (sliderVal * 125).toFixed(2);
          ctx.fillStyle = "#fff";
          ctx.font = "14px monospace";
          ctx.fillText(`Area = ∫ f(x) dx ≈ ${computedArea} units²`, W * 0.3, H * 0.2);
          break;
        }

        case "math-2": {
          // Euler's Formula Circle
          const cx = W / 2;
          const cy = H / 2;
          const r = Math.min(W, H) * 0.3;
          
          // Draw unit circle
          ctx.beginPath();
          ctx.strokeStyle = "#475569";
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          // Draw complex plane axes
          ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
          ctx.beginPath();
          ctx.moveTo(cx - r - 20, cy); ctx.lineTo(cx + r + 20, cy);
          ctx.moveTo(cx, cy - r - 20); ctx.lineTo(cx, cy + r + 20);
          ctx.stroke();

          // Compute theta based on time + sliderVal
          const theta = (timeRef.current * 0.015) % (Math.PI * 2);
          const px = cx + r * Math.cos(theta);
          const py = cy - r * Math.sin(theta); // canvas Y is inverted

          // Project real part: cos(theta) (X projection)
          ctx.strokeStyle = "#3b82f6"; // blue
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, cy);
          ctx.stroke();

          // Project imaginary part: sin(theta) (Y projection)
          ctx.strokeStyle = "#10b981"; // green
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px, cy);
          ctx.lineTo(px, py);
          ctx.stroke();

          // Vector
          ctx.strokeStyle = "#8b5cf6"; // purple
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.stroke();

          // Angle arc
          ctx.strokeStyle = "#f59e0b";
          ctx.beginPath();
          ctx.arc(cx, cy, 30, -theta, 0, false);
          ctx.stroke();

          // Point
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();

          // Text metrics
          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#3b82f6";
          ctx.fillText(`Real: cos(θ) = ${Math.cos(theta).toFixed(2)}`, 20, 35);
          ctx.fillStyle = "#10b981";
          ctx.fillText(`Imag: i sin(θ) = ${Math.sin(theta).toFixed(2)}i`, 20, 55);
          ctx.fillStyle = "#f59e0b";
          ctx.fillText(`θ = ${(theta).toFixed(2)} rad (${Math.round(theta * 180 / Math.PI)}°)`, 20, 75);
          break;
        }

        case "math-3": {
          // Derivative of Sine
          // Left: sine wave + tangent line. Right: cosine wave tracking slope
          const startX = W * 0.05;
          const endX = W * 0.95;
          const rangeY = H * 0.25;
          const yCenter = H * 0.5;

          const sineF = (x: number) => Math.sin(x * 0.02 + timeRef.current * 0.02) * rangeY;

          // Plot Sine function (Purple)
          ctx.strokeStyle = "#8b5cf6";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let x = startX; x <= endX; x++) {
            if (x === startX) ctx.moveTo(x, yCenter + sineF(x));
            else ctx.lineTo(x, yCenter + sineF(x));
          }
          ctx.stroke();

          // Tangent point on X
          const tx = startX + (endX - startX) * sliderVal;
          const ty = yCenter + sineF(tx);

          // Calculate numerical slope: cos(x)
          const delta = 1;
          const slope = (sineF(tx + delta) - sineF(tx - delta)) / (2 * delta);

          // Draw tangent line
          const len = 50;
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(tx - len, ty - len * slope);
          ctx.lineTo(tx + len, ty + len * slope);
          ctx.stroke();

          // Draw tangent point dot
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(tx, ty, 6, 0, Math.PI * 2);
          ctx.fill();

          // Draw derivative tracker text
          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(`Tangent Slope (dy/dx) = ${slope.toFixed(2)}`, tx - 60, ty - 30);
          ctx.fillStyle = "#8b5cf6";
          ctx.fillText("Sine Wave y = sin(x)", 20, 30);
          break;
        }

        case "phys-1": {
          // Gauss's Law: Enclosed charge and radiating electric lines
          // sliderVal = surface radius, sliderVal2 = charge strength
          const cx = W / 2;
          const cy = H / 2;
          const chargeQ = (sliderVal2 - 0.5) * 40; // positive or negative
          
          // Draw source charge
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.fillStyle = chargeQ >= 0 ? "#ef4444" : "#3b82f6";
          ctx.fill();

          ctx.fillStyle = "#fff";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(chargeQ >= 0 ? "+" : "-", cx, cy + 5);
          ctx.textAlign = "start";

          // Radiating field lines
          const numLines = 12;
          ctx.strokeStyle = chargeQ >= 0 ? "rgba(239, 68, 68, 0.45)" : "rgba(59, 130, 246, 0.45)";
          ctx.lineWidth = 2;
          const speed = timeRef.current * 0.05 * (chargeQ >= 0 ? 1 : -1);

          for (let i = 0; i < numLines; i++) {
            const angle = (i * Math.PI * 2) / numLines;
            ctx.beginPath();
            const startDist = 18;
            const endDist = 140;
            const flowOffset = (speed % 1) * 20;

            const x1 = cx + Math.cos(angle) * startDist;
            const y1 = cy + Math.sin(angle) * startDist;
            const x2 = cx + Math.cos(angle) * endDist;
            const y2 = cy + Math.sin(angle) * endDist;

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Animated flow arrow indicators
            const arrowDist = startDist + 30 + ((i * 15 + flowOffset) % (endDist - startDist - 40));
            const ax = cx + Math.cos(angle) * arrowDist;
            const ay = cy + Math.sin(angle) * arrowDist;
            ctx.beginPath();
            ctx.arc(ax, ay, 3, 0, Math.PI * 2);
            ctx.fillStyle = chargeQ >= 0 ? "#f87171" : "#60a5fa";
            ctx.fill();
          }

          // Dotted Gaussian surface
          const surfaceR = 40 + sliderVal * 100;
          ctx.strokeStyle = "#f59e0b"; // yellow flux line
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(cx, cy, surfaceR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]); // clear dash

          // Net Flux text
          ctx.fillStyle = "#f59e0b";
          ctx.font = "bold 13px sans-serif";
          ctx.fillText(`Gaussian Surface Radius: ${Math.round(surfaceR)} pm`, 20, 30);
          ctx.fillText(`Net Electric Flux Φ_E = ${chargeQ.toFixed(1)} N·m²/C`, 20, 50);
          break;
        }

        case "phys-2": {
          // Lens Maker's Formula
          // Slider 1 = Index (n), Slider 2 = Curvature (R1, R2)
          const n = 1.1 + sliderVal * 0.9;
          const rCurvature = 50 + sliderVal2 * 120;
          
          const cx = W / 2;
          const cy = H / 2;
          
          // Draw thin double convex lens
          ctx.fillStyle = "rgba(96, 165, 250, 0.15)";
          ctx.strokeStyle = "#60a5fa";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          // First surface arc
          ctx.arc(cx - rCurvature + 12, cy, rCurvature, -Math.PI/6, Math.PI/6, false);
          // Second surface arc
          ctx.arc(cx + rCurvature - 12, cy, rCurvature, Math.PI - Math.PI/6, Math.PI + Math.PI/6, false);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Principal Axis
          ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(W * 0.05, cy);
          ctx.lineTo(W * 0.95, cy);
          ctx.stroke();

          // Calculate focal length: 1/f = (n - 1) * (2 / r) => f = r / (2 * (n - 1))
          const focalLength = rCurvature / (2 * (n - 1));
          const fx = cx + focalLength;

          // Draw incoming parallel light rays and refract them to focal point
          ctx.strokeStyle = "#e11d48"; // rose color
          ctx.lineWidth = 1.5;
          
          const rayHeights = [-35, -20, 20, 35];
          rayHeights.forEach((h) => {
            ctx.beginPath();
            // From left to lens
            ctx.moveTo(W * 0.05, cy + h);
            ctx.lineTo(cx, cy + h);
            // From lens to focal point
            ctx.lineTo(fx, cy);
            // Extended beyond focus
            const extX = fx + (fx - cx) * 0.5;
            const extY = cy - h * 0.5;
            ctx.lineTo(extX, extY);
            ctx.stroke();
          });

          // Focus indicator
          ctx.fillStyle = "#fb7185";
          ctx.beginPath();
          ctx.arc(fx, cy, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(`Refractive Index (n): ${n.toFixed(2)}`, 20, 30);
          ctx.fillText(`Surface Radius (R): ${Math.round(rCurvature)} mm`, 20, 50);
          ctx.fillStyle = "#fb7185";
          ctx.fillText(`Computed Focal Length (f): ${Math.round(focalLength)} mm`, 20, 75);
          break;
        }

        case "phys-3": {
          // Photoelectric Effect
          // sliderVal = Light Frequency (Energy), sliderVal2 = Work Function
          const energy = sliderVal * 12; // Frequency energy
          const workFunction = 2 + sliderVal2 * 6; // Metal limit
          
          const plateX = W * 0.5;

          // Metal plate base
          ctx.fillStyle = "#475569";
          ctx.fillRect(plateX, H * 0.25, 20, H * 0.5);

          // Draw incoming waves (Light packet photons)
          const wavelength = 50 - sliderVal * 35; // frequency inversely proportional
          ctx.strokeStyle = sliderVal > 0.6 ? "#a855f7" : (sliderVal > 0.3 ? "#eab308" : "#ef4444");
          ctx.lineWidth = 2.5;

          const numWaves = 3;
          for (let w = 0; w < numWaves; w++) {
            const waveY = H * 0.3 + w * 50;
            ctx.beginPath();
            for (let x = W * 0.05; x < plateX; x += 2) {
              const pulse = Math.sin(x / (wavelength * 0.2) - timeRef.current * 0.1) * 12;
              if (x === W * 0.05) ctx.moveTo(x, waveY + pulse);
              else ctx.lineTo(x, waveY + pulse);
            }
            ctx.stroke();
          }

          // If energy is greater than work function, eject electrons!
          const activeEjection = energy > workFunction;

          if (activeEjection) {
            // Ejected electron speed (kinetic energy)
            const speedFactor = (energy - workFunction) * 0.8;
            
            // Draw electrons flying right
            const numElectrons = 4;
            ctx.fillStyle = "#60a5fa"; // blue glowing electron particles
            for (let e = 0; e < numElectrons; e++) {
              const eY = H * 0.35 + e * 40;
              const travelOffset = (timeRef.current * speedFactor + e * 50) % (W * 0.4);
              const ex = plateX + 25 + travelOffset;
              
              ctx.beginPath();
              ctx.arc(ex, eY, 5, 0, Math.PI * 2);
              ctx.fill();

              // draw small direction vector
              ctx.strokeStyle = "#93c5fd";
              ctx.beginPath();
              ctx.moveTo(ex, eY);
              ctx.lineTo(ex + 8, eY);
              ctx.stroke();
            }
          }

          // Display statistics
          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(`Photon Energy (hν): ${energy.toFixed(1)} eV`, 20, 30);
          ctx.fillText(`Work Function (Φ): ${workFunction.toFixed(1)} eV`, 20, 50);

          if (activeEjection) {
            ctx.fillStyle = "#10b981";
            ctx.fillText(`Kinetic Energy (K_max): ${(energy - workFunction).toFixed(1)} eV [EJECTION SUCCESS]`, 20, 75);
          } else {
            ctx.fillStyle = "#ef4444";
            ctx.fillText("Energy < Work Function [NO ELECTRON EJECTED]", 20, 75);
          }
          break;
        }

        case "chem-1": {
          // Ideal Gas Law (PV = nRT)
          // sliderVal = Temperature, sliderVal2 = Volume (Box size)
          const temp = sliderVal * 10; // speeds up particles
          const widthBox = W * 0.3 + sliderVal2 * (W * 0.5);
          
          const boxX1 = (W - widthBox) / 2;
          const boxX2 = boxX1 + widthBox;
          const boxY1 = H * 0.25;
          const boxY2 = H * 0.75;

          // Draw containment box
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 3;
          ctx.strokeRect(boxX1, boxY1, widthBox, H * 0.5);

          // Particle gas simulation
          const numParticles = 18;
          ctx.fillStyle = "#34d399"; // Green gas particles
          
          // Seed-like math to draw bouncy particles
          for (let i = 0; i < numParticles; i++) {
            // Speed depends on temperature
            const speed = 1.5 + temp * 0.6;
            const angle = (i * 123.45) % (Math.PI * 2);
            
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;

            // Compute positions wrapping around bounds to keep it simple & deterministic
            const boxW = widthBox - 12;
            const boxH = (H * 0.5) - 12;

            const t = timeRef.current;
            const posX = boxX1 + 6 + Math.abs((i * 45 + t * dx) % (boxW * 2) - boxW);
            const posY = boxY1 + 6 + Math.abs((i * 72 + t * dy) % (boxH * 2) - boxH);

            ctx.beginPath();
            ctx.arc(posX, posY, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Calculate Pressure P = nRT/V. P increases as T increases, decreases as V increases.
          const pressure = (5 * temp) / (widthBox / 100);

          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(`Temperature (T): ${Math.round(200 + temp * 50)} Kelvin`, 20, 30);
          ctx.fillText(`Volume (V): ${Math.round(widthBox)} L`, 20, 50);
          ctx.fillStyle = "#34d399";
          ctx.fillText(`System Pressure (P): ${pressure.toFixed(2)} atm`, 20, 75);
          break;
        }

        case "chem-2": {
          // Arrhenius Equation (Collisions crossing activation peak)
          // sliderVal = Temperature (speed), sliderVal2 = Ea (Activation Energy)
          const temp = sliderVal * 10;
          const ea = sliderVal2 * 120; // peak height

          // Draw potential energy barrier curve
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(W * 0.1, H * 0.7);
          ctx.quadraticCurveTo(W * 0.5, H * 0.7 - ea * 2.2, W * 0.9, H * 0.7);
          ctx.stroke();

          // Label Ea Peak
          ctx.fillStyle = "#f43f5e";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(`Activation Energy (Ea) = ${Math.round(ea)} kJ`, W * 0.45, H * 0.7 - ea * 2.2 - 10);

          // Render moving molecules going left to right
          const speed = 1 + temp * 0.6;
          const moleculesCount = 6;
          for (let m = 0; m < moleculesCount; m++) {
            const timeOffset = (timeRef.current * speed + m * 80) % (W * 0.85);
            const mx = W * 0.1 + timeOffset;
            
            // Map height to curves
            const progress = timeOffset / (W * 0.85); // 0 to 1
            const baseCurve = Math.sin(progress * Math.PI); // 0 to 1 back to 0
            const my = H * 0.7 - baseCurve * ea * 2.2;

            // Check if molecules have enough energy to cross
            // Higher speed makes them look energetic (red/green transition)
            const canCross = speed > 3.5;
            
            ctx.beginPath();
            ctx.arc(mx, my, 7, 0, Math.PI * 2);
            ctx.fillStyle = canCross ? "#10b981" : "#f43f5e"; // green if reacted, red if not
            ctx.fill();

            // Label reaction state
            if (m === 0) {
              ctx.font = "bold 11px sans-serif";
              ctx.fillStyle = "#fff";
              ctx.fillText(canCross ? "REACTANTS ACQUIRED ENERGY" : "BOUNCED BACK", mx - 40, my - 15);
            }
          }

          // Display reaction constant
          const rateConstant = Math.exp(-ea / (8.314 * (temp + 2)));
          ctx.font = "bold 13px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(`System Temp (T): ${(273 + temp * 15).toFixed(0)} K`, 20, 30);
          ctx.fillStyle = "#10b981";
          ctx.fillText(`Rate Constant k (fraction of successful collisions): ${(rateConstant * 100).toFixed(4)} %`, 20, 55);
          break;
        }

        case "chem-3": {
          // Gibbs Free Energy (ΔG = ΔH - T ΔS)
          // sliderVal = Enthalpy ΔH, sliderVal2 = Entropy ΔS
          const deltaH = (sliderVal - 0.5) * 200; // -100 to +100
          const deltaS = (sliderVal2 - 0.5) * 2.0; // -1 to +1
          const temp = 298; // constant Room Temp
          
          const deltaG = deltaH - temp * deltaS;

          // Draw balance board or scale representations
          const cx = W / 2;
          const cy = H * 0.6;
          
          // Tilt depends on deltaG
          const tilt = Math.max(-0.25, Math.min(0.25, deltaG / 300));

          // Draw support pillar
          ctx.fillStyle = "#334155";
          ctx.fillRect(cx - 8, cy, 16, H * 0.3);

          // Draw balance arm tilted
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 5;
          ctx.beginPath();
          const armLen = 140;
          const ax1 = cx - armLen * Math.cos(tilt);
          const ay1 = cy - armLen * Math.sin(tilt);
          const ax2 = cx + armLen * Math.cos(tilt);
          const ay2 = cy + armLen * Math.sin(tilt);
          ctx.moveTo(ax1, ay1);
          ctx.lineTo(ax2, ay2);
          ctx.stroke();

          // Left weight: enthalpy ΔH
          ctx.fillStyle = deltaH >= 0 ? "#ef4444" : "#3b82f6"; // red represents hot/endothermic, blue represents cold/exothermic
          ctx.beginPath();
          ctx.arc(ax1, ay1 + 20, 15 + Math.abs(deltaH)*0.15, 0, Math.PI*2);
          ctx.fill();
          
          ctx.font = "bold 12px sans-serif";
          ctx.fillStyle = "#fff";
          ctx.fillText(`ΔH: ${deltaH.toFixed(0)} kJ`, ax1 - 30, ay1 + 50);

          // Right weight: TΔS
          const tds = temp * deltaS;
          ctx.fillStyle = tds >= 0 ? "#10b981" : "#f59e0b"; // green for high entropy, orange for low
          ctx.beginPath();
          ctx.arc(ax2, ay2 + 20, 15 + Math.abs(tds)*0.05, 0, Math.PI*2);
          ctx.fill();

          ctx.fillText(`TΔS: ${tds.toFixed(0)} kJ`, ax2 - 35, ay2 + 50);

          // Spontaneity alert box
          ctx.textAlign = "center";
          ctx.font = "bold 15px sans-serif";
          if (deltaG < 0) {
            ctx.fillStyle = "#10b981";
            ctx.fillText(`ΔG = ${deltaG.toFixed(0)} kJ [SPONTANEOUS REACTION]`, cx, H * 0.25);
          } else {
            ctx.fillStyle = "#ef4444";
            ctx.fillText(`ΔG = ${deltaG.toFixed(0)} kJ [NON-SPONTANEOUS]`, cx, H * 0.25);
          }
          ctx.textAlign = "start";
          break;
        }

        default:
          break;
      }
    };

    let frameId: number;
    const loop = () => {
      render();
      frameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [formulaId, isPlaying, sliderVal, sliderVal2]);

  // Render controls based on formula
  const getSliders = () => {
    switch (formulaId) {
      case "math-1":
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Change upper limit (b)</span>
              <span className="text-purple-400 font-bold">{sliderVal.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.1" max="1" step="0.01" 
              value={sliderVal} 
              onChange={(e) => setSliderVal(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        );
      case "math-2":
        return (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Circular rotation speed is auto-played</span>
          </div>
        );
      case "math-3":
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Slide Tangent Position (x)</span>
              <span className="text-purple-400 font-bold">{sliderVal.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.05" max="0.95" step="0.01" 
              value={sliderVal} 
              onChange={(e) => setSliderVal(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        );
      case "phys-1":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Gaussian Surface Size</span>
                <span className="text-amber-400 font-bold">{sliderVal.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.1" max="1" step="0.01" 
                value={sliderVal} 
                onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Core Charge Strength & Sign</span>
                <span className="text-amber-400 font-bold">{(sliderVal2 - 0.5).toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.0" max="1.0" step="0.05" 
                value={sliderVal2} 
                onChange={(e) => setSliderVal2(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        );
      case "phys-2":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Refractive Index (n)</span>
                <span className="text-rose-400 font-bold">{(1.1 + sliderVal * 0.9).toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0.0" max="1.0" step="0.02" 
                value={sliderVal} 
                onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Lens Radius of Curvature (R)</span>
                <span className="text-rose-400 font-bold">{Math.round(50 + sliderVal2 * 120)} mm</span>
              </div>
              <input 
                type="range" min="0.0" max="1.0" step="0.02" 
                value={sliderVal2} 
                onChange={(e) => setSliderVal2(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        );
      case "phys-3":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Light Photon Frequency (Energy)</span>
                <span className="text-pink-400 font-bold">{(sliderVal * 12).toFixed(1)} eV</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.02" 
                value={sliderVal} 
                onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Metal Work Function (Φ Barrier)</span>
                <span className="text-pink-400 font-bold">{(2 + sliderVal2 * 6).toFixed(1)} eV</span>
              </div>
              <input 
                type="range" min="0.0" max="1.0" step="0.05" 
                value={sliderVal2} 
                onChange={(e) => setSliderVal2(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>
        );
      case "chem-1":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Container Temperature (T)</span>
                <span className="text-emerald-400 font-bold">{Math.round(200 + sliderVal * 250)} K</span>
              </div>
              <input 
                type="range" min="0.05" max="1.0" step="0.02" 
                value={sliderVal} 
                onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Container Width (Volume)</span>
                <span className="text-emerald-400 font-bold">{Math.round(30 + sliderVal2 * 70)} %</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.02" 
                value={sliderVal2} 
                onChange={(e) => setSliderVal2(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        );
      case "chem-2":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Reaction Temperature (T)</span>
                <span className="text-teal-400 font-bold">{Math.round(273 + sliderVal * 150)} K</span>
              </div>
              <input 
                type="range" min="0.05" max="1.0" step="0.02" 
                value={sliderVal} 
                onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Activation Energy Peak (Ea)</span>
                <span className="text-teal-400 font-bold">{Math.round(sliderVal2 * 120)} kJ/mol</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.02" 
                value={sliderVal2} 
                onChange={(e) => setSliderVal2(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>
        );
      case "chem-3":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Enthalpy Change (ΔH)</span>
                <span className="text-cyan-405 font-bold">{((sliderVal - 0.5) * 200).toFixed(0)} kJ</span>
              </div>
              <input 
                type="range" min="0.0" max="1.0" step="0.02" 
                value={sliderVal} 
                onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Entropy Change (ΔS)</span>
                <span className="text-cyan-405 font-bold">{((sliderVal2 - 0.5) * 2.0).toFixed(2)} kJ/K</span>
              </div>
              <input 
                type="range" min="0.0" max="1.0" step="0.02" 
                value={sliderVal2} 
                onChange={(e) => setSliderVal2(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Simulation Title bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-4">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Live Simulation Model
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
          >
            {isPlaying ? "Pause model" : "Play model"}
          </button>
          <button 
            onClick={handleReset}
            className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-all cursor-pointer"
            title="Reset variables"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Screen area */}
      <div className="flex-1 min-h-[220px] relative">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Control panel */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjust Variables</span>
        </div>
        {getSliders()}
      </div>
    </div>
  );
}
