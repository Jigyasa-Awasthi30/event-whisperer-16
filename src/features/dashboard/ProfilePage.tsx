import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });
  const [full_name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  useEffect(() => {
    if (data) { setName(data.full_name ?? ""); setPhone(data.phone ?? ""); setCity(data.city ?? ""); }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({ full_name, phone, city }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="glass max-w-xl rounded-2xl p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-xs text-muted-foreground">{user?.email}</p>
      <div className="mt-6 space-y-4">
        <div><Label>Full name</Label><Input value={full_name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
        <Button className="btn-gradient btn-gradient-hover" onClick={() => save.mutate()} disabled={save.isPending}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
