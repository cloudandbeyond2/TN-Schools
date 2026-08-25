// Client-safe mirror of the AI Content Studio registry.
//
// Only the *display* half lives here — group metadata and pack labels, which
// the router needs before the API responds. The 20 skills themselves (labels,
// inputs, enabled state, class range) are served by
// GET /api/ai-studio/skills so a superadmin change takes effect without a
// redeploy. Prompt text never reaches the browser.
//
// Backend source of truth: backend/src/constants/aiSkills.ts

export type SkillGroup =
  | "TEACH"
  | "PRACTICE"
  | "ASSESS"
  | "ENGAGE"
  | "DIFFERENTIATE"
  | "FEEDBACK";

export type OutputKind =
  | "document"
  | "questionSet"
  | "worksheet"
  | "matrix"
  | "cardList"
  | "slides";

export type SubjectPack =
  | "MATHS"
  | "SCIENCE"
  | "LANGUAGE"
  | "SOCIAL"
  | "COMPUTER"
  | "GENERAL";

export type PushTarget = "questionBank" | "lessonPlan" | "homework" | "smartClass";

export interface SkillInput {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  options?: string[];
  default?: string | number;
  placeholder?: string;
  hint?: string;
}

/** Shape returned by GET /api/ai-studio/skills. */
export interface StudioSkill {
  key: string;
  command: string;
  label: string;
  description: string;
  group: SkillGroup;
  outputKind: OutputKind;
  icon: string;
  accent: string;
  preview: string;
  inputs: SkillInput[];
  pushTargets: PushTarget[];
  isEnabled: boolean;
  classMin: number;
  classMax: number;
}

export interface StudioGroup {
  key: SkillGroup;
  slug: string;
  label: string;
  icon: string;
  blurb: string;
}

export interface StudioPack {
  key: SubjectPack;
  label: string;
  icon: string;
  method?: string;
}

// Mirrors SKILL_GROUPS in backend/src/constants/aiSkills.ts — the slugs are the
// /teacher/ai-studio/[group] route segments and the sidebar hrefs.
export const STUDIO_GROUPS: StudioGroup[] = [
  { key: "TEACH", slug: "teach", label: "Teach & Explain", icon: "fi fi-rr-chalkboard-user", blurb: "Plan the period and explain the concept" },
  { key: "PRACTICE", slug: "practice", label: "Practice & Work", icon: "fi fi-rr-pencil", blurb: "Worksheets, activities, homework and revision" },
  { key: "ASSESS", slug: "assess", label: "Tests & Assess", icon: "fi fi-rr-list-check", blurb: "Quizzes, MCQs, question papers and answer keys" },
  { key: "ENGAGE", slug: "engage", label: "Engage & Discuss", icon: "fi fi-rr-comments", blurb: "Get the class talking and involved" },
  { key: "DIFFERENTIATE", slug: "differentiate", label: "Differentiate", icon: "fi fi-rr-users-alt", blurb: "Adapt for mixed-ability classrooms and grade fairly" },
  { key: "FEEDBACK", slug: "feedback", label: "Feedback", icon: "fi fi-rr-comment-check", blurb: "Constructive, specific feedback on student work" },
];

export const GROUP_BY_SLUG: Record<string, StudioGroup> = STUDIO_GROUPS.reduce(
  (acc, g) => {
    acc[g.slug] = g;
    return acc;
  },
  {} as Record<string, StudioGroup>
);

export const PACK_DISPLAY: Record<SubjectPack, { label: string; icon: string }> = {
  MATHS: { label: "Mathematics", icon: "🧮" },
  SCIENCE: { label: "Science", icon: "🔬" },
  LANGUAGE: { label: "Language", icon: "📖" },
  SOCIAL: { label: "Social Science", icon: "🗺️" },
  COMPUTER: { label: "Computer Science", icon: "💻" },
  GENERAL: { label: "General", icon: "📚" },
};

export const PUSH_TARGET_LABEL: Record<PushTarget, string> = {
  questionBank: "Question Bank",
  lessonPlan: "Lesson Plans",
  homework: "Homework Manager",
  smartClass: "Smart Class",
};

export const OUTPUT_KIND_LABEL: Record<OutputKind, string> = {
  document: "Document",
  questionSet: "Question set",
  worksheet: "Worksheet",
  matrix: "Matrix",
  cardList: "Cards",
  slides: "Slide deck",
};

/**
 * Client-side twin of subjectToPack() in the backend registry — used to show
 * the auto-detected pack chip before the teacher has generated anything. The
 * backend re-derives it authoritatively at generation time.
 */
export function subjectToPack(subject?: string | null): SubjectPack {
  const s = (subject || "").toLowerCase().trim();
  if (!s) return "GENERAL";
  const has = (...needles: string[]) => needles.some((n) => s.includes(n));

  if (has("math", "maths", "kanitham", "கணித", "algebra", "geometry", "trigonom", "statistic", "calculus")) return "MATHS";
  if (has("computer", "informat", "programming", "python", "java", "c++", "coding", "ict", "கணினி", "software")) return "COMPUTER";
  if (has("science", "physic", "chemis", "biolog", "botan", "zoolog", "அறிவியல்", "இயற்பியல்", "வேதியியல்", "உயிரியல்", "environment")) return "SCIENCE";
  if (has("social", "history", "geograph", "civic", "econom", "political", "சமூக", "வரலா", "புவியிய", "குடிமை", "பொருளிய")) return "SOCIAL";
  if (has("tamil", "english", "language", "hindi", "sanskrit", "french", "literature", "grammar", "தமிழ்", "ஆங்கில", "மொழி")) return "LANGUAGE";
  return "GENERAL";
}

/** Grade number from "Class 10" / "10" / "Grade 9 B". 0 when not parseable. */
export function gradeFromClassName(className?: string | null): number {
  const m = String(className || "").match(/\d{1,2}/);
  const n = m ? parseInt(m[0], 10) : NaN;
  return Number.isFinite(n) ? n : 0;
}

/** Why a skill can't be run right now — null when it can. */
export function skillBlockedReason(skill: StudioSkill, className?: string | null): string | null {
  if (!skill.isEnabled) return "Turned off by your administrator";
  const grade = gradeFromClassName(className);
  if (grade && (grade < skill.classMin || grade > skill.classMax)) {
    return `Only for classes ${skill.classMin}–${skill.classMax}`;
  }
  return null;
}
