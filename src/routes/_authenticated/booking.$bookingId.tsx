import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { BookingSuccess } from "@/features/booking/BookingSuccess";

export const Route = createFileRoute("/_authenticated/booking/$bookingId")({
  component: () => (
    <Layout>
      <BookingSuccess bookingId={Route.useParams().bookingId} />
    </Layout>
  ),
});
