// ===========================================================================
// AI Content Studio — skill registry
// ---------------------------------------------------------------------------
// Single source of truth for the 20 teacher "/command" content skills.
// The frontend keeps a *client-safe mirror* of the display half of this file in
// frontend/src/lib/aiSkills.ts — prompts never ship to the browser.
//
// Superadmin overrides (enable/disable, class range, model, maxTokens, prompt
// text) live in the Mongo AiSkillConfig collection; an absent doc means "use
// the defaults declared here". Reset-to-default = delete the doc.
//
// Same catalog convention as frontend/src/lib/moduleCatalog.ts.
// ===========================================================================

export type SkillGroup =
  | 'TEACH'
  | 'PRACTICE'
  | 'ASSESS'
  | 'ENGAGE'
  | 'DIFFERENTIATE'
  | 'FEEDBACK';

export type OutputKind =
  | 'document'
  | 'questionSet'
  | 'worksheet'
  | 'matrix'
  | 'cardList'
  | 'slides';

export type SubjectPack =
  | 'MATHS'
  | 'SCIENCE'
  | 'LANGUAGE'
  | 'SOCIAL'
  | 'COMPUTER'
  | 'GENERAL';

export type PushTarget = 'questionBank' | 'lessonPlan' | 'homework' | 'smartClass';

export interface SkillInput {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  options?: string[];
  default?: string | number;
  placeholder?: string;
  /** Shown under the field in the composer. */
  hint?: string;
}

export interface AiSkillDef {
  key: string;
  command: string;
  label: string;
  description: string;
  group: SkillGroup;
  outputKind: OutputKind;
  icon: string;
  accent: string;
  /** Prompt body. Placeholders: {{class}} {{grade}} {{subject}} {{topic}} {{unit}} {{duration}} plus every SkillInput key. */
  basePrompt: string;
  defaultModel: string;
  defaultMaxTokens: number;
  defaultClassRange: [number, number];
  inputs: SkillInput[];
  pushTargets: PushTarget[];
  /** One-line "what you'll get" shown before generating. */
  preview: string;
}

export const SKILL_GROUPS: Record<
  SkillGroup,
  { key: SkillGroup; slug: string; label: string; icon: string; blurb: string }
> = {
  TEACH: {
    key: 'TEACH',
    slug: 'teach',
    label: 'Teach & Explain',
    icon: 'fi fi-rr-chalkboard-user',
    blurb: 'Plan the period and explain the concept',
  },
  PRACTICE: {
    key: 'PRACTICE',
    slug: 'practice',
    label: 'Practice & Work',
    icon: 'fi fi-rr-pencil',
    blurb: 'Worksheets, activities, homework and revision',
  },
  ASSESS: {
    key: 'ASSESS',
    slug: 'assess',
    label: 'Tests & Assess',
    icon: 'fi fi-rr-list-check',
    blurb: 'Quizzes, MCQs, question papers and answer keys',
  },
  ENGAGE: {
    key: 'ENGAGE',
    slug: 'engage',
    label: 'Engage & Discuss',
    icon: 'fi fi-rr-comments',
    blurb: 'Get the class talking and involved',
  },
  DIFFERENTIATE: {
    key: 'DIFFERENTIATE',
    slug: 'differentiate',
    label: 'Differentiate',
    icon: 'fi fi-rr-users-alt',
    blurb: 'Adapt for mixed-ability classrooms and grade fairly',
  },
  FEEDBACK: {
    key: 'FEEDBACK',
    slug: 'feedback',
    label: 'Feedback',
    icon: 'fi fi-rr-comment-check',
    blurb: 'Constructive, specific feedback on student work',
  },
};

export const GROUP_BY_SLUG: Record<string, SkillGroup> = Object.values(SKILL_GROUPS).reduce(
  (acc, g) => {
    acc[g.slug] = g.key;
    return acc;
  },
  {} as Record<string, SkillGroup>
);

// ---------------------------------------------------------------------------
// Subject packs — the "adopt their execution way" layer.
//
// A pack changes WHAT the skill produces, not just its wording. `kindHints`
// carries the structural directive for each output kind, so 6 packs x 6 kinds
// covers all 20 skills without 120 hand-written templates.
// ---------------------------------------------------------------------------

export interface SubjectPackDef {
  key: SubjectPack;
  label: string;
  icon: string;
  persona: string;
  method: string;
  examplePolicy: string;
  kindHints: Record<OutputKind, string>;
}

export const SUBJECT_PACKS: Record<SubjectPack, SubjectPackDef> = {
  MATHS: {
    key: 'MATHS',
    label: 'Mathematics',
    icon: '🧮',
    persona:
      'an experienced Tamil Nadu State Board Mathematics teacher who teaches procedurally, one step at a time',
    method:
      'Always move concrete -> pictorial -> abstract. Show every intermediate step. Name the rule or theorem being applied at each step. Anticipate the arithmetic and sign errors students actually make.',
    examplePolicy:
      'Use Indian contexts and rupee/metric units. Numbers must be clean enough to compute mentally where possible; never invent a result that does not actually follow from the working.',
    kindHints: {
      document:
        'Structure as: recall of prerequisite skill -> statement of the rule/formula -> one fully worked example with every step numbered -> a second example with a twist -> common mistakes -> quick self-check sums.',
      questionSet:
        'Questions must be computational. Spread them across 1-mark direct substitution, 2-mark two-step, and 5-mark multi-concept problems. Every answer must include the worked steps in the explanation field, not just the final value.',
      worksheet:
        'Sections must be: (A) Warm-up drill of 5 single-step sums, (B) Core practice of graded sums, (C) 2 word problems, (D) 1 challenge sum. The answer key must contain the full working, and commonErrors must list the specific sign/place-value/transposition slips for this topic.',
      matrix:
        'Rows are the mathematical competencies (accuracy of computation, correct method, presentation of steps, reasoning/justification). Columns are performance bands. Cell text must reference the number of steps shown or errors permitted, not vague adjectives.',
      cardList:
        'Each card is one worked micro-example or one real-life measurement/money/geometry situation where this topic is actually used.',
      slides:
        'One idea per slide. Formula slides must show the formula on its own line and then a substituted example underneath. Include at least two board-work slides where the teacher solves live.',
    },
  },
  SCIENCE: {
    key: 'SCIENCE',
    label: 'Science',
    icon: '🔬',
    persona:
      'an experienced Tamil Nadu State Board Science teacher who teaches through observation, evidence and mechanism',
    method:
      'Move from the observable phenomenon -> the underlying mechanism -> the real-world application. Use labelled diagrams and observation tables. Distinguish clearly between an observation, an inference and a conclusion.',
    examplePolicy:
      'Use phenomena a Tamil Nadu student can actually see — monsoon, coastal life, local crops, household appliances. All scientific values, units and constants must be real.',
    kindHints: {
      document:
        'Structure as: the phenomenon (what we notice) -> the scientific explanation (mechanism) -> a labelled diagram description -> an application -> misconceptions to correct.',
      questionSet:
        'Mix definition/recall, diagram-labelling, reason-assertion, and application questions. Include at least one "predict the outcome of this experiment" item. Explanations must state the scientific principle used.',
      worksheet:
        'Sections must be: (A) Label the diagram (describe the diagram precisely in words so a teacher can draw it), (B) Fill the observation table, (C) Reason-based short answers, (D) One application question. Answer key includes the inference for each observation.',
      matrix:
        'Rows are scientific skills (accurate observation, correct use of terminology, labelled diagram, valid inference, safety awareness). Cells must describe observable evidence of each band.',
      cardList:
        'Each card is one everyday phenomenon or application, with the scientific principle named explicitly in the body.',
      slides:
        'Alternate between a phenomenon slide and a mechanism slide. Every diagram slide must include a visualHint precise enough to sketch on the board.',
    },
  },
  LANGUAGE: {
    key: 'LANGUAGE',
    label: 'Language (Tamil / English)',
    icon: '📖',
    persona:
      'an experienced Tamil Nadu State Board language teacher who builds meaning, usage and expression together',
    method:
      'Move from meaning -> usage in a sentence -> pattern/grammar rule -> the student producing their own language. Always give the word or structure in context before defining it. Give both English and Tamil glosses for key vocabulary.',
    examplePolicy:
      'Sentences must be natural classroom language, not textbook-stiff. Use Tamil Nadu names, places and situations.',
    kindHints: {
      document:
        'Structure as: the passage/extract in context -> meaning and key vocabulary (with Tamil gloss) -> the language pattern or literary device at work -> model sentences -> a short writing task.',
      questionSet:
        'Group questions as reading comprehension, vocabulary/word-usage, grammar transformation, and one short composition prompt. Never make grammar questions context-free — embed each in a sentence.',
      worksheet:
        'Sections must be: (A) A short original passage (6-10 lines) on the topic, (B) Comprehension questions on that passage, (C) Vocabulary and grammar drill drawn from the passage, (D) A guided writing task with a sentence starter. Answer key gives model answers, not one-word keys.',
      matrix:
        'Rows are language competencies (content and ideas, vocabulary range, grammatical accuracy, organisation, expression/fluency). Cells must describe what the writing actually looks like at each band.',
      cardList:
        'Each card is one usage example, idiom, or sentence pattern, with an English meaning and a natural Tamil equivalent.',
      slides:
        'Show the language before naming the rule. Each slide should carry one model sentence in large text plus its breakdown.',
    },
  },
  SOCIAL: {
    key: 'SOCIAL',
    label: 'Social Science',
    icon: '🗺️',
    persona:
      'an experienced Tamil Nadu State Board Social Science teacher who teaches through sources, chronology and causation',
    method:
      'Anchor everything in time, place and evidence. Always build a cause -> event -> consequence chain. Use maps, timelines and short source extracts. Present differing viewpoints where they genuinely exist.',
    examplePolicy:
      'Dates, place names, figures and constitutional articles must be historically accurate. Prefer Tamil Nadu and Indian examples, then world context.',
    kindHints: {
      document:
        'Structure as: context (when and where) -> the sequence of events -> causes -> consequences -> significance today. Include a compact timeline and one map reference.',
      questionSet:
        'Mix recall of facts/dates, map/timeline identification, source-based interpretation, and cause-effect reasoning. Explanations must cite the specific event or provision.',
      worksheet:
        'Sections must be: (A) A short source extract with interpretation questions, (B) A timeline or map-marking task described in words, (C) Cause-and-effect chain to complete, (D) One opinion question with a sentence frame. Answer key gives the reasoning, not just the fact.',
      matrix:
        'Rows are historical/civic skills (factual accuracy, use of evidence, cause-effect reasoning, chronology, balanced viewpoint).',
      cardList:
        'Each card is one event, personality, provision or present-day parallel, dated and placed.',
      slides:
        'Lead with a timeline slide, then one slide per cause and per consequence. Include one map slide with a precise visualHint.',
    },
  },
  COMPUTER: {
    key: 'COMPUTER',
    label: 'Computer Science',
    icon: '💻',
    persona:
      'an experienced Tamil Nadu State Board Computer Science teacher who teaches by tracing code and building up from small working pieces',
    method:
      'Concept -> minimal working code -> dry run / trace table -> deliberate bug to fix -> extension. Code must be complete, runnable and correctly indented.',
    examplePolicy:
      'Use the language on the TN syllabus for that class. Every code snippet must be syntactically valid and its stated output must be the output it genuinely produces.',
    kindHints: {
      document:
        'Structure as: the concept in plain words -> a minimal code example -> a dry-run trace table -> a common bug and its fix -> an extension task.',
      questionSet:
        'Mix "what is the output", "spot the error", "complete the code", and short theory questions. Every code question must contain the actual code, and explanations must trace the execution.',
      worksheet:
        'Sections must be: (A) Predict the output of 4 short snippets, (B) Complete the missing lines, (C) Debug a broken program, (D) Write one small program. Answer key must include the corrected code and why the bug occurred.',
      matrix:
        'Rows are programming competencies (correct logic, syntax accuracy, code readability/naming, handling of edge cases, documentation).',
      cardList:
        'Each card is one snippet or one real application, with the code inline in the body.',
      slides:
        'Code slides must contain the full snippet with line breaks preserved. Follow each code slide with a trace slide.',
    },
  },
  GENERAL: {
    key: 'GENERAL',
    label: 'General',
    icon: '📚',
    persona: 'an experienced Tamil Nadu State Board teacher',
    method:
      'Move from the familiar to the new. Define terms before using them, give one clear example per idea, and check understanding at the end.',
    examplePolicy: 'Use Tamil Nadu classroom contexts. Keep every fact accurate and age-appropriate.',
    kindHints: {
      document: 'Structure as: introduction -> main ideas one at a time -> examples -> summary -> check for understanding.',
      questionSet: 'Spread across recall, understanding and application. Explanations must justify the answer.',
      worksheet:
        'Sections must be: (A) Warm-up recall, (B) Core practice, (C) Application, (D) Challenge. Answer key must be complete.',
      matrix: 'Rows are the assessable criteria for this task; columns are performance bands with observable descriptors.',
      cardList: 'Each card is one self-contained idea or example.',
      slides: 'One idea per slide, with a concrete example on each.',
    },
  },
};

/**
 * Map a free-text subject name (English or Tamil, TN Board naming) to a pack.
 * Falls back to GENERAL. The teacher can always override in the UI.
 */
export function subjectToPack(subject?: string | null): SubjectPack {
  const s = (subject || '').toLowerCase().trim();
  if (!s) return 'GENERAL';

  const has = (...needles: string[]) => needles.some((n) => s.includes(n));

  if (has('math', 'maths', 'kanitham', 'கணித', 'algebra', 'geometry', 'trigonom', 'statistic', 'calculus'))
    return 'MATHS';
  if (
    has(
      'computer', 'informat', 'programming', 'python', 'java', 'c++', 'coding', 'ict',
      'கணினி', 'software'
    )
  )
    return 'COMPUTER';
  if (
    has(
      'science', 'physic', 'chemis', 'biolog', 'botan', 'zoolog', 'அறிவியல்', 'இயற்பியல்',
      'வேதியியல்', 'உயிரியல்', 'environment'
    )
  )
    return 'SCIENCE';
  if (
    has(
      'social', 'history', 'geograph', 'civic', 'econom', 'political', 'சமூக', 'வரலா',
      'புவியிய', 'குடிமை', 'பொருளிய'
    )
  )
    return 'SOCIAL';
  if (
    has(
      'tamil', 'english', 'language', 'hindi', 'sanskrit', 'french', 'literature', 'grammar',
      'தமிழ்', 'ஆங்கில', 'மொழி'
    )
  )
    return 'LANGUAGE';

  return 'GENERAL';
}

// ---------------------------------------------------------------------------
// Gemini response schemas — one per output kind.
// Uppercase type names match the existing schemas in routes/ai.routes.ts.
// ---------------------------------------------------------------------------

const DOCUMENT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    subtitle: { type: 'STRING' },
    summary: { type: 'STRING', description: 'Two or three sentences a teacher can read aloud as an opener' },
    sections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          heading: { type: 'STRING' },
          body: { type: 'STRING' },
          bullets: { type: 'ARRAY', items: { type: 'STRING' } },
          durationMins: { type: 'INTEGER', description: 'Minutes for this section; 0 if not time-boxed' },
        },
        required: ['heading', 'body', 'bullets', 'durationMins'],
      },
    },
    keyTerms: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          term: { type: 'STRING' },
          meaning: { type: 'STRING' },
          tamil: { type: 'STRING', description: 'Tamil equivalent; empty string if not applicable' },
        },
        required: ['term', 'meaning', 'tamil'],
      },
    },
    teacherNotes: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['title', 'subtitle', 'summary', 'sections', 'keyTerms', 'teacherNotes'],
};

const QUESTION_SET_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    instructions: { type: 'STRING' },
    totalMarks: { type: 'INTEGER' },
    durationMins: { type: 'INTEGER' },
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          number: { type: 'INTEGER' },
          type: { type: 'STRING', description: 'MCQ | Short Answer | Long Answer | True/False | Fill in the Blank' },
          difficulty: { type: 'STRING', description: 'Easy | Medium | Hard' },
          text: { type: 'STRING' },
          options: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Formatted "A) ..." for MCQ; empty array for non-MCQ',
          },
          answer: { type: 'STRING', description: 'Full text of the correct answer, not just the letter' },
          explanation: { type: 'STRING', description: 'Why this is the answer — include working/reasoning' },
          marks: { type: 'INTEGER' },
        },
        required: ['number', 'type', 'difficulty', 'text', 'options', 'answer', 'explanation', 'marks'],
      },
    },
  },
  required: ['title', 'instructions', 'totalMarks', 'durationMins', 'questions'],
};

const WORKSHEET_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    instructions: { type: 'STRING' },
    estimatedMins: { type: 'INTEGER' },
    passage: {
      type: 'STRING',
      description: 'Source passage, code snippet, source extract or scenario. Empty string when the subject does not need one.',
    },
    sections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          heading: { type: 'STRING' },
          intro: { type: 'STRING' },
          items: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                number: { type: 'INTEGER' },
                prompt: { type: 'STRING' },
                workingLines: { type: 'INTEGER', description: 'Blank lines to leave for the student, 0-12' },
                hint: { type: 'STRING' },
              },
              required: ['number', 'prompt', 'workingLines', 'hint'],
            },
          },
        },
        required: ['heading', 'intro', 'items'],
      },
    },
    answerKey: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          number: { type: 'INTEGER' },
          answer: { type: 'STRING' },
          workedSteps: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['number', 'answer', 'workedSteps'],
      },
    },
    commonErrors: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['title', 'instructions', 'estimatedMins', 'passage', 'sections', 'answerKey', 'commonErrors'],
};

const MATRIX_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    description: { type: 'STRING' },
    columns: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Band or level names, weakest first' },
    rows: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          label: { type: 'STRING', description: 'The criterion or the learner group' },
          weight: { type: 'STRING', description: 'Marks or weighting; empty string if not applicable' },
          cells: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Same length and order as columns' },
        },
        required: ['label', 'weight', 'cells'],
      },
    },
    legend: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['title', 'description', 'columns', 'rows', 'legend'],
};

const CARD_LIST_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    intro: { type: 'STRING' },
    cards: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          body: { type: 'STRING' },
          icon: { type: 'STRING', description: 'A single emoji' },
          tag: { type: 'STRING', description: 'Short label, e.g. the level, theme or duration' },
        },
        required: ['title', 'body', 'icon', 'tag'],
      },
    },
  },
  required: ['title', 'intro', 'cards'],
};

const SLIDES_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    slides: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          number: { type: 'INTEGER' },
          title: { type: 'STRING' },
          bullets: { type: 'ARRAY', items: { type: 'STRING' } },
          speakerNotes: { type: 'STRING' },
          visualHint: { type: 'STRING', description: 'What to draw or show on this slide' },
        },
        required: ['number', 'title', 'bullets', 'speakerNotes', 'visualHint'],
      },
    },
  },
  required: ['title', 'slides'],
};

export const SCHEMAS: Record<OutputKind, any> = {
  document: DOCUMENT_SCHEMA,
  questionSet: QUESTION_SET_SCHEMA,
  worksheet: WORKSHEET_SCHEMA,
  matrix: MATRIX_SCHEMA,
  cardList: CARD_LIST_SCHEMA,
  slides: SLIDES_SCHEMA,
};

// ---------------------------------------------------------------------------
// Shared input fragments
// ---------------------------------------------------------------------------

const DIFFICULTY_INPUT: SkillInput = {
  key: 'difficulty',
  label: 'Difficulty',
  type: 'select',
  options: ['Easy', 'Mixed', 'Medium', 'Hard'],
  default: 'Mixed',
};

const COUNT_INPUT = (def: number, hint?: string): SkillInput => ({
  key: 'count',
  label: 'How many',
  type: 'number',
  default: def,
  hint,
});

// ---------------------------------------------------------------------------
// The 20 skills
// ---------------------------------------------------------------------------

export const AI_SKILLS: AiSkillDef[] = [
  // ── TEACH ────────────────────────────────────────────────────────────────
  {
    key: 'lesson',
    command: '/lesson',
    label: 'Lesson Plan',
    description: 'Create a complete lesson plan for this topic.',
    group: 'TEACH',
    outputKind: 'document',
    icon: 'fi fi-rr-document',
    accent: 'bg-blue-600',
    preview: 'A period-by-period plan with objectives, timeline, key terms and teacher notes',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 16000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'duration', label: 'Period length', type: 'select', options: ['30 minutes', '40 minutes', '45 minutes', '60 minutes', 'Double period'], default: '45 minutes' },
    ],
    pushTargets: ['lessonPlan', 'smartClass'],
    basePrompt: `Build a complete, teachable lesson plan for "{{topic}}" ({{subject}}, {{class}}), to be delivered in {{duration}}.
Requirements:
- summary: what the teacher is trying to achieve this period, in 2-3 sentences.
- sections: exactly 5 — "Learning Objectives", "The Hook (opening)", "Core Instruction", "Guided Practice", "Wrap-up & Exit Check". Set durationMins on each so they sum to {{duration}}.
- Each section's bullets must be concrete teacher actions ("draw X on the board", "ask: ..."), never generic advice.
- keyTerms: 5 terms the students must leave the period knowing.
- teacherNotes: 4 notes covering pacing, the likely point of confusion, a differentiation move, and materials needed.`,
  },
  {
    key: 'explain',
    command: '/explain',
    label: 'Explain Topic',
    description: 'Explain this topic in a way students can easily understand.',
    group: 'TEACH',
    outputKind: 'document',
    icon: 'fi fi-rr-bulb',
    accent: 'bg-green-600',
    preview: 'A step-by-step explanation the teacher can deliver straight from the screen',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 12000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'depth', label: 'Depth', type: 'select', options: ['Quick overview', 'Standard', 'In depth'], default: 'Standard' },
    ],
    pushTargets: ['smartClass'],
    basePrompt: `Explain "{{topic}}" ({{subject}}, {{class}}) so a student who has never met it can follow. Depth: {{depth}}.
Requirements:
- Build the explanation in order — never use a term before it has been defined.
- sections: 4 to 6, each one step of the explanation, ending with a "Check You've Got It" section containing 3 quick oral questions in its bullets.
- keyTerms: every technical term you used.
- teacherNotes: the two misconceptions students most often bring to this topic, and how to correct each.`,
  },
  {
    key: 'examples',
    command: '/examples',
    label: 'Real-life Examples',
    description: 'Give real-life examples to explain this concept.',
    group: 'TEACH',
    outputKind: 'cardList',
    icon: 'fi fi-rr-apple-whole',
    accent: 'bg-teal-600',
    preview: 'A deck of real-world example cards, each tied back to the concept',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 8000,
    defaultClassRange: [1, 12],
    inputs: [COUNT_INPUT(8, 'Number of examples')],
    pushTargets: ['smartClass'],
    basePrompt: `Give {{count}} real-life examples that make "{{topic}}" ({{subject}}, {{class}}) click.
Requirements:
- Every example must be something a Tamil Nadu student has actually seen or done.
- Each card body must state the situation first, then name exactly how the concept applies to it.
- Vary the settings: home, market, farm/coast, school, transport, technology, festival.
- tag: the setting. icon: a fitting emoji.`,
  },
  {
    key: 'simplify',
    command: '/simplify',
    label: 'Simplify',
    description: 'Simplify this topic for younger students.',
    group: 'TEACH',
    outputKind: 'cardList',
    icon: 'fi fi-rr-feather',
    accent: 'bg-cyan-500',
    preview: 'The same idea broken into small, plain-language chunks',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 8000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'targetLevel', label: 'Simplify to level of', type: 'select', options: ['Class 3', 'Class 5', 'Class 6', 'Class 8', 'Class 9'], default: 'Class 6' },
    ],
    pushTargets: ['smartClass'],
    basePrompt: `Re-explain "{{topic}}" ({{subject}}, originally {{class}}) so that a {{targetLevel}} student understands it.
Requirements:
- Use only vocabulary a {{targetLevel}} student already has. If a technical term is unavoidable, give the everyday word first and the technical word in brackets.
- Each card is one small chunk, in the order it should be taught, with an analogy in the body.
- Short sentences. No sentence longer than 15 words.
- tag: "Step 1", "Step 2", ... in order.`,
  },
  {
    key: 'presentation',
    command: '/presentation',
    label: 'Presentation',
    description: 'Create a classroom presentation outline.',
    group: 'TEACH',
    outputKind: 'slides',
    icon: 'fi fi-rr-presentation',
    accent: 'bg-emerald-500',
    preview: 'A projector-ready slide deck with speaker notes and board-work hints',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 14000,
    defaultClassRange: [1, 12],
    inputs: [COUNT_INPUT(10, 'Number of slides')],
    pushTargets: ['smartClass'],
    basePrompt: `Create a {{count}}-slide classroom presentation on "{{topic}}" ({{subject}}, {{class}}).
Requirements:
- Slide 1 is the title slide; the last slide is a recap with 3 questions in its bullets.
- Maximum 5 bullets per slide, maximum 12 words per bullet — these go on a projector.
- speakerNotes: what the teacher says on that slide, 2-3 sentences.
- visualHint: exactly what to draw, show or demonstrate. Never leave it empty.`,
  },

  // ── PRACTICE ─────────────────────────────────────────────────────────────
  {
    key: 'worksheet',
    command: '/worksheet',
    label: 'Worksheet',
    description: 'Create a printable worksheet with answers.',
    group: 'PRACTICE',
    outputKind: 'worksheet',
    icon: 'fi fi-rr-file-edit',
    accent: 'bg-purple-600',
    preview: 'A printable student sheet plus a separate answer key with full working',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 20000,
    defaultClassRange: [1, 12],
    inputs: [DIFFICULTY_INPUT, COUNT_INPUT(12, 'Total questions across all sections')],
    pushTargets: ['homework'],
    basePrompt: `Create a printable worksheet on "{{topic}}" ({{subject}}, {{class}}). Difficulty: {{difficulty}}. About {{count}} items in total.
Requirements:
- Number every item continuously across sections, starting at 1.
- workingLines must match the real space needed — 0 for one-word answers, up to 12 for extended work.
- answerKey must cover every numbered item with no gaps.
- commonErrors: at least 4, specific to this topic — not general exam advice.`,
  },
  {
    key: 'activity',
    command: '/activity',
    label: 'Classroom Activity',
    description: 'Create a fun classroom activity for this topic.',
    group: 'PRACTICE',
    outputKind: 'document',
    icon: 'fi fi-rr-puzzle-piece',
    accent: 'bg-orange-600',
    preview: 'A runnable activity with setup, rules, timings and materials',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 10000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'duration', label: 'Time available', type: 'select', options: ['10 minutes', '15 minutes', '20 minutes', '30 minutes'], default: '20 minutes' },
      { key: 'mode', label: 'Grouping', type: 'select', options: ['Whole class', 'Pairs', 'Small groups', 'Individual'], default: 'Small groups' },
    ],
    pushTargets: [],
    basePrompt: `Design a classroom activity that teaches "{{topic}}" ({{subject}}, {{class}}) in {{duration}}, run as {{mode}}.
Requirements:
- sections: "What You Need", "Setup", "How to Run It" (numbered steps with durationMins), "What Students Learn", "If It Goes Wrong".
- Materials must be things a government school in Tamil Nadu actually has — chalk, paper, the blackboard, students themselves. No printing, no devices, no purchased kits.
- The activity must genuinely require the concept; it must not be a generic game with the topic bolted on.
- teacherNotes: how to manage noise, and how to include the quiet students.`,
  },
  {
    key: 'homework',
    command: '/homework',
    label: 'Homework',
    description: 'Create meaningful homework for students.',
    group: 'PRACTICE',
    outputKind: 'worksheet',
    icon: 'fi fi-rr-house-chimney',
    accent: 'bg-rose-600',
    preview: 'A homework set sized to the time you allow, with an answer key',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 14000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'duration', label: 'Should take about', type: 'select', options: ['15 minutes', '20 minutes', '30 minutes', '45 minutes'], default: '30 minutes' },
      DIFFICULTY_INPUT,
    ],
    pushTargets: ['homework'],
    basePrompt: `Create homework on "{{topic}}" ({{subject}}, {{class}}) that takes a typical student {{duration}}. Difficulty: {{difficulty}}.
Requirements:
- It must be completable without internet, a printer, or help from an adult.
- Sections: "Recall" (from today's lesson), "Practice", "Think About It" (one question with no single right answer).
- Keep the total honestly within {{duration}} — fewer, better questions.
- answerKey must be usable by a parent or the student for self-checking.`,
  },
  {
    key: 'revision',
    command: '/revision',
    label: 'Revision Material',
    description: 'Create quick revision material for this topic.',
    group: 'PRACTICE',
    outputKind: 'cardList',
    icon: 'fi fi-rr-refresh',
    accent: 'bg-yellow-600',
    preview: 'Last-minute revision cards — one fact or formula per card',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 10000,
    defaultClassRange: [1, 12],
    inputs: [COUNT_INPUT(12, 'Number of revision cards')],
    pushTargets: [],
    basePrompt: `Create {{count}} revision cards for "{{topic}}" ({{subject}}, {{class}}) — the night-before-the-exam kind.
Requirements:
- One fact, formula, definition or rule per card. Nothing that needs a paragraph to explain.
- Order them by exam importance, most important first.
- tag: "Must know" / "Should know" / "Bonus".
- Where a formula or date exists, put it in the body exactly as it must be reproduced.`,
  },
  {
    key: 'project',
    command: '/project',
    label: 'Student Project',
    description: 'Create a student project with clear instructions.',
    group: 'PRACTICE',
    outputKind: 'document',
    icon: 'fi fi-rr-diploma',
    accent: 'bg-pink-600',
    preview: 'A project brief with stages, deliverables and an assessment breakdown',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 12000,
    defaultClassRange: [4, 12],
    inputs: [
      { key: 'duration', label: 'Project length', type: 'select', options: ['1 week', '2 weeks', '1 month'], default: '2 weeks' },
      { key: 'mode', label: 'Done by', type: 'select', options: ['Individual', 'Pairs', 'Groups of 4'], default: 'Groups of 4' },
    ],
    pushTargets: [],
    basePrompt: `Design a {{duration}} student project on "{{topic}}" ({{subject}}, {{class}}), done as {{mode}}.
Requirements:
- sections: "The Brief" (what students are asked to produce), "Why It Matters", "Stage 1/2/3" with durationMins, "What To Submit", "How It Will Be Marked" (bullets with mark splits summing to 100).
- The deliverable must be producible with paper, chalk, local observation and interviews — assume no computers at home.
- teacherNotes: checkpoints to catch groups falling behind, and how to handle an absent group member.`,
  },

  // ── ASSESS ───────────────────────────────────────────────────────────────
  {
    key: 'quiz',
    command: '/quiz',
    label: 'Quiz',
    description: 'Create a quiz with different difficulty levels.',
    group: 'ASSESS',
    outputKind: 'questionSet',
    icon: 'fi fi-rr-stopwatch',
    accent: 'bg-cyan-600',
    preview: 'A tiered quiz — easy, medium and hard — with answers and explanations',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 16000,
    defaultClassRange: [1, 12],
    inputs: [COUNT_INPUT(15, 'Number of questions'), { key: 'duration', label: 'Time limit', type: 'select', options: ['10 minutes', '15 minutes', '20 minutes', '30 minutes'], default: '20 minutes' }],
    pushTargets: ['questionBank'],
    basePrompt: `Create a {{count}}-question quiz on "{{topic}}" ({{subject}}, {{class}}) for {{duration}}.
Requirements:
- Split roughly 40% Easy, 40% Medium, 20% Hard, and set the difficulty field honestly on each.
- Mix the question types — do not make them all MCQ.
- Set marks per question so totalMarks is a round number, and set durationMins to {{duration}}.
- explanation must teach, not just assert: state the rule or step that produces the answer.`,
  },
  {
    key: 'mcq',
    command: '/mcq',
    label: 'MCQ Set',
    description: 'Create multiple-choice questions with answers.',
    group: 'ASSESS',
    outputKind: 'questionSet',
    icon: 'fi fi-rr-list-check',
    accent: 'bg-emerald-600',
    preview: 'MCQs with four plausible options each and the reasoning behind the key',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 18000,
    defaultClassRange: [1, 12],
    inputs: [COUNT_INPUT(20, 'Number of MCQs'), DIFFICULTY_INPUT],
    pushTargets: ['questionBank'],
    basePrompt: `Create {{count}} multiple-choice questions on "{{topic}}" ({{subject}}, {{class}}). Difficulty: {{difficulty}}.
Requirements:
- Every question has exactly 4 options formatted "A) ...", "B) ...", "C) ...", "D) ...".
- type is "MCQ" for all of them. marks is 1 for all of them.
- The three distractors must be genuinely tempting — each should correspond to a specific mistake a student makes. Never use filler options like "None of these" unless it is the correct answer.
- Spread the correct option across A, B, C and D roughly evenly.
- answer is the full text of the correct option including its letter.`,
  },
  {
    key: 'questions',
    command: '/questions',
    label: 'Important Questions',
    description: 'Create important questions from this chapter.',
    group: 'ASSESS',
    outputKind: 'questionSet',
    icon: 'fi fi-rr-interrogation',
    accent: 'bg-amber-600',
    preview: 'The questions most likely to be asked, ranked by exam importance',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 16000,
    defaultClassRange: [1, 12],
    inputs: [COUNT_INPUT(15, 'Number of questions')],
    pushTargets: ['questionBank'],
    basePrompt: `List the {{count}} most important exam questions from "{{topic}}" ({{subject}}, {{class}}) for the Tamil Nadu State Board pattern.
Requirements:
- Order them by how likely they are to appear, most likely first.
- Cover the full mark range: 1-mark, 2-mark, 3-mark and 5-mark questions, with marks set accordingly.
- Phrase them the way the board actually phrases questions.
- answer must be a model answer of the right length for the marks awarded, not a hint.
- explanation: state briefly why this question matters / how often it recurs.`,
  },
  {
    key: 'assessment',
    command: '/assessment',
    label: 'Assessment',
    description: 'Create an assessment based on learning objectives.',
    group: 'ASSESS',
    outputKind: 'questionSet',
    icon: 'fi fi-rr-clipboard-list-check',
    accent: 'bg-fuchsia-600',
    preview: 'An objective-aligned test paper with a marking scheme',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 18000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'objectives', label: 'Learning objectives', type: 'textarea', placeholder: 'One per line. Leave blank to derive them from the topic.' },
      { key: 'totalMarks', label: 'Total marks', type: 'number', default: 25 },
    ],
    pushTargets: ['questionBank'],
    basePrompt: `Build an assessment on "{{topic}}" ({{subject}}, {{class}}) worth {{totalMarks}} marks.
Learning objectives to assess:
{{objectives}}
(If no objectives are given above, derive 3-4 from the TN Board curriculum for this topic and assess those.)
Requirements:
- Every question must map to one of the objectives — name the objective it tests at the start of its explanation.
- Cover recall, understanding and application; do not test the same objective twice at the same level.
- marks must sum to exactly {{totalMarks}}.
- instructions: real exam instructions (time, sections, what is compulsory).`,
  },
  {
    key: 'answerkey',
    command: '/answer-key',
    label: 'Answer Key',
    description: 'Create an answer key for these questions.',
    group: 'ASSESS',
    outputKind: 'questionSet',
    icon: 'fi fi-rr-key',
    accent: 'bg-purple-500',
    preview: 'A marking scheme with model answers and step-wise mark allocation',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 18000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'sourceQuestions', label: 'Paste the questions', type: 'textarea', placeholder: 'One question per line, numbered if possible.', hint: 'Required — the key is built from exactly these questions.' },
    ],
    pushTargets: [],
    basePrompt: `Write the answer key and marking scheme for the following questions on "{{topic}}" ({{subject}}, {{class}}):

{{sourceQuestions}}

Requirements:
- Answer exactly these questions, in this order, keeping their numbering. Do not add or drop any.
- If a question is ambiguous, answer the most reasonable reading and say so in its explanation.
- answer: the model answer a full-marks student would write.
- explanation: the step-wise mark split ("1 mark for stating the formula, 1 mark for substitution, 1 for the final value") plus what to accept as an alternative correct answer.
- Set text to the original question and marks to the marks you allocate.`,
  },

  // ── ENGAGE ───────────────────────────────────────────────────────────────
  {
    key: 'discussion',
    command: '/discussion',
    label: 'Discussion Questions',
    description: 'Create classroom discussion questions.',
    group: 'ENGAGE',
    outputKind: 'cardList',
    icon: 'fi fi-rr-comments',
    accent: 'bg-lime-600',
    preview: 'Open questions that actually start a conversation, with follow-up prompts',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 9000,
    defaultClassRange: [3, 12],
    inputs: [COUNT_INPUT(10, 'Number of discussion questions')],
    pushTargets: [],
    basePrompt: `Write {{count}} discussion questions on "{{topic}}" ({{subject}}, {{class}}).
Requirements:
- Every question must be genuinely open — if it has one right answer, it does not belong here.
- Card title is the question itself. Card body gives two follow-up probes ("If a student says X, ask...") and the point the discussion should reach.
- Order from easy-to-answer to challenging, so quiet students can enter early.
- tag: "Opener", "Build", "Challenge", or "Debate".`,
  },
  {
    key: 'engage',
    command: '/engage',
    label: 'Engagement Ideas',
    description: 'Give creative ways to make this lesson more engaging.',
    group: 'ENGAGE',
    outputKind: 'cardList',
    icon: 'fi fi-rr-rocket-lunch',
    accent: 'bg-orange-500',
    preview: 'Quick hooks, energisers and attention resets you can drop into the period',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 9000,
    defaultClassRange: [1, 12],
    inputs: [COUNT_INPUT(8, 'Number of ideas')],
    pushTargets: [],
    basePrompt: `Give {{count}} ways to make a lesson on "{{topic}}" ({{subject}}, {{class}}) more engaging.
Requirements:
- Each must take under 5 minutes and need nothing but chalk, the board, and the students.
- Body must say exactly what the teacher does and says — not "use gamification" but the actual move.
- Cover a spread: an opening hook, a mid-lesson energiser, a physical/movement idea, a storytelling idea, a competition, and a closing hook.
- tag: when in the period to use it ("Start", "Middle", "End", "Anytime").`,
  },

  // ── DIFFERENTIATE ────────────────────────────────────────────────────────
  {
    key: 'differentiate',
    command: '/differentiate',
    label: 'Differentiate Lesson',
    description: 'Adapt this lesson for different learning levels.',
    group: 'DIFFERENTIATE',
    outputKind: 'matrix',
    icon: 'fi fi-rr-users-alt',
    accent: 'bg-sky-600',
    preview: 'A three-tier plan — support, core and stretch — across every part of the lesson',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 12000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'tiers', label: 'Levels', type: 'select', options: ['Support / Core / Stretch', 'Below grade / At grade / Above grade', 'Beginner / Developing / Confident / Advanced'], default: 'Support / Core / Stretch' },
    ],
    pushTargets: [],
    basePrompt: `Build a differentiation plan for teaching "{{topic}}" ({{subject}}, {{class}}) to a mixed-ability class. Levels: {{tiers}}.
Requirements:
- columns are exactly the levels named in {{tiers}}, weakest first.
- rows must be: "Learning goal", "How it is taught", "Task given", "Support provided", "Success looks like", "If they finish early".
- Every cell must be a concrete instruction the teacher can act on today. No cell may say "provide extra support" — say what the support is.
- The whole class must stay on the same topic — differentiate the route, not the destination.
- legend: 3 notes on grouping, on moving students between tiers, and on keeping tiers invisible to students.`,
  },
  {
    key: 'rubric',
    command: '/rubric',
    label: 'Grading Rubric',
    description: 'Create a simple grading rubric for this assignment.',
    group: 'DIFFERENTIATE',
    outputKind: 'matrix',
    icon: 'fi fi-rr-ruler-combined',
    accent: 'bg-indigo-600',
    preview: 'A criteria x bands rubric with observable descriptors and mark weights',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 10000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'task', label: 'The assignment', type: 'textarea', placeholder: 'e.g. A 300-word essay on water conservation' },
      { key: 'totalMarks', label: 'Total marks', type: 'number', default: 20 },
    ],
    pushTargets: [],
    basePrompt: `Create a grading rubric for this assignment on "{{topic}}" ({{subject}}, {{class}}):
{{task}}
(If no assignment is described above, assume a standard written assignment on this topic.)
Total marks: {{totalMarks}}.
Requirements:
- columns: 4 bands, weakest first — "Needs Support", "Developing", "Proficient", "Excellent".
- rows: 4-5 criteria. Set weight to the marks for that criterion; the weights must sum to {{totalMarks}}.
- Cells must be observable and countable ("2 or fewer supporting examples"), never judgemental adjectives ("poor effort").
- Adjacent bands must be clearly distinguishable — a second teacher marking with this rubric should land on the same band.
- legend: how to handle work that sits between two bands.`,
  },

  // ── FEEDBACK ─────────────────────────────────────────────────────────────
  {
    key: 'feedback',
    command: '/feedback',
    label: 'Student Feedback',
    description: "Give constructive feedback on this student's answer.",
    group: 'FEEDBACK',
    outputKind: 'document',
    icon: 'fi fi-rr-comment-check',
    accent: 'bg-violet-600',
    preview: 'Specific, kind, actionable feedback plus a suggested mark',
    defaultModel: 'gemini-2.5-flash',
    defaultMaxTokens: 10000,
    defaultClassRange: [1, 12],
    inputs: [
      { key: 'question', label: 'The question asked', type: 'textarea', placeholder: 'What was the student asked?' },
      { key: 'studentAnswer', label: "The student's answer", type: 'textarea', placeholder: 'Paste or type the answer as written.', hint: 'Required.' },
      { key: 'totalMarks', label: 'Marks available', type: 'number', default: 5 },
    ],
    pushTargets: [],
    basePrompt: `Give feedback on a student's answer. Topic: "{{topic}}" ({{subject}}, {{class}}).

Question asked:
{{question}}

Student's answer, exactly as written:
{{studentAnswer}}

Marks available: {{totalMarks}}.

Requirements:
- sections: "What Went Well" (specific — quote the student's own words), "What's Missing or Wrong", "How To Improve It" (2-3 concrete next steps the student can act on), "Suggested Mark" (state the mark out of {{totalMarks}} and justify it against what was written).
- Judge only what the student actually wrote. Do not invent content they did not write, and do not credit them for it.
- Address the student directly as "you". Be warm but honest — do not soften a wrong answer into a right one.
- teacherNotes: what this answer reveals about the student's understanding, and what to reteach.`,
  },
];

export const SKILL_BY_KEY: Record<string, AiSkillDef> = AI_SKILLS.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {} as Record<string, AiSkillDef>);

// ---------------------------------------------------------------------------
// Prompt composition
// ---------------------------------------------------------------------------

export interface PromptContext {
  className: string;
  grade: number | string;
  subject: string;
  topic: string;
  unit?: string;
  language?: string;
  /** Syllabus / textbook extract, already trimmed by the caller. */
  context?: string;
  /** Values for the skill's declared SkillInputs. */
  extras?: Record<string, string | number | undefined>;
  /** Prior output being refined, plus the teacher's refine instruction. */
  refineOf?: unknown;
  refineInstruction?: string;
}

export interface ResolvedSkillConfig {
  basePrompt: string;
  packDirective: string;
  model: string;
  maxTokens: number;
}

function fillPlaceholders(template: string, ctx: PromptContext, def: AiSkillDef): string {
  const values: Record<string, string> = {
    class: String(ctx.className || `Class ${ctx.grade}`),
    grade: String(ctx.grade ?? ''),
    subject: String(ctx.subject || ''),
    topic: String(ctx.topic || ''),
    unit: String(ctx.unit || ''),
  };
  for (const input of def.inputs) {
    const raw = ctx.extras?.[input.key];
    const value = raw === undefined || raw === null || String(raw).trim() === ''
      ? (input.default !== undefined ? String(input.default) : '')
      : String(raw);
    values[input.key] = value;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  );
}

/**
 * Compose the final prompt: pack persona -> class context -> skill brief ->
 * pack structural directive -> language rule -> refine instruction.
 *
 * `overrides.basePrompt` / `overrides.packDirective` come from AiSkillConfig so
 * a superadmin can retune a skill without a deploy.
 */
export function renderPrompt(
  def: AiSkillDef,
  pack: SubjectPack,
  ctx: PromptContext,
  overrides?: { basePrompt?: string; packDirective?: string }
): string {
  const p = SUBJECT_PACKS[pack] || SUBJECT_PACKS.GENERAL;
  const isTamil = (ctx.language || 'english').toLowerCase() === 'tamil';

  const brief = fillPlaceholders(overrides?.basePrompt || def.basePrompt, ctx, def);
  const packDirective = fillPlaceholders(
    overrides?.packDirective || p.kindHints[def.outputKind],
    ctx,
    def
  );

  const parts: string[] = [
    `You are ${p.persona}.`,
    `TEACHING METHOD YOU MUST FOLLOW:\n${p.method}`,
    `EXAMPLES POLICY:\n${p.examplePolicy}`,
    `CLASS CONTEXT:\n- Board: Tamil Nadu State Board\n- Class: ${ctx.className || ctx.grade}\n- Subject: ${ctx.subject}${ctx.unit ? `\n- Unit: ${ctx.unit}` : ''}\n- Topic: ${ctx.topic}`,
    `TASK (${def.command} — ${def.label}):\n${brief}`,
    `SUBJECT-SPECIFIC STRUCTURE (${p.label}) — this overrides any generic structure above:\n${packDirective}`,
  ];

  if (ctx.context && ctx.context.trim()) {
    parts.push(
      `SYLLABUS / TEXTBOOK EXTRACT — use only the parts about "${ctx.topic}" and ignore other chapters. If "${ctx.topic}" is not covered here, fall back to the standard TN Board curriculum:\n${ctx.context.trim()}`
    );
  }

  parts.push(
    isTamil
      ? `LANGUAGE: Write all student-facing content in natural classroom Tamil. Keep technical terms in English inside brackets after the Tamil term on first use. Field names in the JSON stay in English.`
      : `LANGUAGE: Write in clear English suited to ${ctx.className || `Class ${ctx.grade}`}. Give the Tamil equivalent for key technical terms where a tamil field exists.`
  );

  if (ctx.refineInstruction && ctx.refineOf) {
    parts.push(
      `REVISION PASS — you previously produced the JSON below. Produce a corrected version that applies this instruction: "${ctx.refineInstruction}". Keep everything that was already good; change only what the instruction requires. Return the full object again, not a diff.\n\nPREVIOUS OUTPUT:\n${JSON.stringify(
        ctx.refineOf
      ).slice(0, 24000)}`
    );
  }

  parts.push(
    `OUTPUT RULES:\n- Return JSON matching the provided schema exactly. Populate every required field.\n- All content must be specifically about "${ctx.topic}". No placeholders, no "e.g. insert example here", no lorem text.\n- Every fact, date, formula, constant and code output must be correct. If you are unsure of a value, use a form that is definitely true rather than inventing a precise-sounding one.`
  );

  return parts.join('\n\n');
}

/** Grade number from a className like "Class 10", "10", "Grade 9 B". */
export function gradeFromClassName(className?: string | null): number {
  const m = String(className || '').match(/\d{1,2}/);
  const n = m ? parseInt(m[0], 10) : NaN;
  return Number.isFinite(n) ? n : 0;
}
