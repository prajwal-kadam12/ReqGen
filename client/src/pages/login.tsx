import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useQuery } from "@tanstack/react-query";
import type { Settings } from "@shared/schema";
import logoUrl from "@assets/LOGO Cybaem tech Final_transparent_1762488292687.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("analyst");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { setUser } = useUser();
  const { clearAll } = useNotifications();

  // Fetch settings to get uploaded logo
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/login", {
        email,
        password,
        role
      });
      
      const data = await res.json() as { success: boolean; user: { email: string; role: string; name: string } };

      // Clear notifications from previous user session
      clearAll();

      // Save user data to context
      setUser(data.user);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.name}!`,
      });

      // Redirect based on role
      if (role === "admin") {
        setLocation("/settings");
      } else if (role === "client") {
        setLocation("/files");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email, password, or role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-2xl shadow-lg">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <img 
              src={settings?.logo || logoUrl} 
              alt="Company Logo" 
              className="h-20 w-auto mx-auto mb-4" 
            />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ReqGen
            </CardTitle>
            <CardDescription className="text-base mt-2">
              AI-Powered Business Requirement Document Generator
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Login As</Label>
                <RadioGroup value={role} onValueChange={setRole}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="analyst" id="analyst" data-testid="radio-analyst" />
                    <Label htmlFor="analyst" className="font-normal cursor-pointer">
                      Business Analyst / Project Manager
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" data-testid="radio-admin" />
                    <Label htmlFor="admin" className="font-normal cursor-pointer">
                      System Administrator
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="client" data-testid="radio-client" />
                    <Label htmlFor="client" className="font-normal cursor-pointer">
                      Client
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>📊 Analyst: analyst@reqgen.com / analyst123</p>
              <p>⚙️ Admin: admin@reqgen.com / admin123</p>
              <p>👤 Client: client@reqgen.com / client123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
