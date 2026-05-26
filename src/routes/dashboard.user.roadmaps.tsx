import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CareerRoadmap } from "@/components/placify/CareerRoadmap";
import { lastAnalysis } from "@/lib/local-store";
import type { Analysis } from "@/lib/analyze.functions";

export const Route = createFileRoute("/dashboard/user/roadmaps")({
  component: RoadmapsPage,
});

function RoadmapsPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  useEffect(() => setAnalysis(lastAnalysis.get()), []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Career Roadmaps</h1>
        <p className="text-sm text-muted-foreground">
          Phase-by-phase coaching to close the gap for your target role.
        </p>
      </div>
      {analysis ? (
        <CareerRoadmap data={analysis.career_roadmap} />
      ) : (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted-foreground">Run an analysis to generate your roadmap.</p>
          <Link
            to="/dashboard/user/resume"
            className="mt-4 inline-flex rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            Start now
          </Link>
        </Card>
      )}
    </div>
  );
}
