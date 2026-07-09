import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// GET /api/portfolio/:studentId
router.get('/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const queryIncludes = {
      skills: true,
      projects: true,
      achievements: true,
      student: {
        include: {
          school: true,
          clubMembers: {
            include: {
              club: true
            }
          },
          sportsProfile: {
            include: {
              teams: true,
              stats: true,
              events: true
            }
          },
          socialActivities: true,
          marks: {
            take: 10,
            orderBy: { createdAt: 'desc' as const }
          }
        }
      }
    };

    let portfolio = await prisma.portfolio.findUnique({
      where: { studentId },
      include: queryIncludes
    });

    // If portfolio doesn't exist but student exists, initialize one automatically
    if (!portfolio && studentId !== 'demo-student') {
      const studentExists = await prisma.student.findUnique({ where: { id: studentId } });
      if (studentExists) {
        portfolio = await prisma.portfolio.create({
          data: {
            studentId,
            bio: "Welcome to my digital portfolio!",
            stream: "General"
          },
          include: queryIncludes
        });
      }
    }

    // If a specific student's portfolio isn't found, try to fetch the first demo student's portfolio
    if (!portfolio) {
      const demoStudent = await prisma.student.findFirst();
      if (demoStudent) {
        portfolio = await prisma.portfolio.findUnique({
          where: { studentId: demoStudent.id },
          include: queryIncludes
        });
      }
    }

    if (!portfolio) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: portfolio.student.userId }
    });

    // Format the response to match what the frontend expects, including advanced tables
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
      achievements: portfolio.achievements,
      clubs: portfolio.student.clubMembers.map(cm => ({
        name: cm.club.name,
        role: cm.role,
        category: cm.club.category,
        icon: cm.club.icon,
        themeColor: cm.club.themeColor,
        themeBg: cm.club.themeBg
      })),
      sports: portfolio.student.sportsProfile ? {
        teams: portfolio.student.sportsProfile.teams,
        stats: portfolio.student.sportsProfile.stats,
        events: portfolio.student.sportsProfile.events
      } : null,
      socialActivities: portfolio.student.socialActivities,
      marksSummary: portfolio.student.marks.map(m => ({
        subject: m.subject,
        examName: m.examType,
        marksObtained: m.scored,
        maxMarks: m.maxMarks,
        remarks: m.grade
      }))
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
