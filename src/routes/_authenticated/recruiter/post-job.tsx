import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/_authenticated/recruiter/post-job")({
  component: () => <PlaceholderPage title="Post a Job" description="Create a new job posting. Bulk CSV upload and JD parsing coming next." />,
});
