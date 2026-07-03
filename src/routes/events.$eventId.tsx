import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { EventDetail } from "@/features/events/EventDetail";

export const Route = createFileRoute("/events/$eventId")({
  component: () => (
    <Layout>
      <EventDetail eventId={Route.useParams().eventId} />
    </Layout>
  ),
});
