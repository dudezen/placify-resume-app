import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Sparkles, Target, Award, TrendingUp, ScanLine, UserCog, Compass } from "lucide-react";
import type { Analysis } from "@/lib/analyze.functions";
import { AtsSimulator } from "./AtsSimulator";
import { RecruiterView } from "./RecruiterView";
import { CareerRoadmap } from "./CareerRoadmap";

export function Results({ data, onReset }: { data: Analysis; onReset: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Analysis Results</h2>
        <button onClick={onReset} className="text-sm text-primary hover:underline">
          ← New analysis
        </button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="ats" className="gap-1.5">
            <ScanLine className="h-4 w-4" />
            <span className="hidden sm:inline">ATS Simulator</span>
            <span className="sm:hidden">ATS</span>
          </TabsTrigger>
          <TabsTrigger value="recruiter" className="gap-1.5">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Recruiter View</span>
            <span className="sm:hidden">Recruiter</span>
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="gap-1.5">
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Career Roadmap</span>
            <span className="sm:hidden">Roadmap</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Overview data={data} />
        </TabsContent>
        <TabsContent value="ats">
          <AtsSimulator data={data.ats_simulation} />
        </TabsContent>
        <TabsContent value="recruiter">
          <RecruiterView data={data.recruiter_view} />
        </TabsContent>
        <TabsContent value="roadmap">
          <CareerRoadmap data={data.career_roadmap} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Overview({ data }: { data: Analysis }) {
  const matched = data.gap_analysis.filter((g) => g.in_resume && g.required).length;
  const missing = data.gap_analysis.filter((g) => !g.in_resume && g.required).length;
  const bonus = data.gap_analysis.filter((g) => g.in_resume && !g.required).length;

  const statusOf = (g: { in_resume: boolean; required: boolean }) => {
    if (g.in_resume && g.required)
      return { label: "Matched", cls: "bg-[oklch(0.65_0.15_155/0.15)] text-[oklch(0.45_0.12_155)] border-[oklch(0.65_0.15_155/0.3)]" };
    if (!g.in_resume && g.required)
      return { label: "Missing", cls: "bg-destructive/10 text-destructive border-destructive/30" };
    return { label: "Bonus", cls: "bg-accent text-accent-foreground border-border" };
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <ScoreCard icon={<Target className="h-5 w-5" />} label="Overall Score" value={data.overall_score} showProgress />
        <ScoreCard icon={<Award className="h-5 w-5" />} label="Skill Score" value={data.skill_score} showProgress />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-primary" />} label="Matched" value={matched} />
        <StatCard icon={<XCircle className="h-5 w-5 text-destructive" />} label="Missing" value={missing} sub={`${bonus} bonus`} />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b bg-[image:var(--gradient-soft)] px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Gap Analysis
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Skill</th>
                <th className="px-6 py-3 font-medium">In Resume</th>
                <th className="px-6 py-3 font-medium">Required</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.gap_analysis.map((g, i) => {
                const s = statusOf(g);
                return (
                  <tr key={i} className="border-t">
                    <td className="px-6 py-3 font-medium">{g.skill}</td>
                    <td className="px-6 py-3">
                      {g.in_resume ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </td>
                    <td className="px-6 py-3">
                      {g.required ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="outline" className={s.cls}>{s.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Smart Suggestions
        </h3>
        <div className="space-y-5">
          {data.suggestions.map((s, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-xs font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Original</div>
                  <p className="mt-1 text-sm italic text-foreground/80">"{s.original}"</p>
                </div>
              </div>
              <div className="ml-10 space-y-2">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rewrites</div>
                {s.rewrites.map((r, j) => (
                  <div key={j} className="rounded-md border border-primary/15 bg-accent/30 p-3 text-sm">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function ScoreCard({ icon, label, value, showProgress }: { icon: React.ReactNode; label: string; value: number; showProgress?: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">
        {value}
        <span className="text-base font-normal text-muted-foreground">/100</span>
      </div>
      {showProgress && <Progress value={value} className="mt-3 h-2" />}
    </Card>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}
