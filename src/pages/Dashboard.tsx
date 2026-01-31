import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { adjustLevel } from "@/lib/levelAdjuster";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

type LessonRow = {
  id: string;
  title: string;
  sort_order: number;
};

type ProgressRow = {
  lesson_id: string;
  state: string;
  time_spent_seconds: number;
  score: number | null;
  completed_at: string | null;
};

function getAccentHsl() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  return v ? `hsl(${v})` : "hsl(20 90% 48%)";
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("lessons")
      .select("id,title,sort_order")
      .eq("user_id", user.id)
      .order("sort_order")
      .then(({ data }) => setLessons((data as any) ?? []));

    supabase
      .from("lesson_progress")
      .select("lesson_id,state,time_spent_seconds,score,completed_at")
      .eq("user_id", user.id)
      .then(({ data }) => setProgress((data as any) ?? []));
  }, [user]);

  const timeByLesson = useMemo(() => {
    const map = new Map(progress.map((p) => [p.lesson_id, p.time_spent_seconds]));
    return lessons.map((l) => Math.round((map.get(l.id) ?? 0) / 60));
  }, [lessons, progress]);

  const completedOverTime = useMemo(() => {
    const completed = progress
      .filter((p) => p.completed_at)
      .map((p) => new Date(p.completed_at as string))
      .sort((a, b) => a.getTime() - b.getTime());

    const labels: string[] = [];
    const values: number[] = [];
    let count = 0;
    for (const d of completed) {
      count++;
      labels.push(d.toLocaleDateString());
      values.push(count);
    }
    if (!labels.length) {
      labels.push("Today");
      values.push(0);
    }
    return { labels, values };
  }, [progress]);

  const completionRate = useMemo(() => {
    if (!lessons.length) return 0;
    const done = progress.filter((p) => p.state === "Completed").length;
    return done / lessons.length;
  }, [lessons.length, progress]);

  const avgScore = useMemo(() => {
    const scores = progress.map((p) => p.score).filter((s): s is number => typeof s === "number");
    if (!scores.length) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [progress]);

  const avgMinutes = useMemo(() => {
    if (!progress.length) return 0;
    return progress.reduce((a, p) => a + p.time_spent_seconds, 0) / progress.length / 60;
  }, [progress]);

  const adjustment = useMemo(() => adjustLevel({ completionRate, avgScore, avgMinutes }), [avgMinutes, avgScore, completionRate]);
  const accent = useMemo(() => getAccentHsl(), [profile?.theme_key]);

  return (
    <AppShell title="Dashboard">
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-lg md:col-span-2">
            <CardHeader>
              <CardTitle>Today’s snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Talent:</span> {profile?.talent ?? "—"} • {profile?.sub_talent ?? "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Level:</span> {profile?.level ?? "—"}
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Completion</span>
                  <span className="text-muted-foreground">{Math.round(completionRate * 100)}%</span>
                </div>
                <Progress value={Math.round(completionRate * 100)} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Level adjustment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg font-semibold">{adjustment.decision}</p>
              <p className="text-sm text-muted-foreground">Confidence: {Math.round(adjustment.confidence * 100)}%</p>
              <p className="text-sm">{adjustment.explanation}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Time spent per lesson (minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar
                data={{
                  labels: lessons.map((l) => l.title),
                  datasets: [
                    {
                      label: "Minutes",
                      data: timeByLesson,
                      backgroundColor: accent,
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { x: { ticks: { maxRotation: 0, autoSkip: true } } },
                }}
              />
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Lessons completed over time</CardTitle>
            </CardHeader>
            <CardContent>
              <Line
                data={{
                  labels: completedOverTime.labels,
                  datasets: [
                    {
                      label: "Completed",
                      data: completedOverTime.values,
                      borderColor: accent,
                      backgroundColor: accent,
                      tension: 0.35,
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!lessons.length ? (
              <p className="text-sm text-muted-foreground">No lessons yet—go to Level to generate them.</p>
            ) : (
              <div className="grid gap-2">
                {lessons.map((l) => (
                  <Button key={l.id} asChild variant="outline" className="justify-start">
                    <Link to={`/lessons/${l.id}`}>{l.title}</Link>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
