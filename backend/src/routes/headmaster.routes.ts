import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';
import bcrypt from 'bcryptjs';

const router = Router();

const SAFE_STAFF_SELECT = {
  id: true, name: true, emisId: true, subject: true, phone: true, email: true,
  attendance: true, performance: true, leaveUsed: true, schoolId: true,
  createdAt: true, updatedAt: true, address: true, dob: true, gender: true, userId: true,
} as const;

const SAFE_TEMP_STAFF_SELECT = {
  id: true, name: true, role: true, agency: true, joined: true, phone: true, email: true,
  duration: true, salary: true, status: true, schoolId: true,
  createdAt: true, updatedAt: true, userId: true,
} as const;

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

// Helper to parse date safely — also handles Excel serial numbers (e.g. "41411")
// which JavaScript would wrongly interpret as a year if passed to new Date().
function parseDob(dobStr: any) {
  if (!dobStr || dobStr === 'null' || dobStr === 'undefined' || String(dobStr).trim() === '') return null;

  const str = String(dobStr).trim();

  // Detect an Excel date serial number: a plain integer between 1 and 99999
  // (Excel serial 1 = 1900-01-01, serial 45000 ≈ 2023-03-18)
  const numVal = Number(str);
  if (!isNaN(numVal) && Number.isInteger(numVal) && numVal > 1 && numVal < 99999) {
    // Excel epoch base: Dec 30, 1899 (accounts for Excel's leap-year bug)
    const excelEpoch = new Date(1899, 11, 30).getTime();
    const d = new Date(excelEpoch + numVal * 86400000);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}


// GET /api/headmaster/students — List all students for a school
router.get('/students', async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const students = await prisma.student.findMany({
      where: schoolId ? { schoolId: String(schoolId) } : undefined,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    // Format the response to flatten user name
    const formattedStudents = students.map(s => ({
      ...s,
      name: s.user?.name || 'Unknown',
      email: s.user?.email || s.parentEmail,
      phone: s.phoneNumber || s.parentMobile || s.user?.mobile,
    }));
    res.json({ success: true, count: formattedStudents.length, data: formattedStudents });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/students — Add a single student
router.post('/students', async (req: Request, res: Response) => {
  try {
    const {
      name, admissionNumber, rollNumber, emisNumber, dob, gender,
      bloodGroup, religion, community, nationality, mediumOfInstruction,
      class: cls, section, academicYear, fatherName, fatherOccupation,
      motherName, motherOccupation, parentEmail, phone, phoneNumber, parentName, address,
      city, district, state, pincode, studentStatus, schoolId, group
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'schoolId is required' });
    }

    const cleanPhone = String(phone || phoneNumber || '').trim();
    const cleanRoll = rollNumber ? String(rollNumber).trim() : undefined;

    // Mobile uniqueness check for User table
    let mobileValue: string | null = cleanPhone || null;
    if (cleanPhone) {
      const existingMobile = await prisma.user.findFirst({ where: { mobile: cleanPhone } });
      if (existingMobile) mobileValue = null;
    }

    const { classVal, sectionVal } = parseClassSection(cls || '10');

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: cleanRoll ? `${cleanRoll.toLowerCase()}@tn.gov.in` : null,
          mobile: mobileValue,
          passwordHash: await hashPassword(cleanPhone || '123456'),
          role: 'STUDENT',
          schoolId,
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          schoolId,
          class: classVal,
          section: section || sectionVal || 'A',
          group,
          rollNumber: cleanRoll,
          admissionNumber,
          emisNumber,
          dob: parseDob(dob),
          gender,
          bloodGroup,
          religion,
          community,
          nationality,
          mediumOfInstruction,
          academicYear,
          fatherName,
          fatherOccupation,
          motherName,
          motherOccupation,
          parentEmail,
          parentName: parentName || fatherName || motherName || 'Parent',
          parentMobile: cleanPhone || null,
          phoneNumber: cleanPhone || null,
          address,
          city,
          district,
          state,
          pincode,
          studentStatus: studentStatus || 'Active',
        }
      });

      if (parentEmail && parentEmail.trim() !== '') {
        // Check if parent user already exists in PostgreSQL
        const parentWhereConditions: any[] = [
          { email: { equals: parentEmail.trim().toLowerCase(), mode: 'insensitive' } }
        ];
        if (cleanPhone) {
          parentWhereConditions.push({ mobile: cleanPhone });
        }

        let parentUser = await tx.user.findFirst({
          where: { OR: parentWhereConditions }
        });

        if (!parentUser) {
          parentUser = await tx.user.create({
            data: {
              name: parentName || fatherName || motherName || 'Parent',
              email: parentEmail.trim().toLowerCase(),
              mobile: cleanPhone || null,
              passwordHash: await hashPassword(cleanPhone || '123456'),
              role: 'PARENT',
              schoolId,
            }
          });
        }

        // Check if HeadmasterParent model exists
        const hmParentWhereConditions: any[] = [
          { email: { equals: parentEmail.trim().toLowerCase(), mode: 'insensitive' } }
        ];
        if (cleanPhone) {
          hmParentWhereConditions.push({ phone: cleanPhone });
        }

        let hmParent = await tx.headmasterParent.findFirst({
          where: { OR: hmParentWhereConditions }
        });

        if (!hmParent) {
          hmParent = await tx.headmasterParent.create({
            data: {
              name: parentName || fatherName || motherName || 'Parent',
              role: 'Parent',
              phone: cleanPhone || 'N/A',
              email: parentEmail.trim().toLowerCase(),
              studentName: name,
              studentClass: classVal,
              term: fatherName ? 'Father' : motherName ? 'Mother' : 'Parent',
              password: await hashPassword(cleanPhone || '123456'),
              schoolId,
              userId: parentUser.id,
            }
          });
        }

        // Link parent and student
        const linkExists = await tx.parentStudentLink.findFirst({
          where: { parentId: hmParent.id, studentId: student.id }
        });
        if (!linkExists) {
          await tx.parentStudentLink.create({
            data: {
              parentId: hmParent.id,
              studentId: student.id,
              isPrimary: true
            }
          });
        }
      }

      return { ...student, name: user.name };
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/students/bulk — Bulk import students from Excel
router.post('/students/bulk', async (req: Request, res: Response) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ success: false, error: 'Invalid payload.' });
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Track phone numbers already used in THIS batch to avoid
    // intra-batch unique constraint violations on the User.mobile column.
    const batchUsedPhones = new Set<string>();

    for (const student of students) {
      const {
        schoolId, name, rollNumber, admissionNumber, emisNumber, dob, gender,
        bloodGroup, religion, community, nationality, mediumOfInstruction,
        class: cls, section, academicYear, fatherName, fatherOccupation,
        motherName, motherOccupation, parentEmail, phone, phoneNumber, parentName, address,
        city, district, state, pincode, studentStatus, group
      } = student;

      // Skip rows missing required fields
      if (!name || !rollNumber) {
        skippedCount++;
        errors.push(`Row skipped: missing name or roll number (${name || 'unknown'})`);
        continue;
      }

      // SchoolId is required to scope the student to a school
      if (!schoolId) {
        skippedCount++;
        errors.push(`Row skipped: schoolId missing for student "${name}"`);
        continue;
      }

      const { classVal } = parseClassSection(cls || 'Class 1');

      // Skip duplicate roll numbers within the same school
      const existingStudent = await prisma.student.findFirst({
        where: { rollNumber, schoolId }
      });
      if (existingStudent) {
        skippedCount++;
        errors.push(`Skipped duplicate roll number "${rollNumber}" for "${name}"`);
        continue;
      }

      const cleanPhone = String(phone || phoneNumber || '').trim();

      // Resolve finalMobile: null if phone already taken in DB or in THIS batch
      let finalMobile: string | null = cleanPhone || null;
      if (finalMobile) {
        if (batchUsedPhones.has(finalMobile)) {
          finalMobile = null; // Already used by a previous student in this batch
        } else {
          const existingUser = await prisma.user.findFirst({ where: { mobile: finalMobile } });
          if (existingUser) {
            finalMobile = null; // Already taken in DB
          } else {
            batchUsedPhones.add(finalMobile); // Reserve it for this student
          }
        }
      }

      const hashedPassword = await hashPassword(cleanPhone || '123456');

      try {
        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              schoolId,
              name,
              mobile: finalMobile,
              passwordHash: hashedPassword,
              role: 'STUDENT',
            }
          });

          await tx.student.create({
            data: {
              userId: newUser.id,
              rollNumber,
              schoolId,
              class: classVal,
              section: section || 'A',
              group: group || null,
              admissionNumber: admissionNumber || null,
              emisNumber: emisNumber || null,
              dob: parseDob(dob),
              gender: gender || null,
              bloodGroup: bloodGroup || null,
              religion: religion || null,
              community: community || null,
              nationality: nationality || null,
              mediumOfInstruction: mediumOfInstruction || null,
              academicYear: academicYear || null,
              fatherName: fatherName || null,
              fatherOccupation: fatherOccupation || null,
              motherName: motherName || null,
              motherOccupation: motherOccupation || null,
              parentEmail: parentEmail || null,
              parentName: parentName || fatherName || motherName || 'Parent',
              parentMobile: cleanPhone || null,
              phoneNumber: cleanPhone || null,
              address: address || null,
              city: city || null,
              district: district || null,
              state: state || null,
              pincode: pincode || null,
              studentStatus: studentStatus || 'Active',
            }
          });

          // Create parent user if parentEmail is provided and not already existing
          if (parentEmail && parentEmail.trim() !== '') {
            let parentUser = await tx.user.findFirst({
              where: { email: { equals: parentEmail.trim().toLowerCase(), mode: 'insensitive' } }
            });

            if (!parentUser) {
              let parentMobile: string | null = cleanPhone || null;
              if (parentMobile) {
                // Check both DB and batch for the parent phone
                const existingParentPhone = await tx.user.findFirst({ where: { mobile: parentMobile } });
                if (existingParentPhone || batchUsedPhones.has(parentMobile)) {
                  parentMobile = null;
                }
              }
              await tx.user.create({
                data: {
                  name: parentName || fatherName || motherName || 'Parent',
                  email: parentEmail.trim().toLowerCase(),
                  mobile: parentMobile,
                  passwordHash: await hashPassword(cleanPhone || '123456'),
                  role: 'PARENT',
                  schoolId,
                }
              });
            }
          }
        });

        createdCount++;
      } catch (err: any) {
        skippedCount++;
        const errMsg = err?.message || String(err);
        errors.push(`Failed to save "${name}" (roll: ${rollNumber}): ${errMsg}`);
        console.error('Bulk import — error inserting student:', name, errMsg);
      }
    }

    res.json({
      success: true,
      created: createdCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/headmaster/students/:id — Update student details
router.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name, admissionNumber, rollNumber, emisNumber, dob, gender,
      bloodGroup, religion, community, nationality, mediumOfInstruction,
      class: cls, section, academicYear, fatherName, fatherOccupation,
      motherName, motherOccupation, parentEmail, phoneNumber, address,
      city, district, state, pincode, studentStatus, schoolId
    } = req.body;

    const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    const { classVal } = parseClassSection(cls || student.class);

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        rollNumber,
        admissionNumber,
        emisNumber,
        class: classVal,
        section: section || student.section,
        dob: parseDob(dob),
        gender,
        bloodGroup,
        religion,
        community,
        nationality,
        mediumOfInstruction,
        academicYear,
        fatherName,
        fatherOccupation,
        motherName,
        motherOccupation,
        parentEmail,
        phoneNumber,
        address,
        city,
        district,
        state,
        pincode,
        studentStatus,
        schoolId,
      }
    });

    // Update User if name or mobile changed
    if (name !== undefined || phoneNumber !== undefined) {
      let mobileValue = student.user.mobile;
      if (phoneNumber && phoneNumber !== student.user.mobile) {
        const existingMobile = await prisma.user.findFirst({ where: { mobile: phoneNumber, id: { not: student.userId } } });
        if (!existingMobile) mobileValue = phoneNumber;
      }
      await prisma.user.update({
        where: { id: student.userId },
        data: {
          name: name !== undefined ? name : undefined,
          mobile: mobileValue,
        }
      });
    }

    res.json({ success: true, data: { ...updatedStudent, name: name !== undefined ? name : student.user.name } });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/students/:id — Delete student
router.delete('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id } });
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found.' });
    }

    // Delete dependent records
    await prisma.mark.deleteMany({ where: { studentId: id } });
    await prisma.attendance.deleteMany({ where: { studentId: id } });
    await prisma.scholarship.deleteMany({ where: { studentId: id } });
    await prisma.promotionRecord.deleteMany({ where: { studentId: id } });
    await prisma.studentAcademicHistory.deleteMany({ where: { studentId: id } });

    await prisma.student.delete({ where: { id } });
    await prisma.user.delete({ where: { id: student.userId } });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/students/bulk-delete — Bulk delete students
router.post('/students/bulk-delete', async (req: Request, res: Response) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, error: 'studentIds array is required' });
    }

    const students = await prisma.student.findMany({ where: { id: { in: studentIds } } });
    const userIds = students.map(s => s.userId);

    // Delete dependent records
    await prisma.mark.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.attendance.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.scholarship.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.promotionRecord.deleteMany({ where: { studentId: { in: studentIds } } });
    await prisma.studentAcademicHistory.deleteMany({ where: { studentId: { in: studentIds } } });

    await prisma.student.deleteMany({ where: { id: { in: studentIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });

    res.json({ success: true, message: 'Students deleted successfully' });
  } catch (err) {
    console.error('Error in bulk delete:', err);
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
      select: SAFE_STAFF_SELECT,
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
    const hashedPassword = await hashPassword(password || '123456');
    const staff = await prisma.headmasterStaff.upsert({
      where: { emisId },
      update: { name, subject: subject || 'General', phone: phone || 'N/A', email: email || null, attendance: attendance ?? 100, performance: performance || 'Good', leaveUsed: leaveUsed ?? 0, password: hashedPassword, schoolId: schoolId || null },
      create: { name, emisId, subject: subject || 'General', phone: phone || 'N/A', email: email || null, attendance: attendance ?? 100, performance: performance || 'Good', leaveUsed: leaveUsed ?? 0, password: hashedPassword, schoolId: schoolId || null },
      select: SAFE_STAFF_SELECT,
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
      const hashedPassword = await hashPassword(s.password || '123456');
      await prisma.headmasterStaff.upsert({
        where: { emisId: s.emisId },
        update: { name: s.name, subject: s.subject || 'General', phone: s.phone || 'N/A', email: s.email || null, attendance: s.attendance ?? 100, performance: s.performance || 'Good', leaveUsed: s.leaveUsed ?? s.leave ?? 0, password: hashedPassword, schoolId: s.schoolId || null },
        create: { name: s.name, emisId: s.emisId, subject: s.subject || 'General', phone: s.phone || 'N/A', email: s.email || null, attendance: s.attendance ?? 100, performance: s.performance || 'Good', leaveUsed: s.leaveUsed ?? s.leave ?? 0, password: hashedPassword, schoolId: s.schoolId || null },
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
        password: password !== undefined ? await hashPassword(password) : undefined,
        schoolId: schoolId !== undefined ? schoolId : undefined,
      },
      select: SAFE_STAFF_SELECT,
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
      select: SAFE_TEMP_STAFF_SELECT,
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
      data: { name, role, agency: agency || 'Direct Contract', joined: joined || '', phone: phone || 'N/A', email: email || 'N/A', duration: duration || '12 Months', salary: salary || 'N/A', status: status || 'Active', password: await hashPassword(password || '123456'), schoolId: schoolId || null },
      select: SAFE_TEMP_STAFF_SELECT,
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
    const records = await Promise.all(staff.filter((s) => s.name && s.role).map(async (s) => ({
      name: s.name, role: s.role, agency: s.agency || 'Direct Contract', joined: s.joined || '',
      phone: s.phone || 'N/A', email: s.email || 'N/A', duration: s.duration || '12 Months',
      salary: s.salary || 'N/A', status: 'Active', password: await hashPassword(s.password || '123456'), schoolId: s.schoolId || null,
    })));
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
        password: password !== undefined ? await hashPassword(password) : undefined,
        schoolId: schoolId !== undefined ? schoolId : undefined,
      },
      select: SAFE_TEMP_STAFF_SELECT,
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
    const safeParents = parents.map(({ password, ...rest }) => rest);
    res.json({ success: true, count: safeParents.length, data: safeParents });
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
        password: await hashPassword(password || '123456'),
        schoolId: schoolId || null,
      },
    });
    const { password: _pw, ...safeParent } = parent;
    res.status(201).json({ success: true, data: safeParent });
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
    const records = await Promise.all(parents
      .filter((p) => p.name && p.role && p.phone)
      .map(async (p) => ({
        name: p.name,
        role: p.role,
        phone: p.phone,
        email: p.email || null,
        studentName: p.studentName || 'N/A',
        studentClass: p.studentClass || 'N/A',
        term: p.term || '2025-26',
        password: await hashPassword(p.password || '123456'),
        schoolId: p.schoolId || null,
      })));
    const result = await prisma.headmasterParent.createMany({ data: records, skipDuplicates: false });
    res.status(201).json({ success: true, created: result.count });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/headmaster/parents/:id — Update parent officer
router.put('/parents/:id', async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    const parent = await prisma.headmasterParent.update({
      where: { id: req.params.id },
      data: password !== undefined ? { ...rest, password: await hashPassword(password) } : rest,
    });
    const { password: _pw, ...safeParent } = parent;
    res.json({ success: true, data: safeParent });
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

// PUT /api/headmaster/leave/:id — Approve or Reject a leave request
router.put('/leave/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvedById } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Must be Approved or Rejected.' });
    }

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status, approvedById: approvedById || null },
    });

    // Handle Teacher Notification
    if (leave.staffId) {
      try {
        const { resolveUserId } = await import('../config/userResolver');
        const resolvedId = await resolveUserId(leave.staffId);
        if (resolvedId) {
          await prisma.notification.create({
            data: {
              userId: resolvedId,
              message: `Your leave request for ${leave.duration} has been ${status}.`,
            } as any
          });
        }
      } catch (notifErr) {
        console.error('[Leave Approval Notification Error]', notifErr);
      }
    }

    // Handle Student Notification
    if (leave.studentId) {
      try {
        const student = await prisma.student.findFirst({
          where: {
            OR: [
              { id: leave.studentId },
              { rollNumber: { equals: leave.studentId, mode: 'insensitive' } },
              { admissionNumber: { equals: leave.studentId, mode: 'insensitive' } },
              { emisNumber: { equals: leave.studentId, mode: 'insensitive' } }
            ]
          }
        });
        if (student && student.userId) {
          await prisma.notification.create({
            data: {
              userId: student.userId,
              message: `Your leave request for ${leave.duration} has been ${status}.`,
            } as any
          });
        }
      } catch (notifErr) {
        console.error('[Leave Approval Notification Error - Student]', notifErr);
      }
    }

    res.json({ success: true, data: leave });
  } catch (err) {
    console.error('Error updating leave status:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MODEL EXAM RESULTS — Classes 6–10 (Samacheer Kalvi)
// ═══════════════════════════════════════════════════════════════════════════

// Helper: compute grade from percentage (TN Samacheer Kalvi scale)
function computeGrade(pct: number): string {
  if (pct >= 91) return 'A+';
  if (pct >= 81) return 'A';
  if (pct >= 71) return 'B+';
  if (pct >= 61) return 'B';
  if (pct >= 51) return 'C';
  if (pct >= 35) return 'D';
  return 'U'; // Under 35 = Fail
}

// Helper: calc total and derived stats for a result row
function calcResultStats(data: any, maxTotal: number) {
  const subjects = ['tamil', 'english', 'mathematics', 'science', 'socialScience'];
  const vals = subjects.map((s) => (data[s] != null ? Number(data[s]) : null));
  const extraVal = data.extraSubject != null ? Number(data.extraSubject) : null;

  const enteredVals = [...vals, ...(extraVal != null ? [extraVal] : [])].filter((v) => v != null) as number[];
  const total = enteredVals.length > 0 ? enteredVals.reduce((a, b) => a + b, 0) : null;
  const percentage = total != null ? parseFloat(((total / maxTotal) * 100).toFixed(2)) : null;
  const grade = percentage != null ? computeGrade(percentage) : null;
  // Pass = every entered subject >= 35
  const isPassed = enteredVals.length > 0 ? enteredVals.every((v) => v >= 35) : null;
  return { total, percentage, grade, isPassed };
}

// POST /api/headmaster/model-exams — Create a new exam session
router.post('/model-exams', async (req: Request, res: Response) => {
  try {
    const { schoolId, examName, examType, class: cls, section, group, academicYear, examDate, createdBy } = req.body;
    if (!schoolId || !examName || !cls) {
      return res.status(400).json({ success: false, error: 'schoolId, examName, and class are required.' });
    }
    const exam = await prisma.modelExam.create({
      data: {
        schoolId,
        examName: examName.trim(),
        examType: examType || 'Unit Test',
        class: String(cls).replace(/class\s*/i, '').trim(),
        section: section || 'A',
        group: group || null,
        academicYear: academicYear || '2024-25',
        examDate: examDate ? new Date(examDate) : null,
        createdBy: createdBy || null,
      },
    });
    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    console.error('Create model exam error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/headmaster/model-exams — List exams for school (optionally filter by class/group)
router.get('/model-exams', async (req: Request, res: Response) => {
  try {
    const { schoolId, class: cls, academicYear, group } = req.query;
    if (!schoolId) return res.status(400).json({ success: false, error: 'schoolId required.' });

    const where: any = { schoolId: String(schoolId) };
    if (cls) where.class = String(cls);
    if (academicYear) where.academicYear = String(academicYear);
    if (group) where.group = String(group);

    const exams = await prisma.modelExam.findMany({
      where,
      orderBy: [{ class: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { results: true } },
      },
    });
    res.json({ success: true, data: exams });
  } catch (err) {
    console.error('List model exams error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/headmaster/model-exams/:id — Get single exam with all results
router.get('/model-exams/:id', async (req: Request, res: Response) => {
  try {
    const exam = await prisma.modelExam.findUnique({
      where: { id: req.params.id },
      include: {
        results: { orderBy: { rollNumber: 'asc' } },
      },
    });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found.' });
    res.json({ success: true, data: exam });
  } catch (err) {
    console.error('Get model exam error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/model-exams/:id/results — Save/upsert marks (manual entry, one student at a time or batch)
router.post('/model-exams/:id/results', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await prisma.modelExam.findUnique({ where: { id } });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found.' });
    if (exam.isLocked) return res.status(403).json({ success: false, error: 'Exam is locked. Marks cannot be changed.' });

    const { results } = req.body; // array of mark rows
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, error: 'results array is required.' });
    }

    const maxTotal = 500; // 5 subjects × 100
    let savedCount = 0;

    for (const row of results) {
      const { studentId, studentName, rollNumber, tamil, english, mathematics, science, socialScience, extraSubject, extraSubjectName } = row;
      if (!studentId) continue;

      const stats = calcResultStats({ tamil, english, mathematics, science, socialScience, extraSubject }, maxTotal);

      await prisma.modelExamResult.upsert({
        where: { examId_studentId: { examId: id, studentId } },
        update: {
          tamil: tamil != null ? Number(tamil) : null,
          english: english != null ? Number(english) : null,
          mathematics: mathematics != null ? Number(mathematics) : null,
          science: science != null ? Number(science) : null,
          socialScience: socialScience != null ? Number(socialScience) : null,
          extraSubject: extraSubject != null ? Number(extraSubject) : null,
          extraSubjectName: extraSubjectName || null,
          ...stats,
        },
        create: {
          examId: id,
          studentId,
          studentName: studentName || 'Unknown',
          rollNumber: rollNumber || '',
          tamil: tamil != null ? Number(tamil) : null,
          english: english != null ? Number(english) : null,
          mathematics: mathematics != null ? Number(mathematics) : null,
          science: science != null ? Number(science) : null,
          socialScience: socialScience != null ? Number(socialScience) : null,
          extraSubject: extraSubject != null ? Number(extraSubject) : null,
          extraSubjectName: extraSubjectName || null,
          maxTotal,
          ...stats,
        },
      });
      savedCount++;
    }

    res.json({ success: true, saved: savedCount });
  } catch (err) {
    console.error('Save model exam results error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/model-exams/:id/bulk-results — Bulk upload marks from Excel
router.post('/model-exams/:id/bulk-results', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await prisma.modelExam.findUnique({ where: { id } });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found.' });
    if (exam.isLocked) return res.status(403).json({ success: false, error: 'Exam is locked. Marks cannot be changed.' });

    const { results } = req.body;
    if (!Array.isArray(results)) return res.status(400).json({ success: false, error: 'results array required.' });

    const maxTotal = 500;
    let savedCount = 0;
    const errors: string[] = [];

    for (const row of results) {
      const { studentId, studentName, rollNumber, tamil, english, mathematics, science, socialScience, extraSubject, extraSubjectName } = row;

      // Try to find student by rollNumber if studentId is missing
      let resolvedStudentId = studentId;
      if (!resolvedStudentId && rollNumber) {
        const found = await prisma.student.findFirst({ where: { rollNumber: String(rollNumber), schoolId: exam.schoolId } });
        if (found) resolvedStudentId = found.id;
      }
      if (!resolvedStudentId) {
        errors.push(`Row skipped: could not resolve student for roll "${rollNumber}"`);
        continue;
      }

      const stats = calcResultStats({ tamil, english, mathematics, science, socialScience, extraSubject }, maxTotal);

      try {
        await prisma.modelExamResult.upsert({
          where: { examId_studentId: { examId: id, studentId: resolvedStudentId } },
          update: {
            tamil: tamil != null ? Number(tamil) : null,
            english: english != null ? Number(english) : null,
            mathematics: mathematics != null ? Number(mathematics) : null,
            science: science != null ? Number(science) : null,
            socialScience: socialScience != null ? Number(socialScience) : null,
            extraSubject: extraSubject != null ? Number(extraSubject) : null,
            extraSubjectName: extraSubjectName || null,
            ...stats,
          },
          create: {
            examId: id,
            studentId: resolvedStudentId,
            studentName: studentName || 'Unknown',
            rollNumber: String(rollNumber || ''),
            tamil: tamil != null ? Number(tamil) : null,
            english: english != null ? Number(english) : null,
            mathematics: mathematics != null ? Number(mathematics) : null,
            science: science != null ? Number(science) : null,
            socialScience: socialScience != null ? Number(socialScience) : null,
            extraSubject: extraSubject != null ? Number(extraSubject) : null,
            extraSubjectName: extraSubjectName || null,
            maxTotal,
            ...stats,
          },
        });
        savedCount++;
      } catch (err: any) {
        errors.push(`Failed for roll "${rollNumber}": ${err?.message}`);
      }
    }

    res.json({ success: true, saved: savedCount, errors: errors.length ? errors : undefined });
  } catch (err) {
    console.error('Bulk model exam results error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PATCH /api/headmaster/model-exams/:id/lock — Lock exam (irreversible)
router.patch('/model-exams/:id/lock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await prisma.modelExam.findUnique({ where: { id } });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found.' });
    if (exam.isLocked) return res.status(400).json({ success: false, error: 'Exam is already locked.' });

    const updated = await prisma.modelExam.update({
      where: { id },
      data: { isLocked: true, lockedAt: new Date() },
    });

    // ── Notify all students in this exam with their individual result ──
    try {
      const results = await prisma.modelExamResult.findMany({
        where: { examId: id },
        include: { exam: true },
      });

      for (const result of results) {
        try {
          // Find student's userId
          const student = await prisma.student.findUnique({ where: { id: result.studentId } });
          if (student?.userId) {
            const subjectLine = [
              result.tamil != null ? `Tamil:${result.tamil}` : null,
              result.english != null ? `English:${result.english}` : null,
              result.mathematics != null ? `Maths:${result.mathematics}` : null,
              result.science != null ? `Science:${result.science}` : null,
              result.socialScience != null ? `Social:${result.socialScience}` : null,
            ].filter(Boolean).join(', ');

            await prisma.notification.create({
              data: {
                userId: student.userId,
                message: `📊 ${exam.examName} Results (Class ${exam.class}-${exam.section}): ${subjectLine} | Total: ${result.total ?? '–'}/500 | ${result.isPassed ? '✅ PASS' : '❌ FAIL'} | Grade: ${result.grade ?? '–'}`,
              } as any,
            });
          }
        } catch (notifErr) {
          console.error('[Exam Result Notification - Student]', notifErr);
        }
      }

      // ── Notify teachers of this class/school ──
      try {
        const teachers = await prisma.teacher.findMany({ where: { schoolId: exam.schoolId } });
        const passed = results.filter(r => r.isPassed === true).length;
        const classMsg = `📋 ${exam.examName} (Class ${exam.class}-${exam.section}) marks have been finalised. ${results.length} students | ${passed} passed | ${results.length - passed} failed.`;
        for (const teacher of teachers) {
          await prisma.notification.create({
            data: { userId: teacher.userId, message: classMsg } as any,
          });
        }
      } catch (teacherNotifErr) {
        console.error('[Exam Result Notification - Teacher]', teacherNotifErr);
      }
    } catch (notifBlockErr) {
      console.error('[Exam Lock Notification Block]', notifBlockErr);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Lock exam error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/headmaster/model-exams/:id/template — Download Excel template pre-filled with students
router.get('/model-exams/:id/template', async (req: Request, res: Response) => {
  try {
    const exam = await prisma.modelExam.findUnique({ where: { id: req.params.id } });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found.' });

    // Fetch students in this class and group from the school
    const whereClause: any = { schoolId: exam.schoolId, class: exam.class, section: exam.section };
    if (exam.group) {
      whereClause.group = exam.group;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { rollNumber: 'asc' },
    });

    // Return as JSON (frontend generates the Excel with XLSX)
    const rows = students.map((s) => ({
      studentId: s.id,
      studentName: s.user?.name || 'Unknown',
      rollNumber: s.rollNumber || '',
      class: s.class,
      section: s.section,
      tamil: '',
      english: '',
      mathematics: '',
      science: '',
      socialScience: '',
      extraSubject: '',
    }));

    res.json({ success: true, data: rows, examName: exam.examName, class: exam.class, section: exam.section });
  } catch (err) {
    console.error('Template fetch error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/model-exams/:id — Delete exam (only if not locked)
router.delete('/model-exams/:id', async (req: Request, res: Response) => {
  try {
    const exam = await prisma.modelExam.findUnique({ where: { id: req.params.id } });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found.' });
    if (exam.isLocked) return res.status(403).json({ success: false, error: 'Cannot delete a locked exam.' });

    await prisma.modelExam.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete exam error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/headmaster/model-exams/student/:studentId — Get locked model exam results for a student
router.get('/model-exams/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const results = await prisma.modelExamResult.findMany({
      where: {
        studentId,
        exam: {
          isLocked: true
        }
      },
      include: {
        exam: true
      },
      orderBy: {
        exam: {
          examDate: 'desc'
        }
      }
    });
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Fetch student model exam results error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ─── School Resource Management Monitor ──────────────────────────────────────
// 9 monitored categories: Classrooms | Laboratories | Computers |
// Smart Classrooms | Libraries | Toilets | Drinking Water |
// Electricity | Internet Facilities

const RESOURCE_CATEGORIES: string[] = [
  'Classrooms', 'Laboratories', 'Computers', 'Smart Classrooms',
  'Libraries', 'Toilets', 'Drinking Water', 'Electricity', 'Internet Facilities',
];

// GET /api/headmaster/school-resources?schoolId=&category=
router.get('/school-resources', async (req: Request, res: Response) => {
  try {
    const { schoolId, category } = req.query;
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'schoolId is required.' });
    }
    const where: any = { schoolId: String(schoolId) };
    if (category && String(category) !== 'All') {
      where.category = String(category);
    }
    const resources = await prisma.schoolResource.findMany({
      where,
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ success: true, count: resources.length, data: resources });
  } catch (err) {
    console.error('[school-resources GET]', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/headmaster/school-resources
router.post('/school-resources', async (req: Request, res: Response) => {
  try {
    const { schoolId, category, name, totalCount, functionalCount, status, remarks, lastAudited } = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'schoolId is required.' });
    }
    if (!category || !RESOURCE_CATEGORIES.includes(String(category))) {
      return res.status(400).json({ success: false, error: 'Invalid or missing category.' });
    }
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: 'name is required.' });
    }

    const resource = await prisma.schoolResource.create({
      data: {
        schoolId: String(schoolId),
        category: String(category),
        name: String(name).trim(),
        totalCount: totalCount != null ? Number(totalCount) : null,
        functionalCount: functionalCount != null ? Number(functionalCount) : null,
        status: status ? String(status) : 'Good',
        remarks: remarks ? String(remarks) : null,
        lastAudited: lastAudited ? new Date(String(lastAudited)) : null,
      },
    });
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    console.error('[school-resources POST]', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PATCH /api/headmaster/school-resources/:id
router.patch('/school-resources/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.schoolResource.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Resource not found.' });
    }
    const { name, totalCount, functionalCount, status, remarks, lastAudited } = req.body;
    const updated = await prisma.schoolResource.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(totalCount !== undefined && { totalCount: totalCount != null ? Number(totalCount) : null }),
        ...(functionalCount !== undefined && { functionalCount: functionalCount != null ? Number(functionalCount) : null }),
        ...(status !== undefined && { status: String(status) }),
        ...(remarks !== undefined && { remarks: remarks ? String(remarks) : null }),
        ...(lastAudited !== undefined && { lastAudited: lastAudited ? new Date(String(lastAudited)) : null }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[school-resources PATCH]', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/headmaster/school-resources/:id
router.delete('/school-resources/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.schoolResource.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Resource not found.' });
    }
    await prisma.schoolResource.delete({ where: { id } });
    res.json({ success: true, message: 'Resource deleted.' });
  } catch (err) {
    console.error('[school-resources DELETE]', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
