import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Brain,
  FileSearch,
  Compass,
  Users,
  Briefcase,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Minus,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Skill Sync AI — AI Resume Matching & Recruitment Platform" },
      {
        name: "description",
        content:
          "Dual-sided AI recruitment platform. Job seekers get ATS scores, smart matching, and career roadmaps. Recruiters get instant resume insights with red and green flags.",
      },
      { property: "og:title", content: "Skill Sync AI" },
      { property: "og:description", content: "AI-powered recruitment and career growth." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)]">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">Skill Sync AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#compare" className="text-muted-foreground hover:text-foreground">Compare</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-[image:var(--gradient-soft)]">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered recruitment for the next generation
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Find your perfect match.<br />
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              For seekers and recruiters.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Skill Sync AI brings resume parsing, ATS scoring, intelligent job matching, recruiter
            insights, and personalized career roadmaps into one platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/signup">Get started free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Two-column features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Built for both sides of the hire</h2>
          <p className="mt-3 text-muted-foreground">One platform. Two purpose-built experiences.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <RoleCard
            icon={<Users className="h-5 w-5" />}
            title="For Job Seekers"
            tagline="Land the right role, faster."
            features={[
              "Upload resume, get instant ATS score",
              "Smart resume × job description matching",
              "Personalized career roadmaps for any role",
              "AI-powered rewrite suggestions",
              "Browse jobs from verified recruiters",
            ]}
          />
          <RoleCard
            icon={<Briefcase className="h-5 w-5" />}
            title="For Recruiters"
            tagline="Hire smarter, not harder."
            features={[
              "Post jobs and parse JDs with AI",
              "Auto-score every applicant against your JD",
              "Instant red flags & green flags per candidate",
              "10-second recruiter verdict on every resume",
              "Shortlist, rate, and add notes per applicant",
            ]}
          />
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Features at a glance</h2>
            <p className="mt-3 text-muted-foreground">What's included in each experience.</p>
          </div>
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Feature</th>
                  <th className="px-6 py-3 text-center font-medium">Job Seeker</th>
                  <th className="px-6 py-3 text-center font-medium">Recruiter</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["ATS scoring", true, false],
                  ["Resume × JD matching", true, true],
                  ["Career roadmap generation", true, false],
                  ["Job posting", false, true],
                  ["Applicant screening", false, true],
                  ["Red/Green flag detection", false, true],
                  ["AI rewrite suggestions", true, false],
                ].map(([label, s, r], i) => (
                  <tr key={i} className="border-t">
                    <td className="px-6 py-3 font-medium">{label as string}</td>
                    <td className="px-6 py-3 text-center">
                      {s ? <CheckCircle2 className="mx-auto h-4 w-4 text-primary" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground" />}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {r ? <CheckCircle2 className="mx-auto h-4 w-4 text-primary" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/signup">Create your account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Step icon={<FileSearch className="h-5 w-5" />} step="1" title="Upload & analyze" desc="Drop in a resume and a JD. Our AI extracts skills, scores fit, and surfaces gaps." />
          <Step icon={<Compass className="h-5 w-5" />} step="2" title="Get a plan" desc="Seekers get a career roadmap. Recruiters get instant red/green flags and a verdict." />
          <Step icon={<ShieldCheck className="h-5 w-5" />} step="3" title="Act with confidence" desc="Apply with the strongest version of your resume — or shortlist the right people." />
        </div>
      </section>

      <footer className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Skill Sync AI · AI-powered recruitment and career growth
        </div>
      </footer>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  tagline,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  tagline: string;
  features: string[];
}) {
  return (
    <div className="group rounded-2xl border bg-card p-8 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      <ul className="mt-5 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({ icon, step, title, desc }: { icon: React.ReactNode; step: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent font-bold text-primary">{step}</span>
        Step {step}
      </div>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
