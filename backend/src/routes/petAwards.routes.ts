import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireMinRole } from '../middleware/auth.middleware';

const router = Router();

function schoolScope(req: Request) {
  const sId = (req.query.schoolId as string) || req.user?.schoolId;
  return sId ? { schoolId: sId } : {};
}

function stampSchool(req: Request, data: any) {
  if (!data.schoolId) {
    data.schoolId = req.body?.schoolId || req.user?.schoolId || '321654987';
  }
  return data;
}

// GET /api/pet/awards - Fetch awards (Accessible by Parents, Students, HMs, PETs)
router.get('/', async (req: Request, res: Response) => {
  try {
    const awards = await prisma.petAward.findMany({
      where: schoolScope(req),
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: awards });
  } catch (err) {
    console.error('Error fetching PET awards:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Require PET role for creating/updating/deleting awards
router.use(requireMinRole('PET'));

async function dispatchAwardNotification(award: any, isCertificateUpdate: boolean = false) {
  try {
    const studentNameClean = (award.student || '').trim().toLowerCase();
    const studentFirstName = studentNameClean.split(' ')[0];

    const links = await prisma.parentStudentLink.findMany({
      include: {
        parent: true,
        student: { include: { user: true } }
      }
    });

    const targetLinks = links.filter((l) => {
      const sName = (l.student.user?.name || '').trim().toLowerCase();
      const sFirst = sName.split(' ')[0];
      return sFirst.includes(studentFirstName) || studentFirstName.includes(sFirst);
    });

    let targetParentUserIds: string[] = targetLinks
      .map((l) => l.parent.userId)
      .filter((id): id is string => Boolean(id));

    // Fallback: if no link matches, lookup parent users directly
    if (targetParentUserIds.length === 0) {
      const allParents = await prisma.user.findMany({ where: { role: 'PARENT' } });
      targetParentUserIds = allParents.map(p => p.id);
    }

    if (targetParentUserIds.length === 0) return;

    const title = isCertificateUpdate 
      ? `📜 Certificate ${award.certificateIssued ? 'Issued' : 'Updated'}`
      : `🏆 Sports Award: ${award.medal} Medal Victory!`;

    const message = isCertificateUpdate
      ? `Official certificate for ${award.student} (${award.sport} - ${award.event}) is now ${award.certificateIssued ? 'Issued' : 'Pending'}.`
      : `Congratulations! ${award.student} (${award.class || ''}) won ${award.medal} medal in ${award.sport} at ${award.event} (${award.level} level).`;

    const notificationsData = targetParentUserIds.map((userId) => ({
      userId,
      title,
      message,
      type: 'sports',
      read: false
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });
  } catch (err) {
    console.error('Error dispatching award notification:', err);
  }
}

// POST /api/pet/awards - Log a new award
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const data = stampSchool(req, {
      student: body.student,
      class: body.class,
      sport: body.sport,
      event: body.event,
      level: body.level,
      medal: body.medal,
      date: body.date,
      certificateIssued: body.certificateIssued || false,
    });
    
    if (!data.student || !data.sport || !data.event) {
      return res.status(400).json({ success: false, error: 'Student, sport, and event are required' });
    }

    const created = await prisma.petAward.create({ data });
    dispatchAwardNotification(created, false).catch(() => {});
    res.json({ success: true, data: created });
  } catch (err) {
    console.error('Error creating PET award:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/pet/awards/:id - Update an award
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const updated = await prisma.petAward.update({
      where: { id: req.params.id },
      data: {
        student: body.student,
        class: body.class,
        sport: body.sport,
        event: body.event,
        level: body.level,
        medal: body.medal,
        date: body.date,
        certificateIssued: body.certificateIssued,
      },
    });
    dispatchAwardNotification(updated, true).catch(() => {});
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating PET award:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/pet/awards/:id - Delete an award
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.petAward.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting PET award:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
