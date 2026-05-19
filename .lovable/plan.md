## Overview
Extend PLACIFY with three new AI-powered features that build on the existing resume × JD analysis:
1. **ATS Simulation Mode** — show how an Applicant Tracking System would parse and score the resume
2. **Recruiter View** — a 30-second hiring manager perspective with a verdict and quick-glance signals
3. **Career Roadmap** — actionable, skill-by-skill coaching path for the missing/weak skills critical to the JD

All three are additive — the existing upload form and Results dashboard stay intact.

## UX Flow
After analysis completes, the Results page gains a tabbed navigation:
- **Overview** (current dashboard: scores, gap analysis, suggestions)
- **ATS Simulator** (new)
- **Recruiter View** (new)
- **Career Roadmap** (new)

Tabs share the same `Analysis` data plus three new optional fields populated by the same server call (one round-trip, no extra latency cost beyond a richer prompt).

### ATS Simulator
- ATS parse score (0–100) + verdict (Pass / Borderline / Likely rejected)
- Keyword density table: JD keyword → count in resume → required frequency → status
- Format/parseability flags (e.g. "uses tables", "uncommon section headers", "missing contact line")
- Pass-through preview: what fields the ATS extracted (Name, Email, Years of exp, Skills list)

### Recruiter View
- 10-second verdict card: "Would I interview?" Yes / Maybe / No + 1-sentence reason
- Top 3 strengths (bullet, mapped to JD)
- Top 3 red flags / concerns
- Estimated YOE vs required, seniority match
- "Resume tells the story of a ___" one-liner

### Career Roadmap
- For each critical missing/weak skill (max 5), generate a learning track:
  - Skill name + why it matters for this JD
  - Difficulty + estimated time to job-ready (e.g. "4–6 weeks")
  - 3 phases: Foundations → Hands-on project → Portfolio proof
  - 2–3 concrete resource suggestions per skill (course type, project idea, certification)
  - One resume bullet template to add once acquired
- Priority ordering (highest JD impact first)

## Technical Details

### Schema additions (`src/lib/analyze.functions.ts`)
Extend `AnalysisSchema` with three optional sections:
```ts
ats_simulation: {
  parse_score: number,
  verdict: "pass" | "borderline" | "reject",
  keyword_matches: [{ keyword, resume_count, required, status }],
  format_flags: [{ issue, severity: "info"|"warn"|"error" }],
  extracted_fields: { name, email, years_experience, skills: string[] }
},
recruiter_view: {
  decision: "yes" | "maybe" | "no",
  one_liner: string,
  strengths: string[],     // 3
  concerns: string[],      // 3
  seniority_match: string,
  story: string
},
career_roadmap: [{
  skill: string,
  priority: "critical" | "high" | "medium",
  why_it_matters: string,
  time_to_ready: string,
  phases: [{ name, description, duration }],   // 3 phases
  resources: string[],     // 2-3
  resume_bullet_template: string
}]
```
Update `SYSTEM_PROMPT` to instruct the model to fill all sections in a single response (still JSON mode). Roadmap limited to top 5 critical gaps.

### New components (`src/components/placify/`)
- `AtsSimulator.tsx` — score gauge, keyword table, format flag list, extracted-fields card
- `RecruiterView.tsx` — verdict header with color (green/amber/red), three-column strengths/concerns, story footer
- `CareerRoadmap.tsx` — vertical timeline per skill with phase cards, resource chips, bullet template in a copyable block

### Refactor `Results.tsx`
- Wrap existing content in a `Tabs` component (shadcn `tabs.tsx` already present)
- Tab order: Overview / ATS / Recruiter / Roadmap
- Each tab renders its dedicated component, passing the relevant slice of `Analysis`
- Empty-state fallback if a section is missing (defensive — older cached results)

### No backend changes beyond the schema/prompt
Same `analyzeResume` server function, same Lovable AI Gateway call, same model (`google/gemini-3-flash-preview`). Token budget is comfortably within limits.

### Styling
Reuse existing tokens (`--primary`, `--gradient-soft`, `--shadow-soft`). Verdict colors use semantic tokens (`destructive` for reject/no, primary green for pass/yes, a warning amber added to `styles.css` if not present).

## Files Changed
- `src/lib/analyze.functions.ts` — extend schema + prompt
- `src/components/placify/Results.tsx` — add tabs wrapper
- `src/components/placify/AtsSimulator.tsx` — new
- `src/components/placify/RecruiterView.tsx` — new
- `src/components/placify/CareerRoadmap.tsx` — new
- `src/styles.css` — optional warning token if missing

## Out of Scope
- Saving/exporting roadmap as PDF
- Tracking roadmap progress over time (would need Lovable Cloud + auth)
- Real ATS vendor parity (Workday/Greenhouse specifics) — the simulator is heuristic, AI-driven
