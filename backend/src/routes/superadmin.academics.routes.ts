import { Router, Request, Response } from "express";
import https from "https";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { randomUUID } from "crypto";
import { authenticate, requireMinRole } from "../middleware/auth.middleware";
import { UPLOAD_LIMITS, documentFileFilter } from "../utils/uploads";
import { uploadBuffer } from "../services/storage.service";

const router = Router();
const prisma = new PrismaClient();

// Files buffer in memory and go through the storage service, which routes to
// the superadmin-configured provider (local disk / S3 / custom server).
const upload = multer({ storage: multer.memoryStorage(), limits: UPLOAD_LIMITS, fileFilter: documentFileFilter });

// Reads require any logged-in user; content management requires headmaster and above.
router.use(authenticate);

router.post("/upload", requireMinRole("HEADMASTER"), (req: Request, res: Response, next: any) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds the 500 MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload file." });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { url } = await uploadBuffer({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      folder: "academics",
    });
    res.json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Ensure AcademicClass and AcademicSection tables exist in PostgreSQL and seed defaults if empty
async function ensureAcademicTablesExist() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AcademicClass" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "status" TEXT DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AcademicSection" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "status" TEXT DEFAULT 'Active',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE "AcademicSubject" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "AcademicResource" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;`);

    // Ensure default classes exist
    const classCount = await prisma.academicClass.count();
    if (classCount === 0) {
      const defaultClasses = Array.from({ length: 12 }, (_, i) => ({
        id: randomUUID(),
        name: `Class ${i + 1}`,
        status: "Active",
      }));
      await prisma.academicClass.createMany({ data: defaultClasses });
    }

    // Ensure default subjects exist
    const subjectCount = await prisma.academicSubject.count();
    if (subjectCount === 0) {
      const classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const data: any[] = [];
      const masters = [
        { name: 'Tamil', color: '#ef4444', icon: 'scroll' },
        { name: 'English', color: '#3b82f6', icon: 'comment-alt' },
        { name: 'Mathematics', color: '#8b5cf6', icon: 'calculator' },
        { name: 'Science', color: '#10b981', icon: 'flask' },
        { name: 'Social Science', color: '#f59e0b', icon: 'globe' },
        { name: 'Physics', color: '#06b6d4', icon: 'atom' },
        { name: 'Chemistry', color: '#ec4899', icon: 'test-tube' },
        { name: 'Biology', color: '#84cc16', icon: 'dna' },
        { name: 'Computer Science', color: '#6366f1', icon: 'laptop-code' },
        { name: 'Commerce', color: '#14b8a6', icon: 'briefcase' },
        { name: 'Accountancy', color: '#f97316', icon: 'file-invoice' },
        { name: 'Economics', color: '#a855f7', icon: 'chart-line' },
      ];
      for (const m of masters) {
        data.push({ id: randomUUID(), name: m.name, color: m.color, icon: m.icon, class: null, status: 'Active' });
      }
      for (const c of classes) {
        const list = c >= 11 ? [
          { name: 'Tamil', color: '#ef4444' },
          { name: 'English', color: '#3b82f6' },
          { name: 'Mathematics', color: '#8b5cf6' },
          { name: 'Physics', color: '#06b6d4' },
          { name: 'Chemistry', color: '#ec4899' },
          { name: 'Biology', color: '#84cc16' },
          { name: 'Computer Science', color: '#6366f1' },
          { name: 'Commerce', color: '#14b8a6' },
          { name: 'Accountancy', color: '#f97316' },
          { name: 'Economics', color: '#a855f7' },
        ] : [
          { name: 'Tamil', color: '#ef4444' },
          { name: 'English', color: '#3b82f6' },
          { name: 'Mathematics', color: '#8b5cf6' },
          { name: 'Science', color: '#10b981' },
          { name: 'Social Science', color: '#f59e0b' },
        ];
        for (const s of list) {
          data.push({ id: randomUUID(), name: s.name, color: s.color, class: String(c), status: 'Active' });
        }
      }
      await prisma.academicSubject.createMany({ data });
    }
  } catch (e) {
    console.error("Error creating academic tables/columns:", e);
  }
}

// --- Classes ---
router.get("/classes", async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    let classes: any[] = [];
    try {
      if ((prisma as any).academicClass) {
        classes = await (prisma as any).academicClass.findMany({
          orderBy: { name: "asc" },
        });
      } else {
        throw new Error("academicClass model not loaded");
      }
    } catch {
      classes = await prisma.$queryRawUnsafe(`SELECT "id", "name", "status" FROM "AcademicClass" ORDER BY "name" ASC`);
    }
    res.json(classes);
  } catch (error: any) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes", details: error.message });
  }
});

router.post("/classes", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Class name is required" });
    }
    const cleanName = String(name).trim();
    const id = randomUUID();

    let result: any = null;
    try {
      if ((prisma as any).academicClass) {
        result = await (prisma as any).academicClass.upsert({
          where: { name: cleanName },
          update: { updatedAt: new Date() },
          create: { id, name: cleanName, status: "Active" },
        });
      } else {
        throw new Error("academicClass model not loaded");
      }
    } catch {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AcademicClass" ("id", "name", "status", "createdAt", "updatedAt") VALUES ($1, $2, 'Active', NOW(), NOW()) ON CONFLICT ("name") DO UPDATE SET "updatedAt" = NOW()`,
        id,
        cleanName
      );
      result = { id, name: cleanName, status: "Active" };
    }
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Error creating class:", error);
    res.status(500).json({ error: "Failed to create class", details: error.message });
  }
});

router.delete("/classes/:id", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { id } = req.params;
    try {
      if ((prisma as any).academicClass) {
        await (prisma as any).academicClass.delete({ where: { id } });
      } else {
        throw new Error("academicClass model not loaded");
      }
    } catch {
      await prisma.$executeRawUnsafe(`DELETE FROM "AcademicClass" WHERE "id" = $1`, id);
    }
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting class:", error);
    res.status(500).json({ error: "Failed to delete class", details: error.message });
  }
});

router.put("/classes/:id", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Class name is required" });
    }
    const cleanName = String(name).trim();
    let result: any = null;
    try {
      if ((prisma as any).academicClass) {
        result = await (prisma as any).academicClass.update({
          where: { id },
          data: { name: cleanName, updatedAt: new Date() }
        });
      } else {
        throw new Error("academicClass model not loaded");
      }
    } catch {
      await prisma.$executeRawUnsafe(`UPDATE "AcademicClass" SET "name" = $1, "updatedAt" = NOW() WHERE "id" = $2`, cleanName, id);
      result = { id, name: cleanName };
    }
    res.json(result);
  } catch (error: any) {
    console.error("Error updating class:", error);
    res.status(500).json({ error: "Failed to update class", details: error.message });
  }
});

// --- Sections ---
router.get("/sections", async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    let sections: any[] = [];
    try {
      if ((prisma as any).academicSection) {
        sections = await (prisma as any).academicSection.findMany({
          orderBy: { name: "asc" },
        });
      } else {
        throw new Error("academicSection model not loaded");
      }
    } catch {
      sections = await prisma.$queryRawUnsafe(`SELECT "id", "name", "status" FROM "AcademicSection" ORDER BY "name" ASC`);
    }
    res.json(sections);
  } catch (error: any) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ error: "Failed to fetch sections", details: error.message });
  }
});

router.post("/sections", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Section name is required" });
    }
    const cleanName = String(name).trim();
    const id = randomUUID();

    let result: any = null;
    try {
      if ((prisma as any).academicSection) {
        result = await (prisma as any).academicSection.upsert({
          where: { name: cleanName },
          update: { updatedAt: new Date() },
          create: { id, name: cleanName, status: "Active" },
        });
      } else {
        throw new Error("academicSection model not loaded");
      }
    } catch {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AcademicSection" ("id", "name", "status", "createdAt", "updatedAt") VALUES ($1, $2, 'Active', NOW(), NOW()) ON CONFLICT ("name") DO UPDATE SET "updatedAt" = NOW()`,
        id,
        cleanName
      );
      result = { id, name: cleanName, status: "Active" };
    }
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Error creating section:", error);
    res.status(500).json({ error: "Failed to create section", details: error.message });
  }
});

router.delete("/sections/:id", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { id } = req.params;
    try {
      if ((prisma as any).academicSection) {
        await (prisma as any).academicSection.delete({ where: { id } });
      } else {
        throw new Error("academicSection model not loaded");
      }
    } catch {
      await prisma.$executeRawUnsafe(`DELETE FROM "AcademicSection" WHERE "id" = $1`, id);
    }
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting section:", error);
    res.status(500).json({ error: "Failed to delete section", details: error.message });
  }
});

router.put("/sections/:id", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Section name is required" });
    }
    const cleanName = String(name).trim();
    let result: any = null;
    try {
      if ((prisma as any).academicSection) {
        result = await (prisma as any).academicSection.update({
          where: { id },
          data: { name: cleanName, updatedAt: new Date() }
        });
      } else {
        throw new Error("academicSection model not loaded");
      }
    } catch {
      await prisma.$executeRawUnsafe(`UPDATE "AcademicSection" SET "name" = $1, "updatedAt" = NOW() WHERE "id" = $2`, cleanName, id);
      result = { id, name: cleanName };
    }
    res.json(result);
  } catch (error: any) {
    console.error("Error updating section:", error);
    res.status(500).json({ error: "Failed to update section", details: error.message });
  }
});

// --- Subjects ---

// List all subjects
router.get("/subjects", async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { class: className, status, schoolId } = req.query;
    const targetSchoolId = (schoolId as string) || req.user?.schoolId || null;

    const where: any = {};

    if (className) {
      const clsStr = String(className).trim();
      const numMatch = clsStr.match(/\d+/)?.[0];
      const classVariants = Array.from(new Set([
        clsStr,
        clsStr.toLowerCase(),
        clsStr.toUpperCase(),
        `Class ${clsStr}`,
        `CLASS ${clsStr}`,
        numMatch || "",
        numMatch ? `Class ${numMatch}` : "",
        numMatch ? `CLASS ${numMatch}` : "",
      ])).filter(Boolean);

      // Return subjects matching the requested class as well as general/master subjects
      where.OR = [
        ...classVariants.map(c => ({ class: c })),
        { class: null },
        { class: "" },
        { class: "All" },
        { class: "General" }
      ];
    }

    if (status) {
      const st = String(status).trim();
      where.status = {
        in: Array.from(new Set([st, st.toLowerCase(), st.toUpperCase(), "Active", "Approved", "ACTIVE", "APPROVED"]))
      };
    }

    if (targetSchoolId) {
      where.AND = [
        {
          OR: [
            { schoolId: targetSchoolId },
            { schoolId: null },
            { schoolId: "" }
          ]
        }
      ];
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

// Create or update a subject
router.post("/subjects", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { name, color, icon, class: className, section, subjectCode, medium, description, status, schoolId } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ error: "Name is required" });

    const cleanName = String(name).trim();
    const cleanClass = className ? String(className).trim() : null;
    const targetSchoolId = schoolId || req.user?.schoolId || null;

    // Check if subject with this exact name and class already exists
    const existing = await prisma.academicSubject.findFirst({
      where: {
        name: cleanName,
        class: cleanClass,
      },
    });

    if (existing) {
      // Update existing subject record for this class
      const updated = await prisma.academicSubject.update({
        where: { id: existing.id },
        data: {
          color: color || existing.color,
          icon: icon || existing.icon,
          section: section !== undefined ? section : existing.section,
          subjectCode: subjectCode || existing.subjectCode,
          medium: medium || existing.medium,
          description: description || existing.description,
          status: status || existing.status,
          schoolId: targetSchoolId || (existing as any).schoolId,
        } as any,
      });
      return res.status(200).json(updated);
    }

    // Otherwise create new subject record
    const subject = await prisma.academicSubject.create({
      data: {
        name: cleanName,
        color,
        icon,
        class: cleanClass,
        section,
        subjectCode,
        medium,
        description,
        schoolId: targetSchoolId,
        status: status || "Active",
      } as any,
    });
    return res.status(201).json(subject);
  } catch (error: any) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "Failed to save subject", details: error.message });
  }
});

// Update a subject
router.put("/subjects/:id", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { id } = req.params;
    const { name, color, icon, class: className, section, subjectCode, medium, description, status, schoolId } = req.body;
    const targetSchoolId = schoolId || req.user?.schoolId || undefined;

    const subject = await prisma.academicSubject.update({
      where: { id },
      data: { 
        name, color, icon, class: className, section, subjectCode, medium, description, status,
        ...(targetSchoolId !== undefined ? { schoolId: targetSchoolId } : {})
      },
    });
    res.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a subject
router.delete("/subjects/:id", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
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

// List resources (optionally filter by category, subject, class, and schoolId)
router.get("/resources", async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { category, subjectId, class: className, status, schoolId } = req.query;
    const targetSchoolId = (schoolId as string) || req.user?.schoolId || null;

    const where: any = {};
    if (category) {
      const catStr = String(category).trim();
      where.category = {
        in: Array.from(new Set([catStr, catStr.toLowerCase(), catStr.toUpperCase()]))
      };
    }
    if (subjectId) where.subjectId = String(subjectId);

    if (className) {
      const clsStr = String(className).trim();
      const numMatch = clsStr.match(/\d+/)?.[0];
      const classVariants = Array.from(new Set([
        clsStr,
        clsStr.toLowerCase(),
        clsStr.toUpperCase(),
        `Class ${clsStr}`,
        `CLASS ${clsStr}`,
        numMatch || "",
        numMatch ? `Class ${numMatch}` : "",
        numMatch ? `CLASS ${numMatch}` : "",
      ])).filter(Boolean);

      const orConditions: any[] = classVariants.map(c => ({ class: c }));
      if (numMatch) {
        orConditions.push({ class: { contains: numMatch, mode: "insensitive" } });
      }
      where.OR = orConditions;
    }

    if (status) {
      const st = String(status).trim();
      where.status = {
        in: Array.from(new Set([st, st.toLowerCase(), st.toUpperCase(), "Active", "Approved", "ACTIVE", "APPROVED"]))
      };
    }

    if (targetSchoolId) {
      where.AND = [
        {
          OR: [
            { schoolId: targetSchoolId },
            { schoolId: null },
            { schoolId: "" }
          ]
        }
      ];
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
router.post("/resources", requireMinRole("TEACHER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { 
      title, subjectId, category, type, url, meta, description, addedBy, isNew, popular, 
      class: className, section, group, term, chapterNumber, topicName, learningOutcomes, 
      medium, bookVersion, publisher, language, coverImage, materialType, downloadAllowed, 
      chapter, lessonTitle, youtubeUrl, videoDuration, thumbnail, contentType, author, isbn, status, schoolId 
    } = req.body;
    
    if (!title || !subjectId || !category || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const targetSchoolId = schoolId || req.user?.schoolId || null;

    let finalSubjectId = subjectId;
    const existingSubject = await prisma.academicSubject.findUnique({ where: { id: subjectId } });
    if (!existingSubject) {
      const byName = await prisma.academicSubject.findFirst({
        where: {
          name: { equals: String(subjectId).trim(), mode: "insensitive" },
        },
      });
      if (byName) {
        finalSubjectId = byName.id;
      } else {
        const createdSub = await prisma.academicSubject.create({
          data: {
            name: String(subjectId).trim(),
            class: className ? String(className).trim() : null,
            status: "Active",
          },
        });
        finalSubjectId = createdSub.id;
      }
    }

    const resource = await prisma.academicResource.create({
      data: {
        title, subjectId: finalSubjectId, category, type, url, meta, description, addedBy, isNew, popular, 
        class: className, section, group, term, chapterNumber, topicName, learningOutcomes, 
        medium, bookVersion, publisher, language, coverImage, materialType, downloadAllowed, 
        chapter, lessonTitle, youtubeUrl, videoDuration, thumbnail, contentType, author, isbn, status,
        schoolId: targetSchoolId
      } as any,
      include: { subject: true },
    });
    res.status(201).json(resource);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a resource
router.put("/resources/:id", requireMinRole("TEACHER"), async (req: Request, res: Response) => {
  try {
    await ensureAcademicTablesExist();
    const { id } = req.params;
    const { 
      title, subjectId, category, type, url, meta, description, addedBy, isNew, popular, 
      class: className, section, group, term, chapterNumber, topicName, learningOutcomes, 
      medium, bookVersion, publisher, language, coverImage, materialType, downloadAllowed, 
      chapter, lessonTitle, youtubeUrl, videoDuration, thumbnail, contentType, author, isbn, status, schoolId 
    } = req.body;

    const targetSchoolId = schoolId || req.user?.schoolId || undefined;

    let finalSubjectId = subjectId;
    if (subjectId) {
      const existingSubject = await prisma.academicSubject.findUnique({ where: { id: subjectId } });
      if (!existingSubject) {
        const byName = await prisma.academicSubject.findFirst({
          where: {
            name: { equals: String(subjectId).trim(), mode: "insensitive" },
          },
        });
        if (byName) {
          finalSubjectId = byName.id;
        } else {
          const createdSub = await prisma.academicSubject.create({
            data: {
              name: String(subjectId).trim(),
              class: className ? String(className).trim() : null,
              status: "Active",
            },
          });
          finalSubjectId = createdSub.id;
        }
      }
    }

    const resource = await prisma.academicResource.update({
      where: { id },
      data: {
        title, ...(finalSubjectId ? { subjectId: finalSubjectId } : {}), category, type, url, meta, description, addedBy, isNew, popular, 
        class: className, section, group, term, chapterNumber, topicName, learningOutcomes, 
        medium, bookVersion, publisher, language, coverImage, materialType, downloadAllowed, 
        chapter, lessonTitle, youtubeUrl, videoDuration, thumbnail, contentType, author, isbn, status,
        ...(targetSchoolId !== undefined ? { schoolId: targetSchoolId } : {})
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
router.delete("/resources/:id", requireMinRole("TEACHER"), async (req: Request, res: Response) => {
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

// --- AI Parsing ---

async function callGeminiMultimodal(prompt: string, base64Image: string, mimeType: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please add it to your environment.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

  let cleanBase64 = base64Image;
  if (base64Image.includes(';base64,')) {
    cleanBase64 = base64Image.split(';base64,')[1];
  }

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || 'image/png',
              data: cleanBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 8192
    }
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-goog-api-key': apiKey,
      },
    };

    const req = https.request(url, options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          reject(new Error(`Gemini API error ${res.statusCode}: ${body}`));
          return;
        }
        try {
          const parsed = JSON.parse(body);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            reject(new Error('Empty content from Gemini.'));
            return;
          }
          resolve(JSON.parse(text));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${String(e)}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(60000, () => req.destroy(new Error('Gemini API timed out')));
    req.write(postData);
    req.end();
  });
}

router.post("/parse-syllabus-ai", requireMinRole("HEADMASTER"), async (req: Request, res: Response) => {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image base64 data is required." });
    }

    const prompt = `Analyze this syllabus image (which lists chapters/units and their sub-chapters/topics) and extract the entire structure. Return a JSON array of Units, where each unit has 'title' (string, e.g., 'Unit 1: Prose, Poem & Supplementary'), 'term' (string, e.g., 'Term 1' or 'Full Year' if not specified), and 'subtopics' (an array of strings representing the subtopics). Do not include any formatting, markdown, backticks, or code blocks. Return a raw JSON array: [ { "title": "Unit 1: Prose & Poetry", "term": "Term 1", "subtopics": [ "Prose: His First Flight", "Poem: Life" ] } ]`;
    
    console.log("Calling Gemini multimodal to parse syllabus screenshot for academics hub...");
    const parsedData = await callGeminiMultimodal(prompt, image, mimeType || 'image/png');
    
    if (!Array.isArray(parsedData)) {
      throw new Error("Invalid response format from AI. Expected JSON array.");
    }

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("AI Syllabus Parser Error:", error);
    res.status(500).json({ error: error.message || "Failed to process syllabus image with AI" });
  }
});

export default router;
