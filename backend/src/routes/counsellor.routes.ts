import { Router, Request, Response } from 'express';
import { Wellness, CounsellorBooking } from '../models/mongo';

const router = Router();

// POST /api/counsellor/message — Submit a message to the counsellor (logs into Wellness)
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { studentId, mood, topic, feedbackText, isAnonymous } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, error: 'studentId is required' });
    }

    // Default stressScore logic based on mood just for Wellness compatibility
    let stressScore = 5;
    if (mood === 'Angry' || mood === 'Anxious' || mood === 'Sad' || mood === 'கோபம்' || mood === 'பதற்றம்' || mood === 'கவலை') {
      stressScore = 8;
    }

    const notes = `[Topic: ${topic}] [Anonymous: ${isAnonymous}]\n${feedbackText}`;

    // Create a new Wellness entry for every message (so they can submit multiple)
    const entry = await Wellness.create({
      studentId: isAnonymous ? 'ANONYMOUS_' + studentId : studentId,
      mood: 'okay', // Standardizing on 'okay' for the model's enum if it doesn't match perfectly
      stressScore,
      notes,
      counselingReferred: true,
      date: new Date(),
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error("COUNSELLOR MESSAGE ERROR:", err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/counsellor/booking — Book a counsellor session
router.post('/booking', async (req: Request, res: Response) => {
  try {
    const { studentId, slot, topic, isAnonymous } = req.body;

    if (!studentId || !slot) {
      return res.status(400).json({ success: false, error: 'studentId and slot are required' });
    }

    const booking = await CounsellorBooking.create({
      studentId: isAnonymous ? 'ANONYMOUS_' + studentId : studentId,
      slot,
      topic,
      isAnonymous,
      status: 'booked'
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error("COUNSELLOR BOOKING ERROR:", err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
