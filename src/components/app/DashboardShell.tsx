import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Brain, LogOut, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export function DashboardShell({
  items,
  groupLabel,
  children,
}: {
  items: NavItem[];
  groupLabel: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar items={items} groupLabel={groupLabel} />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar({ items, groupLabel }: { items: NavItem[]; groupLabel: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-3 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)]">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold tracking-tight">Skill Sync</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = currentPath === item.url || currentPath.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function TopBar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="text-sm">
          <span className="text-muted-foreground">Signed in as </span>
          <span className="font-medium">{profile?.full_name || "User"}</span>
          {profile?.company_name && (
            <span className="text-muted-foreground"> · {profile.company_name}</span>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-8 rounded-xl border bg-card p-12 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border bg-accent/40 px-3 py-1 text-xs font-medium text-primary">
          Coming soon
        </div>
        <p className="text-sm text-muted-foreground">
          This page is part of the next phase. Your existing analyzer is fully wired up — visit the
          Analyzer tab to use it now.
        </p>
      </div>
    </div>
  );
}
