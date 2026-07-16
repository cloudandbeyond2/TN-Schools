"use client";

import React, { useState, useRef, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Pencil, Eraser, Circle, Square, Type, Download, Share2, 
  Atom, Palette, Undo, Redo, Save, Trash2, Image as ImageIcon, 
  Rocket, Upload, X, Grid, MoveRight, Layers, Sticker, Library,
  Microscope, TestTube, Beaker, Zap, Settings2, BookOpen
} from "lucide-react";

export default function ScienceDrawMatPage() {
  const [activeTool, setActiveTool] = useState("pencil");
  const [activeColor, setActiveColor] = useState("#ec4899");
  const [toastMsg, setToastMsg] = useState("");
  
  const [activeRightTab, setActiveRightTab] = useState("properties");
  const [showGrid, setShowGrid] = useState(true);

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
  const [tracingOpacity, setTracingOpacity] = useState(50);
  
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
    { id: "pencil", icon: <Pencil className="w-6 h-6" />, label: "Draw" },
    { id: "eraser", icon: <Eraser className="w-6 h-6" />, label: "Erase" },
    { id: "shape-circle", icon: <Circle className="w-6 h-6" />, label: "Circle" },
    { id: "shape-square", icon: <Square className="w-6 h-6" />, label: "Square" },
    { id: "shape-arrow", icon: <MoveRight className="w-6 h-6" />, label: "Label Arrow" },
    { id: "text", icon: <Type className="w-6 h-6" />, label: "Text Label" }
  ];

  const colors = [
    "#000000", "#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#f97316", "#06b6d4"
  ];

  const scienceTemplates = [
    { id: 'cell', name: 'Plant Cell', url: 'https://placehold.co/600x400/e2e8f0/475569?text=Plant+Cell+Diagram' },
    { id: 'water-cycle', name: 'Water Cycle', url: 'https://placehold.co/600x400/e2e8f0/475569?text=Water+Cycle' },
    { id: 'beaker', name: 'Beaker Setup', url: 'https://placehold.co/400x600/e2e8f0/475569?text=Beaker+Setup' },
    { id: 'heart', name: 'Human Heart', url: 'https://placehold.co/400x500/e2e8f0/475569?text=Human+Heart' },
    { id: 'solar-system', name: 'Solar System', url: 'https://placehold.co/800x400/e2e8f0/475569?text=Solar+System' },
    { id: 'frog', name: 'Frog Anatomy', url: 'https://placehold.co/600x500/e2e8f0/475569?text=Frog+Anatomy' },
  ];

  const availableStickers = [
    { id: 'microscope', icon: <Microscope className="w-full h-full" />, name: 'Microscope' },
    { id: 'test-tube', icon: <TestTube className="w-full h-full" />, name: 'Test Tube' },
    { id: 'beaker', icon: <Beaker className="w-full h-full" />, name: 'Beaker' },
    { id: 'atom', icon: <Atom className="w-full h-full" />, name: 'Atom' },
    { id: 'zap', icon: <Zap className="w-full h-full" />, name: 'Energy' },
    { id: 'rocket', icon: <Rocket className="w-full h-full" />, name: 'Rocket' },
  ];

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImportedDiagram(event.target.result as string);
        showToast("Tracing image imported successfully! 🖼️");
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
    showToast("Canvas Cleared! ✨");
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
      const newTexts = [...texts, {
        id: Date.now(),
        x, y,
        text: "Type Label...",
        color: activeColor,
        fontSize,
        isBold,
        isItalic,
        isUnderline
      }];
      setTexts(newTexts);
      saveState(shapes, newTexts, stickers);
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

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTool.startsWith('shape-') && currentShape) {
      const newShapes = [...shapes, currentShape];
      setShapes(newShapes);
      setCurrentShape(null);
      
      // If arrow, auto-switch to text tool at the end of the arrow for easy labeling
      if (activeTool === 'shape-arrow') {
         setActiveTool('text');
         showToast("Arrow placed! Now click to add a text label.");
      }
      
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

  const addStickerToCanvas = (sticker: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const newStickers = [...stickers, {
      id: Date.now(),
      x: centerX - 40, y: centerY - 40,
      opacity,
      color: activeColor,
      icon: sticker.icon,
      name: sticker.name
    }];
    setStickers(newStickers);
    saveState(shapes, texts, newStickers);
    showToast(`Added ${sticker.name} sticker to center!`);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvasRef.current.width;
    canvas.height = canvasRef.current.height;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    if (showGrid) {
      // Draw grid
      context.strokeStyle = '#e2e8f0';
      context.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
    }
    
    const drawFinalContent = () => {
      context.drawImage(canvasRef.current!, 0, 0);
      
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
         } else if (shape.type === 'shape-arrow') {
           // draw arrow
           const headlen = 15; // length of head in pixels
           const dx = shape.w;
           const dy = shape.h;
           const angle = Math.atan2(dy, dx);
           context.beginPath();
           context.moveTo(shape.x, shape.y);
           context.lineTo(shape.x + shape.w, shape.y + shape.h);
           context.lineTo(shape.x + shape.w - headlen * Math.cos(angle - Math.PI / 6), shape.y + shape.h - headlen * Math.sin(angle - Math.PI / 6));
           context.moveTo(shape.x + shape.w, shape.y + shape.h);
           context.lineTo(shape.x + shape.w - headlen * Math.cos(angle + Math.PI / 6), shape.y + shape.h - headlen * Math.sin(angle + Math.PI / 6));
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
      showToast("Downloaded drawing as PNG! 🖼️");
    };

    if (importedDiagram) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        context.globalAlpha = tracingOpacity / 100;
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (canvasRatio > imgRatio) {
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        } else {
          drawHeight = canvas.width / imgRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        context.globalAlpha = 1.0;
        drawFinalContent();
      };
      // For placeholder images which might fail cross-origin without being careful, if it fails, just draw final content
      img.onerror = () => {
        drawFinalContent();
      };
      img.src = importedDiagram;
    } else {
      drawFinalContent();
    }
  };

  return (
    <PortalLayout
      title="Science Draw Mat 🔬"
      subtitle="Interactive canvas for learning, drawing, and diagramming"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Left Side: Drawing Tools */}
        <div className="lg:w-20 flex-shrink-0 flex flex-col gap-4 relative z-50">
          <div className="bg-white dark:bg-slate-800 py-6 px-2 flex flex-col items-center gap-3 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700 select-none">
            
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setCurrentShape(null);
                  isDrawingRef.current = false;
                  if (activeRightTab !== 'properties' && tool.id !== 'image') {
                     setActiveRightTab('properties');
                  }
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative group
                  ${activeTool === tool.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110" 
                    : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400"
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
            
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
            
            <button
               onClick={() => setShowGrid(!showGrid)}
               className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 relative group ${showGrid ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            >
               <Grid className="w-6 h-6" />
               <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Toggle Grid Background
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </span>
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-800 py-4 px-2 flex flex-col items-center gap-3 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700 mt-auto select-none">
             <button onClick={undo} className="w-12 h-12 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl flex items-center justify-center transition-all" title="Undo">
                <Undo className="w-5 h-5" />
             </button>
             <button onClick={redo} className="w-12 h-12 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl flex items-center justify-center transition-all" title="Redo">
                <Redo className="w-5 h-5" />
             </button>
             <button onClick={clearCanvas} className="w-12 h-12 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all" title="Clear Canvas">
                <Trash2 className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Center: Canvas Area */}
        <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Top Bar for Canvas */}
          <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-6 bg-slate-50 dark:bg-slate-900 z-20">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Unsaved Diagram</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => showToast("Submit functionality requires teacher dashboard integration")} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-all">
                <Share2 className="w-4 h-4" />
                Submit
              </button>
              <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm">
                <Download className="w-4 h-4" />
                Export Diagram
              </button>
            </div>
          </div>
          
          {/* Functional Canvas Area */}
          <div 
            className="flex-1 relative cursor-crosshair overflow-hidden touch-none" 
            style={{ backgroundColor: '#ffffff' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Grid Background Layer */}
            {showGrid && (
              <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />
            )}
            
            {/* Background Tracing Layer */}
            {importedDiagram && (
              <img 
                src={importedDiagram} 
                alt="Tracing Reference" 
                className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none transition-opacity"
                style={{ opacity: tracingOpacity / 100 }}
              />
            )}
            
            {/* HTML5 Canvas for drawing strokes */}
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full z-10"
            />
            
            {/* Render Shapes (Circles, Squares, Arrows) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
               {[...shapes, currentShape].filter(Boolean).map((shape, i) => {
                 if (shape.type === 'shape-circle') {
                   const r = Math.sqrt(shape.w * shape.w + shape.h * shape.h);
                   return (
                     <div key={i} className="absolute rounded-full border-solid" style={{
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
                     <div key={i} className="absolute border-solid" style={{
                       left: shape.w < 0 ? shape.x + shape.w : shape.x, 
                       top: shape.h < 0 ? shape.y + shape.h : shape.y,
                       width: Math.abs(shape.w), height: Math.abs(shape.h),
                       borderWidth: shape.strokeWidth,
                       borderColor: shape.color,
                       backgroundColor: shape.fill ? `${shape.color}40` : 'transparent'
                     }} />
                   );
                 }
                 if (shape.type === 'shape-arrow') {
                   // Calculate rotation and length
                   const dx = shape.w;
                   const dy = shape.h;
                   const length = Math.sqrt(dx * dx + dy * dy);
                   const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                   return (
                     <div key={i} className="absolute origin-left" style={{
                       left: shape.x, top: shape.y,
                       width: length,
                       height: shape.strokeWidth,
                       backgroundColor: shape.color,
                       transform: `rotate(${angle}deg)`
                     }}>
                        {/* Arrow head */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2" style={{
                           width: 0, height: 0,
                           borderTop: `${shape.strokeWidth * 2}px solid transparent`,
                           borderBottom: `${shape.strokeWidth * 2}px solid transparent`,
                           borderLeft: `${shape.strokeWidth * 3}px solid ${shape.color}`,
                           transform: 'translateX(50%)'
                        }} />
                     </div>
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
                  className="absolute bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm outline-none pointer-events-auto border border-slate-200 dark:border-slate-600 rounded px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  style={{
                    left: t.x, top: t.y - (t.fontSize / 2),
                    color: t.color,
                    fontSize: `${t.fontSize}px`,
                    fontWeight: t.isBold ? '900' : 'normal',
                    fontStyle: t.isItalic ? 'italic' : 'normal',
                    textDecoration: t.isUnderline ? 'underline' : 'none',
                    minWidth: '150px'
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
                  {React.cloneElement(s.icon, { className: "w-20 h-20 drop-shadow-xl cursor-move" })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Side: Learning Resources Panel */}
        <div className="lg:w-80 flex-shrink-0 flex flex-col gap-4">
          
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-slate-800 p-2 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700 flex select-none">
             {[
                { id: 'properties', icon: <Settings2 className="w-4 h-4"/>, label: 'Tool' },
                { id: 'templates', icon: <Library className="w-4 h-4"/>, label: 'Templates' },
                { id: 'stickers', icon: <Sticker className="w-4 h-4"/>, label: 'Stickers' }
             ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveRightTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-[1.5rem] text-sm font-semibold transition-all ${activeRightTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                   {tab.icon} {tab.label}
                </button>
             ))}
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 flex flex-col rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700 flex-1 overflow-y-auto">
            
            {/* PROPERTIES TAB */}
            {activeRightTab === 'properties' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <span className="capitalize">{activeTool.replace('shape-', '')}</span> Properties
                </h3>
                
                {/* Global Color Picker */}
                <div>
                   <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Color</label>
                   <div className="grid grid-cols-5 gap-3">
                     {colors.map((color) => (
                       <button
                         key={color}
                         onClick={() => setActiveColor(color)}
                         className={`w-8 h-8 rounded-full transition-all shadow-sm ${
                           activeColor === color ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "hover:scale-110"
                         }`}
                         style={{ backgroundColor: color }}
                         title={`Color: ${color}`}
                       />
                     ))}
                   </div>
                </div>

                {activeTool === "pencil" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>Stroke Width</span>
                       <span className="text-indigo-500">{strokeWidth}px</span>
                    </label>
                    <input 
                      type="range" min="1" max="30" 
                      value={strokeWidth} 
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-2 bg-indigo-50 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                )}
                
                {activeTool === "eraser" && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                       <span>Eraser Size</span>
                       <span className="text-pink-500">{eraserSize}px</span>
                    </label>
                    <input 
                      type="range" min="5" max="100" 
                      value={eraserSize} 
                      onChange={(e) => setEraserSize(parseInt(e.target.value))}
                      className="w-full accent-pink-500 h-2 bg-pink-50 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                )}
                
                {(activeTool === "shape-circle" || activeTool === "shape-square" || activeTool === "shape-arrow") && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                         <span>Stroke/Arrow Width</span>
                         <span className="text-indigo-500">{strokeWidth}px</span>
                      </label>
                      <input 
                        type="range" min="1" max="20" 
                        value={strokeWidth} 
                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-2 bg-indigo-50 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    {activeTool !== 'shape-arrow' && (
                      <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fill Shape</span>
                        <input 
                          type="checkbox" 
                          checked={fillShape} 
                          onChange={(e) => setFillShape(e.target.checked)}
                          className="w-5 h-5 rounded-md text-indigo-500" 
                        />
                      </label>
                    )}
                  </div>
                )}
                
                {activeTool === "text" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                         <span>Font Size</span>
                         <span className="text-indigo-500">{fontSize}px</span>
                      </label>
                      <input 
                        type="range" min="12" max="72" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-2 bg-indigo-50 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Style</label>
                      <div className="flex gap-2">
                        <button onClick={() => setIsBold(!isBold)} className={`flex-1 py-2 rounded-lg font-bold border transition-colors ${isBold ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'}`}>B</button>
                        <button onClick={() => setIsItalic(!isItalic)} className={`flex-1 py-2 rounded-lg font-bold border italic transition-colors ${isItalic ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'}`}>I</button>
                        <button onClick={() => setIsUnderline(!isUnderline)} className={`flex-1 py-2 rounded-lg font-bold border underline transition-colors ${isUnderline ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'}`}>U</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Common Tracing Settings */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                   <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                     <Layers className="w-4 h-4" /> Background Layer
                   </h4>
                   
                   {importedDiagram ? (
                     <>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 flex justify-between">
                             <span>Opacity</span>
                             <span>{tracingOpacity}%</span>
                          </label>
                          <input 
                            type="range" min="0" max="100" 
                            value={tracingOpacity} 
                            onChange={(e) => setTracingOpacity(parseInt(e.target.value))}
                            className="w-full accent-slate-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                          />
                        </div>
                        <button 
                          onClick={() => setImportedDiagram(null)} 
                          className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                           <Trash2 className="w-4 h-4" /> Remove Background
                        </button>
                     </>
                   ) : (
                     <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-500 mb-3">No tracing background selected. Go to Templates or upload your own.</p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImport} />
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700">
                           Upload Image
                        </button>
                     </div>
                   )}
                </div>

              </div>
            )}

            {/* TEMPLATES TAB */}
            {activeRightTab === 'templates' && (
               <div className="space-y-4">
                  <div className="mb-4">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Science Templates</h3>
                     <p className="text-xs text-slate-500 mt-1">Select a template to use as a tracing background.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                     {scienceTemplates.map(template => (
                        <button 
                           key={template.id}
                           onClick={() => {
                              setImportedDiagram(template.url);
                              showToast(`Loaded ${template.name} template!`);
                           }}
                           className="flex flex-col items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                        >
                           <div className="w-full h-20 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                              <img src={template.url} alt={template.name} className="w-full h-full object-cover opacity-80" />
                           </div>
                           <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-full truncate">{template.name}</span>
                        </button>
                     ))}
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                     <h4 className="text-sm font-bold text-slate-700 mb-2">Or upload your own</h4>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImport} />
                     <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" /> Upload Custom Image
                     </button>
                  </div>
               </div>
            )}

            {/* STICKERS TAB */}
            {activeRightTab === 'stickers' && (
               <div className="space-y-4">
                  <div className="mb-4">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Science Stickers</h3>
                     <p className="text-xs text-slate-500 mt-1">Click a sticker to add it to your diagram.</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                     {availableStickers.map(sticker => (
                        <button 
                           key={sticker.id}
                           onClick={() => addStickerToCanvas(sticker)}
                           className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-indigo-500"
                        >
                           <div className="w-8 h-8">
                              {sticker.icon}
                           </div>
                           <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">
                              {sticker.name}
                           </span>
                        </button>
                     ))}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 flex justify-between mt-6">
                       <span>Sticker Opacity</span>
                       <span>{opacity}%</span>
                    </label>
                    <input 
                      type="range" min="10" max="100" 
                      value={opacity} 
                      onChange={(e) => setOpacity(parseInt(e.target.value))}
                      className="w-full accent-slate-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
               </div>
            )}

          </div>
        </div>
        
      </div>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-2 border border-slate-700">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </PortalLayout>
  );
}
