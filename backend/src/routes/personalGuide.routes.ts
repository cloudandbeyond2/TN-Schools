import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { randomUUID } from 'crypto';
import { PersonalGuideHabitLog, PersonalGuideReward, AIChat } from '../models/mongo';
import https from 'https';

const router = Router();

// ─── GET /api/personal-guide?schoolId=&teacherId= ────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, teacherId, guidanceStatus, search } = req.query;

    const where: any = {};
    if (schoolId)       where.schoolId       = String(schoolId);
    if (teacherId)      where.teacherId      = String(teacherId);
    if (guidanceStatus) where.guidanceStatus = String(guidanceStatus);
    if (search) {
      where.OR = [
        { studentName: { contains: String(search), mode: 'insensitive' } },
        { goal:        { contains: String(search), mode: 'insensitive' } },
        { notes:       { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const data = await prisma.personalGuide.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ success: true, data, count: data.length });
  } catch (err: any) {
    console.error('[GET /api/personal-guide]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch guidance records' });
  }
});


// ─── POST /api/personal-guide ─────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      studentName, studentId, class: cls, section,
      academicScore, attendance, strengths, weaknesses,
      goal, parentContact, guidanceStatus, notes,
      lastMeeting, schoolId, teacherId,
    } = req.body;

    if (!studentName || !cls || !section) {
      return res.status(400).json({
        success: false,
        error: 'studentName, class, and section are required',
      });
    }

    const id  = randomUUID();
    const now = new Date();
    const strengthsArr  = Array.isArray(strengths)  ? strengths  : (strengths  ? [strengths]  : []);
    const weaknessesArr = Array.isArray(weaknesses) ? weaknesses : (weaknesses ? [weaknesses] : []);

    const rows: any[] = await prisma.$queryRaw`
      INSERT INTO "PersonalGuide"
        (id, "studentName", "studentId", class, section, "academicScore", attendance,
         strengths, weaknesses, goal, "parentContact", "guidanceStatus", notes,
         "lastMeeting", "schoolId", "teacherId", "createdAt", "updatedAt")
      VALUES
        (${id}, ${studentName}, ${studentId || null}, ${String(cls)}, ${String(section)},
         ${Number(academicScore) || 0}, ${Number(attendance) || 0},
         ${strengthsArr}, ${weaknessesArr},
         ${goal || 'Undecided'}, ${parentContact || 'N/A'},
         ${guidanceStatus || 'On Track'}, ${notes || null},
         ${lastMeeting || ''}, ${schoolId || null}, ${teacherId || null},
         ${now}, ${now})
      RETURNING *
    `;

    return res.status(201).json({
      success: true,
      data: rows[0],
      message: `Guide record for "${studentName}" created`,
    });
  } catch (err: any) {
    console.error('[POST /api/personal-guide]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to create guide record' });
  }
});


// ─── HABITS & REWARDS ENDPOINTS ───────────────────────────────────

const getDiffInDays = (dateStr1: string, dateStr2: string) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  d1.setHours(12, 0, 0, 0);
  d2.setHours(12, 0, 0, 0);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const dweckQuotes = [
  "Becoming is better than being.",
  "Love challenges, be intrigued by mistakes, enjoy effort, and keep on learning.",
  "No matter what your ability is, effort is what ignites that ability and turns it into accomplishment.",
  "Test scores and measures of achievement tell you where a student is, but they don't tell you where a student could end up.",
  "We like to think of our champions and idols as superheroes who were born different from us. We don't like to think of them as relatively ordinary people who made themselves extraordinary."
];

// GET /api/personal-guide/habits?studentId=XYZ
router.get('/habits', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ success: false, error: 'studentId is required' });

    const logs = await PersonalGuideHabitLog.find({ studentId: String(studentId) }).sort({ date: -1 }).limit(30);
    return res.json({ success: true, data: logs });
  } catch (err: any) {
    console.error('[GET /api/personal-guide/habits]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch habit logs' });
  }
});

// POST /api/personal-guide/habits
router.post('/habits', async (req: Request, res: Response) => {
  try {
    const { studentId, date, reflectionJournal, screenTimeBreak, sleepHours } = req.body;
    if (!studentId || !date) {
      return res.status(400).json({ success: false, error: 'studentId and date are required' });
    }

    // Points calculation
    let pointsEarned = 0;
    if (screenTimeBreak === true) pointsEarned += 10;
    if (sleepHours >= 7 && sleepHours <= 9) pointsEarned += 10;
    if (reflectionJournal && reflectionJournal.trim().length > 10) pointsEarned += 10;

    // Save habit log
    const existingLog = await PersonalGuideHabitLog.findOne({ studentId, date });
    let pointsDiff = pointsEarned;
    if (existingLog) {
      pointsDiff = pointsEarned - existingLog.pointsEarned;
      existingLog.screenTimeBreak = screenTimeBreak;
      existingLog.sleepHours = Number(sleepHours) || 0;
      existingLog.reflectionJournal = reflectionJournal;
      existingLog.pointsEarned = pointsEarned;
      await existingLog.save();
    } else {
      await PersonalGuideHabitLog.create({
        studentId,
        date,
        screenTimeBreak,
        sleepHours: Number(sleepHours) || 0,
        reflectionJournal,
        pointsEarned
      });
    }

    // Update reward streak and points
    let reward = await PersonalGuideReward.findOne({ studentId });
    if (!reward) {
      reward = new PersonalGuideReward({
        studentId,
        points: pointsEarned,
        streak: 1,
        lastLoggedDate: date,
        badges: []
      });
    } else {
      reward.points += pointsDiff;
      if (reward.points < 0) reward.points = 0;

      if (reward.lastLoggedDate) {
        const diff = getDiffInDays(date, reward.lastLoggedDate);
        if (diff === 1) {
          reward.streak += 1;
        } else if (diff > 1) {
          reward.streak = 1;
        }
        // if diff === 0, keep current streak
      } else {
        reward.streak = 1;
      }
      reward.lastLoggedDate = date;
    }

    // Effort badges logic
    const currentBadges = new Set(reward.badges);
    if (reward.points >= 50) currentBadges.add("Self-Care Rookie");
    if (reward.points >= 150) currentBadges.add("Self-Care Champion");
    if (reward.streak >= 3) currentBadges.add("Consistency Beginner");
    if (reward.streak >= 7) currentBadges.add("Habit Master");
    if (reflectionJournal && reflectionJournal.trim().length > 10) {
      currentBadges.add("Self-Reflective Mindset");
    }
    if (sleepHours >= 7 && sleepHours <= 9) {
      currentBadges.add("Rest & Recovery");
    }
    reward.badges = Array.from(currentBadges);

    await reward.save();

    const randomQuote = dweckQuotes[Math.floor(Math.random() * dweckQuotes.length)];
    const quoteMsg = `Carol Dweck Growth Mindset: "${randomQuote}"`;

    return res.json({
      success: true,
      data: reward,
      pointsDiff,
      quote: quoteMsg,
      message: pointsDiff > 0 
        ? `Great job logging! Earned +${pointsDiff} points.` 
        : 'Logged successfully. Keep up the effort!'
    });
  } catch (err: any) {
    console.error('[POST /api/personal-guide/habits]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to save habit log' });
  }
});

// GET /api/personal-guide/rewards?studentId=XYZ
router.get('/rewards', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ success: false, error: 'studentId is required' });

    let reward = await PersonalGuideReward.findOne({ studentId: String(studentId) });
    if (!reward) {
      reward = await PersonalGuideReward.create({
        studentId: String(studentId),
        points: 0,
        streak: 0,
        badges: []
      });
    }
    return res.json({ success: true, data: reward });
  } catch (err: any) {
    console.error('[GET /api/personal-guide/rewards]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch rewards' });
  }
});

// ─── CHAT & QUOTA ENDPOINTS ───────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    throw new Error('GEMINI_API_KEY is missing. Please add it to backend/.env');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 1000 },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            resolve(text);
          } else {
            reject(new Error('Invalid response format from Gemini: ' + JSON.stringify(json)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// GET /api/personal-guide/quota-status?studentId=XYZ
router.get('/quota-status', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ success: false, error: 'studentId is required' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const chats = await AIChat.find({
      studentId: String(studentId),
      subject: 'Personal Guide',
      createdAt: { $gte: startOfDay }
    });

    let messageCount = 0;
    for (const chat of chats) {
      messageCount += chat.messages.filter((m: any) => m.role === 'user').length;
    }

    return res.json({ success: true, count: messageCount, limit: 5 });
  } catch (err: any) {
    console.error('[GET /api/personal-guide/quota-status]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch quota status' });
  }
});

// POST /api/personal-guide/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { studentId, messages = [], currentMessage, studentName, className, lowestSubject, lowestScore, selectedEmotion } = req.body;
    if (!studentId || !currentMessage) {
      return res.status(400).json({ success: false, error: 'studentId and currentMessage are required' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Quota check
    const chats = await AIChat.find({
      studentId: String(studentId),
      subject: 'Personal Guide',
      createdAt: { $gte: startOfDay }
    });

    let messageCount = 0;
    for (const chat of chats) {
      messageCount += chat.messages.filter((m: any) => m.role === 'user').length;
    }

    if (messageCount >= 5) {
      return res.status(429).json({
        success: false,
        error: 'Daily message quota of 5 messages reached. Self-care also means taking screen breaks!'
      });
    }

    // 2. Build conversational history and context prompt
    const historyText = messages
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'AI Mentor'}: ${m.content}`)
      .join('\n');

    const scoreContext = lowestSubject 
      ? `Their current lowest scoring subject is "${lowestSubject}" with a score of ${lowestScore}%.`
      : 'They are doing fine in their subjects.';

    const emotionContext = selectedEmotion
      ? `Their self-reported mood/emotion is "${selectedEmotion}".`
      : 'They haven\'t specified their mood just now.';

    const classMatch = (className || '').match(/\d+/);
    const gradeLevel = classMatch ? parseInt(classMatch[0], 10) : 9;
    
    let ageGuidelines = '';
    if (gradeLevel >= 6 && gradeLevel <= 8) {
      ageGuidelines = `- The student is in Middle School (Class ${gradeLevel}). Address their emotional development, self-expression, bullying prevention, cyber-safety, digital netiquette, and help them explore general interests (Science, Arts, Sports, Business).`;
    } else {
      ageGuidelines = `- The student is in High School / Higher Secondary (Class ${gradeLevel}). Address their exam stress management, 4-7-8 breathing relaxation, peer pressure boundaries, and specific stream choices (Science, Commerce, Arts, Vocational) or career pathways (NEET, JEE, CA, Civil Services, ITI/Polytechnic).`;
    }

    const prompt = `
You are a supportive AI Personal Guide and Mentor for a student in a Tamil Nadu Government School.
Student details:
- Name: ${studentName || 'Student'}
- Class: ${className || 'Unknown Class'}
- Academic status: ${scoreContext}
- Current mood/emotion: ${emotionContext}

Guidelines:
${ageGuidelines}
- Give guidance on study habits (e.g., active recall, Pomodoro, spaced repetition).
- Offer vocational advice (career choosing paths) based on their interests and Tamil Nadu context (standard Group 1/2/3/4 vocational streams).
- Provide comforting personal advice on feelings, stress, and anxiety.
- Always use a Carol Dweck Growth Mindset approach: praise their effort, focus on how intelligence can grow with practice, and remind them that setbacks are opportunities to learn.
- Keep answers friendly, simple, and under 150 words.
- Encourage them to complete their self-care logs (reflection, screen-time break, sleep) and avoid comparison with others.

Conversation History:
${historyText}

Student: ${currentMessage}
AI Mentor:
`;

    // 3. Call Gemini
    const reply = await callGemini(prompt);

    // 4. Save to AIChat model
    let sessionChat = await AIChat.findOne({
      studentId: String(studentId),
      subject: 'Personal Guide',
      createdAt: { $gte: startOfDay }
    });

    if (sessionChat) {
      sessionChat.messages.push({ role: 'user', content: currentMessage, timestamp: new Date() });
      sessionChat.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
      await sessionChat.save();
    } else {
      await AIChat.create({
        studentId: String(studentId),
        sessionId: randomUUID(),
        subject: 'Personal Guide',
        language: 'english',
        messages: [
          { role: 'user', content: currentMessage, timestamp: new Date() },
          { role: 'assistant', content: reply, timestamp: new Date() }
        ]
      });
    }

    return res.json({
      success: true,
      text: reply,
      quotaUsed: messageCount + 1,
      quotaLimit: 5
    });
  } catch (err: any) {
    console.error('[POST /api/personal-guide/chat]', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to chat with AI Guide' });
  }
});

// POST /api/personal-guide/marks
router.post('/marks', async (req: Request, res: Response) => {
  try {
    const { studentId, subject, scored, maxMarks, examType } = req.body;
    if (!studentId || !subject || scored === undefined) {
      return res.status(400).json({ success: false, error: 'studentId, subject, and scored are required' });
    }

    // Upsert or create mark
    const existing = await prisma.mark.findFirst({
      where: {
        studentId: String(studentId),
        subject: String(subject),
        examType: String(examType || 'Mock Exam')
      }
    });

    let mark;
    if (existing) {
      mark = await prisma.mark.update({
        where: { id: existing.id },
        data: {
          scored: Number(scored),
          maxMarks: Number(maxMarks) || 100
        }
      });
    } else {
      mark = await prisma.mark.create({
        data: {
          studentId: String(studentId),
          subject: String(subject),
          scored: Number(scored),
          maxMarks: Number(maxMarks) || 100,
          examType: examType || 'Mock Exam',
          academicYear: '2024-25'
        }
      });
    }

    return res.json({ success: true, data: mark });
  } catch (err: any) {
    console.error('[POST /api/personal-guide/marks]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to save student mark' });
  }
});


// ─── DYNAMIC /:id ROUTES AT THE BOTTOM TO PREVENT CONFLICTS ─────────

// GET /api/personal-guide/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.personalGuide.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, error: 'Guide record not found' });
    return res.json({ success: true, data: item });
  } catch (err: any) {
    console.error('[GET /api/personal-guide/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch guide record' });
  }
});

// PUT /api/personal-guide/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.personalGuide.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Guide record not found' });

    const {
      studentName, class: cls, section, academicScore, attendance,
      strengths, weaknesses, goal, parentContact, guidanceStatus,
      notes, lastMeeting,
    } = req.body;

    const now = new Date();
    const strengthsArr  = strengths  !== undefined ? (Array.isArray(strengths)  ? strengths  : [strengths])  : existing.strengths;
    const weaknessesArr = weaknesses !== undefined ? (Array.isArray(weaknesses) ? weaknesses : [weaknesses]) : existing.weaknesses;

    const rows: any[] = await prisma.$queryRaw`
      UPDATE "PersonalGuide"
      SET
        "studentName"    = ${studentName    ?? existing.studentName},
        class            = ${cls            ?? existing.class},
        section          = ${section        ?? existing.section},
        "academicScore"  = ${academicScore  !== undefined ? Number(academicScore)  : existing.academicScore},
        attendance       = ${attendance     !== undefined ? Number(attendance)     : existing.attendance},
        strengths        = ${strengthsArr},
        weaknesses       = ${weaknessesArr},
        goal             = ${goal           ?? existing.goal},
        "parentContact"  = ${parentContact  ?? existing.parentContact},
        "guidanceStatus" = ${guidanceStatus ?? existing.guidanceStatus},
        notes            = ${notes          ?? existing.notes},
        "lastMeeting"    = ${lastMeeting    ?? existing.lastMeeting},
        "updatedAt"      = ${now}
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    return res.json({ success: true, data: rows[0], message: 'Guide record updated' });
  } catch (err: any) {
    console.error('[PUT /api/personal-guide/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update guide record' });
  }
});

export default router;


