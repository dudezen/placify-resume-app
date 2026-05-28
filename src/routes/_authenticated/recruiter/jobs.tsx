import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/_authenticated/recruiter/jobs")({
  component: () => <PlaceholderPage title="My Job Postings" description="Manage your active and past job postings." />,
});
