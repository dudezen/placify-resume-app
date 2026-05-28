import { createFileRoute } from "@tanstack/react-router";
import { Analyzer } from "@/components/placify/Analyzer";

export const Route = createFileRoute("/_authenticated/seeker/analyzer")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Resume × JD Analyzer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your resume and paste a job description. Get ATS score, recruiter verdict, and a
          full career roadmap.
        </p>
      </div>
      <Analyzer />
    </div>
  ),
});
