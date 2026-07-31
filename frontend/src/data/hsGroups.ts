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

// Common language subjects
const COMMON_SUBJECTS: HsSubject[] = [
  { name: "Tamil", color: "#f59e0b", icon: "🪔" },
  { name: "English", color: "#3b82f6", icon: "📖" },
];

export const CLASS_GROUP_SUBJECT_MAP: Record<string, HsSubject[]> = {
  // Classes 6 to 9 (General)
  General: [
    ...COMMON_SUBJECTS,
    { name: "Mathematics", color: "#8b5cf6", icon: "📐" },
    { name: "Science", color: "#10b981", icon: "🧪" },
    { name: "Social Science", color: "#0ea5e9", icon: "🌍" },
  ],
  // Class 10 (SSLC)
  SSLC: [
    ...COMMON_SUBJECTS,
    { name: "Mathematics", color: "#8b5cf6", icon: "📐" },
    { name: "Science", color: "#10b981", icon: "🧪" },
    { name: "Social Science", color: "#0ea5e9", icon: "🌍" },
  ],
  // Class 11 & 12 Group 1 (Bio-Math / Science)
  "Group 1": [
    ...COMMON_SUBJECTS,
    { name: "Physics", color: "#0ea5e9", icon: "⚛️" },
    { name: "Chemistry", color: "#10b981", icon: "🧪" },
    { name: "Biology", color: "#ec4899", icon: "🧬" },
    { name: "Mathematics", color: "#8b5cf6", icon: "📐" },
  ],
  // Class 11 & 12 Group 2 (CS-Math / Computer Science)
  "Group 2": [
    ...COMMON_SUBJECTS,
    { name: "Physics", color: "#0ea5e9", icon: "⚛️" },
    { name: "Chemistry", color: "#10b981", icon: "🧪" },
    { name: "Mathematics", color: "#8b5cf6", icon: "📐" },
    { name: "Computer Science", color: "#06b6d4", icon: "💻" },
  ],
  // Class 11 & 12 Group 3 (Commerce + Computer Applications)
  "Group 3": [
    ...COMMON_SUBJECTS,
    { name: "Commerce", color: "#f59e0b", icon: "💼" },
    { name: "Accountancy", color: "#10b981", icon: "🧾" },
    { name: "Economics", color: "#0ea5e9", icon: "📊" },
    { name: "Computer Applications", color: "#06b6d4", icon: "🖥️" },
  ],
  // Class 11 & 12 Group 4 (Commerce + Business Mathematics)
  "Group 4": [
    ...COMMON_SUBJECTS,
    { name: "Commerce", color: "#f59e0b", icon: "💼" },
    { name: "Accountancy", color: "#10b981", icon: "🧾" },
    { name: "Economics", color: "#0ea5e9", icon: "📊" },
    { name: "Business Mathematics", color: "#8b5cf6", icon: "🧮" },
  ],
  // Class 11 & 12 Group 5 (Arts / Humanities)
  "Group 5": [
    ...COMMON_SUBJECTS,
    { name: "History", color: "#f59e0b", icon: "🏛️" },
    { name: "Geography", color: "#0ea5e9", icon: "🌍" },
    { name: "Economics", color: "#10b981", icon: "📊" },
    { name: "Political Science", color: "#8b5cf6", icon: "⚖️" },
  ],
  // Class 11 & 12 Group 6 (Vocational)
  "Group 6": [
    ...COMMON_SUBJECTS,
    { name: "Basic Electrical", color: "#f97316", icon: "⚡" },
    { name: "Agriculture Science", color: "#10b981", icon: "🌱" },
    { name: "Office Management", color: "#0ea5e9", icon: "🗂️" },
  ],
};

export function getGroupSubjectsForClass(classNum: number, groupOrStream?: string): HsSubject[] {
  if (!classNum || classNum <= 0 || classNum <= 9) {
    return CLASS_GROUP_SUBJECT_MAP["General"];
  }
  if (classNum === 10) {
    return CLASS_GROUP_SUBJECT_MAP["SSLC"];
  }

  const grp = (groupOrStream || "").toLowerCase();

  if (grp.includes("group 1") || (grp.includes("science") && grp.includes("bio"))) {
    return CLASS_GROUP_SUBJECT_MAP["Group 1"];
  }
  if (grp.includes("group 2") || grp.includes("computerscience") || grp.includes("computer science") || grp.includes("cs")) {
    return CLASS_GROUP_SUBJECT_MAP["Group 2"];
  }
  if (grp.includes("group 3") || grp.includes("application")) {
    return CLASS_GROUP_SUBJECT_MAP["Group 3"];
  }
  if (grp.includes("group 4") || grp.includes("commerce") || grp.includes("business") || grp.includes("accountancy")) {
    return CLASS_GROUP_SUBJECT_MAP["Group 4"];
  }
  if (grp.includes("group 5") || grp.includes("arts") || grp.includes("humanities") || grp.includes("history")) {
    return CLASS_GROUP_SUBJECT_MAP["Group 5"];
  }
  if (grp.includes("group 6") || grp.includes("vocational")) {
    return CLASS_GROUP_SUBJECT_MAP["Group 6"];
  }

  // Default fallback for Class 11/12
  return CLASS_GROUP_SUBJECT_MAP["Group 1"];
}

// Core subjects per group (TN State Board Classes 11 & 12).
export const HS_GROUP_SUBJECTS: Record<Stream, HsSubject[]> = {
  Science: CLASS_GROUP_SUBJECT_MAP["Group 1"],
  ComputerScience: CLASS_GROUP_SUBJECT_MAP["Group 2"],
  Commerce: CLASS_GROUP_SUBJECT_MAP["Group 4"],
  Arts: CLASS_GROUP_SUBJECT_MAP["Group 5"],
  Vocational: CLASS_GROUP_SUBJECT_MAP["Group 6"],
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
