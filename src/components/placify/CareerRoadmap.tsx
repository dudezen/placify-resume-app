import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, Clock, BookOpen, Hammer, Trophy, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Analysis } from "@/lib/analyze.functions";

type Roadmap = Analysis["career_roadmap"];

const priorityMeta = {
  critical: { label: "Critical", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  high: { label: "High", cls: "bg-[oklch(var(--warning)/0.15)] text-[oklch(0.45_0.08_100)] border-[oklch(var(--warning)/0.3)]" },
  medium: { label: "Medium", cls: "bg-accent text-accent-foreground border-border" },
} as const;

const phaseIcons = [BookOpen, Hammer, Trophy];

export function CareerRoadmap({ data }: { data: Roadmap }) {
  if (data.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Compass className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-3 font-medium">No critical skill gaps detected.</p>
        <p className="text-sm text-muted-foreground">Your resume already covers the key skills in this JD.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Your Career Roadmap</h3>
            <p className="text-xs text-muted-foreground">
              Skill-by-skill coaching to close the gap for this role, highest impact first
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {data.map((track, i) => (
          <SkillTrack key={i} track={track} index={i} />
        ))}
      </div>
    </div>
  );
}

function SkillTrack({ track, index }: { track: Roadmap[number]; index: number }) {
  const p = priorityMeta[track.priority];
  const [copied, setCopied] = useState(false);

  const copyBullet = async () => {
    try {
      await navigator.clipboard.writeText(track.resume_bullet_template);
      setCopied(true);
      toast.success("Bullet copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-[image:var(--gradient-soft)] px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-sm font-bold text-primary-foreground">
              {index + 1}
            </div>
            <div>
              <h4 className="font-semibold">{track.skill}</h4>
              <p className="text-sm text-muted-foreground">{track.why_it_matters}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={p.cls}>{p.label}</Badge>
            <Badge variant="outline" className="bg-card">
              <Clock className="mr-1 h-3 w-3" />
              {track.time_to_ready}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {track.phases.map((phase, i) => {
            const Icon = phaseIcons[i] ?? BookOpen;
            return (
              <div key={i} className="relative rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Phase {i + 1}
                  </div>
                </div>
                <div className="font-semibold">{phase.name}</div>
                <p className="mt-1 text-sm text-foreground/80">{phase.description}</p>
                <div className="mt-3 text-xs text-muted-foreground">{phase.duration}</div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Resources
          </div>
          <div className="flex flex-wrap gap-2">
            {track.resources.map((r, i) => (
              <Badge key={i} variant="outline" className="bg-card text-primary px-3 py-1.5 font-normal">
                {r}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-accent/20 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Resume bullet to add once skilled
            </div>
            <button
              onClick={copyBullet}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-sm font-medium text-foreground/90">"{track.resume_bullet_template}"</p>
        </div>
      </div>
    </Card>
  );
}
