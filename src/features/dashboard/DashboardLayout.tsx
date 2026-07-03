import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import {
  LayoutDashboard, Ticket, ListChecks, User as UserIcon,
  Plus, Calendar, Wallet, ShieldCheck, Users, MapPin, Building,
} from "lucide-react";

type Role = "customer" | "organizer" | "admin";

const NAV: Record<Role, { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  customer: [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
    { to: "/dashboard/waitlist", label: "Waitlist", icon: ListChecks },
    { to: "/dashboard/profile", label: "Profile", icon: UserIcon },
  ],
  organizer: [
    { to: "/organizer", label: "Overview", icon: LayoutDashboard },
    { to: "/organizer/create", label: "Create Event", icon: Plus },
    { to: "/organizer/events", label: "My Events", icon: Calendar },
    { to: "/organizer/bookings", label: "Bookings", icon: Wallet },
  ],
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/organizers", label: "Organizers", icon: ShieldCheck },
    { to: "/admin/venues", label: "Venues", icon: Building },
  ],
};

export function DashboardLayout({ role, children }: { role: Role; children: ReactNode }) {
  const loc = useLocation();
  const items = NAV[role];
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="glass sticky top-24 rounded-2xl p-3">
            <div className="mb-2 px-2 text-xs uppercase tracking-wider text-muted-foreground">
              {role} dashboard
            </div>
            <nav className="flex flex-col gap-1">
              {items.map((i) => {
                const active = loc.pathname === i.to;
                const Ico = i.icon;
                return (
                  <Link
                    key={i.to}
                    to={i.to}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                  >
                    <Ico className="h-4 w-4" /> {i.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {items.map((i) => {
              const active = loc.pathname === i.to;
              return (
                <Link key={i.to} to={i.to}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${active ? "btn-gradient text-primary-foreground" : "glass"}`}>
                  {i.label}
                </Link>
              );
            })}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
