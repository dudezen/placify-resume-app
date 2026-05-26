import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  ScanLine,
  Compass,
  Send,
  Bookmark,
  Settings,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const items: NavItem[] = [
  { title: "Dashboard", to: "/dashboard/user", icon: LayoutDashboard },
  { title: "My Resume", to: "/dashboard/user/resume", icon: FileText },
  { title: "Job Matches", to: "/dashboard/user/matches", icon: Briefcase },
  { title: "ATS Insights", to: "/dashboard/user/ats", icon: ScanLine },
  { title: "Career Roadmaps", to: "/dashboard/user/roadmaps", icon: Compass },
  { title: "Applications", to: "/dashboard/user/applications", icon: Send },
  { title: "Saved Jobs", to: "/dashboard/user/saved", icon: Bookmark },
  { title: "Profile Settings", to: "/dashboard/user/settings", icon: Settings },
];

export const Route = createFileRoute("/dashboard/user")({
  component: UserLayout,
});

function UserLayout() {
  return <DashboardShell role="user" items={items} brandLabel="Job Seeker" />;
}
