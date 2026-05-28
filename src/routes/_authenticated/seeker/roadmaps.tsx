import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/_authenticated/seeker/roadmaps")({
  component: () => <PlaceholderPage title="Career Roadmaps" description="Your saved AI-generated roadmaps for target roles." />,
});
