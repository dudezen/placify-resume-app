import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles, User, Building2, ArrowRight } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "",
    role: (search.role as Role) || "user",
  }),
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Placify" },
      { name: "description", content: "Sign in to your Placify account." },
    ],
  }),
});

function LoginPage() {
  const { role: initialRole, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email");
    if (password.length < 4) return toast.error("Password too short");
    login({ email, role });
    toast.success(`Welcome back`);
    if (redirect) {
      window.location.href = redirect;
      return;
    }
    navigate({ to: role === "user" ? "/dashboard/user" : "/dashboard/recruiter" });
  };

  return <AuthShell mode="login" role={role} setRole={setRole} email={email} setEmail={setEmail} password={password} setPassword={setPassword} onSubmit={onSubmit} />;
}

export function AuthShell({
  mode,
  role,
  setRole,
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  name,
  setName,
}: {
  mode: "login" | "register";
  role: Role;
  setRole: (r: Role) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  name?: string;
  setName?: (v: string) => void;
}) {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: brand panel */}
        <div className="relative hidden overflow-hidden bg-gradient-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[oklch(0.6_0.2_240/0.3)] blur-3xl" />
          </div>
          <div className="relative">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">Placify</span>
            </Link>
          </div>
          <div className="relative max-w-md">
            <h2 className="text-3xl font-bold tracking-tight">
              The <span className="text-gradient">AI workspace</span> for modern hiring.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Resume matching, ATS scoring, career roadmaps, and recruiter intelligence —
              built for both sides of the table.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {["ATS-grade resume analysis", "Per-candidate AI verdicts", "Personalized career roadmaps"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-foreground/80">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative text-xs text-muted-foreground">
            © {new Date().getFullYear()} Placify · AI Career Intelligence
          </div>
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
                  <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight">Placify</span>
              </Link>
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to continue to your dashboard."
                : "Pick your role and get started in seconds."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-card/40 p-1">
              <RoleButton active={role === "user"} onClick={() => setRole("user")} icon={User} label="Job Seeker" />
              <RoleButton active={role === "recruiter"} onClick={() => setRole("recruiter")} icon={Building2} label="Recruiter" />
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "register" && setName && (
                <Field label="Full name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full rounded-md border border-border/60 bg-card/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/60"
                  />
                </Field>
              )}
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-md border border-border/60 bg-card/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/60"
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-border/60 bg-card/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/60"
                />
              </Field>

              <button
                type="submit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
              >
                {mode === "login" ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  New to Placify?{" "}
                  <Link to="/register" className="text-primary hover:underline">Create an account</Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function RoleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-gradient-primary text-primary-foreground shadow-[var(--shadow-soft)]"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
