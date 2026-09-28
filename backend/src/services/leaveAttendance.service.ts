import { prisma } from '../config/prisma';
import { resolveUserId } from '../config/userResolver';
import { getStudentParents } from '../utils/sms';

/**
 * Extracts an array of ISO date strings (YYYY-MM-DD) from a duration string or dates.
 * Examples:
 * - "2026-09-23 (1 Day)" -> ["2026-09-23"]
 * - "2026-09-23 to 2026-09-25" -> ["2026-09-23", "2026-09-24", "2026-09-25"]
 * - "2026-09-23" -> ["2026-09-23"]
 * - "Half Day - Morning" (fallback to request createdAt date)
 */
export function extractDatesFromDuration(duration: string, fallbackDate: Date = new Date()): string[] {
  if (!duration || typeof duration !== 'string') {
    return [fallbackDate.toISOString().slice(0, 10)];
  }

  const clean = duration.trim();

  // Pattern 1: Range "YYYY-MM-DD to YYYY-MM-DD" or "YYYY-MM-DD - YYYY-MM-DD"
  const rangeMatch = clean.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|-)\s*(\d{4}-\d{2}-\d{2})/i);
  if (rangeMatch) {
    const start = new Date(rangeMatch[1]);
    const end = new Date(rangeMatch[2]);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      const dates: string[] = [];
      const curr = new Date(start);
      // Cap at 30 days maximum to prevent accidental infinite loops
      let count = 0;
      while (curr <= end && count < 30) {
        dates.push(curr.toISOString().slice(0, 10));
        curr.setDate(curr.getDate() + 1);
        count++;
      }
      if (dates.length > 0) return dates;
    }
  }

  // Pattern 2: Single date "YYYY-MM-DD" (e.g. "2026-09-23 (1 Day)")
  const singleMatch = clean.match(/(\d{4}-\d{2}-\d{2})/);
  if (singleMatch) {
    return [singleMatch[1]];
  }

  // Pattern 3: Fallback to the provided date
  return [fallbackDate.toISOString().slice(0, 10)];
}

/**
 * Synchronizes student leave approval/rejection with the daily Attendance table
 * and dispatches notifications to the student and parent.
 */
export async function syncLeaveApprovalToAttendance(
  leaveId: string,
  newStatus: 'Approved' | 'Rejected' | 'Pending',
  approverId?: string,
  approverRole: string = 'Teacher'
) {
  // 1. Fetch current leave request
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId }
  });

  if (!leave) {
    throw new Error('Leave request not found');
  }

  // 2. Update leave request status
  const updatedLeave = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: newStatus,
      approvedById: approverId || leave.approvedById,
    }
  });

  // 3. If this is a Student leave request, synchronize with Attendance
  if (leave.studentId) {
    // Resolve student record
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: leave.studentId },
          { rollNumber: { equals: leave.studentId, mode: 'insensitive' } },
          { admissionNumber: { equals: leave.studentId, mode: 'insensitive' } },
          { emisNumber: { equals: leave.studentId, mode: 'insensitive' } }
        ]
      },
      include: {
        user: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } }
      }
    });

    if (student) {
      const dates = extractDatesFromDuration(leave.duration, leave.createdAt);
      const schoolId = student.schoolId || leave.schoolId;

      if (newStatus === 'Approved' && schoolId) {
        // Upsert Attendance records with status = 'LEAVE' for all dates in range
        for (const dateStr of dates) {
          const dateStart = new Date(`${dateStr}T00:00:00.000Z`);
          const dateEnd = new Date(`${dateStr}T23:59:59.999Z`);

          const existingAttendance = await prisma.attendance.findFirst({
            where: {
              studentId: student.id,
              date: { gte: dateStart, lte: dateEnd },
              period: 0
            }
          });

          if (existingAttendance) {
            await prisma.attendance.update({
              where: { id: existingAttendance.id },
              data: {
                status: 'LEAVE',
                method: 'Approved Leave Request'
              }
            });
          } else {
            await prisma.attendance.create({
              data: {
                studentId: student.id,
                schoolId: schoolId,
                date: dateStart,
                status: 'LEAVE',
                method: 'Approved Leave Request',
                period: 0,
                subject: 'General'
              }
            });
          }
        }
      } else if (newStatus === 'Rejected' || newStatus === 'Pending') {
        // If rejected, clean up automated leave records that were created by this request
        for (const dateStr of dates) {
          const dateStart = new Date(`${dateStr}T00:00:00.000Z`);
          const dateEnd = new Date(`${dateStr}T23:59:59.999Z`);

          await prisma.attendance.deleteMany({
            where: {
              studentId: student.id,
              date: { gte: dateStart, lte: dateEnd },
              method: 'Approved Leave Request'
            }
          });
        }
      }

      // 4. Send notifications to Student and Parents
      try {
        const studentName = student.user?.name || leave.studentName || 'Student';
        const notifTitle = `Leave Request ${newStatus}`;
        const notifMsg = `Leave application (${leave.type}) for ${leave.duration} has been ${newStatus.toLowerCase()} by ${approverRole}.`;

        // Student Notification
        if (student.userId) {
          await prisma.notification.create({
            data: {
              userId: student.userId,
              studentId: student.id,
              type: 'LEAVE_STATUS',
              title: notifTitle,
              message: notifMsg
            }
          });
        }

        // Parents Notification
        const parents = await getStudentParents(student.id);
        for (const parent of parents) {
          if (parent.userId) {
            await prisma.notification.create({
              data: {
                userId: parent.userId,
                studentId: student.id,
                type: 'LEAVE_STATUS',
                title: `Child Leave ${newStatus}: ${studentName}`,
                message: notifMsg
              }
            });
          }
        }
      } catch (notifErr) {
        console.error('[Leave Approval Notification Error]', notifErr);
      }
    }
  }

  // 5. If this is a Staff leave request, send notification to staff member
  if (leave.staffId) {
    try {
      const resolvedId = await resolveUserId(leave.staffId);
      if (resolvedId) {
        await prisma.notification.create({
          data: {
            userId: resolvedId,
            type: 'STAFF_LEAVE_STATUS',
            title: `Staff Leave ${newStatus}`,
            message: `Your staff leave application for ${leave.duration} has been ${newStatus.toLowerCase()} by ${approverRole}.`
          }
        });
      }
    } catch (staffNotifErr) {
      console.error('[Staff Leave Notification Error]', staffNotifErr);
    }
  }

  return updatedLeave;
}
