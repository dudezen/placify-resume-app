import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, XCircle, ScanLine, FileSearch, Info } from "lucide-react";
import type { Analysis } from "@/lib/analyze.functions";

type Ats = Analysis["ats_simulation"];

const verdictMeta = {
  pass: { label: "Likely Pass", cls: "bg-[oklch(var(--success)/0.15)] text-[color:oklch(0.4_0.12_155)] border-[oklch(var(--success)/0.3)]", icon: CheckCircle2 },
  borderline: { label: "Borderline", cls: "bg-[oklch(var(--warning)/0.15)] text-[color:oklch(0.4_0.12_75)] border-[oklch(var(--warning)/0.3)]", icon: AlertTriangle },
  reject: { label: "Likely Rejected", cls: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
} as const;

const statusMeta: Record<Ats["keyword_matches"][number]["status"], { label: string; cls: string }> = {
  good: { label: "Good", cls: "bg-[oklch(var(--success)/0.15)] text-[color:oklch(0.4_0.12_155)] border-[oklch(var(--success)/0.3)]" },
  low: { label: "Low", cls: "bg-[oklch(var(--warning)/0.15)] text-[color:oklch(0.4_0.12_75)] border-[oklch(var(--warning)/0.3)]" },
  missing: { label: "Missing", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  stuffed: { label: "Stuffed", cls: "bg-muted text-muted-foreground border-border" },
};

const severityIcon = {
  info: <Info className="h-4 w-4 text-muted-foreground" />,
  warn: <AlertTriangle className="h-4 w-4 text-[color:oklch(0.55_0.16_75)]" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
} as const;

export function AtsSimulator({ data }: { data: Ats }) {
  const v = verdictMeta[data.verdict];
  const VIcon = v.icon;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">ATS Parse Simulation</h3>
              <p className="text-xs text-muted-foreground">How an Applicant Tracking System would score this resume</p>
            </div>
          </div>
          <Badge variant="outline" className={`${v.cls} px-3 py-1.5 text-sm`}>
            <VIcon className="mr-1.5 h-4 w-4" />
            {v.label}
          </Badge>
        </div>
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Parse Score</span>
            <span className="text-2xl font-bold tabular-nums">
              {data.parse_score}
              <span className="text-base font-normal text-muted-foreground">/100</span>
            </span>
          </div>
          <Progress value={data.parse_score} className="mt-2 h-2" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b bg-[image:var(--gradient-soft)] px-6 py-4">
          <h3 className="font-semibold">Keyword Match</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Keyword</th>
                <th className="px-6 py-3 font-medium">In Resume</th>
                <th className="px-6 py-3 font-medium">JD Required</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.keyword_matches.map((k, i) => {
                const s = statusMeta[k.status];
                return (
                  <tr key={i} className="border-t">
                    <td className="px-6 py-3 font-medium">{k.keyword}</td>
                    <td className="px-6 py-3 tabular-nums">{k.resume_count}×</td>
                    <td className="px-6 py-3">{k.required ? "Yes" : "No"}</td>
                    <td className="px-6 py-3">
                      <Badge variant="outline" className={s.cls}>{s.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Format & Parseability
          </h3>
          <ul className="space-y-3">
            {data.format_flags.map((f, i) => (
              <li key={i} className="flex items-start gap-3 rounded-md border bg-card p-3 text-sm">
                <span className="mt-0.5">{severityIcon[f.severity]}</span>
                <span>{f.issue}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <FileSearch className="h-4 w-4 text-primary" />
            Fields Extracted by ATS
          </h3>
          <dl className="space-y-3 text-sm">
            <Field label="Name" value={data.extracted_fields.name || "—"} />
            <Field label="Email" value={data.extracted_fields.email || "—"} />
            <Field label="Experience" value={data.extracted_fields.years_experience || "—"} />
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Skills</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {data.extracted_fields.skills.map((s, i) => (
                  <Badge key={i} variant="outline" className="bg-accent/40">{s}</Badge>
                ))}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b pb-2 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
