import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { UserProvider } from "@/contexts/UserContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NoteEditor from "@/pages/note-editor";
import GeneratedFiles from "@/pages/generated-files";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/editor" component={NoteEditor} />
      <Route path="/files" component={GeneratedFiles} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Switch>
                <Route path="/" component={Login} />
                <Route path="/login" component={Login} />
                <Route>
                  <SidebarProvider style={style as React.CSSProperties}>
                    <div className="flex h-screen w-full">
                      <AppSidebar />
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <TopNavbar />
                        <main className="flex-1 overflow-y-auto">
                          <Switch>
                            <Route path="/dashboard">
                              <ProtectedRoute requiredPath="/dashboard">
                                <Dashboard />
                              </ProtectedRoute>
                            </Route>
                            <Route path="/editor">
                              <ProtectedRoute requiredPath="/editor">
                                <NoteEditor />
                              </ProtectedRoute>
                            </Route>
                            <Route path="/files" component={GeneratedFiles} />
                            <Route path="/settings">
                              <ProtectedRoute requiredPath="/settings">
                                <Settings />
                              </ProtectedRoute>
                            </Route>
                            <Route component={NotFound} />
                          </Switch>
                        </main>
                      </div>
                    </div>
                  </SidebarProvider>
                </Route>
              </Switch>
              <Toaster />
            </TooltipProvider>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
