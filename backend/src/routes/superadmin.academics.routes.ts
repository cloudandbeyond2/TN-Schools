import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// --- Subjects ---

// List all subjects
router.get("/subjects", async (req: Request, res: Response) => {
  try {
    const { class: className, status } = req.query;
    const where: any = {};
    if (className) {
      where.OR = [
        { class: String(className) },
        { class: null },
        { class: "" }
      ];
    }
    if (status) {
      where.status = String(status);
    }

    const subjects = await prisma.academicSubject.findMany({
      where,
      orderBy: { name: "asc" },
    });
    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a subject
router.post("/subjects", async (req: Request, res: Response) => {
  try {
    const { name, color, icon, class: className, section, subjectCode, medium, description, status } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const subject = await prisma.academicSubject.create({
      data: { name, color, icon, class: className, section, subjectCode, medium, description, status },
    });
    res.status(201).json(subject);
  } catch (error: any) {
    console.error("Error creating subject:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Subject with this name already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a subject
router.put("/subjects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, icon, class: className, section, subjectCode, medium, description, status } = req.body;
    
    const subject = await prisma.academicSubject.update({
      where: { id },
      data: { name, color, icon, class: className, section, subjectCode, medium, description, status },
    });
    res.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a subject
router.delete("/subjects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.academicSubject.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Resources ---

// List resources (optionally filter by category, subject, and class)
router.get("/resources", async (req: Request, res: Response) => {
  try {
    const { category, subjectId, class: className, status } = req.query;
    const where: any = {};
    if (category) where.category = String(category);
    if (subjectId) where.subjectId = String(subjectId);
    if (className) {
      where.OR = [
        { class: String(className) },
        { class: null },
        { class: "" }
      ];
    }
    if (status) {
      where.status = String(status);
    }

    const resources = await prisma.academicResource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { subject: true },
    });
    res.json(resources);
  } catch (error: any) {
    console.error("Error fetching resources:", error.message, error.stack);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Create a resource
router.post("/resources", async (req: Request, res: Response) => {
  try {
    const { 
      title, subjectId, category, type, url, meta, description, addedBy, isNew, popular, 
      class: className, section, group, term, chapterNumber, topicName, learningOutcomes, 
      medium, bookVersion, publisher, language, coverImage, materialType, downloadAllowed, 
      chapter, lessonTitle, youtubeUrl, videoDuration, thumbnail, contentType, author, isbn, status 
    } = req.body;
    
    if (!title || !subjectId || !category || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const resource = await prisma.academicResource.create({
      data: {
        title, subjectId, category, type, url, meta, description, addedBy, isNew, popular, 
        class: className, section, group, term, chapterNumber, topicName, learningOutcomes, 
        medium, bookVersion, publisher, language, coverImage, materialType, downloadAllowed, 
        chapter, lessonTitle, youtubeUrl, videoDuration, thumbnail, contentType, author, isbn, status
      },
      include: { subject: true },
    });
    res.status(201).json(resource);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a resource
router.put("/resources/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, subjectId, category, type, url, meta, description, addedBy, isNew, popular, 
      class: className, section, group, term, chapterNumber, topicName, learningOutcomes, 
      medium, bookVersion, publisher, language, coverImage, materialType, downloadAllowed, 
      chapter, lessonTitle, youtubeUrl, videoDuration, thumbnail, contentType, author, isbn, status 
    } = req.body;

    const resource = await prisma.academicResource.update({
      where: { id },
      data: {
        title, subjectId, category, type, url, meta, description, addedBy, isNew, popular, 
        class: className, section, group, term, chapterNumber, topicName, learningOutcomes, 
        medium, bookVersion, publisher, language, coverImage, materialType, downloadAllowed, 
        chapter, lessonTitle, youtubeUrl, videoDuration, thumbnail, contentType, author, isbn, status
      },
      include: { subject: true },
    });
    res.json(resource);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a resource
router.delete("/resources/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.academicResource.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
