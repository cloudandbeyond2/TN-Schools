import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { randomUUID } from 'crypto';
import {
  HSC_GROUPS,
  STREAM_LABELS,
  StreamCategory,
  getGroup,
  groupSubjectsWithEquivalents,
} from '../constants/hscGroups';

const router = Router();

// Stream affinity for exams open to all groups (sorts them toward
// "recommended" for students of the matching stream).
const EXAM_STREAM_AFFINITY: Array<{ match: RegExp; streams: StreamCategory[] }> = [
  { match: /ipmat|integrated programme in management/i, streams: ['COMMERCE'] },
  { match: /clat|ailet|law/i, streams: ['ARTS', 'COMMERCE'] },
];

// ─── GET /api/competitive-exams?schoolId=&category=&status= ──────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, category, status, search } = req.query;

    const where: any = {};
    if (schoolId) where.schoolId = String(schoolId);
    if (category) where.category = String(category);
    if (status)   where.status   = String(status);
    if (search) {
      where.OR = [
        { examName:    { contains: String(search), mode: 'insensitive' } },
        { conductedBy: { contains: String(search), mode: 'insensitive' } },
        { eligibility: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const data = await prisma.competitiveExam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data, count: data.length });
  } catch (err: any) {
    console.error('[GET /api/competitive-exams]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch exams' });
  }
});

// ─── GET /api/competitive-exams/groups?streamCategory= ───────────
// TN HSC group master data (DGE Annexure I). Registered before /:id.
router.get('/groups', async (req: Request, res: Response) => {
  try {
    const { streamCategory } = req.query;
    const data = streamCategory
      ? HSC_GROUPS.filter((g) => g.streamCategory === String(streamCategory))
      : HSC_GROUPS;
    return res.json({ success: true, data, streamLabels: STREAM_LABELS });
  } catch (err: any) {
    console.error('[GET /api/competitive-exams/groups]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch groups' });
  }
});

// ─── GET /api/competitive-exams/recommendations?group=2503&class=12
// Splits the exam catalog into "recommended for this HSC group" and
// "others", each with a human-readable reason.
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const groupCode = req.query.group ? String(req.query.group) : '';
    const group = getGroup(groupCode);

    const exams = await prisma.competitiveExam.findMany({ orderBy: [{ examDate: 'asc' }, { examName: 'asc' }] });

    if (!group) {
      return res.json({
        success: true,
        data: {
          group: null,
          groupNotSet: true,
          recommended: [],
          others: exams.map((exam) => ({ exam, reason: 'Set your HSC group to get personalised recommendations' })),
        },
      });
    }

    const subjects = groupSubjectsWithEquivalents(group);
    const recommended: any[] = [];
    const others: any[] = [];

    for (const exam of exams) {
      const applicableGroups: string[] = (exam as any).applicableGroups || [];
      const requiredSubjects: string[] = (exam as any).requiredSubjects || [];
      const affinity = EXAM_STREAM_AFFINITY.find((a) => a.match.test(exam.examName));

      if (applicableGroups.length > 0) {
        if (applicableGroups.includes(group.code)) {
          recommended.push({
            exam,
            reason: requiredSubjects.length
              ? `Your group includes ${requiredSubjects.join(', ')} — you meet the subject requirement`
              : `Group ${group.code} is eligible for this exam`,
          });
        } else {
          others.push({ exam, reason: `Not open to group ${group.code} (${requiredSubjects.length ? `requires ${requiredSubjects.join(', ')}` : 'restricted group list'})` });
        }
      } else if (requiredSubjects.length > 0) {
        const missing = requiredSubjects.filter((s) => !subjects.has(s));
        if (missing.length === 0) {
          recommended.push({ exam, reason: `Your group includes ${requiredSubjects.join(', ')} — you meet the subject requirement` });
        } else {
          others.push({ exam, reason: `Requires ${missing.join(', ')}, which is not in your group` });
        }
      } else if (affinity && affinity.streams.includes(group.streamCategory)) {
        recommended.push({ exam, reason: `Well suited for ${STREAM_LABELS[group.streamCategory]} students` });
      } else {
        others.push({ exam, reason: 'Open to all groups' });
      }
    }

    // Open-to-all exams first inside "others"
    others.sort((a, b) => (a.reason === 'Open to all groups' ? -1 : 0) - (b.reason === 'Open to all groups' ? -1 : 0));

    return res.json({
      success: true,
      data: {
        group: {
          code: group.code,
          name: group.name,
          subjects: group.partIIISubjects,
          streamCategory: group.streamCategory,
          streamLabel: STREAM_LABELS[group.streamCategory],
        },
        groupNotSet: false,
        recommended,
        others,
      },
    });
  } catch (err: any) {
    console.error('[GET /api/competitive-exams/recommendations]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to compute recommendations' });
  }
});

// ─── GET /api/competitive-exams/:id ──────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.competitiveExam.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: 'Exam not found' });
    return res.json({ success: true, data: item });
  } catch (err: any) {
    console.error('[GET /api/competitive-exams/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch exam' });
  }
});

// ─── POST /api/competitive-exams ─────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      examName, category, conductedBy, registrationDeadline, examDate,
      status, eligibility, website, studentsEnrolled, studentsCleared,
      schoolId, teacherId,
    } = req.body;

    if (!examName || !category || !conductedBy || !registrationDeadline || !examDate) {
      return res.status(400).json({
        success: false,
        error: 'examName, category, conductedBy, registrationDeadline, and examDate are required',
      });
    }

    const id  = randomUUID();
    const now = new Date();

    const rows: any[] = await prisma.$queryRaw`
      INSERT INTO "CompetitiveExam"
        (id, "examName", category, "conductedBy", "registrationDeadline", "examDate",
         status, eligibility, website, "studentsEnrolled", "studentsCleared",
         "schoolId", "teacherId", "createdAt", "updatedAt")
      VALUES
        (${id}, ${examName}, ${category}, ${conductedBy},
         ${registrationDeadline}, ${examDate},
         ${status || 'Upcoming'}, ${eligibility || 'N/A'},
         ${website || null}, ${Number(studentsEnrolled) || 0},
         ${Number(studentsCleared) || 0}, ${schoolId || null}, ${teacherId || null},
         ${now}, ${now})
      RETURNING *
    `;

    return res.status(201).json({
      success: true,
      data: rows[0],
      message: `"${examName}" added to Competitive Exams`,
    });
  } catch (err: any) {
    console.error('[POST /api/competitive-exams]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to create exam' });
  }
});

// ─── PUT /api/competitive-exams/:id ──────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.competitiveExam.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Exam not found' });

    const {
      examName, category, conductedBy, registrationDeadline, examDate,
      status, eligibility, website, studentsEnrolled, studentsCleared,
    } = req.body;

    const now = new Date();

    const rows: any[] = await prisma.$queryRaw`
      UPDATE "CompetitiveExam"
      SET
        "examName"             = ${examName             ?? existing.examName},
        category               = ${category             ?? existing.category},
        "conductedBy"          = ${conductedBy          ?? existing.conductedBy},
        "registrationDeadline" = ${registrationDeadline ?? existing.registrationDeadline},
        "examDate"             = ${examDate             ?? existing.examDate},
        status                 = ${status               ?? existing.status},
        eligibility            = ${eligibility          ?? existing.eligibility},
        website                = ${website              ?? existing.website},
        "studentsEnrolled"     = ${studentsEnrolled  !== undefined ? Number(studentsEnrolled)  : existing.studentsEnrolled},
        "studentsCleared"      = ${studentsCleared   !== undefined ? Number(studentsCleared)   : existing.studentsCleared},
        "updatedAt"            = ${now}
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    return res.json({ success: true, data: rows[0], message: `"${existing.examName}" updated` });
  } catch (err: any) {
    console.error('[PUT /api/competitive-exams/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update exam' });
  }
});

// ─── DELETE /api/competitive-exams/:id ───────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.competitiveExam.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Exam not found' });

    await prisma.competitiveExam.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: `"${existing.examName}" deleted` });
  } catch (err: any) {
    console.error('[DELETE /api/competitive-exams/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to delete exam' });
  }
});

export default router;
