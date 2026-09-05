import { createWorker } from "tesseract.js";

export interface ParsedSyllabusUnit {
  unitNo: string;
  title: string;
  subtopics: string[];
}

/**
 * Clean OCR noise characters like `|_|`, `|`, `_`, duplicate spaces, `C.1 C.1`, `ONTENTS`
 */
function cleanOcrText(text: string): string {
  return text
    .replace(/[|_~`®©]/g, " ")
    .replace(/\b(ONTENTS|CONTENTS|INDEX|SYLLABUS|PAGE NO|S\.NO|SL\.NO)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses raw text extracted via OCR from textbook index images into individual separate Chapter rows.
 */
export function parseSyllabusTextToChapters(rawText: string, subjectName: string = ""): ParsedSyllabusUnit[] {
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => cleanOcrText(l))
    .filter((l) => l.length > 0);

  const results: ParsedSyllabusUnit[] = [];
  let currentChapter: ParsedSyllabusUnit | null = null;
  let chCounter = 1;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Skip empty or trivial header lines
    if (!line || /^(UNIT|CONTENTS|PAGE|NO\.|INDEX|CHAPTERS|SL\.NO)$/i.test(line)) {
      continue;
    }

    // Ignore pure UNIT header lines (e.g. "UNIT I", "UNIT II", "UNIT III") so chapters become individual separate rows!
    if (/^UNIT\s+(I{1,3}|IV|V|VI{0,3}|IX|X|XI{0,2}|\d+)$/i.test(line)) {
      continue;
    }

    // Format A: Decimal Sub-chapter e.g. "1.1 Introduction", "4.2 Inverse..."
    const decimalMatch = line.match(/^(\d+)\.(\d+)\s+(.*)/);

    // Format B: "Chapter 1 Reproduction...", "1 Applications of Matrices...", "2 Lines and Angles"
    // Also handles OCR typos where numbers are misread: "Chapters Prime Time", "Chapter? Fractions"
    const mainChapterMatch = line.match(/^((?:Chapter|Ch|Unit|Cahpter)s?[^\w\s]*\s*)(\d*)(.*)/i)
      || line.match(/^()(\d+)[\.-\s]+(.*)/i);

    if (decimalMatch) {
      const parentNo = decimalMatch[1];
      const subIdx = decimalMatch[2];
      const subTitle = decimalMatch[3]?.replace(/\s+\d+$/, "").trim();

      // Find or create parent chapter
      currentChapter = results.find(r => r.unitNo === parentNo) || null;
      if (!currentChapter) {
        currentChapter = {
          unitNo: parentNo,
          title: `Chapter ${parentNo}`,
          subtopics: []
        };
        results.push(currentChapter);
      }

      const cleanSub = `${parentNo}.${subIdx} ${subTitle}`.replace(/\s+/g, " ").trim();
      if (cleanSub && !currentChapter.subtopics.includes(cleanSub)) {
        currentChapter.subtopics.push(cleanSub);
      }
    } else if (mainChapterMatch && (mainChapterMatch[1] || mainChapterMatch[2])) {
      // Force sequential numbering to fix OCR misreads (like '5' read as '2')
      let chNum = String(chCounter++);
      let chTitle = mainChapterMatch[3]?.replace(/\s+\d+$/, "").trim() || "";

      // Remove any lingering "Chapter X:" prefix from the title for a cleaner UI
      chTitle = chTitle.replace(/^(?:Chapter|Ch|Unit|Cahpter)s?\s*\d*[:\.-]?\s*/i, "").trim();

      const formattedTitle = chTitle || `Chapter ${chNum}`;

      currentChapter = {
        unitNo: chNum,
        title: formattedTitle,
        subtopics: []
      };
      results.push(currentChapter);
    } else if (line.length > 2 && !/^\d+$/.test(line)) {
      const cleanLine = line.replace(/\s+\d+$/, "").trim();

      if (currentChapter) {
        // If we have a chapter that is missing its title (e.g. title is just "Chapter X"),
        // we assume this text is the actual title for that chapter. This handles both
        // row-by-row and column-by-column OCR extractions where numbers and titles are separated.
        const emptyChapter = results.find(r => /^Chapter\s+\d+$/i.test(r.title));
        
        if (emptyChapter) {
          // Completely replace the placeholder with the actual title
          emptyChapter.title = cleanLine;
        } else {
          // If no chapters are missing titles, treat this extra line as a subtopic.
          const subNo = `${currentChapter.unitNo}.${currentChapter.subtopics.length + 1}`;
          currentChapter.subtopics.push(`${subNo} ${cleanLine}`);
        }
      } else {
        const cNo = String(chCounter++);
        currentChapter = {
          unitNo: cNo,
          title: cleanLine,
          subtopics: []
        };
        results.push(currentChapter);
      }
    }
  }

  // Fallback: Group every line as a separate Chapter row!
  if (results.length === 0 && rawLines.length > 0) {
    const validLines = rawLines.filter(l => l.length > 2 && !/^\d+$/.test(l));
    validLines.forEach((lineText, idx) => {
      const cNo = String(idx + 1);
      const cleanTitle = lineText.replace(/^(?:Chapter|Ch|Unit|Cahpter)s?\s*\d*[:\.-]?\s*/i, "").trim();
      results.push({
        unitNo: cNo,
        title: cleanTitle || `Chapter ${cNo}`,
        subtopics: []
      });
    });
  }

  return results;
}

/**
 * Runs Tesseract OCR on an uploaded Image File or Blob, returns extracted text and parsed units.
 */
export async function performOcrAndParseSyllabus(
  file: File | Blob,
  subjectName: string = ""
): Promise<{ text: string; parsedUnits: ParsedSyllabusUnit[] }> {
  const worker = await createWorker("eng");
  const ret = await worker.recognize(file);
  await worker.terminate();

  const text = ret.data.text || "";
  const parsedUnits = parseSyllabusTextToChapters(text, subjectName);
  return { text, parsedUnits };
}
