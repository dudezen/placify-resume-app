import { createFileRoute } from "@tanstack/react-router";
import { Analyzer } from "@/components/placify/Analyzer";

export const Route = createFileRoute("/_authenticated/recruiter/analyzer")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Candidate Screener</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your JD and upload an applicant's resume. Get ATS fit, recruiter verdict, and red/green
          flags instantly.
        </p>
      </div>
      <Analyzer />
    </div>
  ),
});
