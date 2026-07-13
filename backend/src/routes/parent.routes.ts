import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { callGemini } from './ai.routes';

const router = Router();

// Resolve parentId parameter: if it is a User ID, map it to the corresponding HeadmasterParent profile ID
router.param('parentId', async (req: Request, res: Response, next, parentId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parentId }
    });

    if (user && user.role === 'PARENT') {
      const hmParent = await prisma.headmasterParent.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { email: user.email || undefined },
            { phone: user.mobile || undefined }
          ]
        }
      });
      if (hmParent) {
        req.params.parentId = hmParent.id;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

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
      community: l.student.community,
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
      where: { schoolId: student.schoolId, className: { startsWith: `${student.class}${student.section}` } },
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
    const { offset } = req.query;
    const targetOffset = offset !== undefined ? Number(offset) : 0;
    const monthCount = 6;

    const monthlyData = await Promise.all(
      Array.from({ length: monthCount }, (_, i) => i).reverse().map(async (offsetVal) => {
        const { start, end } = getMonthRange(offsetVal);
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
          offset: offsetVal
        };
      })
    );

    // Selected month detailed records
    const { start: startTarget, end: endTarget } = getMonthRange(targetOffset);
    const recentRecords = await prisma.attendance.findMany({
      where: { studentId, date: { gte: startTarget, lte: endTarget } },
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

    const classSection = `${student.class}${student.section}`;

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

    const data = homeworkList.map(h => {
      const submission = h.submissions[0];
      return {
        id: h.id,
        title: h.title,
        className: h.className,
        dueDate: h.dueDate,
        status: h.status,
        description: h.description,
        subject: h.subject || 'General',
        submissionStatus: submission ? submission.status : 'pending',
        score: submission?.score ?? '—',
        feedback: submission?.feedback ?? null,
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
import fs from 'fs';
import path from 'path';

const RSVPS_FILE = path.join(__dirname, '../../data/pta_rsvps.json');

function readRsvps(): Record<string, Record<string, any>> {
  try {
    if (!fs.existsSync(RSVPS_FILE)) {
      return {};
    }
    const content = fs.readFileSync(RSVPS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading RSVPs file in parent routes:", err);
    return {};
  }
}

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

    const rsvps = readRsvps();
    const enrichedMeetings = meetings.map(m => ({
      ...m,
      rsvps: rsvps[m.id] || {}
    }));

    res.json({ success: true, count: enrichedMeetings.length, data: enrichedMeetings });
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

// ─────────────────────────────────────────────────────────────────
// GET /api/parent/:parentId/child/:studentId/performance-summary
// Dynamic Performance summary combining grades, attendance, badges,
// guidance history and homework feedback with Gemini AI or local fallback.
// ─────────────────────────────────────────────────────────────────
router.get('/:parentId/child/:studentId/performance-summary', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    // 1. Fetch student and user details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: { select: { name: true } } },
    });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // 2. Fetch marks
    const marks = await prisma.mark.findMany({
      where: { studentId },
      orderBy: { examType: 'asc' },
    });

    // 3. Fetch attendance
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'asc' },
    });

    // 4. Fetch badges
    const badges = await prisma.studentBadge.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Fetch counseling / guides
    const personalGuides = await prisma.personalGuide.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    // 6. Fetch homework submissions with feedback
    const homeworkSubmissions = await prisma.homeworkSubmission.findMany({
      where: { studentId },
      include: { homework: true },
      orderBy: { updatedAt: 'desc' },
    });

    // Compute subject averages and total average
    const subjectScores: Record<string, number[]> = {};
    for (const m of marks) {
      if (!subjectScores[m.subject]) subjectScores[m.subject] = [];
      subjectScores[m.subject].push(Math.round((m.scored / m.maxMarks) * 100));
    }

    const subjectAvgs = Object.entries(subjectScores).map(([subject, scores]) => {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      return { subject, avg };
    });

    const overallAvg = subjectAvgs.length > 0
      ? Math.round(subjectAvgs.reduce((sum, s) => sum + s.avg, 0) / subjectAvgs.length)
      : 0;

    // Compute attendance percentage
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Extract feedback comments
    const feedbacks: { source: string; text: string; date: Date }[] = [];
    for (const b of badges) {
      if (b.remark) {
        feedbacks.push({
          source: `Badge: ${b.badge}`,
          text: b.remark,
          date: b.createdAt,
        });
      }
    }
    for (const hw of homeworkSubmissions) {
      if (hw.feedback) {
        feedbacks.push({
          source: `Homework: ${hw.homework.title}`,
          text: hw.feedback,
          date: hw.updatedAt,
        });
      }
    }
    for (const g of personalGuides) {
      if (g.notes) {
        feedbacks.push({
          source: 'Counselor Session',
          text: g.notes,
          date: g.updatedAt,
        });
      }
    }
    // Sort feedbacks by date descending
    feedbacks.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Dynamically compute strengths
    const strengths: string[] = [];
    for (const s of subjectAvgs) {
      if (s.avg >= 80) {
        strengths.push(`Excellent performance in ${s.subject} (${s.avg}%)`);
      }
    }
    if (attendancePct >= 90) {
      strengths.push(`Outstanding attendance consistency at ${attendancePct}%`);
    }
    if (badges.length > 0) {
      strengths.push(`Earned ${badges.length} motivation badge(s) for active classroom participation`);
    }
    if (strengths.length === 0 && subjectAvgs.length > 0) {
      const best = subjectAvgs.reduce((a, b) => a.avg > b.avg ? a : b);
      strengths.push(`Showing promising results in ${best.subject} (${best.avg}%)`);
    }
    if (strengths.length === 0) {
      strengths.push('Regular class engagement and steady effort');
    }

    // Dynamically compute weak areas
    const weaknesses: string[] = [];
    for (const s of subjectAvgs) {
      if (s.avg < 60) {
        weaknesses.push(`Focus needed in ${s.subject} to improve conceptual understanding (${s.avg}%)`);
      }
    }
    if (attendancePct < 75) {
      weaknesses.push(`Low attendance (${attendancePct}%) is impacting progress; regular attendance is advised`);
    }
    const pendingHw = homeworkSubmissions.filter(h => h.status === 'pending' || h.status === 'assigned');
    if (pendingHw.length > 1) {
      weaknesses.push(`Has ${pendingHw.length} incomplete homework submissions; prompt completion is recommended`);
    }
    if (weaknesses.length === 0) {
      weaknesses.push('No critical academic areas need immediate intervention; continue the good learning habits');
    }

    // Construct AI summary & tips or use fallback if GEMINI_API_KEY is not defined
    let aiSummary = '';
    let aiTips: string[] = [];
    let tamilSummary = '';
    let tamilTips: string[] = [];

    const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;

    if (hasApiKey) {
      try {
        const prompt = `You are a helpful school academic counselor for Tamil Nadu Government Schools.
Analyze this student's data and write a highly constructive, motivating academic summary for their parent.

Student Name: ${student.user.name}
Class: Class ${student.class}-${student.section}
Attendance Rate: ${attendancePct}% (Total Days: ${totalDays}, Present: ${presentDays})
Average Mark: ${overallAvg}%
Subject-wise Averages:
${subjectAvgs.map(s => `- ${s.subject}: ${s.avg}%`).join('\n')}

Strengths Detected:
${strengths.map(s => `- ${s}`).join('\n')}

Weak Areas Detected:
${weaknesses.map(w => `- ${w}`).join('\n')}

Recent Teacher Comments/Feedback:
${feedbacks.slice(0, 5).map(f => `- [${f.source}] ${f.text}`).join('\n')}

Output format MUST be a JSON object with:
1. "summary": A caring, professional paragraph (3-4 sentences) summarizing progress. Use translation-friendly language. Mention specific subjects if appropriate.
2. "tips": An array of exactly 3 practical, actionable tips for parents to help their child improve or maintain their level at home.
3. "tamilSummary": The Tamil translation of the summary paragraph.
4. "tamilTips": An array of exactly 3 Tamil translations of the tips.

Ensure the tone is warm, motivating, and culturally appropriate. Do not use markdown format inside the JSON fields.`;

        const SCHEMA = {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            tips: { type: 'ARRAY', items: { type: 'STRING' } },
            tamilSummary: { type: 'STRING' },
            tamilTips: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['summary', 'tips', 'tamilSummary', 'tamilTips']
        };

        const result = await callGemini(prompt, true, SCHEMA);
        if (result && result.summary && result.tips) {
          aiSummary = result.summary;
          aiTips = result.tips;
          tamilSummary = result.tamilSummary || '';
          tamilTips = result.tamilTips || [];
        } else {
          throw new Error('Invalid schema returned from Gemini');
        }
      } catch (err) {
        console.error('Gemini API call failed for child performance summary:', err);
        const fallback = generateRulesFallback(student.user.name, overallAvg, attendancePct, strengths, weaknesses);
        aiSummary = fallback.summary;
        aiTips = fallback.tips;
        tamilSummary = fallback.tamilSummary;
        tamilTips = fallback.tamilTips;
      }
    } else {
      const fallback = generateRulesFallback(student.user.name, overallAvg, attendancePct, strengths, weaknesses);
      aiSummary = fallback.summary;
      aiTips = fallback.tips;
      tamilSummary = fallback.tamilSummary;
      tamilTips = fallback.tamilTips;
    }

    res.json({
      success: true,
      data: {
        studentId,
        name: student.user.name,
        class: student.class,
        section: student.section,
        overallAvg,
        attendancePct,
        strengths,
        weaknesses,
        feedbacks: feedbacks.map(f => ({ source: f.source, text: f.text, date: f.date.toISOString().split('T')[0] })),
        aiSummary,
        aiTips,
        tamilSummary,
        tamilTips,
      },
    });
  } catch (err) {
    console.error('Error generating performance summary:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Fallback helper function to generate counseling summaries in English and Tamil
function generateRulesFallback(name: string, avg: number, attendance: number, strengths: string[], weaknesses: string[]) {
  const shortName = name.split(' ')[0];
  let summary = '';
  let tamilSummary = '';
  let tips: string[] = [];
  let tamilTips: string[] = [];

  if (avg >= 80) {
    summary = `${shortName} has displayed outstanding academic performance this term with a solid average score of ${avg}%. Their discipline in completing class tasks and active contribution in high-performing subjects are highly commendable. Supporting their current momentum will help them excel in future exams.`;
    tamilSummary = `${shortName} இந்த பருவத்தில் ${avg}% சராசரி மதிப்பெண்ணுடன் சிறந்த கல்விச் செயல்திறனை வெளிப்படுத்தியுள்ளார். வகுப்புப் பணிகளை முடிப்பதில் உள்ள ஒழுக்கமும், சிறப்பாகச் செயல்படும் பாடங்களில் அவர்களின் பங்களிப்பும் மிகவும் பாராட்டத்தக்கது. அவர்களின் தற்போதைய வேகத்தை ஆதரிப்பது எதிர்காலத் தேர்வுகளில் அவர்கள் சிறந்து விளங்க உதவும்.`;
    tips = [
      'Encourage self-directed reading in advanced science and literature topics.',
      'Maintain their excellent daily study routine of 1-2 hours at home.',
      'Acknowledge their achievements to keep them motivated and confident.'
    ];
    tamilTips = [
      'மேம்பட்ட அறிவியல் மற்றும் இலக்கிய தலைப்புகளில் சுயாதீனமான வாசிப்பை ஊக்குவிக்கவும்.',
      'வீட்டில் 1-2 மணிநேரம் படிக்கும் அவர்களின் சிறந்த தினசரி பழக்கத்தைத் தொடரவும்.',
      'அவர்களின் உந்துதலையும் தன்னம்பிக்கையையும் தக்கவைக்க அவர்களின் சாதனைகளை அங்கீகரிக்கவும்.'
    ];
  } else if (avg >= 60) {
    summary = `${shortName} is performing well and maintains a good average of ${avg}%. They show a solid grasp of concepts in most subjects, though there is potential for improvement in specific areas. Regular practice and focused review before assessments will elevate their scores.`;
    tamilSummary = `${shortName} நன்றாகச் செயல்பட்டு ${avg}% என்ற நல்ல சராசரியைத் தக்க வைத்துக் கொள்கிறார். பெரும்பாலான பாடங்களில் அவர்களுக்கு நல்ல புரிதல் உள்ளது, இருப்பினும் குறிப்பிட்ட பகுதிகளில் முன்னேற்றத்திற்கான வாய்ப்புகள் உள்ளன. தேர்வுகளுக்கு முன் வழக்கமான பயிற்சி மற்றும் கவனம் செலுத்துவது அவர்களின் மதிப்பெண்களை உயர்த்தும்.`;
    tips = [
      'Set aside 45 minutes daily specifically for reviewing challenging chapters.',
      'Help them create visual mind maps or notes for subject formulas and facts.',
      'Ensure they complete and submit homework tasks on time.'
    ];
    tamilTips = [
      'சவாலான அத்தியாயங்களை மதிப்பாய்வு செய்ய தினமும் 45 நிமிடங்கள் ஒதுக்குங்கள்.',
      'பாடச் சூத்திரங்கள் மற்றும் உண்மைகளுக்கான மன வரைபடங்கள் அல்லது குறிப்புகளை உருவாக்க அவர்களுக்கு உதவுங்கள்.',
      'வீட்டுப் பாடங்களை அவர்கள் சரியான நேரத்தில் முடித்து சமர்ப்பிப்பதை உறுதிசெய்யவும்.'
    ];
  } else {
    summary = `${shortName} is facing academic challenges with an average score of ${avg}%. Focused revision and additional guidance in weak subjects are crucial at this stage to build foundational concepts. Consistent support and tracking will bring positive progress.`;
    tamilSummary = `${shortName} ${avg}% சராசரி மதிப்பெண்ணுடன் கல்விச் சவால்களை எதிர்கொள்கிறார். இந்த நிலையில் அடிப்படைக் கருத்துக்களை உருவாக்க பலவீனமான பாடங்களில் கவனம் செலுத்திய திருத்தமும் கூடுதல் வழிகாட்டுதலும் முக்கியமானவை. தொடர்ச்சியான ஆதரவும் கண்காணிப்பும் நேர்மறையான முன்னேற்றத்தைக் கொண்டுவரும்.`;
    tips = [
      'Arrange daily study reviews of core subjects and practice solving textbook questions.',
      'Meet with subject teachers to identify specific study materials and topics for improvement.',
      'Ensure regular daily school attendance to avoid missing critical class lessons.'
    ];
    tamilTips = [
      'முக்கிய பாடங்களின் தினசரி படிப்பு மதிப்பாய்வுகளை ஏற்பாடு செய்து, பாடப்புத்தக கேள்விகளை தீர்க்க பயிற்சி செய்யுங்கள்.',
      'முன்னேற்றத்திற்கான குறிப்பிட்ட ஆய்வுப் பொருட்கள் மற்றும் தலைப்புகளைக் கண்டறிய பாட ஆசிரியர்களைச் சந்திக்கவும்.',
      'முக்கியமான வகுப்புப் பாடங்களைத் தவறவிடுவதைத் தவிர்க்க தினசரி பள்ளி வருகையை உறுதிசெய்யவும்.'
    ];
  }

  if (attendance < 75) {
    tips.push('Ensure regular school attendance and catch up immediately on missed topics.');
    tamilTips.push('பள்ளிக்குத் தொடர்ந்து வருவதை உறுதிசெய்து, தவறவிட்ட பாடங்களை உடனடியாகப் படிக்கவும்.');
  }

  return { summary, tips: tips.slice(0, 3), tamilSummary, tamilTips: tamilTips.slice(0, 3) };
}

// =========================================================================
// PTA Appointment & Teacher Slots Endpoints
// =========================================================================

// GET /api/parent/teachers?schoolId=...
router.get('/teachers', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'schoolId is required' });
    }
    const ptStaff = await prisma.headmasterStaff.findMany({
      where: {
        schoolId: String(schoolId),
        OR: [
          { subject: { contains: 'Physical', mode: 'insensitive' } },
          { subject: { contains: 'PT', mode: 'insensitive' } },
          { subject: { contains: 'PE', mode: 'insensitive' } },
          { subject: { contains: 'Sports', mode: 'insensitive' } }
        ]
      }
    });

    const mappedStaff = ptStaff.map(s => ({
      id: s.id,
      user: {
        name: s.name,
        email: s.email
      }
    }));

    res.json({ success: true, data: mappedStaff });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/parent/teacher-slots?teacherId=...
router.get('/teacher-slots', async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.query;
    if (!teacherId) {
      return res.status(400).json({ success: false, error: 'teacherId is required' });
    }
    const slots = await prisma.teacherMeetingSlot.findMany({
      where: { teacherId: String(teacherId), isAvailable: true }
    });
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Helper to resolve parentId from User ID to HeadmasterParent ID if needed
async function resolveParentId(idStr: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: idStr }
  });
  if (user && user.role === 'PARENT') {
    const hmParent = await prisma.headmasterParent.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: user.email || undefined },
          { phone: user.mobile || undefined }
        ]
      }
    });
    if (hmParent) {
      return hmParent.id;
    }
  }
  return idStr;
}

// GET /api/parent/pta-appointments?parentId=... or ?teacherUserId=...
router.get('/pta-appointments', async (req: Request, res: Response) => {
  try {
    const { parentId, teacherUserId } = req.query;

    let whereClause: any = {};
    if (parentId) {
      const resolvedParentId = await resolveParentId(String(parentId));
      whereClause.parentId = resolvedParentId;
    } else if (teacherUserId) {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: String(teacherUserId) }
      });
      if (teacher) {
        whereClause.teacherId = teacher.id;
      } else {
        const staff = await prisma.headmasterStaff.findUnique({
          where: { userId: String(teacherUserId) }
        });
        if (staff) {
          whereClause.teacherId = staff.id;
        }
      }
    } else {
      return res.status(400).json({ success: false, error: 'parentId or teacherUserId is required' });
    }

    const appointments = await prisma.pTAAppointment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    const enriched = await Promise.all(appointments.map(async (appt: any) => {
      let teacherName = 'Unknown Teacher';
      const teacher = await prisma.teacher.findUnique({
        where: { id: appt.teacherId },
        include: { user: { select: { name: true } } }
      });
      if (teacher?.user?.name) {
        teacherName = teacher.user.name;
      } else {
        const staff = await prisma.headmasterStaff.findUnique({
          where: { id: appt.teacherId }
        });
        if (staff?.name) {
          teacherName = `${staff.name} (Physical Education)`;
        }
      }

      const parent = await prisma.headmasterParent.findUnique({
        where: { id: appt.parentId }
      });

      const student = await prisma.student.findUnique({
        where: { id: appt.studentId },
        include: { user: { select: { name: true } } }
      });
      return {
        ...appt,
        teacherName,
        parentName: parent?.name || 'Unknown Parent',
        studentName: student?.user?.name || 'Unknown Student'
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/parent/pta-appointments
router.post('/pta-appointments', async (req: Request, res: Response) => {
  try {
    const { parentId, teacherId, studentId, meetingDate, timeSlot, reason, schoolId, studentName } = req.body;
    if (!parentId || !teacherId || !studentId || !meetingDate || !timeSlot || !reason) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const resolvedParentId = await resolveParentId(String(parentId));
    const appointment = await prisma.pTAAppointment.create({
      data: {
        parentId: resolvedParentId,
        teacherId,
        studentId,
        meetingDate,
        timeSlot,
        reason,
        schoolId,
        status: 'Pending'
      }
    });

    // Create notification
    let teacherName = 'Teacher';
    let targetUserId: string | null = null;

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: { select: { name: true } } }
    });

    if (teacher) {
      if (teacher.user?.name) {
        teacherName = teacher.user.name;
      }
      targetUserId = teacher.userId;
    } else {
      const staff = await prisma.headmasterStaff.findUnique({
        where: { id: teacherId }
      });
      if (staff) {
        if (staff.name) {
          teacherName = `${staff.name} (Physical Education)`;
        }
        targetUserId = staff.userId;
      }
    }

    const sName = studentName || 'your child';

    // 1. Parent notification
    await prisma.parentNotification.create({
      data: {
        parentId: resolvedParentId,
        studentId,
        type: 'PTA',
        title: 'Appointment Requested',
        message: `Appointment request submitted with Teacher ${teacherName} for ${sName} on ${meetingDate} at ${timeSlot}.`
      }
    });

    // 2. Teacher/Staff notification
    if (targetUserId) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          message: `New PTA appointment requested by parent for ${sName} on ${meetingDate} at ${timeSlot}.`
        }
      });
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/parent/pta-appointments/:id/status
router.put('/pta-appointments/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // status: 'Approved' | 'Rejected'
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }

    const appt = await prisma.pTAAppointment.update({
      where: { id },
      data: { status, notes }
    });

    // Fetch teacher/staff name
    let teacherName = 'Teacher';
    const teacher = await prisma.teacher.findUnique({
      where: { id: appt.teacherId },
      include: { user: { select: { name: true } } }
    });
    if (teacher?.user?.name) {
      teacherName = teacher.user.name;
    } else {
      const staff = await prisma.headmasterStaff.findUnique({
        where: { id: appt.teacherId }
      });
      if (staff?.name) {
        teacherName = `${staff.name} (Physical Education)`;
      }
    }

    // Create notification for parent
    await prisma.parentNotification.create({
      data: {
        parentId: appt.parentId,
        studentId: appt.studentId,
        type: 'PTA',
        title: `Appointment ${status}`,
        message: `Your PTA meeting appointment request with ${teacherName} has been ${status.toLowerCase()}.`
      }
    });

    res.json({ success: true, data: appt });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
