import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminOrganizers() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-orgs"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").not("organizer_status", "is", null).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const approve = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("profiles").update({ organizer_status: "approved" }).eq("id", id);
      await supabase.from("user_roles").upsert({ user_id: id, role: "organizer" });
    },
    onSuccess: () => { toast.success("Approved"); qc.invalidateQueries({ queryKey: ["admin-orgs"] }); },
  });
  const reject = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("profiles").update({ organizer_status: "rejected" }).eq("id", id);
    },
    onSuccess: () => { toast.info("Rejected"); qc.invalidateQueries({ queryKey: ["admin-orgs"] }); },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Organizer applications</h1>
      {(data ?? []).length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No applications yet.</div>
      ) : (
        <div className="space-y-3">
          {data!.map((p) => (
            <div key={p.id} className="glass flex items-center justify-between rounded-2xl p-5">
              <div>
                <h3 className="font-semibold">{p.full_name ?? p.email}</h3>
                <p className="text-xs text-muted-foreground">{p.organizer_company ?? "—"} · Status: <span className="text-primary">{p.organizer_status}</span></p>
              </div>
              <div className="flex gap-2">
                {p.organizer_status !== "approved" && (
                  <Button size="sm" className="btn-gradient btn-gradient-hover" onClick={() => approve.mutate(p.id)}>Approve</Button>
                )}
                {p.organizer_status !== "rejected" && (
                  <Button size="sm" variant="destructive" onClick={() => reject.mutate(p.id)}>Reject</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
