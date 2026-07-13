const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          in: ["Linga", "Abinaya"],
          mode: "insensitive"
        }
      }
    });
    console.log("Users:", users);

    for (const u of users) {
      if (u.schoolId) {
        const school = await prisma.school.findUnique({
          where: { id: u.schoolId }
        });
        console.log(`School for ${u.name}:`, school);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
