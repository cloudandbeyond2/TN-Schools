"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Pencil, 
  Eraser, 
  Circle, 
  Square, 
  Type, 
  Download, 
  Share2, 
  Atom, 
  Microscope,
  Palette,
  Undo,
  Redo,
  Save,
  Trash2,
  Image as ImageIcon
} from "lucide-react";

export default function ScienceDrawMatPage() {
  const [activeTool, setActiveTool] = useState("pencil");
  const [activeColor, setActiveColor] = useState("#ec4899");
  const [toastMsg, setToastMsg] = useState("");
  
  // Property states
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [fontSize, setFontSize] = useState(32);
  const [fillShape, setFillShape] = useState(false);
  const [opacity, setOpacity] = useState(100);
  
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };
  
  const tools = [
    { id: "pencil", icon: <Pencil className="w-6 h-6" />, label: "Draw" },
    { id: "eraser", icon: <Eraser className="w-6 h-6" />, label: "Erase" },
    { id: "shape-circle", icon: <Circle className="w-6 h-6" />, label: "Circle" },
    { id: "shape-square", icon: <Square className="w-6 h-6" />, label: "Square" },
    { id: "text", icon: <Type className="w-6 h-6" />, label: "Text" },
    { id: "image", icon: <ImageIcon className="w-6 h-6" />, label: "Sticker" },
  ];

  const colors = [
    "#000000", "#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#f97316", "#06b6d4"
  ];

  return (
    <PortalLayout
      title="Science Draw Mat"
      subtitle="Let your creativity flow! Draw scientific diagrams, atoms, and more!"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Playful Tools Sidebar */}
        <div className="lg:w-24 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 flex flex-col items-center gap-4 rounded-3xl shadow-xl shadow-indigo-500/10 border-4 border-indigo-100 dark:border-slate-700">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  showToast(`Selected tool: ${tool.label}`);
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative group
                  ${activeTool === tool.id 
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110 rotate-3" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 hover:scale-105 hover:-rotate-3"
                  }`}
                title={tool.label}
              >
                {tool.icon}
                {/* Tooltip */}
                <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {tool.label}
                  {/* Tooltip Arrow */}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </span>
              </button>
            ))}
            
            <div className="w-full h-1 bg-indigo-50 dark:bg-slate-700 rounded-full my-1"></div>
            
            {/* Colors */}
            <div className="flex flex-col gap-3 items-center w-full">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-500 mb-1">
                <Palette className="w-5 h-5" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`w-6 h-6 rounded-full transition-all duration-300 shadow-sm ${
                      activeColor === color ? "ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 scale-125" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}
                    title={`Color: ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="bg-white dark:bg-slate-800 p-3 flex flex-col items-center gap-3 rounded-3xl shadow-xl shadow-emerald-500/10 border-4 border-emerald-100 dark:border-slate-700 mt-auto">
             <button onClick={() => showToast("Undoing last stroke...")} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Undo">
                <Undo className="w-6 h-6" />
             </button>
             <button onClick={() => showToast("Redoing...")} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Redo">
                <Redo className="w-6 h-6" />
             </button>
             <button onClick={() => showToast("Canvas Cleared!")} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Clear Canvas">
                <Trash2 className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Playful Canvas Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-indigo-100 dark:border-slate-800">
          {/* Top Bar for Canvas */}
          <div className="h-16 border-b-4 border-indigo-50 dark:border-slate-800 flex justify-between items-center px-6 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm rounded-2xl shadow-md shadow-pink-500/20 flex items-center gap-2">
                <Atom className="w-4 h-4 animate-spin-slow" />
                <span>My Super Cool Drawing</span>
              </div>
              <span className="text-sm text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Not saved yet</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => showToast("Link copied to clipboard! Share with your friends!")} className="flex items-center gap-2 px-4 py-2.5 text-sm font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button onClick={() => showToast("Downloading drawing as PNG! 🖼️")} className="flex items-center gap-2 px-4 py-2.5 text-sm font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button onClick={() => showToast("Awesome drawing saved! 🌟")} className="flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95">
                <Save className="w-4 h-4" />
                Save to Portfolio
              </button>
            </div>
          </div>
          
          {/* Mock Canvas Area */}
          <div className="flex-1 relative cursor-crosshair overflow-hidden" 
               style={{ 
                 backgroundImage: 'radial-gradient(#c7d2fe 2px, transparent 2px)', 
                 backgroundSize: '30px 30px',
                 backgroundColor: '#f8fafc'
               }}>
            
            {/* Playful mock diagram elements */}
            <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center"
                 style={{
                   borderWidth: `${strokeWidth}px`,
                   borderColor: activeColor,
                   borderStyle: 'dashed',
                   backgroundColor: fillShape ? `${activeColor}40` : 'transparent'
                 }}>
               <div className="absolute w-64 h-64 border-4 rounded-full border-indigo-400 animate-[spin_15s_reverse_linear_infinite] border-dashed"></div>
            </div>
            
            <div className="absolute top-[32%] left-[30%] text-center rotate-[-10deg]">
               <h2 className="transition-all" style={{ 
                 color: activeColor,
                 fontSize: `${fontSize}px`,
                 fontWeight: isBold ? '900' : 'normal',
                 fontStyle: isItalic ? 'italic' : 'normal',
                 textDecoration: isUnderline ? 'underline' : 'none',
                 textShadow: `2px 2px 0px ${activeColor}40`,
                 opacity: opacity / 100
               }}>Atom Structure!</h2>
               <div className="text-lg font-bold text-pink-500 bg-white px-3 py-1 rounded-xl shadow-md inline-block mt-2">Nucleus</div>
            </div>
            
            <div className="absolute top-[20%] left-[25%] mt-[-10px] ml-[280px] w-8 h-8 bg-amber-400 rounded-full shadow-xl shadow-amber-400/40 flex items-center justify-center font-bold text-amber-900">e-</div>
            <div className="absolute top-[45%] left-[20%] mt-[-10px] ml-[280px] w-8 h-8 bg-emerald-400 rounded-full shadow-xl shadow-emerald-400/40 flex items-center justify-center font-bold text-emerald-900">e-</div>
            
            <div className="absolute right-12 top-12 bg-white p-4 rounded-3xl shadow-xl rotate-3 border-4 border-amber-200">
               <p className="font-black text-amber-500 text-lg">Did you know? 🤔</p>
               <p className="font-bold text-slate-600 max-w-[200px] mt-2">Atoms are mostly empty space!</p>
            </div>
            
            {/* Watermark/Hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-slate-300 dark:text-slate-700/30 text-3xl font-black uppercase tracking-widest select-none pointer-events-none">
              <Palette className="w-10 h-10" />
              TN-Schools Draw Mat
            </div>
          </div>
        </div>
        
        {/* Right Side Properties Panel */}
        <div className="lg:w-72 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 flex flex-col gap-6 rounded-[2.5rem] shadow-xl border-4 border-indigo-100 dark:border-slate-700 h-full">
            <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-50 dark:border-slate-700 pb-3 flex items-center gap-2">
              <span className="capitalize">{activeTool.replace('shape-', '')}</span> Options
            </h3>
            
            <div className="flex-1 space-y-6">
              
              {activeTool === "pencil" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Stroke Width: {strokeWidth}px</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="30" 
                      value={strokeWidth} 
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full accent-indigo-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Smoothness</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <option>Normal</option>
                      <option>High (Auto-smooth)</option>
                      <option>None (Raw)</option>
                    </select>
                  </div>
                </div>
              )}
              
              {activeTool === "eraser" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Eraser Size: {eraserSize}px</label>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      value={eraserSize} 
                      onChange={(e) => setEraserSize(parseInt(e.target.value))}
                      className="w-full accent-pink-500" 
                    />
                  </div>
                  <button onClick={() => showToast("Canvas Cleared!")} className="w-full py-3 mt-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border-2 border-red-200 active:scale-95 flex items-center justify-center gap-2">
                     <Trash2 className="w-5 h-5" /> Erase All
                  </button>
                </div>
              )}
              
              {(activeTool === "shape-circle" || activeTool === "shape-square") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Border Width: {strokeWidth}px</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={strokeWidth} 
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full accent-emerald-500" 
                    />
                  </div>
                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-300 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={fillShape} 
                      onChange={(e) => setFillShape(e.target.checked)}
                      className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500" 
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Fill Shape</span>
                  </label>
                </div>
              )}
              
              {activeTool === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Font Size: {fontSize}px</label>
                    <input 
                      type="range" 
                      min="12" 
                      max="72" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Font Style</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <option>Comic Sans (Fun!)</option>
                      <option>Arial</option>
                      <option>Courier (Code)</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsBold(!isBold)} 
                      className={`flex-1 py-2 rounded-lg font-bold border-2 transition-colors ${isBold ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                    >B</button>
                    <button 
                      onClick={() => setIsItalic(!isItalic)}
                      className={`flex-1 py-2 rounded-lg font-bold border-2 italic transition-colors ${isItalic ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                    >I</button>
                    <button 
                      onClick={() => setIsUnderline(!isUnderline)}
                      className={`flex-1 py-2 rounded-lg font-bold border-2 underline transition-colors ${isUnderline ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                    >U</button>
                  </div>
                </div>
              )}
              
              {activeTool === "image" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Opacity: {opacity}%</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={opacity} 
                      onChange={(e) => setOpacity(parseInt(e.target.value))}
                      className="w-full accent-purple-500" 
                    />
                  </div>
                  <button onClick={() => showToast("Opening sticker library...")} className="w-full py-3 rounded-xl font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors border-2 border-purple-200 active:scale-95 flex items-center justify-center gap-2">
                     <ImageIcon className="w-5 h-5" /> Choose Sticker
                  </button>
                </div>
              )}
              
            </div>
            
            <div className="mt-auto pt-4 border-t-2 border-indigo-50 dark:border-slate-700">
               <div className="bg-indigo-50 dark:bg-slate-900 p-4 rounded-2xl border-2 border-indigo-100 dark:border-slate-700">
                 <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-start gap-2">
                   <span className="text-lg leading-none">💡</span>
                   <span>Tip: You can use your mouse or touch screen to draw!</span>
                 </p>
               </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-2 border-4 border-indigo-500/30">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </PortalLayout>
  );
}
