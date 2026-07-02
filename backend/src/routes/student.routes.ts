import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { BoardPrep, LanguageCoachingProgress } from '../models/mongo';
import https from 'https';

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


/* ------------------- LANGUAGE COACHING API HELPERS ------------------- */
const wordsList = [
  { word: "Opportunity", tamil: "வாய்ப்பு (Vaaippu)", example: "This is a great opportunity to learn English." },
  { word: "Magnificent", tamil: "அற்புதமான (Arputhamaana)", example: "The school building is magnificent." },
  { word: "Curiosity", tamil: "ஆர்வம் (Aarvam)", example: "Curiosity is key to learning new concepts." },
  { word: "Determine", tamil: "தீர்மானி (Theermaani)", example: "Your efforts determine your success." },
  { word: "Encourage", tamil: "ஊக்குவி (Ookkuvi)", example: "Teachers encourage students to speak in English." },
  { word: "Perseverance", tamil: "விடாமுயற்சி (Vidaamuyarchi)", example: "Perseverance helps you overcome obstacles." },
  { word: "Integrity", tamil: "நேர்மை (Naermai)", example: "Integrity is doing the right thing when no one is watching." }
];

async function callGeminiMaya(userMessage: string, history: Array<{role: string, content: string}> = []): Promise<{ text: string, audioText: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are Maya, a friendly AI Spoken English tutor for Tamil students. The student will converse with you in a mix of Tamil, English, and Tanglish (Tamil words written in English letters).
Your instructions:
1. Speak in a warm, bilingual manner (mix of simple English and Tamil/Tanglish).
2. Keep your response very conversational and encouraging.
3. If they make a grammatical error, politely show them how to say it correctly in English.
4. If they say something in Tamil or Tanglish, suggest how to say it in natural English.
5. Provide a JSON response in the following schema:
{
  "text": "Your bilingual chat response (containing the bilingual feedback or reply)",
  "audioText": "A clean English-only sentence representing the target English to speak aloud (which can be read by speech synthesis). Make it short and simple."
}

User Message: "${userMessage}"
Response JSON:`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 1024,
      responseMimeType: "application/json"
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = JSON.parse(text);
          resolve({
            text: parsed.text || "Super! Let's continue practicing.",
            audioText: parsed.audioText || ""
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(JSON.stringify(payload));
    req.end();
  });
}

/* ------------------- GET LANGUAGE COACHING DETAILS ------------------- */
router.get('/:id/language-coaching', async (req: Request, res: Response) => {
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

    // Get or Create progress stats in MongoDB
    let progress = await LanguageCoachingProgress.findOne({ studentId: student.id });
    if (!progress) {
      progress = await LanguageCoachingProgress.create({
        studentId: student.id,
        sentencesSpoken: 45,
        newWordsCount: 16,
        grammarScore: 78
      });
    }

    // Get badges from PostgreSQL (seed a few defaults if none exist)
    let badges = await prisma.studentBadge.findMany({
      where: { studentId: student.id }
    });

    if (badges.length === 0) {
      // Create default badges for a neat UI
      const defaultBadges = [
        { badgeName: "Fearless Speaker", desc: "Spoke 10 sentences today", icon: "🦁", color: "amber" },
        { badgeName: "Hospital Helper", desc: "Completed Doctor Roleplay", icon: "🏥", color: "rose" },
        { badgeName: "Tanglish Master", desc: "Used AI bridge 5 times", icon: "🤖", color: "indigo" }
      ];
      
      await Promise.all(defaultBadges.map(b => 
        prisma.studentBadge.create({
          data: {
            studentId: student.id,
            badgeName: b.badgeName,
            desc: b.desc,
            icon: b.icon,
            color: b.color
          }
        })
      ));

      badges = await prisma.studentBadge.findMany({
        where: { studentId: student.id }
      });
    }

    // Select dynamic Word of the Day
    const dayIndex = new Date().getDate() % wordsList.length;
    const wordOfTheDay = wordsList[dayIndex];

    res.json({
      success: true,
      data: {
        stats: [
          { label: "Sentences Spoken", value: String(progress.sentencesSpoken), color: "blue", trend: "+12 Today" },
          { label: "Fearless Badges", value: String(badges.length), color: "yellow", trend: "Top 10%" },
          { label: "New Words Used", value: String(progress.newWordsCount), color: "emerald", trend: "Vocab Growing" },
          { label: "Grammar Flow", value: `${progress.grammarScore}%`, color: "fuchsia", trend: "Improving!" }
        ],
        wordOfTheDay,
        badges: badges.map((b: any) => ({
          name: b.badgeName,
          desc: b.desc,
          icon: b.icon,
          color: b.color
        }))
      }
    });

  } catch (err) {
    console.error('Error fetching language coaching details:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/* ------------------- PROCESS LANGUAGE COACHING CHAT ------------------- */
router.post('/:id/language-coaching/chat', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { userId: id }
        ]
      }
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    // Increment Spoken Sentences
    await LanguageCoachingProgress.findOneAndUpdate(
      { studentId: student.id },
      { $inc: { sentencesSpoken: 1 } },
      { upsert: true }
    );

    try {
      const geminiReply = await callGeminiMaya(message);
      return res.json({
        success: true,
        data: geminiReply
      });
    } catch (apiError) {
      console.warn("Gemini call failed or API key missing, falling back to mock response.");
      // Fallback response parsing
      const lowerMsg = message.toLowerCase();
      let text = "Super! I hear you. To say that in English, we can try different words. Want to practice a simple dialogue together?";
      let audioText = "Super! I hear you. Want to practice a simple dialogue together?";

      if (lowerMsg.includes("bank") && lowerMsg.includes("leave")) {
        text = "Great question! You can ask: \n\n\"Is the bank closed tomorrow?\"";
        audioText = "Is the bank closed tomorrow?";
      } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
        text = "Hello! Epdi irukkinga? Ready to practice some English today? 😊";
        audioText = "Hello! Epdi irukkinga? Ready to practice some English today?";
      } else if (lowerMsg.includes("enna panra") || lowerMsg.includes("enna panringa") || lowerMsg.includes("enna seikiraai")) {
        text = "Naan unga kooda pesitu iruken! (I am talking with you!) In English you can ask: 'What are you doing?'. Try asking me that! 🌟";
        audioText = "I am talking with you. In English you can ask: What are you doing?";
      } else if (lowerMsg.includes("name enna") || lowerMsg.includes("unoda name") || lowerMsg.includes("unga name") || lowerMsg.includes("peyar enna")) {
        text = "En name Maya! Super kelvi. In English, you can ask: 'What is your name?'. Can you type that for me? 🙌";
        audioText = "My name is Maya. In English, you can ask: What is your name?";
      } else if (lowerMsg.includes("how are you") || lowerMsg.includes("eppadi irukka") || lowerMsg.includes("epdi irukka")) {
        text = "I'm doing great, nandri! How are you doing today? 👍";
        audioText = "I'm doing great, nandri! How are you doing today?";
      }

      return res.json({
        success: true,
        data: { text, audioText }
      });
    }

  } catch (err) {
    console.error('Error processing chat:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

/* ------------------- LOG PRONUNCIATION ATTEMPT ------------------- */
router.post('/:id/language-coaching/pronunciation', async (req: Request, res: Response) => {
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

    // Update stats: sentences spoken + 1, vocabulary words + 2
    const progress = await LanguageCoachingProgress.findOneAndUpdate(
      { studentId: student.id },
      { 
        $inc: { sentencesSpoken: 1, newWordsCount: 2 },
        $set: { grammarScore: 82 }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
