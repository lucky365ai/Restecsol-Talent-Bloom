import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

type Lesson = {
  id: string;
  title: string;
  roadmap: string;
  summary: string;
  content: string;
  practice_tasks: string[];
  outcomes: string[];
  youtube_links: string[];
};

type LessonProgress = {
  state: string;
  score: number | null;
  time_spent_seconds: number;
};

export default function LessonDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress>({ state: "Not Started", score: null, time_spent_seconds: 0 });
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from("lessons")
      .select("id,title,roadmap,summary,content,practice_tasks,outcomes,youtube_links")
      .eq("id", id)
      .single()
      .then(({ data }) => setLesson(data as any));

    supabase
      .from("lesson_progress")
      .select("state,score,time_spent_seconds")
      .eq("user_id", user.id)
      .eq("lesson_id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProgress(data as any);
      });
  }, [id, user]);

  useEffect(() => {
    if (!running || !user || !id) return;
    tickRef.current = window.setInterval(() => {
      setProgress((p) => ({ ...p, time_spent_seconds: p.time_spent_seconds + 1, state: p.state === "Not Started" ? "In Progress" : p.state }));
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [running, id, user]);

  useEffect(() => {
    if (!user || !id) return;
    const t = window.setTimeout(() => {
      supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: user.id,
            lesson_id: id,
            state: progress.state,
            score: progress.score,
            time_spent_seconds: progress.time_spent_seconds,
            started_at: progress.state === "In Progress" ? new Date().toISOString() : null,
          } as any,
          { onConflict: "user_id,lesson_id" },
        );
    }, 800);
    return () => window.clearTimeout(t);
  }, [id, progress.score, progress.state, progress.time_spent_seconds, user]);

  const minutes = Math.floor(progress.time_spent_seconds / 60);
  const seconds = progress.time_spent_seconds % 60;
  const pct = useMemo(() => (progress.state === "Completed" ? 100 : progress.state === "In Progress" ? 40 : 0), [progress.state]);

  const complete = async () => {
    if (!user || !id) return;
    const score = Math.min(100, Math.max(0, Math.round(70 + Math.random() * 25)));
    setProgress((p) => ({ ...p, state: "Completed", score }));
    await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: id,
          state: "Completed",
          score,
          time_spent_seconds: progress.time_spent_seconds,
          completed_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id,lesson_id" },
      );
    setRunning(false);
  };

  if (!lesson) {
    return (
      <AppShell title="Lesson">
        <p className="text-sm text-muted-foreground">Loading lesson…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Lesson">
      <section className="mx-auto max-w-3xl space-y-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{lesson.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>{progress.state}</span>
                <span className="text-muted-foreground">{minutes}:{String(seconds).padStart(2, "0")}</span>
              </div>
              <Progress value={pct} className="mt-2" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => setRunning((r) => !r)} variant={running ? "secondary" : "default"}>
                {running ? "Pause timer" : "Start timer"}
              </Button>
              <Button onClick={complete} disabled={progress.state === "Completed"}>
                Mark completed
              </Button>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Roadmap</p>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm">{lesson.roadmap}</pre>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Summary</p>
              <p>{lesson.summary}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Details</p>
              <p className="whitespace-pre-wrap leading-7">{lesson.content}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">Practice tasks</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {lesson.practice_tasks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">Learning outcomes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {lesson.outcomes.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">YouTube</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {lesson.youtube_links.map((u) => (
                  <li key={u}>
                    <a className="text-primary underline underline-offset-4" href={u} target="_blank" rel="noreferrer">
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
