# Plan: Dual-Dashboard Restructure (Frontend-Only)

## Ground rules
- **No Lovable Cloud / no DB migration.** Auth is a frontend mock (role + email stored in `localStorage` via a `useAuth` hook + context). When you wire your real backend later, only `src/lib/auth.ts` changes.
- **Zero changes to existing logic:** `src/lib/analyze.functions.ts` (prompt, schema, Gemini call), `src/lib/pdf-extract.ts`, and the three result components (`AtsSimulator`, `RecruiterView`, `CareerRoadmap`) stay byte-identical. We only move where they're *rendered*.
- TanStack Start file-based routes (this project does NOT use `src/pages/` — that convention from the brief doesn't apply here).

## New route map
```
/                          → Landing (marketing)
/login                     → Split-screen login + role selector
/register                  → Same layout, signup
/analyze                   → Current public analyzer (kept as-is, "try before signup")
/dashboard/user            → Job Seeker shell + home
/dashboard/user/resume     → Existing UploadForm + Results (full analyzer)
/dashboard/user/matches    → Placeholder ("Coming soon" + mock cards)
/dashboard/user/roadmaps   → Re-renders CareerRoadmap from last analysis
/dashboard/user/ats        → Re-renders AtsSimulator from last analysis
/dashboard/user/settings   → Profile mock
/dashboard/recruiter       → Recruiter shell + home
/dashboard/recruiter/jobs/new      → Job post form (saves to localStorage)
/dashboard/recruiter/jobs          → List of posted jobs (localStorage)
/dashboard/recruiter/candidates    → Upload candidate PDF → runs existing analyzer against selected job's JD → shows RecruiterView + green/red flags (reuses existing AI output)
/dashboard/recruiter/settings
```

`_authenticated/` layout guards both dashboards via `beforeLoad` checking the mock auth context.

## What gets built

### 1. Auth (mock, swappable)
- `src/lib/auth.tsx`: `AuthProvider`, `useAuth()`, `login(role, email)`, `logout()`, persists `{ role: "user" | "recruiter", email }` in `localStorage`.
- Wired into router context for `_authenticated` guard.
- `/login` and `/register`: split-screen, role toggle (Job Seeker / Recruiter), redirects to the right dashboard.

### 2. Landing page (`/`)
Dark-mode AI SaaS aesthetic with the sections requested: hero, features grid (6 cards), how-it-works (two columns: seeker vs recruiter), dashboard preview, dual CTA. Framer Motion for fade/scale entrances. The current home (`UploadForm`) moves to `/analyze`.

### 3. Dashboard shells
- `src/components/dashboard/DashboardLayout.tsx` using shadcn `Sidebar` + `SidebarProvider`.
- `UserSidebar` and `RecruiterSidebar` with the items from the brief.
- Top header with user email + logout.

### 4. Job Seeker dashboard home
- 4 analytics cards (ATS score, applications, match %, resume strength) pulled from the last analysis in `localStorage` (or "Run your first analysis" empty state).
- "Recent insights" panel reusing fields from the existing `Analysis` object.
- CTA to `/dashboard/user/resume`.

### 5. Recruiter dashboard home
- 4 cards (Active jobs, Total applicants, Shortlisted, Avg match) from localStorage.
- "Recent candidates" list.

### 6. Candidate review (recruiter)
- Recruiter picks one of their posted jobs (JD from localStorage), uploads a candidate PDF.
- Calls **the existing `analyzeResume` server fn unchanged** with `{ resumeText, jd }`.
- Renders existing `RecruiterView`, `AtsSimulator`, plus a new lightweight "Shortlist / Reject / Save" action bar that writes to localStorage. Green/red flags map directly from existing `recruiter_view.strengths` and `recruiter_view.concerns`.

### 7. Design system
- Add dark-mode tokens + gradient/glass utilities to `src/styles.css` (semantic tokens only — no hardcoded colors in components).
- Keep existing light tokens; landing/auth force dark via a wrapper class. Dashboards respect system theme.

## Files touched
**New:**
- `src/lib/auth.tsx`
- `src/routes/login.tsx`, `src/routes/register.tsx`, `src/routes/analyze.tsx`
- `src/routes/_authenticated.tsx`
- `src/routes/_authenticated/dashboard.user.tsx` (+ index, resume, matches, roadmaps, ats, settings as nested files)
- `src/routes/_authenticated/dashboard.recruiter.tsx` (+ index, jobs.new, jobs.index, candidates, settings)
- `src/components/dashboard/{DashboardLayout,UserSidebar,RecruiterSidebar,StatCard}.tsx`
- `src/components/landing/{Hero,Features,HowItWorks,DashboardPreview,CTA,Nav}.tsx`
- `src/lib/local-store.ts` (typed localStorage helpers for jobs, candidates, last-analysis)

**Edited (minimal):**
- `src/routes/index.tsx` → replaced with Landing
- `src/routes/__root.tsx` → wrap with `AuthProvider`, add router context type
- `src/router.tsx` → inject auth into context
- `src/styles.css` → add dark tokens + gradient/glass tokens

**Untouched (guaranteed):**
- `src/lib/analyze.functions.ts`
- `src/lib/pdf-extract.ts`
- `src/components/placify/{UploadForm,Results,AtsSimulator,RecruiterView,CareerRoadmap}.tsx`

## Phasing
Given the size, I'll deliver in **two passes** in this same conversation:

**Pass 1 (this turn after approval):** Landing, auth (mock) + `/login` `/register`, `_authenticated` guard, both dashboard shells with sidebars, Job Seeker home + `/dashboard/user/resume` fully wired to existing analyzer, `/analyze` public route preserved.

**Pass 2 (next turn):** Recruiter job posting + candidate review (uploads PDF → existing analyzer → RecruiterView + actions), remaining sidebar pages (matches/roadmaps/ats re-using last analysis), polish.

## Out of scope (explicitly)
- Real database, real auth, password hashing, JWT issuance — you'll wire your own backend later against the `useAuth` interface.
- Real job-board, real application pipeline, interview scheduling, email.
- Any change to the AI prompt, schema, or scoring.

## Open question (non-blocking — defaulting unless you object)
For Pass 1 I'm defaulting to: **role selection on the login page** (toggle) rather than a separate "choose role" screen, and **mock auth accepts any email + any password** so you can demo both dashboards instantly. Say the word if you want a dedicated role-picker screen or a hardcoded credential list instead.