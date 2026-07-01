import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { resolveUserId } from '../config/userResolver';
import fs from 'fs';
import path from 'path';
import { sendMockSMS, getStudentParents } from '../utils/sms';

const router = Router();

async function createSafeNotification(userId: string, message: string) {
  try {
    const resolvedId = await resolveUserId(userId);
    if (!resolvedId) {
      console.warn(`[createSafeNotification] Could not resolve userId ${userId} to a PostgreSQL User. Skipping notification.`);
      return;
    }
    await prisma.notification.create({
      data: {
        userId: resolvedId,
        message,
      }
    });
  } catch (err) {
    console.error(`[createSafeNotification] Failed to create notification for user ${userId}:`, err);
  }
}


// =========================================================================
// 1. Study Materials
// =========================================================================

// GET /api/teacher/materials
router.get('/materials', async (req: Request, res: Response) => {
  try {
    const { schoolId, category } = req.query;
    const materials = await prisma.studyMaterial.findMany({
      where: {
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(category && category !== 'All' ? { category: String(category) } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/materials
router.post('/materials', async (req: Request, res: Response) => {
  try {
    const { title, category, classSection, format, size, schoolId, userId, fileData } = req.body;
    if (!title || !category || !classSection) {
      return res.status(400).json({ success: false, error: 'title, category, and classSection are required' });
    }
    const material = await prisma.studyMaterial.create({
      data: {
        title,
        category,
        classSection,
        format: format || 'PDF',
        size: size || '1.5 MB',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        schoolId: schoolId || null,
        fileContent: fileData || null, // Persist base64 data directly to database
      },
    });

    if (userId) {
      await createSafeNotification(userId, `Uploaded new study material "${title}" for ${classSection}`);
    }
    res.status(201).json({ success: true, data: material });
  } catch (err) {
    console.error('Error in POST /materials:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/teacher/materials/download/:id
router.get('/materials/download/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const material = await prisma.studyMaterial.findUnique({ where: { id } });
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    if (material.fileContent) {
      const base64Content = material.fileContent.replace(/^data:.*;base64,/, "");
      const buffer = Buffer.from(base64Content, 'base64');
      const filename = `${material.title.replace(/[^a-zA-Z0-9]/g, '_')}.${material.format.toLowerCase()}`;
      res.setHeader('Content-Type', material.format.toLowerCase() === 'pdf' ? 'application/pdf' : 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(buffer);
    } else {
      // Fallback to local disk file for backwards compatibility
      const filePath = path.join(__dirname, '../../store', `${material.id}.${material.format.toLowerCase()}`);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, `${material.title}.${material.format.toLowerCase()}`);
      }
      return res.status(404).json({ success: false, error: 'File content not found in database or disk' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/teacher/materials/:id
router.delete('/materials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const material = await prisma.studyMaterial.findUnique({ where: { id } });
    if (material) {
      // Clean up local disk file if it exists (for backwards compatibility)
      const filePath = path.join(__dirname, '../../store', `${material.id}.${material.format.toLowerCase()}`);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error(`Failed to delete file on disk for material ${id}:`, unlinkErr);
        }
      }
    }
    await prisma.studyMaterial.delete({ where: { id } });
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/teacher/list — Fetch staff from HeadmasterStaff table for dropdowns
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;

    const staff = await prisma.headmasterStaff.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      select: { id: true, name: true, subject: true },
      orderBy: { name: 'asc' },
    });

    const mapped = staff.map(s => ({
      id: s.id,
      name: `${s.name} (${s.subject})`,
    }));

    res.json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 2. Announcements
// =========================================================================

// GET /api/teacher/announcements
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const { schoolId, pinned } = req.query;
    const announcements = await prisma.announcement.findMany({
      where: {
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(pinned !== undefined ? { pinned: pinned === 'true' } : {}),
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/announcements
router.post('/announcements', async (req: Request, res: Response) => {
  try {
    const { title, body, target, sender, pinned, schoolId, userId, sendSMS } = req.body;
    if (!title || !body || !target) {
      return res.status(400).json({ success: false, error: 'title, body, and target are required' });
    }
    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        target,
        sender: sender || 'You (Teacher)',
        pinned: !!pinned,
        date: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        schoolId: schoolId || null,
      },
    });

    if (userId) {
      await createSafeNotification(userId, `Posted new announcement: "${title}"`);
    }

    // SMS notice broadcasting to parents if checked
    if (sendSMS) {
      try {
        let studentsList: any[] = [];
        const classMatch = target.match(/^Class\s+(\d+)([a-zA-Z]+)\s+Parents$/i);

        if (classMatch) {
          const clsName = classMatch[1];
          const secLetter = classMatch[2].toUpperCase();
          studentsList = await prisma.student.findMany({
            where: {
              schoolId: schoolId || undefined,
              class: clsName,
              section: secLetter,
            }
          });
        } else if (target === 'All Parents taught by me' && userId) {
          const teacher = await prisma.teacher.findUnique({
            where: { userId },
          });
          const classrooms = await prisma.classRoom.findMany({
            where: {
              schoolId: schoolId || undefined,
              teacherId: teacher?.id || userId,
            }
          });

          if (classrooms.length > 0) {
            studentsList = await prisma.student.findMany({
              where: {
                schoolId: schoolId || undefined,
                OR: classrooms.map(c => ({
                  class: c.className,
                  section: c.section,
                }))
              }
            });
          } else {
            studentsList = await prisma.student.findMany({
              where: { schoolId: schoolId || undefined }
            });
          }
        } else {
          studentsList = await prisma.student.findMany({
            where: { schoolId: schoolId || undefined }
          });
        }

        const smsMessage = `Notice: ${title} - ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`;
        const processedPhones = new Set<string>();

        for (const student of studentsList) {
          const parents = await getStudentParents(student.id);
          for (const parent of parents) {
            if (parent.phone && !processedPhones.has(parent.phone)) {
              processedPhones.add(parent.phone);
              // 1. Deliver mock SMS
              await sendMockSMS(parent.phone, smsMessage);

              // 2. Add DB parentNotification record
              if (parent.id) {
                await prisma.parentNotification.create({
                  data: {
                    parentId: parent.id,
                    studentId: student.id,
                    type: 'NOTICE_BROADCAST',
                    title: `Notice: ${title}`,
                    message: body,
                  }
                });
              }
            }
          }
        }
      } catch (smsErr) {
        console.error('Error dispatching notice SMS:', smsErr);
      }
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/teacher/announcements/:id
router.delete('/announcements/:id', async (req: Request, res: Response) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 3. Homework & Submissions
// =========================================================================

// GET /api/teacher/homework
router.get('/homework', async (req: Request, res: Response) => {
  try {
    const { schoolId, status } = req.query;
    const homeworkList = await prisma.homework.findMany({
      where: {
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(status ? { status: String(status) } : {}),
      },
      include: {
        submissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: homeworkList });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/homework
router.post('/homework', async (req: Request, res: Response) => {
  try {
    const { title, className, dueDate, status, description, schoolId, userId } = req.body;
    if (!title || !className || !dueDate) {
      return res.status(400).json({ success: false, error: 'title, className, and dueDate are required' });
    }

    const homework = await prisma.homework.create({
      data: {
        title,
        className,
        dueDate,
        status: status || 'active',
        description: description || '',
        schoolId: schoolId || null,
      },
    });

    if (userId) {
      await createSafeNotification(userId, `Assigned new homework "${title}" for ${className}`);
    }

    // Automatically seed submissions for all students in the class
    // We parse class number from className, e.g. "10A - Mathematics" -> class "10", section "A"
    const classMatch = className.match(/(\d+)\s*([A-Za-z])/);
    if (classMatch && schoolId) {
      const clsNum = classMatch[1];
      const secLetter = classMatch[2].toUpperCase();

      const students = await prisma.student.findMany({
        where: {
          schoolId: String(schoolId),
          class: clsNum,
          section: secLetter,
        },
        include: { user: true },
      });

      if (students.length > 0) {
        const subRecords = students.map((s, index) => ({
          homeworkId: homework.id,
          rollNo: s.rollNumber || `${clsNum}${secLetter}${String(index + 1).padStart(2, '0')}`,
          name: s.user.name,
          status: index % 4 === 0 ? 'pending' : 'submitted', // mock some pending/submitted
          score: index % 4 === 0 ? '—' : `${8 + (index % 3)}/10`,
          date: index % 4 === 0 ? '—' : 'Yesterday, ' + (4 + (index % 5)) + ':00 PM',
        }));

        await prisma.homeworkSubmission.createMany({
          data: subRecords,
        });
      }
    }

    const updatedHw = await prisma.homework.findUnique({
      where: { id: homework.id },
      include: { submissions: true },
    });

    res.status(201).json({ success: true, data: updatedHw });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/teacher/homework/:id/submissions
router.get('/homework/:id/submissions', async (req: Request, res: Response) => {
  try {
    const submissions = await prisma.homeworkSubmission.findMany({
      where: { homeworkId: req.params.id },
      orderBy: { rollNo: 'asc' },
    });
    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/teacher/homework/submissions/:subId
router.put('/homework/submissions/:subId', async (req: Request, res: Response) => {
  try {
    const { score, status } = req.body;
    const submission = await prisma.homeworkSubmission.update({
      where: { id: req.params.subId },
      data: {
        score,
        status,
        date: status === 'submitted' ? 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
      },
    });
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/teacher/homework/:id
router.delete('/homework/:id', async (req: Request, res: Response) => {
  try {
    await prisma.homework.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Homework deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 4. AI Evaluations
// =========================================================================

// GET /api/teacher/evaluations
router.get('/evaluations', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const evaluations = await prisma.evaluationSubmission.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: evaluations });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/teacher/evaluations/:id
router.put('/evaluations/:id', async (req: Request, res: Response) => {
  try {
    const { score, status, ocrContent } = req.body;
    const updated = await prisma.evaluationSubmission.update({
      where: { id: req.params.id },
      data: {
        score,
        status,
        ocrContent: ocrContent || undefined,
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 5. Science Labs Manager
// =========================================================================

// GET /api/teacher/labs
router.get('/labs', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const labs = await prisma.labEquipment.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: labs });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/labs
router.post('/labs', async (req: Request, res: Response) => {
  try {
    const { name, classSection, status, date, safetyCheck, schoolId, userId, classRoomId, location, count } = req.body;
    const lab = await prisma.labEquipment.create({
      data: {
        name,
        classSection: classSection || '',
        status: status || 'scheduled',
        date: date || '',
        safetyCheck: safetyCheck !== undefined ? !!safetyCheck : true,
        schoolId: schoolId || null,
        classRoomId: classRoomId || null,
        location: location || 'N/A',
        count: count !== undefined ? Number(count) : 1
      },
    });
    if (userId) {
      await createSafeNotification(userId, `Scheduled new science lab "${name}" for ${classSection}`);
    }
    res.status(201).json({ success: true, data: lab });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/teacher/labs/:id
router.put('/labs/:id', async (req: Request, res: Response) => {
  try {
    const lab = await prisma.labEquipment.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: lab });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/teacher/labs/:id
router.delete('/labs/:id', async (req: Request, res: Response) => {
  try {
    await prisma.labEquipment.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'Lab equipment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 6. Leave Requests
// =========================================================================

// GET /api/teacher/leave
router.get('/leave', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const leaves = await prisma.leaveRequest.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/leave
router.post('/leave', async (req: Request, res: Response) => {
  try {

    const { type, duration, reason, studentName, studentId, schoolId, userId, staffId } = req.body;

    let finalStudentName = studentName || 'Unknown';
    if (studentId && !studentName) {
      const student = await prisma.student.findUnique({ where: { id: studentId }, include: { user: true } });
      if (student && student.user) {
        finalStudentName = student.user.name || 'Unknown';
      }
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        type,
        duration,
        reason,
        studentName: finalStudentName,
        studentId: studentId || null,
        staffId: staffId || null,  // Audit: who submitted the leave
        status: 'Approved',
        schoolId: schoolId || null,
      } as any,
    });
    if (userId) {
      await createSafeNotification(userId, `Submitted leave request (${type}) for ${duration}`);
    }
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 7. AI Lesson Planner
// =========================================================================

// GET /api/teacher/lessons
router.get('/lessons', async (req: Request, res: Response) => {
  try {
    const { schoolId, subject, grade } = req.query;
    const lessons = await prisma.lessonPlan.findMany({
      where: {
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(subject ? { subject: { equals: String(subject), mode: 'insensitive' } } : {}),
        ...(grade ? { grade: { equals: String(grade), mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: lessons });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/teacher/lessons/:id
router.get('/lessons/:id', async (req: Request, res: Response) => {
  try {
    const lesson = await prisma.lessonPlan.findUnique({
      where: { id: req.params.id },
    });
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson plan not found' });
    }
    res.json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/lessons
router.post('/lessons', async (req: Request, res: Response) => {
  try {
    const { syllabus, grade, subject, topic, duration, planData, schoolId, userId } = req.body;
    const lesson = await prisma.lessonPlan.create({
      data: {
        syllabus,
        grade,
        subject,
        topic,
        duration,
        planData,
        schoolId: schoolId || null,
      },
    });
    if (userId) {
      await createSafeNotification(userId, `Generated AI Lesson Plan for "${topic}" (Grade ${grade})`);
    }
    res.status(201).json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/teacher/lessons/:id
router.put('/lessons/:id', async (req: Request, res: Response) => {
  try {
    const { syllabus, grade, subject, topic, duration, planData } = req.body;
    const lesson = await prisma.lessonPlan.update({
      where: { id: req.params.id },
      data: {
        ...(syllabus !== undefined ? { syllabus } : {}),
        ...(grade !== undefined ? { grade } : {}),
        ...(subject !== undefined ? { subject } : {}),
        ...(topic !== undefined ? { topic } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(planData !== undefined ? { planData } : {}),
      },
    });
    res.json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/teacher/lessons/:id
router.delete('/lessons/:id', async (req: Request, res: Response) => {
  try {
    await prisma.lessonPlan.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Lesson plan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 8. Question Bank CRUD
// =========================================================================

// GET /api/teacher/questions
router.get('/questions', async (req: Request, res: Response) => {
  try {
    const { grade, subject, topic, difficulty, schoolId } = req.query;
    const questions = await prisma.question.findMany({
      where: {
        ...(schoolId ? { schoolId: String(schoolId) } : {}),
        ...(grade ? { grade: String(grade) } : {}),
        ...(subject ? { subject: String(subject) } : {}),
        ...(topic ? { topic: { contains: String(topic), mode: 'insensitive' } } : {}),
        ...(difficulty ? { difficulty: String(difficulty) } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/questions
router.post('/questions', async (req: Request, res: Response) => {
  try {
    const { questions, schoolId, userId } = req.body; // Array of questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, error: 'questions array is required' });
    }

    const records = questions.map((q: any) => ({
      grade: q.grade || 'Grade 10',
      subject: q.subject || 'Mathematics',
      topic: q.topic || 'Pythagoras Theorem',
      difficulty: q.difficulty || 'medium',
      type: q.type,
      text: q.text,
      options: q.options || [],
      answer: q.answer,
      marks: q.marks || 1,
      schoolId: schoolId || null,
    }));

    await prisma.question.createMany({ data: records });
    if (userId) {
      await createSafeNotification(userId, `Added ${questions.length} question(s) to the Question Bank for ${records[0]?.subject || 'Science'}`);
    }
    res.status(201).json({ success: true, count: records.length });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/teacher/questions/:id
router.put('/questions/:id', async (req: Request, res: Response) => {
  try {
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/teacher/questions/:id
router.delete('/questions/:id', async (req: Request, res: Response) => {
  try {
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 9. Student Badges (Engagement)
// =========================================================================

// GET /api/teacher/badges
router.get('/badges', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    let where: any = undefined;
    if (schoolId) {
      const students = await prisma.student.findMany({
        where: { schoolId: String(schoolId) },
        select: { id: true },
      });
      where = { studentId: { in: students.map(s => s.id) } };
    }
    const badges = await prisma.studentBadge.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: badges });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/badges
router.post('/badges', async (req: Request, res: Response) => {
  try {
    const { studentId, studentName, classSection, badge, remark, userId } = req.body;
    if (!studentId || !studentName || !badge) {
      return res.status(400).json({ success: false, error: 'studentId, studentName, and badge are required' });
    }
    const record = await prisma.studentBadge.create({
      data: {
        studentId,
        studentName,
        classSection,
        badge,
        remark,
      },
    });
    if (userId) {
      await createSafeNotification(userId, `Awarded "${badge}" badge to ${studentName} (${classSection})`);
    }
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 10. Scholarships verification
// =========================================================================

// GET /api/teacher/scholarships
router.get('/scholarships', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const scholarships = await prisma.scholarship.findMany({
      where: schoolId ? { student: { schoolId: String(schoolId) } } : undefined,
      include: {
        student: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: scholarships });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/teacher/scholarships/:id
router.put('/scholarships/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await prisma.scholarship.update({
      where: { id: req.params.id },
      data: {
        status,
        approvedDate: status === 'APPROVED' ? new Date() : undefined,
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 11. Parent-Teacher Messages (persisted to DB via Message model)
// =========================================================================

// GET /api/teacher/messages/:parentId
router.get('/messages/:parentId', async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;
    const msgs = await prisma.message.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, sender: true, text: true, createdAt: true },
    });
    const formatted = msgs.map((m) => ({
      id: m.id,
      sender: m.sender,
      text: m.text,
      time: m.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/messages
router.post('/messages', async (req: Request, res: Response) => {
  try {
    const { parentId, sender, text, schoolId } = req.body;
    if (!parentId || !sender || !text) {
      return res.status(400).json({ success: false, error: 'parentId, sender, and text are required' });
    }
    const msg = await prisma.message.create({
      data: { parentId, sender, text, schoolId: schoolId || null },
    });
    const newMsg = {
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      time: msg.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    res.status(201).json({ success: true, data: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/teacher/analytics/class
router.get('/analytics/class', async (req: Request, res: Response) => {
  try {
    const { schoolId, class: cls, section } = req.query;

    if (!schoolId || !cls || !section) {
      // Fallback to original query if any parameters are missing
      const students = await prisma.student.findMany({
        where: {
          ...(schoolId ? { schoolId: String(schoolId) } : {}),
          ...(cls ? { class: String(cls) } : {}),
          ...(section ? { section: String(section) } : {}),
        },
        include: {
          user: { select: { name: true } },
          marks: true,
          attendance: true,
        },
        orderBy: { rollNumber: 'asc' },
      });
      return res.json({ success: true, data: students });
    }

    const schoolIdStr = String(schoolId);
    const classStr = String(cls);
    const sectionStr = String(section);

    // Optimized Raw SQL query to fetch all required fields, joined and aggregated 
    // into JSON arrays in a single database roundtrip (minimizing WAN latency).
    const students = await prisma.$queryRaw<any[]>`
      SELECT 
        s.id, 
        s."userId", 
        s."schoolId", 
        s.class, 
        s.section, 
        s."rollNumber", 
        s.dob, 
        s.gender, 
        s.religion, 
        s.caste, 
        s."parentName", 
        s."parentMobile", 
        s."createdAt",
        s."updatedAt",
        json_build_object('name', u.name) AS "user",
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', m.id,
            'studentId', m."studentId",
            'subject', m.subject,
            'examType', m."examType",
            'maxMarks', m."maxMarks",
            'scored', m.scored,
            'grade', m.grade,
            'academicYear', m."academicYear",
            'createdAt', m."createdAt"
          ))
           FROM "Mark" m 
           WHERE m."studentId" = s.id), 
          '[]'::json
        ) AS marks,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', a.id,
            'studentId', a."studentId",
            'schoolId', a."schoolId",
            'date', a.date,
            'status', a.status,
            'method', a.method,
            'createdAt', a."createdAt"
          ))
           FROM "Attendance" a 
           WHERE a."studentId" = s.id), 
          '[]'::json
        ) AS attendance
      FROM "Student" s
      JOIN "User" u ON s."userId" = u.id
      WHERE s."schoolId" = ${schoolIdStr} 
        AND s.class = ${classStr} 
        AND s.section = ${sectionStr}
      ORDER BY s."rollNumber" ASC
    `;

    res.json({ success: true, data: students });
  } catch (err) {
    console.error('Error fetching optimized class analytics:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/teacher/profile/:userId
router.get('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 1. Try to find in User + Teacher tables
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacher: {
          include: { school: { select: { name: true } } }
        },
        school: { select: { name: true } }
      }
    });

    if (user) {
      return res.json({
        success: true,
        type: 'user',
        data: {
          id: user.id,
          name: user.name,
          email: user.email || '',
          phone: user.mobile || '',
          role: user.role,
          schoolId: user.schoolId || user.teacher?.schoolId || '',
          schoolName: user.school?.name || user.teacher?.school?.name || 'Tamil Nadu School',
          emisId: user.teacher?.employeeId || user.emisId || 'N/A',
          subjects: user.teacher?.subjects || [],
          subject: user.teacher?.subjects?.join(', ') || 'General',
          qualification: user.teacher?.qualification || 'N/A',
          joiningDate: user.teacher?.joiningDate ? user.teacher.joiningDate.toISOString().split('T')[0] : '',
          address: user.teacher?.address || '',
          gender: user.teacher?.gender || '',
          dob: user.teacher?.dob ? user.teacher.dob.toISOString().split('T')[0] : ''
        }
      });
    }

    // 2. Try to find in HeadmasterStaff table
    const staff = await prisma.headmasterStaff.findUnique({
      where: { id: userId }
    });

    if (staff) {
      let schoolName = 'Tamil Nadu School';
      if (staff.schoolId) {
        const school = await prisma.school.findUnique({
          where: { id: staff.schoolId },
          select: { name: true }
        });
        if (school) schoolName = school.name;
      }

      return res.json({
        success: true,
        type: 'staff',
        data: {
          id: staff.id,
          name: staff.name,
          email: staff.email || '',
          phone: staff.phone || '',
          role: 'TEACHER',
          schoolId: staff.schoolId || '',
          schoolName,
          emisId: staff.emisId || 'N/A',
          subjects: [staff.subject],
          subject: staff.subject || 'General',
          qualification: 'N/A',
          joiningDate: staff.createdAt ? staff.createdAt.toISOString().split('T')[0] : '',
          address: staff.address || '',
          gender: staff.gender || '',
          dob: staff.dob ? staff.dob.toISOString().split('T')[0] : ''
        }
      });
    }

    return res.status(404).json({ success: false, error: 'Profile not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/teacher/profile/:userId
router.put('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, subjects, qualification, joiningDate } = req.body;

    // 1. Try to find in User
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email: email || null,
          mobile: phone || null,
        }
      });

      const teacher = await prisma.teacher.findUnique({
        where: { userId }
      });

      if (teacher) {
        await prisma.teacher.update({
          where: { userId },
          data: {
            subjects: Array.isArray(subjects) ? subjects : subjects ? String(subjects).split(',').map(s => s.trim()) : [],
            qualification,
            joiningDate: joiningDate ? new Date(joiningDate) : null,
            address: req.body.address || null,
            gender: req.body.gender || null,
            dob: req.body.dob ? new Date(req.body.dob) : null,
          }
        });
      } else if (user.schoolId) {
        await prisma.teacher.create({
          data: {
            userId,
            schoolId: user.schoolId,
            subjects: Array.isArray(subjects) ? subjects : subjects ? String(subjects).split(',').map(s => s.trim()) : [],
            qualification,
            joiningDate: joiningDate ? new Date(joiningDate) : null,
            employeeId: user.emisId || 'TCH-' + Math.floor(1000 + Math.random() * 9000),
            address: req.body.address || null,
            gender: req.body.gender || null,
            dob: req.body.dob ? new Date(req.body.dob) : null,
          }
        });
      }

      return res.json({ success: true, message: 'Profile updated successfully' });
    }

    // 2. Try to find in HeadmasterStaff
    const staff = await prisma.headmasterStaff.findUnique({
      where: { id: userId }
    });

    if (staff) {
      await prisma.headmasterStaff.update({
        where: { id: userId },
        data: {
          name,
          email: email || null,
          phone: phone || 'N/A',
          subject: Array.isArray(subjects) ? subjects[0] : subjects || 'General',
          address: req.body.address || null,
          gender: req.body.gender || null,
          dob: req.body.dob ? new Date(req.body.dob) : null,
        }
      });
      return res.json({ success: true, message: 'Profile updated successfully' });
    }

    return res.status(404).json({ success: false, error: 'Profile not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// =========================================================================
// 8. School Press
// =========================================================================

// GET /api/teacher/school-press
router.get('/school-press', async (req: Request, res: Response) => {
  try {
    const { teacherId, schoolId, class: studentClass, approvedOnly } = req.query;
    const activities = await (prisma as any).schoolPressActivity.findMany({
      where: {
        ...(approvedOnly === 'true' ? { isApproved: true } : {}),
        ...(teacherId ? { teacherId: String(teacherId) } : {}),
        ...(schoolId || studentClass ? {
          student: {
            ...(schoolId ? { schoolId: String(schoolId) } : {}),
            ...(studentClass ? { class: String(studentClass) } : {})
          }
        } : {})
      },
      include: {
        student: { select: { id: true, user: { select: { name: true } }, class: true, section: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/teacher/school-press
router.post('/school-press', async (req: Request, res: Response) => {
  try {
    const { studentId, teacherId, description, photos } = req.body;
    if (!studentId || !description) {
      return res.status(400).json({ success: false, error: 'Student ID and description are required' });
    }
    const newActivity = await (prisma as any).schoolPressActivity.create({
      data: {
        studentId,
        teacherId,
        description,
        photos: photos || [],
        isApproved: teacherId ? true : false // Auto-approve if created by teacher
      }
    });
    res.json({ success: true, data: newActivity });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/teacher/school-press/:id/approve
router.put('/school-press/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await (prisma as any).schoolPressActivity.update({
      where: { id },
      data: { isApproved: true }
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/teacher/school-press/:id
router.delete('/school-press/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).schoolPressActivity.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
