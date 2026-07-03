import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Download, Ticket } from "lucide-react";
import { formatDate, formatTime, money } from "@/lib/format";

export function BookingSuccess({ bookingId }: { bookingId: string }) {
  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, event:events(*, venue:venues(*)), booking_seats(*, seat:seats(row_label, seat_number, category:seat_categories(name)))")
        .eq("id", bookingId)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-10"><Skeleton className="h-96 rounded-3xl" /></div>;
  if (!booking) return <div className="mx-auto max-w-3xl px-4 py-16 text-center">Booking not found.</div>;

  const seatList = (booking.booking_seats ?? []).map((bs) => `${bs.seat?.row_label}${bs.seat?.seat_number}`).join(", ");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/20">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">Booking Confirmed!</h1>
        <p className="text-sm text-muted-foreground">Your ticket is ready. A confirmation email has been sent.</p>
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-6">
            <div className="flex items-start gap-3">
              <Ticket className="mt-1 h-5 w-5 text-primary" />
              <div className="min-w-0">
                <h2 className="text-xl font-bold">{booking.event?.title}</h2>
                <p className="text-xs text-muted-foreground">Booking #{booking.booking_code}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              <Row label="Date" value={formatDate(booking.event?.starts_at)} />
              <Row label="Time" value={formatTime(booking.event?.starts_at)} />
              <Row label="Venue" value={booking.event?.venue?.name ?? booking.event?.city ?? "TBD"} />
              <Row label="Seats" value={seatList || "—"} />
              <Row label="Category" value={booking.booking_seats?.[0]?.seat?.category?.name ?? "Standard"} />
              <Row label="Status" value={<span className="text-success">Confirmed</span>} />
              <Row label="Total paid" value={<span className="font-bold gradient-text">{money(booking.total_amount)}</span>} />
            </div>
          </div>
          <div className="border-t border-white/10 sm:border-l sm:border-t-0">
            <div className="flex h-full flex-col items-center justify-center p-6">
              <div className="rounded-2xl bg-white p-4">
                <QRCodeSVG value={JSON.stringify({ id: booking.id, code: booking.booking_code })} size={160} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Show this at the entrance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="bg-white/5 border-white/10" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" /> Save / Print
        </Button>
        <Button asChild className="btn-gradient btn-gradient-hover">
          <Link to="/dashboard/tickets">My Tickets</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
