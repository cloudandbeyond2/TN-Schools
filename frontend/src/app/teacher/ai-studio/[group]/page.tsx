"use client";

// Group entry points — the six sidebar items under "AI Content Studio" land
// here and open the same studio with the palette pre-filtered.
// "library" is a sibling route, not a group, so it never reaches this page.

import { notFound, useParams } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import StudioShell from "@/components/ai-studio/StudioShell";
import { GROUP_BY_SLUG } from "@/lib/aiSkills";

export default function AIStudioGroupPage() {
  const params = useParams<{ group: string }>();
  const group = GROUP_BY_SLUG[String(params?.group || "")];

  if (!group) return notFound();

  return (
    <PortalLayout title={group.label} subtitle={group.blurb}>
      <StudioShell initialGroup={group.key} />
    </PortalLayout>
  );
}
