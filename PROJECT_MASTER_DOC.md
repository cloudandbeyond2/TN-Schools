# 🏫 TN-Schools AI Ecosystem — Master Project Documentation

> **Single source of truth.** Replaces: `db_overview.md`, `complete_schema_analysis.md`, `system_integration_guide.md`, `rbac_permissions_guide.md`, `CLOUD_SQL_SETUP.md`
>
> Last Updated: July 2026 | Status: Active Development

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Infrastructure & Environment Setup](#3-infrastructure--environment-setup)
4. [Project File Structure](#4-project-file-structure)
5. [Database Architecture](#5-database-architecture)
6. [Full Entity-Relationship Diagram](#6-full-entity-relationship-diagram)
7. [Role Hierarchy & RBAC Permissions](#7-role-hierarchy--rbac-permissions)
8. [API Endpoints by Role](#8-api-endpoints-by-role)
9. [Authentication & Login Flow](#9-authentication--login-flow)
10. [Data Flow Examples](#10-data-flow-examples)
11. [Not Yet Implemented](#11-not-yet-implemented)
12. [Modules Not Yet Configured](#12-modules-not-yet-configured)
13. [Critical Schema Issues](#13-critical-schema-issues)
14. [Schema Gap Analysis — Model by Model](#14-schema-gap-analysis--model-by-model)
15. [Inconsistencies & Outdated Sections](#15-inconsistencies--outdated-sections)

---

## 1. Project Overview

**TN-Schools** is a full-stack AI-powered school management ecosystem for the Tamil Nadu Department of Education. It manages the complete hierarchy from the Education Minister down to Students and Parents across thousands of government schools.

### Core Capabilities
- Multi-role dashboards for 9 distinct roles (Minister to Student)
- Real-time attendance, marks, and homework tracking
- AI-powered lesson plan generation, grading (OCR), and question banks (via Smart Assistant)
- Parent portal with child progress visibility and direct messaging
- School asset, mid-day meal, PTA, and alumni management
- State-wide analytics from Block to District to State level

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js (App Router) | 14.x |
| **Frontend Styling** | Tailwind CSS | 3.x |
| **Backend** | Express.js + TypeScript | 4.18 / 5.3 |
| **ORM** | Prisma | 5.10 |
| **Primary DB** | PostgreSQL (Google Cloud SQL) | — |
| **Secondary DB** | MongoDB Atlas (via Mongoose) | — |
| **AI** | Google Smart Assistant API | — |
| **Auth** | NextAuth.js | — |
| **Deployment** | Vercel (frontend) + Cloud Run (backend) | — |

### Key Dependencies (Backend — `backend/package.json`)
- `@prisma/client`, `prisma` — ORM
- `express`, `cors`, `dotenv` — HTTP server
- `mongoose` — MongoDB client
- `bcryptjs` — **NOT YET INSTALLED** (password hashing pending)
- `jsonwebtoken` — **NOT YET INSTALLED** (JWT auth pending)

---

## 3. Infrastructure & Environment Setup

### Cloud SQL (PostgreSQL)

| Setting | Value |
|---|---|
| **Instance ID** | `free-trial-first-project` |
| **Region** | `us-central1` (Iowa) |
| **Engine** | PostgreSQL |
| **Admin User** | `postgres` |
| **Database Name** | `tn_schools_ecosystem` |
| **Public IP** | `34.70.195.126` (development) |

> **SECURITY WARNING:** The `.env` file contains hardcoded credentials. The PostgreSQL password is `Cloudandbeyond@1`. This MUST be rotated before any production deployment. The old `CLOUD_SQL_SETUP.md` had a different IP and password — those are now outdated.

### MongoDB Atlas

| Setting | Value |
|---|---|
| **Cluster** | `cluster0.i8eiwkd.mongodb.net` |
| **Database** | `tn_schools_ecosystem` |
| **User** | `colossusiq_db_user` |

> MongoDB credentials are also hardcoded in `.env`. Rotate before production.

### Environment Variables Required (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

MONGODB_URI="mongodb+srv://colossusiq_db_user:<password>@cluster0.i8eiwkd.mongodb.net/tn_schools_ecosystem"

CLOUD_SQL_PUBLIC_IP="34.70.195.126"
POSTGRES_URI="postgresql://postgres:Cloudandbeyond%401@34.70.195.126:5432/tn_schools_ecosystem?sslmode=disable"

NEXTAUTH_SECRET="tn-schools-ai-ecosystem-secret-2025"
NEXTAUTH_URL="http://localhost:3000"

# MISSING — needs to be added:
# GEMINI_API_KEY="..."
```

### Setup Commands

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
yarn install

# 3. Generate Prisma client
cd ../backend
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Seed demo data (optional)
npx ts-node prisma/seed.ts

# 6. Start backend dev server (port 5000)
npm run dev

# 7. Start frontend dev server (port 3000)
cd ../frontend
yarn dev
```

### Production: Cloud SQL Auth Proxy

```bash
# Install
gcloud components install cloud_sql_proxy

# Run proxy (exposes Cloud SQL as localhost:5432)
cloud_sql_proxy -instances=YOUR_PROJECT_ID:us-central1:free-trial-first-project=tcp:5432

# Use localhost in POSTGRES_URI
POSTGRES_URI="postgresql://postgres:<password>@127.0.0.1:5432/tn_schools_ecosystem"
```

### Troubleshooting

| Error | Fix |
|---|---|
| `Connection refused` | Your IP not in Cloud SQL Authorized Networks |
| `SSL required` | Add `?sslmode=require` to connection string |
| `Database does not exist` | Run `CREATE DATABASE tn_schools_ecosystem;` |
| `Password authentication failed` | Check URL-encoding of special chars in password |
| `Port 5000 in use` | Run `npm run kill` in backend folder |

---

## 4. Project File Structure

```
TN-Schools/
├── backend/
│   ├── .env                          ← Environment secrets (NOT committed to git)
│   ├── package.json                  ← Node dependencies
│   ├── prisma/
│   │   ├── schema.prisma             ← SINGLE SOURCE OF TRUTH for all DB models (1151 lines, 50+ models)
│   │   ├── migrations/               ← Versioned SQL migration history
│   │   ├── seed.ts                   ← Basic demo data seeder
│   │   └── seed-central-content.ts   ← Central syllabus content seeder
│   └── src/
│       ├── index.ts                  ← API entry point — mounts all 20 route files
│       ├── config/
│       │   ├── db.ts                 ← MongoDB Atlas connection (Mongoose)
│       │   ├── prisma.ts             ← PrismaClient singleton (PostgreSQL)
│       │   └── userResolver.ts       ← Cross-DB resolver: MongoDB staff/parent <-> PostgreSQL User
│       └── routes/                   ← 20 route files:
│           ├── ai.routes.ts          ← AI tools (lesson plans, grading, Q&A)
│           ├── attendance.routes.ts  ← Bulk mark attendance, history
│           ├── activities.routes.ts  ← Clubs, events, student join/leave
│           ├── celebration.routes.ts ← School celebration events
│           ├── centralContent.routes.ts ← Shared syllabus (all schools)
│           ├── class.routes.ts       ← ClassRoom CRUD
│           ├── computerEducation.routes.ts ← Computer education module
│           ├── culturalEvents.routes.ts    ← Cultural events module
│           ├── headmaster.routes.ts  ← Student/Staff/Parent/Asset/Meal management
│           ├── notification.routes.ts← System notifications (User-level)
│           ├── page.routes.ts        ← Role-specific dashboard page data
│           ├── parent.routes.ts      ← Parent dashboard, child linking
│           ├── portfolio.routes.ts   ← Student portfolio & achievements
│           ├── school.routes.ts      ← School CRUD, bulk import, district analytics
│           ├── socialActivities.routes.ts  ← Social activity tracking
│           ├── sports.routes.ts      ← Sports profiles, teams, fitness logs
│           ├── student.routes.ts     ← Student profile, marks, attendance
│           ├── teacher.routes.ts     ← Teacher dashboard, marks, messages
│           ├── user.routes.ts        ← Auth, login, user CRUD
│           └── wellness.routes.ts    ← Student health/wellness
│
└── frontend/
    └── src/app/
        ├── login/                    ← Unified login page (all roles)
        ├── headmaster/               ← Headmaster portal (19 sub-pages)
        │   ├── students/             ← Student management
        │   ├── staff/                ← Teaching staff management
        │   ├── temporary-staff/      ← Contract staff
        │   ├── parents/              ← Parent registry
        │   ├── midday-meal/          ← MDM tracking
        │   ├── timetable/            ← School timetable
        │   ├── scholarship/          ← Scholarship management
        │   ├── attendance/           ← Attendance overview
        │   ├── clubs/                ← Club management
        │   ├── alumni/               ← Alumni records
        │   └── [10 more pages]
        ├── teacher/                  ← Teacher portal (34 sub-pages)
        │   ├── attendance/           ← Mark daily attendance
        │   ├── homework/             ← Assign/review homework
        │   ├── lesson-planner/       ← AI lesson plans
        │   ├── evaluation/           ← AI OCR grading
        │   ├── questions/            ← Question bank
        │   ├── parents/              ← Teacher-parent messaging
        │   ├── sports/               ← Sports management
        │   ├── student-health/       ← Health tracking
        │   └── [26 more pages]
        ├── student/                  ← Student portal
        ├── parent/                   ← Parent portal
        ├── block-education-officer/  ← BEO dashboard
        ├── district-education-officer/ ← DEO dashboard
        ├── commissioner/             ← Commissioner dashboard
        ├── minister/                 ← Minister dashboard
        └── super-admin/              ← Super Admin panel
```

---

## 5. Database Architecture

### Two-Database Design

| Database | Technology | What It Stores |
|---|---|---|
| **PostgreSQL** (Google Cloud SQL) | Prisma ORM | Users, Students, Teachers, Attendance, Marks, Scholarships, Portfolio, Sports, Clubs, Notifications, Timetable, Homework, Lessons — all strongly-typed relational data |
| **MongoDB** (Atlas) | Mongoose + userResolver.ts | HeadmasterStaff, HeadmasterTempStaff, HeadmasterParent, HeadmasterAlumni — legacy flexible records managed via headmaster portal |

> **Important:** Cross-DB referential integrity is enforced at the **application level** via `userResolver.ts`. When a MongoDB record (staff or parent) logs in, the resolver auto-creates or finds their matching `User` in PostgreSQL and saves the `userId` FK back to MongoDB.

> **Schema vs. Reality Note:** `HeadmasterStaff`, `HeadmasterTempStaff`, `HeadmasterParent` and `HeadmasterAlumni` appear BOTH in `schema.prisma` (PostgreSQL) AND may have Mongoose models in the `store/` folder (MongoDB). This is a source of confusion — the `system_integration_guide.md` lists them as MongoDB-only, but they are defined in the Prisma schema. Clarify which DB is actually used in production.

### Role to Profile Model Mapping (Current State as of July 2026)

```
enum Role {
  STUDENT      -> has Student model (PostgreSQL) — fully linked
  PARENT       -> HeadmasterParent (PostgreSQL/MongoDB) — userId loose (no @relation)
  TEACHER      -> has Teacher model (PostgreSQL) — fully linked
  HEADMASTER   -> HeadmasterProfile model EXISTS (schema.prisma line 112) — fully linked
  BEO          -> Beo model EXISTS (schema.prisma line 877) — STUB ONLY, no @relation to User
  DEO          -> Deo model EXISTS (schema.prisma line 942) — STUB ONLY, no @relation to User
  COMMISSIONER -> Commissioner model EXISTS (schema.prisma line 889) — STUB ONLY
  MINISTER     -> Minister model EXISTS (schema.prisma line 953) — STUB ONLY
  SUPERADMIN   -> SuperAdmin model EXISTS (schema.prisma line 1119) — STUB ONLY
}
```

> **CORRECTION from complete_schema_analysis.md:** That document stated "5 out of 9 roles have no profile model." This is now OUTDATED. HeadmasterProfile, Beo, Deo, Commissioner, Minister, and SuperAdmin models have all been added. However, only HeadmasterProfile is properly integrated with @relation directives. The rest are stubs.

---

## 6. Full Entity-Relationship Diagram

```mermaid
erDiagram
    School {
        String id PK
        String dise UK
        String name
        String district
        String block
        String headmasterName "plain text, not FK"
        String headmasterId "nullable unique"
        String beoId "nullable, no @relation"
        String deoId "nullable, no @relation"
        String schoolType
        String mediumOfInstruction
    }

    User {
        String id PK
        String emisId UK
        String mobile UK
        String email UK
        String name
        Role role
        String passwordHash "bcrypt field exists but NOT hashed yet"
        String schoolId FK
        Boolean isActive
    }

    HeadmasterProfile {
        String id PK
        String userId FK
        String schoolId FK
        String employeeId UK
        DateTime joiningDate
        String gender
        String address
    }

    Student {
        String id PK
        String userId FK
        String schoolId FK
        String class "plain text"
        String section "plain text"
        String rollNumber
        String classRoomId "nullable, no @relation"
        String parentName "TEXT DUPLICATE of HeadmasterParent"
        String parentMobile "TEXT DUPLICATE"
    }

    Teacher {
        String id PK
        String userId FK
        String schoolId FK
        String employeeId UK
        String[] subjects
        String qualification
    }

    ClassRoom {
        String id PK
        String schoolId "loose string, no @relation"
        String teacherId "loose string, no @relation"
        String className
        String section
        String subject
        Boolean isActive
    }

    HeadmasterParent {
        String id PK
        String userId "nullable, loose — NO @relation"
        String phone
        String studentName "TEXT DUPLICATE"
        String studentClass "TEXT DUPLICATE"
        String password "PLAINTEXT DEFAULT 123456"
        String term "unclear what this means"
        String schoolId "nullable"
    }

    ParentStudentLink {
        String id PK
        String parentId FK
        String studentId FK
        Boolean isPrimary
    }

    ParentNotification {
        String id PK
        String parentId FK
        String studentId "nullable"
        String type
        String title
        Boolean isRead
    }

    Attendance {
        String id PK
        String studentId FK
        String schoolId FK
        DateTime date
        AttendanceStatus status
        String method
    }

    Mark {
        String id PK
        String studentId FK
        String teacherId "nullable, no @relation"
        String subject "plain text"
        String examType "plain text"
        Int scored
        String academicYear
    }

    Scholarship {
        String id PK
        String studentId FK
        String scheme
        Float amount
        ScholarshipStatus status
    }

    Timetable {
        String id PK
        String schoolId FK
        String class "plain text"
        String section "plain text"
        Int dayOfWeek
        Int period
        String subject "plain text"
        String teacherId "NO @relation — ghost references possible"
        String startTime
        String endTime
    }

    Homework {
        String id PK
        String schoolId "nullable"
        String teacherId "nullable, no @relation"
        String classRoomId "nullable"
        String title
        String dueDate "STRING not DateTime — no date filtering"
        String subject "nullable"
    }

    HomeworkSubmission {
        String id PK
        String homeworkId FK
        String studentId "nullable, no @relation"
        String rollNo "plain text, not FK"
        String name "text copy of student name"
        String score "STRING not Float"
    }

    WatchlistStudent {
        String id PK
        String studentId FK "nullable"
        String name "DUPLICATE of Student->User.name"
        String rollNumber "DUPLICATE"
        String class "DUPLICATE"
        String risk
        String schoolId "nullable"
    }

    Club {
        String id PK
        String schoolId "nullable"
        String name
        String category
    }

    ClubMember {
        String id PK
        String clubId FK
        String studentId FK
        String role
    }

    Portfolio {
        String id PK
        String studentId FK
        String bio
        String stream
    }

    SportsProfile {
        String id PK
        String studentId FK
    }

    HeadmasterStaff {
        String id PK
        String userId "nullable, no @relation"
        String emisId UK
        String name "DUPLICATE of User.name"
        String email "DUPLICATE of User.email"
        String phone "DUPLICATE of User.mobile"
        Float attendance "STALE computed field"
        Int leaveUsed "STALE computed field"
        String password "PLAINTEXT DEFAULT 123456"
        String schoolId "nullable"
    }

    School ||--o{ User : "has"
    School ||--o{ Student : "enrolls"
    School ||--o{ Teacher : "employs"
    School ||--o{ Attendance : "tracks"
    School ||--o{ Timetable : "schedules"
    School ||--o{ HeadmasterProfile : "has"

    User ||--o| Student : "1-to-1"
    User ||--o| Teacher : "1-to-1"
    User ||--o| HeadmasterProfile : "1-to-1"

    Student ||--o{ Attendance : "has"
    Student ||--o{ Mark : "has"
    Student ||--o{ Scholarship : "applies"
    Student ||--o{ ClubMember : "joins"
    Student ||--o| Portfolio : "has"
    Student ||--o| SportsProfile : "has"
    Student ||--o{ ParentStudentLink : "linked to"
    Student ||--o| WatchlistStudent : "flagged in"

    HeadmasterParent ||--o{ ParentStudentLink : "linked to"
    HeadmasterParent ||--o{ ParentNotification : "receives"

    Homework ||--o{ HomeworkSubmission : "has"
    Club ||--o{ ClubMember : "has members"
```

---

## 7. Role Hierarchy & RBAC Permissions

### Tamil Nadu Education Hierarchy

```
MINISTER (Education Minister of Tamil Nadu)
       | oversees entire state
       v
COMMISSIONER (Commissioner of School Education)
       | oversees all districts
       v
DEO (District Education Officer)
       | oversees one district (e.g. Coimbatore District)
       v
BEO (Block Education Officer)
       | oversees one block (e.g. Coimbatore North)
       v
HEADMASTER
       | manages one school
       v
TEACHERS / TEMP STAFF / NON-TEACHING STAFF
       |
       v
STUDENTS  <--------->  PARENTS
```

### Complete CRUD Permissions Matrix

| Entity | Action | Minister/Commissioner | DEO | BEO | Headmaster | Teacher | Parent | Student |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **Headmaster** | Create | Yes State | Yes District | Yes Block | No | No | No | No |
| | View | Yes State | Yes District | Yes Block | Yes Self | No | No | No |
| | Update | Yes State | Yes District | Yes Block | Yes Self | No | No | No |
| | Delete | Yes State | Yes District | Yes Block | No | No | No | No |
| **Teacher** | Create | Yes State | Yes District | Yes Block | Yes School | No | No | No |
| | View | Yes State | Yes District | Yes Block | Yes School | Yes All in school | No | No |
| | Update | Yes State | Yes District | Yes Block | Yes School | Yes Self only | No | No |
| | Delete | Yes State | Yes District | Yes Block | Yes School | No | No | No |
| **Student** | Create | No | No | No | Yes School | No | No | No |
| | View | Yes State | Yes District | Yes Block | Yes School | Yes School | Child only | Self only |
| | Update | No | No | No | Yes School | Yes Academics | No | Portfolio only |
| | Delete | No | No | No | Yes School | No | No | No |
| **Parent** | Create | No | No | No | Yes School | No | No | No |
| | View | Yes State | Yes District | Yes Block | Yes School | Yes School | Self only | No |
| | Update | No | No | No | Yes School | No | Self only | No |
| | Delete | No | No | No | Yes School | No | No | No |

### Role Access Matrix — What Each Role Can See

```
                      SCHOOL  STUDENTS  TEACHERS  ATTENDANCE  MARKS  ASSETS  MEALS  REPORTS
HEADMASTER (1 school)  CRUD    CRUD      CRUD       CRUD        CRUD   CRUD    CRUD   own school
TEACHER    (1 school)  read    edit acad read       CRUD        CRUD   none    none   own class
PARENT     (family)    none    child     none       child       child  none    none   none
STUDENT    (self)      none    self      none       self        self   none    none   none
BEO        (1 block)   read    agg data  agg data   agg data    agg    none    none   block level
DEO        (1 dist)    read    agg data  agg data   agg data    agg    none    none   district
COMMISSIONER (state)   read    agg data  agg data   agg data    agg    none    none   state level
MINISTER   (state)     read    agg data  agg data   agg data    agg    none    none   state level
```

---

## 8. API Endpoints by Role

### Backend Base URL
- **Development:** `http://localhost:5000`
- **Production:** Backend hosted on Cloud Run (URL TBD) | Frontend on `https://tn-schools.vercel.app`

### Headmaster (`/api/headmaster/`)

```
POST   /api/headmaster/students          Add student (User + Student + WatchlistStudent in $transaction)
POST   /api/headmaster/students/bulk     Bulk import from Excel
GET    /api/headmaster/students          List all students in school
PUT    /api/headmaster/students/:id      Update student
DELETE /api/headmaster/students/:id      Delete student (cascades badges, watchlist)
GET/POST/DELETE /api/headmaster/staff         Teaching staff (HeadmasterStaff)
GET/POST/DELETE /api/headmaster/temp-staff    Contract staff (HeadmasterTempStaff)
GET/POST/DELETE /api/headmaster/parents       Parent registry (HeadmasterParent)
GET/POST        /api/headmaster/meals         Mid-day meal logs
GET/POST/PUT/DELETE /api/headmaster/assets    School assets
GET/POST        /api/headmaster/pta           PTA meetings
GET/POST        /api/headmaster/alumni        Alumni records
```

### Teacher (`/api/teacher/`)

```
GET    /api/teacher/students              Students in teacher's classes
POST   /api/teacher/marks                 Enter exam scores
GET/POST /api/teacher/homework            Assign and review homework
GET/POST /api/teacher/messages/:parentId  Teacher-parent messaging (Message table)
POST   /api/teacher/leave                 Submit leave request (staffId tracked)
```

### Attendance (`/api/attendance/`)

```
POST   /api/attendance                        Bulk mark attendance (createMany, skipDuplicates)
GET    /api/attendance/school/:schoolId/today Today's school-wide attendance
GET    /api/attendance/student/:studentId      Student's attendance history
```

### AI (`/api/ai/`)

```
POST   /api/ai/lesson-plan      Generate lesson plan (Smart Assistant)
POST   /api/ai/grade            AI-assisted OCR grading
POST   /api/ai/questions        Generate question bank
GET    /api/ai/chat             AI Q&A assistant
```

### Parent (`/api/parent/`)

```
POST   /api/parent/link-student   Link parent to child by rollNumber
GET    /api/parent/dashboard      Child summary: attendance, marks, homework
GET    /api/parent/notifications  Alerts (ParentNotification) and messages
GET    /api/parent/pta            Upcoming PTA meetings
```

### School & Hierarchy (`/api/schools/`)

```
GET    /api/schools                              List schools (filterable: ?district=X&block=Y)
GET    /api/schools/:id                          Single school details
POST   /api/schools                              Create school
POST   /api/schools/bulk                         Bulk import from Excel
GET    /api/schools/analytics/district/:district District-level KPIs
```

### Other Routes

```
/api/users               Auth, login, user CRUD
/api/students            Student profile, marks, attendance
/api/sports              Sports profiles, teams, fitness logs
/api/portfolio           Student portfolio & achievements
/api/activities          Clubs, events, student join/leave
/api/pages               Role-specific dashboard page data
/api/notifications       System notifications (User-level Notification model)
/api/classes             ClassRoom CRUD
/api/centralized-content Shared syllabus content (all schools)
/api/celebrations        School celebration events
/api/social-activities   Social activity tracking
/api/teacher/cultural-events      Cultural events
/api/teacher/computer-education   Computer education
/api/wellness            Student health/wellness
```

---

## 9. Authentication & Login Flow

### Current State — How Each Role Logs In

| Role | Login Identifier | Stored In | Auth Path |
|---|---|---|---|
| Student | email or emisId | `User` table (PostgreSQL) | Direct |
| Teacher | email | `User` table | Direct |
| Headmaster | email | `User` table | Direct |
| HeadmasterStaff | emisId | MongoDB HeadmasterStaff | Via `userResolver.ts` |
| HeadmasterParent | phone number | MongoDB HeadmasterParent | Via `userResolver.ts` |
| BEO, DEO, Commissioner, Minister | email | `User` table | Direct |

### Login Flow

```
User visits /login
     |
     |-- Headmaster / Teacher / Student / Officer roles:
     |     email + passwordHash from User table
     |     Session: { userId, role, schoolId }
     |
     |-- HeadmasterStaff (teaching staff):
     |     emisId + password from MongoDB HeadmasterStaff
     |     userResolver.ts: finds or creates User in PostgreSQL
     |     HeadmasterStaff.userId <-- saved back
     |     Session: { userId, staffId, role: TEACHER }
     |
     |-- HeadmasterParent:
     |     phone + password from MongoDB HeadmasterParent
     |     userResolver.ts: finds or creates User in PostgreSQL
     |     HeadmasterParent.userId <-- saved back
     |     Session: { userId, parentId, role: PARENT }
     |
     |-- BEO / DEO / Commissioner / Minister:
           email + passwordHash from User table
           Session: { userId, role, schoolId: null }
           WARNING: No blockId/districtId in session — jurisdiction not formally stored!
```

### NextAuth Config
- Secret: `NEXTAUTH_SECRET` env var
- URL: `NEXTAUTH_URL=http://localhost:3000` (hardcoded — must change for production)
- **CRITICAL MISSING:** No JWT or session validation middleware applied to any backend API route

---

## 10. Data Flow Examples

### Student Creation (Full Transaction)

```
Headmaster --> POST /api/headmaster/students
Body: { name: "Kavya R.", rollNumber: "10A001", schoolId: "school-A", class: "10A" }

Prisma $transaction:
  1. User.create({ name, email, role: STUDENT, schoolId })     --> id: u-s1
  2. Student.create({ userId: u-s1, schoolId, class: "10", section: "A" }) --> id: s-1
  3. WatchlistStudent.create({ studentId: s-1, schoolId, risk: "Medium" }) --> auto-flagged

Later, parent links:
POST /api/parent/link-student { parentId: "p-1", rollNumber: "10A001" }
--> ParentStudentLink.create({ parentId: "p-1", studentId: "s-1", isPrimary: true })
```

### Teacher Marks Attendance

```
POST /api/attendance
Body: {
  records: [
    { studentId: "s-1", schoolId: "school-A", date: "2026-06-29", status: "PRESENT" },
    { studentId: "s-2", schoolId: "school-A", date: "2026-06-29", status: "ABSENT" }
  ]
}

--> Attendance.createMany({ data: records, skipDuplicates: true })

Parent notification (application-level, not DB trigger):
--> ParentNotification.create({
      parentId: "p-2",
      studentId: "s-2",
      type: "attendance",
      title: "Rajan was absent today",
      message: "Your child Rajan M. was marked absent on 29 Jun 2026."
    })
```

### Hierarchy Query Flow

```
BEO query:
  GET /api/schools?block=Coimbatore+North
  --> School.findMany({ where: { block: "Coimbatore North" } })
  --> Returns all 10 schools in block with aggregated student/teacher counts

DEO query:
  GET /api/schools?district=Coimbatore
  --> School.findMany({ where: { district: "Coimbatore" } })
  --> Returns ~100 schools across all blocks

Commissioner:
  GET /api/schools (no filter) --> All schools state-wide

Minister:
  State KPI dashboard --> total schools, enrollment, pass rates, scholarship totals
```

---

## 11. Not Yet Implemented

### CRITICAL SECURITY — Not Implemented

| Feature | Status | What's Needed |
|---|---|---|
| **Password hashing (bcrypt)** | NOT IMPLEMENTED | `HeadmasterStaff.password`, `HeadmasterTempStaff.password`, `HeadmasterParent.password` all store plaintext `"123456"` by default. `User.passwordHash` field exists but bcrypt is NOT in `package.json`. Must: `npm install bcryptjs @types/bcryptjs` |
| **JWT / Auth middleware** | NOT IMPLEMENTED | All 20 route files have ZERO authentication guards. Any anonymous HTTP client can call any endpoint. Must create `src/middleware/auth.ts` with `verifyToken()` and apply to all routes |
| **Role-based route guards** | NOT IMPLEMENTED | No middleware verifies that the calling user's role has permission for the endpoint being called |
| **NEXTAUTH_URL for production** | NOT CONFIGURED | Hardcoded as `http://localhost:3000` |
| **GEMINI_API_KEY** | POSSIBLY MISSING | Not found in `.env`. AI routes will fail without this |

### Profile Models — Stubs Only (No Routes, No Frontend Integration)

| Role | Schema Model | What's Missing |
|---|---|---|
| **BEO** | `Beo` model (line 877) | No `@relation` to `User`; no blockId FK to Block model; no routes; no frontend |
| **DEO** | `Deo` model (line 942) | No `@relation` to `User`; no routes; no frontend |
| **Commissioner** | `Commissioner` model (line 889) | No `@relation` to `User`; no routes; no frontend |
| **Minister** | `Minister` model (line 953) | No `@relation` to `User`; MinisterKPI/Budget tables exist but not linked to Minister model |
| **SuperAdmin** | `SuperAdmin` model (line 1119) | No `@relation` to `User`; no routes; no frontend |

### Features Scaffolded But Not Fully Working

| Feature | Status |
|---|---|
| **Teacher Transfers (BEO action)** | Frontend page exists; backend route unclear — no dedicated transfer endpoint confirmed |
| **Scholarship workflow** | `Scholarship` model exists; no dedicated approval/disbursement API |
| **Parent self-registration** | Only headmaster can currently create parents |
| **BEO/DEO jurisdiction** | Not stored in DB — block/district must be derived manually from login context |
| **User-level Notification system** | `Notification` model + routes exist; not integrated in frontend |
| **Announcement read receipts** | Stored as plain String `"0/40 read"` — not real per-user tracking |
| **Homework due date filtering** | `dueDate` stored as String, not DateTime — cannot do date-range queries |
| **Leave approval workflow** | `approvedById` field exists in schema but no approval endpoint documented |
| **EvaluationSubmission student link** | `studentId` field exists but no `@relation` to Student |
| **Timetable teacher integrity** | `teacherId` is plain String — no FK enforced by Prisma |

### Fully Implemented and Working

- Student creation with watchlist entry (Prisma $transaction)
- Attendance marking (bulk createMany with skipDuplicates)
- Parent to Student linking via roll number
- Parent notifications on attendance updates
- Headmaster portal (19 sub-pages scaffolded)
- Teacher portal (34 sub-pages scaffolded)
- AI lesson plan generation (Smart Assistant)
- AI OCR grading
- AI question bank generation
- Portfolio management (skills, projects, achievements with sub-tables)
- Sports profile (teams, fitness stats, events, health logs with sub-tables)
- Club management (members, events)
- Central content system (CentralSubject -> CentralUnit -> CentralTopic -> CentralContent)
- School asset management (SchoolAsset)
- Mid-day meal tracking (MidDayMeal)
- PTA meeting management
- Alumni management
- Minister dashboard (MinisterKPI, MinisterBudget, MinisterDistrictPerformance, etc.)

---

## 12. Modules Not Yet Configured

These modules exist in code or schema but are NOT connected end-to-end:

| Module | What Exists | What's Missing |
|---|---|---|
| **ClassRoom** | Schema model with schoolId, teacherId, className, section | Not used as FK anywhere — Student.class still plain String; Student.classRoomId field added but no @relation |
| **ConferenceSession** | Schema model (line 913) | No route registered in index.ts; no frontend page |
| **HealthReport** | Schema model + Student @relation | wellness.routes.ts exists; HealthReport CRUD unclear |
| **SocialActivity** | Schema + social-activities route | No confirmed frontend integration |
| **SchoolPressActivity** | Schema + Student @relation | No dedicated route in index.ts |
| **InjuryReport** | Schema + Student @relation | No dedicated route in index.ts |
| **CulturalEvent** | Schema + culturalEvents.routes.ts | Route registered; frontend integration not confirmed |
| **ComputerEducation** | Schema + computerEducation.routes.ts | Route registered; frontend at /teacher/computer-education |
| **Celebration** | Schema + celebration.routes.ts | Route registered; frontend at /headmaster/celebrations and /teacher/celebrations |
| **Message** | Schema model (parentId, sender, text) | parentId has no @relation to HeadmasterParent — no enforced integrity |
| **MinisterBudget / MinisterKPI / etc.** | 10+ Minister-specific standalone models | No @relation to Minister model — isolated tables |
| **bcryptjs** | NOT in package.json | Run: `npm install bcryptjs @types/bcryptjs` |
| **jsonwebtoken** | NOT in package.json | Run: `npm install jsonwebtoken @types/jsonwebtoken` |

---

## 13. Critical Schema Issues

These are the most dangerous unresolved problems — they cause security breaches or data corruption:

### Issue 1: Plaintext Passwords (Security Breach Risk)

```
HeadmasterStaff.password    = "123456"   -- stored as plaintext in DB
HeadmasterTempStaff.password = "123456"  -- stored as plaintext in DB
HeadmasterParent.password   = "123456"   -- stored as plaintext in DB
```

Fix required:
1. `npm install bcryptjs @types/bcryptjs`
2. Hash all passwords on creation/update with bcrypt
3. Rename fields to `passwordHash`

### Issue 2: No Authentication Middleware (All Routes Unprotected)

All 20 route files have zero JWT/session guards. Any anonymous HTTP client can read, create, update, or delete any school's data.

Fix required: Create `backend/src/middleware/auth.ts`:
```typescript
export const verifyToken = (req, res, next) => { /* JWT verify */ };
export const requireRole = (...roles) => (req, res, next) => { /* role check */ };
```
Apply to all route files.

### Issue 3: HeadmasterStaff is a Full Duplicate of Teacher + User

HeadmasterStaff stores: name, emisId, phone, email (all already in User) + attendance, leaveUsed, performance (stale computed fields that diverge from real data).

This means the same teacher has two independent records. When User.email changes, HeadmasterStaff.email still shows the old value.

### Issue 4: WatchlistStudent Duplicates Student Data

WatchlistStudent has proper studentId FK but also stores: name, rollNumber, class, phone, parentName — all duplicates of Student/User fields that go stale.

Fix: Remove duplicate text fields. Keep only: studentId FK, risk, issue, schoolId, attendance (computed), lastScore (computed).

### Issue 5: HeadmasterParent.userId Has No @relation Directive

```prisma
model HeadmasterParent {
  userId String? @unique   -- field exists but:
  -- missing: user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

Prisma will NOT enforce referential integrity. Deleting a User leaves orphan HeadmasterParent records with stale userId.

### Issue 6: ClassRoom Model is Completely Orphaned

ClassRoom exists in schema but:
- `schoolId` is a plain String with no `@relation` to School
- `teacherId` is a plain String with no `@relation` to Teacher  
- `Student.classRoomId` field was added but has no `@relation` to ClassRoom
- Result: All class references across the system are still plain strings ("10", "A")

### Issue 7: Timetable.teacherId Has No Prisma @relation

```prisma
model Timetable {
  teacherId String?  -- NO @relation declared
  -- Should be:
  -- teacher  Teacher? @relation(fields: [teacherId], references: [id], onDelete: SetNull)
}
```

Deleting a Teacher leaves ghost teacherId references in all Timetable rows — no constraint violation.

---

## 14. Schema Gap Analysis — Model by Model

| Model | Severity | Current Status | Key Issues |
|---|---|---|---|
| `User` | Medium | Mostly OK | No blockId/districtId for officer roles; no lastLoginAt; no photoUrl |
| `School` | Medium | Improved | headmasterName still plain String; beoId/deoId added but no @relation |
| `Student` | Medium | Mostly OK | parentName/Mobile duplicated; classRoomId added but no FK enforced |
| `Teacher` | Medium | Mostly OK | subjects[] not class-linked; Timetable.teacherId unenforceable |
| `HeadmasterProfile` | Low | Added correctly | Properly linked to User and School via @relation |
| `ClassRoom` | HIGH | Orphaned | schoolId/teacherId are loose Strings; not used as FK from Student |
| `HeadmasterParent` | HIGH | Critical | userId loose (no @relation); plaintext password; text duplicates |
| `HeadmasterStaff` | HIGH | Critical | Full duplicate of Teacher+User; stale computed fields; plaintext password |
| `HeadmasterTempStaff` | Medium | Needs Fix | joined and salary wrong types; plaintext password |
| `WatchlistStudent` | Medium | Improved | Has studentId FK now; but duplicate text fields still present |
| `Attendance` | Low | Well Structured | Minor: markedByUserId field missing |
| `Timetable` | Medium | Needs Fix | teacherId plain String with no @relation |
| `Mark` | Medium | Improved | teacherId field added; but no @relation to Teacher |
| `LeaveRequest` | Medium | Improved | studentId/approvedById/staffId fields added; no @relation directives |
| `Homework` | Medium | Improved | teacherId/classRoomId/subject added; dueDate still String not DateTime |
| `HomeworkSubmission` | Medium | Improved | studentId field added; no @relation; rollNo/name still text copies |
| `EvaluationSubmission` | Medium | Needs Fix | studentId field added; no @relation; submittedAt is String not DateTime |
| `MidDayMeal` | Low | Mostly OK | recordedByUserId added; schoolId has no @relation |
| `SchoolAsset` | Low | Mostly OK | recordedByUserId added; schoolId has no @relation |
| `PTAMeeting` | Low | Mostly OK | createdByUserId added; schoolId loose |
| `Announcement` | Medium | Needs Fix | sender/target still plain text; readReceipts still String counter |
| `StudyMaterial` | Medium | Improved | teacherId/classRoomId/subject added; date/size still wrong types |
| `LessonPlan` | Low | Improved | teacherId/classRoomId fields added; no @relation |
| `StudentBadge` | Medium | Needs Fix | studentId has no @relation to Student; awardedById added |
| `LabEquipment` | Medium | Improved | classRoomId/location/count added; date still String |
| `Question` | Low | Improved | teacherId added; no @relation |
| `Notification` | Medium | Needs Fix | Two notification systems (Notification + ParentNotification); Notification has no type/title |
| `Message` | Medium | Needs Fix | parentId has no @relation to HeadmasterParent |
| `Beo/Deo/Commissioner/Minister/SuperAdmin` | Medium | Stub Only | Models exist; no @relation to User; no routes; no frontend integration |
| `HeadmasterAlumni` | Low | Mostly OK | schoolId loose; no @relation |
| `CentralSubject/Unit/Topic/Content` | Low | Well Structured | Properly nested with cascade relations |
| `SportsProfile and sub-tables` | Low | Well Structured | Properly related; date fields are Strings (minor) |
| `Portfolio and sub-tables` | Low | Well Structured | Properly related with cascade |

---

## 15. Inconsistencies & Outdated Sections

### What Was Wrong in the Old Docs

| Old Document | Outdated/Wrong Claim | Correct Reality (July 2026) |
|---|---|---|
| `complete_schema_analysis.md` | "5 out of 9 roles have no profile model" | HeadmasterProfile, Beo, Deo, Commissioner, Minister, SuperAdmin all exist in schema now |
| `complete_schema_analysis.md` | "HeadmasterStaff on MongoDB" | WRONG — HeadmasterStaff is defined in schema.prisma (PostgreSQL Prisma), not MongoDB |
| `system_integration_guide.md` | HeadmasterProfile "created and integrated" | Confirmed correct — exists at schema line 112 with proper @relation |
| `system_integration_guide.md` | WatchlistStudent studentId is "NEW FK" | Confirmed correct — studentId String? @unique with @relation to Student exists |
| `CLOUD_SQL_SETUP.md` | Instance: free-trial-first-project, password: 0=]k... | .env shows password: Cloudandbeyond@1, IP: 34.70.195.126 — credentials changed |
| `CLOUD_SQL_SETUP.md` | File path: `d:/cab-work/tn-school/backend/.env` | Actual path: `f:/School Project Latest/TN-Schools/backend/.env` |
| `db_overview.md` | "10 tables: User, School, Student..." | Schema now has 50+ models — massively expanded |
| `db_overview.md` | "HeadmasterParent has no userId link" | userId String? @unique field exists — but still has no @relation directive |
| `db_overview.md` | "No dedicated Headmaster model" | HeadmasterProfile model now exists and is properly related |
| `system_integration_guide.md` | MongoDB health check "connected" | index.ts hardcodes string 'connected' for MongoDB without actual verification |
| `system_integration_guide.md` | Startup image sync from C:\Users\WIN\... | index.ts lines 17-32 reference absolute paths to a different machine — this code silently fails on any other computer |
| `rbac_permissions_guide.md` | Section 4 "Headmaster" labeled as "4." but is actually under BEO which is also "4." | Duplicate section numbering — BEO is section 4, Headmaster is labeled 4 but should be 5 |

### Naming Inconsistencies in the Codebase

| Inconsistency | Details |
|---|---|
| ClassRoom vs class string | Student.class is "10" (String), ClassRoom.className is also String — no FK connects them despite both existing |
| Timetable.teacherId: Teacher.id vs User.id | class.routes.ts resolves teacher by email lookup across User and HeadmasterStaff — ambiguous which ID is the canonical teacher reference |
| Two notification tables | Notification (linked to User) vs ParentNotification (linked to HeadmasterParent) — two separate code paths, inconsistent behavior |
| HeadmasterParent.role | Has its own role String field ("Father", "Mother") separate from User.role enum — naming collision |
| Announcement.sender vs Announcement.senderId | Both exist — sender is plain text, senderId is nullable String without @relation — redundant |
| HeadmasterStaff location | Despite being in schema.prisma (PostgreSQL), old docs say it's MongoDB. The store/ folder may have Mongoose models too — needs clarification |
| Section numbering in rbac_permissions_guide.md | BEO is labeled "### 4." and Headmaster is ALSO labeled "### 4." — one is wrong |

---

## Quick Reference: Where Is Each Thing?

| What you need | File location |
|---|---|
| Database schema (source of truth) | `backend/prisma/schema.prisma` |
| Backend API server entry | `backend/src/index.ts` |
| MongoDB connection | `backend/src/config/db.ts` |
| PostgreSQL connection | `backend/src/config/prisma.ts` |
| Cross-DB user resolver | `backend/src/config/userResolver.ts` |
| All backend API routes | `backend/src/routes/` (20 files) |
| Backend dependencies | `backend/package.json` |
| Environment config | `backend/.env` (NEVER commit to git!) |
| Database migrations | `backend/prisma/migrations/` |
| Demo data seeder | `backend/prisma/seed.ts` |
| Central syllabus seeder | `backend/prisma/seed-central-content.ts` |
| All frontend pages | `frontend/src/app/` |
| Headmaster portal (19 pages) | `frontend/src/app/headmaster/` |
| Teacher portal (34 pages) | `frontend/src/app/teacher/` |
| Student portal | `frontend/src/app/student/` |
| Parent portal | `frontend/src/app/parent/` |
| BEO dashboard | `frontend/src/app/block-education-officer/` |
| DEO dashboard | `frontend/src/app/district-education-officer/` |
| Commissioner dashboard | `frontend/src/app/commissioner/` |
| Minister dashboard | `frontend/src/app/minister/` |
