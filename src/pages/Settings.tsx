import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(theme === "dark");
  }, [theme]);

  const toggle = async (next: boolean) => {
    setDark(next);
    setTheme(next ? "dark" : "light");
    if (!user) return;
    await supabase.from("profiles").update({ theme_mode: next ? "dark" : "light" }).eq("user_id", user.id);
    await refreshProfile();
  };

  return (
    <AppShell title="Settings">
      <section className="mx-auto max-w-2xl space-y-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Warm light mode by default, warm dark mode when enabled.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-base">Dark mode</Label>
              <p className="text-sm text-muted-foreground">This also persists in your profile.</p>
            </div>
            <Switch checked={dark} onCheckedChange={toggle} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Current talent theme</CardTitle>
            <CardDescription>Accent color + cursor adapt after sub-talent selection.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Theme key: <span className="font-medium text-foreground">{profile?.theme_key ?? "unknown"}</span>
            <br />
            Cursor: <span className="font-medium text-foreground">{profile?.cursor_emoji ?? "(none)"}</span>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
