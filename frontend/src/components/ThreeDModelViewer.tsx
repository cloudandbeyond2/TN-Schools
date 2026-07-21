"use client";

import React, { useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, X, Volume2, Bookmark, HelpCircle } from "lucide-react";

interface Shape3D {
  type: "sphere" | "cylinder" | "box" | "ring" | "line" | "particle_cloud" | "text";
  color: string;
  label?: string;
  description?: string;
  // Position / dimensions
  x?: number; y?: number; z?: number;
  radius?: number;
  x1?: number; y1?: number; z1?: number;
  x2?: number; y2?: number; z2?: number;
  w?: number; h?: number; d?: number; // Box dimensions
  plane?: "xy" | "xz" | "yz"; // Ring orientation
  thickness?: number; // Ring thickness
  text?: string; // Text content
  fontSize?: number;
  xLink?: number; yLink?: number; zLink?: number; // Annotation pointer target
  points?: [number, number, number][]; // Particle cloud
  particleSize?: number;
}

interface ThreeDModelViewerProps {
  shapes: Shape3D[];
  name: string;
  description?: string;
  colorTheme?: string;
  autoRotate?: boolean;
  theme?: "light" | "dark";
}

// Helper: lighten hex color for 3D highlights
function lightenColor(hex: string, percent: number): string {
  try {
    hex = hex.replace(/^\s*#|\s*$/g, "");
    if (hex.length === 3) hex = hex.replace(/(.)/g, "$1$1");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch (e) {
    return hex;
  }
}

// Helper: darken hex color for 3D shadows
function darkenColor(hex: string, percent: number): string {
  try {
    hex = hex.replace(/^\s*#|\s*$/g, "");
    if (hex.length === 3) hex = hex.replace(/(.)/g, "$1$1");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - percent)));
    g = Math.max(0, Math.floor(g * (1 - percent)));
    b = Math.max(0, Math.floor(b * (1 - percent)));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch (e) {
    return hex;
  }
}

export default function ThreeDModelViewer({
  shapes = [],
  name,
  description = "",
  colorTheme = "indigo",
  autoRotate: initialAutoRotate = true,
  theme = "dark",
}: ThreeDModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [angleX, setAngleX] = useState<number>(0.3); // X rotation (vertical tilt)
  const [angleY, setAngleY] = useState<number>(0.5); // Y rotation (horizontal rotation)
  const [zoom, setZoom] = useState<number>(1.2);
  const [isPlaying, setIsPlaying] = useState<boolean>(initialAutoRotate);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState<number>(0);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<Shape3D | null>(null);
  const [cursorStyle, setCursorStyle] = useState<"grab" | "grabbing" | "pointer">("grab");

  // Quiz State
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [quizTarget, setQuizTarget] = useState<Shape3D | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizMessage, setQuizMessage] = useState<string>("");

  // Start Quiz
  const toggleQuizMode = () => {
    if (quizMode) {
      setQuizMode(false);
      setQuizTarget(null);
      setQuizMessage("");
      setSelectedShape(null);
    } else {
      const parts = shapes.filter(s => s.label);
      if (parts.length < 2) {
        alert("Not enough labeled parts to create a quiz for this model!");
        return;
      }
      const target = parts[Math.floor(Math.random() * parts.length)];
      setQuizTarget(target);
      
      // Generate options (1 correct, 3 random wrong)
      const optionsSet = new Set<string>();
      optionsSet.add(target.label!);
      while (optionsSet.size < Math.min(4, parts.length)) {
        const randomPart = parts[Math.floor(Math.random() * parts.length)];
        optionsSet.add(randomPart.label!);
      }
      setQuizOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
      
      setQuizMode(true);
      setQuizMessage("What is the highlighted part?");
      setSelectedShape(null);
    }
  };

  const handleQuizAnswer = (option: string) => {
    if (option === quizTarget?.label) {
      setQuizMessage("Correct! 🎉");
      setTimeout(() => toggleQuizMode(), 2000);
    } else {
      setQuizMessage("Try again! ❌");
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const handleSaveFlashcard = () => {
    alert("Saved to Study Boost Flashcards! 🚀");
  };

  // Update Y rotation over time if auto-playing
  useEffect(() => {
    if (!isPlaying || isDragging) return;
    let animationId: number;

    const tick = () => {
      setAngleY((prev) => (prev + 0.008) % (Math.PI * 2));
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, isDragging]);

  // Mouse / Touch Handlers for Drag-to-Rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragDistance(0);
    setCursorStyle("grabbing");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragDistance((prev) => prev + Math.hypot(dx, dy));

    // Adjust angles based on drag distance
    setAngleY((prev) => prev + dx * 0.007);
    setAngleX((prev) => Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, prev + dy * 0.007)));
    setDragStart({ x: e.clientX, y: e.clientY });
    setCursorStyle("grabbing");
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
    setCursorStyle(hoveredLabel ? "pointer" : "grab");

    // Check if it's a click
    if (dragDistance < 6) {
      handleCanvasClick(e.clientX, e.clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setDragDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    setDragDistance((prev) => prev + Math.hypot(dx, dy));

    setAngleY((prev) => prev + dx * 0.008);
    setAngleX((prev) => Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, prev + dy * 0.008)));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom in when scrolling up (negative deltaY), out when scrolling down (positive)
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(2.5, z + 0.15));
    } else {
      setZoom((z) => Math.max(0.4, z - 0.15));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const cameraDistance = 350;
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    let clickedShape: Shape3D | null = null;
    let minDistance = 25; // pixels threshold

    shapes.forEach((shape) => {
      if (!shape.label) return;
      const x = (shape.x || 0) * zoom;
      const y = (shape.y || 0) * zoom;
      const z = (shape.z || 0) * zoom;

      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = cameraDistance / (cameraDistance + z2);
      const sx = centerX + x1 * scale;
      const sy = centerY - y2 * scale;

      const dist = Math.hypot(mx - sx, my - sy);
      if (dist < minDistance) {
        minDistance = dist;
        clickedShape = shape;
      }
    });

    if (clickedShape && !quizMode) {
      setSelectedShape(clickedShape);
    }
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const cameraDistance = 350;

    // Trigonometric functions for rotation matrices
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    // 3D rotation projection helper
    // Rotates points around Y (angleY) then X (angleX)
    const project = (x: number, y: number, z: number) => {
      // Apply scale/zoom to 3D coordinate space
      x *= zoom;
      y *= zoom;
      z *= zoom;

      // Rotate Y (horizontal)
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate X (vertical pitch)
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective scale factor
      const scale = cameraDistance / (cameraDistance + z2);
      const sx = centerX + x1 * scale;
      const sy = centerY - y2 * scale; // inverted screen Y

      return { sx, sy, sz: z2, scale };
    };

    // Prepare list of elements to render, complete with their projected positions
    interface RenderItem {
      type: string;
      depth: number;
      draw: () => void;
      label?: string;
    }

    const items: RenderItem[] = [];

    // 1. Grid lines / environment lines
    const gridY = -80;
    const gridColor = theme === "light" ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.12)";
    for (let i = -100; i <= 100; i += 25) {
      // Lines parallel to Z axis (from x = i, z = -100 to x = i, z = 100)
      items.push({
        type: "grid",
        depth: 200, // Background element
        draw: () => {
          ctx.strokeStyle = gridColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const pStart = project(i, gridY, -100);
          const pEnd = project(i, gridY, 100);
          ctx.moveTo(pStart.sx, pStart.sy);
          ctx.lineTo(pEnd.sx, pEnd.sy);
          ctx.stroke();
        },
      });

      // Lines parallel to X axis (from x = -100, z = i to x = 100, z = i)
      items.push({
        type: "grid",
        depth: 200,
        draw: () => {
          ctx.strokeStyle = gridColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const pStart = project(-100, gridY, i);
          const pEnd = project(100, gridY, i);
          ctx.moveTo(pStart.sx, pStart.sy);
          ctx.lineTo(pEnd.sx, pEnd.sy);
          ctx.stroke();
        },
      });
    }

    // Process shapes from properties
    shapes.forEach((shape) => {
      const color = shape.color || "#6366f1";

      if (shape.type === "sphere") {
        const { x = 0, y = 0, z = 0, radius = 15 } = shape;
        const p = project(x, y, z);

        items.push({
          type: "sphere",
          depth: p.sz,
          label: shape.label,
          draw: () => {
            const rScaled = radius * zoom * p.scale;
            if (rScaled <= 0.5) return;

            // 3D Sphere shading using radial gradients
            const grad = ctx.createRadialGradient(
              p.sx - rScaled * 0.3,
              p.sy - rScaled * 0.3,
              rScaled * 0.05,
              p.sx,
              p.sy,
              rScaled
            );
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(0.2, lightenColor(color, 0.4));
            grad.addColorStop(0.8, color);
            grad.addColorStop(1, darkenColor(color, 0.6));

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, rScaled, 0, Math.PI * 2);
            ctx.fill();

            // Glow ring around hovered/selected/quiz parts
            const isHovered = shape.label && hoveredLabel === shape.label && !quizMode;
            const isSelected = shape.label && selectedShape?.label === shape.label && !quizMode;
            const isQuizTarget = quizMode && quizTarget?.label === shape.label;
            
            if (isHovered || isSelected || isQuizTarget) {
              ctx.strokeStyle = isSelected ? "#e0e7ff" : (isQuizTarget ? "#fcd34d" : "#ffffff");
              ctx.lineWidth = isSelected || isQuizTarget ? 3 : 2;
              ctx.beginPath();
              ctx.arc(p.sx, p.sy, rScaled + 4, 0, Math.PI * 2);
              ctx.stroke();
            }
          },
        });
      } else if (shape.type === "cylinder") {
        const { x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0, radius = 5 } = shape;
        const p1 = project(x1, y1, z1);
        const p2 = project(x2, y2, z2);
        const avgZ = (p1.sz + p2.sz) / 2;

        items.push({
          type: "cylinder",
          depth: avgZ,
          label: shape.label,
          draw: () => {
            const w1 = radius * zoom * p1.scale;
            const w2 = radius * zoom * p2.scale;

            const dx = p2.sx - p1.sx;
            const dy = p2.sy - p1.sy;
            const len = Math.hypot(dx, dy);

            if (len < 0.2) return;

            const nx = -dy / len;
            const ny = dx / len;

            // Linear gradient for 3D metallic/curved cylinder lighting
            const grad = ctx.createLinearGradient(
              p1.sx - nx * w1,
              p1.sy - ny * w1,
              p1.sx + nx * w1,
              p1.sy + ny * w1
            );
            grad.addColorStop(0, darkenColor(color, 0.5));
            grad.addColorStop(0.2, color);
            grad.addColorStop(0.4, lightenColor(color, 0.4));
            grad.addColorStop(0.7, color);
            grad.addColorStop(1, darkenColor(color, 0.6));

            ctx.fillStyle = grad;

            // Draw trunk
            ctx.beginPath();
            ctx.moveTo(p1.sx + nx * w1, p1.sy + ny * w1);
            ctx.lineTo(p2.sx + nx * w2, p2.sy + ny * w2);
            ctx.lineTo(p2.sx - nx * w2, p2.sy - ny * w2);
            ctx.lineTo(p1.sx - nx * w1, p1.sy - ny * w1);
            ctx.closePath();
            ctx.fill();

            // Draw end caps (ellipses)
            ctx.fillStyle = lightenColor(color, 0.15);
            ctx.beginPath();
            ctx.ellipse(p1.sx, p1.sy, w1, w1 * 0.4, Math.atan2(dy, dx), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = darkenColor(color, 0.2);
            ctx.beginPath();
            ctx.ellipse(p2.sx, p2.sy, w2, w2 * 0.4, Math.atan2(dy, dx), 0, Math.PI * 2);
            ctx.fill();
          },
        });
      } else if (shape.type === "ring") {
        const { x = 0, y = 0, z = 0, radius = 30, plane = "xz", thickness = 2 } = shape;
        const pCenter = project(x, y, z);

        items.push({
          type: "ring",
          depth: pCenter.sz,
          label: shape.label,
          draw: () => {
            ctx.strokeStyle = color;
            ctx.lineWidth = thickness * zoom * pCenter.scale;
            ctx.beginPath();

            const numSegments = 60;
            for (let i = 0; i <= numSegments; i++) {
              const theta = (i / numSegments) * Math.PI * 2;
              let dx = 0, dy = 0, dz = 0;

              if (plane === "xz") {
                dx = radius * Math.cos(theta);
                dz = radius * Math.sin(theta);
              } else if (plane === "xy") {
                dx = radius * Math.cos(theta);
                dy = radius * Math.sin(theta);
              } else {
                dy = radius * Math.cos(theta);
                dz = radius * Math.sin(theta);
              }

              const pt = project(x + dx, y + dy, z + dz);
              if (i === 0) {
                ctx.moveTo(pt.sx, pt.sy);
              } else {
                ctx.lineTo(pt.sx, pt.sy);
              }
            }
            ctx.stroke();

            // Glow overlay
            ctx.shadowBlur = 12;
            ctx.shadowColor = color;
            ctx.strokeStyle = lightenColor(color, 0.3);
            ctx.lineWidth = Math.max(1, (thickness * zoom * pCenter.scale) / 2);
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
          },
        });
      } else if (shape.type === "box") {
        const { x = 0, y = 0, z = 0, w = 20, h = 20, d = 20 } = shape;
        const halfW = w / 2;
        const halfH = h / 2;
        const halfD = d / 2;

        // 8 vertices of cuboid
        const vertices = [
          [x - halfW, y - halfH, z - halfD],
          [x + halfW, y - halfH, z - halfD],
          [x + halfW, y + halfH, z - halfD],
          [x - halfW, y + halfH, z - halfD],
          [x - halfW, y - halfH, z + halfD],
          [x + halfW, y - halfH, z + halfD],
          [x + halfW, y + halfH, z + halfD],
          [x - halfW, y + halfH, z + halfD],
        ];

        const projectedVerts = vertices.map((v) => project(v[0], v[1], v[2]));
        const avgZ = projectedVerts.reduce((sum, pv) => sum + pv.sz, 0) / 8;

        // Define faces (each face refers to indices in projectedVerts)
        const faces = [
          { indices: [0, 1, 2, 3], normal: [0, 0, -1] }, // front
          { indices: [1, 5, 6, 2], normal: [1, 0, 0] },  // right
          { indices: [4, 0, 3, 7], normal: [-1, 0, 0] }, // left
          { indices: [5, 4, 7, 6], normal: [0, 0, 1] },  // back
          { indices: [3, 2, 6, 7], normal: [0, 1, 0] },  // top
          { indices: [4, 5, 1, 0], normal: [0, -1, 0] }, // bottom
        ];

        items.push({
          type: "box",
          depth: avgZ,
          label: shape.label,
          draw: () => {
            // Sort faces by depth
            const rotatedFaces = faces.map((face) => {
              const faceZ = face.indices.reduce((sum, idx) => sum + projectedVerts[idx].sz, 0) / 4;
              return { ...face, faceZ };
            });

            // Draw faces back to front
            rotatedFaces.sort((a, b) => b.faceZ - a.faceZ);

            rotatedFaces.forEach((face) => {
              ctx.beginPath();
              face.indices.forEach((idx, i) => {
                const pv = projectedVerts[idx];
                if (i === 0) ctx.moveTo(pv.sx, pv.sy);
                else ctx.lineTo(pv.sx, pv.sy);
              });
              ctx.closePath();

              // Semi-transparent glowing science layout
              ctx.fillStyle = `${color}1d`;
              ctx.fill();

              ctx.strokeStyle = color;
              ctx.lineWidth = 1.5;
              ctx.stroke();
            });
          },
        });
      } else if (shape.type === "line") {
        const { x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0 } = shape;
        const p1 = project(x1, y1, z1);
        const p2 = project(x2, y2, z2);
        const avgZ = (p1.sz + p2.sz) / 2;

        items.push({
          type: "line",
          depth: avgZ,
          draw: () => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          },
        });
      } else if (shape.type === "particle_cloud") {
        const { points = [], particleSize = 1.5 } = shape;

        points.forEach((pt) => {
          const p = project(pt[0], pt[1], pt[2]);

          items.push({
            type: "particle",
            depth: p.sz,
            draw: () => {
              const pSize = particleSize * zoom * p.scale;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(p.sx, p.sy, Math.max(0.5, pSize), 0, Math.PI * 2);
              ctx.fill();

              // Add a bit of glow
              if (pSize > 1) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(p.sx, p.sy, pSize * 0.4, 0, Math.PI * 2);
                ctx.fill();
              }
            },
          });
        });
      } else if (shape.type === "text") {
        const { x = 0, y = 0, z = 0, text: textContent = "", fontSize = 11, xLink, yLink, zLink } = shape;
        const pText = project(x, y, z);

        items.push({
          type: "text",
          depth: pText.sz - 50, // render text slightly in front
          label: textContent,
          draw: () => {
            // Draw pointer connection line if present
            if (xLink !== undefined && yLink !== undefined && zLink !== undefined) {
              const pLink = project(xLink, yLink, zLink);
              ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 3]);
              ctx.beginPath();
              ctx.moveTo(pText.sx, pText.sy);
              ctx.lineTo(pLink.sx, pLink.sy);
              ctx.stroke();
              ctx.setLineDash([]); // reset

              // Small ring at target point
              ctx.strokeStyle = color;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(pLink.sx, pLink.sy, 3, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Draw label box with glassmorphism styling
            const paddingX = 8;
            const paddingY = 4;
            ctx.font = `bold ${fontSize}px sans-serif`;
            const textWidth = ctx.measureText(textContent).width;
            const boxW = textWidth + paddingX * 2;
            const boxH = fontSize + paddingY * 2;

            const bx = pText.sx - boxW / 2;
            const by = pText.sy - boxH / 2;

            // Background
            const isSelected = (!quizMode && selectedShape && (selectedShape.label === textContent || selectedShape.text === textContent)) || (quizMode && quizTarget?.label === textContent);
            ctx.fillStyle = isSelected 
              ? (quizMode ? "rgba(245, 158, 11, 0.95)" : (theme === "light" ? "rgba(59, 130, 246, 0.95)" : "rgba(79, 70, 229, 0.95)"))
              : (theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(15, 23, 42, 0.9)");
            
            ctx.strokeStyle = isSelected 
              ? (theme === "light" ? "#ffffff" : "#ffffff") 
              : color;
            ctx.lineWidth = isSelected ? 2 : 1.5;
            
            // Round rect path
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(bx, by, boxW, boxH, 6) : ctx.rect(bx, by, boxW, boxH);
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.fillStyle = isSelected 
              ? "#ffffff" 
              : (theme === "light" ? "#1e293b" : "#f8fafc");
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(textContent, pText.sx, pText.sy + 1);
          },
        });
      }
    });

    // Sort items by depth descending (furthest first, painter's algorithm)
    items.sort((a, b) => b.depth - a.depth);

    // Render everything
    ctx.clearRect(0, 0, width, height);
    items.forEach((item) => {
      // Hide labels in quiz mode unless it's the target
      if (quizMode && item.type === "text" && item.label !== quizTarget?.label) {
         // Optionally draw it empty or skip
         // We'll skip to hide the text completely to prevent cheating
         return;
      }
      item.draw();
    });
  }, [shapes, angleX, angleY, zoom, hoveredLabel, selectedShape, quizMode, quizTarget]);

  // Handle pointer interactions on labels
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // If dragging, let drag handle the coordinates
    if (isDragging) {
      handleMouseMove(e);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const cameraDistance = 350;
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    let closestLabel: string | null = null;
    let minDistance = 25; // pixels threshold

    shapes.forEach((shape) => {
      if (!shape.label) return;
      const x = (shape.x || 0) * zoom;
      const y = (shape.y || 0) * zoom;
      const z = (shape.z || 0) * zoom;

      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = cameraDistance / (cameraDistance + z2);
      const sx = centerX + x1 * scale;
      const sy = centerY - y2 * scale;

      const dist = Math.hypot(mx - sx, my - sy);
      if (dist < minDistance) {
        minDistance = dist;
        closestLabel = shape.label;
      }
    });

    setHoveredLabel(closestLabel);
    setCursorStyle(closestLabel ? "pointer" : "grab");
  };

  const handleReset = () => {
    setAngleX(0.3);
    setAngleY(0.5);
    setZoom(1.2);
    setSelectedShape(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col relative"
      onMouseMove={handleCanvasMouseMove}
    >
      {/* Title / Info overlay */}
      <div className="hidden lg:block absolute top-24 left-6 z-30 max-w-xs pointer-events-none">
        <h4 className={`text-lg font-black drop-shadow-md mb-1 ${theme === "light" ? "text-slate-800" : "text-white"}`}>{name}</h4>
        {description && !selectedShape && (
          <p className={`text-xs drop-shadow-md leading-relaxed line-clamp-3 ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>
            {description}
          </p>
        )}
      </div>

      {/* Selected Shape / Click-to-Explain HUD popup */}
      {selectedShape && !quizMode && (
        <div className={`absolute bottom-20 lg:bottom-auto lg:top-24 left-4 right-4 lg:right-auto lg:left-6 z-40 max-w-sm lg:max-w-xs backdrop-blur-md border p-4 lg:p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300 ${theme === "light" ? "bg-white/95 border-blue-200" : "bg-slate-950/95 border-indigo-500/70"}`}>
          <button
            onClick={() => setSelectedShape(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-blue-500 transition-colors"
            title="Close Description"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex justify-between items-start mb-2 pr-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Part Explanation</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => speakText(`${selectedShape.label}. ${selectedShape.description || ""}`)} className="p-1.5 bg-blue-100 dark:bg-indigo-900/50 text-blue-600 dark:text-indigo-400 rounded-lg hover:bg-blue-200 transition-colors" title="Read Aloud">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleSaveFlashcard} className="p-1.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-200 transition-colors" title="Save to Flashcards">
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <h5 className={`text-base font-black mb-2 pr-4 ${theme === "light" ? "text-slate-800" : "text-white"}`}>{selectedShape.label}</h5>
          <p className={`text-xs leading-relaxed ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>
            {selectedShape.description || "Interactive structural detail of this model."}
          </p>
        </div>
      )}

      {/* Quiz HUD */}
      {quizMode && quizTarget && (
        <div className={`absolute bottom-20 lg:bottom-auto lg:top-24 left-4 right-4 lg:right-auto lg:left-6 z-40 max-w-sm lg:max-w-xs backdrop-blur-md border p-4 lg:p-5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300 ${theme === "light" ? "bg-white/95 border-amber-300" : "bg-slate-950/95 border-amber-500/70"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Quiz Mode</span>
          </div>
          <h5 className={`text-sm font-black mb-4 ${theme === "light" ? "text-slate-800" : "text-white"}`}>{quizMessage}</h5>
          <div className="flex flex-col gap-2">
            {quizOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleQuizAnswer(opt)}
                className={`py-2 px-3 text-xs font-bold rounded-xl text-left transition-all ${theme === "light" ? "bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-700" : "bg-slate-900 hover:bg-amber-900/50 text-slate-300 hover:text-amber-400"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating control buttons */}
      <div className={`absolute bottom-6 right-6 z-30 flex items-center gap-2 backdrop-blur-md px-3 py-2 rounded-2xl border shadow-lg ${theme === "light" ? "bg-white/90 border-slate-200" : "bg-slate-900/90 border-white/10"}`}>
        <button
          onClick={toggleQuizMode}
          className={`p-2 rounded-xl transition-all ${quizMode ? "bg-amber-500 text-white" : (theme === "light" ? "hover:bg-slate-100 text-amber-500" : "hover:bg-amber-500/20 text-amber-400")}`}
          title={quizMode ? "Exit Quiz" : "Test Me!"}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-xl transition-all ${isPlaying ? "bg-blue-500 text-white" : (theme === "light" ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10 text-slate-400")}`}
          title={isPlaying ? "Pause Spin" : "Auto Spin"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className={`p-2 rounded-xl active:scale-95 transition-all ${theme === "light" ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10 text-slate-400"}`}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className={`p-2 rounded-xl active:scale-95 transition-all ${theme === "light" ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10 text-slate-400"}`}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className={`p-2 rounded-xl active:scale-95 transition-all border-l pl-3 ${theme === "light" ? "hover:bg-slate-100 text-slate-500 border-slate-200" : "hover:bg-white/10 text-slate-400 border-white/10"}`}
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="w-full h-full select-none"
        style={{ cursor: cursorStyle }}
      />

      {/* Detail HUD Overlay on Hover */}
      {hoveredLabel && !selectedShape && !quizMode && (
        <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 font-bold border px-4 py-2 rounded-xl text-xs z-30 pointer-events-none animate-bounce shadow-xl flex items-center gap-2 ${theme === "light" ? "bg-white/95 text-blue-600 border-blue-200" : "bg-slate-950/90 text-indigo-300 border-indigo-500/50"}`}>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          Click to explain: <span className={`font-black ${theme === "light" ? "text-slate-800" : "text-white"}`}>{hoveredLabel}</span>
        </div>
      )}
    </div>
  );
}
