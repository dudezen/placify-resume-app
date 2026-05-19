import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, ThumbsUp, ThumbsDown, HelpCircle, UserCog, Briefcase } from "lucide-react";
import type { Analysis } from "@/lib/analyze.functions";

type Rec = Analysis["recruiter_view"];

const decisionMeta = {
  yes: {
    label: "Would Interview",
    cls: "bg-[oklch(var(--success)/0.15)] text-[color:oklch(0.4_0.12_155)] border-[oklch(var(--success)/0.3)]",
    icon: ThumbsUp,
  },
  maybe: {
    label: "On the Fence",
    cls: "bg-[oklch(var(--warning)/0.15)] text-[color:oklch(0.4_0.12_75)] border-[oklch(var(--warning)/0.3)]",
    icon: HelpCircle,
  },
  no: {
    label: "Pass",
    cls: "bg-destructive/10 text-destructive border-destructive/30",
    icon: ThumbsDown,
  },
} as const;

export function RecruiterView({ data }: { data: Rec }) {
  const d = decisionMeta[data.decision];
  const DIcon = d.icon;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-[image:var(--gradient-soft)] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">10-Second Recruiter Verdict</h3>
                <p className="text-xs text-muted-foreground">How a hiring manager skims your resume</p>
              </div>
            </div>
            <Badge variant="outline" className={`${d.cls} px-3 py-1.5 text-sm`}>
              <DIcon className="mr-1.5 h-4 w-4" />
              {d.label}
            </Badge>
          </div>
          <p className="mt-5 text-lg italic text-foreground/90">"{data.one_liner}"</p>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Top Strengths
          </h3>
          <ul className="space-y-3">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 rounded-md border border-primary/15 bg-accent/30 p-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-[10px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <XCircle className="h-4 w-4 text-destructive" />
            Red Flags
          </h3>
          <ul className="space-y-3">
            {data.concerns.map((c, i) => (
              <li key={i} className="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 text-primary" />
            Seniority Match
          </div>
          <p className="mt-2 font-medium">{data.seniority_match}</p>
        </Card>
        <Card className="p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Story Arc</div>
          <p className="mt-2 font-medium">{data.story}</p>
        </Card>
      </div>
    </div>
  );
}
