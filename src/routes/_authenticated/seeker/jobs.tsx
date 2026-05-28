import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/_authenticated/seeker/jobs")({
  component: () => <PlaceholderPage title="Browse Jobs" description="Discover roles from verified recruiters and see your match score." />,
});
