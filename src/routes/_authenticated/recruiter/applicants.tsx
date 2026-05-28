import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/_authenticated/recruiter/applicants")({
  component: () => <PlaceholderPage title="Applicants" description="Review applicants per job with AI-scored matches and flag detection." />,
});
