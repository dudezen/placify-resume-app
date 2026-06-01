import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, MapPin, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/seeker/jobs/")({
  component: BrowseJobs,
});

interface JobRow {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
}

function BrowseJobs() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, title, company, location, description, employment_type, salary_min, salary_max, created_at",
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobRow[];
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open roles from verified recruiters. Click into a job to run an AI match against your
          primary resume.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading jobs…</p>}
      {!isLoading && jobs.length === 0 && (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No published jobs yet. Check back soon.
        </Card>
      )}

      <div className="grid gap-3">
        {jobs.map((j) => (
          <Card key={j.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">{j.title}</h3>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> {j.company}
                  </span>
                  {j.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {j.location}
                    </span>
                  )}
                  <Badge variant="secondary" className="gap-1">
                    <Briefcase className="h-3 w-3" />
                    {j.employment_type.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{j.description}</p>
              </div>
              <Button asChild>
                <Link to="/seeker/jobs/$jobId" params={{ jobId: j.id }}>
                  View &amp; match
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
