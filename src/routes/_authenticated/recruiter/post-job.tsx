import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type EmploymentType = Database["public"]["Enums"]["employment_type"];
type JobStatus = Database["public"]["Enums"]["job_status"];

export const Route = createFileRoute("/_authenticated/recruiter/post-job")({
  component: PostJob,
});

function PostJob() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: profile?.company_name ?? "",
    location: "",
    description: "",
    employment_type: "full_time" as EmploymentType,
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
  });

  const submit = async (status: JobStatus) => {
    if (!user) return;
    if (!form.title.trim() || !form.company.trim() || form.description.trim().length < 20) {
      toast.error("Title, company, and a description (20+ chars) are required.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("jobs").insert({
      recruiter_id: user.id,
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim() || null,
      description: form.description.trim(),
      employment_type: form.employment_type,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      salary_currency: form.salary_currency,
      status,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(status === "published" ? "Job published" : "Draft saved");
    navigate({ to: "/recruiter/jobs" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post a Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a posting. Published jobs are visible to job seekers.
        </p>
      </div>

      <Card className="space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Job title">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Senior Frontend Engineer"
            />
          </Field>
          <Field label="Company">
            <Input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />
          </Field>
          <Field label="Location">
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Remote · San Francisco"
            />
          </Field>
          <Field label="Employment type">
            <Select
              value={form.employment_type}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, employment_type: v as EmploymentType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full time</SelectItem>
                <SelectItem value="part_time">Part time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Currency">
            <Select
              value={form.salary_currency}
              onValueChange={(v) => setForm((f) => ({ ...f, salary_currency: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={`Salary min (${form.salary_currency})`}>
            <Input
              type="number"
              value={form.salary_min}
              onChange={(e) => setForm((f) => ({ ...f, salary_min: e.target.value }))}
            />
          </Field>
          <Field label={`Salary max (${form.salary_currency})`}>
            <Input
              type="number"
              value={form.salary_max}
              onChange={(e) => setForm((f) => ({ ...f, salary_max: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Job description">
          <Textarea
            rows={12}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Responsibilities, requirements, must-have skills…"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" disabled={saving} onClick={() => submit("draft")}>
            Save draft
          </Button>
          <Button disabled={saving} onClick={() => submit("published")}>
            Publish
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
