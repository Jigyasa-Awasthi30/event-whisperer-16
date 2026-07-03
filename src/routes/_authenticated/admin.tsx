import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { AdminDashboard } from "@/features/admin/AdminDashboard";

export const Route = createFileRoute("/_authenticated/admin")({
  component: () => (
    <DashboardLayout role="admin">
      <AdminDashboard />
    </DashboardLayout>
  ),
});
