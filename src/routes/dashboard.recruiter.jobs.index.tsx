import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Trash2, PlusCircle } from "lucide-react";
import { jobs as jobsStore, candidates as candStore, type JobPost } from "@/lib/local-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/recruiter/jobs/")({
  component: JobsListPage,
});

function JobsListPage() {
  const [items, setItems] = useState<JobPost[]>([]);
  useEffect(() => setItems(jobsStore.list()), []);

  const remove = (id: string) => {
    jobsStore.remove(id);
    setItems(jobsStore.list());
    toast.success("Job removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Job Posts</h1>
          <p className="text-sm text-muted-foreground">Manage your published roles.</p>
        </div>
        <Link
          to="/dashboard/recruiter/jobs/new"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
        >
          <PlusCircle className="h-4 w-4" /> New job
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">No jobs yet. Create your first.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((j) => {
            const count = candStore.forJob(j.id).length;
            return (
              <Card key={j.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{j.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {j.company} · {j.location}
                    </div>
                  </div>
                  <Badge variant="outline">{count} candidates</Badge>
                </div>
                {j.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {j.skills.slice(0, 6).map((s) => (
                      <span key={s} className="rounded bg-accent px-1.5 py-0.5 text-[11px]">{s}</span>
                    ))}
                  </div>
                )}
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{j.description}</p>
                <div className="mt-4 flex gap-2">
                  <Link
                    to="/dashboard/recruiter/candidates"
                    search={{ jobId: j.id }}
                    className="flex-1 rounded-md bg-gradient-primary px-3 py-1.5 text-center text-xs font-semibold text-primary-foreground hover:opacity-95"
                  >
                    Review candidates
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => remove(j.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
