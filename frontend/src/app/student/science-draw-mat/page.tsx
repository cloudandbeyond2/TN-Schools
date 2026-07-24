"use client";

import React, { useState, useRef, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Pencil, Eraser, Circle, Square, Type, Download, Share2, 
  Atom, Palette, Undo, Redo, Save, Trash2, Image as ImageIcon, 
  Rocket, Upload, X, Grid, MoveRight, Layers, Sticker, Library,
  Microscope, TestTube, Beaker, Zap, Settings2, BookOpen
} from "lucide-react";

const createSvgDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const PLANT_CELL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><rect width="800" height="500" fill="#f8fafc"/><polygon points="120,60 680,40 740,440 80,460" fill="#dcfce7" stroke="#16a34a" stroke-width="12" stroke-linejoin="round"/><polygon points="135,75 665,55 723,425 95,445" fill="#f0fdf4" stroke="#22c55e" stroke-width="5" stroke-linejoin="round"/><ellipse cx="450" cy="260" rx="180" ry="120" fill="#bae6fd" stroke="#0284c7" stroke-width="4" opacity="0.8"/><text x="410" y="265" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0369a1">Vacuole</text><circle cx="250" cy="200" r="75" fill="#fbcfe8" stroke="#db2777" stroke-width="5"/><circle cx="250" cy="200" r="30" fill="#be185d"/><text x="210" y="205" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ffffff">Nucleus</text><ellipse cx="200" cy="360" rx="45" ry="25" fill="#4ade80" stroke="#15803d" stroke-width="3"/><line x1="175" y1="360" x2="225" y2="360" stroke="#15803d" stroke-width="2"/><ellipse cx="580" cy="140" rx="45" ry="25" fill="#4ade80" stroke="#15803d" stroke-width="3"/><line x1="555" y1="140" x2="605" y2="140" stroke="#15803d" stroke-width="2"/><ellipse cx="620" cy="340" rx="40" ry="20" fill="#fca5a5" stroke="#dc2626" stroke-width="3" transform="rotate(-15 620 340)"/><path d="M 595 340 Q 610 330 620 340 T 645 340" fill="none" stroke="#dc2626" stroke-width="2"/><text x="290" y="45" font-family="sans-serif" font-size="24" font-weight="black" fill="#15803d">PLANT CELL ANATOMY</text></svg>`;

const WATER_CYCLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><rect width="800" height="500" fill="#f0f9ff"/><circle cx="120" cy="100" r="50" fill="#facc15" stroke="#eab308" stroke-width="6"/><path d="M120 20 L120 35 M120 160 L120 175 M40 100 L55 100 M185 100 L200 100 M65 45 L75 55 M165 145 L175 155 M65 155 L75 145 M165 55 L175 45" stroke="#facc15" stroke-width="6" stroke-linecap="round"/><polygon points="450,450 620,180 790,450" fill="#64748b"/><polygon points="570,260 620,180 670,260" fill="#ffffff"/><polygon points="280,450 420,240 550,450" fill="#94a3b8"/><path d="M0 380 Q 200 360 400 390 T 800 370 L 800 500 L 0 500 Z" fill="#38bdf8"/><path d="M280 120 A30 30 0 0 1 340 110 A40 40 0 0 1 410 130 A30 30 0 0 1 420 160 L270 160 Z" fill="#93c5fd" stroke="#3b82f6" stroke-width="3"/><path d="M550 100 A35 35 0 0 1 620 90 A45 45 0 0 1 700 120 A35 35 0 0 1 710 150 L540 150 Z" fill="#475569" stroke="#1e293b" stroke-width="3"/><line x1="580" y1="170" x2="570" y2="210" stroke="#0284c7" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 8"/><line x1="620" y1="170" x2="610" y2="210" stroke="#0284c7" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 8"/><line x1="660" y1="170" x2="650" y2="210" stroke="#0284c7" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 8"/><path d="M180 340 Q 200 240 220 200" fill="none" stroke="#ea580c" stroke-width="5" stroke-dasharray="6 6"/><polygon points="220,190 210,210 230,205" fill="#ea580c"/><text x="130" y="270" font-family="sans-serif" font-size="18" font-weight="black" fill="#ea580c">Evaporation</text><text x="310" y="90" font-family="sans-serif" font-size="18" font-weight="black" fill="#1d4ed8">Condensation</text><text x="610" y="80" font-family="sans-serif" font-size="18" font-weight="black" fill="#ffffff">Precipitation</text><text x="320" y="45" font-family="sans-serif" font-size="24" font-weight="black" fill="#0369a1">THE WATER CYCLE</text></svg>`;

const BEAKER_SETUP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><rect width="800" height="500" fill="#f8fafc"/><rect x="150" y="420" width="500" height="20" fill="#64748b" rx="5"/><rect x="360" y="380" width="80" height="40" fill="#334155" rx="4"/><rect x="390" y="300" width="20" height="80" fill="#94a3b8"/><path d="M390 300 Q 400 240 400 230 Q 410 270 410 300 Z" fill="#ef4444"/><path d="M395 300 Q 400 260 400 250 Q 405 280 405 300 Z" fill="#facc15"/><line x1="300" y1="420" x2="330" y2="230" stroke="#475569" stroke-width="8"/><line x1="500" y1="420" x2="470" y2="230" stroke="#475569" stroke-width="8"/><line x1="320" y1="230" x2="480" y2="230" stroke="#334155" stroke-width="10"/><path d="M330 90 L330 225 A15 15 0 0 0 345 240 L455 240 A15 15 0 0 0 470 225 L470 90 Z" fill="#e0f2fe" stroke="#0284c7" stroke-width="6" opacity="0.9"/><rect x="320" y="80" width="160" height="12" fill="#bae6fd" stroke="#0284c7" stroke-width="4" rx="3"/><path d="M334 140 L334 225 A10 10 0 0 0 344 234 L456 234 A10 10 0 0 0 466 225 L466 140 Z" fill="#38bdf8" opacity="0.75"/><circle cx="370" cy="180" r="8" fill="#ffffff" opacity="0.8"/><circle cx="420" cy="160" r="10" fill="#ffffff" opacity="0.8"/><circle cx="390" cy="200" r="6" fill="#ffffff" opacity="0.8"/><rect x="420" y="30" width="12" height="190" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="3"/><rect x="424" y="100" width="4" height="115" fill="#ef4444"/><circle cx="426" cy="210" r="10" fill="#ef4444"/><text x="240" y="45" font-family="sans-serif" font-size="24" font-weight="black" fill="#0f172a">CHEMISTRY HEATING SETUP</text></svg>`;

const HUMAN_HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><rect width="800" height="500" fill="#fff1f2"/><path d="M 330 60 L 330 180 M 370 40 Q 400 20 440 50 L 440 180" stroke="#2563eb" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M 400 40 Q 430 20 480 60 L 450 180" stroke="#dc2626" stroke-width="32" fill="none" stroke-linecap="round"/><path d="M 300 160 C 220 180 200 300 350 440 C 420 470 580 340 550 200 C 530 130 420 140 380 180 C 350 140 320 140 300 160 Z" fill="#e11d48" stroke="#9f1239" stroke-width="8"/><path d="M 280 200 C 230 220 240 320 340 400 L 350 240 Z" fill="#3b82f6" opacity="0.7"/><text x="240" y="270" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff">Right Ventricle</text><path d="M 360 240 L 350 410 C 440 410 520 300 500 220 Z" fill="#991b1b" opacity="0.8"/><text x="400" y="290" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff">Left Ventricle</text><path d="M 350 230 L 350 430" stroke="#fecdd3" stroke-width="8"/><text x="270" y="35" font-family="sans-serif" font-size="24" font-weight="black" fill="#881337">HUMAN HEART ANATOMY</text></svg>`;

const SOLAR_SYSTEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><rect width="800" height="500" fill="#0f172a"/><circle cx="60" cy="250" r="110" fill="#fbbf24" stroke="#f59e0b" stroke-width="8"/><circle cx="60" cy="250" r="130" fill="#fef08a" opacity="0.2"/><ellipse cx="60" cy="250" rx="200" ry="80" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="6 6"/><ellipse cx="60" cy="250" rx="290" ry="110" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="6 6"/><ellipse cx="60" cy="250" rx="400" ry="140" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="6 6"/><ellipse cx="60" cy="250" rx="530" ry="175" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="6 6"/><ellipse cx="60" cy="250" rx="680" ry="215" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="6 6"/><circle cx="260" cy="250" r="10" fill="#94a3b8"/><text x="245" y="278" font-family="sans-serif" font-size="12" font-weight="bold" fill="#cbd5e1">Mercury</text><circle cx="340" cy="210" r="16" fill="#fb923c"/><text x="325" y="242" font-family="sans-serif" font-size="12" font-weight="bold" fill="#cbd5e1">Venus</text><circle cx="450" cy="215" r="20" fill="#38bdf8"/><circle cx="470" cy="205" r="5" fill="#e2e8f0"/><text x="435" y="252" font-family="sans-serif" font-size="13" font-weight="bold" fill="#38bdf8">Earth</text><circle cx="550" cy="290" r="14" fill="#ef4444"/><text x="538" y="320" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fca5a5">Mars</text><circle cx="700" cy="220" r="42" fill="#d97706"/><ellipse cx="715" cy="230" rx="10" ry="6" fill="#991b1b"/><text x="675" y="280" font-family="sans-serif" font-size="15" font-weight="bold" fill="#fde047">Jupiter</text><text x="300" y="45" font-family="sans-serif" font-size="24" font-weight="black" fill="#f8fafc">THE SOLAR SYSTEM</text></svg>`;

const FROG_ANATOMY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500"><rect width="800" height="500" fill="#f0fdf4"/><path d="M 400 80 Q 480 100 520 180 Q 560 280 500 380 Q 450 440 400 440 Q 350 440 300 380 Q 240 280 280 180 Q 320 100 400 80 Z" fill="#86efac" stroke="#16a34a" stroke-width="8"/><circle cx="320" cy="110" r="25" fill="#fef08a" stroke="#15803d" stroke-width="5"/><circle cx="320" cy="110" r="10" fill="#000000"/><circle cx="480" cy="110" r="25" fill="#fef08a" stroke="#15803d" stroke-width="5"/><circle cx="480" cy="110" r="10" fill="#000000"/><circle cx="400" cy="200" r="22" fill="#ef4444" stroke="#991b1b" stroke-width="3"/><text x="430" y="205" font-family="sans-serif" font-size="14" font-weight="bold" fill="#991b1b">Heart</text><path d="M 340 230 Q 400 240 460 230 Q 470 280 400 290 Q 330 280 340 230 Z" fill="#b45309" stroke="#78350f" stroke-width="3"/><text x="270" y="260" font-family="sans-serif" font-size="14" font-weight="bold" fill="#78350f">Liver</text><path d="M 430 290 Q 470 330 420 370 Q 390 350 430 290 Z" fill="#fcd34d" stroke="#d97706" stroke-width="3"/><text x="460" y="340" font-family="sans-serif" font-size="14" font-weight="bold" fill="#b45309">Stomach</text><path d="M 360 330 Q 400 370 370 390 Q 350 360 360 330 Z" fill="#f472b6" stroke="#db2777" stroke-width="3"/><text x="270" y="370" font-family="sans-serif" font-size="14" font-weight="bold" fill="#be185d">Intestines</text><text x="270" y="45" font-family="sans-serif" font-size="24" font-weight="black" fill="#14532d">FROG INTERNAL ANATOMY</text></svg>`;

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
  const [importedDiagram, setImportedDiagram] = useState<string | null>(createSvgDataUrl(PLANT_CELL_SVG));
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
    { id: 'cell', name: 'Plant Cell', url: createSvgDataUrl(PLANT_CELL_SVG) },
    { id: 'water-cycle', name: 'Water Cycle', url: createSvgDataUrl(WATER_CYCLE_SVG) },
    { id: 'beaker', name: 'Beaker Setup', url: createSvgDataUrl(BEAKER_SETUP_SVG) },
    { id: 'heart', name: 'Human Heart', url: createSvgDataUrl(HUMAN_HEART_SVG) },
    { id: 'solar-system', name: 'Solar System', url: createSvgDataUrl(SOLAR_SYSTEM_SVG) },
    { id: 'frog', name: 'Frog Anatomy', url: createSvgDataUrl(FROG_ANATOMY_SVG) },
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
