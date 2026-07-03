import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Ticket, DollarSign, TrendingUp } from "lucide-react";
import { money, formatDate } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

export function OrganizerDashboard() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["org-dash", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: events } = await supabase.from("events").select("id, title, starts_at, status").eq("organizer_id", user!.id);
      const eventIds = (events ?? []).map((e) => e.id);
      let bookings: { total_amount: number; created_at: string }[] = [];
      if (eventIds.length) {
        const { data: bs } = await supabase.from("bookings").select("total_amount, created_at").in("event_id", eventIds).eq("status", "confirmed");
        bookings = (bs ?? []) as any;
      }
      return { events: events ?? [], bookings };
    },
  });

  const revenue = (data?.bookings ?? []).reduce((a, b) => a + Number(b.total_amount), 0);
  const chart = build14Days(data?.bookings ?? []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Calendar} label="Events" value={String(data?.events.length ?? 0)} />
        <Stat icon={Ticket} label="Bookings" value={String(data?.bookings.length ?? 0)} />
        <Stat icon={DollarSign} label="Revenue" value={money(revenue)} />
        <Stat icon={TrendingUp} label="Avg. per booking" value={money((data?.bookings.length ? revenue / data.bookings.length : 0))} />
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Revenue — last 14 days</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--primary)" stopOpacity={0.6} />
                  <stop offset="1" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-3 font-semibold">Upcoming events</h2>
        {(data?.events ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet. Create your first event.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {data!.events.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(e.starts_at)}</div>
                </div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{e.status}</span>
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

function build14Days(bookings: { total_amount: number; created_at: string }[]) {
  const days: { day: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const revenue = bookings.filter((b) => b.created_at.startsWith(key)).reduce((a, b) => a + Number(b.total_amount), 0);
    days.push({ day: label, revenue });
  }
  return days;
}
