import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Briefcase, Users, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/recruiter/dashboard")({
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  const { user, profile } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["recruiter-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, status");
      const ids = jobs?.map((j) => j.id) ?? [];
      const active = jobs?.filter((j) => j.status === "published").length ?? 0;

      let applicants = 0;
      let avg: number | null = null;
      if (ids.length) {
        const { data: apps } = await supabase
          .from("applications")
          .select("match_score")
          .in("job_id", ids);
        applicants = apps?.length ?? 0;
        const scored = (apps ?? [])
          .map((a) => a.match_score)
          .filter((s): s is number => typeof s === "number");
        if (scored.length) {
          avg = Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
        }
      }
      return { active, applicants, avg };
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hi {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          {profile?.company_name ? `${profile.company_name} · ` : ""}Hire smarter with AI-powered
          resume insights.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label="Active job postings"
          value={String(stats?.active ?? 0)}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Applicants"
          value={String(stats?.applicants ?? 0)}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Avg match score"
          value={stats?.avg == null ? "—" : `${stats.avg}%`}
        />
      </div>

      <Card className="flex flex-col items-start gap-4 overflow-hidden bg-[image:var(--gradient-soft)] p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Screen a candidate now</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drop a resume and a JD — get red/green flags, ATS score, and a 10-second recruiter verdict.
            </p>
          </div>
        </div>
        <Button asChild size="lg">
          <Link to="/recruiter/analyzer">Open Analyzer</Link>
        </Button>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
    </Card>
  );
}
