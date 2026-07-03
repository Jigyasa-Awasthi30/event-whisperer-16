import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Ticket Booking" }] }),
  component: About,
});

function About() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold gradient-text">About Us</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Ticket Booking System is the fastest way to discover and book movies and concerts.
          We connect audiences with unforgettable live experiences through a modern, seamless
          booking platform trusted by thousands of organizers and millions of fans.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { t: "Our Mission", d: "Make live entertainment accessible to everyone with one-tap booking." },
            { t: "Our Vision", d: "The world's most trusted event booking platform." },
            { t: "Our Values", d: "Speed, transparency, and delight for both fans and organizers." },
          ].map((x) => (
            <div key={x.t} className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold">{x.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
