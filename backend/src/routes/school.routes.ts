import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// GET /api/schools — List all schools
router.get('/', async (req: Request, res: Response) => {
  try {
    const { district, block } = req.query;
    const schools = await prisma.school.findMany({
      where: {
        ...(district ? { district: String(district) } : {}),
        ...(block ? { block: String(block) } : {}),
      },
      include: {
        _count: { select: { students: true, teachers: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, count: schools.length, data: schools });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/schools/:id — Single school with full details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { students: true, teachers: true } },
      },
    });
    if (!school) return res.status(404).json({ success: false, error: 'School not found' });
    res.json({ success: true, data: school });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/schools — Create school
router.post('/', async (req: Request, res: Response) => {
  try {
    const school = await prisma.school.create({ data: req.body });
    res.status(201).json({ success: true, data: school });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/schools/analytics/district/:district — District-level school analytics
router.get('/analytics/district/:district', async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      where: { district: req.params.district },
      include: {
        _count: { select: { students: true, teachers: true } },
      },
    });
    const totalStudents = schools.reduce((acc, s) => acc + s._count.students, 0);
    const totalTeachers = schools.reduce((acc, s) => acc + s._count.teachers, 0);
    res.json({
      success: true,
      data: {
        totalSchools: schools.length,
        totalStudents,
        totalTeachers,
        schools,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/schools/:id — Update school
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const school = await prisma.school.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: school });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/schools/:id — Delete school
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.school.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true, message: 'School deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/schools/bulk — Bulk import schools from Excel
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'Invalid payload: records must be an array' });
    }
    const createdSchools = [];
    for (const record of records) {
      if (!record.dise || !record.name) continue;
      const school = await prisma.school.upsert({
        where: { dise: String(record.dise) },
        update: {
          name: record.name,
          address: record.address || null,
          district: record.district || '',
          block: record.block || '',
          pincode: record.pincode || null,
          schoolType: record.schoolType || 'Government',
          mediumOfInstruction: record.mediumOfInstruction || 'Tamil',
        },
        create: {
          dise: String(record.dise),
          name: record.name,
          address: record.address || null,
          district: record.district || '',
          block: record.block || '',
          pincode: record.pincode || null,
          schoolType: record.schoolType || 'Government',
          mediumOfInstruction: record.mediumOfInstruction || 'Tamil',
        },
      });
      createdSchools.push(school);
    }
    res.json({ success: true, count: createdSchools.length, data: createdSchools });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
