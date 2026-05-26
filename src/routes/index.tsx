import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  ScanLine,
  Compass,
  Target,
  Users,
  AlertTriangle,
  Brain,
  ArrowRight,
  Upload,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  FileText,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Placify — AI Career Intelligence Platform" },
      {
        name: "description",
        content:
          "Match smarter. Hire faster. Build stronger careers. AI-powered resume matching, ATS scoring, and recruiter intelligence.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="dark min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Placify</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#preview" className="hover:text-foreground">Dashboards</a>
          <Link to="/analyze" className="hover:text-foreground">Try analyzer</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-gradient-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-10 top-20 h-96 w-96 rounded-full bg-[oklch(0.6_0.2_240/0.25)] blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Powered by Gemini · ATS-grade analysis
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            AI-Powered <span className="text-gradient">Career Intelligence</span> Platform
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Match smarter. Hire faster. Build stronger careers. Placify unifies resume
            analysis, ATS optimization, and recruiter intelligence in one workspace.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur hover:bg-card/70"
            >
              Explore features
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-2 shadow-glow">
      <div className="rounded-xl border border-border/40 bg-card/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.2_25)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.8_0.18_75)]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.17_155)]" />
          </div>
          <div className="text-xs text-muted-foreground">placify.app/dashboard</div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "ATS Score", value: "92", icon: ScanLine, hue: "var(--primary)" },
            { label: "Match Rate", value: "87%", icon: Target, hue: "oklch(0.75 0.18 240)" },
            { label: "Roadmap Steps", value: "12", icon: Compass, hue: "oklch(0.7 0.17 155)" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border/40 bg-card/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <s.icon className="h-4 w-4" style={{ color: s.hue }} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: "75%", background: "var(--gradient-primary)" }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          <div className="md:col-span-3 rounded-lg border border-border/40 bg-card/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Brain className="h-4 w-4 text-primary" /> AI Insights
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2 rounded-md bg-accent/30 p-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
                Strong React + TypeScript foundation matches role requirements.
              </div>
              <div className="flex items-start gap-2 rounded-md bg-accent/30 p-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-[oklch(0.8_0.18_75)]" />
                Missing keyword: <span className="text-foreground">"system design"</span>
              </div>
              <div className="flex items-start gap-2 rounded-md bg-accent/30 p-2">
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 text-primary" />
                Adding 2 quantified bullets could lift ATS to 96.
              </div>
            </div>
          </div>
          <div className="md:col-span-2 rounded-lg border border-border/40 bg-card/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-primary" /> Top Match
            </div>
            <div className="text-sm font-semibold">Senior Frontend Engineer</div>
            <div className="text-xs text-muted-foreground">Acme · Remote</div>
            <div className="mt-3 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              94% match
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: ScanLine, title: "ATS Resume Analysis", desc: "Parse scores, keyword density, and format flags graded like real ATS engines." },
  { icon: Compass, title: "AI Career Roadmaps", desc: "Personalized phase-by-phase coaching to close skill gaps for any target role." },
  { icon: Target, title: "Resume Matching", desc: "Score any resume against any JD with skill, seniority, and experience signals." },
  { icon: Users, title: "Recruiter Intelligence", desc: "10-second verdicts, story arcs, and green/red flags for every candidate." },
  { icon: AlertTriangle, title: "Skill Gap Detection", desc: "Identify what's missing, weak, or stuffed — with rewrite suggestions." },
  { icon: Brain, title: "Smart Hiring Insights", desc: "Match analytics, candidate shortlists, and pipeline metrics in one view." },
];

function Features() {
  return (
    <section id="features" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            One platform. <span className="text-gradient">Two sides</span> of the table.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything candidates and recruiters need to make better, faster decisions.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/60 hover:shadow-glow"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const seekerSteps = [
  { icon: Upload, title: "Upload Resume", desc: "Drop a PDF — we extract every detail." },
  { icon: ScanLine, title: "Analyze ATS Score", desc: "Parse score, keywords, and format flags." },
  { icon: Target, title: "Match With Jobs", desc: "See where you fit and where to grow." },
  { icon: Compass, title: "Generate Roadmap", desc: "Step-by-step plan to land the role." },
];

const recruiterSteps = [
  { icon: Briefcase, title: "Post Jobs", desc: "Define roles, skills, and requirements." },
  { icon: FileText, title: "Review Candidates", desc: "Upload resumes or accept applications." },
  { icon: Brain, title: "Analyze AI Insights", desc: "Verdicts, strengths, concerns, story." },
  { icon: ShieldCheck, title: "Shortlist Candidates", desc: "Move fast on the strongest fits." },
];

function HowItWorks() {
  return (
    <section id="how" className="border-t border-border/40 bg-gradient-soft/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
          <p className="mt-4 text-muted-foreground">
            Built for both sides of the hiring conversation.
          </p>
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <StepsColumn title="For Job Seekers" steps={seekerSteps} />
          <StepsColumn title="For Recruiters" steps={recruiterSteps} />
        </div>
      </div>
    </section>
  );
}

function StepsColumn({
  title,
  steps,
}: {
  title: string;
  steps: { icon: React.ElementType; title: string; desc: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-8 backdrop-blur">
      <h3 className="mb-6 text-xl font-semibold">{title}</h3>
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-start gap-4 rounded-lg border border-border/40 bg-card/40 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <s.icon className="h-4 w-4 text-primary" />
                <div className="font-medium">{s.title}</div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DashboardPreview() {
  return (
    <section id="preview" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Purpose-built dashboards
          </h2>
          <p className="mt-4 text-muted-foreground">
            Distinct experiences for candidates and recruiters — same intelligence underneath.
          </p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <PreviewCard
            label="Job Seeker"
            title="Track ATS, matches, and your roadmap"
            bullets={["Resume strength score", "Skill gap analysis", "Recommended jobs", "Personalized roadmap"]}
          />
          <PreviewCard
            label="Recruiter"
            title="Review candidates with AI verdicts"
            bullets={["Job pipeline analytics", "Candidate match scores", "Green & red flags", "One-click shortlist"]}
          />
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ label, title, bullets }: { label: string; title: string; bullets: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass overflow-hidden rounded-2xl p-6"
    >
      <div className="text-xs uppercase tracking-wider text-primary">{label}</div>
      <h3 className="mt-2 text-xl font-semibold">{title}</h3>
      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-lg border border-border/40 bg-card/60 p-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-md border border-border/40 bg-card/60 p-3">
              <div className="h-1.5 w-10 rounded-full bg-muted" />
              <div className="mt-3 h-6 w-12 rounded bg-gradient-primary" />
              <div className="mt-2 h-1 w-full rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-border/40 bg-gradient-hero py-24">
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Start building <span className="text-gradient">smarter careers</span> today
        </h2>
        <p className="mt-4 text-muted-foreground">
          Free to try. No credit card. Pick your side and dive in.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            search={{ role: "user" }}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            Join as Job Seeker
          </Link>
          <Link
            to="/register"
            search={{ role: "recruiter" }}
            className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur hover:bg-card/70"
          >
            Join as Recruiter
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Placify</span>
          <span className="text-muted-foreground/60">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/analyze" className="hover:text-foreground">Try Analyzer</Link>
          <Link to="/login" className="hover:text-foreground">Sign in</Link>
          <Link to="/register" className="hover:text-foreground">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
