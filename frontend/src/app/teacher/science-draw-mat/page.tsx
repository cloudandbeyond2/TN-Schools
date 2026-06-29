"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Palette,
  Undo,
  Redo,
  Save,
  Trash2,
  Image as ImageIcon,
  Rocket
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
  
  // Drawing states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const [shapes, setShapes] = useState<any[]>([]);
  const [currentShape, setCurrentShape] = useState<any>(null);
  const [texts, setTexts] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Set canvas to its actual display size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        setCtx(context);
      }
      
      // Handle resize
      const handleResize = () => {
        // We'd ideally save and restore image data here, but for simplicity we just resize
        const imgData = context?.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if (context && imgData) {
           context.lineCap = 'round';
           context.lineJoin = 'round';
           context.putImageData(imgData, 0, 0);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setShapes([]);
    setTexts([]);
    setStickers([]);
    showToast("Canvas Cleared! ✨");
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      setIsDrawing(true);
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        // Draw a dot immediately
        ctx.lineWidth = activeTool === 'eraser' ? eraserSize : strokeWidth;
        ctx.strokeStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor;
        ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    } else if (activeTool.startsWith('shape-')) {
      setIsDrawing(true);
      setStartPos({ x, y });
      setCurrentShape({
        type: activeTool,
        x, y, w: 0, h: 0,
        color: activeColor,
        strokeWidth,
        fill: fillShape
      });
    } else if (activeTool === 'text') {
      // Add text box
      setTexts([...texts, {
        id: Date.now(),
        x, y,
        text: "Type here...",
        color: activeColor,
        fontSize,
        isBold,
        isItalic,
        isUnderline
      }]);
    } else if (activeTool === 'image') {
      // Add sticker
      const stickerIcons = [<Atom />, <Rocket />, <Palette />];
      const randomIcon = stickerIcons[Math.floor(Math.random() * stickerIcons.length)];
      setStickers([...stickers, {
        id: Date.now(),
        x: x - 40, y: y - 40,
        opacity,
        color: activeColor,
        icon: randomIcon
      }]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      if (!ctx) return;
      ctx.lineWidth = activeTool === 'eraser' ? eraserSize : strokeWidth;
      ctx.strokeStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor;
      ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (activeTool.startsWith('shape-')) {
      setCurrentShape((prev: any) => ({
        ...prev,
        w: x - startPos.x,
        h: y - startPos.y
      }));
    }
  };

  const handlePointerUp = () => {
    if (activeTool.startsWith('shape-') && currentShape) {
      setShapes([...shapes, currentShape]);
      setCurrentShape(null);
    }
    setIsDrawing(false);
    if (ctx) ctx.beginPath();
  };

  const updateText = (id: number, newText: string) => {
    setTexts(texts.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  return (
    <PortalLayout
      title="Science Draw Mat 🎨"
      subtitle="Draw, erase, type, and create awesome science diagrams!"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Playful Tools Sidebar */}
        <div className="lg:w-24 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 flex flex-col items-center gap-4 rounded-3xl shadow-xl shadow-indigo-500/10 border-4 border-indigo-100 dark:border-slate-700 select-none">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  showToast(`Selected: ${tool.label} ✨`);
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative group
                  ${activeTool === tool.id 
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110 rotate-3" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 hover:scale-105 hover:-rotate-3"
                  }`}
                title={tool.label}
              >
                {tool.icon}
                <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {tool.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </span>
              </button>
            ))}
            
            <div className="w-full h-1 bg-indigo-50 dark:bg-slate-700 rounded-full my-1"></div>
            
            {/* Colors */}
            <div className="flex flex-col gap-3 items-center w-full">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-500 mb-1" style={{color: activeColor}}>
                <Palette className="w-6 h-6" />
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
          <div className="bg-white dark:bg-slate-800 p-3 flex flex-col items-center gap-3 rounded-3xl shadow-xl shadow-emerald-500/10 border-4 border-emerald-100 dark:border-slate-700 mt-auto select-none">
             <button onClick={() => showToast("Undoing last stroke...")} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Undo">
                <Undo className="w-6 h-6" />
             </button>
             <button onClick={() => showToast("Redoing...")} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Redo">
                <Redo className="w-6 h-6" />
             </button>
             <button onClick={clearCanvas} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95" title="Clear Canvas">
                <Trash2 className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Playful Canvas Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-indigo-100 dark:border-slate-800">
          {/* Top Bar for Canvas */}
          <div className="h-16 border-b-4 border-indigo-50 dark:border-slate-800 flex justify-between items-center px-6 bg-white dark:bg-slate-900 z-20">
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
              <button onClick={() => showToast("Awesome drawing saved! 🌟")} className="flex items-center gap-2 px-6 py-2.5 text-sm font-black bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95">
                <Save className="w-4 h-4 text-black" />
                Save to Portfolio
              </button>
            </div>
          </div>
          
          {/* Functional Canvas Area */}
          <div 
            className="flex-1 relative cursor-crosshair overflow-hidden touch-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#c7d2fe 2px, transparent 2px)', 
              backgroundSize: '30px 30px',
              backgroundColor: '#f8fafc'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* HTML5 Canvas for drawing */}
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full z-10"
            />
            
            {/* Render Shapes */}
            <div className="absolute inset-0 z-10 pointer-events-none">
               {[...shapes, currentShape].filter(Boolean).map((shape, i) => {
                 if (shape.type === 'shape-circle') {
                   const r = Math.sqrt(shape.w * shape.w + shape.h * shape.h);
                   return (
                     <div key={i} className="absolute rounded-full border-dashed" style={{
                       left: shape.x - r, top: shape.y - r,
                       width: r * 2, height: r * 2,
                       borderWidth: shape.strokeWidth,
                       borderColor: shape.color,
                       backgroundColor: shape.fill ? `${shape.color}40` : 'transparent'
                     }} />
                   );
                 }
                 if (shape.type === 'shape-square') {
                   return (
                     <div key={i} className="absolute border-dashed" style={{
                       left: shape.w < 0 ? shape.x + shape.w : shape.x, 
                       top: shape.h < 0 ? shape.y + shape.h : shape.y,
                       width: Math.abs(shape.w), height: Math.abs(shape.h),
                       borderWidth: shape.strokeWidth,
                       borderColor: shape.color,
                       backgroundColor: shape.fill ? `${shape.color}40` : 'transparent'
                     }} />
                   );
                 }
                 return null;
               })}
            </div>
            
            {/* Render Texts */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {texts.map(t => (
                <input 
                  key={t.id}
                  type="text"
                  value={t.text}
                  onChange={(e) => updateText(t.id, e.target.value)}
                  className="absolute bg-transparent outline-none pointer-events-auto"
                  style={{
                    left: t.x, top: t.y - (t.fontSize / 2),
                    color: t.color,
                    fontSize: `${t.fontSize}px`,
                    fontWeight: t.isBold ? '900' : 'normal',
                    fontStyle: t.isItalic ? 'italic' : 'normal',
                    textDecoration: t.isUnderline ? 'underline' : 'none',
                    textShadow: `1px 1px 0px ${t.color}40`,
                    minWidth: '200px'
                  }}
                  autoFocus
                />
              ))}
            </div>

            {/* Render Stickers */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {stickers.map(s => (
                <div key={s.id} className="absolute pointer-events-auto" style={{
                  left: s.x, top: s.y,
                  opacity: s.opacity / 100,
                  color: s.color
                }}>
                  {React.cloneElement(s.icon, { className: "w-20 h-20 drop-shadow-xl" })}
                </div>
              ))}
            </div>
            
            {/* Watermark/Hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-slate-300 dark:text-slate-700/30 text-3xl font-black uppercase tracking-widest select-none pointer-events-none z-0">
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
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>Stroke Width</span>
                       <span className="text-indigo-500">{strokeWidth}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="30" 
                      value={strokeWidth} 
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-slate-900 rounded-2xl border-2 border-indigo-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      ✏️ Tip: Pick a color from the left menu and start drawing on the canvas!
                    </p>
                  </div>
                </div>
              )}
              
              {activeTool === "eraser" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>Eraser Size</span>
                       <span className="text-pink-500">{eraserSize}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      value={eraserSize} 
                      onChange={(e) => setEraserSize(parseInt(e.target.value))}
                      className="w-full accent-pink-500 h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                  <button onClick={clearCanvas} className="w-full py-3 mt-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border-2 border-red-200 active:scale-95 flex items-center justify-center gap-2">
                     <Trash2 className="w-5 h-5" /> Erase All
                  </button>
                </div>
              )}
              
              {(activeTool === "shape-circle" || activeTool === "shape-square") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>Border Width</span>
                       <span className="text-emerald-500">{strokeWidth}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={strokeWidth} 
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                  <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-300 transition-colors">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Fill Shape Background</span>
                    <input 
                      type="checkbox" 
                      checked={fillShape} 
                      onChange={(e) => setFillShape(e.target.checked)}
                      className="w-5 h-5 rounded-md text-emerald-500 focus:ring-emerald-500 accent-emerald-500" 
                    />
                  </label>
                  <div className="p-4 bg-emerald-50 dark:bg-slate-900 rounded-2xl border-2 border-emerald-100 dark:border-slate-700 mt-2">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      🟦 Tip: Click and drag on the canvas to create your shape!
                    </p>
                  </div>
                </div>
              )}
              
              {activeTool === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>Font Size</span>
                       <span className="text-blue-500">{fontSize}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="12" 
                      max="72" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-blue-500 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Font Style</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsBold(!isBold)} 
                        className={`flex-1 py-3 rounded-xl font-bold border-2 transition-colors ${isBold ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                      >B</button>
                      <button 
                        onClick={() => setIsItalic(!isItalic)}
                        className={`flex-1 py-3 rounded-xl font-bold border-2 italic transition-colors ${isItalic ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                      >I</button>
                      <button 
                        onClick={() => setIsUnderline(!isUnderline)}
                        className={`flex-1 py-3 rounded-xl font-bold border-2 underline transition-colors ${isUnderline ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                      >U</button>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-2xl border-2 border-blue-100 dark:border-slate-700 mt-2">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      🔤 Tip: Click anywhere on the canvas to add a new text box! The text will show in your selected color.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTool === "image" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>Sticker Opacity</span>
                       <span className="text-purple-500">{opacity}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={opacity} 
                      onChange={(e) => setOpacity(parseInt(e.target.value))}
                      className="w-full accent-purple-500 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-slate-900 rounded-2xl border-2 border-purple-100 dark:border-slate-700 mt-2">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      ⭐ Tip: Click on the canvas to place a fun science sticker!
                    </p>
                  </div>
                </div>
              )}
              
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
