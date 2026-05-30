import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, Users, Download } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppStatus = Database["public"]["Enums"]["application_status"];

export const Route = createFileRoute("/_authenticated/recruiter/applicants")({
  validateSearch: (s: Record<string, unknown>) => ({
    job: typeof s.job === "string" ? s.job : undefined,
  }),
  component: Applicants,
});

function Applicants() {
  const { user } = useAuth();
  const { job: selectedJob } = Route.useSearch();
  const qc = useQueryClient();
  const navigate = useNavigate();


  const { data: jobs } = useQuery({
    queryKey: ["recruiter-jobs-min", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("jobs")
        .select("id, title")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: apps, isLoading } = useQuery({
    queryKey: ["recruiter-apps", user?.id, selectedJob ?? "all"],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("applications")
        .select(
          "id, job_id, seeker_id, match_score, ats_score, red_flags, green_flags, status, created_at, resume_id",
        )
        .order("match_score", { ascending: false, nullsFirst: false });
      if (selectedJob) q = q.eq("job_id", selectedJob);
      const { data: rows, error } = await q;
      if (error) throw error;
      const list = rows ?? [];

      const seekerIds = [...new Set(list.map((r) => r.seeker_id))];
      const jobIds = [...new Set(list.map((r) => r.job_id))];
      const resumeIds = [...new Set(list.map((r) => r.resume_id).filter(Boolean) as string[])];

      const [{ data: profiles }, { data: jobs }, { data: resumes }] = await Promise.all([
        seekerIds.length
          ? supabase.from("profiles").select("id, full_name").in("id", seekerIds)
          : Promise.resolve({ data: [] }),
        jobIds.length
          ? supabase.from("jobs").select("id, title").in("id", jobIds)
          : Promise.resolve({ data: [] }),
        resumeIds.length
          ? supabase
              .from("resumes")
              .select("id, file_name, file_path")
              .in("id", resumeIds)
          : Promise.resolve({ data: [] }),
      ]);

      const pMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      const jMap = new Map((jobs ?? []).map((j) => [j.id, j]));
      const rMap = new Map((resumes ?? []).map((r) => [r.id, r]));

      return list.map((a) => ({
        ...a,
        seeker: pMap.get(a.seeker_id) ?? null,
        job: jMap.get(a.job_id) ?? null,
        resume: a.resume_id ? rMap.get(a.resume_id) ?? null : null,
      }));
    },
  });

  const updateStatus = async (id: string, status: AppStatus) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["recruiter-apps"] });
  };

  const downloadResume = async (path: string) => {
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    if (error || !data) return toast.error("Could not generate download link");
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applicants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-ranked candidates with red/green flags for each application.
          </p>
        </div>
        <div className="w-64">
          <Select
            value={selectedJob ?? "all"}
            onValueChange={(v) =>
              navigate({
                to: "/recruiter/applicants",
                search: v === "all" ? {} : { job: v },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All jobs</SelectItem>
              {jobs?.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !apps?.length ? (
        <Card className="p-10 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No applications yet.{" "}
            <Link to="/recruiter/jobs" className="text-primary underline">
              Manage your jobs
            </Link>
            .
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <ApplicantCard
              key={a.id}
              app={a}
              onStatus={(s) => updateStatus(a.id, s)}
              onDownload={() => a.resume?.file_path && downloadResume(a.resume.file_path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicantCard({
  app,
  onStatus,
  onDownload,
}: {
  app: {
    id: string;
    match_score: number | null;
    ats_score: number | null;
    red_flags: unknown;
    green_flags: unknown;
    status: AppStatus;
    seeker: { full_name: string } | null;
    job: { title: string } | null;
    resume: { file_name: string; file_path: string } | null;
  };
  onStatus: (s: AppStatus) => void;
  onDownload: () => void;
}) {
  const [open, setOpen] = useState(false);
  const greens = useMemo(() => toStringArray(app.green_flags), [app.green_flags]);
  const reds = useMemo(() => toStringArray(app.red_flags), [app.red_flags]);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{app.seeker?.full_name || "Anonymous candidate"}</h3>
            <Badge variant="outline">{app.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Applied to <span className="font-medium">{app.job?.title ?? "—"}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <Metric label="Match" value={app.match_score} />
          <Metric label="ATS" value={app.ats_score} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FlagList
          title="Green flags"
          items={greens}
          icon={<CheckCircle2 className="h-4 w-4 text-[color:oklch(0.5_0.15_155)]" />}
          tone="green"
        />
        <FlagList
          title="Red flags"
          items={reds}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          tone="red"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <div className="flex items-center gap-2">
          {app.resume && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="mr-1.5 h-4 w-4" />
              {app.resume.file_name}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={app.status} onValueChange={(v) => onStatus(v as AppStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
            {open ? "Hide" : "Details"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-3 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <div>Application ID: {app.id}</div>
        </div>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums">
        {value == null ? "—" : `${value}%`}
      </div>
    </div>
  );
}

function FlagList({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  tone: "green" | "red";
}) {
  const cls =
    tone === "green"
      ? "border-primary/15 bg-accent/30"
      : "border-destructive/20 bg-destructive/5";
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">None recorded.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((t, i) => (
            <li key={i} className={`rounded border p-2 text-xs ${cls}`}>
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}
