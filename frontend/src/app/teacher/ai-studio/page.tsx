"use client";

import PortalLayout from "@/components/PortalLayout";
import StudioShell from "@/components/ai-studio/StudioShell";

export default function AIStudioPage() {
  return (
    <PortalLayout
      title="AI Content Studio"
      subtitle="20 teaching skills that adapt to how your subject is taught"
    >
      <StudioShell />
    </PortalLayout>
  );
}
