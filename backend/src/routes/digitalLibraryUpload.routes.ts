import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For demo purposes on cloud servers (Vercel/Render), use the OS temp directory
    // since the local filesystem is usually read-only.
    const dir = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();

// GET /api/digital-library-upload
// Fetch approved resources for students (can be combined with main API in frontend)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, subject, type, class: cls, search } = req.query;

    const where: any = { approvalStatus: 'APPROVED' };
    const conditions: any[] = [];

    if (schoolId) {
      conditions.push({
        OR: [
          { schoolId: String(schoolId) },
          { schoolId: null } // Global resources
        ]
      });
    }

    if (subject) where.subject = String(subject);
    if (type) where.type = String(type);
    if (cls) where.class = String(cls);
    if (search) {
      conditions.push({
        OR: [
          { title: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ]
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const data = await prisma.digitalLibraryUpload.findMany({
      where,
      orderBy: { uploadDate: 'desc' },
    });

    return res.json({ success: true, data, count: data.length });
  } catch (err: any) {
    console.error('[GET /api/digital-library-upload]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch resources' });
  }
});

// GET /api/digital-library-upload/pending
// Fetch pending resources for a specific school (For Headmaster)
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) return res.status(400).json({ success: false, error: 'schoolId required' });

    const data = await prisma.digitalLibraryUpload.findMany({
      where: {
        schoolId: String(schoolId),
        approvalStatus: 'PENDING'
      },
      orderBy: { uploadDate: 'desc' },
    });

    return res.json({ success: true, data, count: data.length });
  } catch (err: any) {
    console.error('[GET /api/digital-library-upload/pending]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch pending resources' });
  }
});

// GET /api/digital-library-upload/school/:schoolId
// Fetch all resources (approved and pending) for a school (For Headmaster Management)
router.get('/school/:schoolId', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const data = await prisma.digitalLibraryUpload.findMany({
      where: { schoolId: String(schoolId) },
      orderBy: { uploadDate: 'desc' },
    });

    return res.json({ success: true, data, count: data.length });
  } catch (err: any) {
    console.error('[GET /api/digital-library-upload/school]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch school resources' });
  }
});

// POST /api/digital-library-upload
// Upload a new resource (Super Admin, Headmaster, Teacher)
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { title, type, subject, class: cls, description, schoolId, role, userId, tags } = req.body;
    let { fileUrl } = req.body;

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    if (!title || !type || !subject || !cls || !role || !userId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Determine approval status based on role
    // Headmaster uploads are auto-approved for their school.
    // Super Admin and Teacher uploads go to PENDING for Headmaster to review.
    let approvalStatus = 'PENDING';
    if (role === 'HEADMASTER') {
      approvalStatus = 'APPROVED';
    }

    const normalizedSchoolId = schoolId && schoolId !== 'global' ? String(schoolId) : null;
    let normalizedTags: string[] = [];
    if (tags) {
      try {
        normalizedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        normalizedTags = [String(tags)];
      }
    }

    const newUpload = await prisma.digitalLibraryUpload.create({
      data: {
        title: String(title),
        type: String(type),
        subject: String(subject),
        class: String(cls),
        description: description ? String(description) : null,
        fileUrl: fileUrl ? String(fileUrl) : null,
        tags: normalizedTags,
        schoolId: normalizedSchoolId,
        uploadedByRole: String(role),
        uploadedById: String(userId),
        approvalStatus
      }
    });

    return res.status(201).json({ success: true, data: newUpload, message: 'Resource uploaded successfully' });
  } catch (err: any) {
    console.error('[POST /api/digital-library-upload]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/digital-library-upload/:id/approve
// Approve or Reject a resource (Headmaster)
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const updated = await prisma.digitalLibraryUpload.update({
      where: { id },
      data: { approvalStatus: status }
    });

    return res.json({ success: true, data: updated, message: `Resource ${status.toLowerCase()} successfully` });
  } catch (err: any) {
    console.error('[PUT /api/digital-library-upload/:id/approve]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to update resource status' });
  }
});

// DELETE /api/digital-library-upload/:id
// Delete a resource
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.digitalLibraryUpload.delete({
      where: { id }
    });
    return res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (err: any) {
    console.error('[DELETE /api/digital-library-upload/:id]', err.message);
    return res.status(500).json({ success: false, error: 'Failed to delete resource' });
  }
});

export default router;
