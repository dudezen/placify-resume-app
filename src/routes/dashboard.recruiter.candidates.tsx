import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Star,
  Trash2,
  Bookmark,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { analyzeResume } from "@/lib/analyze.functions";
import { extractPdfText } from "@/lib/pdf-extract";
import {
  jobs as jobsStore,
  candidates as candStore,
  type JobPost,
  type CandidateRecord,
  type CandidateStatus,
} from "@/lib/local-store";
import { RecruiterView } from "@/components/placify/RecruiterView";
import { AtsSimulator } from "@/components/placify/AtsSimulator";

export const Route = createFileRoute("/dashboard/recruiter/candidates")({
  validateSearch: (search: Record<string, unknown>) => ({
    jobId: (search.jobId as string) || "",
  }),
  component: CandidatesPage,
});

function CandidatesPage() {
  const { jobId: initialJobId } = Route.useSearch();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [cands, setCands] = useState<CandidateRecord[]>([]);
  const [active, setActive] = useState<CandidateRecord | null>(null);

  useEffect(() => {
    const all = jobsStore.list();
    setJobs(all);
    if (!selectedJobId && all[0]) setSelectedJobId(all[0].id);
    setCands(candStore.list());
  }, [selectedJobId]);

  const refresh = () => {
    setCands(candStore.list());
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;
  const jobCands = cands.filter((c) => c.jobId === selectedJobId);

  if (jobs.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl p-10 text-center">
        <Users className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-lg font-semibold">No jobs yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a job first, then upload candidate resumes to score them.
        </p>
        <Link
          to="/dashboard/recruiter/jobs/new"
          className="mt-4 inline-flex rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
        >
          Create job
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Candidate Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Upload candidate resumes — they're scored against the selected job's JD using the same AI engine.
        </p>
      </div>

      <Card className="p-5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Reviewing for
        </Label>
        <select
          value={selectedJobId}
          onChange={(e) => {
            setSelectedJobId(e.target.value);
            setActive(null);
          }}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title} — {j.company}
            </option>
          ))}
        </select>
      </Card>

      {selectedJob && (
        <UploadCandidate job={selectedJob} onAdded={refresh} />
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" /> Candidates ({jobCands.length})
          </h3>
          {jobCands.length === 0 ? (
            <p className="text-sm text-muted-foreground">No candidates for this job yet.</p>
          ) : (
            <ul className="space-y-2">
              {jobCands.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActive(c)}
                    className={`w-full rounded-md border p-3 text-left transition-colors ${
                      active?.id === c.id ? "border-primary bg-accent/40" : "border-border bg-card hover:bg-accent/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{c.candidateName}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.fileName}</div>
                      </div>
                      <Badge className="bg-primary/15 text-primary border-primary/20">
                        {c.analysis.overall_score}%
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        ATS {c.analysis.ats_simulation.parse_score}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div>
          {active ? (
            <CandidateDetail
              key={active.id}
              candidate={active}
              onStatus={(s) => {
                candStore.updateStatus(active.id, s);
                refresh();
                setActive({ ...active, status: s });
                toast.success(`Marked as ${s}`);
              }}
            />
          ) : (
            <Card className="p-10 text-center text-sm text-muted-foreground">
              Select a candidate to see full AI insights, flags, and actions.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadCandidate({ job, onAdded }: { job: JobPost; onAdded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const analyzeFn = useServerFn(analyzeResume);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Upload a candidate PDF");
    if (!name.trim()) return toast.error("Enter candidate name");
    setLoading(true);
    try {
      const resumeText = await extractPdfText(file);
      if (resumeText.length < 50) throw new Error("Couldn't extract text from PDF");
      const analysis = await analyzeFn({ data: { resumeText, jd: job.description } });
      candStore.add({
        jobId: job.id,
        candidateName: name.trim(),
        fileName: file.name,
        analysis,
      });
      toast.success("Candidate analyzed");
      setFile(null);
      setName("");
      onAdded();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Upload className="h-4 w-4 text-primary" /> Add a candidate to "{job.title}"
      </h3>
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Candidate name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Resume (PDF)</Label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-card/40 px-3 py-2 text-sm text-muted-foreground hover:border-primary/60">
            <FileText className="h-4 w-4" />
            <span className="truncate">{file ? file.name : "Choose PDF…"}</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-primary text-primary-foreground hover:opacity-95"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Analyze
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

function CandidateDetail({
  candidate,
  onStatus,
}: {
  candidate: CandidateRecord;
  onStatus: (s: CandidateStatus) => void;
}) {
  const a = candidate.analysis;
  const matched = a.gap_analysis.filter((g) => g.in_resume && g.required);
  const missing = a.gap_analysis.filter((g) => !g.in_resume && g.required);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{candidate.candidateName}</h3>
            <p className="text-xs text-muted-foreground">{candidate.fileName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/15 text-primary border-primary/20">
              Match {a.overall_score}%
            </Badge>
            <Badge variant="outline">ATS {a.ats_simulation.parse_score}</Badge>
            <Badge variant="outline">{a.ats_simulation.verdict}</Badge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-95" onClick={() => onStatus("shortlisted")}>
            <Star className="mr-1.5 h-3.5 w-3.5" /> Shortlist
          </Button>
          <Button size="sm" variant="outline" onClick={() => onStatus("saved")}>
            <Bookmark className="mr-1.5 h-3.5 w-3.5" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => onStatus("rejected")}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Green flags
          </h4>
          <ul className="space-y-2">
            {a.recruiter_view.strengths.map((s, i) => (
              <li key={i} className="rounded-md border border-primary/20 bg-accent/30 p-2.5 text-sm">
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <XCircle className="h-4 w-4 text-destructive" /> Red flags
          </h4>
          <ul className="space-y-2">
            {a.recruiter_view.concerns.map((c, i) => (
              <li key={i} className="rounded-md border border-destructive/25 bg-destructive/5 p-2.5 text-sm">
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h4 className="mb-3 text-sm font-semibold">Relevant skills ({matched.length})</h4>
          <div className="flex flex-wrap gap-1.5">
            {matched.length === 0 && <span className="text-sm text-muted-foreground">None matched</span>}
            {matched.map((g) => (
              <Badge key={g.skill} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {g.skill}
              </Badge>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h4 className="mb-3 text-sm font-semibold">Missing skills ({missing.length})</h4>
          <div className="flex flex-wrap gap-1.5">
            {missing.length === 0 && <span className="text-sm text-muted-foreground">No gaps</span>}
            {missing.map((g) => (
              <Badge key={g.skill} variant="outline" className="bg-destructive/10 text-destructive border-destructive/25">
                {g.skill}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <RecruiterView data={a.recruiter_view} />
      <AtsSimulator data={a.ats_simulation} />
    </div>
  );
}
