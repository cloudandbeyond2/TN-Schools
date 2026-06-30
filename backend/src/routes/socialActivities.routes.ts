import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all social activities for a specific student by User ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // First find the Student record based on userId
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const activities = await prisma.socialActivity.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("Error fetching social activities:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create a new social activity
router.post("/", async (req, res) => {
  try {
    const { userId, type, description, hours } = req.body;

    if (!userId || !type || !description || !hours) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const newActivity = await prisma.socialActivity.create({
      data: {
        studentId: student.id,
        activityType: type,
        description,
        points: parseInt(hours, 10),
        updatedAt: new Date(),
      },
    });

    res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    console.error("Error creating social activity:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
