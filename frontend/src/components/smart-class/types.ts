/* Shared types for the Smart Class board mode. */

export interface TeachingStep {
  step: string;
  minutes: number;
  description: string;
}

export interface LangDetail {
  keyConcepts: string[];
  realLifeConnections: string[];
  commonMisconceptions: string[];
  teachingFlow: TeachingStep[];
  teacherScript: string;
  studentKeyPoints: string[];
}

/** Bilingual unit detail shape returned by /api/centralized-content/units/:id */
export interface UnitDetail {
  en: LangDetail;
  ta: LangDetail | null;
}

export type Lang = "en" | "ta";

/** MCQ normalized from CentralContent.mcqs ({ question, options, answer, rationale }) */
export interface BoardMcq {
  q: string;
  options: string[];
  /** Index into options; -1 when the answer string couldn't be matched */
  correctIndex: number;
  /** Raw answer string from the content, used as a reveal fallback */
  answer: string;
  rationale: string;
}

export interface BoardPdf {
  title: string;
  url: string;
}

export interface BoardUnitInfo {
  name: string;
  unitNumber: number;
  subjectName: string;
  className: string;
}
