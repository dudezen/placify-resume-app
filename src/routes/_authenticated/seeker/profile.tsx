import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/_authenticated/seeker/profile")({
  component: () => <PlaceholderPage title="Profile" description="Manage your profile information and preferences." />,
});
