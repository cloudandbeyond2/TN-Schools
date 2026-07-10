import { Router, Request, Response } from 'express';
import { AIChat, Portfolio, LearningPath, Wellness, LibraryCompanion } from '../models/mongo';
import https from 'https';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ===========================================================================
// POST /api/wellness-ai/chat
// ===========================================================================
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      currentMessage,
      language = "English",
    } = req.body;

    const historyText = messages
      .map(
        (m: any) =>
          `${m.role === "user" ? "Student" : "AI"}: ${m.content}`
      )
      .join("\n");

    const prompt = `
You are an AI Wellness Companion for Tamil Nadu Government School students.

Your Role:
- Listen carefully and respond kindly.
- Support students with stress, anxiety, sadness, motivation, sleep, study balance and emotions.
- Give simple, practical wellness advice.
- Never diagnose illnesses or prescribe medicines.
- Never judge or criticize the student.

Safety Rules:
- If a student mentions suicide, self-harm, or immediate danger, calmly advise them to contact a parent, teacher, trusted adult, or school counselor immediately.
- Stay supportive and reassuring.

Language Rules:
- Default language: ${language}
- If the student asks for Tamil, reply only in Tamil.
- If the student asks for English, reply only in English.
- Never mix languages unless requested.
IMPORTANT: Follow these rules exactly. If you break any rule, your answer is incorrect.

Response Rules:
- Reply in EXACTLY 5 sentences.
- Each sentence must be under 12 words.
- Maximum 50 words total.
- Never use bullet points.
- Never use numbering.
- Never use headings or markdown.
- Never write long paragraphs.
- Never explain each point.
- Never give more than one idea per sentence.
- Only answer the student's latest question.
- If the student greets you, greet back in one short sentence.
- Otherwise, do NOT start with greetings.
- End with one short encouraging sentence.

Conversation History:
${historyText}

Student:
${currentMessage}

Remember:
Return ONLY the final answer.
Exactly 5 short sentences.
No extra text.
`;

    const reply = await callGemini(prompt, false);

    res.json({
      success: true,
      text: reply,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});
// ---------------------------------------------------------------------------
// Robust multi-stage JSON repair (handles Gemini quirks)
// ---------------------------------------------------------------------------
function fixUnescapedControlChars(s: string): string {
  let result = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\') { result += ch; escaped = true; continue; }
    if (ch === '"') { result += ch; inString = !inString; continue; }
    if (inString) {
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
    }
    result += ch;
  }
  return result;
}

function attemptRepair(s: string): string {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (!inString) {
      if (ch === '{') stack.push('}');
      else if (ch === '[') stack.push(']');
      else if ((ch === '}' || ch === ']') && stack.length > 0) stack.pop();
    }
  }
  if (inString) s += '"';
  s += stack.reverse().join('');
  return s;
}

function robustParseJSON(text: string): any {
  let s = text.trim();
  // Stage 1: strip markdown fences
  if (s.startsWith('```json')) s = s.slice(7).trim();
  else if (s.startsWith('```')) s = s.slice(3).trim();
  if (s.endsWith('```')) s = s.slice(0, s.length - 3).trim();
  // Stage 2: extract outer {}
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) s = s.substring(firstBrace, lastBrace + 1);
  // Stage 3: remove trailing commas
  s = s.replace(/,\s*([\]}])/g, '$1');
  // Stage 4: fix unescaped control chars
  s = fixUnescapedControlChars(s);
  // Stage 5: try parse; if fails, repair truncated JSON
  try {
    return JSON.parse(s);
  } catch (e1) {
    const repaired = attemptRepair(s);
    try {
      return JSON.parse(repaired);
    } catch (e2) {
      throw new Error(`JSON parse failed. Error: ${String(e1)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Gemini API helper
// ---------------------------------------------------------------------------
export async function callGemini(prompt: string, jsonMode: boolean = false, schema?: any, maxTokens: number = 8192, timeoutMs: number = 90000): Promise<any> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    throw new Error('GEMINI_API_KEY is missing. Please add it to backend/.env');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const payload: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens },
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  if (jsonMode) {
    payload.generationConfig.responseMimeType = 'application/json';
    if (schema) {
      payload.generationConfig.responseSchema = schema;
    }
  }

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(payload);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');

        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          reject(new Error(`Gemini API error ${res.statusCode}: ${body.substring(0, 500)}`));
          return;
        }
        let parsed: any = null;
        let text: string | undefined;
        try {
          parsed = JSON.parse(body);
          text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            const finishReason = parsed?.candidates?.[0]?.finishReason;
            reject(new Error(`Empty content from Gemini. Finish reason: ${finishReason || 'UNKNOWN'}`));
            return;
          }
          resolve(jsonMode ? robustParseJSON(text) : text);
        } catch (e) {
          const finishReason = parsed?.candidates?.[0]?.finishReason;
          reject(new Error(`Failed to parse response. Finish: ${finishReason || 'UNKNOWN'}. Error: ${String(e)}. Snippet: ${text ? text.substring(0, 300) : body.substring(0, 300)}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`Gemini API timed out after ${Math.round(timeoutMs / 1000)} seconds`)));
    req.write(postData);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Extract most-relevant 15,000 char window from a large textbook PDF
// ---------------------------------------------------------------------------
function limitContext(context: string | undefined, topic: string): string {
  if (!context) return '';
  const cleaned = context.trim();
  if (cleaned.length <= 15000) return cleaned;
  const keywords = topic.toLowerCase().split(/\s+/).filter((k) => k.length > 2);
  if (keywords.length === 0) return cleaned.substring(0, 15000);
  let bestIndex = 0;
  let maxMatches = 0;
  for (let i = 0; i < cleaned.length - 15000; i += 1000) {
    const chunk = cleaned.substring(i, i + 15000).toLowerCase();
    let matches = 0;
    for (const kw of keywords) { if (chunk.includes(kw)) matches++; }
    if (matches > maxMatches) { maxMatches = matches; bestIndex = i; }
  }
  return cleaned.substring(bestIndex, bestIndex + 15000);
}

// ===========================================================================
// POST /api/ai/generate-lesson-plan
// Generates a compact, schema-validated CORE lesson plan that reliably fits in
// the token budget. Heavy media (15 slides, podcast, video) are generated lazily
// via separate endpoints when the teacher opens those studio tools.
// ===========================================================================
const LESSON_CORE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    objectives: { type: 'ARRAY', items: { type: 'STRING' }, description: '3 learning objectives' },
    timeline: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          time: { type: 'STRING' },
          activity: { type: 'STRING' },
          description: { type: 'STRING' },
        },
        required: ['time', 'activity', 'description'],
      },
      description: '4 phases: Hook, Core Instruction, Guided Practice, Exit Ticket',
    },
    studentKeyPoints: {
      type: 'OBJECT',
      properties: {
        en: { type: 'ARRAY', items: { type: 'STRING' } },
        ta: { type: 'ARRAY', items: { type: 'STRING' } },
      },
      required: ['en', 'ta'],
      description: '5-6 crisp takeaways a student must remember, in English and Tamil (same count/order)',
    },
    bilingual: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          english: { type: 'STRING' },
          tamil: { type: 'STRING' },
          pronunciation: { type: 'STRING' },
        },
        required: ['english', 'tamil', 'pronunciation'],
      },
      description: '5 key technical terms',
    },
    exitTickets: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          question: { type: 'STRING' },
          options: { type: 'ARRAY', items: { type: 'STRING' } },
          answer: { type: 'STRING' },
          rationale: { type: 'STRING' },
        },
        required: ['question', 'options', 'answer', 'rationale'],
      },
      description: '5 MCQs (options like "A) ...")',
    },
    infographic: {
      type: 'OBJECT',
      properties: {
        heroTitle: { type: 'STRING' },
        heroSubtitle: { type: 'STRING' },
        heroIcon: { type: 'STRING' },
        conceptColor: { type: 'STRING' },
        modules: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { id: { type: 'STRING' }, title: { type: 'STRING' }, desc: { type: 'STRING' }, icon: { type: 'STRING' } },
            required: ['id', 'title', 'desc', 'icon'],
          },
        },
        stats: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { label: { type: 'STRING' }, value: { type: 'STRING' }, desc: { type: 'STRING' } },
            required: ['label', 'value', 'desc'],
          },
        },
        workflow: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { step: { type: 'STRING' }, desc: { type: 'STRING' }, icon: { type: 'STRING' } },
            required: ['step', 'desc', 'icon'],
          },
        },
        formulaBox: { type: 'STRING' },
        formulaExplain: { type: 'STRING' },
        lawTitle: { type: 'STRING' },
        lawDesc: { type: 'STRING' },
        termTable: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { english: { type: 'STRING' }, tamil: { type: 'STRING' }, definition: { type: 'STRING' } },
            required: ['english', 'tamil', 'definition'],
          },
        },
        constantName: { type: 'STRING' },
        constantValue: { type: 'STRING' },
        constantExplain: { type: 'STRING' },
      },
      required: ['heroTitle', 'heroSubtitle', 'heroIcon', 'conceptColor', 'modules', 'stats', 'workflow', 'termTable'],
    },
  },
  required: ['objectives', 'timeline', 'studentKeyPoints', 'bilingual', 'exitTickets', 'infographic'],
};

router.post('/generate-lesson-plan', async (req: Request, res: Response) => {
  try {
    const { syllabus, grade, subject, topic, duration, textbookContext } = req.body;
    const truncatedContext = limitContext(textbookContext, topic);

    const prompt = `You are an expert curriculum developer for Tamil Nadu (TN) State Board schools.
Create the CORE of a syllabus-aligned lesson plan for:
- Syllabus: ${syllabus}
- Grade/Class: ${grade}
- Subject: ${subject}
- Topic/Chapter: ${topic}
- Duration: ${duration}
${truncatedContext ? `\nTextbook extract (use ONLY content about "${topic}", ignore other chapters):\n${truncatedContext}` : ''}
If "${topic}" is not in the context, use the standard TN Board curriculum.

Return JSON matching the provided schema. All content MUST be specifically about "${topic}" — no generic placeholders. Rules:
- objectives: exactly 3.
- timeline: exactly 4 phases — "The Hook", "Core Instruction", "Guided Practice", "Exit Ticket" — with realistic time ranges that sum to ${duration}.
- studentKeyPoints: 5-6 crisp, memorable takeaways for a student, given in BOTH English (en) and natural classroom Tamil (ta), same count and order. These are the "clear points" students see when the lesson is projected.
- bilingual: 5 key technical terms (english, tamil, pronunciation).
- exitTickets: exactly 5 MCQs; options formatted like "A) ...", answer is the full correct option text.
- infographic: real data about ${topic} — heroTitle (bilingual), heroSubtitle "Grade ${grade} ${subject}", heroIcon (best emoji), conceptColor (one of emerald/sky/indigo/amber/rose/teal/violet), 4 modules, 3 stats, 4 workflow steps, formulaBox + formulaExplain, lawTitle + lawDesc, 3 termTable entries, constantName/Value/Explain (use real constants; leave formula/law/constant blank only if genuinely not applicable to ${topic}).`;

    const core = await callGemini(prompt, true, LESSON_CORE_SCHEMA, 24000);
    res.json({
      success: true,
      data: {
        syllabus, grade, subject, topic, duration,
        planData: core,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/ai/generate-lesson-slides — lazy: only when the Slide Deck tool opens
const LESSON_SLIDES_SCHEMA = {
  type: 'OBJECT',
  properties: {
    slides: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          subtitle: { type: 'STRING' },
          bullets: { type: 'ARRAY', items: { type: 'STRING' } },
          teacherNotes: { type: 'STRING' },
          studentActivity: { type: 'STRING' },
          illustrationPrompt: { type: 'STRING' },
          animationSuggestion: { type: 'STRING' },
          graphicType: { type: 'STRING' },
          graphicData: {
            type: 'OBJECT',
            properties: {
              label: { type: 'STRING' },
              values: { type: 'ARRAY', items: { type: 'STRING' } },
              formula: { type: 'STRING' },
              variables: { type: 'ARRAY', items: { type: 'STRING' } },
            },
          },
        },
        required: ['title', 'subtitle', 'bullets', 'graphicType'],
      },
    },
  },
  required: ['slides'],
};

router.post('/generate-lesson-slides', async (req: Request, res: Response) => {
  try {
    const { grade, subject, topic, textbookContext } = req.body;
    const truncatedContext = limitContext(textbookContext, topic);

    const prompt = `Generate EXACTLY 15 professional concept slides for a Grade ${grade} ${subject} lesson on "${topic}" (TN State Board).
${truncatedContext ? `Textbook context (only "${topic}"):\n${truncatedContext}\n` : ''}
Return JSON matching the schema (a "slides" array of exactly 15 objects) in this sequence:
1 Premium Cover (graphicType "hero", graphicData.label=title)
2 Learning Outcomes (concept, values=3-4 objectives)
3 Introduction (concept, values=3-4 points)
4 Concept Visualization (concept, label=main concept, values=4)
5 Real World Example (application, values=4)
6 Working Principle (process, label=process, values=4 steps)
7 Scientific Formula (formula, graphicData.formula=real formula, variables=3-4)
8 Comparison (comparison, values=[LeftHeader,RightHeader,r1l,r1r,r2l,r2r])
9 Experiment (experiment, values=3 apparatus)
10 Daily Life Applications (application, values=4)
11 Important Facts (concept, values=4)
12 Practice Questions (quiz)
13 Activity (experiment, values=3 materials)
14 Summary (summary, values=4)
15 Thank You (hero, label=next topic teaser)
Each slide: large bold title, minimal body (max 30 words), numbered bullets, one-line teacherNotes, one-line studentActivity. Keep illustrationPrompt and animationSuggestion short (one line each). All content specifically about "${topic}".`;

    const result = await callGemini(prompt, true, LESSON_SLIDES_SCHEMA, 32000, 150000);
    res.json({ success: true, data: Array.isArray(result?.slides) ? result.slides : [] });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ===========================================================================
// POST /api/ai/generate-study-plan
// ===========================================================================
router.post('/generate-study-plan', async (req: Request, res: Response) => {
  try {
    const { subject, topic, grade, textbookContext } = req.body;
    const truncatedContext = limitContext(textbookContext, topic);

    const prompt = `
You are an expert AI Study Buddy for Tamil Nadu State Board students.
Create a personalized, 4-unit self-study plan in JSON format for:
Grade: ${grade}
Subject: ${subject}
Topic/Chapter: ${topic}
${truncatedContext ? `Textbook extract context:\n${truncatedContext}` : ''}

CRITICAL INSTRUCTION: If textbook context is provided, ONLY extract content about "${topic}". Ignore all other chapters.

CONSTRAINTS: goals=3, units=4, each unit: infographicCard (2 formulas, 2 keyConcepts, 1 illustration), audioGuide=2 turns, quiz=1 question, slides=15 (exactly 15 items in the slides array, mapping to Slide 1 through Slide 15 below).

SLIDE GENERATION RULES (CRITICAL):
Generate exactly 15 slides. The "slides" array in JSON MUST contain exactly 15 objects in this precise sequence.
Each slide must adhere to the following visual style and structure:

VISUAL STYLE & THEME:
- Background: Clean white/very light blue-white gradient. Professional, clean, modern, magazine-style educational presentation.
- Color Palette: Primary (Royal Blue, Navy, Indigo, White). Secondary (Emerald, Teal). Accents (Purple, Orange, Cyan).
- Illustration Style: Ultra-realistic 3D scientific illustration, white background, glassmorphism panels, detailed and professional, government educational standard, highly detailed, no cartoon, no clipart.
- Lighting: Soft, HDR, global illumination, glass reflections, natural and warm. No neon glow.
- Typography: Large bold title, numbered bullets, minimal body text (maximum 35 words per slide).
- Icons: Premium vector, scientific, modern (strictly no cartoons, no clipart).

SLIDE STRUCTURE (EXACTLY 15 SLIDES):
- Slide 1: Premium Cover → graphicType:"hero" graphicData.label=topic title
- Slide 2: Learning Outcomes → graphicType:"concept" graphicData.values=[3-4 objectives]
- Slide 3: Introduction → graphicType:"concept" graphicData.values=[3-4 key introduction points]
- Slide 4: Concept Visualization → graphicType:"concept" graphicData.label=main concept, values=[4 concept sub-elements]
- Slide 5: Real World Example → graphicType:"application" graphicData.values=[4 real examples with detail]
- Slide 6: Working Principle → graphicType:"process" graphicData.label=process name, values=[4 sequential steps]
- Slide 7: Scientific Formula → graphicType:"formula" graphicData.formula=actual formula, graphicData.variables=[3-4 variable explanations]
- Slide 8: Comparison → graphicType:"comparison" graphicData.label=comparison title, values=[LeftHeader, RightHeader, row1left, row1right, row2left, row2right]
- Slide 9: Experiment → graphicType:"experiment" graphicData.label=experiment name, values=[apparatus1, apparatus2, apparatus3]
- Slide 10: Daily Life Applications → graphicType:"application" graphicData.values=[4 detailed real-world uses]
- Slide 11: Important Facts → graphicType:"concept" graphicData.values=[4 key facts/milestones]
- Slide 12: Practice Questions → graphicType:"quiz"
- Slide 13: Activity → graphicType:"experiment" graphicData.values=[material1, material2, material3]
- Slide 14: Summary → graphicType:"summary" graphicData.values=[4 key summary points]
- Slide 15: Thank You → graphicType:"hero" graphicData.label=Next topic teaser

INFOGRAPHIC RULES — MOST IMPORTANT:
ALL infographic content MUST be about "${topic}" specifically. Use REAL educational data from the context.
- heroTitle: Tamil + English bilingual title for ${topic}
- heroSubtitle: Grade ${grade} ${subject} self-study guide
- heroIcon: pick best emoji for ${topic}
- conceptColor: one of emerald/sky/indigo/amber/rose/teal/violet
- modules: 4 real concept modules about ${topic}
- stats: 3 real quantitative facts/formulas from ${topic}
- workflow: 4 real steps to master ${topic}
- formulaBox: the actual primary formula or law for ${topic}
- formulaExplain: bilingual explanation of the formula
- lawTitle: name of the main law/theorem (bilingual)
- lawDesc: statement of the law (bilingual)
- termTable: 3 real technical terms from ${topic} (english, tamil, definition)
- constantName: a real key constant for ${topic}
- constantValue: the actual numeric value
- constantExplain: bilingual 1-sentence meaning

Output ONLY valid JSON (no markdown, no backticks):
{
  "subject": "${subject}",
  "topic": "${topic}",
  "grade": "${grade}",
  "goals": ["goal1", "goal2", "goal3"],
  "units": [
    {
      "id": "u1",
      "title": "Unit 1: Fundamentals of ${topic}",
      "status": "In Progress",
      "summary": "Introduction",
      "studyTime": "30 Minutes",
      "infographicCard": {
        "title": "Cheat Sheet",
        "formulas": ["formula1", "formula2"],
        "keyConcepts": ["concept1", "concept2"],
        "illustrations": ["visual description"]
      },
      "audioGuide": [
        {"speaker": "Karthik (AI Buddy)", "text": "explanation in English", "lang": "en"},
        {"speaker": "Priya (AI Buddy)", "text": "தமிழ் விளக்கம்", "lang": "ta"}
      ],
      "quiz": [{"question": "mcq?", "options": ["A) a","B) b","C) c","D) d"], "answer": "A) a", "rationale": "because"}]
    },
    {
      "id": "u2",
      "title": "Unit 2: Key Concepts of ${topic}",
      "status": "Pending",
      "summary": "Core concepts",
      "studyTime": "35 Minutes",
      "infographicCard": {"title": "Concepts", "formulas": ["f1","f2"], "keyConcepts": ["c1","c2"], "illustrations": ["visual"]},
      "audioGuide": [
        {"speaker": "Karthik (AI Buddy)", "text": "English explanation unit 2", "lang": "en"},
        {"speaker": "Priya (AI Buddy)", "text": "தமிழ் unit 2", "lang": "ta"}
      ],
      "quiz": [{"question": "unit2 mcq?", "options": ["A) a","B) b","C) c","D) d"], "answer": "B) b", "rationale": "because"}]
    },
    {
      "id": "u3",
      "title": "Unit 3: Problem Solving for ${topic}",
      "status": "Pending",
      "summary": "Practice and problems",
      "studyTime": "40 Minutes",
      "infographicCard": {"title": "Practice", "formulas": ["f1","f2"], "keyConcepts": ["c1","c2"], "illustrations": ["visual"]},
      "audioGuide": [
        {"speaker": "Karthik (AI Buddy)", "text": "English explanation unit 3", "lang": "en"},
        {"speaker": "Priya (AI Buddy)", "text": "தமிழ் unit 3", "lang": "ta"}
      ],
      "quiz": [{"question": "unit3 mcq?", "options": ["A) a","B) b","C) c","D) d"], "answer": "C) c", "rationale": "because"}]
    },
    {
      "id": "u4",
      "title": "Unit 4: Exam Preparation for ${topic}",
      "status": "Pending",
      "summary": "Revision and exam tips",
      "studyTime": "25 Minutes",
      "infographicCard": {"title": "Revision", "formulas": ["f1","f2"], "keyConcepts": ["c1","c2"], "illustrations": ["visual"]},
      "audioGuide": [
        {"speaker": "Karthik (AI Buddy)", "text": "English explanation unit 4", "lang": "en"},
        {"speaker": "Priya (AI Buddy)", "text": "தமிழ் unit 4", "lang": "ta"}
      ],
      "quiz": [{"question": "unit4 mcq?", "options": ["A) a","B) b","C) c","D) d"], "answer": "D) d", "rationale": "because"}]
    }
  ],
  "infographic": {
    "heroTitle": "REAL BILINGUAL TITLE FOR ${topic}",
    "heroSubtitle": "Grade ${grade} ${subject} Self-Study",
    "heroIcon": "📚",
    "conceptColor": "sky",
    "modules": [
      {"id": "m1", "title": "REAL CONCEPT 1 (தமிழ்)", "desc": "Real bilingual explanation.", "icon": "📌"},
      {"id": "m2", "title": "REAL CONCEPT 2 (தமிழ்)", "desc": "Real bilingual explanation.", "icon": "🔍"},
      {"id": "m3", "title": "REAL CONCEPT 3 (தமிழ்)", "desc": "Real bilingual explanation.", "icon": "⚡"},
      {"id": "m4", "title": "REAL CONCEPT 4 (தமிழ்)", "desc": "Real bilingual explanation.", "icon": "🌟"}
    ],
    "stats": [
      {"label": "REAL STAT 1", "value": "VALUE1", "desc": "explanation"},
      {"label": "REAL STAT 2", "value": "VALUE2", "desc": "explanation"},
      {"label": "REAL STAT 3", "value": "VALUE3", "desc": "explanation"}
    ],
    "workflow": [
      {"step": "REAL STEP 1 (படிநிலை)", "desc": "Real step explanation. தமிழ்.", "icon": "1️⃣"},
      {"step": "REAL STEP 2 (படிநிலை)", "desc": "Real step explanation. தமிழ்.", "icon": "2️⃣"},
      {"step": "REAL STEP 3 (படிநிலை)", "desc": "Real step explanation. தமிழ்.", "icon": "3️⃣"},
      {"step": "REAL STEP 4 (படிநிலை)", "desc": "Real step explanation. தமிழ்.", "icon": "4️⃣"}
    ],
    "formulaBox": "REAL PRIMARY FORMULA FOR ${topic}",
    "formulaExplain": "Bilingual formula explanation. சூத்திர விளக்கம்.",
    "lawTitle": "REAL LAW NAME (விதி)",
    "lawDesc": "Real bilingual law statement.",
    "termTable": [
      {"english": "term1", "tamil": "சொல்1", "definition": "definition1"},
      {"english": "term2", "tamil": "சொல்2", "definition": "definition2"},
      {"english": "term3", "tamil": "சொல்3", "definition": "definition3"}
    ],
    "constantName": "REAL CONSTANT NAME",
    "constantValue": "REAL NUMERIC VALUE",
    "constantExplain": "Bilingual constant explanation."
  },
  "slides": [
    {
      "title": "Slide Title (e.g. Premium Cover)",
      "subtitle": "Visual Explanation / Subtitle",
      "bullets": ["Bullet 1", "Bullet 2"],
      "teacherNotes": "Study notes...",
      "studentActivity": "Practice task...",
      "illustrationPrompt": "Ultra realistic, 3D scientific illustration, glassmorphism, white background...",
      "animationSuggestion": "Animated flow...",
      "graphicType": "hero|concept|formula|comparison|process|experiment|application|summary|quiz",
      "graphicData": {
        "label": "Main label or concept name",
        "values": ["Item 1", "Item 2", "Item 3", "Item 4"],
        "formula": "E = mc²",
        "variables": ["E = Energy", "m = Mass", "c = Speed of light"]
      }
    }
  ],
}
`;

    const result = await callGemini(prompt, true);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ===========================================================================
// POST /api/ai/draft-homework
// ===========================================================================
router.post('/draft-homework', async (req: Request, res: Response) => {
  try {
    const { topic, className } = req.body;

    const prompt = `
You are an expert teacher in Tamil Nadu, India, teaching the "TN Samacheer Kalvi" State Board syllabus.
Draft a short, engaging homework assignment for students.
Class & Subject: ${className}
Unit Title / Topic: ${topic}

Requirements:
- Provide 3-5 thought-provoking questions or tasks.
- Keep the language simple, direct, and grade-appropriate.
- Do NOT include any introductory or concluding pleasantries. Just return the homework questions/prompts directly as plain text with numbered bullet points.
- Include a mix of objective (e.g. fill in the blanks/multiple choice) and descriptive/creative questions.
- Optionally add a hint of regional relevance if applicable to the topic.
`;

    const result = await callGemini(prompt, false);
    res.json({ success: true, text: result });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ===========================================================================
// POST /api/ai/chat-tutor
// ===========================================================================
router.post('/chat-tutor', async (req: Request, res: Response) => {
  try {
    const { subject, grade, messages, currentMessage, language } = req.body;

    const historyText = (messages || [])
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');

    const prompt = `
You are a helpful, bilingual AI Tutor for Tamil Nadu school students.
You speak both Tamil (தமிழ்) and English (Tanglish is also allowed).
The student is studying: Subject = ${subject}, Grade = ${grade}.
Language mode: ${language}.

Conversation history:
${historyText}
Student: ${currentMessage}

Answer clearly with bullet points, bold text, and numbered lists where helpful.
Keep the tone encouraging and pedagogical. Alternate English/Tamil sentences in bilingual mode.
`;

    const result = await callGemini(prompt, false);
    res.json({ success: true, text: result });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ===========================================================================
// POST /api/ai/chat — Save chat log
// ===========================================================================
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { studentId, sessionId, messages, subject, language } = req.body;
    const chat = await AIChat.findOneAndUpdate(
      { studentId, sessionId },
      { $set: { messages, subject, language } },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/ai/chat/:studentId — Get chat history
router.get('/chat/:studentId', async (req: Request, res: Response) => {
  try {
    const chats = await AIChat.find({ studentId: req.params.studentId }).sort({ updatedAt: -1 }).limit(10);
    res.json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/ai/learning-path/:studentId
router.get('/learning-path/:studentId', async (req: Request, res: Response) => {
  try {
    const path = await LearningPath.findOne({ studentId: req.params.studentId });
    res.json({ success: true, data: path });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/ai/learning-path
router.post('/learning-path', async (req: Request, res: Response) => {
  try {
    const lp = await LearningPath.findOneAndUpdate(
      { studentId: req.body.studentId },
      req.body,
      { upsert: true, new: true }
    );
    res.json({ success: true, data: lp });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/ai/generate-questions
router.post('/generate-questions', async (req: Request, res: Response) => {
  try {
    const { grade, subject, topic, difficulty, mcqCount, shortCount, longCount } = req.body;

    const prompt = `
You are an expert curriculum developer and teacher for Tamil Nadu (TN) Schools under the State Board (Samacheer Kalvi) syllabus.
Generate high-quality questions for:
Grade: ${grade}
Subject: ${subject}
Topic/Concept: ${topic}
Overall Difficulty Level: ${difficulty}

You need to generate:
- MCQ questions (type: "mcq"): ${mcqCount || 0} questions. Each MCQ should have 4 options. Each MCQ is worth 1 mark. The options must be an array of strings like ["A) option1", "B) option2", "C) option3", "D) option4"] and answer must be the option letter (e.g. "A").
- Short Answer questions (type: "short"): ${shortCount || 0} questions. Each short answer question is worth 2 marks. Options should be empty/null, and answer should be a brief model answer key.
- Long Answer questions (type: "long"): ${longCount || 0} questions. Each long answer question is worth 5 marks. Options should be empty/null, and answer should be a detailed model answer key.

Your output MUST be a JSON object with a single key "questions" containing an array of all generated questions.
Each question object in the "questions" array MUST have the following structure:
{
  "type": "mcq" | "short" | "long",
  "difficulty": "${difficulty}",
  "text": "Question statement...",
  "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"] or null,
  "answer": "A" (for MCQs) or "brief model answer description" (for short/long questions),
  "marks": 1 (for mcq) or 2 (for short) or 5 (for long)
}

CRITICAL: Return ONLY valid JSON matching this schema. Do not add any introductory or concluding markdown code blocks other than standard JSON.
`;

    const schema = {
      type: "OBJECT",
      properties: {
        questions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              type: { type: "STRING", enum: ["mcq", "short", "long"] },
              difficulty: { type: "STRING" },
              text: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              answer: { type: "STRING" },
              marks: { type: "INTEGER" }
            },
            required: ["type", "difficulty", "text", "answer", "marks"]
          }
        }
      },
      required: ["questions"]
    };

    const result = await callGemini(prompt, true, schema);
    const questionsWithMeta = (result.questions || []).map((q: any) => ({
      ...q,
      grade: q.grade || grade,
      subject: q.subject || subject,
      topic: q.topic || topic
    }));
    res.json({ success: true, data: questionsWithMeta });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/ai/generate-resource-content
router.post('/generate-resource-content', async (req: Request, res: Response) => {
  try {
    const { title, subject, type, description } = req.body;

    const prompt = `
You are an expert educator and content creator for Tamil Nadu (TN) State Board Syllabus.
Please generate comprehensive study material for the following topic:

Title: ${title}
Subject: ${subject}
Resource Type: ${type}
Description: ${description || "Provide a detailed overview and key notes."}

Generate structured, easy-to-read educational content. Include:
1. Introduction
2. Key Concepts & Definitions
3. Important Formulas / Facts (if applicable)
4. Summary / Conclusion

Keep it concise (around 400-500 words). Format the output cleanly.
Return a JSON object with a single key "content" containing the generated text (formatted with basic HTML tags like <h3>, <p>, <ul>, <li>, <strong> for readability).
`;

    const schema = {
      type: "OBJECT",
      properties: {
        content: { type: "STRING" }
      },
      required: ["content"]
    };

    const result = await callGemini(prompt, true, schema);
    res.json({ success: true, data: result.content });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/ai/companion
router.post('/companion', async (req: Request, res: Response) => {
  try {
    const { resourceId, title, subject, grade, description, aiContent } = req.body;
    if (!resourceId) {
      return res.status(400).json({ success: false, error: "resourceId is required" });
    }

    // 1. Check MongoDB cache first
    const cached = await LibraryCompanion.findOne({ resourceId });
    if (cached && cached.flashcards && cached.flashcards.length > 0 && cached.visualMindMap) {
      return res.json({ success: true, data: cached });
    }

    // 2. Generate new content using Gemini
    const prompt = `
You are an expert curriculum developer and teacher for Tamil Nadu (TN) Schools under the State Board (Samacheer Kalvi) syllabus.
Generate a comprehensive AI Study Companion package for:
Grade: ${grade}
Subject: ${subject}
Resource Title: ${title}
Resource Description: ${description || ""}
Additional Content context: ${aiContent || ""}

Please analyze this resource and produce:
1. **summary**: A structured, detailed, student-friendly text summary of the chapter/concept (approx 150-250 words, using basic HTML tags like <p>, <strong> for formatting).
2. **keyPoints**: An array of 4 to 6 critical bullet takeaways from the topic.
3. **formulas**: An array of important equations, scientific constants, or grammar rules/facts covered in this subject topic (provide 3-5 formulas if it's a science/math subject, or key rules/facts if it's a language/social study).
4. **mindMap**: A text-based ASCII flowchart or Mermaid diagram outline representing the flow of concepts in this resource, formatted as a clear hierarchy or relationship graph.
5. **examQuestions**: Exactly 5 important exam questions. For each question, provide a detailed model answer key and the number of marks (e.g. 1 for MCQ, 2 for short, 5 for long/essay).
6. **flashcards**: Exactly 6 study flashcards. Each card must have an id (e.g. "fc-1"), front (a key term, question, or conceptual hint), and back (the matching explanation, definition, or model answer).
7. **visualMindMap**: A tree hierarchy JSON structure for interactive rendering:
   - topic: The main root topic title
   - branches: An array of 3-5 subtopics, where each subtopic has a "title" and an array of "details" strings describing key points.

You MUST return a JSON object that matches this exact schema:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "formulas": ["...", "..."],
  "mindMap": "...",
  "examQuestions": [
    { "question": "...", "answerKey": "...", "marks": 5 },
    ...
  ],
  "flashcards": [
    { "id": "fc-1", "front": "...", "back": "..." },
    ...
  ],
  "visualMindMap": {
    "topic": "...",
    "branches": [
      { "title": "...", "details": ["...", "..."] },
      ...
    ]
  }
}
Return ONLY valid JSON matching this schema. Do not add markdown framing other than the JSON itself.
`;

    const schema = {
      type: "OBJECT",
      properties: {
        summary: { type: "STRING" },
        keyPoints: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        formulas: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        mindMap: { type: "STRING" },
        examQuestions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              answerKey: { type: "STRING" },
              marks: { type: "INTEGER" }
            },
            required: ["question", "answerKey", "marks"]
          }
        },
        flashcards: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              front: { type: "STRING" },
              back: { type: "STRING" }
            },
            required: ["id", "front", "back"]
          }
        },
        visualMindMap: {
          type: "OBJECT",
          properties: {
            topic: { type: "STRING" },
            branches: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  details: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  }
                },
                required: ["title", "details"]
              }
            }
          },
          required: ["topic", "branches"]
        }
      },
      required: ["summary", "keyPoints", "formulas", "mindMap", "examQuestions", "flashcards", "visualMindMap"]
    };

    const result = await callGemini(prompt, true, schema);
    
    // 3. Cache the response in MongoDB (overwrite if exists, to update with flashcards/mindmaps)
    const companion = await LibraryCompanion.findOneAndUpdate(
      { resourceId },
      {
        $set: {
          summary: result.summary,
          keyPoints: result.keyPoints || [],
          formulas: result.formulas || [],
          mindMap: result.mindMap || "",
          examQuestions: result.examQuestions || [],
          flashcards: result.flashcards || [],
          visualMindMap: result.visualMindMap || null
        }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: companion });
  } catch (err) {
    console.error('[POST /api/ai/companion]', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
