import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/_authenticated/recruiter/settings")({
  component: () => <PlaceholderPage title="Settings" description="Manage your company profile and recruiter preferences." />,
});
