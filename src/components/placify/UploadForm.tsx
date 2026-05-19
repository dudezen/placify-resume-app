import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { extractPdfText } from "@/lib/pdf-extract";
import { useServerFn } from "@tanstack/react-start";
import { analyzeResume, type Analysis } from "@/lib/analyze.functions";

interface Props {
  onResult: (result: Analysis) => void;
}

export function UploadForm({ onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const analyzeFn = useServerFn(analyzeResume);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    setFile(f);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Upload a resume PDF.");
    if (jd.trim().length < 20) return toast.error("Paste a job description (min 20 chars).");
    setLoading(true);
    try {
      const resumeText = await extractPdfText(file);
      if (resumeText.length < 50) throw new Error("Could not extract text from PDF.");
      const result = await analyzeFn({ data: { resumeText, jd: jd.trim() } });
      onResult(result);
      toast.success("Analysis complete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 shadow-[var(--shadow-soft)]">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Resume (PDF)</Label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0] ?? null);
            }}
            onClick={() => inputRef.current?.click()}
            className={`group cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragOver
                ? "border-primary bg-accent/40"
                : "border-border hover:border-primary/60 hover:bg-accent/20"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3 text-foreground">
                <FileText className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB · click to change
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-accent p-3 transition-transform group-hover:scale-110">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-sm font-medium">Drop your PDF here or click to upload</div>
                <div className="text-xs text-muted-foreground">Max 10MB</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jd" className="text-sm font-medium">
            Job Description
          </Label>
          <Textarea
            id="jd"
            placeholder="Paste the full job description here…"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={10}
            className="resize-y"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Resume
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
