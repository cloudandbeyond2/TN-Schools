// Turn a studio payload into a clean, printable HTML document.
//
// We build print HTML from the data rather than screenshotting the UI: the
// portal renders on a dark surface with CSS variables, and worksheets need to
// paginate across sheets, which html2canvas cannot do. The browser's own
// "Save as PDF" in the print dialog produces the PDF.

import type { OutputKind } from "@/lib/aiSkills";

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const nl2br = (v: unknown) => esc(v).replace(/\n/g, "<br/>");

const PRINT_CSS = `
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; color: #111827; font-size: 11.5pt; line-height: 1.55; margin: 0; }
  h1 { font-size: 17pt; margin: 0 0 2mm; }
  h2 { font-size: 12.5pt; margin: 7mm 0 2mm; padding-bottom: 1.5mm; border-bottom: 1px solid #d1d5db; page-break-after: avoid; }
  h3 { font-size: 11.5pt; margin: 4mm 0 1.5mm; page-break-after: avoid; }
  .meta { color: #6b7280; font-size: 9.5pt; margin-bottom: 5mm; padding-bottom: 3mm; border-bottom: 2px solid #111827; }
  .fields { margin: 4mm 0 6mm; font-size: 10pt; color: #374151; }
  .fields span { display: inline-block; margin-right: 12mm; }
  ul, ol { margin: 1.5mm 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.2mm; }
  .item { margin-bottom: 4mm; page-break-inside: avoid; }
  .num { font-weight: 700; margin-right: 2mm; }
  .lines { margin: 2mm 0 0 6mm; }
  .lines div { border-bottom: 1px dashed #9ca3af; height: 7mm; }
  .hint { font-size: 9pt; color: #6b7280; font-style: italic; margin-left: 6mm; }
  .box { border: 1px solid #d1d5db; border-radius: 3mm; padding: 3mm 4mm; margin-bottom: 4mm; page-break-inside: avoid; }
  .passage { background: #f9fafb; font-family: Georgia, serif; }
  .answer { color: #065f46; font-weight: 600; }
  .opt { margin: 0.8mm 0 0 6mm; }
  table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 9.5pt; }
  th, td { border: 1px solid #d1d5db; padding: 2.5mm; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.02em; }
  .pagebreak { page-break-before: always; }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
  .tag { display: inline-block; font-size: 8.5pt; color: #6b7280; border: 1px solid #d1d5db; border-radius: 10mm; padding: 0.5mm 2.5mm; margin-top: 1.5mm; }
  .footer { margin-top: 8mm; padding-top: 3mm; border-top: 1px solid #e5e7eb; font-size: 8.5pt; color: #9ca3af; }
  @media print { .noprint { display: none !important; } }
`;

export interface PrintMeta {
  skillLabel: string;
  subject: string;
  className: string;
  section?: string | null;
  topic: string;
  teacherName?: string;
  schoolName?: string;
}

function header(payload: any, meta: PrintMeta) {
  const line = [meta.className, meta.section && `Sec ${meta.section}`, meta.subject]
    .filter(Boolean)
    .join(" · ");
  return `
    <h1>${esc(payload?.title || meta.topic)}</h1>
    <div class="meta">${esc(line)}${meta.topic ? ` &nbsp;|&nbsp; ${esc(meta.topic)}` : ""} &nbsp;|&nbsp; ${esc(meta.skillLabel)}</div>
    <div class="fields">
      <span>Name: ______________________________</span>
      <span>Roll No: ____________</span>
      <span>Date: ____________</span>
    </div>`;
}

function documentBody(p: any): string {
  const sections: any[] = Array.isArray(p?.sections) ? p.sections : [];
  const terms: any[] = Array.isArray(p?.keyTerms) ? p.keyTerms : [];
  const notes: string[] = Array.isArray(p?.teacherNotes) ? p.teacherNotes : [];
  return `
    ${p?.summary ? `<div class="box">${nl2br(p.summary)}</div>` : ""}
    ${sections
      .map(
        (s) => `
      <h2>${esc(s?.heading)}${Number(s?.durationMins) > 0 ? ` <span style="font-weight:400;color:#6b7280">(${s.durationMins} min)</span>` : ""}</h2>
      ${s?.body ? `<p>${nl2br(s.body)}</p>` : ""}
      ${Array.isArray(s?.bullets) && s.bullets.length ? `<ul>${s.bullets.map((b: string) => `<li>${nl2br(b)}</li>`).join("")}</ul>` : ""}`
      )
      .join("")}
    ${
      terms.length
        ? `<h2>Key Terms</h2><table><tr><th>Term</th><th>Meaning</th><th>Tamil</th></tr>${terms
            .map((t) => `<tr><td><b>${esc(t?.term)}</b></td><td>${esc(t?.meaning)}</td><td>${esc(t?.tamil)}</td></tr>`)
            .join("")}</table>`
        : ""
    }
    ${notes.length ? `<h2>Teacher Notes</h2><ul>${notes.map((n) => `<li>${nl2br(n)}</li>`).join("")}</ul>` : ""}`;
}

function questionSetBody(p: any): string {
  const qs: any[] = Array.isArray(p?.questions) ? p.questions : [];
  const paper = qs
    .map(
      (q, i) => `
    <div class="item">
      <span class="num">${q?.number ?? i + 1}.</span>${nl2br(q?.text)}
      ${q?.marks ? `<span style="float:right;color:#6b7280">[${q.marks}]</span>` : ""}
      ${(Array.isArray(q?.options) ? q.options : []).map((o: string) => `<div class="opt">${esc(o)}</div>`).join("")}
    </div>`
    )
    .join("");
  const key = qs
    .map(
      (q, i) => `
    <div class="item">
      <span class="num">${q?.number ?? i + 1}.</span>
      <span class="answer">${nl2br(q?.answer)}</span>
      ${q?.explanation ? `<div class="hint" style="font-style:normal">${nl2br(q.explanation)}</div>` : ""}
    </div>`
    )
    .join("");
  return `
    ${p?.instructions ? `<div class="box">${nl2br(p.instructions)}</div>` : ""}
    ${p?.totalMarks ? `<div style="text-align:right;font-weight:700">Total: ${esc(p.totalMarks)} marks${p?.durationMins ? ` &nbsp;·&nbsp; ${esc(p.durationMins)} min` : ""}</div>` : ""}
    ${paper}
    <div class="pagebreak"></div>
    <h2>Answer Key</h2>
    ${key}`;
}

function worksheetBody(p: any): string {
  const sections: any[] = Array.isArray(p?.sections) ? p.sections : [];
  const keyRows: any[] = Array.isArray(p?.answerKey) ? p.answerKey : [];
  const errors: string[] = Array.isArray(p?.commonErrors) ? p.commonErrors : [];
  return `
    ${p?.instructions ? `<div class="box">${nl2br(p.instructions)}</div>` : ""}
    ${p?.passage && String(p.passage).trim() ? `<div class="box passage">${nl2br(p.passage)}</div>` : ""}
    ${sections
      .map(
        (s) => `
      <h2>${esc(s?.heading)}</h2>
      ${s?.intro ? `<p style="color:#4b5563">${nl2br(s.intro)}</p>` : ""}
      ${(Array.isArray(s?.items) ? s.items : [])
        .map(
          (it: any, j: number) => `
        <div class="item">
          <span class="num">${it?.number ?? j + 1}.</span>${nl2br(it?.prompt)}
          ${Number(it?.workingLines) > 0 ? `<div class="lines">${Array.from({ length: Math.min(Number(it.workingLines), 12) }).map(() => "<div></div>").join("")}</div>` : ""}
          ${it?.hint ? `<div class="hint">Hint: ${esc(it.hint)}</div>` : ""}
        </div>`
        )
        .join("")}`
      )
      .join("")}
    <div class="pagebreak"></div>
    <h2>Answer Key</h2>
    ${keyRows
      .map(
        (a, i) => `
      <div class="item">
        <span class="num">${a?.number ?? i + 1}.</span>
        <span class="answer">${nl2br(a?.answer)}</span>
        ${Array.isArray(a?.workedSteps) && a.workedSteps.length ? `<ol>${a.workedSteps.map((s: string) => `<li>${nl2br(s)}</li>`).join("")}</ol>` : ""}
      </div>`
      )
      .join("")}
    ${errors.length ? `<h2>Common Mistakes</h2><ul>${errors.map((e) => `<li>${nl2br(e)}</li>`).join("")}</ul>` : ""}`;
}

function matrixBody(p: any): string {
  const cols: string[] = Array.isArray(p?.columns) ? p.columns : [];
  const rows: any[] = Array.isArray(p?.rows) ? p.rows : [];
  const legend: string[] = Array.isArray(p?.legend) ? p.legend : [];
  return `
    ${p?.description ? `<div class="box">${nl2br(p.description)}</div>` : ""}
    <table>
      <tr><th>Criterion</th>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>
      ${rows
        .map(
          (r) => `<tr>
            <td><b>${esc(r?.label)}</b>${r?.weight ? `<br/><span style="color:#6b7280">${esc(r.weight)}</span>` : ""}</td>
            ${cols.map((_, j) => `<td>${nl2br(Array.isArray(r?.cells) ? r.cells[j] : "")}</td>`).join("")}
          </tr>`
        )
        .join("")}
    </table>
    ${legend.length ? `<h2>How to use this</h2><ul>${legend.map((l) => `<li>${nl2br(l)}</li>`).join("")}</ul>` : ""}`;
}

function cardListBody(p: any): string {
  const cards: any[] = Array.isArray(p?.cards) ? p.cards : [];
  return `
    ${p?.intro ? `<div class="box">${nl2br(p.intro)}</div>` : ""}
    <div class="cards">
      ${cards
        .map(
          (c) => `<div class="box">
            <h3>${esc(c?.icon || "")} ${esc(c?.title)}</h3>
            <div>${nl2br(c?.body)}</div>
            ${c?.tag ? `<div class="tag">${esc(c.tag)}</div>` : ""}
          </div>`
        )
        .join("")}
    </div>`;
}

function slidesBody(p: any): string {
  const slides: any[] = Array.isArray(p?.slides) ? p.slides : [];
  return slides
    .map(
      (s, i) => `
    <div class="box" style="page-break-inside:avoid">
      <h3>${s?.number ?? i + 1}. ${esc(s?.title)}</h3>
      ${Array.isArray(s?.bullets) && s.bullets.length ? `<ul>${s.bullets.map((b: string) => `<li>${nl2br(b)}</li>`).join("")}</ul>` : ""}
      ${s?.visualHint ? `<div class="hint">Show / draw: ${esc(s.visualHint)}</div>` : ""}
      ${s?.speakerNotes ? `<div class="hint">Say: ${esc(s.speakerNotes)}</div>` : ""}
    </div>`
    )
    .join("");
}

const BODIES: Record<OutputKind, (p: any) => string> = {
  document: documentBody,
  questionSet: questionSetBody,
  worksheet: worksheetBody,
  matrix: matrixBody,
  cardList: cardListBody,
  slides: slidesBody,
};

export function buildPrintHtml(outputKind: OutputKind, payload: any, meta: PrintMeta): string {
  const body = (BODIES[outputKind] || documentBody)(payload);
  const footerBits = [meta.schoolName, meta.teacherName].filter(Boolean).join(" · ");
  return `<!doctype html><html><head><meta charset="utf-8"/>
    <title>${esc(payload?.title || meta.topic)}</title>
    <style>${PRINT_CSS}</style></head>
    <body>${header(payload, meta)}${body}
    <div class="footer">${esc(footerBits)}${footerBits ? " · " : ""}Generated with AI Content Studio — review before use.</div>
    </body></html>`;
}

/** Open the print dialog on a generated document. Returns false if popups are blocked. */
export function printOutput(outputKind: OutputKind, payload: any, meta: PrintMeta): boolean {
  const html = buildPrintHtml(outputKind, payload, meta);
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  // Let the new document lay out before the dialog steals the thread.
  setTimeout(() => win.print(), 400);
  return true;
}
