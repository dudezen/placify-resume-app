import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardShell, type NavItem } from "@/components/app/DashboardShell";
import { LayoutDashboard, FilePlus, Briefcase, Users, Settings, Sparkles } from "lucide-react";

const items: NavItem[] = [
  { title: "Dashboard", url: "/recruiter/dashboard", icon: LayoutDashboard },
  { title: "Analyzer", url: "/recruiter/analyzer", icon: Sparkles },
  { title: "Post a Job", url: "/recruiter/post-job", icon: FilePlus },
  { title: "My Job Postings", url: "/recruiter/jobs", icon: Briefcase },
  { title: "Applicants", url: "/recruiter/applicants", icon: Users },
  { title: "Settings", url: "/recruiter/settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/recruiter")({
  component: RecruiterLayout,
});

function RecruiterLayout() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile && profile.role !== "recruiter") {
      navigate({ to: "/seeker/dashboard", replace: true });
    }
  }, [loading, profile, navigate]);

  if (!profile) return null;

  return (
    <DashboardShell items={items} groupLabel="Recruiter">
      <Outlet />
    </DashboardShell>
  );
}
