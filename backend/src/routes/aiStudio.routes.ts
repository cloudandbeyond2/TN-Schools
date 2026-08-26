import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AiSkillConfig, PlatformSetting } from '../models/mongo';
import { authenticate } from '../middleware/auth.middleware';
import { callGemini } from './ai.routes';
import {
  AI_SKILLS,
  SKILL_BY_KEY,
  SCHEMAS,
  SUBJECT_PACKS,
  SKILL_GROUPS,
  subjectToPack,
  renderPrompt,
  gradeFromClassName,
  sanitizePayload,
  AiSkillDef,
  SubjectPack,
  PromptContext,
} from '../constants/aiSkills';

const router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Config resolution — registry defaults merged with the superadmin overrides
// stored in AiSkillConfig. A missing doc means "defaults".
// ---------------------------------------------------------------------------

export interface EffectiveSkill {
  def: AiSkillDef;
  isEnabled: boolean;
  classMin: number;
  classMax: number;
  model: string;
  maxTokens: number;
  promptOverride?: string;
  packOverrides: Record<string, string>;
  updatedBy?: string;
  updatedAt?: Date;
}

function packOverridesToObject(value: unknown): Record<string, string> {
  if (value instanceof Map) return Object.fromEntries(value);
  if (value && typeof value === 'object') return value as Record<string, string>;
  return {};
}

function merge(def: AiSkillDef, doc: any): EffectiveSkill {
  return {
    def,
    isEnabled: doc?.isEnabled !== undefined ? doc.isEnabled !== false : true,
    classMin: Number.isFinite(doc?.classMin) ? doc.classMin : def.defaultClassRange[0],
    classMax: Number.isFinite(doc?.classMax) ? doc.classMax : def.defaultClassRange[1],
    model: doc?.modelId || def.defaultModel,
    maxTokens: Number.isFinite(doc?.maxTokens) ? doc.maxTokens : def.defaultMaxTokens,
    promptOverride: doc?.promptOverride || undefined,
    packOverrides: packOverridesToObject(doc?.packOverrides),
    updatedBy: doc?.updatedBy,
    updatedAt: doc?.updatedAt,
  };
}

/** Load every skill with its overrides applied. Exported for the superadmin router. */
export async function loadEffectiveSkills(): Promise<EffectiveSkill[]> {
  const docs = await AiSkillConfig.find();
  const byKey = new Map<string, any>(docs.map((d: any) => [d.key, d]));
  return AI_SKILLS.map((def) => merge(def, byKey.get(def.key)));
}

export async function loadEffectiveSkill(key: string): Promise<EffectiveSkill | null> {
  const def = SKILL_BY_KEY[key];
  if (!def) return null;
  const doc = await AiSkillConfig.findOne({ key });
  return merge(def, doc);
}

/** The global "Enable AI Features" switch already gates the studio routes client-side; enforce it here too. */
async function aiFeaturesEnabled(): Promise<boolean> {
  const settings = await PlatformSetting.findOne({ key: 'global' });
  return settings ? settings.enableAiFeatures !== false : true;
}

// The client-safe projection — prompts never leave the server.
function toClientSkill(s: EffectiveSkill) {
  return {
    key: s.def.key,
    command: s.def.command,
    label: s.def.label,
    description: s.def.description,
    group: s.def.group,
    outputKind: s.def.outputKind,
    icon: s.def.icon,
    accent: s.def.accent,
    preview: s.def.preview,
    inputs: s.def.inputs,
    pushTargets: s.def.pushTargets,
    isEnabled: s.isEnabled,
    classMin: s.classMin,
    classMax: s.classMax,
  };
}

// ---------------------------------------------------------------------------
// GET /api/ai-studio/skills — what this teacher may run
// ---------------------------------------------------------------------------
router.get('/skills', async (_req: Request, res: Response) => {
  try {
    const [skills, aiOn] = await Promise.all([loadEffectiveSkills(), aiFeaturesEnabled()]);
    res.json({
      success: true,
      data: {
        aiEnabled: aiOn,
        groups: Object.values(SKILL_GROUPS),
        packs: Object.values(SUBJECT_PACKS).map((p) => ({
          key: p.key,
          label: p.label,
          icon: p.icon,
          method: p.method,
        })),
        skills: skills.map(toClientSkill),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ai-studio/generate
// ---------------------------------------------------------------------------
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      skillKey,
      subject,
      subjectPack,
      className,
      section,
      unit,
      topic,
      language,
      context,
      extras,
      refineOf,
      refineInstruction,
    } = req.body || {};

    if (!skillKey || !SKILL_BY_KEY[skillKey]) {
      return res.status(400).json({ success: false, error: 'Unknown skillKey' });
    }
    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ success: false, error: 'topic is required' });
    }

    if (!(await aiFeaturesEnabled())) {
      return res
        .status(403)
        .json({ success: false, error: 'AI features are turned off for this platform.' });
    }

    const skill = await loadEffectiveSkill(skillKey);
    if (!skill) return res.status(404).json({ success: false, error: 'Skill not found' });

    // Server-side enforcement — the client greys these out, but never trust that.
    if (!skill.isEnabled) {
      return res.status(403).json({
        success: false,
        error: `"${skill.def.command}" has been disabled by your administrator.`,
      });
    }

    const grade = gradeFromClassName(className);
    if (grade && (grade < skill.classMin || grade > skill.classMax)) {
      return res.status(403).json({
        success: false,
        error: `"${skill.def.command}" is only available for classes ${skill.classMin}–${skill.classMax}.`,
      });
    }

    // Required inputs declared by the skill (e.g. /feedback needs the answer).
    for (const input of skill.def.inputs) {
      if (input.hint === 'Required.' || input.hint?.startsWith('Required')) {
        const v = extras?.[input.key];
        if (v === undefined || String(v).trim() === '') {
          return res
            .status(400)
            .json({ success: false, error: `"${input.label}" is required for ${skill.def.command}.` });
        }
      }
    }

    const pack: SubjectPack =
      subjectPack && SUBJECT_PACKS[subjectPack as SubjectPack]
        ? (subjectPack as SubjectPack)
        : subjectToPack(subject);

    const ctx: PromptContext = {
      className: className || `Class ${grade || 10}`,
      grade: grade || 10,
      subject: subject || SUBJECT_PACKS[pack].label,
      topic: String(topic).trim(),
      unit,
      language: language || 'english',
      context: typeof context === 'string' ? context.slice(0, 15000) : undefined,
      extras,
      refineOf,
      refineInstruction,
    };

    const prompt = renderPrompt(skill.def, pack, ctx, {
      basePrompt: skill.promptOverride,
      packDirective: skill.packOverrides[pack],
    });

    const raw = await callGemini(
      prompt,
      true,
      SCHEMAS[skill.def.outputKind],
      skill.maxTokens,
      120000,
      undefined,
      undefined,
      skill.model
    );
    // Free-text icon fields can come back as names the font does not ship.
    const payload = sanitizePayload(skill.def.outputKind, raw);

    res.json({
      success: true,
      data: {
        skillKey: skill.def.key,
        outputKind: skill.def.outputKind,
        subjectPack: pack,
        subject: ctx.subject,
        className: ctx.className,
        section: section || null,
        topic: ctx.topic,
        language: ctx.language,
        model: skill.model,
        payload,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ---------------------------------------------------------------------------
// Library CRUD — always scoped to the caller's school + teacher id
// ---------------------------------------------------------------------------

function scope(req: Request) {
  const schoolId = (req.query.schoolId as string) || req.user?.schoolId || null;
  const teacherId = (req.query.teacherId as string) || req.user?.id || null;
  return { schoolId, teacherId };
}

router.get('/content', async (req: Request, res: Response) => {
  try {
    const { schoolId, teacherId } = scope(req);
    const { skillKey, group, className, subject, q } = req.query;

    const groupKeys =
      group && typeof group === 'string'
        ? AI_SKILLS.filter((s) => s.group === group.toUpperCase()).map((s) => s.key)
        : null;

    const items = await prisma.aiContent.findMany({
      where: {
        ...(teacherId ? { teacherId } : {}),
        ...(schoolId ? { schoolId } : {}),
        ...(skillKey ? { skillKey: String(skillKey) } : {}),
        ...(groupKeys ? { skillKey: { in: groupKeys } } : {}),
        ...(className ? { className: String(className) } : {}),
        ...(subject ? { subject: String(subject) } : {}),
        ...(q ? { OR: [
          { title: { contains: String(q), mode: 'insensitive' as const } },
          { topic: { contains: String(q), mode: 'insensitive' as const } },
        ] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.get('/content/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.aiContent.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    if (req.user?.role !== 'SUPERADMIN' && item.teacherId && item.teacherId !== req.user?.id) {
      return res.status(403).json({ success: false, error: 'Not your content' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.post('/content', async (req: Request, res: Response) => {
  try {
    const {
      skillKey, outputKind, subjectPack, subject, className, section, topic,
      title, language, payload, schoolId, teacherId, classRoomId,
    } = req.body || {};

    if (!skillKey || !payload) {
      return res.status(400).json({ success: false, error: 'skillKey and payload are required' });
    }

    const def = SKILL_BY_KEY[skillKey];
    const created = await prisma.aiContent.create({
      data: {
        skillKey,
        outputKind: outputKind || def?.outputKind || 'document',
        subjectPack: subjectPack || 'GENERAL',
        subject: subject || '',
        className: className || '',
        section: section || null,
        topic: topic || '',
        title: title || payload?.title || topic || def?.label || 'Untitled',
        language: language || 'english',
        payload,
        schoolId: schoolId || req.user?.schoolId || null,
        teacherId: teacherId || req.user?.id || null,
        classRoomId: classRoomId || null,
      },
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.put('/content/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aiContent.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    if (req.user?.role !== 'SUPERADMIN' && existing.teacherId && existing.teacherId !== req.user?.id) {
      return res.status(403).json({ success: false, error: 'Not your content' });
    }
    const { title, payload } = req.body || {};
    const updated = await prisma.aiContent.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(payload !== undefined ? { payload } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

router.delete('/content/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aiContent.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    if (req.user?.role !== 'SUPERADMIN' && existing.teacherId && existing.teacherId !== req.user?.id) {
      return res.status(403).json({ success: false, error: 'Not your content' });
    }
    await prisma.aiContent.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/ai-studio/content/:id/publish — mirrors PUT /api/teacher/lessons/:id/publish
router.put('/content/:id/publish', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aiContent.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    if (req.user?.role !== 'SUPERADMIN' && existing.teacherId && existing.teacherId !== req.user?.id) {
      return res.status(403).json({ success: false, error: 'Not your content' });
    }
    const isPublished = req.body?.isPublished !== false;
    const updated = await prisma.aiContent.update({
      where: { id: req.params.id },
      data: { isPublished, publishedAt: isPublished ? new Date() : null },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ai-studio/content/:id/push — hand the output to an existing feature
// ---------------------------------------------------------------------------
router.post('/content/:id/push', async (req: Request, res: Response) => {
  try {
    const { target } = req.body || {};
    const item = await prisma.aiContent.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    if (req.user?.role !== 'SUPERADMIN' && item.teacherId && item.teacherId !== req.user?.id) {
      return res.status(403).json({ success: false, error: 'Not your content' });
    }

    const def = SKILL_BY_KEY[item.skillKey];
    if (!def || !def.pushTargets.includes(target)) {
      return res.status(400).json({
        success: false,
        error: `${def?.command || item.skillKey} cannot be pushed to "${target}".`,
      });
    }

    const payload = item.payload as any;

    if (target === 'questionBank') {
      const questions: any[] = Array.isArray(payload?.questions) ? payload.questions : [];
      if (questions.length === 0) {
        return res.status(400).json({ success: false, error: 'No questions in this content.' });
      }
      await prisma.question.createMany({
        data: questions.map((q) => ({
          grade: item.className || '',
          subject: item.subject || '',
          topic: item.topic || '',
          difficulty: String(q.difficulty || 'Medium').toLowerCase(),
          type: q.type || 'MCQ',
          text: q.text || '',
          options: Array.isArray(q.options) ? q.options : [],
          answer: q.answer || '',
          marks: Number.isFinite(q.marks) ? q.marks : 1,
          schoolId: item.schoolId,
          teacherId: item.teacherId,
        })),
      });
      return res.json({ success: true, pushed: questions.length, target });
    }

    if (target === 'lessonPlan') {
      const created = await prisma.lessonPlan.create({
        data: {
          syllabus: 'Tamil Nadu State Board',
          grade: item.className || '',
          subject: item.subject || '',
          topic: item.topic || '',
          duration:
            (Array.isArray(payload?.sections)
              ? `${payload.sections.reduce((n: number, s: any) => n + (Number(s?.durationMins) || 0), 0)} minutes`
              : '') || '45 minutes',
          planData: payload,
          schoolId: item.schoolId,
          teacherId: item.teacherId,
          classRoomId: item.classRoomId,
          className: item.className,
          section: item.section,
        },
      });
      return res.json({ success: true, target, lessonPlanId: created.id });
    }

    if (target === 'homework') {
      const sections: any[] = Array.isArray(payload?.sections) ? payload.sections : [];
      const description = sections
        .map((s) => {
          const items = Array.isArray(s.items) ? s.items : [];
          return `${s.heading}\n${items.map((i: any) => `${i.number}. ${i.prompt}`).join('\n')}`;
        })
        .join('\n\n');
      const due = new Date();
      due.setDate(due.getDate() + 3);
      const created = await prisma.homework.create({
        data: {
          title: item.title,
          className: item.className || '',
          dueDate: due.toISOString().slice(0, 10),
          description: description || payload?.instructions || item.title,
          subject: item.subject || null,
          schoolId: item.schoolId,
          teacherId: item.teacherId,
          classRoomId: item.classRoomId,
        },
      });
      return res.json({ success: true, target, homeworkId: created.id });
    }

    if (target === 'smartClass') {
      // Publishing is what Smart Class reads; no separate copy is needed.
      const updated = await prisma.aiContent.update({
        where: { id: item.id },
        data: { isPublished: true, publishedAt: new Date() },
      });
      return res.json({ success: true, target, data: updated });
    }

    return res.status(400).json({ success: false, error: 'Unsupported target' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ai-studio/published — what students/Smart Class can read
// ---------------------------------------------------------------------------
router.get('/published', async (req: Request, res: Response) => {
  try {
    // Accept either `class` (what the student session carries, e.g. "10") or
    // `className` (what the teacher saved, e.g. "Class 10"). Grade is compared
    // numerically so the two formats match.
    const { schoolId, className, section, subject } = req.query;
    const classParam = (req.query.class as string) ?? (className as string) ?? '';
    const grade = gradeFromClassName(classParam);

    const items = await prisma.aiContent.findMany({
      where: {
        isPublished: true,
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(subject ? { subject: String(subject) } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: 300,
    });

    const filtered = items.filter((item) => {
      if (grade && gradeFromClassName(item.className) !== grade) return false;
      // Content saved without a section is for the whole class, so it is
      // visible to every section — only a mismatched section is excluded.
      if (section && item.section && item.section !== String(section)) return false;
      return true;
    });

    res.json({ success: true, count: filtered.length, data: filtered.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
