import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { OrganizerEvents } from "@/features/organizer/OrganizerEvents";

export const Route = createFileRoute("/_authenticated/organizer/events")({
  component: () => (
    <DashboardLayout role="organizer">
      <OrganizerEvents />
    </DashboardLayout>
  ),
});
