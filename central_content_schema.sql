-- ===========================================================================
-- Centralized Content Schema (DDL for PostgreSQL)
-- Run this in your database console/editor to manually create the tables.
-- ===========================================================================

-- 1. Create CentralSubject Table
CREATE TABLE IF NOT EXISTS "CentralSubject" (
    "id" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "applicableGroups" TEXT[] NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CentralSubject_pkey" PRIMARY KEY ("id")
);

-- 2. Create CentralUnit Table
CREATE TABLE IF NOT EXISTS "CentralUnit" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CentralUnit_pkey" PRIMARY KEY ("id")
);

-- 3. Create CentralTopic Table
CREATE TABLE IF NOT EXISTS "CentralTopic" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CentralTopic_pkey" PRIMARY KEY ("id")
);

-- 4. Create CentralContent Table
CREATE TABLE IF NOT EXISTS "CentralContent" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileContent" TEXT,
    "mcqs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CentralContent_pkey" PRIMARY KEY ("id")
);

-- 5. Create Unique Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "CentralSubject_class_name_key" ON "CentralSubject"("class", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "CentralUnit_subjectId_unitNumber_key" ON "CentralUnit"("subjectId", "unitNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "CentralTopic_unitId_topicNumber_key" ON "CentralTopic"("unitId", "topicNumber");

-- 6. Add Foreign Key Constraints (with cascade deletions)
ALTER TABLE "CentralUnit" 
    DROP CONSTRAINT IF EXISTS "CentralUnit_subjectId_fkey",
    ADD CONSTRAINT "CentralUnit_subjectId_fkey" 
    FOREIGN KEY ("subjectId") REFERENCES "CentralSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CentralTopic" 
    DROP CONSTRAINT IF EXISTS "CentralTopic_unitId_fkey",
    ADD CONSTRAINT "CentralTopic_unitId_fkey" 
    FOREIGN KEY ("unitId") REFERENCES "CentralUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CentralContent" 
    DROP CONSTRAINT IF EXISTS "CentralContent_topicId_fkey",
    ADD CONSTRAINT "CentralContent_topicId_fkey" 
    FOREIGN KEY ("topicId") REFERENCES "CentralTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
