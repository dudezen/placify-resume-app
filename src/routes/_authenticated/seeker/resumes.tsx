import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Loader2, Star, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { extractPdfText } from "@/lib/pdf-extract";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/seeker/resumes")({
  component: ResumesPage,
});

interface ResumeRow {
  id: string;
  file_name: string;
  file_path: string;
  is_primary: boolean;
  created_at: string;
  parsed_text: string | null;
}

function ResumesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, file_name, file_path, is_primary, created_at, parsed_text")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ResumeRow[];
    },
  });

  const handleUpload = async (file: File) => {
    if (!user) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB).");
      return;
    }
    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;

      let parsedText: string | null = null;
      try {
        parsedText = await extractPdfText(file);
      } catch {
        // best-effort parse
      }

      const { error: dbErr } = await supabase.from("resumes").insert({
        user_id: user.id,
        file_name: file.name,
        file_path: path,
        parsed_text: parsedText,
        is_primary: resumes.length === 0,
      });
      if (dbErr) throw dbErr;
      toast.success("Resume uploaded");
      qc.invalidateQueries({ queryKey: ["resumes", user.id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const setPrimary = useMutation({
    mutationFn: async (id: string) => {
      if (!user) return;
      await supabase.from("resumes").update({ is_primary: false }).eq("user_id", user.id);
      const { error } = await supabase.from("resumes").update({ is_primary: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Primary resume updated");
      qc.invalidateQueries({ queryKey: ["resumes", user?.id] });
    },
  });

  const remove = useMutation({
    mutationFn: async (r: ResumeRow) => {
      await supabase.storage.from("resumes").remove([r.file_path]);
      const { error } = await supabase.from("resumes").delete().eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resume deleted");
      qc.invalidateQueries({ queryKey: ["resumes", user?.id] });
    },
  });

  const download = async (r: ResumeRow) => {
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(r.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Resumes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload up to 10MB PDFs. Your primary resume is used when you apply to jobs.
        </p>
      </div>

      <Card
        className="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center hover:border-primary/60 hover:bg-accent/20"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-accent p-3">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="text-sm font-medium">
            {uploading ? "Uploading…" : "Click to upload a resume PDF"}
          </div>
          <div className="text-xs text-muted-foreground">Max 10MB</div>
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && resumes.length === 0 && (
          <p className="text-sm text-muted-foreground">No resumes yet. Upload one to get started.</p>
        )}
        {resumes.map((r) => (
          <Card key={r.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{r.file_name}</span>
                  {r.is_primary && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" /> Primary
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Uploaded {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!r.is_primary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPrimary.mutate(r.id)}
                  disabled={setPrimary.isPending}
                >
                  Make primary
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => download(r)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove.mutate(r)}
                disabled={remove.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
