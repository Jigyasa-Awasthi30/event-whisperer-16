import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { ProfilePage } from "@/features/dashboard/ProfilePage";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: () => (
    <DashboardLayout role="customer">
      <ProfilePage />
    </DashboardLayout>
  ),
});
