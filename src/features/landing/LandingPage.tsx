import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Play,
  Music2,
  MapPin,
  Zap,
  ShieldCheck,
  Ticket,
  Star,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, money } from "@/lib/format";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturedEvents />
      <Venues />
      <WhyChoose />
      <Stats />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}

function Hero() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-[300px] w-[400px] rounded-full bg-accent/20 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Real-time seat availability
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Book <span className="gradient-text">Movies & Concerts</span> in Seconds.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            The fastest way to discover events, pick the perfect seats, and get an
            instant QR ticket delivered straight to your inbox.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              nav({ to: "/movies", search: { q } as never });
            }}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl glass p-2"
          >
            <Search className="ml-2 h-5 w-5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies, concerts, venues, cities..."
              className="border-0 bg-transparent focus-visible:ring-0"
            />
            <Button type="submit" className="btn-gradient btn-gradient-hover rounded-xl">
              Search
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {["Coldplay", "Oppenheimer", "Broadway", "Jazz Night", "Comedy"].map((t) => (
              <button
                key={t}
                onClick={() => nav({ to: "/movies", search: { q: t } as never })}
                className="rounded-full border border-white/10 px-3 py-1 hover:bg-white/5"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedEvents() {
  const { data: movies } = useQuery({
    queryKey: ["landing-movies"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id,title,banner_url,genre,city,starts_at,base_price,event_type")
        .eq("status", "published")
        .eq("event_type", "movie")
        .order("starts_at", { ascending: true })
        .limit(6);
      return data ?? [];
    },
  });
  const { data: concerts } = useQuery({
    queryKey: ["landing-concerts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id,title,banner_url,genre,city,starts_at,base_price,event_type")
        .eq("status", "published")
        .eq("event_type", "concert")
        .order("starts_at", { ascending: true })
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
      <EventStrip title="Featured Movies" icon={<Play className="h-5 w-5" />} events={movies ?? []} emptyLabel="No movies yet — organizers will list soon." href="/movies" />
      <EventStrip title="Upcoming Concerts" icon={<Music2 className="h-5 w-5" />} events={concerts ?? []} emptyLabel="No concerts yet — check back soon." href="/concerts" />
    </div>
  );
}

type EventLite = {
  id: string; title: string; banner_url: string | null; genre: string | null;
  city: string | null; starts_at: string; base_price: number | string;
};

function EventStrip({ title, icon, events, emptyLabel, href }: {
  title: string; icon: React.ReactNode; events: EventLite[]; emptyLabel: string; href: string;
}) {
  return (
    <section className="mt-16">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl btn-gradient">{icon}</div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        </div>
        <Link to={href} className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
      </div>
      {events.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">{emptyLabel}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => <EventCard key={e.id} e={e} />)}
        </div>
      )}
    </section>
  );
}

export function EventCard({ e }: { e: EventLite }) {
  return (
    <Link to="/events/$eventId" params={{ eventId: e.id }} className="group">
      <Card className="glass overflow-hidden border-white/10 p-0 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
        <div className="relative aspect-[16/10] overflow-hidden">
          {e.banner_url ? (
            <img src={e.banner_url} alt={e.title} className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/30 to-accent/30">
              <Ticket className="h-12 w-12 opacity-40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-3 rounded-full glass px-2 py-1 text-xs">
            {e.genre ?? "Featured"}
          </div>
        </div>
        <div className="p-4">
          <h3 className="truncate font-semibold">{e.title}</h3>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(e.starts_at)}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.city ?? "TBD"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">From</span>
            <span className="font-bold gradient-text">{money(e.base_price)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function Venues() {
  const venues = [
    { name: "Arena Stadium", city: "New York", cap: 20000 },
    { name: "Dolby Theatre", city: "Los Angeles", cap: 3400 },
    { name: "The O2", city: "London", cap: 20000 },
    { name: "Madison Square", city: "New York", cap: 18000 },
  ];
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
      <h2 className="text-2xl font-bold sm:text-3xl">Popular Venues</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {venues.map((v) => (
          <div key={v.name} className="glass rounded-2xl p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl btn-gradient">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold">{v.name}</h3>
            <p className="text-xs text-muted-foreground">{v.city} · Cap {v.cap.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyChoose() {
  const items = [
    { icon: Zap, t: "Instant Booking", d: "Real-time seat map with 10-minute hold to secure your pick." },
    { icon: ShieldCheck, t: "Secure Payments", d: "Bank-grade checkout with full booking guarantee." },
    { icon: Ticket, t: "QR Tickets", d: "Instant QR ticket, delivered to your inbox and dashboard." },
  ];
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
      <h2 className="text-center text-2xl font-bold sm:text-3xl">Why Choose Us</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.map(({ icon: I, t, d }) => (
          <div key={t} className="glass rounded-2xl p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl btn-gradient">
              <I className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { n: "5M+", l: "Tickets sold" },
    { n: "12K+", l: "Events hosted" },
    { n: "500+", l: "Venues" },
    { n: "99.9%", l: "Uptime" },
  ];
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
      <div className="glass grid gap-6 rounded-3xl p-8 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-3xl font-bold gradient-text sm:text-4xl">{s.n}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { n: "Priya S.", r: "Booked front-row seats in 30 seconds. QR ticket in my inbox instantly!" },
    { n: "Marcus L.", r: "Best UX I've ever used for concerts. The seat map is a game changer." },
    { n: "Aiko T.", r: "Waitlist automatically got me tickets when they opened up. Magic." },
  ];
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
      <h2 className="text-center text-2xl font-bold sm:text-3xl">Loved by fans everywhere</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.map((t) => (
          <div key={t.n} className="glass rounded-2xl p-6">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-warn text-warn" />
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">"{t.r}"</p>
            <p className="mt-4 text-xs font-medium">{t.n}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    ["How does the 10-minute seat hold work?", "When you select seats, they're reserved for 10 minutes while you complete checkout. If you don't complete, they're released automatically."],
    ["Can I cancel or refund a booking?", "Yes — you can cancel from your dashboard until the event start time, subject to the organizer's policy."],
    ["What's the waitlist?", "If an event is sold out, join the waitlist. When seats free up, you get a 15-minute exclusive booking window."],
    ["Do I need to print my ticket?", "No — the QR ticket in your dashboard is scanned at the venue."],
  ];
  return (
    <section className="mx-auto mt-20 max-w-3xl px-4 sm:px-6">
      <h2 className="text-center text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
      <Accordion type="single" collapsible className="mt-8 glass rounded-2xl p-2">
        {items.map(([q, a], i) => (
          <AccordionItem key={q} value={`i-${i}`} className="border-white/5">
            <AccordionTrigger className="px-4 text-left">{q}</AccordionTrigger>
            <AccordionContent className="px-4 text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
      <div className="glass overflow-hidden rounded-3xl p-10 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Ready for your next night out?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Join thousands booking tickets today. Sign up in seconds.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="btn-gradient btn-gradient-hover">
            <Link to="/auth" search={{ mode: "register" }}>
              Create free account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-white/10 bg-white/5">
            <Link to="/movies">Explore events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
