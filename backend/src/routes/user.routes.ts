import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/users - List users by role
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    if (role && !Object.values(Role).includes(role as Role)) {
      return res.status(400).json({ success: false, error: 'Invalid role parameter' });
    }
    const filter = role ? { role: role as Role } : {};
    const users = await prisma.user.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/users - Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, role, password, schoolId } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, and role are required' });
    }

    if (!Object.values(Role).includes(role as Role)) {
      return res.status(400).json({ success: false, error: 'Invalid role value' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // Check if mobile already exists
    if (mobile) {
      const existingMobile = await prisma.user.findUnique({ where: { mobile } });
      if (existingMobile) {
        return res.status(400).json({ success: false, error: 'User with this mobile number already exists' });
      }
    }

    // Create user in PostgreSQL database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile: mobile || null,
        role: role as Role,
        passwordHash: password || "123456",
        schoolId: schoolId || null,
      }
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, password, schoolId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check email uniqueness if email is changed
    if (email && email !== existingUser.email) {
      const emailDuplicate = await prisma.user.findUnique({ where: { email } });
      if (emailDuplicate) {
        return res.status(400).json({ success: false, error: 'User with this email already exists' });
      }
    }

    // Check mobile uniqueness if mobile is changed
    if (mobile && mobile !== existingUser.mobile) {
      const mobileDuplicate = await prisma.user.findUnique({ where: { mobile } });
      if (mobileDuplicate) {
        return res.status(400).json({ success: false, error: 'User with this mobile number already exists' });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        mobile: mobile !== undefined ? (mobile || null) : undefined,
        passwordHash: password !== undefined ? password : undefined,
        schoolId: schoolId !== undefined ? (schoolId || null) : undefined,
      }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/users/auth - Authenticate user (for NextAuth)
router.post('/auth', async (req: Request, res: Response) => {
  try {
    const { loginType, email, password, rollNumber, phone } = req.body;

    if (loginType === 'student') {
      const inputRoll = rollNumber || email;
      const inputPhone = phone || password;

      if (!inputRoll || !inputPhone) {
        return res.status(400).json({ success: false, error: 'Roll number and phone number are required for student login.' });
      }

      const cleanRoll = String(inputRoll).trim();
      const cleanPhone = String(inputPhone).trim();

      // Query student by rollNumber (case-insensitive)
      const student = await prisma.student.findFirst({
        where: {
          rollNumber: {
            equals: cleanRoll,
            mode: 'insensitive'
          }
        },
        include: {
          user: true
        }
      });

      if (!student) {
        return res.status(400).json({ success: false, error: 'Student not found with this roll number.' });
      }

      if (!student.user) {
        return res.status(400).json({ success: false, error: 'Student account is not linked to a user.' });
      }

      // Verify phone number against multiple stored fields:
      // 1. passwordHash (always set to phone on creation — most reliable)
      // 2. user.mobile (can be null if another user had same phone)
      // 3. student.parentMobile (fallback)
      const passwordHash  = student.user.passwordHash ? String(student.user.passwordHash).trim() : null;
      const userMobile    = student.user.mobile       ? String(student.user.mobile).trim()       : null;
      const parentMobile  = student.parentMobile      ? String(student.parentMobile).trim()      : null;

      const matchesPhone =
        passwordHash === cleanPhone ||
        userMobile   === cleanPhone ||
        parentMobile === cleanPhone;

      if (!matchesPhone) {
        console.log(`Auth failed for roll ${cleanRoll}: passwordHash=${passwordHash}, mobile=${userMobile}, parentMobile=${parentMobile}, provided=${cleanPhone}`);
        return res.status(400).json({ success: false, error: 'Incorrect phone number.' });
      }

    console.log("Student Login:");
console.log({
  schoolId: student.schoolId,
  class: student.class,
  section: student.section,
});

return res.json({
  success: true,
  data: {
    id: student.user.id,
    name: student.user.name,
    email: student.user.email || `${student.rollNumber}@tn.gov.in`,
    role: "STUDENT",

    // IMPORTANT
    schoolId: student.schoolId,
    class: student.class,
    section: student.section,
  },
});
    } else {
      // Staff / Parent login by Email and Password
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const cleanEmail = String(email).trim().toLowerCase();

      // ── Step 1: Check PostgreSQL User table (primary source) ──
      const pgUser = await prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } }
      });

    if (pgUser) {
    if (pgUser.passwordHash !== password) {
        return res.status(400).json({
            success: false,
            error: "Invalid password."
        });
    }

    if (pgUser.role === "TEACHER") {
        const teacher = await prisma.headmasterStaff.findFirst({
            where: {
                email: {
                    equals: cleanEmail,
                    mode: "insensitive",
                },
            },
        });

        return res.json({
            success: true,
            data: {
                id: teacher?.id ?? pgUser.id,
                name: teacher?.name ?? pgUser.name,
                email: pgUser.email,
                role: "TEACHER",
                schoolId: teacher?.schoolId ?? pgUser.schoolId,
                subject: teacher?.subject ?? "General",
            },
        });
    }

    return res.json({
        success: true,
        data: {
            id: pgUser.id,
            name: pgUser.name,
            email: pgUser.email,
            role: pgUser.role,
            schoolId: pgUser.schoolId,
        },
    });
}
      // ── Step 2: Check headmasterStaff (MongoDB via Prisma) ──
      const staffMember = await prisma.headmasterStaff.findFirst({
        where: { email: cleanEmail }
      });

      if (staffMember) {
        const staffPass = String(staffMember.password || '123456');
        if (staffPass !== password) {
          return res.status(400).json({ success: false, error: 'Invalid password.' });
        }
        return res.json({
          success: true,
          data: {
            id: String(staffMember.id),
            name: staffMember.name,
            email: staffMember.email || cleanEmail,
            role: 'TEACHER',
            schoolId: staffMember.schoolId || null,
            subject: staffMember.subject || 'General'
          }
        });
      }

      // ── Step 3: Check headmasterParent (MongoDB via Prisma) ──
      const parentMember = await prisma.headmasterParent.findFirst({
        where: { email: cleanEmail }
      });

      if (parentMember) {
        const parentPass = String(parentMember.password || '123456');
        if (parentPass !== password) {
          return res.status(400).json({ success: false, error: 'Invalid password.' });
        }
        return res.json({
          success: true,
          data: {
            id: String(parentMember.id),
            name: parentMember.name,
            email: parentMember.email || cleanEmail,
            role: 'PARENT',
            schoolId: parentMember.schoolId || null
          }
        });
      }

      // ── Not found in any source ──
      return res.status(400).json({ success: false, error: 'User not found.' });
    }
  } catch (err: any) {
    console.error('Authentication error:', err);
    res.status(500).json({ success: false, error: String(err?.message || err) });
  }
});

export default router;

