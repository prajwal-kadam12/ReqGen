import { TopNavbar } from "../top-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function TopNavbarExample() {
  return (
    <SidebarProvider>
      <div className="w-full">
        <TopNavbar />
        <div className="p-8">
          <h2 className="text-2xl font-bold">Page Content</h2>
          <p className="text-muted-foreground mt-2">
            The navbar is displayed at the top with sidebar toggle, notifications, and profile menu
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
