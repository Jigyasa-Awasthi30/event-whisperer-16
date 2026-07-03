import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { AdminUsers } from "@/features/admin/AdminUsers";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: () => (
    <DashboardLayout role="admin">
      <AdminUsers />
    </DashboardLayout>
  ),
});
