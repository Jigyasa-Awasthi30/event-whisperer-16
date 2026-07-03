import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Tag, Loader2, Ticket, Users } from "lucide-react";
import { formatDate, formatTime, money } from "@/lib/format";
import { SeatMap } from "@/features/events/SeatMap";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function EventDetail({ eventId }: { eventId: string }) {
  const { isAuthed, user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*, venue:venues(*)")
        .eq("id", eventId)
        .maybeSingle();
      return data;
    },
  });

  const { data: seats } = useQuery({
    queryKey: ["seats", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("seats")
        .select("*, category:seat_categories(name,color)")
        .eq("event_id", eventId)
        .order("row_label")
        .order("seat_number");
      return data ?? [];
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!holdExpiresAt) return;
    const t = setInterval(() => {
      const ms = holdExpiresAt.getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
      if (ms <= 0) {
        setSelected([]);
        setHoldExpiresAt(null);
        toast.info("Seat hold expired. Please re-select.");
      }
    }, 1000);
    return () => clearInterval(t);
  }, [holdExpiresAt]);

  const total = useMemo(() => {
    if (!seats) return 0;
    return seats.filter((s) => selected.includes(s.id)).reduce((a, s) => a + Number(s.price), 0);
  }, [seats, selected]);

  const holdMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const until = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("seats")
        .update({ status: "held", held_by: user.id, held_until: until })
        .in("id", selected)
        .eq("status", "available");
      if (error) throw error;
      return until;
    },
    onSuccess: (until) => {
      setHoldExpiresAt(new Date(until));
      qc.invalidateQueries({ queryKey: ["seats", eventId] });
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .insert({ user_id: user.id, event_id: eventId, total_amount: total, status: "pending" })
        .select()
        .single();
      if (bErr) throw bErr;
      const seatRows = (seats ?? []).filter((s) => selected.includes(s.id));
      const { error: bsErr } = await supabase
        .from("booking_seats")
        .insert(seatRows.map((s) => ({ booking_id: booking.id, seat_id: s.id, price: Number(s.price) })));
      if (bsErr) throw bsErr;
      const { error: pErr } = await supabase
        .from("payments")
        .insert({ booking_id: booking.id, amount: total, status: "success", method: "mock", transaction_id: "MOCK-" + Date.now() });
      if (pErr) throw pErr;
      await supabase.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);
      await supabase.from("seats").update({ status: "booked", held_by: null, held_until: null }).in("id", selected);
      return booking.id;
    },
    onSuccess: (bookingId) => {
      toast.success("Booking confirmed!");
      nav({ to: "/booking/$bookingId", params: { bookingId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-10"><Skeleton className="h-96 rounded-3xl" /></div>;
  if (!event) return <div className="mx-auto max-w-6xl px-4 py-16 text-center">Event not found.</div>;

  const soldOut = (seats ?? []).length > 0 && (seats ?? []).every((s) => s.status !== "available");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="glass overflow-hidden rounded-3xl">
        <div className="relative aspect-[21/9] overflow-hidden">
          {event.banner_url ? (
            <img src={event.banner_url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/30 to-accent/30">
              <Ticket className="h-16 w-16 opacity-40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="btn-gradient border-0">{event.event_type}</Badge>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{event.title}</h1>
          </div>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-4">
          <Info icon={Calendar} label="Date" value={formatDate(event.starts_at)} />
          <Info icon={Clock} label="Time" value={formatTime(event.starts_at)} />
          <Info icon={MapPin} label="Venue" value={event.venue?.name ?? event.city ?? "TBD"} />
          <Info icon={Tag} label="Genre" value={event.genre ?? "—"} />
        </div>
        {event.description && (
          <div className="border-t border-white/10 p-6 text-sm text-muted-foreground">
            {event.description}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="glass rounded-3xl p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select your seats</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Legend color="bg-success" label="Available" />
              <Legend color="bg-warn" label="Held" />
              <Legend color="bg-destructive" label="Booked" />
              <Legend color="bg-primary" label="Selected" />
            </div>
          </div>
          {(seats?.length ?? 0) === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No seats configured for this event yet.</div>
          ) : (
            <SeatMap
              seats={seats ?? []}
              selected={selected}
              onToggle={(id) => {
                if (holdExpiresAt) return;
                setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
              }}
            />
          )}
        </div>

        <div className="glass sticky top-24 h-fit rounded-3xl p-6">
          <h3 className="font-semibold">Booking summary</h3>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Seats</span>
            <span>{selected.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{money(total)}</span>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between">
            <span className="text-sm">Total</span>
            <span className="text-2xl font-bold gradient-text">{money(total)}</span>
          </div>
          {holdExpiresAt && (
            <div className="mt-4 rounded-xl bg-warn/10 p-3 text-center text-xs text-warn">
              Seats held for {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </div>
          )}
          {!isAuthed ? (
            <Button className="mt-6 w-full btn-gradient btn-gradient-hover" onClick={() => nav({ to: "/auth", search: { redirect: `/events/${eventId}` } })}>
              Sign in to book
            </Button>
          ) : soldOut ? (
            <WaitlistButton eventId={eventId} userId={user!.id} />
          ) : !holdExpiresAt ? (
            <Button
              className="mt-6 w-full btn-gradient btn-gradient-hover"
              disabled={selected.length === 0 || holdMutation.isPending}
              onClick={() => holdMutation.mutate()}
            >
              {holdMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hold seats (10 min)
            </Button>
          ) : (
            <Button
              className="mt-6 w-full btn-gradient btn-gradient-hover"
              disabled={bookMutation.isPending}
              onClick={() => bookMutation.mutate()}
            >
              {bookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay {money(total)} (mock)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5">
        <I className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1"><span className={`h-3 w-3 rounded ${color}`} />{label}</span>;
}

function WaitlistButton({ eventId, userId }: { eventId: string; userId: string }) {
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  async function join() {
    setLoading(true);
    const { error } = await supabase.from("waitlist").upsert({ user_id: userId, event_id: eventId, status: "waiting", seats_wanted: 1 });
    setLoading(false);
    if (error) return toast.error(error.message);
    setJoined(true);
    toast.success("Added to waitlist — we'll notify you if seats open up.");
  }
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
        <Users className="h-4 w-4" /> This event is sold out.
      </div>
      <Button className="w-full btn-gradient btn-gradient-hover" onClick={join} disabled={loading || joined}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {joined ? "Joined waitlist" : "Join waitlist"}
      </Button>
    </div>
  );
}
