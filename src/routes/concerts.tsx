import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { EventsBrowse } from "@/features/events/EventsBrowse";

export const Route = createFileRoute("/concerts")({
  head: () => ({ meta: [{ title: "Concerts — Ticket Booking" }] }),
  component: () => (
    <Layout>
      <EventsBrowse type="concert" title="Concerts" />
    </Layout>
  ),
});
