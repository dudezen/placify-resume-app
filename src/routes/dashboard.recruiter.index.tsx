import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Briefcase, Users, Star, Target, PlusCircle, ArrowRight } from "lucide-react";
import { jobs as jobsStore, candidates as candStore, type JobPost, type CandidateRecord } from "@/lib/local-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/recruiter/")({
  component: RecruiterHome,
});

function RecruiterHome() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [cands, setCands] = useState<CandidateRecord[]>([]);

  useEffect(() => {
    setJobs(jobsStore.list());
    setCands(candStore.list());
  }, []);

  const shortlisted = cands.filter((c) => c.status === "shortlisted").length;
  const avgMatch = cands.length
    ? Math.round(cands.reduce((s, c) => s + c.analysis.overall_score, 0) / cands.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hi{user ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your hiring pipeline at a glance.
          </p>
        </div>
        <Link
          to="/dashboard/recruiter/jobs/new"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95"
        >
          <PlusCircle className="h-4 w-4" /> New job post
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Active Jobs" value={jobs.length} sub="Posted by you" accent="primary" />
        <StatCard icon={Users} label="Total Applicants" value={cands.length} sub="Across all roles" accent="blue" />
        <StatCard icon={Star} label="Shortlisted" value={shortlisted} sub={`${cands.length ? Math.round((shortlisted / cands.length) * 100) : 0}% of pool`} accent="green" />
        <StatCard icon={Target} label="Avg Match Score" value={`${avgMatch}%`} sub="AI-graded fit" accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4 text-primary" /> Recent candidates
            </h3>
            <Link to="/dashboard/recruiter/candidates" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {cands.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No candidates yet.</p>
              <Link
                to="/dashboard/recruiter/candidates"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Upload a candidate resume <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {cands.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
                  <div>
                    <div className="text-sm font-medium">{c.candidateName}</div>
                    <div className="text-xs text-muted-foreground">{c.fileName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{c.status}</Badge>
                    <Badge className="bg-primary/15 text-primary border-primary/20">
                      {c.analysis.overall_score}%
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <Briefcase className="h-4 w-4 text-primary" /> Your jobs
            </h3>
            <Link to="/dashboard/recruiter/jobs" className="text-xs text-primary hover:underline">Manage →</Link>
          </div>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
          ) : (
            <ul className="space-y-2">
              {jobs.slice(0, 5).map((j) => (
                <li key={j.id} className="rounded-md border border-border bg-card p-3">
                  <div className="text-sm font-medium">{j.title}</div>
                  <div className="text-xs text-muted-foreground">{j.company} · {j.location}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
