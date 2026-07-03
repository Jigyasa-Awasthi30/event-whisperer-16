import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, money } from "@/lib/format";

export function OrganizerBookings() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["org-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: events } = await supabase.from("events").select("id, title").eq("organizer_id", user!.id);
      const ids = (events ?? []).map((e) => e.id);
      if (!ids.length) return [];
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, event:events(title, starts_at)")
        .in("event_id", ids)
        .order("created_at", { ascending: false });
      return bookings ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bookings</h1>
      {(data ?? []).length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No bookings yet.</div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
              <tr><th className="p-3 text-left">Booking</th><th className="p-3 text-left">Event</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Amount</th></tr>
            </thead>
            <tbody>
              {data!.map((b) => (
                <tr key={b.id} className="border-t border-white/5">
                  <td className="p-3 font-mono text-xs">{b.booking_code}</td>
                  <td className="p-3">{b.event?.title}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(b.event?.starts_at)}</td>
                  <td className="p-3">{b.status}</td>
                  <td className="p-3 text-right font-semibold">{money(b.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
