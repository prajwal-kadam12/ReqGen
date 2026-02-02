import { FileText, LayoutDashboard, Settings, FilePlus, LogOut, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { canAccessRoute } from "@/lib/permissions";
import { useQuery } from "@tanstack/react-query";
import type { Settings as SettingsType } from "@shared/schema";
import logoUrl from "@assets/LOGO Cybaem tech Final_transparent_1762488292687.png";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Note Editor",
    url: "/editor",
    icon: FilePlus,
  },
  {
    title: "Generated Files",
    url: "/files",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useUser();

  // Fetch settings to get uploaded logo
  const { data: settings } = useQuery<SettingsType>({
    queryKey: ["/api/settings"],
  });

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const getRoleBadgeText = (role: string) => {
    switch (role) {
      case "analyst":
        return "Business Analyst";
      case "admin":
        return "Administrator";
      case "client":
        return "Client";
      default:
        return role;
    }
  };

  const visibleItems = items.filter((item) =>
    canAccessRoute(user?.role as any, item.url)
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mx-2 mt-2">
            <h2 className="text-xl font-bold text-primary mb-2 text-center">
              ReqGen
            </h2>
            <img
              src={settings?.logo || logoUrl}
              alt="Company Logo"
              className="h-14 w-auto mx-auto"
            />
          </div>

          <Separator className="my-4 bg-gradient-to-r from-primary/50 to-accent/50" />

          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium text-white">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <div className="border-t pt-4 pb-2 px-2">
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" data-testid="text-user-name">
                  {user.name}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 truncate" data-testid="text-user-email">
                  {user.email}
                </p>
                <p className="text-xs font-medium text-primary" data-testid="text-user-role">
                  {getRoleBadgeText(user.role)}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 text-sm font-medium"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
