import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Briefcase, FileText, Compass } from "lucide-react";

export const Route = createFileRoute("/_authenticated/seeker/dashboard")({
  component: SeekerDashboard,
});

function SeekerDashboard() {
  const { profile } = useAuth();
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
        <StatCard icon={<FileText className="h-5 w-5" />} label="Resumes uploaded" value="0" />
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Jobs analyzed" value="0" />
        <StatCard icon={<Compass className="h-5 w-5" />} label="Roadmaps generated" value="0" />
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
        <Button asChild size="lg">
          <Link to="/seeker/analyzer">Open Analyzer</Link>
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
