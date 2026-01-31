import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/layout/AppShell";
import { scoreQuestionnaire } from "@/lib/questionnaireEngine";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

export default function Questionnaire() {
  const nav = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [problemSolving, setProblemSolving] = useState(3);
  const [movingBody, setMovingBody] = useState(3);
  const [listening, setListening] = useState(3);
  const [competition, setCompetition] = useState(3);
  const [drawing, setDrawing] = useState(3);
  const [building, setBuilding] = useState(3);
  const [instrument, setInstrument] = useState("no");
  const [rhythm, setRhythm] = useState("no");
  const [busy, setBusy] = useState(false);
  const [override, setOverride] = useState("");

  const result = useMemo(() => {
    const answers = [
      { q: "enjoys_problem_solving", value: problemSolving },
      { q: "likes_building_things", value: building },
      { q: "likes_moving_body", value: movingBody },
      { q: "likes_rhythm", value: rhythm === "yes" ? 4 : 1 },
      { q: "likes_listening", value: listening },
      { q: "likes_instruments", value: instrument === "yes" ? 4 : 1 },
      { q: "likes_competition", value: competition },
      { q: "likes_training", value: Math.max(1, Math.round((competition + movingBody) / 2)) },
      { q: "likes_drawing", value: drawing },
      { q: "likes_creating_visuals", value: drawing },
    ];
    return scoreQuestionnaire(answers);
  }, [building, competition, drawing, instrument, listening, movingBody, problemSolving, rhythm]);

  const confirm = async () => {
    if (!user) return;
    setBusy(true);
    const talent = override.trim().length ? override.trim() : result.suggestedTalent;
    const { error } = await supabase
      .from("profiles")
      .update({ talent, sub_talent: null, level: null, theme_key: result.themeKey })
      .eq("user_id", user.id);
    setBusy(false);
    if (error) return;
    await refreshProfile();
    nav("/subtalent", { replace: true });
  };

  return (
    <AppShell title="Questionnaire">
      <section className="mx-auto max-w-3xl space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">A short, friendly check-in</CardTitle>
            <CardDescription>No jargon—just quick preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>I enjoy solving puzzles or problems</Label>
              <Slider value={[problemSolving]} onValueChange={(v) => setProblemSolving(v[0] ?? 3)} max={5} min={1} step={1} />
            </div>
            <div className="space-y-2">
              <Label>I like building things step-by-step</Label>
              <Slider value={[building]} onValueChange={(v) => setBuilding(v[0] ?? 3)} max={5} min={1} step={1} />
            </div>
            <div className="space-y-2">
              <Label>I enjoy moving my body to learn</Label>
              <Slider value={[movingBody]} onValueChange={(v) => setMovingBody(v[0] ?? 3)} max={5} min={1} step={1} />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Rhythm feels fun to me</Label>
                <RadioGroup value={rhythm} onValueChange={setRhythm} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="rhythm-yes" />
                    <Label htmlFor="rhythm-yes">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="rhythm-no" />
                    <Label htmlFor="rhythm-no">Not really</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>I’d enjoy learning an instrument</Label>
                <RadioGroup value={instrument} onValueChange={setInstrument} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="ins-yes" />
                    <Label htmlFor="ins-yes">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="ins-no" />
                    <Label htmlFor="ins-no">Not really</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-2">
              <Label>I like friendly competition</Label>
              <Slider value={[competition]} onValueChange={(v) => setCompetition(v[0] ?? 3)} max={5} min={1} step={1} />
            </div>
            <div className="space-y-2">
              <Label>I enjoy drawing or visual creativity</Label>
              <Slider value={[drawing]} onValueChange={(v) => setDrawing(v[0] ?? 3)} max={5} min={1} step={1} />
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">We think your talent could be:</p>
              <p className="mt-1 text-lg font-semibold">{result.suggestedTalent}</p>
              <p className="mt-1 text-xs text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</p>
              <div className="mt-4 space-y-2">
                <Label htmlFor="override">Want to override it?</Label>
                <input
                  id="override"
                  value={override}
                  onChange={(e) => setOverride(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Type your own talent (optional)"
                />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button onClick={confirm} disabled={busy}>
                  Use this and continue
                </Button>
                <Button variant="ghost" onClick={() => nav("/talent")} disabled={busy}>
                  Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
