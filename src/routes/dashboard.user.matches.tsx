import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/dashboard/user/matches")({
  component: MatchesPage,
});

const mock = [
  { title: "Senior Frontend Engineer", company: "Acme", location: "Remote", match: 94, salary: "$140–180k", skills: ["React", "TypeScript", "Next.js"], missing: ["GraphQL"] },
  { title: "Full-Stack Developer", company: "Northwind", location: "NYC", match: 88, salary: "$120–150k", skills: ["Node.js", "Postgres"], missing: ["Kubernetes"] },
  { title: "Product Engineer", company: "Globex", location: "Remote", match: 82, salary: "$130–170k", skills: ["React", "Tailwind"], missing: ["Rust"] },
  { title: "Platform Engineer", company: "Initech", location: "Berlin", match: 78, salary: "€90–120k", skills: ["AWS", "Terraform"], missing: ["Go"] },
];

function MatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Matches</h1>
        <p className="text-sm text-muted-foreground">
          Roles ranked by fit. Demo data — wire your own backend to populate.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {mock.map((j) => (
          <Card key={j.title} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <div className="font-semibold">{j.title}</div>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {j.company} · {j.location} · {j.salary}
                </div>
              </div>
              <Badge className="bg-primary/15 text-primary border-primary/20">{j.match}%</Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Required</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {j.skills.map((s) => (
                    <span key={s} className="rounded bg-accent px-2 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Missing</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {j.missing.map((s) => (
                    <span key={s} className="rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs text-destructive">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <button className="mt-5 w-full rounded-md bg-gradient-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">
              Apply
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
