import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";

const schema = z.object({ talent: z.string().trim().min(2).max(80) });

export default function Talent() {
  const nav = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [talent, setTalent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.talent) nav("/subtalent", { replace: true });
  }, [nav, profile?.talent]);

  const canSubmit = useMemo(() => schema.safeParse({ talent }).success, [talent]);

  const submit = async () => {
    if (!user) return;
    setError(null);
    const parsed = schema.safeParse({ talent });
    if (!parsed.success) {
      setError("Please type a short talent (2–80 characters)." );
      return;
    }
    setBusy(true);
    const { error: e } = await supabase
      .from("profiles")
      .update({ talent: parsed.data.talent, sub_talent: null, level: null })
      .eq("user_id", user.id);
    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    await refreshProfile();
    nav("/subtalent", { replace: true });
  };

  return (
    <AppShell title="Talent">
      <section className="mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">What is your talent?</CardTitle>
            <CardDescription>Type it in your own words. You can change it later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={talent}
              onChange={(e) => setTalent(e.target.value)}
              placeholder="e.g. Coding, Dance, Singing, Basketball, Drawing"
              className="h-12 text-base"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={submit} disabled={!canSubmit || busy}>
                Continue
              </Button>
              <Button variant="secondary" onClick={() => nav("/questionnaire")}>
                Not sure? Take a short questionnaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
