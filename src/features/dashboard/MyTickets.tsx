import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { formatDate, money } from "@/lib/format";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Ticket } from "lucide-react";

export function MyTickets() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-tickets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, event:events(*), booking_seats(*, seat:seats(row_label, seat_number))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const cancel = useMutation({
    mutationFn: async (bookingId: string) => {
      const { data: bs } = await supabase.from("booking_seats").select("seat_id").eq("booking_id", bookingId);
      const seatIds = (bs ?? []).map((x) => x.seat_id);
      if (seatIds.length) await supabase.from("seats").update({ status: "available" }).in("id", seatIds);
      await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    },
    onSuccess: () => { toast.success("Booking cancelled"); qc.invalidateQueries({ queryKey: ["my-tickets"] }); },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading tickets…</p>;
  if (!data?.length) return (
    <div className="glass rounded-2xl p-12 text-center">
      <Ticket className="mx-auto h-10 w-10 opacity-40" />
      <p className="mt-3 text-muted-foreground">No tickets yet.</p>
      <Button asChild className="mt-4 btn-gradient btn-gradient-hover"><Link to="/movies">Browse events</Link></Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Tickets</h1>
      {data.map((b) => (
        <div key={b.id} className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
          <div className="rounded-xl bg-white p-2">
            <QRCodeSVG value={JSON.stringify({ id: b.id, code: b.booking_code })} size={90} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{b.event?.title}</h3>
              <Badge variant={b.status === "confirmed" ? "default" : "secondary"} className={b.status === "confirmed" ? "btn-gradient border-0" : ""}>{b.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(b.event?.starts_at)} · #{b.booking_code}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Seats: {(b.booking_seats ?? []).map((bs) => `${bs.seat?.row_label}${bs.seat?.seat_number}`).join(", ") || "—"}
            </p>
          </div>
          <div className="text-right">
            <div className="font-bold gradient-text">{money(b.total_amount)}</div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" asChild className="bg-white/5 border-white/10">
                <Link to="/booking/$bookingId" params={{ bookingId: b.id }}>View</Link>
              </Button>
              {b.status === "confirmed" && (
                <Button size="sm" variant="destructive" onClick={() => cancel.mutate(b.id)}>Cancel</Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
