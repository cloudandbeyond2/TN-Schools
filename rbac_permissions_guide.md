# 🔐 TN-Schools — Role-Based Access Control (RBAC) Permissions Guide

This document defines the official authorization policy and permission reference for the Tamil Nadu Schools Ecosystem. It details the precise Create, View, Update, and Delete (CRUD) actions allowed for each role on the core user entities: **Headmaster**, **Teacher**, **Student**, and **Parent**.

---

## 🏛️ System Roles Overview
The system models a strict hierarchical command chain corresponding to the real-world Tamil Nadu Education Department:

1. **Minister**: State-level authority with top-level visibility.
2. **Commissioner**: State-level operational administrator overseeing all districts.
3. **DEO (District Education Officer)**: District-level manager overseeing all blocks within a specific district.
4. **BEO (Block Education Officer)**: Block-level manager overseeing all schools within a specific block.
5. **Headmaster**: School-level administrator managing one assigned school.
6. **Teacher**: Academic officer managing assigned classrooms and students.
7. **Parent**: Guardian viewing progress and communicating with teachers for their own children.
8. **Student**: Learner viewing academic/attendance records and updating their own portfolio.

---

## 📊 Complete Permissions Matrix

| Entity | Action | Minister / Commissioner | DEO (District) | BEO (Block) | Headmaster | Teacher | Parent | Student |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Headmaster** | **Create** | ✅ State-wide | ✅ District-only | ✅ Block-only | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| | **View** | ✅ State-wide | ✅ District-only | ✅ Block-only | ✅ Self only | ❌ Denied | ❌ Denied | ❌ Denied |
| | **Update** | ✅ State-wide | ✅ District-only | ✅ Block-only | ✅ Self only | ❌ Denied | ❌ Denied | ❌ Denied |
| | **Delete** | ✅ State-wide | ✅ District-only | ✅ Block-only | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied |
| **Teacher** | **Create** | ✅ State-wide | ✅ District-only | ✅ Block-only | ✅ School-only | ❌ Denied | ❌ Denied | ❌ Denied |
| | **View** | ✅ State-wide | ✅ District-only | ✅ Block-only | ✅ School-only | ✅ All in school | ❌ Denied | ❌ Denied |
| | **Update** | ✅ State-wide | ✅ District-only | ✅ Block-only | ✅ School-only | ✅ Self only | ❌ Denied | ❌ Denied |
| | **Delete** | ✅ State-wide | ✅ District-only | ✅ Block-only | ✅ School-only | ❌ Denied | ❌ Denied | ❌ Denied |
| **Student** | **Create** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ School-only | ❌ Denied | ❌ Denied | ❌ Denied |
| | **View** | ✅ State-wide | ✅ District-only | ✅ Block-only | ✅ School-only | ✅ School-only | 👁️ Child only | 👁️ Self only |
| | **Update** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ School-only | ✅ Academics only | ❌ Denied | ✏️ Portfolio only |
| | **Delete** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ School-only | ✅ School-only | ❌ Denied | ❌ Denied |
| **Parent** | **Create** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ School-only | ❌ Denied | ❌ Denied | ❌ Denied |
| | **View** | ✅ State-wide | ✅ District-only | ✅ Block-only | ✅ School-only | ✅ School-only | 👁️ Self only | ❌ Denied |
| | **Update** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ School-only | ❌ Denied | ✏️ Self only | ❌ Denied |
| | **Delete** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ School-only | ❌ Denied | ❌ Denied | ❌ Denied |

---

## 📜 Detailed Role Actions & Business Rules

### 1. Minister (State Level)
*Top state-level authority responsible for overall education policy and state-wide KPI overview.*

*   **Commissioner Entity:**
    *   **Create:** Can create and register new **Commissioner** accounts (`POST /api/users` with `role: "COMMISSIONER"`).
    *   **View:** Can view and monitor all Commissioners, their active departments, and system activity logs.
    *   **Update:** Can edit Commissioner profiles and change active departments.
    *   **Delete:** Can deactivate or remove Commissioner accounts.
*   **Other Entities:**
    *   Has read-only overview access to aggregated district-level and block-level KPIs (Total Schools, Total Students, Teacher Roster analytics) but cannot directly edit or create school-level or teacher-level records.

---

### 2. Commissioner (State Level)
*Operational head of school education. Responsible for managing district administrative officers.*

*   **DEO Entity:**
    *   **Create:** Can create and register new **DEO** accounts (`POST /api/users` with `role: "DEO"`).
    *   **View:** Can view and track all active DEOs and their assigned districts.
    *   **Update:** Can update DEO profiles and reassign them to different districts.
    *   **Delete:** Can deactivate or remove DEO accounts.
*   **Other Entities:**
    *   Has read-only view access to all districts, blocks, and schools, and can view state-wide teacher analytical reports.

---

### 3. DEO (District Education Officer)
*District-level manager. Permissions are strictly scoped to their assigned District (e.g. Coimbatore).*

*   **BEO Entity:**
    *   **Create:** Can create and register new **BEO** accounts (`POST /api/users` with `role: "BEO"`).
    *   **View:** Can view and monitor all BEOs and block offices within their assigned district.
    *   **Update:** Can edit BEO profiles and reassign them to different blocks in the district.
    *   **Delete:** Can deactivate or remove BEO accounts.
*   **Other Entities:**
    *   Has read-only access to view the district teacher rosters and manage school performance dashboards within their district.

---

### 4. BEO (Block Education Officer)
*Block-level manager. Permissions are strictly scoped to their assigned Block (e.g. Coimbatore South).*

*   **School Entity:**
    *   **Create:** Can create and register new **School** records (`POST /api/schools` and `POST /api/schools/bulk` for Excel import).
    *   **View:** Can view all schools in their block and track infrastructure/financial details.
    *   **Update:** Can update school attributes (dise code, block, district, school type).
    *   **Delete:** Can delete school records from the block directory (`DELETE /api/schools/:id`).
*   **Headmaster Entity:**
    *   **Create:** Can create and register new **Headmaster** accounts for schools in their block (`POST /api/users` with `role: "HEADMASTER"`).
    *   **View:** Can view all Headmasters and their profiles in their block.
    *   **Update:** Can edit Headmaster details and reassign them to different schools.
    *   **Delete:** Can delete Headmaster accounts from the directory.
*   **Teacher Entity:**
    *   **Update:** Can initiate **Teacher Deployments and Transfers** (directing a teacher transfer from a source school to a target school).
    *   **View:** Can view block-level teacher vacancies and pupil-teacher ratios.
*   **Student & Parent Entities:**
    *   Has read-only view access to student watchlist counts, dropouts, and school-level metrics. Cannot create or edit students or parents.

---

### 4. Headmaster (School Level)
*The primary operational administrator for a single school. Scoped strictly by `schoolId`.*

*   **Headmaster Entity:**
    *   **Create / Delete:** Cannot create or delete Headmaster accounts.
    *   **View / Update:** Can view and update their own `HeadmasterProfile` (e.g. `employeeId`, `address`, `dob`, `gender`).
*   **Teacher Entity:**
    *   **Create:** Can create and register new teachers (using `HeadmasterStaff` model).
    *   **View:** Can view all teachers assigned to their school.
    *   **Update:** Can edit staff details (assigned subjects, performance ratings).
    *   **Delete:** Can delete teacher records from the school roster.
*   **Student Entity:**
    *   **Create:** Can create new students (creates core `User` + `Student` profile + `WatchlistStudent` entry in a transaction) and perform bulk imports.
    *   **View:** Can view all student records, academic logs, and risk watchlists for their school.
    *   **Update:** Can update student details (class, section, roll number, parent details).
    *   **Delete:** Can delete students (which cascades to clean up links and badges).
*   **Parent Entity:**
    *   **Create:** Can register Parents (using `HeadmasterParent` model) and link them to students.
    *   **View:** Can view all parents registered in their school.
    *   **Update:** Can update parent contact information.
    *   **Delete:** Can delete parent profiles from the school registry.

---

### 5. Teacher (Classroom Level)
*Academic manager of assigned classrooms and subjects.*

*   **Headmaster & Parent Entities:**
    *   **CRUD:** Cannot create, update, or delete Headmasters or Parents. Can only view parent details if linked to a student in their classroom.
*   **Teacher Entity:**
    *   **Create / Delete:** Cannot create or delete Teacher profiles.
    *   **View:** Can view other Teachers in the same school (for scheduling/collaboration).
    *   **Update:** Can update their own Teacher profile details.
*   **Student Entity:**
    *   **Create:** Cannot create students.
    *   **View:** Can view all student profiles in the school (to allow cross-class evaluation).
    *   **Update:** Can update student academic information (enter marks, record daily attendance status, log homework submissions). Cannot edit core profile details (Aadhaar, EMIS ID, roll number).
    *   **Delete:** Can delete students from watchlist status or classroom lists (does not delete the core Student user, which is a Headmaster privilege).

---

### 6. Parent (Family Level)
*Read-only guardian access linked to specific student records.*

*   **Headmaster & Teacher Entities:**
    *   **CRUD:** Cannot create, view, update, or delete any Headmaster or Teacher records.
*   **Student Entity:**
    *   **Create / Update / Delete:** Cannot create, update, or delete any student profiles.
    *   **View:** Can view academic scores, attendance percentages, homework assignments, and notifications *only* for their linked children (via `ParentStudentLink`).
*   **Parent Entity:**
    *   **Create / Delete:** Cannot create or delete Parent profiles.
    *   **View / Update:** Can view and update their own Parent profile contact details (phone, email, address).

---

### 7. Student (Learner Level)
*Self-service portal for academic progress.*

*   **Headmaster, Teacher, & Parent Entities:**
    *   **CRUD:** Cannot create, view, update, or delete any records.
*   **Student Entity:**
    *   **Create / Delete:** Cannot create or delete student profiles.
    *   **View:** Can view their own profile, marks history, and attendance records. Cannot view other students' information.
    *   **Update:** Can update their own **Portfolio** (achievements, skills, hobbies) and **Sports Profile** (fitness logs, self-reports). Cannot update academic grades, attendance entries, or core profile fields.
