import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Analysis } from "@/lib/analyze.functions";

export const Route = createFileRoute("/_authenticated/seeker/roadmaps")({
  component: RoadmapsPage,
});

interface SavedRow {
  id: string;
  match_score: number | null;
  created_at: string;
  analysis: Analysis | null;
  jobs: { id: string; title: string; company: string } | null;
}

function RoadmapsPage() {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["roadmaps", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id, match_score, created_at, analysis, jobs(id, title, company)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as SavedRow[];
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Career Roadmaps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every match you run is saved here with its personalized AI roadmap.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && data.length === 0 && (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No roadmaps yet. Run a match from{" "}
          <Link to="/seeker/jobs" className="underline">
            Browse Jobs
          </Link>{" "}
          or the{" "}
          <Link to="/seeker/analyzer" className="underline">
            Analyzer
          </Link>
          .
        </Card>
      )}

      <div className="grid gap-3">
        {data.map((row) => {
          const roadmap = row.analysis?.career_roadmap ?? [];
          return (
            <Card key={row.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {row.jobs?.title ?? "Untitled role"}
                    {row.jobs?.company && ` · ${row.jobs.company}`}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.match_score != null && (
                      <Badge variant="secondary">{row.match_score}% match</Badge>
                    )}
                    <Badge variant="outline" className="gap-1">
                      <Compass className="h-3 w-3" /> {roadmap.length} skills
                    </Badge>
                  </div>
                </div>
                {row.jobs && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/seeker/jobs/$jobId" params={{ jobId: row.jobs.id }}>
                      Reopen
                    </Link>
                  </Button>
                )}
              </div>
              {roadmap.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {roadmap.slice(0, 4).map((r, i) => (
                    <li
                      key={i}
                      className="rounded-lg border bg-accent/20 p-3 text-sm"
                    >
                      <div className="font-medium">{r.skill}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.priority} · {r.time_to_ready}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
