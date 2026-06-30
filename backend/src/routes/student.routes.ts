import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();


/* ------------------- GET ANNOUNCEMENTS ------------------- */
router.get("/announcements", async (req: Request, res: Response) => {
  try {
    const { schoolId, class: cls, section } = req.query;

    console.log(req.query);

    if (!schoolId || !cls) {
      return res.status(400).json({
        success: false,
        error: "schoolId and class are required",
      });
    }

    const classSection = section
      ? `${cls}${section}`
      : String(cls);

    const target = `Class ${classSection} Parents`;

    console.log("Searching target:", target);

    const announcements = await prisma.announcement.findMany({
      where: {
        schoolId: String(schoolId),
        OR: [
          { target },
          { target: "All Parents taught by me" },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(announcements);

    res.json({
      success: true,
      data: announcements,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: String(err),
    });
  }
});

// GET /api/students/:id — Get student profile with marks & attendance
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        school: { select: { name: true, district: true } },
        marks: { orderBy: { createdAt: 'desc' }, take: 20 },
        attendance: { orderBy: { date: 'desc' }, take: 30 },
        scholarships: true,
      },
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const user = await prisma.user.findUnique({ where: { id: student.userId }, select: { name: true, email: true, mobile: true } });
    const studentWithUser = { ...student, user };

    res.json({ success: true, data: studentWithUser });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/students — List with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, class: cls, section } = req.query;
    const students = await prisma.student.findMany({
      where: {
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(cls ? { class: String(cls) } : {}),
        ...(section ? { section: String(section) } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const userIds = students.map(s => s.userId);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } });
    const userMap = new Map(users.map(u => [u.id, u]));
    const studentsWithUsers = students.map(s => ({ ...s, user: userMap.get(s.userId) || { name: "Student" } }));

    res.json({ success: true, count: students.length, data: studentsWithUsers });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/students — Create student
router.post('/', async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.create({ data: req.body });
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
