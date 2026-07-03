import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { OrganizerDashboard } from "@/features/organizer/OrganizerDashboard";

export const Route = createFileRoute("/_authenticated/organizer")({
  component: () => (
    <DashboardLayout role="organizer">
      <OrganizerDashboard />
    </DashboardLayout>
  ),
});
