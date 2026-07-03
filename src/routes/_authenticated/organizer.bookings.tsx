import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { OrganizerBookings } from "@/features/organizer/OrganizerBookings";

export const Route = createFileRoute("/_authenticated/organizer/bookings")({
  component: () => (
    <DashboardLayout role="organizer">
      <OrganizerBookings />
    </DashboardLayout>
  ),
});
