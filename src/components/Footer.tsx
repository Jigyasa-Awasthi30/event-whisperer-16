import { Link } from "@tanstack/react-router";
import { Ticket, Twitter, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl btn-gradient">
                <Ticket className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">TicketBooking</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Book Movies & Concerts in Seconds.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="rounded-lg p-2 hover:bg-white/5"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="rounded-lg p-2 hover:bg-white/5"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="rounded-lg p-2 hover:bg-white/5"><Facebook className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/movies" className="hover:text-foreground">Movies</Link></li>
              <li><Link to="/concerts" className="hover:text-foreground">Concerts</Link></li>
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/auth" className="hover:text-foreground">Login</Link></li>
              <li><Link to="/auth" search={{ mode: "register" }} className="hover:text-foreground">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">My Tickets</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Refund Policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ticket Booking System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
