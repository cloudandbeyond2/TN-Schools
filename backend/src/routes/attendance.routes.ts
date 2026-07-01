import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendMockSMS, getStudentParents } from '../utils/sms';

const router = Router();

// POST /api/attendance — Bulk mark attendance (supports updates via delete-and-recreate transaction)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { records, notifySMS } = req.body; // Array of { studentId, schoolId, date, status, method }, notifySMS toggle
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, error: 'records array is required' });
    }

    const firstRecord = records[0];
    const dateVal = new Date(firstRecord.date);
    dateVal.setHours(0, 0, 0, 0);
    const nextDate = new Date(dateVal);
    nextDate.setDate(nextDate.getDate() + 1);

    const studentIds = records.map(r => r.studentId);

    // Run delete existing & create new as a single transaction to update attendance
    const result = await prisma.$transaction([
      prisma.attendance.deleteMany({
        where: {
          studentId: { in: studentIds },
          date: { gte: dateVal, lt: nextDate },
        },
      }),
      prisma.attendance.createMany({
        data: records.map(r => ({
          studentId: r.studentId,
          schoolId: r.schoolId,
          date: new Date(r.date),
          status: r.status,
          method: r.method || 'Manual',
        })),
      }),
    ]);

    // Dispatch SMS Notifications for absent students if enabled
    if (notifySMS) {
      const absentRecords = records.filter(r => r.status === 'ABSENT');
      for (const record of absentRecords) {
        try {
          const studentId = record.studentId;
          const parents = await getStudentParents(studentId);
          if (parents.length > 0) {
            const student = await prisma.student.findUnique({
              where: { id: studentId },
              include: { user: true, school: true },
            });
            const studentName = student?.user?.name || 'Your child';
            const schoolName = student?.school?.name || 'School';
            const formattedDate = new Date(record.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const smsMessage = `Attendance Alert: ${studentName} was marked ABSENT at ${schoolName} on ${formattedDate}.`;

            for (const parent of parents) {
              // 1. Trigger SMS
              await sendMockSMS(parent.phone, smsMessage);

              // 2. Log ParentNotification in DB for parent portal alerts feed
              if (parent.id) {
                await prisma.parentNotification.create({
                  data: {
                    parentId: parent.id,
                    studentId: studentId,
                    type: 'ATTENDANCE_ALERT',
                    title: 'Student Absence Notice',
                    message: smsMessage,
                  },
                });
              }
            }
          }
        } catch (smsErr) {
          console.error(`Error sending absence notification for student ${record.studentId}:`, smsErr);
        }
      }
    }

    res.status(201).json({ success: true, created: result[1].count });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/attendance/class-date — Load saved attendance for a class on a specific date
router.get('/class-date', async (req: Request, res: Response) => {
  try {
    const { schoolId, class: cls, section, date } = req.query;
    if (!schoolId || !cls || !section || !date) {
      return res.status(400).json({ success: false, error: 'schoolId, class, section, and date are required' });
    }

    const targetDate = new Date(String(date));
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const records = await prisma.attendance.findMany({
      where: {
        schoolId: String(schoolId),
        date: { gte: targetDate, lt: nextDate },
        student: {
          class: String(cls),
          section: String(section),
        },
      },
      select: {
        studentId: true,
        status: true,
      },
    });

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Helper function to calculate start (Monday) and end (Friday) dates for current/last week
function getWeekRange(week: 'current' | 'last') {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sun, 1 = Mon ...
  // Find Monday of the current week
  const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  if (week === 'last') {
    monday.setDate(monday.getDate() - 7);
  }

  const Friday = new Date(monday);
  Friday.setDate(monday.getDate() + 4);
  Friday.setHours(23, 59, 59, 999);

  return { start: monday, end: Friday };
}

// GET /api/attendance/weekly — Get student attendance for a class filtered by current/last week
router.get('/weekly', async (req: Request, res: Response) => {
  try {
    const { schoolId, class: cls, section, week } = req.query;
    if (!schoolId || !cls || !section) {
      return res.status(400).json({ success: false, error: 'schoolId, class, and section are required' });
    }

    const selectedWeek = week === 'last' ? 'last' : 'current';
    const { start, end } = getWeekRange(selectedWeek);

    // Fetch all students in the class
    const students = await prisma.student.findMany({
      where: {
        schoolId: String(schoolId),
        class: String(cls),
        section: String(section),
      },
      select: {
        id: true,
        rollNumber: true,
        user: { select: { name: true } },
      },
      orderBy: { rollNumber: 'asc' },
    });

    const studentIds = students.map(s => s.id);

    // Fetch attendance for these students in the date range
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: { gte: start, lte: end },
      },
      select: {
        studentId: true,
        date: true,
        status: true,
      },
    });

    res.json({
      success: true,
      weekRange: { start, end },
      students: students.map(s => {
        const studentAttendance = attendance.filter(a => a.studentId === s.id);
        return {
          id: s.id,
          name: s.user?.name || 'Unknown',
          rollNo: s.rollNumber || '',
          records: studentAttendance.map(a => ({
            date: a.date.toISOString().split('T')[0],
            dayOfWeek: new Date(a.date).getDay(), // 1=Mon, 2=Tue ... 5=Fri
            status: a.status,
          })),
        };
      }),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/attendance/:studentId — Get student attendance
router.get('/:studentId', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: req.params.studentId,
        date: {
          ...(from ? { gte: new Date(String(from)) } : {}),
          ...(to ? { lte: new Date(String(to)) } : {}),
        },
      },
      orderBy: { date: 'desc' },
    });
    // Compute %
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    res.json({ success: true, percentage, total, present, data: attendance });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/attendance/school/:schoolId/today — School-level attendance for today
router.get('/school/:schoolId/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await prisma.attendance.groupBy({
      by: ['status'],
      where: { schoolId: req.params.schoolId, date: { gte: today, lt: tomorrow } },
      _count: { status: true },
    });

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
