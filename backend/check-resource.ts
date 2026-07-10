import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='AcademicResource'`;
  console.log("Columns for AcademicResource:", columns);
}

main().catch(console.error).finally(() => prisma.$disconnect());
