import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// GET /api/activities — Fetch all clubs and events
router.get('/', async (req: Request, res: Response) => {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { name: 'asc' }
    });

    const events = await prisma.clubEvent.findMany({
      orderBy: { eventDate: 'asc' },
      take: 5
    });

    // For demo purposes, fetch the first student's joined clubs
    const demoStudent = await prisma.student.findFirst();
    let formattedMyClubs: any[] = [];
    if (demoStudent) {
      const myClubs = await prisma.clubMember.findMany({
        where: { studentId: demoStudent.id },
        include: { club: true }
      });
      formattedMyClubs = myClubs.map(member => ({
        name: member.club.name,
        role: member.role,
        icon: member.club.icon,
        color: member.club.themeColor,
        nextEvent: "See details in club page" 
      }));
    }

    res.json({ success: true, data: { discoverClubs: clubs, upcomingEvents: events, myClubs: formattedMyClubs } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/activities/student/:studentId — Fetch clubs for a specific student
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;

    const myClubs = await prisma.clubMember.findMany({
      where: { studentId },
      include: {
        club: true
      }
    });

    // Transform the data to match the frontend shape
    const formattedMyClubs = myClubs.map(member => ({
      name: member.club.name,
      role: member.role,
      icon: member.club.icon,
      color: member.club.themeColor,
      nextEvent: "See details in club page" // Placeholder since we didn't add events per club yet
    }));

    res.json({ success: true, data: { myClubs: formattedMyClubs } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/activities/clubs — Create a new club (Headmaster)
router.post('/clubs', async (req: Request, res: Response) => {
  try {
    const { name, category, icon, themeColor, themeBg, themeTagBg, description, sponsor, meetingTime, schoolId } = req.body;
    
    const club = await prisma.club.create({
      data: {
        name,
        category,
        icon,
        themeColor,
        themeBg,
        themeTagBg,
        description,
        sponsor,
        meetingTime,
        schoolId
      }
    });
    
    res.json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/activities/events — Create a new event (Teacher/Sponsor)
router.post('/events', async (req: Request, res: Response) => {
  try {
    const { title, eventDate, type, icon, themeColor, clubId, schoolId } = req.body;
    
    const event = await prisma.clubEvent.create({
      data: {
        title,
        eventDate: new Date(eventDate),
        type,
        icon,
        themeColor,
        clubId,
        schoolId
      }
    });
    
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/activities/clubs/:id — Delete a club (PET/Headmaster)
router.delete('/clubs/:id', async (req: Request, res: Response) => {
  try {
    await prisma.club.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/activities/club/:id — Fetch a single club details
router.get('/club/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { eventDate: 'asc' }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    res.json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/activities/club/:id/members — List club members with student details (PET/Headmaster)
router.get('/club/:id/members', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const members = await prisma.clubMember.findMany({
      where: { clubId: id },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { joinedAt: 'asc' }
    });

    const formatted = members.map(m => ({
      id: m.id,
      studentId: m.studentId,
      name: m.student.user?.name || 'Student',
      class: m.student.class,
      section: m.student.section,
      role: m.role,
      joinedAt: m.joinedAt
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/activities/club/:id/membership/:studentId — Check if student is already a member
router.get('/club/:id/membership/:studentId', async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;
    const member = await prisma.clubMember.findUnique({
      where: { clubId_studentId: { clubId: id, studentId } }
    });
    res.json({ success: true, isMember: !!member, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/activities/join — Student joins a club
router.post('/join', async (req: Request, res: Response) => {
  try {
    const { clubId, studentId } = req.body;
    if (!clubId || !studentId) {
      return res.status(400).json({ success: false, error: 'clubId and studentId are required' });
    }

    // Check if already a member
    const existing = await prisma.clubMember.findUnique({
      where: { clubId_studentId: { clubId, studentId } }
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Already a member of this club' });
    }

    const member = await prisma.clubMember.create({
      data: { clubId, studentId, role: 'Member' }
    });

    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/activities/leave — Student leaves a club
router.delete('/leave', async (req: Request, res: Response) => {
  try {
    const { clubId, studentId } = req.body;
    await prisma.clubMember.delete({
      where: { clubId_studentId: { clubId, studentId } }
    });
    res.json({ success: true, message: 'Left club successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
