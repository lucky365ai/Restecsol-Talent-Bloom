import { z } from "zod";

export const lessonRequestSchema = z.object({
  talent: z.string().trim().min(1).max(80),
  subTalent: z.string().trim().min(1).max(80),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export type LessonRequest = z.infer<typeof lessonRequestSchema>;

export type GeneratedLesson = {
  title: string;
  roadmap: string;
  summary: string;
  content: string;
  practice_tasks: string[];
  outcomes: string[];
  youtube_links: string[];
  sort_order: number;
};

function roadmap(title: string, steps: string[]) {
  const lines = [title, "│", ...steps.flatMap((s, i) => ["├─ " + s + (i === steps.length - 1 ? "" : ""), "│"]), "└─ Practice + Reflect"]; 
  return lines.join("\n");
}

export function generateLessons(req: LessonRequest): GeneratedLesson[] {
  const { talent, subTalent, level } = lessonRequestSchema.parse(req);
  const base = `${talent} • ${subTalent} • ${level}`;

  const templates: Array<Omit<GeneratedLesson, "sort_order">> = [
    {
      title: `Your ${base} foundation` ,
      roadmap: roadmap("Roadmap", ["Set a goal", "Learn the core moves", "Build a tiny routine", "Get feedback"]),
      summary: `A gentle, practical start that sets you up for steady progress in ${subTalent}.`,
      content:
        `We’ll start with a simple promise: consistency beats intensity.\n\nFirst, define one clear outcome for the next 7 days. Keep it small enough that you can finish it even on a busy day.\n\nNext, learn the core building blocks for ${subTalent}. Focus on clarity over speed—slow practice is still practice.\n\nFinally, you’ll assemble a tiny routine you can repeat. Repetition is how your brain turns “new” into “natural.”`,
      practice_tasks: [
        "Write a 7‑day goal in one sentence",
        "Do a 15‑minute focused session (no multitasking)",
        "Record one note: what felt easy vs hard",
      ],
      outcomes: [
        "A clear weekly goal",
        "A repeatable practice routine",
        "A baseline to measure improvement",
      ],
      youtube_links: [
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subTalent} fundamentals` )}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subTalent} beginner tutorial` )}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`how to practice ${subTalent}`)}`,
      ],
    },
    {
      title: `Technique clinic: make it clean`,
      roadmap: roadmap("Roadmap", ["Warm up", "One key technique", "Slow reps", "Speed up safely"]),
      summary: "A calm technique-focused lesson that improves quality without burning you out.",
      content:
        `This lesson is about clean technique. Clean technique saves time later because you don’t need to “unlearn” habits.\n\nStart with a short warm up, then pick one technique that shows up everywhere in ${subTalent}. Practice it slowly first.\n\nWhen it feels stable, increase speed or difficulty slightly. Keep the jump small so your form stays friendly and relaxed.`,
      practice_tasks: [
        "Warm up for 3–5 minutes",
        "Do 10 slow repetitions focusing on control",
        "Do 5 medium repetitions focusing on smoothness",
      ],
      outcomes: ["Better control", "More confidence", "A repeatable technique drill"],
      youtube_links: [
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subTalent} technique drill`)}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subTalent} form tips`)}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subTalent} common mistakes`)}`,
      ],
    },
    {
      title: `Build a mini-project (the fun way)`,
      roadmap: roadmap("Roadmap", ["Pick a tiny project", "Break into 3 steps", "Ship v1", "Improve one thing"]),
      summary: "Apply what you’ve learned by building something small and satisfying.",
      content:
        `Progress feels real when you can point at something you made. Today you’ll build a mini‑project in ${subTalent}.\n\nPick something you can finish in one sitting. Break it into three steps. Do the simplest version first (v1).\n\nThen improve just one thing: clarity, style, speed, or smoothness. Tiny upgrades compound quickly.`,
      practice_tasks: [
        "Choose a mini-project you can finish today",
        "Write 3 steps on paper",
        "Finish v1, then improve ONE thing",
      ],
      outcomes: ["A finished mini-project", "Better planning skill", "Momentum"],
      youtube_links: [
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subTalent} mini project`)}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subTalent} beginner project idea`)}`,
        `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subTalent} practice routine`)}`,
      ],
    },
  ];

  const extras = level === "Beginner" ? 6 : level === "Intermediate" ? 8 : 10;
  const lessons: GeneratedLesson[] = [];

  for (let i = 0; i < extras; i++) {
    const t = templates[i % templates.length];
    lessons.push({ ...t, sort_order: i });
  }

  // Ensure at least 6 lessons always
  return lessons.slice(0, Math.max(6, Math.min(10, lessons.length)));
}
