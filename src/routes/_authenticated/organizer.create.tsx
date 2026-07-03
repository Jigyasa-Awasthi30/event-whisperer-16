import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { EventEditor } from "@/features/organizer/EventEditor";

export const Route = createFileRoute("/_authenticated/organizer/create")({
  component: () => (
    <DashboardLayout role="organizer">
      <EventEditor />
    </DashboardLayout>
  ),
});
