import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Brain, Target, Star, ScanLine } from "lucide-react";
import { candidates as candStore, type CandidateRecord } from "@/lib/local-store";

export const Route = createFileRoute("/dashboard/recruiter/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const [items, setItems] = useState<CandidateRecord[]>([]);
  useEffect(() => setItems(candStore.list()), []);

  if (items.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl p-10 text-center">
        <Brain className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-lg font-semibold">No insights yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Run candidate analyses to populate aggregated AI insights here.
        </p>
      </Card>
    );
  }

  const avgMatch = Math.round(items.reduce((s, c) => s + c.analysis.overall_score, 0) / items.length);
  const avgAts = Math.round(items.reduce((s, c) => s + c.analysis.ats_simulation.parse_score, 0) / items.length);
  const shortlisted = items.filter((c) => c.status === "shortlisted").length;

  // Aggregate top skills mentioned across candidates
  const skillCount = new Map<string, number>();
  for (const c of items) {
    for (const g of c.analysis.gap_analysis) {
      if (g.in_resume) skillCount.set(g.skill, (skillCount.get(g.skill) ?? 0) + 1);
    }
  }
  const topSkills = Array.from(skillCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-sm text-muted-foreground">Aggregated patterns across your candidate pool.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Target} label="Avg Match" value={`${avgMatch}%`} accent="primary" />
        <StatCard icon={ScanLine} label="Avg ATS" value={avgAts} accent="blue" />
        <StatCard icon={Star} label="Shortlisted" value={shortlisted} accent="green" />
        <StatCard icon={Brain} label="Candidates" value={items.length} accent="amber" />
      </div>
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Most common skills in your pool</h3>
        <div className="flex flex-wrap gap-2">
          {topSkills.length === 0 && <span className="text-sm text-muted-foreground">No data yet</span>}
          {topSkills.map(([skill, count]) => (
            <span key={skill} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm">
              {skill} <span className="text-muted-foreground">· {count}</span>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
