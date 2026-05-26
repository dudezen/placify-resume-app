import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AtsSimulator } from "@/components/placify/AtsSimulator";
import { lastAnalysis } from "@/lib/local-store";
import type { Analysis } from "@/lib/analyze.functions";

export const Route = createFileRoute("/dashboard/user/ats")({
  component: AtsPage,
});

function AtsPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  useEffect(() => setAnalysis(lastAnalysis.get()), []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ATS Insights</h1>
        <p className="text-sm text-muted-foreground">
          How your resume parses through applicant tracking systems.
        </p>
      </div>
      {analysis ? (
        <AtsSimulator data={analysis.ats_simulation} />
      ) : (
        <EmptyHint to="/dashboard/user/resume" label="Run an analysis" />
      )}
    </div>
  );
}

function EmptyHint({ to, label }: { to: string; label: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-sm text-muted-foreground">No analysis yet.</p>
      <Link
        to={to}
        className="mt-4 inline-flex rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
      >
        {label}
      </Link>
    </Card>
  );
}
