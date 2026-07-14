// ============================================================================
// Higher Secondary (Classes 11 & 12) group / stream definitions.
//
// TN State Board higher-secondary students belong to one group (stream).
// The chosen group lives in localStorage("studentGroup") — written by the
// Science Campus & Higher Secondary dashboard pages and kept in sync with the
// student's DB stream. Pages that must be stream-specific (Academics hub,
// Virtual Labs, sidebar) read it via useStudentGroup().
// ============================================================================

import type { Stream } from "./scienceCenters";

export type HsSubject = { name: string; color: string; icon: string };

// Language papers common to every higher-secondary group.
const COMMON_SUBJECTS: HsSubject[] = [
  { name: "Tamil", color: "#f59e0b", icon: "🪔" },
  { name: "English", color: "#3b82f6", icon: "📖" },
];

// Core subjects per group (TN State Board Classes 11 & 12).
export const HS_GROUP_SUBJECTS: Record<Stream, HsSubject[]> = {
  Science: [
    ...COMMON_SUBJECTS,
    { name: "Physics", color: "#0ea5e9", icon: "⚛️" },
    { name: "Chemistry", color: "#10b981", icon: "🧪" },
    { name: "Biology", color: "#ec4899", icon: "🧬" },
    { name: "Mathematics", color: "#8b5cf6", icon: "📐" },
  ],
  ComputerScience: [
    ...COMMON_SUBJECTS,
    { name: "Computer Science", color: "#06b6d4", icon: "💻" },
    { name: "Mathematics", color: "#8b5cf6", icon: "📐" },
    { name: "Physics", color: "#0ea5e9", icon: "⚛️" },
    { name: "Chemistry", color: "#10b981", icon: "🧪" },
  ],
  Commerce: [
    ...COMMON_SUBJECTS,
    { name: "Accountancy", color: "#10b981", icon: "🧾" },
    { name: "Commerce", color: "#f59e0b", icon: "💼" },
    { name: "Economics", color: "#0ea5e9", icon: "📊" },
    { name: "Business Mathematics", color: "#8b5cf6", icon: "📐" },
  ],
  Arts: [
    ...COMMON_SUBJECTS,
    { name: "History", color: "#f59e0b", icon: "🏛️" },
    { name: "Geography", color: "#0ea5e9", icon: "🌍" },
    { name: "Political Science", color: "#8b5cf6", icon: "⚖️" },
    { name: "Economics", color: "#10b981", icon: "📊" },
  ],
  Vocational: [
    ...COMMON_SUBJECTS,
    { name: "Basic Electrical", color: "#f97316", icon: "⚡" },
    { name: "Agriculture Science", color: "#10b981", icon: "🌱" },
    { name: "Office Management", color: "#0ea5e9", icon: "🗂️" },
  ],
};

// Display label for each group (matches the sidebar's group chip).
export const HS_GROUP_LABELS: Record<Stream, string> = {
  Science: "Science Group",
  ComputerScience: "Computer Science Group",
  Commerce: "Commerce Group",
  Arts: "Arts & Humanities Group",
  Vocational: "Vocational Group",
};

// Virtual-lab categories each group may access (Classes 11 & 12).
export const HS_LAB_CATEGORIES: Record<Stream, string[]> = {
  Science: ["Physics", "Chemistry", "Biology", "Botany", "Zoology"],
  ComputerScience: ["Programming", "Coding Environment", "Simulations"],
  Commerce: ["Accounting", "Business Studies", "Economics"],
  Arts: ["Geography", "History", "Civics"],
  Vocational: ["Electrical", "Agriculture", "Office & Web"],
};

// Hero copy for the Virtual Labs page per group.
export const HS_LAB_TITLES: Record<Stream, { title: string; subtitle: string }> = {
  Science: {
    title: "Virtual Science Labs",
    subtitle: "Physics, Chemistry, Biology, Botany & Zoology — safe interactive 3D experiments.",
  },
  ComputerScience: {
    title: "Virtual Computer Labs",
    subtitle: "Programming labs, coding environments and computer science simulations.",
  },
  Commerce: {
    title: "Virtual Commerce Labs",
    subtitle: "Accounting simulations, business studies resources and economics learning tools.",
  },
  Arts: {
    title: "Virtual Humanities Labs",
    subtitle: "Geography, history and civics — interactive labs for the Arts group.",
  },
  Vocational: {
    title: "Vocational Skill Labs",
    subtitle: "Hands-on trade simulations based on your vocational subjects.",
  },
};
