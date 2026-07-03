import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export function EventEditor() {
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "", description: "", event_type: "movie" as "movie" | "concert",
    banner_url: "", starts_at: "", duration_minutes: 120, language: "English",
    genre: "", city: "", venue_id: "", base_price: 20,
    rows: 8, cols: 12, category: "",
  });

  const { data: venues } = useQuery({
    queryKey: ["venues-list"],
    queryFn: async () => (await supabase.from("venues").select("id,name")).data ?? [],
  });
  const { data: cats } = useQuery({
    queryKey: ["cats"],
    queryFn: async () => (await supabase.from("seat_categories").select("*").order("sort_order")).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: event, error } = await supabase.from("events").insert({
        organizer_id: user!.id,
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        banner_url: form.banner_url || null,
        starts_at: new Date(form.starts_at).toISOString(),
        duration_minutes: form.duration_minutes,
        language: form.language,
        genre: form.genre,
        city: form.city,
        venue_id: form.venue_id || null,
        base_price: form.base_price,
        status: "published",
      }).select().single();
      if (error) throw error;
      // seed seats
      const catId = form.category || cats?.[0]?.id;
      const rows: string[] = [];
      for (let i = 0; i < form.rows; i++) rows.push(String.fromCharCode(65 + i));
      const seats = rows.flatMap((r) => Array.from({ length: form.cols }, (_, i) => ({
        event_id: event.id,
        row_label: r,
        seat_number: i + 1,
        price: form.base_price,
        category_id: catId ?? null,
        status: "available",
      })));
      if (seats.length) {
        const { error: sErr } = await supabase.from("seats").insert(seats);
        if (sErr) throw sErr;
      }
      return event.id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries();
      toast.success("Event published");
      nav({ to: "/events/$eventId", params: { eventId: id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="glass max-w-3xl rounded-2xl p-6">
      <h1 className="text-2xl font-bold">Create Event</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div>
          <Label>Type</Label>
          <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v as "movie" | "concert" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="movie">Movie</SelectItem><SelectItem value="concert">Concert</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Genre</Label><Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></div>
        <div><Label>Banner image URL</Label><Input placeholder="https://…" value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} /></div>
        <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
        <div><Label>Starts at</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
        <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} /></div>
        <div><Label>Language</Label><Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></div>
        <div>
          <Label>Venue</Label>
          <Select value={form.venue_id} onValueChange={(v) => setForm({ ...form, venue_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
            <SelectContent>{(venues ?? []).map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Base price ($)</Label><Input type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: +e.target.value })} /></div>
        <div><Label>Seat rows</Label><Input type="number" min={1} max={26} value={form.rows} onChange={(e) => setForm({ ...form, rows: +e.target.value })} /></div>
        <div><Label>Seats per row</Label><Input type="number" min={1} max={30} value={form.cols} onChange={(e) => setForm({ ...form, cols: +e.target.value })} /></div>
        <div>
          <Label>Seat category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue placeholder="Default" /></SelectTrigger>
            <SelectContent>{(cats ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button className="mt-6 btn-gradient btn-gradient-hover" onClick={() => create.mutate()} disabled={create.isPending}>
        {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publish event
      </Button>
    </div>
  );
}
