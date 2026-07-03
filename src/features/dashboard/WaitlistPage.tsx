import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { ListChecks } from "lucide-react";

export function WaitlistPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["wl", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("waitlist").select("*, event:events(title, starts_at)").eq("user_id", user!.id);
      return data ?? [];
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from("waitlist").delete().eq("id", id); },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["wl"] }); },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Waitlist</h1>
      {(data ?? []).length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <ListChecks className="mx-auto h-10 w-10 opacity-40" />
          <p className="mt-3 text-muted-foreground">You're not on any waitlists.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data!.map((w) => (
            <div key={w.id} className="glass flex items-center justify-between rounded-2xl p-5">
              <div>
                <h3 className="font-semibold">{w.event?.title}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(w.event?.starts_at)}</p>
                <p className="mt-1 text-xs">Status: <span className="text-primary">{w.status}</span></p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => remove.mutate(w.id)}>Leave</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
