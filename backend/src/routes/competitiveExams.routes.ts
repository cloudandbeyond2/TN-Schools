import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { randomUUID } from 'crypto';

const router = Router();

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
