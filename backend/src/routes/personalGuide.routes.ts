import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { randomUUID } from 'crypto';

const router = Router();

// ─── GET /api/personal-guide?schoolId=&teacherId= ────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, teacherId, guidanceStatus, search } = req.query;

    const where: any = {};
    if (schoolId)       where.schoolId       = String(schoolId);
    if (teacherId)      where.teacherId      = String(teacherId);
    if (guidanceStatus) where.guidanceStatus = String(guidanceStatus);
    if (search) {
      where.OR = [
        { studentName: { contains: String(search), mode: 'insensitive' } },
        { goal:        { contains: String(search), mode: 'insensitive' } },
        { notes:       { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const data = await prisma.personalGuide.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ success: true, data, count: data.length });
  } catch (err: any) {
    console.error('[GET /api/personal-guide]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch guidance records' });
  }
});

// ─── GET /api/personal-guide/:id ─────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.personalGuide.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: 'Guide record not found' });
    return res.json({ success: true, data: item });
  } catch (err: any) {
    console.error('[GET /api/personal-guide/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch guide record' });
  }
});

// ─── POST /api/personal-guide ─────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      studentName, studentId, class: cls, section,
      academicScore, attendance, strengths, weaknesses,
      goal, parentContact, guidanceStatus, notes,
      lastMeeting, schoolId, teacherId,
    } = req.body;

    if (!studentName || !cls || !section) {
      return res.status(400).json({
        success: false,
        error: 'studentName, class, and section are required',
      });
    }

    const id  = randomUUID();
    const now = new Date();
    const strengthsArr  = Array.isArray(strengths)  ? strengths  : (strengths  ? [strengths]  : []);
    const weaknessesArr = Array.isArray(weaknesses) ? weaknesses : (weaknesses ? [weaknesses] : []);

    const rows: any[] = await prisma.$queryRaw`
      INSERT INTO "PersonalGuide"
        (id, "studentName", "studentId", class, section, "academicScore", attendance,
         strengths, weaknesses, goal, "parentContact", "guidanceStatus", notes,
         "lastMeeting", "schoolId", "teacherId", "createdAt", "updatedAt")
      VALUES
        (${id}, ${studentName}, ${studentId || null}, ${String(cls)}, ${String(section)},
         ${Number(academicScore) || 0}, ${Number(attendance) || 0},
         ${strengthsArr}, ${weaknessesArr},
         ${goal || 'Undecided'}, ${parentContact || 'N/A'},
         ${guidanceStatus || 'On Track'}, ${notes || null},
         ${lastMeeting || ''}, ${schoolId || null}, ${teacherId || null},
         ${now}, ${now})
      RETURNING *
    `;

    return res.status(201).json({
      success: true,
      data: rows[0],
      message: `Guide record for "${studentName}" created`,
    });
  } catch (err: any) {
    console.error('[POST /api/personal-guide]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to create guide record' });
  }
});

// ─── PUT /api/personal-guide/:id ──────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.personalGuide.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Guide record not found' });

    const {
      studentName, class: cls, section, academicScore, attendance,
      strengths, weaknesses, goal, parentContact, guidanceStatus,
      notes, lastMeeting,
    } = req.body;

    const now = new Date();
    const strengthsArr  = strengths  !== undefined ? (Array.isArray(strengths)  ? strengths  : [strengths])  : existing.strengths;
    const weaknessesArr = weaknesses !== undefined ? (Array.isArray(weaknesses) ? weaknesses : [weaknesses]) : existing.weaknesses;

    const rows: any[] = await prisma.$queryRaw`
      UPDATE "PersonalGuide"
      SET
        "studentName"    = ${studentName    ?? existing.studentName},
        class            = ${cls            ?? existing.class},
        section          = ${section        ?? existing.section},
        "academicScore"  = ${academicScore  !== undefined ? Number(academicScore)  : existing.academicScore},
        attendance       = ${attendance     !== undefined ? Number(attendance)     : existing.attendance},
        strengths        = ${strengthsArr},
        weaknesses       = ${weaknessesArr},
        goal             = ${goal           ?? existing.goal},
        "parentContact"  = ${parentContact  ?? existing.parentContact},
        "guidanceStatus" = ${guidanceStatus ?? existing.guidanceStatus},
        notes            = ${notes          ?? existing.notes},
        "lastMeeting"    = ${lastMeeting    ?? existing.lastMeeting},
        "updatedAt"      = ${now}
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    return res.json({ success: true, data: rows[0], message: 'Guide record updated' });
  } catch (err: any) {
    console.error('[PUT /api/personal-guide/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update guide record' });
  }
});

// ─── DELETE /api/personal-guide/:id ───────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.personalGuide.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Guide record not found' });

    await prisma.personalGuide.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: `Guide record for "${existing.studentName}" deleted` });
  } catch (err: any) {
    console.error('[DELETE /api/personal-guide/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to delete guide record' });
  }
});

export default router;
