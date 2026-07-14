"use client";

import PortalLayout from "@/components/PortalLayout";
import ScholarshipTrackingHub from "@/components/student/ScholarshipTrackingHub";

export default function HighSchoolScholarshipsPage() {
  return (
    <PortalLayout
      title="Scholarships Tracker & Hub"
      subtitle="Track your applications, check eligibility, upload documents and check notifications."
      avatarLetter="S"
      avatarColor="#ef4444"
      themeClass="theme-student"
      accentColor="#ef4444"
    >
      <ScholarshipTrackingHub
        classLevel={10}
        dashboardLink="/student/high-school"
        accentColor="#ef4444"
        themeClass="theme-student"
      />
    </PortalLayout>
  );
}
