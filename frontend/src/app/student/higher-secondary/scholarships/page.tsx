"use client";

import PortalLayout from "@/components/PortalLayout";
import ScholarshipTrackingHub from "@/components/student/ScholarshipTrackingHub";

export default function HigherSecondaryScholarshipsPage() {
  return (
    <PortalLayout
      title="Scholarships Tracker & Hub"
      subtitle="Track your applications, check eligibility, upload documents and check notifications."
      avatarLetter="S"
      avatarColor="#8b5cf6"
      themeClass="theme-student"
      accentColor="#8b5cf6"
    >
      <ScholarshipTrackingHub
        classLevel={12}
        dashboardLink="/student/higher-secondary"
        accentColor="#8b5cf6"
        themeClass="theme-student"
      />
    </PortalLayout>
  );
}
