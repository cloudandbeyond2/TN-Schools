// ============================================================================
// Science Book Library — TN Government (Samacheer Kalvi) textbook catalogue.
// We link to the official free source (tntextbooks.in) rather than re-hosting.
// Teachers/Admins can attach a hosted PDF url per book later (pdfUrl field).
// ============================================================================

export type Medium = "Tamil" | "English";

export type ScienceBook = {
  id: string;
  class: number;         // 6-12
  subject: string;
  medium: Medium;
  volume?: string;       // "Vol 1" / "Term I" etc. (optional)
  year: string;
  sourceUrl: string;     // official listing page
  pdfUrl?: string;       // optional hosted PDF (teacher-provided)
  chapters?: string[];   // known chapter titles (optional)
};

export const TN_BOOKS_SOURCE = "https://www.tntextbooks.in/p/school-books.html";

// Uploaded / known books with richer detail
const known: ScienceBook[] = [
  {
    id: "c8-sci-ta",
    class: 8, subject: "Science", medium: "Tamil", year: "2024",
    sourceUrl: TN_BOOKS_SOURCE,
    chapters: [
      "நுண்ணுயிரிகள் (Microorganisms)",
      "உயிரினங்களின் ஒருங்கமைவு (Cells & Tissues)",
      "விலங்குகளின் இயக்கம் (Movement of Animals)",
      "வளரிளம் பருவமடைதல் (Reaching Adolescence)",
      "தாவரங்கள் மற்றும் விலங்குகளைப் பாதுகாத்தல் (Conservation)",
    ],
  },
  {
    id: "c10-sci-en",
    class: 10, subject: "Science", medium: "English", year: "2024",
    sourceUrl: TN_BOOKS_SOURCE,
    chapters: [
      "Structural Organisation of Animals",
      "Transportation in Plants & Circulation in Animals",
      "Nervous System",
      "Plant and Animal Hormones",
      "Reproduction in Plants and Animals",
      "Genetics",
      "Origin and Evolution of Life",
      "Breeding and Biotechnology",
      "Health and Diseases",
    ],
  },
  {
    id: "c11-zoo-ta",
    class: 11, subject: "Bio-Zoology", medium: "Tamil", year: "2024",
    sourceUrl: TN_BOOKS_SOURCE,
    chapters: [
      "உயிரி உலகம் (The Living World)",
      "விலங்குகளின் வகைப்பாடு (Kingdom Animalia)",
      "செரிமானமும் உட்கவர்தலும் (Digestion & Absorption)",
      "சுவாசித்தல் (Respiration)",
      "உடல் திரவங்களும் சுற்றோட்டமும் (Body Fluids & Circulation)",
      "நரம்பு ஒருங்கிணைப்பு (Neural Control)",
      "பொருளாதார விலங்கியல் (Economic Zoology)",
    ],
  },
];

// Auto-generate the rest of the science catalogue (Class 6-12, both media)
function gen(): ScienceBook[] {
  const rows: ScienceBook[] = [];
  const media: Medium[] = ["Tamil", "English"];
  // Classes 6-10: single "Science" subject
  for (let cls = 6; cls <= 10; cls++) {
    for (const m of media) {
      const id = `c${cls}-sci-${m === "Tamil" ? "ta" : "en"}`;
      if (known.some((k) => k.id === id)) continue;
      rows.push({ id, class: cls, subject: "Science", medium: m, year: "2024", sourceUrl: TN_BOOKS_SOURCE });
    }
  }
  // Classes 11-12: split science subjects
  const higher = ["Physics", "Chemistry", "Bio-Botany", "Bio-Zoology"];
  for (let cls = 11; cls <= 12; cls++) {
    for (const subj of higher) {
      for (const m of media) {
        const id = `c${cls}-${subj.toLowerCase().replace(/[^a-z]/g, "")}-${m === "Tamil" ? "ta" : "en"}`;
        if (known.some((k) => k.id === id)) continue;
        rows.push({ id, class: cls, subject: subj, medium: m, year: "2024", sourceUrl: TN_BOOKS_SOURCE });
      }
    }
  }
  return rows;
}

export const SCIENCE_BOOKS: ScienceBook[] = [...known, ...gen()].sort(
  (a, b) => a.class - b.class || a.subject.localeCompare(b.subject) || a.medium.localeCompare(b.medium)
);

export const ALL_CLASSES = [6, 7, 8, 9, 10, 11, 12];
export const ALL_SUBJECTS = Array.from(new Set(SCIENCE_BOOKS.map((b) => b.subject))).sort();
