import { useState } from "react";
import { UploadForm } from "@/components/placify/UploadForm";
import { Results } from "@/components/placify/Results";
import type { Analysis } from "@/lib/analyze.functions";

export function Analyzer() {
  const [result, setResult] = useState<Analysis | null>(null);
  return !result ? (
    <UploadForm onResult={setResult} />
  ) : (
    <Results data={result} onReset={() => setResult(null)} />
  );
}
