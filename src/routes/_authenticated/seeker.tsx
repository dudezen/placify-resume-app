import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardShell, type NavItem } from "@/components/app/DashboardShell";
import { LayoutDashboard, FileText, Briefcase, Compass, User, Sparkles } from "lucide-react";

const items: NavItem[] = [
  { title: "Dashboard", url: "/seeker/dashboard", icon: LayoutDashboard },
  { title: "Analyzer", url: "/seeker/analyzer", icon: Sparkles },
  { title: "My Resumes", url: "/seeker/resumes", icon: FileText },
  { title: "Browse Jobs", url: "/seeker/jobs", icon: Briefcase },
  { title: "Career Roadmaps", url: "/seeker/roadmaps", icon: Compass },
  { title: "Profile", url: "/seeker/profile", icon: User },
];

export const Route = createFileRoute("/_authenticated/seeker")({
  component: SeekerLayout,
});

function SeekerLayout() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile && profile.role !== "seeker") {
      navigate({ to: "/recruiter/dashboard", replace: true });
    }
  }, [loading, profile, navigate]);

  if (!profile) return null;

  return (
    <DashboardShell items={items} groupLabel="Job Seeker">
      <Outlet />
    </DashboardShell>
  );
}
