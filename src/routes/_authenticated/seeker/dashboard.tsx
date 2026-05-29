import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Briefcase, FileText, Compass } from "lucide-react";

export const Route = createFileRoute("/_authenticated/seeker/dashboard")({
  component: SeekerDashboard,
});

function SeekerDashboard() {
  const { profile, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["seeker-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [r, a] = await Promise.all([
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
      ]);
      return { resumes: r.count ?? 0, applications: a.count ?? 0 };
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your AI-powered career copilot. Analyze your resume against any role and get a tailored
          roadmap.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Resumes uploaded"
          value={String(stats?.resumes ?? 0)}
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5" />}
          label="Applications"
          value={String(stats?.applications ?? 0)}
        />
        <StatCard
          icon={<Compass className="h-5 w-5" />}
          label="Roadmaps generated"
          value={String(stats?.applications ?? 0)}
        />
      </div>

      <Card className="flex flex-col items-start gap-4 overflow-hidden bg-[image:var(--gradient-soft)] p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Run a resume × JD analysis</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get ATS score, recruiter view, gap analysis, and your personalized roadmap.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg" variant="outline">
            <Link to="/seeker/jobs">Browse jobs</Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/seeker/analyzer">Open Analyzer</Link>
          </Button>
        </div>
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
