# 🏫 TN-Schools — Complete System Integration Guide

> **How 10 schools, their headmasters, teachers, students, parents, and the entire Tamil Nadu education hierarchy are connected.**

---

## 📐 Project File Structure

```
TN-Schools/
├── backend/                          ← Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma             ← Single source of truth for ALL DB models
│   │   └── migrations/               ← Versioned SQL migration history
│   └── src/
│       ├── index.ts                  ← API server entry (all routes mounted here)
│       ├── config/
│       │   ├── prisma.ts             ← PrismaClient singleton
│       │   └── userResolver.ts       ← Cross-table ID resolver (MongoDB ↔ Postgres)
│       └── routes/
│           ├── user.routes.ts        ← Auth, login, user CRUD
│           ├── school.routes.ts      ← School CRUD, bulk import, district analytics
│           ├── student.routes.ts     ← Student profile, marks, attendance
│           ├── teacher.routes.ts     ← Teacher dashboard, timetable, AI tools, messages
│           ├── headmaster.routes.ts  ← Student/Staff/Parent management, assets, meals
│           ├── parent.routes.ts      ← Parent dashboard, child linking, notifications
│           ├── attendance.routes.ts  ← Bulk mark attendance, per-student history
│           ├── class.routes.ts       ← ClassRoom CRUD
│           ├── activities.routes.ts  ← Clubs, events, student join/leave
│           ├── portfolio.routes.ts   ← Student portfolio & achievements
│           ├── sports.routes.ts      ← Sports profiles, teams, fitness logs
│           ├── notification.routes.ts← System notifications (User-level)
│           ├── centralContent.routes.ts ← Shared syllabus content (all schools)
│           ├── ai.routes.ts          ← AI tools (lesson plans, grading, Q&A)
│           ├── page.routes.ts        ← Role-specific dashboard page data
│           └── wellness.routes.ts    ← Student health/wellness tracking
│
└── frontend/                         ← Next.js 14 App Router
    └── src/app/
        ├── login/                    ← Unified login page (all roles)
        ├── headmaster/               ← Headmaster portal
        ├── teacher/                  ← Teacher portal
        ├── student/                  ← Student portal
        ├── parent/                   ← Parent portal
        ├── block-education-officer/  ← BEO dashboard
        ├── district-education-officer/ ← DEO dashboard
        ├── commissioner/             ← Commissioner dashboard
        ├── minister/                 ← Minister dashboard
        └── super-admin/              ← Super Admin panel
```

---

## 🔗 Database: How It's All Connected

Two databases are used:

| Database | Technology | Stores |
|---|---|---|
| **PostgreSQL** | Prisma ORM | Users, Students, Teachers, Schools, Attendance, Marks, Scholarships, Clubs, Portfolios, Notifications, Messages |
| **MongoDB** (via Prisma) | Prisma MongoDB provider | HeadmasterStaff, HeadmasterTempStaff, HeadmasterParent, HeadmasterAlumni |

> ⚠️ Cross-DB referential integrity is enforced at the **application level** via `userResolver.ts` — which auto-creates `User` records in PostgreSQL for portal users from MongoDB, and persists the `userId` FK back.

---

## 🏫 Example: 10 Schools, Fully Connected

### Concrete Data Model

```
Block: Coimbatore North
│
├── School A — GHSS Vadavalli (DISE: 330100001)
│   ├── Headmaster: Rajesh Kumar  (User id: u-hm-1, role: HEADMASTER, schoolId: school-A)
│   │
│   ├── Teacher 1: Meena Devi     (User id: u-t1, Teacher id: t-1, schoolId: school-A)
│   │   ├── Subjects: ["Mathematics", "Science"]
│   │   ├── ClassRoom: Class 10A – Mathematics  (teacherId: u-t1, schoolId: school-A)
│   │   └── ClassRoom: Class 10B – Science      (teacherId: u-t1, schoolId: school-A)
│   │
│   ├── Teacher 2: Arun Selvam    (User id: u-t2, Teacher id: t-2, schoolId: school-A)
│   │   ├── Subjects: ["Tamil", "Social Science"]
│   │   └── ClassRoom: Class 9A – Tamil         (teacherId: u-t2, schoolId: school-A)
│   │
│   ├── Student 1: Kavya R.        (User id: u-s1, Student id: s-1, class: 10, section: A)
│   │   ├── Attendance[]           (studentId: s-1, schoolId: school-A, date, status)
│   │   ├── Mark[]                 (studentId: s-1, subject, examType, scored)
│   │   ├── Scholarship[]          (studentId: s-1, scheme: "BC/MBC", status: PENDING)
│   │   ├── ClubMember[]           (studentId: s-1, clubId: club-1, role: "President")
│   │   ├── Portfolio              (studentId: s-1, bio, skills[], projects[], achievements[])
│   │   ├── SportsProfile          (studentId: s-1, teams[], stats[], events[])
│   │   ├── StudentBadge[]         (studentId: s-1, badge: "Top Scorer")
│   │   ├── WatchlistStudent       (studentId: s-1, risk: "Low", schoolId: school-A)  ← NEW FK
│   │   └── ParentStudentLink[]    (studentId: s-1, parentId: p-1)
│   │
│   ├── Student 2: Rajan M.        (User id: u-s2, Student id: s-2, class: 10, section: A)
│   ├── Student 3: Priya K.        (User id: u-s3, Student id: s-3, class: 9, section: B)
│   ├── Student 4: Arjun V.        (User id: u-s4, Student id: s-4, class: 10, section: B)
│   ├── Student 5: Deepa S.        (User id: u-s5, Student id: s-5, class: 9, section: A)
│   │
│   ├── Parent 1: Lakshmi R.       (HeadmasterParent id: p-1, userId: u-p1 ← NEW FK)
│   │   ├── ParentStudentLink      (parentId: p-1, studentId: s-1, isPrimary: true)
│   │   ├── ParentNotification[]   (parentId: p-1, studentId: s-1, type: "attendance")
│   │   └── Message[]              (parentId: p-1, sender: "Teacher", text: "...")  ← NEW DB
│   │
│   ├── Parent 2: Murugan M.       (HeadmasterParent id: p-2, userId: u-p2)
│   │   └── ParentStudentLink      (parentId: p-2, studentId: s-2)
│   │
│   ├── Parent 3: Geetha K.        (parentId: p-3) ← parent of s-3
│   ├── Parent 4: Venkat V.        (parentId: p-4) ← parent of s-4
│   ├── Parent 5: Saranya S.       (parentId: p-5) ← parent of s-5
│   │
│   ├── HeadmasterStaff[]          (schoolId: school-A)  ← Teaching + Non-teaching staff
│   ├── HeadmasterTempStaff[]      (schoolId: school-A)  ← Contract staff
│   ├── MidDayMeal[]               (schoolId: school-A, date, studentsServed, menuItems[])
│   ├── SchoolAsset[]              (schoolId: school-A, category: "Computer", quantity: 20)
│   ├── Announcement[]             (schoolId: school-A, target: "Class 10A Parents")
│   ├── Homework[]                 (schoolId: school-A, className: "Class 10A")
│   ├── PTAMeeting[]               (schoolId: school-A, meetingDate, agenda[])
│   ├── StudyMaterial[]            (schoolId: school-A, classSection: "Class 10A")
│   ├── LeaveRequest[]             (schoolId: school-A, staffId: staff-id)
│   ├── Club[]                     (schoolId: school-A, name: "Science Club")
│   ├── ClubEvent[]                (schoolId: school-A, clubId: club-1, eventDate)
│   ├── LessonPlan[]               (schoolId: school-A)
│   ├── LabEquipment[]             (schoolId: school-A)
│   ├── Question[]                 (schoolId: school-A, grade: "10")
│   ├── EvaluationSubmission[]     (schoolId: school-A)
│   ├── Timetable[]                (schoolId: school-A, class: "10", section: "A")
│   └── HeadmasterAlumni[]         (schoolId: school-A)
│
├── School B — GHSS Singanallur   (DISE: 330100002, same structure as School A)
├── School C — GHSS Peelamedu    (DISE: 330100003)
├── ...
└── School J — GHSS Kavundampalayam (DISE: 330100010)
```

---

## 👥 Entity Relationship Summary (Per School)

```
User ──────────────────1:1──────────────► Student
  │  (userId FK, onDelete: CASCADE)           │
  │                                           ├── Attendance[]    (schoolId, studentId)
  │                                           ├── Mark[]          (studentId)
  │                                           ├── Scholarship[]   (studentId)
  │                                           ├── ClubMember[]    (studentId, clubId)
  │                                           ├── Portfolio?      (studentId)
  │                                           ├── SportsProfile?  (studentId)
  │                                           ├── StudentBadge[]  (studentId) ← CASCADE
  │                                           ├── HomeworkSubmission[] (studentId) ← SET NULL
  │                                           ├── WatchlistStudent?   (studentId) ← SET NULL
  │                                           └── ParentStudentLink[] (studentId)
  │
  ├── 1:1──────────────────────────────► Teacher
  │  (userId FK, onDelete: CASCADE)           └── (subjects[], schoolId)
  │
  ├── 1:1 (new) ────────────────────► HeadmasterStaff  (MongoDB)
  │  (userId FK, onDelete: SET NULL)
  │
  └── 1:1 (new) ────────────────────► HeadmasterParent (MongoDB)
     (userId FK, onDelete: SET NULL)      │
                                          ├── ParentStudentLink[] (parentId, studentId)
                                          ├── ParentNotification[] (parentId, studentId)
                                          └── Message[]           (parentId) ← NEW

School ──────────────────────────────────────────────────────────────────────────
  │  Back-references to 22 models (all now have FK constraints)
  ├── User[], Student[], Teacher[], Attendance[], Timetable[]     ← (existed before)
  ├── ClassRoom[], MidDayMeal[], SchoolAsset[]                    ← CASCADE on school delete
  └── WatchlistStudent[], HeadmasterStaff[], HeadmasterTempStaff[],
      HeadmasterParent[], PTAMeeting[], HeadmasterAlumni[],
      StudyMaterial[], Announcement[], Homework[], EvaluationSubmission[],
      LabEquipment[], LeaveRequest[], LessonPlan[], Question[],
      Club[], ClubEvent[], Message[]                              ← SET NULL on school delete
```

---

## 🔑 Login Flow for Each Role

```
Any user visits /login
         │
         ├── Headmaster, Teacher, Student: login via User table (email + passwordHash)
         │     → Session contains: { userId, role, schoolId }
         │
         ├── Staff (HeadmasterStaff): login via HeadmasterStaff.emisId + password
         │     → userResolver creates/finds User in PostgreSQL
         │     → HeadmasterStaff.userId ← persisted back  ← NEW
         │     → Session contains: { userId (User.id), staffId (HeadmasterStaff.id), role: TEACHER }
         │
         ├── Parent (HeadmasterParent): login via phone + password
         │     → userResolver creates/finds User in PostgreSQL
         │     → HeadmasterParent.userId ← persisted back  ← NEW
         │     → Session contains: { userId (User.id), parentId (HeadmasterParent.id), role: PARENT }
         │
         ├── BEO, DEO, Commissioner, Minister: login via User table
         │     → No dedicated profile model exists yet (see missing section)
         │     → Session contains: { userId, role, schoolId (null) }
         └──
```

---

## 🏛️ Hierarchy Roles: What Each Can View & Manage

### Role Access Matrix

```
                      SCHOOL  STUDENTS  TEACHERS  ATTENDANCE  MARKS  ASSETS  MEALS  REPORTS
HEADMASTER (1 school)  ✏️       ✏️        ✏️         ✏️          ✏️     ✏️      ✏️     📊 (own)
TEACHER    (1 school)  👁️       ✏️        👁️         ✏️          ✏️     ❌      ❌     📊 (own class)
PARENT     (1 family)  ❌       👁️ own    ❌         👁️ own      👁️ own ❌      ❌     ❌
STUDENT    (self)      ❌       👁️ self   ❌         👁️ self     👁️ self ❌     ❌     ❌
BEO        (1 block)   👁️ all   📊 agg    📊 agg    📊 agg     📊 agg  ❌      ❌     📊 block
DEO        (1 district) 👁️ all  📊 agg    📊 agg    📊 agg     📊 agg  ❌      ❌     📊 district
COMMISSIONER (state)   👁️ all   📊 agg    📊 agg    📊 agg     📊 agg  ❌      ❌     📊 state
MINISTER   (state)     👁️ all   📊 agg    📊 agg    📊 agg     📊 agg  ❌      ❌     📊 state

Legend: ✏️ Full CRUD  👁️ Read Only  📊 Analytics/Aggregated  ❌ No Access
```

---

### 🏫 HEADMASTER — Manages One School
**Portal:** `/headmaster/*`

| Module | Can Do |
|---|---|
| **Students** | Add, edit, delete students; bulk import via Excel; view watchlist (at-risk) |
| **Staff** | Add/remove teaching staff, temp staff; track attendance & performance |
| **Parents** | Register parents; link to students; send announcements |
| **Mid-Day Meal** | Log daily meals, stock used, students served |
| **Assets** | Track computers, furniture, labs, sports equipment |
| **PTA Meetings** | Schedule, manage agenda, track attendance |
| **Alumni** | Maintain alumni records and contributions |
| **Study Materials** | Upload PDFs and notes for teachers/students |
| **Announcements** | Broadcast to parents by class/section |
| **Timetable** | View/manage school timetable |
| **Analytics** | School-level attendance %, grade distribution |

**DB Access Pattern:**
```typescript
// Headmaster scopes all queries to their schoolId
const students = await prisma.watchlistStudent.findMany({
  where: { schoolId: headmaster.schoolId }
});
```

---

### 👩‍🏫 TEACHER — Manages Their Classes
**Portal:** `/teacher/*`

| Module | Can Do |
|---|---|
| **Attendance** | Mark daily attendance (Present/Absent/Late/Leave) per class |
| **Marks** | Enter exam scores by subject and exam type |
| **Homework** | Create assignments; review submissions; AI-grade with OCR |
| **Lesson Plans** | AI-generate lesson plans from syllabus |
| **Study Materials** | Upload notes for their classes |
| **Parent Messages** | Direct message parents (stored in `Message` table) |
| **Question Bank** | Generate MCQ/short/long questions via AI |
| **Lab Equipment** | Schedule and log lab sessions |
| **Leave Requests** | Submit leave requests (staffId FK tracked) |
| **Announcements** | Send class-level announcements to parents |
| **Student Badges** | Award badges to students (e.g. "Best in Class") |

**DB Access Pattern:**
```typescript
// Teacher fetches only their classes
const classes = await prisma.classRoom.findMany({
  where: { teacherId: { in: [teacherUserId, headmasterStaffId] } }
});
```

---

### 👨‍👩‍👧 PARENT — Views Their Child's Data
**Portal:** `/parent/*`

| Module | Can View |
|---|---|
| **Attendance** | Their child's attendance % and daily history |
| **Marks** | Exam scores by subject, grade trend charts |
| **Homework** | Pending/submitted assignments |
| **Scholarships** | Application status and disbursement |
| **Announcements** | Teacher and Headmaster announcements |
| **PTA Meetings** | Upcoming meetings for their school |
| **Messages** | Chat thread with teachers |
| **Notifications** | Alerts for absence, low marks, meetings |

**DB Access Pattern:**
```typescript
// Parent accesses only linked students
const links = await prisma.parentStudentLink.findMany({
  where: { parentId: session.parentId },
  include: { student: { include: { attendance: true, marks: true } } }
});
```

---

### 🎒 STUDENT — Views Their Own Profile
**Portal:** `/student/*`

| Module | Can View/Do |
|---|---|
| **Dashboard** | Attendance %, recent marks, upcoming homework |
| **Marks** | Full exam history by subject |
| **Portfolio** | Edit skills, projects, achievements |
| **Sports** | View teams, fitness stats, health logs |
| **Clubs** | Join/leave clubs; view upcoming events |
| **Announcements** | Class-level announcements |
| **Scholarships** | Application status |

---

### 👨‍💼 BEO — Block Education Officer
**Portal:** `/block-education-officer/*`  
**Jurisdiction:** One block (e.g., Coimbatore North = 10 schools)

| What they see | How it works in the system |
|---|---|
| **All schools in their block** | `School.findMany({ where: { block: beo.block } })` |
| **Aggregated student count** | Sum of `_count.students` across block schools |
| **Aggregated teacher count** | Sum of `_count.teachers` across block schools |
| **Block attendance %** | Attendance grouped by schoolId for all schools in block |
| **District-level school analytics** | `GET /api/schools/analytics/district/:district` |
| **School asset summary** | Aggregated view of all schools' assets |

> ⚠️ **Gap:** `User` has no `blockId` or `districtId` field. BEO, DEO, Commissioner, and Minister have **no profile model** — they log in as a `User` with the correct `role` but jurisdiction (block/district) is not formally stored. Queries must be scoped manually using the `district`/`block` fields on `School`.

**Currently implemented (frontend):** BEO portal exists at `/block-education-officer` with read-only dashboards.

---

### 👨‍💼 DEO — District Education Officer
**Portal:** `/district-education-officer/*`  
**Jurisdiction:** One district (e.g., Coimbatore = ~100 schools across multiple blocks)

| What they see | How it works |
|---|---|
| **All schools in their district** | `School.findMany({ where: { district: deo.district } })` |
| **Block-wise breakdown** | Group schools by `block` field |
| **District attendance analytics** | Aggregated via `Attendance.groupBy({ by: ['schoolId'] })` |
| **District scholarship status** | `Scholarship.findMany` filtered by school's district |
| **All BEOs in district** | `User.findMany({ where: { role: 'BEO' } })` (no block FK) |

---

### 👨‍💼 COMMISSIONER — State-Level
**Portal:** `/commissioner/*`  
**Jurisdiction:** All districts of Tamil Nadu

| What they see | How it works |
|---|---|
| **All schools state-wide** | `School.findMany()` — no filter |
| **District-wise analytics** | `/api/schools/analytics/district/:district` |
| **State-wide attendance rate** | Cross-school aggregated attendance |
| **Scholarship disbursement** | `Scholarship.groupBy({ by: ['status'] })` |
| **All DEOs** | `User.findMany({ where: { role: 'DEO' } })` |

---

### 👨‍💼 MINISTER — Education Minister (Top Level)
**Portal:** `/minister/*`  
**Jurisdiction:** Entire Tamil Nadu education system

| What they see | How it works |
|---|---|
| **State-wide KPIs** | Total schools, students, teachers, attendance % |
| **District comparison** | Schools grouped by district with analytics |
| **Scholarship disbursement** | State-wide totals by scheme (BC/MBC, SC/ST, Minority) |
| **System health** | Active users, recent logins, data coverage % |
| **All Commissioners** | `User.findMany({ where: { role: 'COMMISSIONER' } })` |

---

## ❌ What's Missing (Gaps in the Current Implementation)

### 1. Profile Models for BEO, DEO, Commissioner, Minister

```
enum Role {
  HEADMASTER   → ✅ HeadmasterProfile model created and integrated!
  BEO          → ❌ No BEOProfile model (no blockId, no blockName)
  DEO          → ❌ No DEOProfile model (no districtId, no districtName)
  COMMISSIONER → ❌ No CommissionerProfile model
  MINISTER     → ❌ No MinisterProfile model
  SUPERADMIN   → ❌ No SuperAdminProfile model
}
```

**Impact:** When a BEO logs in, the system has no way to know **which block** they manage. Currently the frontend hardcodes or asks the BEO manually. The system should store `blockId`/`districtId` in a profile model.

**Proposed Fix (implemented for Headmaster):**
```prisma
model HeadmasterProfile {
  id            String    @id @default(uuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  schoolId      String
  school        School    @relation(fields: [schoolId], references: [id])
  employeeId    String?   @unique
  joiningDate   DateTime?
  address       String?
  gender        String?
  dob           DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 2. BEO, DEO, Commissioner, Minister profile models are skipped for now
As requested, these high-level officer profiles are skipped until testing the full Headmaster ↔ Teacher ↔ Student ↔ Parent workflow is complete.

### 3. `ClassRoom.teacherId` / `Timetable.teacherId` — Dual-table reference
These fields store either a `User.id` OR a `HeadmasterStaff.id` depending on context. This is resolved via email lookup in `class.routes.ts`. A proper solution would be to pick one canonical teacher ID type.

### 4. Password hashing not implemented
`HeadmasterStaff.password`, `HeadmasterTempStaff.password`, `HeadmasterParent.password`, and `User.passwordHash` all store **plain-text** passwords. `bcryptjs` should be integrated before production.

### 5. No authentication middleware on API routes
All API endpoints are currently unprotected — any client can call any route without a valid session token. JWT or NextAuth session validation middleware needs to be applied to all protected routes.

### 6. BEO/DEO jurisdiction not stored in the database
No `district` or `block` field on `User` for officer roles. Cross-school queries must use hardcoded values or be derived from login context.

### 7. Headmaster school ownership
A Headmaster is just a `User` with `role: HEADMASTER` and a `schoolId`. There is no formal `Headmaster` model that owns the school record and is enforced at the DB level.

---

## 🔁 Data Flow: Student Creation (Full Example)

```
Headmaster adds Student "Kavya" to School A:
          │
          ▼
POST /api/headmaster/students
{ name: "Kavya R.", rollNumber: "10A001", schoolId: "school-A", class: "10A" }
          │
          ▼ Prisma $transaction
┌──────────────────────────────────────────────────────────┐
│ 1. User.create({ name, email, role: STUDENT, schoolId }) │  → id: u-s1
│ 2. Student.create({ userId: u-s1, schoolId, class, ... }) │  → id: s-1
│ 3. WatchlistStudent.create({                              │
│       student: { connect: { id: s-1 } },                 │  ← FK link (NEW)
│       school:  { connect: { id: school-A } },            │  ← FK link (NEW)
│       risk: "Medium"                                      │
│    })                                                     │
└──────────────────────────────────────────────────────────┘
          │
          ▼
Parent logs in → parent.routes.ts links HeadmasterParent to Student:
POST /api/parent/link-student { parentId, rollNumber }
          │
          ▼
ParentStudentLink.create({ parentId, studentId: s-1, isPrimary: true })

Parent can now view Kavya's data:
GET /api/parent/dashboard?parentId=p-1
  → returns attendance[], marks[], homework[], announcements[]
```

---

## 🔁 Data Flow: Teacher Marks Attendance

```
Teacher opens attendance for Class 10A:
          │
          ▼
POST /api/attendance
{ records: [
    { studentId: "s-1", schoolId: "school-A", date: "2026-06-29", status: "PRESENT" },
    { studentId: "s-2", schoolId: "school-A", date: "2026-06-29", status: "ABSENT" },
    ...
  ]
}
          │
          ▼
Attendance.createMany({ data: records, skipDuplicates: true })
          │
          ▼
Parent gets notified:
ParentNotification.create({
  parentId: "p-2",   ← Rajan's parent
  studentId: "s-2",  ← FK to Student (NEW)
  type: "attendance",
  title: "Rajan was absent today",
  message: "Your child Rajan M. was marked absent on 29 Jun 2026."
})
```

---

## 📊 Hierarchy Data Flow (BEO → Minister)

```
BEO (Coimbatore North Block)
  ├── GET /api/schools?block=Coimbatore+North
  │     → Returns all 10 schools in block
  └── GET /api/schools/analytics/district/Coimbatore
        → totalSchools: 10, totalStudents: 5000, totalTeachers: 300

DEO (Coimbatore District)
  ├── GET /api/schools?district=Coimbatore
  │     → Returns all ~100 schools across all blocks
  └── Aggregates attendance, marks, scholarship data by block

Commissioner (All Districts)
  ├── GET /api/schools (no filter)
  │     → All schools state-wide
  └── Dashboard: district-wise KPIs

Minister (State Level)
  └── State KPI dashboard: total schools, enrollment, pass rates, scholarship disbursement
```

---

## 🗂️ Key API Endpoints by Role

### Headmaster
```
POST   /api/headmaster/students          ← Add student (creates User + Student + WatchlistStudent)
POST   /api/headmaster/students/bulk     ← Bulk import from Excel
GET    /api/headmaster/students          ← List all students in school
PUT    /api/headmaster/students/:id      ← Update student
DELETE /api/headmaster/students/:id      ← Delete student
GET/POST/DELETE /api/headmaster/staff    ← Teaching staff (HeadmasterStaff)
GET/POST/DELETE /api/headmaster/temp-staff  ← Contract staff
GET/POST/DELETE /api/headmaster/parents  ← Parent registry
GET/POST        /api/headmaster/meals    ← Mid-day meal logs
GET/POST/PUT/DELETE /api/headmaster/assets ← School assets
GET/POST        /api/headmaster/pta      ← PTA meetings
GET/POST        /api/headmaster/alumni   ← Alumni records
```

### Teacher
```
POST   /api/attendance                   ← Bulk mark attendance
GET    /api/teacher/students             ← Students in my classes
POST   /api/teacher/marks                ← Enter exam scores
GET/POST /api/teacher/homework           ← Assign and review homework
GET/POST /api/teacher/messages/:parentId ← Teacher-parent messaging (DB-persisted)
POST   /api/teacher/leave                ← Submit leave request (staffId tracked)
POST   /api/ai/lesson-plan               ← AI lesson plan generation
POST   /api/ai/grade                     ← AI-assisted grading
```

### Parent
```
POST   /api/parent/link-student          ← Link parent to child by rollNumber
GET    /api/parent/dashboard             ← Child summary (attendance, marks)
GET    /api/parent/notifications         ← Alerts and messages
GET    /api/parent/pta                   ← Upcoming PTA meetings
```

### School-level (BEO/DEO/Commissioner/Minister)
```
GET    /api/schools                      ← List (filterable by district, block)
GET    /api/schools/:id                  ← Single school details
GET    /api/schools/analytics/district/:district ← District KPIs
GET    /api/attendance/school/:schoolId/today    ← Today's school attendance
```

---

## 🔐 Authentication Model (Current vs. Needed)

### Current
| Role | Identifier | Stored In |
|---|---|---|
| Student | email / emisId | `User` table |
| Teacher | email | `User` table |
| Headmaster | email | `User` table |
| Staff | emisId | `HeadmasterStaff` → resolved to `User` |
| Parent | phone | `HeadmasterParent` → resolved to `User` |
| BEO, DEO, Commissioner, Minister | email | `User` table |

### Missing (Needed for Production)
- **JWT / Session Tokens** — No auth middleware applied globally
- **Role-based route guards** — Any role can call any endpoint
- **Profile models** for BEO, DEO, Commissioner, Minister, Headmaster
- **Password hashing** — All passwords are currently plain-text
- **`blockId` / `districtId`** on User for officer roles
