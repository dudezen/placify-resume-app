import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  FileSearch,
  Brain,
  Star,
  Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const items: NavItem[] = [
  { title: "Dashboard", to: "/dashboard/recruiter", icon: LayoutDashboard },
  { title: "Create Job Post", to: "/dashboard/recruiter/jobs/new", icon: PlusCircle },
  { title: "All Job Posts", to: "/dashboard/recruiter/jobs", icon: Briefcase },
  { title: "Candidate Analysis", to: "/dashboard/recruiter/candidates", icon: Users },
  { title: "Resume Reviews", to: "/dashboard/recruiter/reviews", icon: FileSearch },
  { title: "AI Insights", to: "/dashboard/recruiter/insights", icon: Brain },
  { title: "Shortlisted", to: "/dashboard/recruiter/shortlisted", icon: Star },
  { title: "Settings", to: "/dashboard/recruiter/settings", icon: Settings },
];

export const Route = createFileRoute("/dashboard/recruiter")({
  component: RecruiterLayout,
});

function RecruiterLayout() {
  return <DashboardShell role="recruiter" items={items} brandLabel="Recruiter" />;
}
