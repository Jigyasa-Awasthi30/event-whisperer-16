import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShieldCheck, Calendar, DollarSign } from "lucide-react";
import { money } from "@/lib/format";

export function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dash"],
    queryFn: async () => {
      const [{ data: profiles }, { data: events }, { data: bookings }, { data: pending }] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("events").select("id"),
        supabase.from("bookings").select("total_amount, status"),
        supabase.from("profiles").select("id").eq("organizer_status", "pending"),
      ]);
      const revenue = (bookings ?? []).filter((b) => b.status === "confirmed").reduce((a, b) => a + Number(b.total_amount), 0);
      return {
        users: profiles?.length ?? 0,
        events: events?.length ?? 0,
        revenue,
        pending: pending?.length ?? 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Users" value={String(data?.users ?? 0)} />
        <Stat icon={Calendar} label="Events" value={String(data?.events ?? 0)} />
        <Stat icon={DollarSign} label="Revenue" value={money(data?.revenue ?? 0)} />
        <Stat icon={ShieldCheck} label="Pending organizers" value={String(data?.pending ?? 0)} />
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
