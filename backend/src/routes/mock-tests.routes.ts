import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get mock tests based on role
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role, schoolId, createdById } = req.query;

    let whereClause: any = {};

    if (role === 'SUPER_ADMIN') {
      whereClause = {};
    } else if (role === 'HEADMASTER' || role === 'TEACHER') {
      // HMs and Teachers can see State-wide tests (schoolId null) + their own school tests
      whereClause = {
        OR: [
          { schoolId: null },
          { schoolId: schoolId as string }
        ]
      };
    }

    const tests = await prisma.mockTest.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { questions: true, assignments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: tests });
  } catch (error: any) {
    console.error('Error fetching mock tests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch mock tests' });
  }
});

// Create a new mock test
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, grade, subject, duration, totalMarks, createdByRole, createdById, schoolId, questions } = req.body;

    const newTest = await prisma.mockTest.create({
      data: {
        title,
        description,
        grade,
        subject,
        duration: parseInt(duration) || 60,
        totalMarks: parseInt(totalMarks) || 100,
        createdByRole,
        createdById,
        schoolId,
        questions: {
          create: questions.map((q: any, i: number) => ({
            type: q.type,
            text: q.text,
            options: q.options || [],
            answer: q.answer,
            marks: parseInt(q.marks) || 1,
            order: i
          }))
        }
      }
    });

    res.json({ success: true, data: newTest });
  } catch (error: any) {
    console.error('Error creating mock test:', error);
    res.status(500).json({ success: false, error: 'Failed to create mock test' });
  }
});

// Student side: Get assigned tests
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // First find the student to get their school, class, section
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: studentId },
          { userId: studentId }
        ]
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Find assignments matching student's school, class, section
    const assignments = await prisma.mockTestAssignment.findMany({
      where: {
        OR: [
          // State-wide assignments
          { schoolId: null, class: student.class },
          // School-wide assignments
          { schoolId: student.schoolId, class: null },
          // Class-specific assignments
          { schoolId: student.schoolId, class: student.class, section: null },
          // Section-specific assignments
          { schoolId: student.schoolId, class: student.class, section: student.section }
        ]
      },
      include: {
        mockTest: true,
        submissions: {
          where: { studentId }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    res.json({ success: true, data: assignments });
  } catch (error: any) {
    console.error('Error fetching student mock tests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch mock tests for student' });
  }
});

// Get a single test with questions
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const test = await prisma.mockTest.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        assignments: true
      }
    });

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    res.json({ success: true, data: test });
  } catch (error: any) {
    console.error('Error fetching mock test:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch mock test' });
  }
});

// Delete a mock test
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.mockTest.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Mock test deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting mock test:', error);
    res.status(500).json({ success: false, error: 'Failed to delete mock test' });
  }
});

// Assign a mock test
router.post('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { schoolId, class: className, section, dueDate } = req.body;
    
    const assignment = await prisma.mockTestAssignment.create({
      data: {
        mockTestId: req.params.id,
        schoolId,
        class: className,
        section,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    res.json({ success: true, data: assignment });
  } catch (error: any) {
    console.error('Error assigning mock test:', error);
    res.status(500).json({ success: false, error: 'Failed to assign mock test' });
  }
});


// Get submissions for a mock test
router.get('/:id/submissions', async (req: Request, res: Response) => {
  try {
    const submissions = await prisma.mockTestSubmission.findMany({
      where: {
        assignment: {
          mockTestId: req.params.id
        }
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        assignment: {
          include: {
            mockTest: {
              include: { questions: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });
    res.json({ success: true, data: submissions });
  } catch (error: any) {
    console.error('Error fetching mock test submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});


// Submit a test
router.post('/submit/:assignmentId', async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, answers = {} } = req.body; // answers is an object: { questionId: answerText }

    // Find actual student ID because frontend passes userId
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: studentId },
          { userId: studentId }
        ]
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Fetch the test to auto-grade MCQs
    const assignment = await prisma.mockTestAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        mockTest: {
          include: { questions: true }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    let score = 0;
    
    // Simple auto-grading for MCQs
    for (const q of assignment.mockTest.questions) {
      if (q.type === 'mcq' && answers[q.id]) {
        // Compare string values directly (A == A)
        if (answers[q.id].trim().toUpperCase() === q.answer.trim().toUpperCase()) {
          score += q.marks;
        }
      }
    }

    const submission = await prisma.mockTestSubmission.create({
      data: {
        assignmentId,
        studentId: student.id,
        answers,
        score,
        status: 'GRADED'
      }
    });

    res.json({ success: true, data: submission });
  } catch (error: any) {
    console.error('Error submitting mock test:', error);
    res.status(500).json({ success: false, error: 'Failed to submit mock test' });
  }
});

export default router;
