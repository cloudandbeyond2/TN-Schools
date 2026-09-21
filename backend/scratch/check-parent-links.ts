import { prisma } from '../src/config/prisma';

async function main() {
  const parents = await prisma.headmasterParent.findMany({
    include: {
      studentLinks: {
        include: {
          student: {
            include: {
              user: true
            }
          }
        }
      }
    },
    take: 5
  });

  for (const p of parents) {
    console.log(`\nParent: ${p.name} | Email: ${p.email} | Phone: ${p.phone}`);
    console.log(`Linked Students count: ${p.studentLinks.length}`);
    p.studentLinks.forEach(l => {
      console.log(`  - Student: ${l.student.user?.name || 'N/A'}, Roll: ${l.student.rollNumber}, Class: ${l.student.class}-${l.student.section}`);
    });
  }
}

main().finally(() => prisma.$disconnect());
