import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { CustomerDashboard } from "@/features/dashboard/CustomerDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: () => (
    <DashboardLayout role="customer">
      <CustomerDashboard />
    </DashboardLayout>
  ),
});
