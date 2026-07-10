import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import {
  computeKpis,
  perSchoolBreakdown,
  listAcademicYears,
  currentAcademicYear,
  yearToDateRange,
  normalizeYear,
  yearVariants,
} from '../services/kpi.service';

const router = Router();

function resolveYear(req: Request): string {
  const y = normalizeYear(req.query.academicYear ? String(req.query.academicYear) : '');
  return y || currentAcademicYear();
}

// ─── GET /api/analytics/academic-years ───────────────────────────
router.get('/academic-years', async (_req: Request, res: Response) => {
  try {
    const years = await listAcademicYears();
    res.json({ success: true, data: years, current: currentAcademicYear() });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── GET /api/analytics/school/:schoolId?academicYear= (HM) ──────
router.get('/school/:schoolId', async (req: Request, res: Response) => {
  try {
    const year = resolveYear(req);
    const kpis = await computeKpis([req.params.schoolId], year);
    res.json({ success: true, data: kpis });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── GET /api/analytics/block?beoUserId=&block=&academicYear= ────
router.get('/block', async (req: Request, res: Response) => {
  try {
    const { beoUserId, block } = req.query;
    if (!beoUserId && !block) {
      return res.status(400).json({ success: false, error: 'beoUserId or block is required' });
    }
    const or: any[] = [];
    if (beoUserId) or.push({ beoId: String(beoUserId) });
    if (block) or.push({ block: { equals: String(block), mode: 'insensitive' } });
    const schools = await prisma.school.findMany({ where: { OR: or }, select: { id: true } });
    const ids = schools.map((s) => s.id);

    const year = resolveYear(req);
    const [kpis, bySchool] = await Promise.all([computeKpis(ids, year), perSchoolBreakdown(ids, year)]);
    res.json({ success: true, data: { ...kpis, totalSchools: ids.length, bySchool } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── GET /api/analytics/district/:district?academicYear= (DEO) ───
router.get('/district/:district', async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      where: { district: { equals: req.params.district, mode: 'insensitive' } },
      select: { id: true },
    });
    const ids = schools.map((s) => s.id);
    const year = resolveYear(req);
    const [kpis, bySchool] = await Promise.all([computeKpis(ids, year), perSchoolBreakdown(ids, year)]);
    res.json({ success: true, data: { ...kpis, totalSchools: ids.length, bySchool } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── GET /api/analytics/state?academicYear= (Commissioner/Minister)
router.get('/state', async (req: Request, res: Response) => {
  try {
    const year = resolveYear(req);
    const schools = await prisma.school.findMany({ select: { id: true, district: true } });
    const ids = schools.map((s) => s.id);
    const kpis = await computeKpis(ids, year);

    // Per-district rollup (counts only — cheap)
    const byDistrict = await prisma.$queryRaw<{ district: string; schools: bigint; students: bigint }[]>`
      SELECT sc.district, COUNT(DISTINCT sc.id)::bigint AS schools, COUNT(st.id)::bigint AS students
      FROM "School" sc
      LEFT JOIN "Student" st ON st."schoolId" = sc.id
        AND (st."studentStatus" = 'Active' OR st."studentStatus" IS NULL)
      GROUP BY sc.district
      ORDER BY sc.district`;
    res.json({
      success: true,
      data: {
        ...kpis,
        totalSchools: ids.length,
        byDistrict: byDistrict.map((d) => ({ district: d.district, schools: Number(d.schools), students: Number(d.students) })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── GET /api/analytics/class?schoolId=&class=&section=&academicYear=
router.get('/class', async (req: Request, res: Response) => {
  try {
    const { schoolId, class: cls, section } = req.query;
    if (!schoolId || !cls) {
      return res.status(400).json({ success: false, error: 'schoolId and class are required' });
    }
    const year = resolveYear(req);
    const kpis = await computeKpis([String(schoolId)], year, {
      class: String(cls),
      ...(section ? { section: String(section) } : {}),
    });
    res.json({ success: true, data: kpis });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── GET /api/analytics/student/:studentId?academicYear= ─────────
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const year = resolveYear(req);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, class: true, section: true, group: true, academicYear: true, schoolId: true },
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    // Past year with a snapshot → serve the snapshot
    const history = await prisma.studentAcademicHistory.findFirst({
      where: { studentId, academicYear: { in: yearVariants(year) } },
    });
    if (history) {
      return res.json({
        success: true,
        data: {
          academicYear: year,
          source: 'snapshot',
          class: history.class,
          section: history.section,
          group: history.group,
          result: history.result,
          attendancePct: history.attendancePct,
          averageMarksPct: history.averageMarksPct,
          marksSummary: history.marksSummary,
        },
      });
    }

    // Live computation
    let attendancePct: number | null = null;
    const range = yearToDateRange(year);
    if (range) {
      const [present, total] = await Promise.all([
        prisma.attendance.count({
          where: { studentId, date: { gte: range[0], lte: range[1] }, status: { in: ['PRESENT', 'LATE'] } },
        }),
        prisma.attendance.count({ where: { studentId, date: { gte: range[0], lte: range[1] } } }),
      ]);
      if (total > 0) attendancePct = Math.round((present / total) * 1000) / 10;
    }

    const marks = await prisma.mark.groupBy({
      by: ['subject'],
      where: { studentId, academicYear: { in: yearVariants(year) } },
      _sum: { scored: true, maxMarks: true },
      _count: { _all: true },
    });
    let scoredSum = 0;
    let maxSum = 0;
    const marksSummary = marks.map((m) => {
      const scored = m._sum.scored || 0;
      const max = m._sum.maxMarks || 0;
      scoredSum += scored;
      maxSum += max;
      return {
        subject: m.subject,
        exams: m._count._all,
        scored,
        maxMarks: max,
        pct: max > 0 ? Math.round((scored / max) * 1000) / 10 : null,
      };
    });

    res.json({
      success: true,
      data: {
        academicYear: year,
        source: 'live',
        class: student.class,
        section: student.section,
        group: student.group,
        result: null,
        attendancePct,
        averageMarksPct: maxSum > 0 ? Math.round((scoredSum / maxSum) * 1000) / 10 : null,
        marksSummary,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── GET /api/analytics/minister?academicYear= (Minister dashboard) ──────────
router.get('/minister', async (req: Request, res: Response) => {
  try {
    const year = resolveYear(req);
    const schools = await prisma.school.findMany({ select: { id: true, district: true } });
    const ids = schools.map((s) => s.id);
    const kpis = await computeKpis(ids, year);

    const byDistrict = await prisma.$queryRaw<
      { district: string; schools: bigint; students: bigint }[]
    >`
      SELECT sc.district,
             COUNT(DISTINCT sc.id)::bigint AS schools,
             COUNT(st.id)::bigint AS students
      FROM "School" sc
      LEFT JOIN "Student" st ON st."schoolId" = sc.id
        AND (st."studentStatus" = 'Active' OR st."studentStatus" IS NULL)
      GROUP BY sc.district
      ORDER BY sc.district
    `;

    // Count governance users
    const [ministerCount, commissionerCount, deoCount, beoCount, headmasterCount] =
      await Promise.all([
        prisma.user.count({ where: { role: 'MINISTER' as any } }),
        prisma.user.count({ where: { role: 'COMMISSIONER' as any } }),
        prisma.user.count({ where: { role: 'DEO' as any } }),
        prisma.user.count({ where: { role: 'BEO' as any } }),
        prisma.user.count({ where: { role: 'HEADMASTER' as any } }),
      ]);

    res.json({
      success: true,
      data: {
        ...kpis,
        totalSchools: ids.length,
        byDistrict: byDistrict.map((d) => ({
          district: d.district,
          schools: Number(d.schools),
          students: Number(d.students),
        })),
        governanceUsers: {
          ministers: ministerCount,
          commissioners: commissionerCount,
          deos: deoCount,
          beos: beoCount,
          headmasters: headmasterCount,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;

