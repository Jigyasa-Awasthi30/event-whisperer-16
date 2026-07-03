import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { EventsBrowse } from "@/features/events/EventsBrowse";

export const Route = createFileRoute("/movies")({
  head: () => ({ meta: [{ title: "Movies — Ticket Booking" }] }),
  component: () => (
    <Layout>
      <EventsBrowse type="movie" title="Movies" />
    </Layout>
  ),
});
