"use client";

import React, { useState, useRef, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { Pencil, Eraser, Circle, Square, Type, Download, Share2, Atom, Palette, Undo, Redo, Save, Trash2, Image as ImageIcon, Rocket, Upload, X, Star } from "lucide-react";

export default function ScienceDrawMatPage() {
  const { lang } = usePortalLanguage();
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedDiagram, setImportedDiagram] = useState<string | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const [shapes, setShapes] = useState<any[]>([]);
  const [currentShape, setCurrentShape] = useState<any>(null);
  const [texts, setTexts] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);

  const [history, setHistory] = useState<any[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  const saveState = (newShapes = shapes, newTexts = texts, newStickers = stickers) => {
    if (!canvasRef.current) return;
    const canvasData = canvasRef.current.toDataURL();
    const newState = {
      canvasData,
      shapes: newShapes,
      texts: newTexts,
      stickers: newStickers
    };
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      restoreState(history[newStep]);
      setHistoryStep(newStep);
      showToast("Undid last action!");
    } else if (historyStep === 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setShapes([]);
      setTexts([]);
      setStickers([]);
      setHistoryStep(-1);
      showToast("Undid last action!");
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      restoreState(history[newStep]);
      setHistoryStep(newStep);
      showToast("Redid action!");
    }
  };

  const restoreState = (state: any) => {
    if (!state) return;
    setShapes(state.shapes);
    setTexts(state.texts);
    setStickers(state.stickers);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = state.canvasData;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const observer = new ResizeObserver(() => {
      if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return;
      
      let imgData = null;
      if (canvas.width > 0 && canvas.height > 0) {
         try {
           imgData = context.getImageData(0, 0, canvas.width, canvas.height);
         } catch(e) {}
      }
      
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      if (imgData) {
         context.putImageData(imgData, 0, 0);
      }
    });
    
    observer.observe(canvas.parentElement || canvas);
    return () => observer.disconnect();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };
  
  const tools = [
    { id: "pencil", icon: <Pencil className="w-6 h-6" />, label: lang === "தமிழ்" ? "வரைதல்" : "Draw" },
    { id: "eraser", icon: <Eraser className="w-6 h-6" />, label: lang === "தமிழ்" ? "அழித்தல்" : "Erase" },
    { id: "shape-circle", icon: <Circle className="w-6 h-6" />, label: lang === "தமிழ்" ? "வட்டம்" : "Circle" },
    { id: "shape-square", icon: <Square className="w-6 h-6" />, label: lang === "தமிழ்" ? "சதுரம்" : "Square" },
    { id: "text", icon: <Type className="w-6 h-6" />, label: lang === "தமிழ்" ? "உரை" : "Text" },
    { id: "image", icon: <ImageIcon className="w-6 h-6" />, label: lang === "தமிழ்" ? "ஒட்டுப்படம்" : "Sticker" },
  ];

  const colors = [
    "#000000", "#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#f97316", "#06b6d4"
  ];

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          const maxWidth = canvas.width * 0.8;
          const maxHeight = canvas.height * 0.8;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
          
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;
          ctx.drawImage(img, x, y, width, height);
          saveState(shapes, texts, stickers);
          showToast("Diagram imported successfully! ");
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setShapes([]);
    setTexts([]);
    setStickers([]);
    showToast("Canvas Cleared! ");
    saveState([], [], []);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      isDrawingRef.current = true;
      lastPosRef.current = { x, y };
      const ctx = canvasRef.current?.getContext('2d');
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
      isDrawingRef.current = true;
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
      const newTexts = [...texts, {
        id: Date.now(),
        x, y,
        text: "Type here...",
        color: activeColor,
        fontSize,
        isBold,
        isItalic,
        isUnderline
      }];
      setTexts(newTexts);
      saveState(shapes, newTexts, stickers);
    } else if (activeTool === 'image') {
      // Add sticker
      const stickerIcons = [<Atom key="atom" />, <Rocket key="rocket" />, <Palette key="palette" />];
      const randomIcon = stickerIcons[Math.floor(Math.random() * stickerIcons.length)];
      const newStickers = [...stickers, {
        id: Date.now(),
        x: x - 40, y: y - 40,
        opacity,
        color: activeColor,
        icon: randomIcon
      }];
      setStickers(newStickers);
      saveState(shapes, texts, newStickers);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'pencil' || activeTool === 'eraser') {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineWidth = activeTool === 'eraser' ? eraserSize : strokeWidth;
      ctx.strokeStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor;
      ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.lineTo(x, y);
      ctx.stroke();
      lastPosRef.current = { x, y };
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
      const newShapes = [...shapes, currentShape];
      setShapes(newShapes);
      setCurrentShape(null);
      saveState(newShapes, texts, stickers);
    } else if (isDrawingRef.current && (activeTool === 'pencil' || activeTool === 'eraser')) {
      saveState(shapes, texts, stickers);
    }
    isDrawingRef.current = false;
    canvasRef.current?.getContext('2d')?.beginPath();
  };

  const updateText = (id: number, newText: string) => {
    setTexts(texts.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvasRef.current.width;
    canvas.height = canvasRef.current.height;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.drawImage(canvasRef.current, 0, 0);
    
    shapes.forEach(shape => {
       context.lineWidth = shape.strokeWidth;
       context.strokeStyle = shape.color;
       context.fillStyle = shape.fill ? `${shape.color}40` : 'transparent';
       if (shape.type === 'shape-circle') {
         context.beginPath();
         const r = Math.sqrt(shape.w * shape.w + shape.h * shape.h);
         context.arc(shape.x, shape.y, r, 0, 2 * Math.PI);
         if (shape.fill) context.fill();
         context.stroke();
       } else if (shape.type === 'shape-square') {
         context.beginPath();
         context.rect(shape.w < 0 ? shape.x + shape.w : shape.x, shape.h < 0 ? shape.y + shape.h : shape.y, Math.abs(shape.w), Math.abs(shape.h));
         if (shape.fill) context.fill();
         context.stroke();
       }
    });

    texts.forEach(t => {
       context.font = `${t.isItalic ? 'italic ' : ''}${t.isBold ? '900 ' : 'normal '}${t.fontSize}px sans-serif`;
       context.fillStyle = t.color;
       context.fillText(t.text, t.x, t.y);
       if (t.isUnderline) {
         const width = context.measureText(t.text).width;
         context.fillRect(t.x, t.y + 2, width, 2);
       }
    });

    const link = document.createElement('a');
    link.download = 'science-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Downloaded drawing as PNG! ");
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "அறிவியல் வரைபடம்" : "Science Draw Mat"}
      subtitle={lang === "தமிழ்" ? "வரைந்து, அழித்து, தட்டச்சு செய்து அற்புதமான அறிவியல் வரைபடங்களை உருவாக்குங்கள்!" : "Draw, erase, type, and create awesome science diagrams!"}
    >
      <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-140px)] xl:h-[calc(100vh-140px)] overflow-y-auto xl:overflow-hidden">
        
        {/* Playful Tools Sidebar */}
        <div className="w-full xl:w-24 flex-shrink-0 flex flex-row xl:flex-col gap-4 relative z-40 select-none">
          <div className="w-full bg-white dark:bg-slate-800 p-3 xl:p-4 flex flex-row xl:flex-col items-center justify-between xl:justify-start gap-3 xl:gap-4 rounded-3xl shadow-xl shadow-indigo-500/10 border-4 border-indigo-100 dark:border-slate-700 overflow-x-auto xl:overflow-x-visible">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setCurrentShape(null);
                  isDrawingRef.current = false;
                  showToast(`Selected: ${tool.label} `);
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative group shrink-0
                  ${activeTool === tool.id 
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110 rotate-3" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 hover:scale-105 hover:-rotate-3"
                  }`}
                title={tool.label}
              >
                {tool.icon}
                <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {tool.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 dark:bg-white rotate-45"></div>
                </span>
              </button>
            ))}
            
            <div className="hidden xl:block w-full h-1 bg-indigo-50 dark:bg-slate-700 rounded-full my-1"></div>
            
            {/* Colors */}
            <div className="flex flex-row xl:flex-col gap-2.5 xl:gap-3 items-center w-auto xl:w-full">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-500 shrink-0" style={{color: activeColor}}>
                <Palette className="w-6 h-6" />
              </div>
              <div className="flex xl:grid xl:grid-cols-2 gap-2 flex-wrap justify-center shrink-0">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`w-6 h-6 rounded-full transition-all duration-300 shadow-sm shrink-0 ${
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
          <div className="bg-white dark:bg-slate-800 p-2.5 xl:p-3 flex flex-row xl:flex-col items-center gap-2.5 xl:gap-3 rounded-3xl shadow-xl shadow-emerald-500/10 border-4 border-emerald-100 dark:border-slate-700 select-none w-full xl:w-auto overflow-x-auto justify-around xl:justify-start">
             <button onClick={undo} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0" title="Undo">
                <Undo className="w-6 h-6" />
             </button>
             <button onClick={redo} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0" title="Redo">
                <Redo className="w-6 h-6" />
             </button>
             <button onClick={clearCanvas} className="w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0" title="Clear Canvas">
                <Trash2 className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Center Area containing Canvas and Reference */}
        <div className="flex-1 flex flex-col xl:flex-row gap-6 min-w-0">
          {/* Playful Canvas Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-indigo-100 dark:border-slate-800">
          {/* Top Bar for Canvas */}
          <div className="h-auto border-b-4 border-indigo-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3 md:p-4 bg-white dark:bg-slate-900 z-20 select-none">
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-1.5 bg-pink-50 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 font-black text-xs md:text-sm rounded-2xl shadow-md shadow-pink-500/10 flex items-center gap-2">
                <Atom className="w-4 h-4 animate-spin-slow" />
                <span>{lang === "தமிழ்" ? "என் வரைபடம்" : "My Super Cool Drawing"}</span>
              </div>
              <span className="text-xs text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{lang === "தமிழ்" ? "இன்னும் சேமிக்கப்படவில்லை" : "Not saved yet"}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImport} 
              />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-black text-fuchsia-600 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-900/40 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/60 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95">
                <Upload className="w-4 h-4" />
                {lang === "தமிழ்" ? "இறக்குமதி" : "Import"}
              </button>
              <button onClick={() => showToast(lang === "தமிழ்" ? "இணைப்பு நகலெடுக்கப்பட்டது!" : "Link copied to clipboard! Share with your friends!")} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-black text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95">
                <Share2 className="w-4 h-4" />
                {lang === "தமிழ்" ? "பகிர்" : "Share"}
              </button>
              <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-black text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95">
                <Download className="w-4 h-4" />
                {lang === "தமிழ்" ? "பதிவிறக்கம்" : "Download"}
              </button>
              <button onClick={() => {
                handleDownload();
                showToast(lang === "தமிழ்" ? "வரைபடம் சேமிக்கப்பட்டது!" : "Awesome drawing saved! ");
              }} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-black text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95">
                <Save className="w-4 h-4" />
                {lang === "தமிழ்" ? "தொகுப்பில் சேமி" : "Save to Portfolio"}
              </button>
            </div>
          </div>
          
          {/* Functional Canvas Area */}
          <div 
            className="flex-1 relative cursor-crosshair overflow-hidden touch-none" 
            style={{ 
              backgroundColor: '#ffffff'
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
            
            {/* Watermark/Hint Removed */}
            {/* Watermark/Hint Removed */}
          </div>
        </div>

          {/* Reference Diagram Pane */}
          {importedDiagram && (
            <div className="xl:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border-8 border-fuchsia-100 dark:border-slate-700 p-4">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-black text-fuchsia-600 dark:text-fuchsia-300 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" /> {lang === "தமிழ்" ? "குறிப்பு படம்" : "Reference"}
                </h3>
                <button onClick={() => setImportedDiagram(null)} className="p-2 hover:bg-fuchsia-50 dark:hover:bg-slate-700 text-fuchsia-400 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-2">
                 <img src={importedDiagram} alt="Reference" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          )}
        </div>
        
        {/* Right Side Properties Panel */}
        <div className="w-full xl:w-72 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 flex flex-col gap-6 rounded-[2.5rem] shadow-xl border-4 border-indigo-100 dark:border-slate-700 h-full">
            <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-50 dark:border-slate-700 pb-3 flex items-center gap-2">
              <span className="capitalize">{activeTool.replace('shape-', '')}</span> {lang === "தமிழ்" ? "விருப்பங்கள்" : "Options"}
            </h3>
            
            <div className="flex-1 space-y-6">
              
              {activeTool === "pencil" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>{lang === "தமிழ்" ? "வரைவு அகலம்" : "Stroke Width"}</span>
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
                      <Pencil className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "குறிப்பு: இடது மெனுவிலிருந்து ஒரு வண்ணத்தைத் தேர்ந்தெடுத்து கேன்வாஸில் வரையத் தொடங்குங்கள்!" : "Tip: Pick a color from the left menu and start drawing on the canvas!"}
                    </p>
                  </div>
                </div>
              )}
              
              {activeTool === "eraser" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>{lang === "தமிழ்" ? "அழிப்பான் அளவு" : "Eraser Size"}</span>
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
                     <Trash2 className="w-5 h-5" /> {lang === "தமிழ்" ? "அனைத்தையும் அழி" : "Erase All"}
                  </button>
                </div>
              )}
              
              {(activeTool === "shape-circle" || activeTool === "shape-square") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>{lang === "தமிழ்" ? "எல்லை அகலம்" : "Border Width"}</span>
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
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{lang === "தமிழ்" ? "வடிவ பின்னணியை நிரப்பு" : "Fill Shape Background"}</span>
                    <input 
                      type="checkbox" 
                      checked={fillShape} 
                      onChange={(e) => setFillShape(e.target.checked)}
                      className="w-5 h-5 rounded-md text-emerald-500 focus:ring-emerald-500 accent-emerald-500" 
                    />
                  </label>
                  <div className="p-4 bg-emerald-50 dark:bg-slate-900 rounded-2xl border-2 border-emerald-100 dark:border-slate-700 mt-2">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Square className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "குறிப்பு: வடிவத்தை உருவாக்க கேன்வாஸில் கிளிக் செய்து இழுக்கவும்!" : "Tip: Click and drag on the canvas to create your shape!"}
                    </p>
                  </div>
                </div>
              )}
              
              {activeTool === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>{lang === "தமிழ்" ? "எழுத்துரு அளவு" : "Font Size"}</span>
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
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">{lang === "தமிழ்" ? "எழுத்துரு நடை" : "Font Style"}</label>
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
                      <Type className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "குறிப்பு: புதிய உரை பெட்டியைச் சேர்க்க கேன்வாஸில் எங்கு வேண்டுமானாலும் கிளிக் செய்யுங்க! தேர்ந்தெடுத்த வண்ணத்தில் உரை காண்பிக்கப்படும்." : "Tip: Click anywhere on the canvas to add a new text box! The text will show in your selected color."}
                    </p>
                  </div>
                </div>
              )}
              
              {activeTool === "image" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>{lang === "தமிழ்" ? "ஒட்டுப்படம் ஒளிபுகாநிலை" : "Sticker Opacity"}</span>
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
                      <Star className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "குறிப்பு: கேன்வாஸில் கிளிக் செய்து வேடிக்கையான அறிவியல் ஒட்டுப்படத்தை வைக்கவும்!" : "Tip: Click on the canvas to place a fun science sticker!"}
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
