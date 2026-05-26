import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScanLine,
  Target,
  Send,
  Award,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { lastAnalysis } from "@/lib/local-store";
import type { Analysis } from "@/lib/analyze.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/user/")({
  component: UserHome,
});

function UserHome() {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    setAnalysis(lastAnalysis.get());
  }, []);

  if (!analysis) return <EmptyState />;

  const matched = analysis.gap_analysis.filter((g) => g.in_resume && g.required).length;
  const missing = analysis.gap_analysis.filter((g) => !g.in_resume && g.required).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{user ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's how your resume is performing against your latest target role.
          </p>
        </div>
        <Link
          to="/dashboard/user/resume"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
        >
          <Sparkles className="h-4 w-4" /> New analysis
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ScanLine} label="ATS Score" value={`${analysis.ats_simulation.parse_score}`} sub={analysis.ats_simulation.verdict} accent="primary" />
        <StatCard icon={Target} label="Match" value={`${analysis.overall_score}%`} sub={`${matched} matched skills`} accent="blue" />
        <StatCard icon={Award} label="Resume Strength" value={`${analysis.skill_score}`} sub={`${missing} gaps to close`} accent="green" />
        <StatCard icon={Send} label="Applications" value="0" sub="No applications yet" accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> AI Insights
            </h3>
            <Link to="/dashboard/user/resume" className="text-xs text-primary hover:underline">
              View full report →
            </Link>
          </div>
          <div className="space-y-3">
            <InsightRow icon={CheckCircle2} tone="ok" title="Strengths">
              {analysis.recruiter_view.strengths.slice(0, 2).join(" · ")}
            </InsightRow>
            <InsightRow icon={XCircle} tone="warn" title="Missing keywords">
              {analysis.gap_analysis.filter((g) => !g.in_resume && g.required).slice(0, 4).map((g) => g.skill).join(", ") || "None — great coverage"}
            </InsightRow>
            <InsightRow icon={TrendingUp} tone="ok" title="Suggested rewrite">
              {analysis.suggestions[0]?.rewrites[0] ?? "Run an analysis to see suggestions."}
            </InsightRow>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <Compass className="h-4 w-4 text-primary" /> Roadmap
            </h3>
            <Link to="/dashboard/user/roadmaps" className="text-xs text-primary hover:underline">
              Open →
            </Link>
          </div>
          {analysis.career_roadmap.length === 0 ? (
            <p className="text-sm text-muted-foreground">No critical gaps detected — you're well-aligned.</p>
          ) : (
            <ul className="space-y-3">
              {analysis.career_roadmap.slice(0, 3).map((t, i) => (
                <li key={i} className="rounded-md border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{t.skill}</div>
                    <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.time_to_ready}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <Briefcase className="h-4 w-4 text-primary" /> Recommended for you
          </h3>
          <Link to="/dashboard/user/matches" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Senior Engineer</div>
                <Badge className="bg-primary/15 text-primary border-primary/20">{90 - i * 4}%</Badge>
              </div>
              <div className="text-xs text-muted-foreground">Sample Co · Remote</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {["React", "TypeScript", "Node"].map((s) => (
                  <span key={s} className="rounded bg-accent px-1.5 py-0.5 text-[10px]">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo recommendations — connect your job source to populate real matches.
        </p>
      </Card>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: React.ElementType;
  tone: "ok" | "warn";
  title: string;
  children: React.ReactNode;
}) {
  const cls = tone === "ok" ? "text-primary" : "text-[oklch(0.8_0.18_75)]";
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card/50 p-3">
      <Icon className={`mt-0.5 h-4 w-4 ${cls}`} />
      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-10 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-semibold">Let's analyze your first resume</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload your resume and paste a target job description to unlock ATS scoring,
          gap analysis, and a personalized career roadmap.
        </p>
        <Link
          to="/dashboard/user/resume"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
        >
          Start your first analysis <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}
