const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating DigitalLibraryUpload table...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DigitalLibraryUpload" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "subject" TEXT NOT NULL,
          "class" TEXT NOT NULL,
          "size" TEXT NOT NULL DEFAULT 'N/A',
          "description" TEXT,
          "tags" TEXT[],
          "fileUrl" TEXT,
          "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
          "uploadedByRole" TEXT,
          "uploadedById" TEXT,
          "schoolId" TEXT,
          "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "DigitalLibraryUpload_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DigitalLibraryUpload_schoolId_idx" ON "DigitalLibraryUpload"("schoolId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DigitalLibraryUpload_approvalStatus_idx" ON "DigitalLibraryUpload"("approvalStatus");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DigitalLibraryUpload_uploadedById_idx" ON "DigitalLibraryUpload"("uploadedById");`);

    console.log('Table created successfully!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
