import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { UploadForm } from "@/components/placify/UploadForm";
import { Results } from "@/components/placify/Results";
import type { Analysis } from "@/lib/analyze.functions";
import { lastAnalysis } from "@/lib/local-store";

export const Route = createFileRoute("/dashboard/user/resume")({
  component: ResumePage,
});

function ResumePage() {
  const [result, setResult] = useState<Analysis | null>(null);

  useEffect(() => {
    setResult(lastAnalysis.get());
  }, []);

  const onResult = (r: Analysis) => {
    setResult(r);
    lastAnalysis.set(r);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Resume</h1>
        <p className="text-sm text-muted-foreground">
          Upload your resume and a target JD to get full analysis, ATS scoring, recruiter
          verdicts, and a tailored career roadmap.
        </p>
      </div>
      {!result ? (
        <UploadForm onResult={onResult} />
      ) : (
        <Results data={result} onReset={() => setResult(null)} />
      )}
    </div>
  );
}
