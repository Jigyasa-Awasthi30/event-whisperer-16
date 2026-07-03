import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Ticket, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isAuthed, user, primaryRole } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const dashLink =
    primaryRole === "admin" ? "/admin" : primaryRole === "organizer" ? "/organizer" : "/dashboard";

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/" });
  }

  const links = [
    { to: "/" as const, label: "Home" },
    { to: "/movies" as const, label: "Movies" },
    { to: "/concerts" as const, label: "Concerts" },
    { to: "/about" as const, label: "About" },
    { to: "/contact" as const, label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl btn-gradient">
              <Ticket className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Ticket<span className="gradient-text">Booking</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                activeProps={{ className: "text-foreground bg-white/5" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    {user?.email?.split("@")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  <DropdownMenuItem asChild>
                    <Link to={dashLink}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button size="sm" className="btn-gradient btn-gradient-hover" asChild>
                  <Link to="/auth" search={{ mode: "register" }}>
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                {isAuthed ? (
                  <>
                    <Button size="sm" asChild className="flex-1">
                      <Link to={dashLink}>Dashboard</Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={signOut}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" asChild className="flex-1">
                      <Link to="/auth">Login</Link>
                    </Button>
                    <Button size="sm" className="btn-gradient flex-1" asChild>
                      <Link to="/auth" search={{ mode: "register" }}>
                        Register
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
