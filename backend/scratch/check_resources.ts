import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.academicResource.findMany({
    include: {
      subject: true
    }
  });
  console.log("RESOURCES:");
  resources.forEach(r => {
    console.log({
      id: r.id,
      title: r.title || r.topicName,
      category: r.category,
      url: r.url,
      class: r.class
    });
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
