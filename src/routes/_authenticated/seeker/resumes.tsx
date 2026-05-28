import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/DashboardShell";

export const Route = createFileRoute("/_authenticated/seeker/resumes")({
  component: () => <PlaceholderPage title="My Resumes" description="Manage uploaded resumes and view ATS score breakdowns." />,
});
