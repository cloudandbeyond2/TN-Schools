"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, HelpCircle } from "lucide-react";
import type { BoardMcq } from "./types";

interface QuizBoardProps {
  questions: BoardMcq[];
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Strip an embedded "A) " / "B. " prefix — the letter badge already shows it. */
const stripPrefix = (option: string) => option.replace(/^\s*[A-F][).]\s*/, "");

/**
 * Big-screen one-question-at-a-time MCQ player for classroom projection.
 * Colors are inline styles on purpose: the board must look identical in both
 * app themes and globals.css overrides many Tailwind color classes.
 */
export default function QuizBoard({ questions }: QuizBoardProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const total = questions.length;
  const current = questions[Math.min(index, total - 1)];

  const goTo = (next: number) => {
    if (next < 0 || next >= total) return;
    setIndex(next);
    setRevealed(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setRevealed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  if (total === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-10 text-center">
        <HelpCircle className="w-16 h-16" style={{ color: "#94a3b8" }} />
        <p className="text-3xl font-black" style={{ color: "#0f172a" }}>
          No quiz questions for this unit yet
        </p>
        <p className="text-xl" style={{ color: "#64748b" }}>
          MCQs are added per topic in the centralized syllabus content.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 md:p-10 gap-6 overflow-y-auto">
      {/* Progress chip */}
      <div className="flex items-center justify-between">
        <span
          className="px-5 py-2 rounded-full text-xl font-black"
          style={{ background: "#fef3c7", color: "#b45309" }}
        >
          Question {index + 1} / {total}
        </span>
        <span className="text-lg font-bold" style={{ color: "#94a3b8" }}>
          ← → to navigate · Space to reveal
        </span>
      </div>

      {/* Question */}
      <h2
        className="text-3xl md:text-5xl font-black leading-tight"
        style={{ color: "#0f172a" }}
      >
        {current.q}
      </h2>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {current.options.map((opt, i) => {
          const isCorrect = revealed && i === current.correctIndex;
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl p-5 md:p-6 transition-all"
              style={{
                background: isCorrect ? "#059669" : "#f8fafc",
                border: `3px solid ${isCorrect ? "#047857" : "#e2e8f0"}`,
                boxShadow: isCorrect ? "0 8px 24px rgba(5,150,105,0.35)" : "none",
              }}
            >
              <span
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-black flex-shrink-0"
                style={{
                  background: isCorrect ? "rgba(255,255,255,0.25)" : "#f59e0b",
                  color: "#ffffff",
                }}
              >
                {LETTERS[i] || "?"}
              </span>
              <span
                className="text-xl md:text-3xl font-bold leading-snug"
                style={{ color: isCorrect ? "#ffffff" : "#1e293b" }}
              >
                {stripPrefix(opt)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reveal fallback when the answer string didn't match any option */}
      {revealed && current.correctIndex === -1 && current.answer && (
        <div
          className="rounded-2xl p-5 text-2xl font-black"
          style={{ background: "#ecfdf5", color: "#047857", border: "3px solid #059669" }}
        >
          Answer: {current.answer}
        </div>
      )}

      {/* Rationale */}
      {revealed && current.rationale && (
        <div
          className="rounded-2xl p-5 md:p-6"
          style={{ background: "#f0fdf4", border: "2px solid #bbf7d0" }}
        >
          <p className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: "#059669" }}>
            Why
          </p>
          <p className="text-xl md:text-2xl leading-relaxed" style={{ color: "#166534" }}>
            {current.rationale}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="mt-auto flex items-center justify-center gap-4 pt-4">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl text-xl font-black disabled:opacity-40"
          style={{ background: "#f1f5f9", color: "#334155" }}
        >
          <ChevronLeft className="w-6 h-6" /> Prev
        </button>
        <button
          onClick={() => setRevealed(true)}
          disabled={revealed}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl text-xl font-black disabled:opacity-40"
          style={{ background: "#059669", color: "#ffffff" }}
        >
          <Eye className="w-6 h-6" /> Reveal Answer
        </button>
        <button
          onClick={() => goTo(index + 1)}
          disabled={index === total - 1}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl text-xl font-black disabled:opacity-40"
          style={{ background: "#f1f5f9", color: "#334155" }}
        >
          Next <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
