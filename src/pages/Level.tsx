import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { generateLessons } from "@/lib/lessonGenerator";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof levels)[number];

export default function Level() {
  const nav = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (level: Level) => {
    if (!user || !profile?.talent || !profile?.sub_talent) return;
    setError(null);
    setBusy(true);
    const { error: e } = await supabase.from("profiles").update({ level }).eq("user_id", user.id);
    if (e) {
      setBusy(false);
      setError(e.message);
      return;
    }

    // Generate lessons deterministically (no empty placeholders) and store.
    const lessons = generateLessons({ talent: profile.talent, subTalent: profile.sub_talent, level });
    const payload = lessons.map((l) => ({
      user_id: user.id,
      talent: profile.talent!,
      sub_talent: profile.sub_talent!,
      level,
      title: l.title,
      roadmap: l.roadmap,
      summary: l.summary,
      content: l.content,
      practice_tasks: l.practice_tasks,
      outcomes: l.outcomes,
      youtube_links: l.youtube_links,
      sort_order: l.sort_order,
    }));

    await supabase.from("lessons").delete().eq("user_id", user.id);
    const { error: insertError } = await supabase.from("lessons").insert(payload);
    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    await refreshProfile();
    nav("/dashboard", { replace: true });
  };

  return (
    <AppShell title="Level">
      <section className="mx-auto max-w-3xl space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Choose your level</CardTitle>
            <CardDescription>Tap a card to continue. You can change it later.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {levels.map((l) => (
              <motion.button
                key={l}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                disabled={busy}
                onClick={() => pick(l)}
                className="rounded-lg border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md disabled:opacity-60"
              >
                <p className="text-lg font-semibold">{l}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {l === "Beginner"
                    ? "Gentle pace, strong fundamentals"
                    : l === "Intermediate"
                      ? "Build consistency + confidence"
                      : "Polish performance + depth"}
                </p>
              </motion.button>
            ))}
          </CardContent>
        </Card>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </section>
    </AppShell>
  );
}
