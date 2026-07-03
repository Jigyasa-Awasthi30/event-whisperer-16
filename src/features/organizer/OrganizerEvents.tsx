import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export function OrganizerEvents() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["org-events", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("events").select("*").eq("organizer_id", user!.id).order("starts_at", { ascending: false })).data ?? [],
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("events").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["org-events"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Button asChild className="btn-gradient btn-gradient-hover"><Link to="/organizer/create">Create event</Link></Button>
      </div>
      {(data ?? []).length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No events yet.</div>
      ) : (
        <div className="space-y-3">
          {data!.map((e) => (
            <div key={e.id} className="glass flex items-center justify-between rounded-2xl p-5">
              <div>
                <div className="flex items-center gap-2"><h3 className="font-semibold">{e.title}</h3><Badge variant="secondary">{e.status}</Badge></div>
                <p className="text-xs text-muted-foreground">{formatDate(e.starts_at)} · {e.city}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild className="bg-white/5 border-white/10"><Link to="/events/$eventId" params={{ eventId: e.id }}>View</Link></Button>
                <Button size="sm" variant="destructive" onClick={() => remove.mutate(e.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
