import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { candidates as candStore, jobs as jobsStore, type CandidateRecord } from "@/lib/local-store";

export const Route = createFileRoute("/dashboard/recruiter/shortlisted")({
  component: ShortlistedPage,
});

function ShortlistedPage() {
  const [items, setItems] = useState<CandidateRecord[]>([]);
  useEffect(() => {
    setItems(candStore.list().filter((c) => c.status === "shortlisted"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shortlisted candidates</h1>
        <p className="text-sm text-muted-foreground">Your top picks across all roles.</p>
      </div>
      {items.length === 0 ? (
        <Card className="p-10 text-center">
          <Star className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            No shortlisted candidates yet. Review candidates and mark your favorites.
          </p>
          <Link
            to="/dashboard/recruiter/candidates"
            className="mt-4 inline-flex rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95"
          >
            Review candidates
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((c) => {
            const job = jobsStore.get(c.jobId);
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{c.candidateName}</div>
                    <div className="text-xs text-muted-foreground">
                      {job ? `${job.title} · ${job.company}` : "Job removed"}
                    </div>
                  </div>
                  <Badge className="bg-primary/15 text-primary border-primary/20">
                    {c.analysis.overall_score}%
                  </Badge>
                </div>
                <p className="mt-2 text-sm italic text-muted-foreground">"{c.analysis.recruiter_view.one_liner}"</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
