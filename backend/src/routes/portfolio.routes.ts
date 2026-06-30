import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// GET /api/portfolio/:studentId
router.get('/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    let portfolio = await prisma.portfolio.findUnique({
      where: { studentId },
      include: {
        skills: true,
        projects: true,
        achievements: true,
        student: {
          include: { school: true }
        }
      }
    });

    // If a specific student's portfolio isn't found, try to fetch the first demo student's portfolio
    if (!portfolio) {
      const demoStudent = await prisma.student.findFirst();
      if (demoStudent) {
        portfolio = await prisma.portfolio.findUnique({
          where: { studentId: demoStudent.id },
          include: {
            skills: true,
            projects: true,
            achievements: true,
            student: {
              include: { school: true }
            }
          }
        });
      }
    }

    if (!portfolio) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: portfolio.student.userId }
    });

    // Format the response to match what the frontend expects
    const formattedData = {
      profile: {
        name: user?.name || "Student",
        class: portfolio.student.class,
        section: portfolio.student.section,
        stream: portfolio.stream,
        bio: portfolio.bio,
        projectsCount: portfolio.projects.length,
        awardsCount: portfolio.achievements.length
      },
      skills: portfolio.skills,
      projects: portfolio.projects,
      achievements: portfolio.achievements
    };

    res.json({ success: true, data: formattedData });
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/portfolio — Create or update portfolio
router.post('/', async (req: Request, res: Response) => {
  try {
    const { studentId, bio, stream } = req.body;
    
    const portfolio = await prisma.portfolio.upsert({
      where: { studentId },
      update: { bio, stream },
      create: { studentId, bio, stream }
    });

    res.json({ success: true, data: portfolio });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
