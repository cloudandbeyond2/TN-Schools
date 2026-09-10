import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  
  // Extract student class from session if available
  const studentClassStr = String((session?.user as any)?.class || "");
  const studentClass = parseInt(studentClassStr.match(/\d+/)?.[0] || "0", 10);

  // Automatically route based on student class
  if (studentClass >= 9 && studentClass <= 10) {
    redirect("/student/high-school");
  } else if (studentClass >= 11 && studentClass <= 12) {
    redirect("/student/higher-secondary");
  } else {
    // Fallback to middle school for classes 6-8, or if class is missing
    redirect("/student/middle-school");
  }
}
