import { useState } from "react";
import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Ticket, Loader2 } from "lucide-react";

export function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const [tab, setTab] = useState<string>(search.mode ?? "login");
  const nav = useNavigate();

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl place-items-center px-4 py-10">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl btn-gradient">
            <Ticket className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-bold">Welcome</h1>
          <p className="text-sm text-muted-foreground">Book Movies & Concerts in Seconds.</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="login">Sign in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm onDone={(role) => nav({ to: dashFor(role) })} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onDone={(role) => nav({ to: dashFor(role) })} />
          </TabsContent>
        </Tabs>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-white/10" />
          OR
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleButton />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/about" className="underline">Terms</Link> and{" "}
          <Link to="/about" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

function dashFor(role: "admin" | "organizer" | "customer") {
  return role === "admin" ? "/admin" : role === "organizer" ? "/organizer" : "/dashboard";
}

async function fetchPrimaryRole(userId: string): Promise<"admin" | "organizer" | "customer"> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("organizer")) return "organizer";
  return "customer";
}

function LoginForm({ onDone }: { onDone: (r: "admin" | "organizer" | "customer") => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!remember) {
      // best-effort: session lives in localStorage; a real remember-me would swap storage.
    }
    const role = await fetchPrimaryRole(data.user.id);
    toast.success("Signed in");
    onDone(role);
  }

  async function forgot() {
    if (!email) return toast.error("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent");
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="li-email">Email</Label>
        <Input id="li-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="li-password">Password</Label>
        <Input id="li-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <Checkbox checked={remember} onCheckedChange={(c) => setRemember(!!c)} /> Remember me
        </label>
        <button type="button" className="text-primary hover:underline" onClick={forgot}>
          Forgot password?
        </button>
      </div>
      <Button type="submit" className="w-full btn-gradient btn-gradient-hover" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
      </Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: (r: "admin" | "organizer" | "customer") => void }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [asOrganizer, setAsOrganizer] = useState(false);
  const [company, setCompany] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    if (error) { setLoading(false); return toast.error(error.message); }
    if (data.user && asOrganizer) {
      await supabase.from("profiles").update({
        organizer_status: "pending",
        organizer_company: company,
      }).eq("id", data.user.id);
    }
    setLoading(false);
    toast.success("Account created — welcome!");
    if (data.session) {
      const role = await fetchPrimaryRole(data.session.user.id);
      onDone(role);
    } else {
      toast.info("Check your email to verify.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="rg-name">Full name</Label>
        <Input id="rg-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="rg-email">Email</Label>
        <Input id="rg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="rg-password">Password (min 6)</Label>
        <Input id="rg-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={asOrganizer} onCheckedChange={(c) => setAsOrganizer(!!c)} />
        Register as event organizer (admin approval required)
      </label>
      {asOrganizer && (
        <Input placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
      )}
      <Button type="submit" className="w-full btn-gradient btn-gradient-hover" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
      </Button>
    </form>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) { setLoading(false); return toast.error(String(result.error)); }
    if (result.redirected) return;
    setLoading(false);
    window.location.href = "/dashboard";
  }
  return (
    <Button variant="outline" onClick={go} disabled={loading} className="w-full border-white/10 bg-white/5">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.3 34.9 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39.7 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.5 5.5C41 34.4 44 29.7 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
      )}
      Continue with Google
    </Button>
  );
}
