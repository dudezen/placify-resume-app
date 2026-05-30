import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, FilePlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/recruiter/jobs")({
  component: MyJobs,
});

function MyJobs() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["recruiter-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select("id, title, company, location, status, employment_type, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const ids = jobs?.map((j) => j.id) ?? [];
      const counts = new Map<string, number>();
      if (ids.length) {
        const { data: apps } = await supabase
          .from("applications")
          .select("job_id")
          .in("job_id", ids);
        for (const a of apps ?? []) {
          counts.set(a.job_id, (counts.get(a.job_id) ?? 0) + 1);
        }
      }
      return (jobs ?? []).map((j) => ({ ...j, applicants: counts.get(j.id) ?? 0 }));
    },
  });

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "published" ? "closed" : "published";
    const { error } = await supabase.from("jobs").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Job ${next}`);
    qc.invalidateQueries({ queryKey: ["recruiter-jobs", user?.id] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Job deleted");
    qc.invalidateQueries({ queryKey: ["recruiter-jobs", user?.id] });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Job Postings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish, close, or remove your job postings.
          </p>
        </div>
        <Button asChild>
          <Link to="/recruiter/post-job">
            <FilePlus className="mr-2 h-4 w-4" /> Post a job
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !data?.length ? (
        <Card className="p-10 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No jobs yet.</p>
          <Button asChild className="mt-4">
            <Link to="/recruiter/post-job">Create your first job</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((j) => (
            <Card key={j.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{j.title}</h3>
                  <StatusBadge status={j.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {j.company}
                  {j.location ? ` · ${j.location}` : ""} ·{" "}
                  {j.employment_type.replace("_", " ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/recruiter/applicants" search={{ job: j.id }}>
                    <Users className="mr-1.5 h-4 w-4" />
                    {j.applicants} applicant{j.applicants === 1 ? "" : "s"}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleStatus(j.id, j.status)}>
                  {j.status === "published" ? "Close" : "Publish"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(j.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-[oklch(var(--success)/0.15)] text-[color:oklch(0.4_0.12_155)] border-[oklch(var(--success)/0.3)]",
    draft: "bg-muted text-muted-foreground",
    closed: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <Badge variant="outline" className={map[status] ?? ""}>
      {status}
    </Badge>
  );
}
