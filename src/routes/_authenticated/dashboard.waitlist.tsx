import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { WaitlistPage } from "@/features/dashboard/WaitlistPage";

export const Route = createFileRoute("/_authenticated/dashboard/waitlist")({
  component: () => (
    <DashboardLayout role="customer">
      <WaitlistPage />
    </DashboardLayout>
  ),
});
