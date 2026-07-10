const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.academicSubject.findMany();
  const target = subjects.find(s => s.name === "Computer Science");
  
  if (!target) {
     console.log("No CS subject found"); return;
  }
  
  const updated = await prisma.academicSubject.update({
    where: { id: target.id },
    data: { class: "11", medium: "English" }
  });
  console.log("Updated in DB directly:", updated);
}
main();
