import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/features/landing/LandingPage";
import { Search, SlidersHorizontal } from "lucide-react";

export function EventsBrowse({ type, title }: { type: "movie" | "concert"; title: string }) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("all");
  const [sort, setSort] = useState("soon");

  const { data, isLoading } = useQuery({
    queryKey: ["events", type],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id,title,banner_url,genre,city,starts_at,base_price,event_type")
        .eq("status", "published")
        .eq("event_type", type)
        .order("starts_at", { ascending: true });
      return data ?? [];
    },
  });

  const cities = useMemo(() => Array.from(new Set((data ?? []).map((d) => d.city).filter(Boolean))) as string[], [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(s) || (e.genre ?? "").toLowerCase().includes(s));
    }
    if (city !== "all") list = list.filter((e) => e.city === city);
    if (sort === "price") list = [...list].sort((a, b) => Number(a.base_price) - Number(b.base_price));
    else if (sort === "soon") list = [...list].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
    return list;
  }, [data, q, city, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text sm:text-4xl">{title}</h1>
          <p className="text-sm text-muted-foreground">Browse all upcoming {title.toLowerCase()}.</p>
        </div>
      </div>

      <div className="glass mb-8 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or genre" className="border-0 bg-transparent focus-visible:ring-0" />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-40 bg-white/5"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40 bg-white/5"><SlidersHorizontal className="mr-1 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="soon">Soonest</SelectItem>
            <SelectItem value="price">Price: low to high</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[16/12] rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-muted-foreground">No events yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => <EventCard key={e.id} e={e} />)}
        </div>
      )}
    </div>
  );
}
