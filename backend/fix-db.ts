import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const subjectCols = [
    'color', 'icon', 'class', 'section', 'subjectCode', 'medium', 'description'
  ];
  const resourceCols = [
    'class', 'section', 'group', 'term', 'chapterNumber', 'topicName', 'learningOutcomes', 'medium', 'bookVersion', 'publisher', 'language', 'coverImage', 'materialType', 'chapter', 'lessonTitle', 'youtubeUrl', 'videoDuration', 'thumbnail', 'contentType', 'author', 'isbn'
  ];

  console.log("Fixing AcademicSubject...");
  for (const col of subjectCols) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "AcademicSubject" ADD COLUMN "${col}" text;`);
      console.log(`Added ${col} to AcademicSubject`);
    } catch (e: any) {
      if (e.message.includes("already exists")) {
        console.log(`${col} already exists on AcademicSubject`);
      } else {
        console.error(`Error adding ${col} to AcademicSubject:`, e.message);
      }
    }
  }
  
  try {
     await prisma.$executeRawUnsafe(`ALTER TABLE "AcademicSubject" ADD COLUMN "status" text DEFAULT 'Active';`);
     console.log(`Added status to AcademicSubject`);
  } catch(e: any){}

  console.log("Fixing AcademicResource...");
  for (const col of resourceCols) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "AcademicResource" ADD COLUMN "${col}" text;`);
      console.log(`Added ${col} to AcademicResource`);
    } catch (e: any) {
      if (e.message.includes("already exists")) {
        console.log(`${col} already exists on AcademicResource`);
      } else {
        console.error(`Error adding ${col} to AcademicResource:`, e.message);
      }
    }
  }

  try {
     await prisma.$executeRawUnsafe(`ALTER TABLE "AcademicResource" ADD COLUMN "downloadAllowed" boolean DEFAULT true;`);
     console.log(`Added downloadAllowed to AcademicResource`);
  } catch(e: any){}
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
