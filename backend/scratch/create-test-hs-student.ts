// Creates a synthetic Class 12 (Arts group) student for verifying the
// higher-secondary stream-specific pages. Login: roll R120TEST / phone 9123456780.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.findFirst({ select: { id: true, name: true } });
  if (!school) throw new Error("No school in DB");

  const phone = "9123456780";
  const passwordHash = await bcrypt.hash(phone, 10);

  const existing = await prisma.student.findFirst({ where: { rollNumber: "R120TEST" } });
  if (existing) {
    console.log("Test student already exists:", existing.id);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Test HS Arts",
      email: "test-hs-arts@tn.edu",
      role: "STUDENT",
      mobile: phone,
      passwordHash,
    } as any,
  });

  const student = await prisma.student.create({
    data: {
      userId: user.id,
      schoolId: school.id,
      class: "12",
      section: "A",
      group: "Arts & Humanities",
      rollNumber: "R120TEST",
      parentMobile: phone,
    },
  });

  console.log("Created test student", { studentId: student.id, school: school.name });
}

main().finally(() => prisma.$disconnect());
