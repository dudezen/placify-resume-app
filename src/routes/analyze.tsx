import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { UploadForm } from "@/components/placify/UploadForm";
import { Results } from "@/components/placify/Results";
import type { Analysis } from "@/lib/analyze.functions";
import { Sparkles } from "lucide-react";
import { lastAnalysis } from "@/lib/local-store";

export const Route = createFileRoute("/analyze")({
  component: AnalyzePage,
  head: () => ({
    meta: [
      { title: "Analyze Resume — Placify" },
      {
        name: "description",
        content:
          "Paste a job description and upload your resume to get an instant ATS score, gap analysis, and rewrite suggestions.",
      },
    ],
  }),
});

function AnalyzePage() {
  const [result, setResult] = useState<Analysis | null>(null);

  const onResult = (r: Analysis) => {
    setResult(r);
    lastAnalysis.set(r);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-soft">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-[var(--shadow-soft)]">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Placify</h1>
              <p className="text-xs text-muted-foreground">Resume × JD Analyzer</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {!result ? (
          <>
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Match your resume to any job — in seconds.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Upload your resume and paste a job description. Get a fit score, skill gap
                analysis, and AI-powered rewrites to strengthen your resume.
              </p>
            </div>
            <UploadForm onResult={onResult} />
          </>
        ) : (
          <Results data={result} onReset={() => setResult(null)} />
        )}
      </main>
    </div>
  );
}
