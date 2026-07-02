import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { BoardPrep } from '../models/mongo';

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


/* ------------------- GET BOARD PREP DATA ------------------- */
router.get('/:id/board-prep', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const selectedClass = String(req.query.class || "10"); // "9" or "10"

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      }
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    // Find or create BoardPrep in MongoDB
    let prepDoc = await BoardPrep.findOne({ studentId: student.id, class: selectedClass });

    if (!prepDoc) {
      const defaultSyllabus = selectedClass === "9" 
        ? [
            { subject: "Mathematics", completed: 5, totalChapters: 9 },
            { subject: "Science", completed: 12, totalChapters: 17 },
            { subject: "Social Science", completed: 14, totalChapters: 21 },
            { subject: "English", completed: 5, totalChapters: 7 },
            { subject: "Tamil", completed: 8, totalChapters: 9 },
          ]
        : [
            { subject: "Mathematics", completed: 9, totalChapters: 15 },
            { subject: "Science", completed: 18, totalChapters: 22 },
            { subject: "Social Science", completed: 20, totalChapters: 25 },
            { subject: "English", completed: 11, totalChapters: 12 },
            { subject: "Tamil", completed: 9, totalChapters: 10 },
          ];

      const defaultGoalsList = selectedClass === "9"
        ? [
            { task: "Revise Science Ch-2 (Motion) notes", done: true },
            { task: "Complete Algebra Exercise 3.2", done: false },
            { task: "Practice 9th Tamil grammar rules", done: false },
          ]
        : [
            { task: "Read Science Ch-4 (Carbon Compounds)", done: true },
            { task: "Solve 15 Math Trigonometry PYQs", done: false },
            { task: "Take Tamil Public Exam Mini-Mock", done: false },
          ];

      prepDoc = await BoardPrep.create({
        studentId: student.id,
        class: selectedClass,
        syllabusProgress: defaultSyllabus,
        goals: defaultGoalsList
      });
    }

    // Query practice paper marks from PostgreSQL
    const examTypePrefix = selectedClass === "10" ? "Board Prep Mock - " : "Class 9 Practice Paper - ";
    const marks = await prisma.mark.findMany({
      where: {
        studentId: student.id,
        examType: {
          startsWith: examTypePrefix
        }
      }
    });

    res.json({
      success: true,
      data: {
        id: prepDoc._id,
        studentId: prepDoc.studentId,
        class: prepDoc.class,
        syllabusProgress: prepDoc.syllabusProgress,
        goals: prepDoc.goals,
        marks: marks.map((m: any) => ({
          id: m.id,
          subject: m.subject,
          paperName: m.examType.replace(examTypePrefix, ""),
          scored: m.scored,
          maxMarks: m.maxMarks,
          grade: m.grade,
          createdAt: m.createdAt
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching board prep data:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/* ------------------- UPDATE SYLLABUS PROGRESS ------------------- */
router.post('/:id/board-prep/syllabus', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, completed, class: selectedClass } = req.body;

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      }
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const prepDoc = await BoardPrep.findOne({ studentId: student.id, class: selectedClass || "10" });
    if (!prepDoc) return res.status(404).json({ success: false, error: 'Prep document not found' });

    const item = prepDoc.syllabusProgress.find((s: any) => s.subject.toLowerCase() === subject.toLowerCase());
    if (item) {
      item.completed = Math.min(completed, item.totalChapters);
      await prepDoc.save();
    }

    res.json({ success: true, data: prepDoc });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/* ------------------- UPDATE DAILY GOALS ------------------- */
router.post('/:id/board-prep/goals', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { goals, class: selectedClass } = req.body;

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      }
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const prepDoc = await BoardPrep.findOneAndUpdate(
      { studentId: student.id, class: selectedClass || "10" },
      { goals },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: prepDoc });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/* ------------------- SUBMIT PRACTICE PAPER MARK ------------------- */
router.post('/:id/board-prep/submit-paper', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, paperName, scored, maxMarks, class: selectedClass } = req.body;

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      }
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const examTypePrefix = selectedClass === "10" ? "Board Prep Mock - " : "Class 9 Practice Paper - ";
    const examType = `${examTypePrefix}${paperName}`;

    // Determine grade dynamically
    const pct = (scored / (maxMarks || 100)) * 100;
    let grade = "E";
    if (pct >= 90) grade = "A1";
    else if (pct >= 80) grade = "A2";
    else if (pct >= 70) grade = "B1";
    else if (pct >= 60) grade = "B2";
    else if (pct >= 50) grade = "C";
    else if (pct >= 35) grade = "D";

    const newMark = await prisma.mark.create({
      data: {
        studentId: student.id,
        subject,
        examType,
        maxMarks: maxMarks || 100,
        scored,
        grade,
        academicYear: "2024-25"
      }
    });

    res.json({ success: true, data: newMark });
  } catch (err) {
    console.error('Error submitting paper mark:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
