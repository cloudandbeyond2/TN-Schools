import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// Helper to parse class and section from inputs like "Class 10A"
function parseClassSection(classStr: string) {
  if (!classStr) return { classVal: '10', sectionVal: 'A' };
  const clean = classStr.replace(/class/i, '').trim();
  const match = clean.match(/^(\d+)([a-zA-Z])$/);
  if (match) {
    return { classVal: match[1], sectionVal: match[2].toUpperCase() };
  }
  const digitMatch = clean.match(/^(\d+)$/);
  if (digitMatch) {
    return { classVal: digitMatch[1], sectionVal: 'A' };
  }
  return { classVal: clean || '10', sectionVal: 'A' };
}

// GET /api/headmaster/students — List all watchlist students
router.get('/students', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const students = await prisma.watchlistStudent.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/students — Add single student to watchlist
router.post('/students', async (req: Request, res: Response) => {
  try {
    const { name, rollNumber, class: cls, phone, parentName, district, state, city, pincode, risk, schoolId } = req.body;
    if (!name || !rollNumber) {
      return res.status(400).json({ success: false, error: 'name and rollNumber are required' });
    }
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'schoolId is required' });
    }

    const cleanRoll  = String(rollNumber).trim();
    const cleanPhone = String(phone || '').trim();
    const resolvedSchoolId = schoolId;

    // 1. Check if student already exists in Student table
    const existingStudent = await prisma.student.findFirst({
      where: { rollNumber: { equals: cleanRoll, mode: 'insensitive' } }
    });
    if (existingStudent) {
      return res.status(400).json({ success: false, error: 'Student with this roll number already exists.' });
    }

    // 2. Determine mobile uniqueness
    let mobileValue: string | null = cleanPhone || null;
    if (cleanPhone) {
      const existingMobile = await prisma.user.findFirst({ where: { mobile: cleanPhone } });
      if (existingMobile) mobileValue = null;
    }

    // 3. Create all 3 records in a single atomic transaction
    const { classVal, sectionVal } = parseClassSection(cls || 'Class 10A');

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: `${cleanRoll.toLowerCase()}@tn.gov.in`,
          mobile: mobileValue,
          passwordHash: cleanPhone || '123456',
          role: 'STUDENT',
          schoolId: resolvedSchoolId,
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          schoolId: resolvedSchoolId,
          class: classVal,
          section: sectionVal,
          rollNumber: cleanRoll,
          parentName: parentName || 'N/A',
          parentMobile: cleanPhone || 'N/A',
        }
      });

      const watchlist = await tx.watchlistStudent.create({
        data: {
          name,
          rollNumber: cleanRoll,
          class: cls || 'Class 10A',
          phone: cleanPhone || 'N/A',
          parentName: parentName || 'N/A',
          district: district || 'N/A',
          state: state || 'N/A',
          city: city || 'N/A',
          pincode: pincode || 'N/A',
          risk: risk || 'Medium',
          student: { connect: { id: student.id } },   // Formal FK link to Student
          school: resolvedSchoolId ? { connect: { id: resolvedSchoolId } } : undefined,
        }
      });

      return watchlist;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/students/bulk — Bulk import from Excel
router.post('/students/bulk', async (req: Request, res: Response) => {
  try {
    const { students } = req.body as { students: any[] };
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, error: 'students array is required' });
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const s of students) {
      if (!s.name || !s.rollNumber) { skippedCount++; continue; }
      if (!s.schoolId) { skippedCount++; continue; }

      const cleanRoll  = String(s.rollNumber).trim();
      const cleanPhone = String(s.phone || '').trim();
      const resolvedSchoolId = s.schoolId;

      // Skip duplicates
      const existingStudent = await prisma.student.findFirst({
        where: { rollNumber: { equals: cleanRoll, mode: 'insensitive' } }
      });
      if (existingStudent) { skippedCount++; continue; }

      // Determine mobile uniqueness
      let mobileValue: string | null = cleanPhone || null;
      if (cleanPhone) {
        const existingMobile = await prisma.user.findFirst({ where: { mobile: cleanPhone } });
        if (existingMobile) mobileValue = null;
      }

      const { classVal, sectionVal } = parseClassSection(s.class || 'Class 10A');

      try {
        // Atomic transaction per student
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name: s.name,
              email: `${cleanRoll.toLowerCase()}@tn.gov.in`,
              mobile: mobileValue,
              passwordHash: cleanPhone || '123456',
              role: 'STUDENT',
              schoolId: resolvedSchoolId,
            }
          });

          const bulkStudent = await tx.student.create({
            data: {
              userId: user.id,
              schoolId: resolvedSchoolId,
              class: classVal,
              section: sectionVal,
              rollNumber: cleanRoll,
              parentName: s.parentName || 'N/A',
              parentMobile: cleanPhone || 'N/A',
            }
          });

          await tx.watchlistStudent.create({
            data: {
              name: s.name,
              rollNumber: cleanRoll,
              class: s.class || 'Class 10A',
              phone: cleanPhone || 'N/A',
              parentName: s.parentName || 'N/A',
              district: s.district || 'N/A',
              state: s.state || 'N/A',
              city: s.city || 'N/A',
              pincode: s.pincode || 'N/A',
              risk: s.risk || 'Medium',
              student: { connect: { id: bulkStudent.id } },   // Formal FK link to Student
              school: resolvedSchoolId ? { connect: { id: resolvedSchoolId } } : undefined,
            }
          });
        });
        createdCount++;
      } catch (txErr) {
        console.error(`Bulk import: failed for ${cleanRoll}:`, txErr);
        skippedCount++;
      }
    }

    res.status(201).json({ success: true, created: createdCount, skipped: skippedCount });
  } catch (err) {
    console.error('Error bulk importing students:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/headmaster/students/:id — Update student details
router.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, rollNumber, class: cls, phone, parentName, district, state, city, pincode, risk, schoolId } = req.body;

    const watchlistStudent = await prisma.watchlistStudent.findUnique({
      where: { id }
    });

    if (!watchlistStudent) {
      return res.status(404).json({ success: false, error: 'Student not found in watchlist.' });
    }

    const oldRollNumber = watchlistStudent.rollNumber;
    const cleanRoll = rollNumber ? String(rollNumber).trim() : oldRollNumber;
    const cleanPhone = phone ? String(phone).trim() : watchlistStudent.phone;

    // Update watchlistStudent
    const updatedWatchlist = await prisma.watchlistStudent.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        rollNumber: cleanRoll,
        class: cls !== undefined ? cls : undefined,
        phone: cleanPhone,
        parentName: parentName !== undefined ? parentName : undefined,
        district: district !== undefined ? district : undefined,
        state: state !== undefined ? state : undefined,
        city: city !== undefined ? city : undefined,
        pincode: pincode !== undefined ? pincode : undefined,
        risk: risk !== undefined ? risk : undefined,
        schoolId: schoolId !== undefined ? schoolId : undefined,
      }
    });

    // Find and update core Student & User
    const student = await prisma.student.findFirst({
      where: {
        rollNumber: {
          equals: oldRollNumber,
          mode: 'insensitive'
        }
      }
    });

    if (student) {
      const { classVal, sectionVal } = parseClassSection(cls || watchlistStudent.class);
      await prisma.student.update({
        where: { id: student.id },
        data: {
          rollNumber: cleanRoll,
          class: classVal,
          section: sectionVal,
          parentName: parentName !== undefined ? parentName : undefined,
          parentMobile: cleanPhone,
        }
      });

      // Update User
      await prisma.user.update({
        where: { id: student.userId },
        data: {
          name: name !== undefined ? name : undefined,
          email: `${cleanRoll.toLowerCase()}@tn.gov.in`,
          passwordHash: cleanPhone,
        }
      });
    }

    res.json({ success: true, data: updatedWatchlist });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/students/:id — Remove from watchlist and core tables
router.delete('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const watchlistStudent = await prisma.watchlistStudent.findUnique({
      where: { id }
    });

    if (!watchlistStudent) {
      return res.status(404).json({ success: false, error: 'Student not found in watchlist.' });
    }

    // Find core student
    const student = await prisma.student.findFirst({
      where: {
        rollNumber: {
          equals: watchlistStudent.rollNumber,
          mode: 'insensitive'
        }
      }
    });

    if (student) {
      // 1. Delete dependent records (marks, attendance, scholarships)
      await prisma.mark.deleteMany({ where: { studentId: student.id } });
      await prisma.attendance.deleteMany({ where: { studentId: student.id } });
      await prisma.scholarship.deleteMany({ where: { studentId: student.id } });

      // 2. Delete Student and User
      await prisma.student.delete({ where: { id: student.id } });
      await prisma.user.delete({ where: { id: student.userId } });
    }

    // 3. Delete WatchlistStudent
    await prisma.watchlistStudent.delete({ where: { id } });

    res.json({ success: true, message: 'Student removed from all tables successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── Health Report Endpoints ─────────────────────────────────────

// GET /api/headmaster/health/:rollNumber
router.get('/health/:rollNumber', async (req: Request, res: Response) => {
  try {
    const { rollNumber } = req.params;
    const student = await prisma.student.findFirst({
      where: { rollNumber: { equals: rollNumber, mode: 'insensitive' } }
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found in core system.' });

    const health = await prisma.healthReport.findUnique({
      where: { studentId: student.id }
    });
    res.json({ success: true, data: health });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/health/:rollNumber
router.post('/health/:rollNumber', async (req: Request, res: Response) => {
  try {
    const { rollNumber } = req.params;
    const { height, weight, bloodGroup, vision, hearing, bmi, dental, lastCheckupDate, notes } = req.body;
    
    const student = await prisma.student.findFirst({
      where: { rollNumber: { equals: rollNumber, mode: 'insensitive' } }
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found in core system. Must be enrolled first.' });

    const health = await prisma.healthReport.upsert({
      where: { studentId: student.id },
      update: { 
        height: height ? parseFloat(height) : null, 
        weight: weight ? parseFloat(weight) : null, 
        bloodGroup, 
        vision, 
        hearing, 
        bmi: bmi ? parseFloat(bmi) : null, 
        dental, 
        lastCheckupDate: lastCheckupDate ? new Date(lastCheckupDate) : null, 
        notes 
      },
      create: { 
        studentId: student.id, 
        height: height ? parseFloat(height) : null, 
        weight: weight ? parseFloat(weight) : null, 
        bloodGroup, 
        vision, 
        hearing, 
        bmi: bmi ? parseFloat(bmi) : null, 
        dental, 
        lastCheckupDate: lastCheckupDate ? new Date(lastCheckupDate) : null, 
        notes 
      }
    });

    res.json({ success: true, data: health });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── Staff Endpoints ─────────────────────────────────────────────

// GET /api/headmaster/staff — List all staff
router.get('/staff', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const staff = await prisma.headmasterStaff.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/staff — Add single staff member
router.post('/staff', async (req: Request, res: Response) => {
  try {
    const { name, emisId, subject, phone, email, attendance, performance, leaveUsed, password, schoolId } = req.body;
    if (!name || !emisId) {
      return res.status(400).json({ success: false, error: 'name and emisId are required' });
    }
    const staff = await prisma.headmasterStaff.upsert({
      where: { emisId },
      update: { name, subject: subject || 'General', phone: phone || 'N/A', email: email || null, attendance: attendance ?? 100, performance: performance || 'Good', leaveUsed: leaveUsed ?? 0, password: password || '123456', schoolId: schoolId || null },
      create: { name, emisId, subject: subject || 'General', phone: phone || 'N/A', email: email || null, attendance: attendance ?? 100, performance: performance || 'Good', leaveUsed: leaveUsed ?? 0, password: password || '123456', schoolId: schoolId || null },
    });
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/staff/bulk — Bulk import from Excel
router.post('/staff/bulk', async (req: Request, res: Response) => {
  try {
    const { staff } = req.body as { staff: any[] };
    if (!Array.isArray(staff) || staff.length === 0) {
      return res.status(400).json({ success: false, error: 'staff array is required' });
    }
    let created = 0;
    for (const s of staff) {
      if (!s.name || !s.emisId) continue;
      await prisma.headmasterStaff.upsert({
        where: { emisId: s.emisId },
        update: { name: s.name, subject: s.subject || 'General', phone: s.phone || 'N/A', email: s.email || null, attendance: s.attendance ?? 100, performance: s.performance || 'Good', leaveUsed: s.leaveUsed ?? s.leave ?? 0, password: s.password || '123456', schoolId: s.schoolId || null },
        create: { name: s.name, emisId: s.emisId, subject: s.subject || 'General', phone: s.phone || 'N/A', email: s.email || null, attendance: s.attendance ?? 100, performance: s.performance || 'Good', leaveUsed: s.leaveUsed ?? s.leave ?? 0, password: s.password || '123456', schoolId: s.schoolId || null },
      });
      created++;
    }
    res.status(201).json({ success: true, created });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/headmaster/staff/:id — Update staff member
router.put('/staff/:id', async (req: Request, res: Response) => {
  try {
    const { name, subject, phone, email, attendance, performance, leaveUsed, password, schoolId } = req.body;
    const staff = await prisma.headmasterStaff.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        subject: subject !== undefined ? subject : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        attendance: attendance !== undefined ? attendance : undefined,
        performance: performance !== undefined ? performance : undefined,
        leaveUsed: leaveUsed !== undefined ? leaveUsed : undefined,
        password: password !== undefined ? password : undefined,
        schoolId: schoolId !== undefined ? schoolId : undefined,
      }
    });
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/staff/:id — Remove staff member
router.delete('/staff/:id', async (req: Request, res: Response) => {
  try {
    await prisma.headmasterStaff.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Staff member removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── Temporary / Contract Staff Endpoints ────────────────────────

// GET /api/headmaster/temp-staff
router.get('/temp-staff', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const staff = await prisma.headmasterTempStaff.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/temp-staff — Add single
router.post('/temp-staff', async (req: Request, res: Response) => {
  try {
    const { name, role, agency, joined, phone, email, duration, salary, status, password, schoolId } = req.body;
    if (!name || !role) return res.status(400).json({ success: false, error: 'name and role are required' });
    const staff = await prisma.headmasterTempStaff.create({
      data: { name, role, agency: agency || 'Direct Contract', joined: joined || '', phone: phone || 'N/A', email: email || 'N/A', duration: duration || '12 Months', salary: salary || 'N/A', status: status || 'Active', password: password || '123456', schoolId: schoolId || null },
    });
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/temp-staff/bulk — Bulk import
router.post('/temp-staff/bulk', async (req: Request, res: Response) => {
  try {
    const { staff } = req.body as { staff: any[] };
    if (!Array.isArray(staff) || staff.length === 0) return res.status(400).json({ success: false, error: 'staff array required' });
    const records = staff.filter((s) => s.name && s.role).map((s) => ({
      name: s.name, role: s.role, agency: s.agency || 'Direct Contract', joined: s.joined || '',
      phone: s.phone || 'N/A', email: s.email || 'N/A', duration: s.duration || '12 Months',
      salary: s.salary || 'N/A', status: 'Active', password: s.password || '123456', schoolId: s.schoolId || null,
    }));
    const result = await prisma.headmasterTempStaff.createMany({ data: records, skipDuplicates: false });
    res.status(201).json({ success: true, created: result.count });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/headmaster/temp-staff/:id
router.put('/temp-staff/:id', async (req: Request, res: Response) => {
  try {
    const { name, role, agency, joined, phone, email, duration, salary, status, password, schoolId } = req.body;
    const staff = await prisma.headmasterTempStaff.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        role: role !== undefined ? role : undefined,
        agency: agency !== undefined ? agency : undefined,
        joined: joined !== undefined ? joined : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        duration: duration !== undefined ? duration : undefined,
        salary: salary !== undefined ? salary : undefined,
        status: status !== undefined ? status : undefined,
        password: password !== undefined ? password : undefined,
        schoolId: schoolId !== undefined ? schoolId : undefined,
      }
    });
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/temp-staff/:id
router.delete('/temp-staff/:id', async (req: Request, res: Response) => {
  try {
    await prisma.headmasterTempStaff.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Temp staff removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── Parents / PTA Committee Endpoints ────────────────────────────

// GET /api/headmaster/parents
router.get('/parents', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const parents = await prisma.headmasterParent.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      include: {
        linkedStudents: {
          include: {
            student: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: parents.length, data: parents });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/parents — Add single parent/officer
router.post('/parents', async (req: Request, res: Response) => {
  try {
    const { name, role, phone, email, studentName, studentClass, term, password, schoolId } = req.body;
    if (!name || !role || !phone) {
      return res.status(400).json({ success: false, error: 'name, role and phone are required' });
    }
    const parent = await prisma.headmasterParent.create({
      data: {
        name,
        role,
        phone,
        email: email || null,
        studentName: studentName || 'N/A',
        studentClass: studentClass || 'N/A',
        term: term || '2025-26',
        password: password || '123456',
        schoolId: schoolId || null,
      },
    });
    res.status(201).json({ success: true, data: parent });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/parents/bulk — Bulk import parents from Excel
router.post('/parents/bulk', async (req: Request, res: Response) => {
  try {
    const { parents } = req.body as { parents: any[] };
    if (!Array.isArray(parents) || parents.length === 0) {
      return res.status(400).json({ success: false, error: 'parents array is required' });
    }
    const records = parents
      .filter((p) => p.name && p.role && p.phone)
      .map((p) => ({
        name: p.name,
        role: p.role,
        phone: p.phone,
        email: p.email || null,
        studentName: p.studentName || 'N/A',
        studentClass: p.studentClass || 'N/A',
        term: p.term || '2025-26',
        password: p.password || '123456',
        schoolId: p.schoolId || null,
      }));
    const result = await prisma.headmasterParent.createMany({ data: records, skipDuplicates: false });
    res.status(201).json({ success: true, created: result.count });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/headmaster/parents/:id — Update parent officer
router.put('/parents/:id', async (req: Request, res: Response) => {
  try {
    const parent = await prisma.headmasterParent.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: parent });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/parents/:id — Remove parent officer
router.delete('/parents/:id', async (req: Request, res: Response) => {
  try {
    await prisma.headmasterParent.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'PTA Committee member removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});


// ─── Alumni Endpoints ─────────────────────────────────────────────

// GET /api/headmaster/alumni
router.get('/alumni', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const alumniList = await prisma.headmasterAlumni.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: alumniList.length, data: alumniList });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/alumni — Add single alumni contribution
router.post('/alumni', async (req: Request, res: Response) => {
  try {
    const { name, batch, contribution, role, phone, email, location, value, schoolId } = req.body;
    if (!name || !contribution) {
      return res.status(400).json({ success: false, error: 'name and contribution details are required' });
    }
    const record = await prisma.headmasterAlumni.create({
      data: {
        name,
        batch: batch || 'N/A',
        contribution,
        role: role || 'Alumni Member',
        phone: phone || 'N/A',
        email: email || 'N/A',
        location: location || 'N/A',
        value: value || 'N/A',
        schoolId: schoolId || null,
      },
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/alumni/bulk — Bulk import alumni from Excel
router.post('/alumni/bulk', async (req: Request, res: Response) => {
  try {
    const { alumni } = req.body as { alumni: any[] };
    if (!Array.isArray(alumni) || alumni.length === 0) {
      return res.status(400).json({ success: false, error: 'alumni array is required' });
    }
    const records = alumni
      .filter((a) => a.name && a.contribution)
      .map((a) => ({
        name: a.name,
        batch: a.batch || 'N/A',
        contribution: a.contribution,
        role: a.role || 'Alumni Member',
        phone: a.phone || 'N/A',
        email: a.email || 'N/A',
        location: a.location || 'N/A',
        value: a.value || 'N/A',
        schoolId: a.schoolId || null,
      }));
    const result = await prisma.headmasterAlumni.createMany({ data: records, skipDuplicates: false });
    res.status(201).json({ success: true, created: result.count });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/alumni/:id — Remove alumni contribution
router.delete('/alumni/:id', async (req: Request, res: Response) => {
  try {
    await prisma.headmasterAlumni.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Alumni contribution record removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── PTA Meeting Endpoints (Headmaster creates, parents view) ─────

// GET /api/headmaster/pta-meetings
router.get('/pta-meetings', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const meetings = await prisma.pTAMeeting.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      orderBy: { meetingDate: 'asc' },
    });
    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/pta-meetings
router.post('/pta-meetings', async (req: Request, res: Response) => {
  try {
    const { schoolId, title, description, meetingDate, venue, status, agenda } = req.body;
    if (!title || !meetingDate) {
      return res.status(400).json({ success: false, error: 'title and meetingDate are required' });
    }
    const meeting = await prisma.pTAMeeting.create({
      data: {
        schoolId: schoolId || null,
        title,
        description: description || null,
        meetingDate: new Date(meetingDate),
        venue: venue || 'School Auditorium',
        status: status || 'Upcoming',
        agenda: Array.isArray(agenda) ? agenda : [],
      },
    });
    res.status(201).json({ success: true, data: meeting });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/headmaster/pta-meetings/:id
router.put('/pta-meetings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, meetingDate, venue, status, agenda } = req.body;
    const meeting = await prisma.pTAMeeting.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(meetingDate && { meetingDate: new Date(meetingDate) }),
        ...(venue && { venue }),
        ...(status && { status }),
        ...(Array.isArray(agenda) && { agenda }),
      },
    });
    res.json({ success: true, data: meeting });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/pta-meetings/:id
router.delete('/pta-meetings/:id', async (req: Request, res: Response) => {
  try {
    await prisma.pTAMeeting.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'PTA meeting removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── Parent → Student Link (Headmaster action) ────────────────────

// POST /api/headmaster/parents/:id/link-student
// Body: { studentId, isPrimary? }
router.post('/parents/:id/link-student', async (req: Request, res: Response) => {
  try {
    const parentId = req.params.id;
    const { studentId, isPrimary } = req.body;
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'studentId is required' });
    }
    const link = await prisma.parentStudentLink.upsert({
      where: { parentId_studentId: { parentId, studentId } },
      update: { isPrimary: isPrimary ?? false },
      create: { parentId, studentId, isPrimary: isPrimary ?? false },
    });
    res.status(201).json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/parents/:id/link-student
// Body: { studentId }
router.delete('/parents/:id/link-student', async (req: Request, res: Response) => {
  try {
    const parentId = req.params.id;
    const { studentId } = req.body;
    await prisma.parentStudentLink.delete({
      where: { parentId_studentId: { parentId, studentId } },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/headmaster/parents/:id/linked-students
router.get('/parents/:id/linked-students', async (req: Request, res: Response) => {
  try {
    const { id: parentId } = req.params;
    const links = await prisma.parentStudentLink.findMany({
      where: { parentId },
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: [{ isPrimary: 'desc' }],
    });
    res.json({
      success: true,
      data: links.map(l => ({
        linkId: l.id,
        studentId: l.student.id,
        name: l.student.user.name,
        class: l.student.class,
        section: l.student.section,
        rollNumber: l.student.rollNumber,
        isPrimary: l.isPrimary,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

/* ------------------- HEADMASTER PROFILE ROUTES ------------------- */

// GET /api/headmaster/profile/:userId — Fetch profile by User ID
router.get('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = await prisma.headmasterProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            mobile: true,
            isActive: true,
          }
        },
        school: {
          select: {
            name: true,
            dise: true,
            district: true,
            block: true,
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Headmaster profile not found' });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error('Error fetching headmaster profile:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/profile — Create or Upsert profile
router.post('/profile', async (req: Request, res: Response) => {
  try {
    const { userId, schoolId, employeeId, joiningDate, address, gender, dob } = req.body;

    if (!userId || !schoolId) {
      return res.status(400).json({ success: false, error: 'userId and schoolId are required' });
    }

    const profile = await prisma.headmasterProfile.upsert({
      where: { userId },
      update: {
        schoolId,
        employeeId: employeeId || null,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        address: address || null,
        gender: gender || null,
        dob: dob ? new Date(dob) : null,
      },
      create: {
        userId,
        schoolId,
        employeeId: employeeId || null,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        address: address || null,
        gender: gender || null,
        dob: dob ? new Date(dob) : null,
      }
    });

    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    console.error('Error upserting headmaster profile:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/profile/:id — Delete profile by profile ID
router.delete('/profile/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.headmasterProfile.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Headmaster profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting headmaster profile:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;


