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
    const { schoolId, class: cls, section, userId } = req.query;
    const students = await prisma.student.findMany({
      where: {
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(cls ? { class: String(cls) } : {}),
        ...(section ? { section: String(section) } : {}),
        ...(userId ? { userId: String(userId) } : {}),
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

// GET /api/students/:id/leave — Get leave requests for a student
router.get('/:id/leave', async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      select: { user: { select: { name: true } } }
    });

    const studentName = student?.user?.name;

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        OR: [
          { studentId: req.params.id },
          ...(studentName ? [{ studentName: { contains: studentName, mode: 'insensitive' as any } }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/students/:id/homework — Get homework for a student
router.get('/:id/homework', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findFirst({ 
      where: { 
        OR: [
          { id },
          { userId: id }
        ]
      } 
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const classSection = `${student.class}${student.section}`;

    // Get all homework for this class
    const homeworkList = await prisma.homework.findMany({
      where: { 
        schoolId: student.schoolId, 
        className: { startsWith: classSection } 
      },
      include: {
        submissions: {
          where: { rollNo: student.rollNumber || '' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = homeworkList.map((h: any) => {
      const submission = h.submissions[0];
      return {
        id: h.id,
        title: h.title,
        subject: h.className.split(' - ')[1] || 'General',
        subjectColor: '#2dd4bf', // Mock color or could map by subject
        className: h.className,
        dueDate: h.dueDate,
        status: submission?.status === 'submitted' ? 'submitted' : 'not_submitted',
        description: h.description,
        fullBrief: h.description,
        classLabel: `Class ${classSection}`,
        dueLabel: `Due: ${h.dueDate}`,
        postedLabel: new Date(h.createdAt).toLocaleDateString(),
        teacher: 'Teacher', // could populate if linked
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching student homework:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/students/:id/homework/:homeworkId/submit
router.post('/:id/homework/:homeworkId/submit', async (req: Request, res: Response) => {
  try {
    const { id, homeworkId } = req.params;

    const { answerText } = req.body;

    const student = await prisma.student.findFirst({ 
      where: { 
        OR: [
          { id },
          { userId: id }
        ]
      },
      include: { user: true }
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    // Check if submission already exists
    const existingSubmission = await prisma.homeworkSubmission.findFirst({
      where: {
        homeworkId,
        rollNo: student.rollNumber || ''
      }
    });

    let submission;
    if (existingSubmission) {
      submission = await prisma.homeworkSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          status: 'submitted',
          studentId: student.id,
          answerText,
          date: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        } as any
      });
    } else {
      submission = await prisma.homeworkSubmission.create({
        data: {
          homeworkId,
          rollNo: student.rollNumber || '',
          name: student.user?.name || 'Student',
          status: 'submitted',
          studentId: student.id,
          answerText,
          date: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        } as any
      });
    }

    res.json({ success: true, data: submission });
  } catch (err) {
    console.error('Error submitting homework:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
