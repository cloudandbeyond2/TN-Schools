import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// ─── Helper: compute month attendance summary ─────────────────────
function getMonthRange(monthOffset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const end   = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0, 23, 59, 59);
  return { start, end };
}

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/:parentId/children
// Returns all students linked to this parent via ParentStudentLink
// ─────────────────────────────────────────────────────────────────
router.get('/:parentId/children', async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;

    const links = await prisma.parentStudentLink.findMany({
      where: { parentId },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    const children = links.map((l) => ({
      linkId: l.id,
      isPrimary: l.isPrimary,
      studentId: l.student.id,
      name: l.student.user.name,
      class: l.student.class,
      section: l.student.section,
      rollNumber: l.student.rollNumber,
      gender: l.student.gender,
      schoolId: l.student.schoolId,
    }));

    res.json({ success: true, count: children.length, data: children });
  } catch (err) {
    console.error('Error fetching children:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/:parentId/child/:studentId/summary
// Dashboard KPIs: attendance %, avg mark, homework rate, rank in class
// ─────────────────────────────────────────────────────────────────
router.get('/:parentId/child/:studentId/summary', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { name: true } } },
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    // Current month attendance
    const { start, end } = getMonthRange(0);
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId, date: { gte: start, lte: end } },
    });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Overall average mark (latest academic year)
    const marks = await prisma.mark.findMany({ where: { studentId } });
    const avgMark = marks.length > 0
      ? Math.round(marks.reduce((sum, m) => sum + (m.scored / m.maxMarks) * 100, 0) / marks.length)
      : 0;

    // Grade label
    const grade = avgMark >= 90 ? 'A+' : avgMark >= 75 ? 'A' : avgMark >= 60 ? 'B' : avgMark >= 50 ? 'C' : 'D';

    // Homework submission rate
    const allHomework = await prisma.homework.findMany({
      where: { schoolId: student.schoolId, className: `Class ${student.class}${student.section}` },
      include: { submissions: { where: { rollNo: student.rollNumber || '' } } },
    });
    const submittedCount = allHomework.filter(h => h.submissions.some(s => s.status === 'submitted')).length;
    const homeworkRate = allHomework.length > 0 ? Math.round((submittedCount / allHomework.length) * 100) : 0;

    // Class rank (by average mark across all students in same class)
    const classmateIds = await prisma.student.findMany({
      where: { schoolId: student.schoolId, class: student.class, section: student.section },
      select: { id: true },
    });

    const classmateMarks = await Promise.all(
      classmateIds.map(async (s) => {
        const m = await prisma.mark.findMany({ where: { studentId: s.id } });
        const avg = m.length > 0 ? m.reduce((sum, x) => sum + (x.scored / x.maxMarks) * 100, 0) / m.length : 0;
        return { studentId: s.id, avg };
      })
    );
    classmateMarks.sort((a, b) => b.avg - a.avg);
    const rank = classmateMarks.findIndex(s => s.studentId === studentId) + 1;

    res.json({
      success: true,
      data: {
        studentId,
        name: student.user.name,
        class: student.class,
        section: student.section,
        rollNumber: student.rollNumber,
        kpis: {
          attendance: { value: `${attendancePct}%`, raw: attendancePct, sub: 'This month' },
          grade:      { value: grade, raw: avgMark, sub: 'Overall average' },
          homework:   { value: `${homeworkRate}%`, raw: homeworkRate, sub: 'Last 30 days' },
          rank:       { value: rank > 0 ? `#${rank}` : 'N/A', raw: rank, sub: `Out of ${classmateIds.length}` },
        },
      },
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/:parentId/child/:studentId/performance
// Subject-wise marks grouped by exam type
// ─────────────────────────────────────────────────────────────────
router.get('/:parentId/child/:studentId/performance', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    const marks = await prisma.mark.findMany({
      where: {
        studentId,
        ...(academicYear ? { academicYear: String(academicYear) } : {}),
      },
      orderBy: [{ subject: 'asc' }, { examType: 'asc' }],
    });

    // Group by subject
    const bySubject: Record<string, Record<string, number>> = {};
    for (const m of marks) {
      if (!bySubject[m.subject]) bySubject[m.subject] = {};
      bySubject[m.subject][m.examType] = Math.round((m.scored / m.maxMarks) * 100);
    }

    const subjectData = Object.entries(bySubject).map(([subject, examScores]) => ({
      subject,
      ...examScores,
    }));

    // Academic years available
    const years = [...new Set(marks.map(m => m.academicYear))].sort();

    res.json({ success: true, data: { subjects: subjectData, availableYears: years, rawMarks: marks } });
  } catch (err) {
    console.error('Error fetching performance:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/:parentId/child/:studentId/attendance
// Monthly attendance breakdown — last 6 months
// ─────────────────────────────────────────────────────────────────
router.get('/:parentId/child/:studentId/attendance', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const monthCount = 6;

    const monthlyData = await Promise.all(
      Array.from({ length: monthCount }, (_, i) => i).reverse().map(async (offset) => {
        const { start, end } = getMonthRange(offset);
        const records = await prisma.attendance.findMany({
          where: { studentId, date: { gte: start, lte: end } },
        });
        const total   = records.length;
        const present = records.filter(r => r.status === 'PRESENT').length;
        const late    = records.filter(r => r.status === 'LATE').length;
        const absent  = records.filter(r => r.status === 'ABSENT').length;
        const leave   = records.filter(r => r.status === 'LEAVE').length;
        const pct     = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        return {
          month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
          total, present, late, absent, leave, percentage: pct,
        };
      })
    );

    // Recent 30 days detailed
    const { start: start30, end: end30 } = getMonthRange(0);
    const recentRecords = await prisma.attendance.findMany({
      where: { studentId, date: { gte: start30, lte: end30 } },
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      data: {
        monthly: monthlyData,
        recentRecords: recentRecords.map(r => ({
          date: r.date,
          status: r.status,
          method: r.method,
        })),
      },
    });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/:parentId/child/:studentId/homework
// Homework assigned to student's class with submission status
// ─────────────────────────────────────────────────────────────────
router.get('/:parentId/child/:studentId/homework', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const className = `Class ${student.class}${student.section}`;

    const homeworkList = await prisma.homework.findMany({
      where: { schoolId: student.schoolId, className },
      include: {
        submissions: {
          where: { rollNo: student.rollNumber || '' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = homeworkList.map(h => {
      const submission = h.submissions[0];
      return {
        id: h.id,
        title: h.title,
        className: h.className,
        dueDate: h.dueDate,
        status: h.status,
        description: h.description,
        submissionStatus: submission ? submission.status : 'pending',
        score: submission?.score ?? '—',
        submittedDate: submission?.date ?? '—',
      };
    });

    const submitted = data.filter(d => d.submissionStatus === 'submitted').length;
    const pending   = data.filter(d => d.submissionStatus === 'pending').length;
    const rate      = data.length > 0 ? Math.round((submitted / data.length) * 100) : 0;

    res.json({ success: true, data: { homework: data, stats: { submitted, pending, total: data.length, rate } } });
  } catch (err) {
    console.error('Error fetching homework:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/:parentId/child/:studentId/scholarship
// Scholarship applications for the student
// ─────────────────────────────────────────────────────────────────
router.get('/:parentId/child/:studentId/scholarship', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const scholarships = await prisma.scholarship.findMany({
      where: { studentId },
      orderBy: { appliedDate: 'desc' },
    });

    res.json({ success: true, data: scholarships });
  } catch (err) {
    console.error('Error fetching scholarships:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/:parentId/notifications
// All notifications for this parent
// ─────────────────────────────────────────────────────────────────
router.get('/:parentId/notifications', async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;
    const { unreadOnly } = req.query;

    const notifications = await prisma.parentNotification.findMany({
      where: {
        parentId,
        ...(unreadOnly === 'true' ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await prisma.parentNotification.count({ where: { parentId, isRead: false } });

    res.json({ success: true, unreadCount, data: notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/parent/:parentId/notifications/:id/read
// Mark a single notification as read
// ─────────────────────────────────────────────────────────────────
router.put('/:parentId/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.parentNotification.update({ where: { id }, data: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/parent/:parentId/notifications/read-all
// Mark all notifications as read
// ─────────────────────────────────────────────────────────────────
router.put('/:parentId/notifications/read-all', async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;
    await prisma.parentNotification.updateMany({ where: { parentId, isRead: false }, data: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/pta-meetings?schoolId=...
// Upcoming/past PTA meetings for the school
// ─────────────────────────────────────────────────────────────────
router.get('/pta-meetings', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    const meetings = await prisma.pTAMeeting.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { meetingDate: 'asc' },
    });

    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (err) {
    console.error('Error fetching PTA meetings:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/parent/link
// Link a parent (HeadmasterParent) to a student — called from Headmaster portal
// Body: { parentId, studentId, isPrimary? }
// ─────────────────────────────────────────────────────────────────
router.post('/link', async (req: Request, res: Response) => {
  try {
    const { parentId, studentId, isPrimary } = req.body;
    if (!parentId || !studentId) {
      return res.status(400).json({ success: false, error: 'parentId and studentId are required' });
    }

    const link = await prisma.parentStudentLink.upsert({
      where: { parentId_studentId: { parentId, studentId } },
      update: { isPrimary: isPrimary ?? false },
      create: { parentId, studentId, isPrimary: isPrimary ?? false },
    });

    res.status(201).json({ success: true, data: link });
  } catch (err) {
    console.error('Error linking parent to student:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/parent/link
// Unlink a parent from a student
// Body: { parentId, studentId }
// ─────────────────────────────────────────────────────────────────
router.delete('/link', async (req: Request, res: Response) => {
  try {
    const { parentId, studentId } = req.body;
    await prisma.parentStudentLink.delete({
      where: { parentId_studentId: { parentId, studentId } },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/parent/notifications
// Send a notification/alert to the parent of a student
// Body: { studentId, title, message, type? }
// ─────────────────────────────────────────────────────────────────
router.post('/notifications', async (req: Request, res: Response) => {
  try {
    const { studentId, title, message, type } = req.body;
    if (!studentId || !message) {
      return res.status(400).json({ success: false, error: 'studentId and message are required' });
    }

    // Find all parents linked to this student
    const links = await prisma.parentStudentLink.findMany({
      where: { studentId },
      include: { parent: true }
    });

    if (links.length === 0) {
      // Fallback: Check if we can find by parentMobile of the student
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true }
      });
      if (student && student.parentMobile) {
        const parent = await prisma.headmasterParent.findFirst({
          where: { phone: student.parentMobile }
        });
        if (parent) {
          const notif = await prisma.parentNotification.create({
            data: {
              parentId: parent.id,
              studentId,
              type: type || 'ACADEMIC_ALERT',
              title: title || 'Academic Risk Alert',
              message,
            }
          });
          return res.status(201).json({ success: true, data: [notif] });
        }
      }
      return res.status(404).json({ success: false, error: 'No linked parent found for this student.' });
    }

    const createdNotifications = [];
    for (const link of links) {
      const notif = await prisma.parentNotification.create({
        data: {
          parentId: link.parentId,
          studentId,
          type: type || 'ACADEMIC_ALERT',
          title: title || 'Academic Risk Alert',
          message,
        }
      });
      createdNotifications.push(notif);
    }

    return res.status(201).json({ success: true, data: createdNotifications });
  } catch (err) {
    console.error('Error creating parent notification:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
