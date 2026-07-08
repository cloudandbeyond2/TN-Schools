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
          dob: dob ? new Date(dob) : null,
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

      if (parentEmail) {
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

// POST /api/headmaster/students/bulk — Bulk import (Placeholder for now)
router.post('/students/bulk', async (req: Request, res: Response) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ success: false, error: 'Invalid payload.' });
    }

    let createdCount = 0;
    // Process each student
    for (const student of students) {
      const {
        schoolId, name, rollNumber, admissionNumber, emisNumber, dob, gender,
        bloodGroup, religion, community, nationality, mediumOfInstruction,
        class: cls, section, academicYear, fatherName, fatherOccupation,
        motherName, motherOccupation, parentEmail, phone, phoneNumber, parentName, address,
        city, district, state, pincode, studentStatus, group
      } = student;

      if (!name || !rollNumber) continue;

      const { classVal } = parseClassSection(cls || "Class 1");

      const existingStudent = await prisma.student.findFirst({
        where: { rollNumber, schoolId }
      });
      if (existingStudent) continue;

      const cleanPhone = String(phone || phoneNumber || '').trim();
      let finalMobile = cleanPhone || null;
      if (finalMobile) {
        const existingUser = await prisma.user.findFirst({ where: { mobile: finalMobile } });
        if (existingUser) {
          finalMobile = null; // Prevent unique constraint violation
        }
      }
      
      const hashedPassword = await hashPassword(cleanPhone || '123456');
      
      try {
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              schoolId,
              name,
              mobile: finalMobile,
              passwordHash: hashedPassword,
              role: 'STUDENT',
            }
          });
        const student = await tx.student.create({
          data: {
            userId: user.id,
            rollNumber,
            schoolId,
            class: classVal,
            section: section || 'A',
            group,
            admissionNumber,
            emisNumber,
            dob: dob ? new Date(dob) : null,
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
            studentStatus,
          }
        });

        if (parentEmail) {
          // Check if parent user already exists in PostgreSQL
          let parentUser = await tx.user.findFirst({
            where: { email: { equals: parentEmail.trim().toLowerCase(), mode: 'insensitive' } }
          });

          if (!parentUser) {
            let parentMobile = cleanPhone || null;
            if (parentMobile) {
               const existingParentPhone = await tx.user.findFirst({ where: { mobile: parentMobile } });
               if (existingParentPhone) parentMobile = null;
            }
            parentUser = await tx.user.create({
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

          // The HeadmasterParent and ParentStudentLink models are currently not present in the Prisma schema,
          // so we will skip their creation for now to prevent the 500 error on bulk import.
          /*
          // Check if HeadmasterParent model exists
          let hmParent = await tx.headmasterParent.findFirst({
            where: { email: { equals: parentEmail.trim().toLowerCase(), mode: 'insensitive' } }
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
          */
        }
      });
      createdCount++;
      } catch (err) {
        console.error("Error inserting student", student.name, err);
      }
    }

    res.json({ success: true, created: createdCount });
  } catch (err) {
    console.error("Bulk upload error:", err);
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
        dob: dob ? new Date(dob) : null,
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

export default router;


