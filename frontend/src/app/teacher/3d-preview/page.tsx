"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import ThreeDModelViewer from "@/components/ThreeDModelViewer";
import { 
  Box, 
  Rotate3D,
  Eye,
  MousePointer2,
  Maximize2,
  X,
  Sparkles,
  Heart,
  Globe2,
  Leaf,
  Settings,
  Search,
  Layers,
  Sparkle
} from "lucide-react";

// Pre-defined high-fidelity 3D shapes for default library items (Hologram mode fallback) with part explanations
const defaultHeartShapes = [
  { 
    type: "sphere", x: 0, y: 0, z: 0, radius: 25, color: "#f43f5e", 
    label: "Left Ventricle (இடது வென்ட்ரிகிள்)", 
    description: "One of the heart's four chambers. It has thick muscular walls to pump oxygen-rich blood to the entire body." 
  },
  { 
    type: "sphere", x: -10, y: 15, z: -5, radius: 18, color: "#ec4899", 
    label: "Right Atrium (வலது ஏட்ரியம்)", 
    description: "The chamber that receives oxygen-poor blood returning from the body tissues and pumps it into the right ventricle." 
  },
  { 
    type: "cylinder", x1: -5, y1: 15, z1: 0, x2: -5, y2: 45, z2: 0, radius: 6, color: "#3b82f6", 
    label: "Superior Vena Cava (மேற்பெருநாளம்)", 
    description: "A large vein carrying deoxygenated blood from the upper half of the body (head, neck, arms) back to the heart's right atrium." 
  },
  { 
    type: "cylinder", x1: 5, y1: 10, z1: 0, x2: 12, y2: 50, z2: -10, radius: 7, color: "#ef4444", 
    label: "Aorta (பெருநாடி)", 
    description: "The largest artery in the human body. It originates from the left ventricle and carries oxygenated blood out to the systemic circulation." 
  },
  { type: "cylinder", x1: 12, y1: 50, z1: -10, x2: 25, y2: 45, z2: -15, radius: 4, color: "#ef4444" },
  { type: "cylinder", x1: 12, y1: 50, z1: -10, x2: 12, y2: 45, z2: 10, radius: 4, color: "#ef4444" },
  { 
    type: "text", x: 35, y: 55, z: -15, text: "Aorta", color: "#ef4444", fontSize: 10, xLink: 12, yLink: 50, zLink: -10,
    label: "Aorta (பெருநாடி)", 
    description: "The largest artery in the human body. It originates from the left ventricle and carries oxygenated blood out to the systemic circulation." 
  },
  { 
    type: "text", x: -45, y: 45, z: 0, text: "Vena Cava", color: "#3b82f6", fontSize: 10, xLink: -5, yLink: 45, zLink: 0,
    label: "Superior Vena Cava (மேற்பெருநாளம்)", 
    description: "A large vein carrying deoxygenated blood from the upper half of the body (head, neck, arms) back to the heart's right atrium." 
  },
  { 
    type: "text", x: 45, y: -25, z: 0, text: "Left Ventricle", color: "#f43f5e", fontSize: 10, xLink: 0, yLink: 0, zLink: 0,
    label: "Left Ventricle (இடது வென்ட்ரிகிள்)", 
    description: "One of the heart's four chambers. It has thick muscular walls to pump oxygen-rich blood to the entire body." 
  }
];

const defaultSolarShapes = [
  { 
    type: "sphere", x: 0, y: 0, z: 0, radius: 24, color: "#eab308", 
    label: "Sun (சூரியன்)", 
    description: "The yellow dwarf star at the center of the Solar System. It generates light and heat through nuclear fusion in its core." 
  },
  { type: "ring", x: 0, y: 0, z: 0, radius: 50, plane: "xz", color: "#475569", thickness: 1 },
  { 
    type: "sphere", x: 35, y: 0, z: 35, radius: 6, color: "#3b82f6", 
    label: "Earth (பூமி)", 
    description: "Our home planet. It is the third planet from the Sun and the only place in the universe known to support life, with liquid water oceans." 
  },
  { type: "ring", x: 0, y: 0, z: 0, radius: 80, plane: "xz", color: "#475569", thickness: 1 },
  { 
    type: "sphere", x: -65, y: 0, z: 45, radius: 10, color: "#f59e0b", 
    label: "Saturn (சனி)", 
    description: "The second-largest planet in our solar system, famous for its magnificent ring system composed of ice chunks and rocky debris particles." 
  },
  { type: "ring", x: -65, y: 0, z: 45, radius: 18, plane: "xz", color: "#d97706", thickness: 2 },
  { type: "ring", x: 0, y: 0, z: 0, radius: 110, plane: "xz", color: "#475569", thickness: 1 },
  { 
    type: "sphere", x: -80, y: 0, z: -80, radius: 8, color: "#67e8f9", 
    label: "Uranus (யுரேனஸ்)", 
    description: "An ice giant planet that rotates on its side. It has a blue-green color due to methane gas in its cold atmosphere." 
  },
  { 
    type: "text", x: 0, y: 35, z: 0, text: "The Sun", color: "#eab308", fontSize: 10, xLink: 0, yLink: 0, zLink: 0,
    label: "Sun (சூரியன்)", 
    description: "The yellow dwarf star at the center of the Solar System. It generates light and heat through nuclear fusion in its core." 
  },
  { 
    type: "text", x: 60, y: 15, z: 35, text: "Earth", color: "#3b82f6", fontSize: 10, xLink: 35, yLink: 0, zLink: 35,
    label: "Earth (பூமி)", 
    description: "Our home planet. It is the third planet from the Sun and the only place in the universe known to support life, with liquid water oceans." 
  }
];

const defaultCellShapes = [
  { 
    type: "ring", x: 0, y: 0, z: 0, radius: 70, plane: "xz", color: "#10b981", thickness: 3, 
    label: "Cell Wall (செல் சுவர்)", 
    description: "A tough, flexible but rigid structural layer surrounding plant cells, composed of cellulose, which provides support and shape." 
  },
  { type: "ring", x: 0, y: -20, z: 0, radius: 70, plane: "xz", color: "#047857", thickness: 3 },
  { type: "ring", x: 0, y: 20, z: 0, radius: 70, plane: "xz", color: "#047857", thickness: 3 },
  { type: "cylinder", x1: -70, y1: -20, z1: 0, x2: -70, y2: 20, z2: 0, radius: 2, color: "#10b981" },
  { type: "cylinder", x1: 70, y1: -20, z1: 0, x2: 70, y2: 20, z2: 0, radius: 2, color: "#10b981" },
  { 
    type: "sphere", x: 0, y: -5, z: 10, radius: 25, color: "#38bdf8", 
    label: "Central Vacuole (மைய வெற்றிடம்)", 
    description: "A large storage organelle in plant cells that holds water and nutrients, maintaining turgor pressure to keep the plant upright." 
  },
  { 
    type: "sphere", x: -35, y: 10, z: -20, radius: 14, color: "#a855f7", 
    label: "Nucleus (உட்கரு)", 
    description: "The membrane-bound control center of eukaryotic cells. It houses the cell's genetic material (DNA) and directs cellular activities." 
  },
  { 
    type: "sphere", x: 40, y: 15, z: -15, radius: 8, color: "#22c55e", 
    label: "Chloroplast (பசுங்கணிகம்)", 
    description: "The photosynthetic organelle in plant cells. It absorbs solar light and uses it to synthesize sugars from carbon dioxide and water." 
  },
  { type: "sphere", x: -45, y: -10, z: 30, radius: 8, color: "#22c55e", label: "Chloroplast" },
  { 
    type: "text", x: -50, y: 35, z: -20, text: "Nucleus", color: "#a855f7", fontSize: 10, xLink: -35, yLink: 10, zLink: -20,
    label: "Nucleus (உட்கரு)", 
    description: "The membrane-bound control center of eukaryotic cells. It houses the cell's genetic material (DNA) and directs cellular activities." 
  },
  { 
    type: "text", x: 20, y: -30, z: 10, text: "Central Vacuole", color: "#38bdf8", fontSize: 10, xLink: 0, yLink: -5, zLink: 10,
    label: "Central Vacuole (மைய வெற்றிடம்)", 
    description: "A large storage organelle in plant cells that holds water and nutrients, maintaining turgor pressure to keep the plant upright." 
  },
  { 
    type: "text", x: 65, y: 35, z: -15, text: "Chloroplast", color: "#22c55e", fontSize: 10, xLink: 40, yLink: 15, zLink: -15,
    label: "Chloroplast (பசுங்கணிகம்)", 
    description: "The photosynthetic organelle in plant cells. It absorbs solar light and uses it to synthesize sugars from carbon dioxide and water." 
  }
];

const defaultEngineShapes = [
  { 
    type: "cylinder", x1: -50, y1: 0, z1: 0, x2: 50, y2: 0, z2: 0, radius: 8, color: "#94a3b8", 
    label: "Main Crankshaft (முக்கிய தண்டு)", 
    description: "A robust shaft that translates the up-and-down (linear) motion of the engine pistons into rotation to drive the vehicle's wheels." 
  },
  { 
    type: "ring", x: 0, y: 0, z: 0, radius: 45, plane: "yz", color: "#f59e0b", thickness: 6, 
    label: "Flywheel / Gear (சுழல்சக்கரம்)", 
    description: "A heavy, balanced rotating disk connected to the crankshaft. It stores kinetic energy to smooth out the engine's power strokes." 
  },
  { type: "cylinder", x1: -25, y1: 0, z1: 0, x2: -25, y2: 30, z2: 15, radius: 4, color: "#cbd5e1" },
  { type: "cylinder", x1: 25, y1: 0, z1: 0, x2: 25, y2: -30, z2: -15, radius: 4, color: "#cbd5e1" },
  { 
    type: "box", x: -25, y: 30, z: 15, w: 18, h: 20, d: 18, color: "#f43f5e", 
    label: "Piston A (உந்துதண்டு A)", 
    description: "Moves back and forth in its cylinder to compress the fuel-air mixture and capture the force of combustion to turn the crankshaft." 
  },
  { 
    type: "box", x: 25, y: -30, z: -15, w: 18, h: 20, d: 18, color: "#3b82f6", 
    label: "Piston B (உந்துதண்டு B)", 
    description: "Piston B works in balanced opposition to Piston A, compressing gas on alternate cycles to ensure smooth continuous power." 
  },
  { 
    type: "particle_cloud", points: [[-25, 45, 15], [-22, 48, 17], [-28, 46, 13]], color: "#f59e0b", particleSize: 2, 
    label: "Combustion Spark (தீப்பொறி)", 
    description: "Created by the spark plug to ignite the compressed fuel-air mixture in the cylinder, generating explosive force that drives the piston down." 
  },
  { 
    type: "text", x: -65, y: 55, z: 15, text: "Piston A", color: "#f43f5e", fontSize: 10, xLink: -25, yLink: 30, zLink: 15,
    label: "Piston A (உந்துதண்டு A)", 
    description: "Moves back and forth in its cylinder to compress the fuel-air mixture and capture the force of combustion to turn the crankshaft." 
  },
  { 
    type: "text", x: 60, y: -50, z: -15, text: "Piston B", color: "#3b82f6", fontSize: 10, xLink: 25, yLink: -30, zLink: -15,
    label: "Piston B (உந்துதண்டு B)", 
    description: "Piston B works in balanced opposition to Piston A, compressing gas on alternate cycles to ensure smooth continuous power." 
  }
];

export default function ThreeDPreviewPage() {
  const [models, setModels] = useState([
    { 
      id: 1, 
      name: "Human Heart Structure ❤️", 
      subject: "Biology", 
      views: 245, 
      icon: <Heart />, 
      color: "rose", 
      shapes: defaultHeartShapes, 
      sketchfabUid: "775d6629622740de8a5ed61a959c7506",
      description: "Detailed, anatomically correct 3D model of the human heart, showing blood flows, aorta, and ventricles. Drag around to view it at 360 degrees." 
    },
    { 
      id: 2, 
      name: "Solar System Map 🪐", 
      subject: "Physics", 
      views: 189, 
      icon: <Globe2 />, 
      color: "indigo", 
      shapes: defaultSolarShapes, 
      sketchfabUid: "f7896d085f474ef28631d88129268411",
      description: "A simulated solar system model. Displays orbits (XZ plane) and planets relative to the central Sun." 
    },
    { 
      id: 3, 
      name: "Plant Cell Organelles 🌿", 
      subject: "Biology", 
      views: 312, 
      icon: <Leaf />, 
      color: "emerald", 
      shapes: defaultCellShapes, 
      sketchfabUid: "06c34533b4f441569bfa207aff7c8a19",
      description: "A detailed cross section of a plant cell showcasing the cell wall, central vacuole, chloroplasts, and nucleus." 
    },
    { 
      id: 4, 
      name: "Cool Engine Parts ⚙️", 
      subject: "Physics", 
      views: 156, 
      icon: <Settings />, 
      color: "amber", 
      shapes: defaultEngineShapes, 
      sketchfabUid: "fc1ba33a0902445980078d24d92ec54f",
      description: "High-fidelity mechanical four-stroke piston and crankshaft engine system. Spin to view assembly." 
    },
  ]);

  const [activeModel, setActiveModel] = useState(models[0]);
  const [viewMode, setViewMode] = useState<"real" | "hologram">("real");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);
  const [customLoading, setCustomLoading] = useState(false);

  // Set default view mode based on Sketchfab UID availability
  useEffect(() => {
    if (activeModel.sketchfabUid) {
      setViewMode("real");
    } else {
      setViewMode("hologram");
    }
  }, [activeModel]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const triggerGenerate3D = async (topic: string, subject: string) => {
    if (!topic.trim()) return;
    setCustomLoading(true);
    showToast(`AI is crafting 3D ${topic}... 🔮`);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/generate-3d`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic,
          subject
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const generated = result.data;
        const colors = ["rose", "indigo", "emerald", "amber", "sky", "purple"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newModel = {
          id: Date.now(),
          name: generated.name || (topic + " ✨"),
          subject: generated.subject || subject,
          views: 1,
          icon: <Box />,
          color: generated.color || randomColor,
          shapes: generated.shapes || [],
          sketchfabUid: generated.sketchfabUid || null,
          description: generated.description || `Custom generated 3D visual explanation of ${topic}.`
        };
        
        setModels((prev) => [newModel, ...prev]);
        setActiveModel(newModel);
        showToast(`3D ${topic} successfully generated! 🚀`);
      } else {
        throw new Error(result.error || "Failed to generate 3D model");
      }
    } catch (error) {
      console.error(error);
      showToast("Oh no! Failed to build 3D model. 😢");
    } finally {
      setCustomLoading(false);
    }
  };

  const handleLoadModel = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const subject = formData.get("subject") as string;
    
    triggerGenerate3D(name, subject);
    setModalOpen(false);
  };

  const handleFloatingSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const topic = formData.get("customTopic") as string;
    if (!topic.trim()) return;

    triggerGenerate3D(topic, "Science");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <PortalLayout
      title="Magic 3D Viewer! 👓"
      subtitle="Spin, zoom, and explore awesome 3D stuff!"
    >
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
        
        {/* Main Viewer Area */}
        <div className="flex-1 rounded-[2.5rem] shadow-2xl border-8 border-indigo-100 dark:border-slate-700 overflow-hidden flex flex-col relative bg-slate-900">
          
          {/* Top Control Bar */}
          <div className="h-20 bg-white/10 backdrop-blur-md border-b-4 border-white/20 flex justify-between items-center px-6 absolute top-0 w-full z-20">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 bg-${activeModel.color}-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md rotate-[-3deg]`}>
                {activeModel.subject}
              </span>
              <h3 className="text-2xl font-black text-white drop-shadow-md">{activeModel.name}</h3>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Toggle view mode between Real 3D and Sci-Fi Hologram */}
              {activeModel.sketchfabUid && (
                <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 flex gap-1.5 shadow-md">
                  <button 
                    onClick={() => { setViewMode("real"); showToast("Viewing realistic 3D model! 🎨"); }} 
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${viewMode === "real" ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Real 3D
                  </button>
                  <button 
                    onClick={() => { setViewMode("hologram"); showToast("Switching to Sci-Fi Hologram! ⚡"); }} 
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${viewMode === "hologram" ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Sparkle className="w-3.5 h-3.5" /> Hologram
                  </button>
                </div>
              )}

              {viewMode === "hologram" && (
                <button onClick={() => { setAutoRotate(!autoRotate); showToast(autoRotate ? "Holding still! 🛑" : "Spinning around! 🌪️"); }} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${autoRotate ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`} title="Spin!">
                  <Rotate3D className={`w-6 h-6 ${autoRotate ? 'animate-spin-slow' : ''}`} />
                </button>
              )}
              <button onClick={() => showToast("Going BIG! 📺")} className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95" title="Big Screen">
                <Maximize2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Floating Search Input for any topic */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
            <form onSubmit={handleFloatingSearchSubmit} className="flex gap-2 bg-slate-950/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-indigo-500/50 shadow-2xl">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  name="customTopic"
                  placeholder="Type any topic (e.g. DNA Helix, Eye)..."
                  className="w-full bg-transparent text-sm font-bold text-white placeholder-slate-400 focus:outline-none"
                  required
                  disabled={customLoading}
                />
              </div>
              <button
                type="submit"
                disabled={customLoading}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                {customLoading ? "Building..." : "Generate 3D 🚀"}
              </button>
            </form>
          </div>

          {/* Playful 3D Viewer Area */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-indigo-950 flex items-center justify-center overflow-hidden">
            
            {/* Twinkling stars background (shown behind translucent canvas/iframe) */}
            <div className="absolute inset-0 z-0">
               <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
               <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-200 rounded-full animate-pulse"></div>
               <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
            </div>
            
            {/* Grid Floor */}
            <div className="absolute inset-0 z-0 opacity-20" style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 2px, transparent 2px)`,
                backgroundSize: '60px 60px',
                transform: 'perspective(600px) rotateX(70deg) translateY(200px) scale(4)',
                transformOrigin: 'bottom center'
            }}></div>
            
            {/* Renderer or Loading State */}
            {customLoading ? (
              <div className="flex flex-col items-center gap-4 text-center z-10 p-6 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10">
                <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-lg font-black tracking-widest animate-pulse">SEARCHING & BUILDING 3D MODEL...</p>
                <p className="text-xs text-indigo-300">Fetching original 3D geometry and rendering annotations</p>
              </div>
            ) : viewMode === "real" && activeModel.sketchfabUid ? (
              /* Embed high-fidelity fully-textured original 3D model */
              /* Custom parameter settings hide the creator name (ui_infos=0) and the VCR video/timeline player controls (ui_animations=0) */
              /* ui_annotations=1 enables clickable numbered annotation pins that display explanations of different parts */
              <div className="w-full h-full pt-20 z-10">
                <iframe
                  src={`https://sketchfab.com/models/${activeModel.sketchfabUid}/embed?autostart=1&ui_theme=dark&ui_ar=0&ui_vr=0&ui_infos=0&ui_help=0&ui_settings=0&ui_annotations=1&ui_animations=0&double_click=0`}
                  title={activeModel.name}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                />
              </div>
            ) : activeModel.shapes ? (
              /* Beautiful retro-holographic scientific 3D canvas viewer */
              <ThreeDModelViewer
                key={activeModel.id}
                shapes={activeModel.shapes}
                name={activeModel.name}
                description={activeModel.description}
                colorTheme={activeModel.color}
                autoRotate={autoRotate}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-center z-10">
                <p className="text-white font-bold">No shapes or 3D model found.</p>
              </div>
            )}
            
            {/* Interaction Hint (hidden in real 3D iframe since it has native controls, and during loading) */}
            {!customLoading && viewMode !== "real" && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-900/80 backdrop-blur-md border-4 border-indigo-500/50 text-sm font-black text-indigo-100 z-20 shadow-xl">
                <MousePointer2 className="w-5 h-5 text-indigo-300 animate-bounce" /> Click & Drag to explore!
              </div>
            )}
          </div>

        </div>

        {/* Playful Sidebar - Model Library */}
        <div className="lg:w-96 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border-4 border-indigo-100 dark:border-slate-700 h-full flex flex-col">
            <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl rotate-12">
                 <Box className="w-6 h-6" />
              </div>
              Cool 3D Stuff
            </h3>
            
            <div className="space-y-4 overflow-y-auto hide-scrollbar flex-1 pb-4">
              {models.map(model => (
                <div 
                  key={model.id}
                  onClick={() => { setActiveModel(model); showToast(`Loaded ${model.name}!`); }}
                  className={`p-4 rounded-2xl border-4 cursor-pointer transition-all group ${
                    activeModel.id === model.id 
                      ? `bg-${model.color}-50 border-${model.color}-300 shadow-md scale-105` 
                      : `bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-${model.color}-200 hover:bg-${model.color}-50/50 hover:scale-[1.02]`
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-12 ${
                      activeModel.id === model.id ? `bg-${model.color}-500 text-white` : `bg-${model.color}-100 text-${model.color}-500`
                    }`}>
                      {model.id <= 4 ? React.cloneElement(model.icon as React.ReactElement, { className: "w-7 h-7" }) : <Box className="w-7 h-7" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-base font-black mb-1 leading-tight truncate ${activeModel.id === model.id ? `text-${model.color}-700` : "text-slate-700 dark:text-slate-200"}`}>
                        {model.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span className={`px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300`}>{model.subject}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {model.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => setModalOpen(true)} className="mt-4 w-full py-4 rounded-2xl border-4 border-dashed border-indigo-200 text-sm font-black text-indigo-500 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all active:scale-95 shadow-sm">
              + Find More Magic!
            </button>
          </div>
        </div>

      </div>
      
      {/* Playful Toast */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-indigo-900 text-white px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/40 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-indigo-500/50">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          {toastMsg}
        </div>
      )}

      {/* Load Model Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-indigo-200 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-indigo-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400">Bring in something cool!</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLoadModel} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What is it? 🦖</label>
                <input required name="name" type="text" placeholder="e.g., T-Rex Skeleton" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What subject? 📚</label>
                <select required name="subject" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all">
                  <option value="Biology">Biology 🌿</option>
                  <option value="Physics">Physics ⚙️</option>
                  <option value="Chemistry">Chemistry 🧪</option>
                  <option value="Geography">Geography 🌍</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Nevermind
                </button>
                <button type="submit" className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 active:scale-95">
                  Load It Up! 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
