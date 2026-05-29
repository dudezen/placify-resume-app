import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { analyzeResume, type Analysis } from "@/lib/analyze.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Results } from "@/components/placify/Results";

export const Route = createFileRoute("/_authenticated/seeker/jobs/$jobId")({
  component: JobDetail,
});

function JobDetail() {
  const { jobId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const analyzeFn = useServerFn(analyzeResume);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: primaryResume } = useQuery({
    queryKey: ["primary-resume", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("resumes")
        .select("id, file_name, parsed_text")
        .eq("is_primary", true)
        .maybeSingle();
      return data;
    },
  });

  const { data: existingApplication } = useQuery({
    queryKey: ["application", jobId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, match_score, ats_score, analysis, status")
        .eq("job_id", jobId)
        .maybeSingle();
      return data;
    },
  });

  const runMatch = async () => {
    if (!job || !user) return;
    if (!primaryResume?.parsed_text) {
      toast.error("Upload a primary resume first.");
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeFn({
        data: { resumeText: primaryResume.parsed_text, jd: job.description },
      });
      setAnalysis(result);
      toast.success("Match complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Match failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const apply = async () => {
    if (!job || !user || !primaryResume) return;
    const result = analysis;
    if (!result) {
      toast.error("Run a match first.");
      return;
    }
    const { error } = await supabase.from("applications").upsert(
      {
        job_id: job.id,
        seeker_id: user.id,
        resume_id: primaryResume.id,
        match_score: Math.round(result.overall_score),
        ats_score: Math.round(result.ats_simulation.parse_score),
        red_flags: result.recruiter_view.concerns,
        green_flags: result.recruiter_view.strengths,
        analysis: result,
        status: "submitted",
      },
      { onConflict: "job_id,seeker_id" },
    );
    if (error) return toast.error(error.message);
    toast.success("Application submitted");
    qc.invalidateQueries({ queryKey: ["application", jobId, user.id] });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!job)
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground">Job not found.</p>
        <Button asChild variant="link" className="mt-2 px-0">
          <Link to="/seeker/jobs">Back to jobs</Link>
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/seeker/jobs">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to jobs
        </Link>
      </Button>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {job.company}
              {job.location ? ` · ${job.location}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{job.employment_type.replace("_", " ")}</Badge>
              {(job.salary_min || job.salary_max) && (
                <Badge variant="outline">
                  ${job.salary_min ?? "?"} – ${job.salary_max ?? "?"}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {existingApplication ? (
              <Badge className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle2 className="h-3 w-3" /> Applied · {existingApplication.match_score}%
                match
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="mt-6 whitespace-pre-wrap text-sm text-foreground/90">{job.description}</p>
      </Card>

      {!primaryResume && (
        <Card className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          You need a primary resume to run an AI match.{" "}
          <Link to="/seeker/resumes" className="underline">
            Upload one now
          </Link>
          .
        </Card>
      )}

      {primaryResume && !analysis && (
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-[image:var(--gradient-soft)] p-6">
          <div>
            <h2 className="font-semibold">Run AI match against this job</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Using primary resume: <strong>{primaryResume.file_name}</strong>
            </p>
          </div>
          <Button onClick={runMatch} disabled={analyzing} size="lg">
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Run match
              </>
            )}
          </Button>
        </Card>
      )}

      {analysis && (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              Match score:{" "}
              <span className="text-lg font-bold text-primary">
                {Math.round(analysis.overall_score)}%
              </span>
            </div>
            {!existingApplication && (
              <Button onClick={apply}>Apply with this resume</Button>
            )}
          </Card>
          <Results data={analysis} onReset={() => setAnalysis(null)} />
        </>
      )}
    </div>
  );
}
