"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type BoardTool = "cursor" | "pen" | "highlighter" | "eraser";

export interface BoardCanvasHandle {
  clear: () => void;
  undo: () => void;
}

interface Stroke {
  tool: BoardTool;
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

interface BoardCanvasProps {
  tool: BoardTool;
  color: string;
}

const TOOL_SIZE: Record<BoardTool, number> = {
  cursor: 0,
  pen: 4,
  highlighter: 18,
  eraser: 40,
};

/**
 * Annotation overlay for the Smart Class board. Strokes live only in memory —
 * nothing is persisted. In "cursor" mode pointer events pass through so the
 * teacher can scroll content and click quiz options underneath.
 */
const BoardCanvas = forwardRef<BoardCanvasHandle, BoardCanvasProps>(
  function BoardCanvas({ tool, color }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<Stroke[]>([]);
    const activeRef = useRef<Stroke | null>(null);

    const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
      if (stroke.points.length === 0) return;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = stroke.size;
      if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = stroke.tool === "highlighter" ? 0.35 : 1;
        ctx.strokeStyle = stroke.color;
      }
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      // A single tap still leaves a dot
      if (stroke.points.length === 1) {
        ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
      }
      ctx.stroke();
      ctx.restore();
    };

    const redraw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const stroke of strokesRef.current) drawStroke(ctx, stroke);
      if (activeRef.current) drawStroke(ctx, activeRef.current);
    };

    // Keep the bitmap in sync with the element size and devicePixelRatio;
    // strokes are replayed so resizing is lossless.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        redraw();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      return () => observer.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      clear: () => {
        strokesRef.current = [];
        activeRef.current = null;
        redraw();
      },
      undo: () => {
        strokesRef.current.pop();
        redraw();
      },
    }));

    const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (tool === "cursor") return;
      e.preventDefault();
      canvasRef.current?.setPointerCapture(e.pointerId);
      activeRef.current = {
        tool,
        color,
        size: TOOL_SIZE[tool],
        points: [getPos(e)],
      };
      redraw();
    };

    const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!activeRef.current) return;
      activeRef.current.points.push(getPos(e));
      redraw();
    };

    const handleUp = () => {
      if (!activeRef.current) return;
      strokesRef.current.push(activeRef.current);
      activeRef.current = null;
      redraw();
    };

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          pointerEvents: tool === "cursor" ? "none" : "auto",
          touchAction: "none",
          cursor: tool === "eraser" ? "cell" : "crosshair",
          zIndex: 20,
        }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      />
    );
  }
);

export default BoardCanvas;
