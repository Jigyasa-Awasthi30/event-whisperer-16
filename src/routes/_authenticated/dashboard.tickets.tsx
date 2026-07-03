import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/features/dashboard/DashboardLayout";
import { MyTickets } from "@/features/dashboard/MyTickets";

export const Route = createFileRoute("/_authenticated/dashboard/tickets")({
  component: () => (
    <DashboardLayout role="customer">
      <MyTickets />
    </DashboardLayout>
  ),
});
