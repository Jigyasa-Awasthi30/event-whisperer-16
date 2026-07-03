import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { AdminOrganizers } from "@/features/admin/AdminOrganizers";

export const Route = createFileRoute("/_authenticated/admin/organizers")({
  component: () => (
    <DashboardLayout role="admin">
      <AdminOrganizers />
    </DashboardLayout>
  ),
});
