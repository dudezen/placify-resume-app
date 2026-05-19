import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { UploadForm } from "@/components/placify/UploadForm";
import { Results } from "@/components/placify/Results";
import type { Analysis } from "@/lib/analyze.functions";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PLACIFY — Resume & Job Description Analyzer" },
      {
        name: "description",
        content:
          "AI-powered resume analyzer. Match your resume against any job description, find skill gaps, and get rewrite suggestions.",
      },
      { property: "og:title", content: "PLACIFY — AI Resume Analyzer" },
      { property: "og:description", content: "Match your resume to any job description with AI." },
    ],
  }),
});

function Index() {
  const [result, setResult] = useState<Analysis | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <header className="border-b bg-[image:var(--gradient-soft)]">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-soft)]">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PLACIFY</h1>
            <p className="text-xs text-muted-foreground">Resume × JD Analyzer</p>
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
            <UploadForm onResult={setResult} />
          </>
        ) : (
          <Results data={result} onReset={() => setResult(null)} />
        )}
      </main>
    </div>
  );
}
