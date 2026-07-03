import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function AdminVenues() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-venues"],
    queryFn: async () => (await supabase.from("venues").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [capacity, setCapacity] = useState(200);

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("venues").insert({ name, city, capacity, created_by: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Venue added"); setName(""); setCity(""); setCapacity(200); qc.invalidateQueries({ queryKey: ["admin-venues"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from("venues").delete().eq("id", id); },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin-venues"] }); },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Venues</h1>
      <div className="glass rounded-2xl p-5">
        <h2 className="mb-3 font-semibold">Add venue</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input type="number" placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(+e.target.value)} />
          <Button className="btn-gradient btn-gradient-hover" onClick={() => create.mutate()} disabled={!name || !city}>Add</Button>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
            <tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">City</th><th className="p-3 text-left">Capacity</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {(data ?? []).map((v) => (
              <tr key={v.id} className="border-t border-white/5">
                <td className="p-3">{v.name}</td>
                <td className="p-3">{v.city}</td>
                <td className="p-3">{v.capacity}</td>
                <td className="p-3 text-right"><Button size="sm" variant="destructive" onClick={() => remove.mutate(v.id)}>Delete</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
