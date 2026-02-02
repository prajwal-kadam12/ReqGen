import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { canAccessRoute } from "@/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPath: string;
}

export function ProtectedRoute({ children, requiredPath }: ProtectedRouteProps) {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const hasAccess = canAccessRoute(user?.role as any, requiredPath);

  useEffect(() => {
    if (!hasAccess && user) {
      if (user.role === "client") {
        setLocation("/files");
      } else if (user.role === "analyst") {
        setLocation("/dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [hasAccess, user, setLocation]);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-full p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Card className="max-w-md w-full shadow-xl border-2">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg">
                <ShieldAlert className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-base">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your current role ({user?.role}) doesn't have access to this resource. 
              Please contact your administrator if you believe this is an error.
            </p>
            <Button 
              onClick={() => setLocation(user?.role === "client" ? "/files" : "/dashboard")}
              className="w-full gap-2 shadow-lg bg-gradient-to-r from-primary to-accent"
              data-testid="button-go-home"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
