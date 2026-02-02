import { useState, useEffect } from "react";
import { Upload, Save, Eye, EyeOff, Edit, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";
import { useUser } from "@/contexts/UserContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useUser();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    apiKey: "",
    logo: "",
  });

  const canEdit = user?.role === "admin";

  const { data: serverSettings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (serverSettings) {
      setSettings({
        companyName: serverSettings.companyName,
        address: serverSettings.address,
        phone: serverSettings.phone,
        email: serverSettings.email,
        apiKey: serverSettings.apiKey,
        logo: serverSettings.logo,
      });
    }
  }, [serverSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      return await apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setIsEditing(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoData = reader.result as string;
        setSettings({ ...settings, logo: logoData });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-full">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure company branding and integrations
        </p>
      </div>

      {!canEdit && (
        <Alert className="border-2 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <Lock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            You have read-only access to settings. Only administrators can modify these configurations.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            Upload your company logo to appear on generated documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.logo && (
            <div className="border rounded-lg p-4 bg-card inline-block">
              <img src={settings.logo} alt="Logo preview" className="max-h-32 max-w-xs" />
            </div>
          )}
          <div className="flex items-center gap-4">
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={!isEditing}
              data-testid="input-logo-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("logo-upload")?.click()}
              className="gap-2"
              disabled={!isEditing}
              data-testid="button-upload-logo"
            >
              <Upload className="w-4 h-4" />
              Upload Logo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            This information will appear on document letterheads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              placeholder="Enter your company name"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              disabled={!isEditing}
              data-testid="input-company-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="123 Business Street&#10;City, State 12345"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={3}
              disabled={!isEditing}
              data-testid="textarea-address"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                disabled={!isEditing}
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                disabled={!isEditing}
                data-testid="input-email"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle>Hugging Face Integration</CardTitle>
          <CardDescription>
            Configure API access for AI-powered note refinement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxx"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                disabled={!isEditing}
                data-testid="input-api-key"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
                data-testid="button-toggle-api-key"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Hugging Face Settings
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          {isEditing ? (
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending || isLoading}
              className="gap-2 shadow-lg bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all" 
              data-testid="button-save-settings"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          ) : (
            <Button 
              onClick={handleEdit}
              className="gap-2 shadow-lg bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all" 
              data-testid="button-edit-settings"
            >
              <Edit className="w-4 h-4" />
              Edit Settings
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
