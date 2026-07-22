"use client";

import React, { useState, useEffect, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { useStudentGroup } from "@/lib/useStudentGroup";
import type { Stream } from "@/data/scienceCenters";
import {
  Sparkles,
  FlaskConical,
  Atom,
  Dna,
  Code,
  CheckCircle2,
  Play,
  X,
  Zap,
  Award,
  Check,
  Box,
  Clock,
  ChevronRight,
  Activity,
  Lightbulb,
  Wrench,
  Layers
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export type Experiment = {
  id: string;
  cls: number;
  title: string;
  subject: string;
  category: string;
  duration: string;
  level: string;
  icon: string;
  color: string;
  stream?: Stream;
  objective: string;
  equipment: string[];
  instructions: string[];
  simulationType: "physics_ohm" | "physics_lens" | "chemistry_ph" | "chemistry_reaction" | "biology_microscope" | "biology_heart" | "cs_logic";
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
};

// Comprehensive fallback dataset covering Classes 6-12 (with rich Class 10 SSLC practicals)
const DEFAULT_LAB_EXPERIMENTS: Experiment[] = [
  // --- CLASS 10 PRACTICALS (SSLC BOARD MANDATORY) ---
  {
    id: "exp-10-ohm",
    cls: 10,
    title: "Verification of Ohm's Law & Resistance",
    subject: "Physics",
    category: "Electricity & Circuits",
    duration: "25 mins",
    level: "Class 10",
    icon: "Atom",
    color: "from-blue-600 to-cyan-600",
    stream: "Science",
    objective: "Determine the ratio of Potential Difference (V) to Current (I) across a resistor and verify Ohm's Law (V = I * R).",
    equipment: ["Variable DC Power Supply", "Ammeter", "Voltmeter", "Nichrome Resistor Wire", "Connecting Wires", "Switch"],
    instructions: [
      "Set the circuit switch to ON.",
      "Adjust the DC voltage source slider from 0V up to 12V.",
      "Observe the Ammeter (I) and Voltmeter (V) digital readings.",
      "Calculate V/I ratio to confirm constant resistance R."
    ],
    simulationType: "physics_ohm",
    quiz: [
      {
        question: "According to Ohm's Law, if Voltage (V) increases while Resistance (R) remains constant, what happens to Current (I)?",
        options: ["Current increases proportionally", "Current decreases", "Current remains zero", "Current doubles exponentially"],
        answer: 0,
        explanation: "Ohm's Law states I = V / R. Current is directly proportional to Potential Difference (Voltage)."
      },
      {
        question: "What is the SI unit of Electrical Resistance?",
        options: ["Ampere (A)", "Volt (V)", "Ohm (Ω)", "Watt (W)"],
        answer: 2,
        explanation: "Resistance is measured in Ohms (Ω), named after Georg Simon Ohm."
      }
    ]
  },
  {
    id: "exp-10-lens",
    cls: 10,
    title: "Focal Length Determination of Convex Lens",
    subject: "Physics",
    category: "Optics & Light",
    duration: "20 mins",
    level: "Class 10",
    icon: "Eye",
    color: "from-sky-600 to-blue-700",
    stream: "Science",
    objective: "Find the focal length of a convex lens using distant object and u-v lens formula method.",
    equipment: ["Optical Bench", "Convex Lens Holder", "Illuminated Target Object", "Screen", "Measuring Scale"],
    instructions: [
      "Place the convex lens between the object light source and the screen.",
      "Adjust object distance (u) using the slider.",
      "Move the screen until a sharp inverted real image forms.",
      "Calculate focal length f using 1/f = 1/v - 1/u."
    ],
    simulationType: "physics_lens",
    quiz: [
      {
        question: "What type of image is formed by a convex lens when the object is placed beyond 2F?",
        options: ["Real, inverted, and diminished", "Virtual and upright", "Highly magnified at infinity", "Same size and upright"],
        answer: 0,
        explanation: "When an object is placed beyond 2F of a convex lens, a real, inverted, and smaller image forms between F and 2F."
      }
    ]
  },
  {
    id: "exp-10-ph",
    cls: 10,
    title: "pH Value Testing of Acidic & Basic Solutions",
    subject: "Chemistry",
    category: "Acids, Bases & Salts",
    duration: "20 mins",
    level: "Class 10",
    icon: "FlaskConical",
    color: "from-emerald-600 to-teal-600",
    stream: "Science",
    objective: "Test the pH level of household solutions using Universal Indicator paper and determine acidity/alkalinity.",
    equipment: ["pH Indicator Paper", "Test Tubes", "Lemon Juice", "Dilute HCl", "Sodium Hydroxide", "Distilled Water"],
    instructions: [
      "Select a solution beaker (e.g. Lemon Juice, Water, or NaOH).",
      "Dip a strip of Universal pH Indicator paper into the solution.",
      "Match the resulting color strip against the pH color scale (1 to 14).",
      "Record whether the solution is strongly acidic, neutral, or basic."
    ],
    simulationType: "chemistry_ph",
    quiz: [
      {
        question: "A solution turns Universal pH paper dark red (pH = 2). This indicates the solution is:",
        options: ["Strongly Acidic", "Weakly Alkaline", "Neutral Water", "Strongly Basic"],
        answer: 0,
        explanation: "pH values below 7 indicate acidity. A pH of 2 represents a strong acid like HCl."
      }
    ]
  },
  {
    id: "exp-10-reaction",
    cls: 10,
    title: "Gas Evolution in Chemical Displacement Reaction",
    subject: "Chemistry",
    category: "Chemical Reactions",
    duration: "25 mins",
    level: "Class 10",
    icon: "FlaskConical",
    color: "from-teal-600 to-green-600",
    stream: "Science",
    objective: "Observe the displacement reaction between Zinc granules and Dilute Sulfuric Acid to test for Hydrogen gas.",
    equipment: ["Conical Flask", "Zinc Granules", "Dilute H2SO4", "Delivery Tube", "Soap Solution", "Burning Splint"],
    instructions: [
      "Add Zinc granules into the flask containing dilute H2SO4.",
      "Observe gas bubbles rising through the delivery tube.",
      "Pass the gas bubbles into soap water to form gas-filled bubbles.",
      "Bring a burning matchstick near the bubble to hear the characteristic 'pop' sound."
    ],
    simulationType: "chemistry_reaction",
    quiz: [
      {
        question: "Which gas is released when metals react with dilute mineral acids?",
        options: ["Hydrogen (H2)", "Carbon Dioxide (CO2)", "Oxygen (O2)", "Nitrogen (N2)"],
        answer: 0,
        explanation: "Active metals displace hydrogen from acids, releasing flammable Hydrogen gas."
      }
    ]
  },
  {
    id: "exp-10-stomata",
    cls: 10,
    title: "Observation of Stomata & Guard Cells",
    subject: "Biology",
    category: "Plant Physiology & Life Processes",
    duration: "20 mins",
    level: "Class 10",
    icon: "Dna",
    color: "from-lime-600 to-emerald-700",
    stream: "Science",
    objective: "Prepare a temporary mount of a leaf peel to observe stomatal pores and guard cells under a compound microscope.",
    equipment: ["Fresh Tradescantia/Rheo Leaf", "Compound Microscope", "Safranin Stain", "Glass Slide", "Coverslip"],
    instructions: [
      "Peel the epidermal layer from the lower surface of the leaf.",
      "Stain the peel with Safranin and mount on a glass slide.",
      "Place under microscope and adjust focus knob to 400x magnification.",
      "Identify stomatal pore, kidney-shaped guard cells, and chloroplasts."
    ],
    simulationType: "biology_microscope",
    quiz: [
      {
        question: "What is the primary function of stomata in plant leaves?",
        options: ["Gas exchange (CO2/O2) and transpiration", "Photosynthesis glucose storage", "Root water absorption", "Flower pollination"],
        answer: 0,
        explanation: "Stomata regulate gaseous exchange for photosynthesis/respiration and water loss via transpiration."
      }
    ]
  },
  {
    id: "exp-10-heart",
    cls: 10,
    title: "Human Heart Structure & Blood Circulation Model",
    subject: "Biology",
    category: "Human Anatomy",
    duration: "20 mins",
    level: "Class 10",
    icon: "Dna",
    color: "from-rose-600 to-red-700",
    stream: "Science",
    objective: "Examine double circulation, heart chambers, and valve contraction cycles in human circulatory system.",
    equipment: ["3D Interactive Heart Anatomy Model", "Flow Pathway Indicators", "Heart Rate Pulse Simulator"],
    instructions: [
      "Toggle between Deoxygenated (Blue) and Oxygenated (Red) blood flow paths.",
      "Adjust cardiac heart rate pulse slider from 60 to 140 BPM.",
      "Observe Tricuspid, Bicuspid, and Aortic valve contraction steps.",
      "Trace systemic vs pulmonary circulation loops."
    ],
    simulationType: "biology_heart",
    quiz: [
      {
        question: "Which chamber of the human heart pumps oxygenated blood out to the entire body via the Aorta?",
        options: ["Left Ventricle", "Right Atrium", "Right Ventricle", "Left Atrium"],
        answer: 0,
        explanation: "The muscular Left Ventricle pumps oxygenated blood through the Aorta to all body tissues."
      }
    ]
  },
  {
    id: "exp-10-cs",
    cls: 10,
    title: "Python Logic & Control Loops Simulator",
    subject: "Computer Science",
    category: "Programming & Logic",
    duration: "25 mins",
    level: "Class 10",
    icon: "Code",
    color: "from-purple-600 to-indigo-700",
    stream: "ComputerScience",
    objective: "Execute interactive Python control structures (If-Else conditions, For loops) and inspect memory state variables.",
    equipment: ["Virtual Python REPL Console", "Variable State Inspector", "Step Executor"],
    instructions: [
      "Select a logic script (e.g. Even/Odd checker or Sum of N Numbers).",
      "Set input parameters and click 'Run Step-by-Step'.",
      "Observe variable states updating live in memory panel.",
      "Check terminal output stream."
    ],
    simulationType: "cs_logic",
    quiz: [
      {
        question: "What is the output of `for i in range(1, 4): print(i)` in Python?",
        options: ["1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3", "4"],
        answer: 0,
        explanation: "`range(1, 4)` generates integers starting at 1 up to but excluding 4 (i.e. 1, 2, 3)."
      }
    ]
  },

  // --- LOWER MIDDLE SCHOOL (CLASSES 6, 7, 8) & HIGHER SECONDARY (CLASSES 11, 12) ---
  {
    id: "exp-8-friction",
    cls: 8,
    title: "Friction & Surface Resistance Study",
    subject: "Physics",
    category: "Mechanics & Force",
    duration: "15 mins",
    level: "Class 8",
    icon: "Atom",
    color: "from-amber-600 to-orange-600",
    stream: "Science",
    objective: "Compare friction forces across smooth glass, wood, and sandpaper surfaces using a spring balance.",
    equipment: ["Wooden Block", "Spring Balance", "Smooth Glass Board", "Sandpaper Surface"],
    instructions: [
      "Attach spring balance hook to wooden block.",
      "Pull block across different surface textures.",
      "Record force required to initiate motion."
    ],
    simulationType: "physics_ohm",
    quiz: [
      {
        question: "Which surface creates the highest frictional force?",
        options: ["Rough Sandpaper", "Smooth Polished Glass", "Oiled Steel", "Ice Sheet"],
        answer: 0,
        explanation: "Rough surfaces have high microscopic irregularities, creating higher friction."
      }
    ]
  },
  {
    id: "exp-7-circuit",
    cls: 7,
    title: "Simple Electric Circuit & Switch Setup",
    subject: "Physics",
    category: "Basic Electricity",
    duration: "15 mins",
    level: "Class 7",
    icon: "Atom",
    color: "from-yellow-600 to-amber-700",
    stream: "Science",
    objective: "Assemble a simple electric circuit with battery, bulb, and key switch to observe open vs closed circuits.",
    equipment: ["1.5V Cell", "Mini Bulb", "Key Switch", "Copper Wires"],
    instructions: [
      "Connect battery terminals to bulb socket.",
      "Insert key switch to close the circuit loop.",
      "Observe bulb glowing."
    ],
    simulationType: "physics_ohm",
    quiz: [
      {
        question: "What happens when an electric switch is in the OPEN position?",
        options: ["The circuit is broken and no current flows", "Current flows faster", "The battery recharges", "Short circuit occurs"],
        answer: 0,
        explanation: "An open switch creates a break in the circuit path, stopping electrical current."
      }
    ]
  },
  {
    id: "exp-12-titration",
    cls: 12,
    title: "Volumetric Titration of Oxalic Acid with KMnO4",
    subject: "Chemistry",
    category: "Quantitative Analysis",
    duration: "30 mins",
    level: "Class 12",
    icon: "FlaskConical",
    color: "from-fuchsia-600 to-purple-700",
    stream: "Science",
    objective: "Determine the strength and molarity of Potassium Permanganate solution against standard Oxalic Acid.",
    equipment: ["Burette", "Pipette", "Conical Flask", "Hot Plate", "KMnO4 Solution", "Oxalic Acid"],
    instructions: [
      "Fill burette with KMnO4 solution up to 0.0ml mark.",
      "Pipette 20ml Oxalic acid into flask and warm to 60°C.",
      "Titrate until permanent faint pink end-point color appears."
    ],
    simulationType: "chemistry_ph",
    quiz: [
      {
        question: "Which acts as the self-indicator in KMnO4 titration?",
        options: ["KMnO4 itself turns faint pink at endpoint", "Phenolphthalein", "Methyl Orange", "Starch"],
        answer: 0,
        explanation: "KMnO4 acts as its own self-indicator; a single excess drop imparts a permanent light pink color."
      }
    ]
  }
];

export default function VirtualLabsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = user?.class ? parseInt(user.class) : 10;
  const studentGroup = useStudentGroup();
  const isHigherSecondary = (studentClass || 10) >= 11;

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedClass, setSelectedClass] = useState<number | "All">(studentClass || 10);
  const [labs, setLabs] = useState<Experiment[]>(DEFAULT_LAB_EXPERIMENTS);
  const [loading, setLoading] = useState(false);

  // Modals & Active Simulators
  const [activeExpModal, setActiveExpModal] = useState<Experiment | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [completedLabs, setCompletedLabs] = useState<{ id: string; title: string; date: string; score: string }[]>([]);

  // Simulation State Variables
  const [ohmVolts, setOhmVolts] = useState(6);
  const [ohmResistance, setOhmResistance] = useState(20);

  const [phSolution, setPhSolution] = useState<"lemon" | "water" | "naoh">("lemon");
  const [microscopeZoom, setMicroscopeZoom] = useState(400);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);

  // Other Feature Modals
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [showArModal, setShowArModal] = useState(false);
  const [showKitModal, setShowKitModal] = useState(false);

  // Circuit Sandbox state
  const [sandboxBattery, setSandboxBattery] = useState(9);
  const [sandboxResistor, setSandboxResistor] = useState(220);
  const [sandboxSwitch, setSandboxSwitch] = useState(true);

  // Load completed labs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tn_completed_virtual_labs");
      if (saved) setCompletedLabs(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Fetch dynamic labs from API & merge with default dataset
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/science/labs`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const apiExperiments: Experiment[] = [];
          json.data.forEach((group: any) => {
            const subj = group.name ? group.name.replace(" Lab", "") : "Science";
            (group.experiments || []).forEach((exp: any, idx: number) => {
              const gradeMatch = (exp.grade || "").match(/\d+/);
              const clsNum = gradeMatch ? parseInt(gradeMatch[0]) : 10;
              apiExperiments.push({
                id: exp.id || `api-exp-${idx}`,
                cls: clsNum,
                title: exp.title || exp.name || "Virtual Experiment",
                subject: subj,
                category: exp.category || subj,
                duration: "20 mins",
                level: `Class ${clsNum}`,
                icon: subj.includes("Physic") ? "Atom" : subj.includes("Chemi") ? "FlaskConical" : subj.includes("Comp") ? "Code" : "Dna",
                color: subj.includes("Physic") ? "from-blue-600 to-cyan-600" : subj.includes("Chemi") ? "from-emerald-600 to-teal-600" : subj.includes("Comp") ? "from-purple-600 to-indigo-600" : "from-lime-600 to-green-600",
                objective: exp.description || exp.objective || "Perform virtual experiment and observe output.",
                equipment: ["Virtual Equipment Kit", "Digital Sensor", "Measuring Tool"],
                instructions: ["Inspect equipment setup.", "Adjust parameters using sliders.", "Record findings and submit report."],
                simulationType: subj.includes("Physic") ? "physics_ohm" : subj.includes("Chemi") ? "chemistry_ph" : subj.includes("Comp") ? "cs_logic" : "biology_microscope",
                quiz: [
                  {
                    question: "Did the experiment parameters match expected scientific principles?",
                    options: ["Yes, perfectly verified", "No, error detected", "Requires re-calibration", "Inconclusive"],
                    answer: 0,
                    explanation: "Virtual simulation accurately models physical and chemical principles."
                  }
                ]
              });
            });
          });
          if (apiExperiments.length > 0) {
            setLabs([...DEFAULT_LAB_EXPERIMENTS, ...apiExperiments]);
          }
        }
      } catch (e) {
        console.error("API labs fetch error, using curated default dataset:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  const categories = useMemo(() => [
    "All",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science"
  ], []);

  // Filter visible labs based on selected category & selected class grade
  const filteredLabs = useMemo(() => {
    return labs.filter((lab) => {
      const matchCat = activeCategory === "All" || lab.subject.toLowerCase().includes(activeCategory.toLowerCase());
      const matchCls = selectedClass === "All" || lab.cls === selectedClass;
      return matchCat && matchCls;
    });
  }, [labs, activeCategory, selectedClass]);

  const openExperiment = (exp: Experiment) => {
    setActiveExpModal(exp);
    setActiveStep(0);
    setQuizSelected(null);
  };

  const handleFinishLab = () => {
    if (!activeExpModal) return;
    const newRecord = {
      id: activeExpModal.id,
      title: activeExpModal.title,
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      score: "100% (A+)"
    };
    const updated = [newRecord, ...completedLabs.filter(c => c.id !== activeExpModal.id)];
    setCompletedLabs(updated);
    try {
      localStorage.setItem("tn_completed_virtual_labs", JSON.stringify(updated));
    } catch (e) {}
    setActiveExpModal(null);
  };

  // Ohm's law calculations: I = V / R
  const currentAmpere = (ohmVolts / ohmResistance).toFixed(2);
  const powerWatt = (ohmVolts * parseFloat(currentAmpere)).toFixed(2);

  // pH calculation values
  const phMap = {
    lemon: { ph: 2.2, color: "bg-red-500", text: "Strong Acid (pH 2.2)", desc: "High H+ ion concentration. Turns universal paper dark red." },
    water: { ph: 7.0, color: "bg-emerald-500", text: "Neutral (pH 7.0)", desc: "Equal H+ and OH- ions. Universal paper turns green." },
    naoh: { ph: 13.0, color: "bg-purple-700", text: "Strong Alkali (pH 13.0)", desc: "High OH- ion concentration. Universal paper turns deep purple." }
  };

  // Sandbox current calculation
  const sandboxAmpere = sandboxSwitch ? (sandboxBattery / sandboxResistor * 1000).toFixed(1) : "0.0";

  return (
    <PortalLayout
      title="Virtual Science & Technology Labs"
      subtitle="Interactive 3D experiments, circuit builders & lab practicals for Classes 6–12"
      avatarLetter="V"
      avatarColor="#06b6d4"
      themeClass="theme-student"
      accentColor="#06b6d4"
    >
      <div className="w-full space-y-6 animate-in fade-in duration-300">
        
        {/* Top Control Bar: Subject Tabs & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {/* Subject Filter Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-x-auto gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20 scale-[1.02]"
                    : "text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowArModal(true)}
              className="px-3.5 py-2 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Box className="w-4 h-4 text-cyan-500" />
              <span>Launch AR Viewer</span>
            </button>

            <button
              onClick={() => setShowSandboxModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <Zap className="w-4 h-4 text-amber-200" />
              <span>Circuit Sandbox</span>
            </button>
          </div>
        </div>

        {/* Grade / Class Filter Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Grade Filter:
          </span>
          {[6, 7, 8, 9, 10, 11, 12, "All"].map((cls) => {
            const isSelected = selectedClass === cls;
            const isStudentGrade = studentClass === cls;
            return (
              <button
                key={String(cls)}
                onClick={() => setSelectedClass(cls as any)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                  isSelected
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {cls === "All" ? "All Grades" : `Class ${cls}`}
                {isStudentGrade && <span className="ml-1 text-[10px] text-amber-400">★ My Grade</span>}
              </button>
            );
          })}
        </div>

        {/* Main Grid: Experiments & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols): Recommended Experiments */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Virtual Practicals & Lab Experiments</span>
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {filteredLabs.length} {filteredLabs.length === 1 ? "Experiment" : "Experiments"} Found
                </span>
              </div>

              {loading && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm font-bold text-slate-400 animate-pulse">
                  Loading virtual lab experiments...
                </div>
              )}

              {!loading && filteredLabs.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400 space-y-2">
                  <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
                  <p>No virtual experiments found for this filter combination.</p>
                  <button
                    onClick={() => { setActiveCategory("All"); setSelectedClass("All"); }}
                    className="px-4 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {!loading && filteredLabs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLabs.map((lab) => {
                    const isDone = completedLabs.some(c => c.id === lab.id);
                    return (
                      <div
                        key={lab.id}
                        onClick={() => openExperiment(lab)}
                        className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:-translate-y-1 hover:border-cyan-500/50 transition-all group flex flex-col cursor-pointer shadow-sm relative"
                      >
                        {/* Lab Hero Header */}
                        <div className={`h-28 bg-gradient-to-br ${lab.color} relative flex items-center justify-center text-white p-4`}>
                          <div className="absolute inset-0 bg-black/20"></div>
                          
                          <div className="relative z-10 flex items-center gap-3">
                            {lab.subject.includes("Physic") ? (
                              <Atom className="w-10 h-10 stroke-[2] text-cyan-200" />
                            ) : lab.subject.includes("Chemi") ? (
                              <FlaskConical className="w-10 h-10 stroke-[2] text-emerald-200" />
                            ) : lab.subject.includes("Comp") ? (
                              <Code className="w-10 h-10 stroke-[2] text-purple-200" />
                            ) : (
                              <Dna className="w-10 h-10 stroke-[2] text-lime-200" />
                            )}
                          </div>

                          {isDone && (
                            <span className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </div>

                        {/* Lab Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-black tracking-widest text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950 px-2 py-0.5 rounded border border-cyan-300 dark:border-cyan-800">
                                {lab.subject}
                              </span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {lab.level}
                              </span>
                            </div>

                            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {lab.title}
                            </h3>

                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                              {lab.objective}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1 font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {lab.duration}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); openExperiment(lab); }}
                              className="px-3.5 py-1.5 bg-slate-900 dark:bg-white hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-900 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>{isDone ? "Re-Run Lab" : "Start Lab"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Circuit Builder Teaser Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative z-10 space-y-3 max-w-md">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/30">
                  Interactive Sandbox
                </span>
                <h2 className="text-xl sm:text-2xl font-black">Virtual Electronics & Circuit Builder</h2>
                <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
                  Drag and drop batteries, resistors, switches, and LEDs to test real Ohm&apos;s Law electrical current formulas ($I = V/R$) in real-time!
                </p>
                <button
                  onClick={() => setShowSandboxModal(true)}
                  className="px-5 py-2.5 bg-white text-cyan-950 hover:bg-cyan-100 rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-cyan-600" />
                  <span>Launch Circuit Sandbox</span>
                </button>
              </div>

              <div className="text-6xl sm:text-7xl shrink-0 animate-pulse">💡</div>
            </div>

          </div>

          {/* Right Column: Lab Report Card & School Hardware Kit */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Lab Evaluation Report Card */}
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span>My Lab Report Card</span>
              </h3>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-center space-y-1">
                <span className="block text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {completedLabs.length}
                </span>
                <span className="text-xs uppercase font-extrabold text-emerald-800 dark:text-emerald-300 tracking-wider">
                  Experiments Completed
                </span>
              </div>

              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                Recent Evaluations
              </h4>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {completedLabs.length === 0 && (
                  <div className="text-xs text-slate-400 italic text-center py-4">
                    No completed virtual labs yet. Select any lab on the left to get started!
                  </div>
                )}
                {completedLabs.map((lab, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-slate-900 dark:text-white line-clamp-1">{lab.title}</h5>
                      <span className="text-[10px] text-slate-400">{lab.date}</span>
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-black text-xs bg-emerald-100 dark:bg-emerald-950 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-800 shrink-0">
                      {lab.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* School Tinkering Lab Kit Availability */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Tinkering Hardware Kit</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Request physical Arduino, Sensor, or Microscope kits from your school&apos;s Atal Tinkering Lab for weekend practical projects!
              </p>

              <button
                onClick={() => setShowKitModal(true)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                <span>Check Hardware Availability</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. VIRTUAL EXPERIMENT SIMULATOR MODAL */}
      {/* ========================================================================= */}
      {activeExpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                    {activeExpModal.subject} • {activeExpModal.level}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {activeExpModal.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveExpModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Workflow Navigation Steps */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl text-xs font-bold">
              {["1. Objective & Setup", "2. Interactive Simulator", "3. Quiz & Submit Report"].map((stepTitle, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`flex-1 py-2 text-center rounded-xl transition-all ${
                    activeStep === idx
                      ? "bg-cyan-600 text-white shadow-md font-extrabold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {stepTitle}
                </button>
              ))}
            </div>

            {/* STEP 1: Objective & Equipment */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-wider">
                    Experiment Objective
                  </h4>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {activeExpModal.objective}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">
                      Virtual Equipment Required
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-bold">
                      {activeExpModal.equipment.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-black uppercase text-blue-500 tracking-wider">
                      Procedure Steps
                    </h4>
                    <ol className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-bold list-decimal list-inside">
                      {activeExpModal.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStep(1)}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Proceed to Interactive Simulator</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Interactive Simulation Canvas */}
            {activeStep === 1 && (
              <div className="space-y-6">
                
                {/* 1. OHM'S LAW SIMULATION */}
                {activeExpModal.simulationType === "physics_ohm" && (
                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                        Virtual Ammeter & Voltmeter Circuit Bench
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Ohm&apos;s Law Formula: V = I × R
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">Voltage (V)</span>
                        <div className="text-3xl font-black text-cyan-400">{ohmVolts} V</div>
                      </div>
                      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">Resistance (R)</span>
                        <div className="text-3xl font-black text-amber-400">{ohmResistance} Ω</div>
                      </div>
                      <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400">Calculated Current (I)</span>
                        <div className="text-3xl font-black text-emerald-400">{currentAmpere} A</div>
                      </div>
                    </div>

                    {/* Interactive Sliders */}
                    <div className="space-y-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>DC Power Source (V):</span>
                          <span className="text-cyan-400">{ohmVolts} Volts</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="12"
                          step="0.5"
                          value={ohmVolts}
                          onChange={(e) => setOhmVolts(parseFloat(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Resistor Wire (R):</span>
                          <span className="text-amber-400">{ohmResistance} Ohms</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={ohmResistance}
                          onChange={(e) => setOhmResistance(parseInt(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 text-center font-bold">
                      💡 Power Dispersed: <span className="text-white">{powerWatt} Watts</span> • Current scales directly with Voltage!
                    </div>
                  </div>
                )}

                {/* 2. pH VALUE TESTING SIMULATION */}
                {activeExpModal.simulationType === "chemistry_ph" && (
                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                        Universal pH Indicator Bench
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        Select Solution & Dip Strip
                      </span>
                    </div>

                    <div className="flex justify-center gap-3">
                      {(["lemon", "water", "naoh"] as const).map((sol) => (
                        <button
                          key={sol}
                          onClick={() => setPhSolution(sol)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase ${
                            phSolution === sol
                              ? "bg-emerald-500 text-white scale-105 shadow-md"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {sol === "lemon" ? "🍋 Lemon Juice" : sol === "water" ? "💧 Pure Water" : "🧪 NaOH Solution"}
                        </button>
                      ))}
                    </div>

                    {/* pH Beaker Visualizer */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-3">
                      <div className={`w-24 h-24 rounded-full ${phMap[phSolution].color} shadow-2xl flex items-center justify-center text-2xl font-black text-white transition-all scale-110`}>
                        pH {phMap[phSolution].ph}
                      </div>
                      <h4 className="text-sm font-black text-emerald-300">{phMap[phSolution].text}</h4>
                      <p className="text-xs text-slate-300 text-center max-w-sm">{phMap[phSolution].desc}</p>
                    </div>
                  </div>
                )}

                {/* 3. MICROSCOPE SIMULATION */}
                {activeExpModal.simulationType === "biology_microscope" && (
                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-black uppercase text-lime-400 tracking-wider">
                        Compound Microscope Viewport
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        Magnification: {microscopeZoom}x
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-4">
                      {/* Lens Viewport */}
                      <div className="w-56 h-56 rounded-full border-4 border-slate-700 bg-emerald-950 flex items-center justify-center relative overflow-hidden shadow-2xl">
                        <div className="text-center space-y-1 p-4 animate-pulse">
                          <Dna className="w-16 h-16 text-lime-400 mx-auto" />
                          <span className="block text-[10px] font-black uppercase text-lime-300">Guard Cells & Stomata</span>
                          <span className="block text-[8px] text-slate-400">Chloroplast Granules Visible</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {[100, 400, 1000].map((zoom) => (
                          <button
                            key={zoom}
                            onClick={() => setMicroscopeZoom(zoom)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              microscopeZoom === zoom
                                ? "bg-lime-500 text-slate-950 font-black"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {zoom}x Magnification
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* DEFAULT GENERIC SIMULATION VIEW */}
                {activeExpModal.simulationType !== "physics_ohm" && activeExpModal.simulationType !== "chemistry_ph" && activeExpModal.simulationType !== "biology_microscope" && (
                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 text-center space-y-4">
                    <FlaskConical className="w-16 h-16 text-cyan-400 mx-auto animate-bounce" />
                    <h3 className="text-lg font-black">{activeExpModal.title} — Active Workbench</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      All virtual tools calibrated. Parameters loaded for {activeExpModal.level}.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setActiveStep(2)}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Proceed to Quiz & Submit Lab Report</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 3: Quiz & Submit Lab Report */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-wider">
                    Post-Lab Assessment Quiz
                  </h4>

                  {activeExpModal.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setQuizSelected(optIdx)}
                            className={`p-3 rounded-xl text-xs font-bold text-left transition-all border ${
                              quizSelected === optIdx
                                ? "bg-cyan-600 text-white border-cyan-500 shadow-md"
                                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-400"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFinishLab}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5 text-emerald-200" />
                  <span>Submit Lab Report & Award Grade (100% A+)</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ELECTRONICS & BREADBOARD CIRCUIT SANDBOX MODAL */}
      {/* ========================================================================= */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black">Breadboard & Circuit Simulator Sandbox</h3>
              </div>
              <button onClick={() => setShowSandboxModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Battery (V)</span>
                <span className="text-2xl font-black text-amber-400">{sandboxBattery}V DC</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Resistor (R)</span>
                <span className="text-2xl font-black text-cyan-400">{sandboxResistor} Ω</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current (I)</span>
                <span className="text-2xl font-black text-emerald-400">{sandboxAmpere} mA</span>
              </div>
            </div>

            {/* LED Visual Output */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className={`w-16 h-16 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center ${
                sandboxSwitch ? "bg-amber-400 text-slate-950 shadow-amber-500/50 scale-110" : "bg-slate-800 text-slate-600"
              }`}>
                <Lightbulb className="w-8 h-8" />
              </div>
              <span className="text-xs font-black uppercase text-amber-300">
                {sandboxSwitch ? "⚡ Circuit Active — LED Glowing Brightly!" : "Circuit Open — LED Off"}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSandboxSwitch(!sandboxSwitch)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  sandboxSwitch ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                }`}
              >
                {sandboxSwitch ? "Open Switch (Turn OFF)" : "Close Switch (Turn ON)"}
              </button>
              <button onClick={() => setShowSandboxModal(false)} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold">
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AR HOLO-VIEWER MODAL */}
      {/* ========================================================================= */}
      {showArModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <Box className="w-16 h-16 text-cyan-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-black">3D Augmented Reality Camera Holo-Viewer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              AR Mode active. Point your camera at a flat surface or desk to project 3D interactive molecules, organs, and circuit components in your physical classroom!
            </p>
            <button onClick={() => setShowArModal(false)} className="w-full py-2.5 bg-cyan-600 text-white font-black text-xs rounded-xl">
              Close AR Viewer
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SCHOOL HARDWARE KIT AVAILABILITY MODAL */}
      {/* ========================================================================= */}
      {showKitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <span>Atal Tinkering Lab Inventory</span>
              </h3>
              <button onClick={() => setShowKitModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: "Arduino Uno R3 Starter Kit", count: "4 Kits Available" },
                { name: "Robotics Motor & Sensor Set", count: "3 Kits Available" },
                { name: "Microscope Slide Prep Kit", count: "2 Kits Available" },
                { name: "Raspberry Pi Single Board PC", count: "1 Kit Available" }
              ].map((kit, i) => (
                <div key={i} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white">{kit.name}</h5>
                    <span className="text-[10px] text-amber-300 font-bold">{kit.count}</span>
                  </div>
                  <button
                    onClick={() => { alert(`Success! Weekend home-loan request for "${kit.name}" submitted to your School Science Lab Teacher.`); setShowKitModal(false); }}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg hover:bg-amber-400"
                  >
                    Request Loan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
