import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { getSubTalents } from "@/lib/subTalentEngine";
import { cursorEmojiMap, type ThemeKey } from "@/lib/cursorEmojiMap";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({ value: z.string().trim().min(2).max(80) });

function themeKeyFromTalent(talent: string): ThemeKey {
  const t = talent.toLowerCase();
  if (t.includes("code") || t.includes("dev") || t.includes("program")) return "coding";
  if (t.includes("dance")) return "dance";
  if (t.includes("music") || t.includes("sing")) return "music";
  if (t.includes("sport") || t.includes("fitness")) return "sports";
  if (t.includes("art") || t.includes("draw") || t.includes("paint")) return "art";
  return "unknown";
}

export default function SubTalent() {
  const nav = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const talent = profile?.talent ?? "";
  const options = useMemo(() => getSubTalents(talent), [talent]);

  const save = async (subTalent: string) => {
    if (!user) return;
    setError(null);
    const parsed = schema.safeParse({ value: subTalent });
    if (!parsed.success) {
      setError("Please pick or type a sub-talent (2–80 characters)." );
      return;
    }
    const key = themeKeyFromTalent(talent);
    const cursor = cursorEmojiMap[key] ?? "";
    setBusy(true);
    const { error: e } = await supabase
      .from("profiles")
      .update({ sub_talent: parsed.data.value, theme_key: key, cursor_emoji: cursor, level: null })
      .eq("user_id", user.id);
    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    await refreshProfile();
    nav("/level", { replace: true });
  };

  return (
    <AppShell title="Sub-talent">
      <section className="mx-auto max-w-3xl space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Narrow it down</CardTitle>
            <CardDescription>Based on your talent: <span className="font-medium">{talent || "(missing)"}</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {options.map((o) => (
                <Button key={o} variant="outline" className="justify-start" onClick={() => save(o)} disabled={busy}>
                  {o}
                </Button>
              ))}
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">Don’t see your option? Type your own</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Type your sub-talent" />
                <Button onClick={() => save(custom)} disabled={busy}>
                  Use this
                </Button>
              </div>
              {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
