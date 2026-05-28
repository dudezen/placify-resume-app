import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type UserRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — Skill Sync AI" }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [role, setRole] = useState<UserRole>("seeker");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session && profile) {
      navigate({ to: profile.role === "recruiter" ? "/recruiter/dashboard" : "/seeker/dashboard", replace: true });
    }
  }, [session, profile, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          role,
          company_name: role === "recruiter" ? companyName : null,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Welcome!");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-soft)] px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)]">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Skill Sync AI</span>
        </Link>
        <div className="rounded-2xl border bg-card p-8 shadow-[var(--shadow-soft)]">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pick the experience that fits you.</p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <RoleButton active={role === "seeker"} onClick={() => setRole("seeker")} icon={<Users className="h-4 w-4" />} label="Job Seeker" />
            <RoleButton active={role === "recruiter"} onClick={() => setRole("recruiter")} icon={<Briefcase className="h-4 w-4" />} label="Recruiter" />
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            {role === "recruiter" && (
              <div>
                <Label htmlFor="company">Company name</Label>
                <Input id="company" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "border-primary bg-accent text-foreground shadow-[var(--shadow-soft)]"
          : "border-border bg-card text-muted-foreground hover:bg-muted/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
