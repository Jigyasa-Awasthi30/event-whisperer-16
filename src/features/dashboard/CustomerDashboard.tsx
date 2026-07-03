import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Ticket, Calendar, ListChecks, Wallet } from "lucide-react";
import { money, formatDate } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export function CustomerDashboard() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["customer-dash", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from("bookings").select("*, event:events(title, starts_at)")
        .eq("user_id", user!.id).order("created_at", { ascending: false });
      const { data: wl } = await supabase.from("waitlist").select("*").eq("user_id", user!.id);
      return { bookings: bookings ?? [], waitlist: wl ?? [] };
    },
  });

  const total = (data?.bookings ?? []).reduce((a, b) => a + Number(b.total_amount), 0);
  const upcoming = (data?.bookings ?? []).filter((b) => b.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome back 👋</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Ticket} label="Total Bookings" value={String(data?.bookings.length ?? 0)} />
        <Stat icon={Calendar} label="Upcoming" value={String(upcoming)} />
        <Stat icon={ListChecks} label="Waitlist" value={String(data?.waitlist.length ?? 0)} />
        <Stat icon={Wallet} label="Total Spent" value={money(total)} />
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent bookings</h2>
          <Link to="/dashboard/tickets" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {(data?.bookings ?? []).slice(0, 5).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet. <Link to="/movies" className="text-primary">Browse events</Link>.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {data!.bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{b.event?.title}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(b.event?.starts_at)} · #{b.booking_code}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{money(b.total_amount)}</div>
                  <div className="text-xs text-muted-foreground">{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: I, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl btn-gradient"><I className="h-4 w-4" /></div>
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
