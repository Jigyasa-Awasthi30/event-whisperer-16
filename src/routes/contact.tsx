import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Ticket Booking" }] }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);
  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold gradient-text">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">We'd love to hear from you.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSending(true);
                setTimeout(() => { toast.success("Message sent — we'll be in touch."); setSending(false); (e.target as HTMLFormElement).reset(); }, 800);
              }}
              className="space-y-4"
            >
              <Input required name="name" placeholder="Full name" />
              <Input required type="email" name="email" placeholder="Email" />
              <Input name="subject" placeholder="Subject" />
              <Textarea required name="message" placeholder="Your message" rows={5} />
              <Button type="submit" className="w-full btn-gradient btn-gradient-hover" disabled={sending}>
                {sending ? "Sending..." : "Send message"}
              </Button>
            </form>
          </div>
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "hello@ticketbooking.app" },
              { icon: Phone, label: "Phone", value: "+1 (555) 010-2030" },
              { icon: MapPin, label: "Address", value: "1 Market Street, San Francisco, CA" },
            ].map(({ icon: I, label, value }) => (
              <div key={label} className="glass flex items-center gap-4 rounded-2xl p-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl btn-gradient">
                  <I className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase text-muted-foreground">{label}</div>
                  <div className="font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
