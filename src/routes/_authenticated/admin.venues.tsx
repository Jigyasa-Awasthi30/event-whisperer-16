import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { AdminVenues } from "@/features/admin/AdminVenues";

export const Route = createFileRoute("/_authenticated/admin/venues")({
  component: () => (
    <DashboardLayout role="admin">
      <AdminVenues />
    </DashboardLayout>
  ),
});
