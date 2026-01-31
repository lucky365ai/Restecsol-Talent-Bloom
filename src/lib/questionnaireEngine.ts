export type QuestionnaireAnswer = {
  q: string;
  value: string | number;
};

type TalentKey = "coding" | "dance" | "music" | "sports" | "art";

export function scoreQuestionnaire(answers: QuestionnaireAnswer[]) {
  const score: Record<TalentKey, number> = {
    coding: 0,
    dance: 0,
    music: 0,
    sports: 0,
    art: 0,
  };

  for (const a of answers) {
    const v = typeof a.value === "number" ? a.value : a.value;

    if (a.q === "enjoys_problem_solving") score.coding += Number(v);
    if (a.q === "likes_building_things") score.coding += Number(v);

    if (a.q === "likes_moving_body") score.dance += Number(v);
    if (a.q === "likes_rhythm") score.dance += Number(v);

    if (a.q === "likes_listening") score.music += Number(v);
    if (a.q === "likes_instruments") score.music += Number(v);

    if (a.q === "likes_competition") score.sports += Number(v);
    if (a.q === "likes_training") score.sports += Number(v);

    if (a.q === "likes_drawing") score.art += Number(v);
    if (a.q === "likes_creating_visuals") score.art += Number(v);
  }

  const sorted = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const second = sorted[1];

  const confidence = top[1] === 0 ? 0.2 : Math.min(0.95, (top[1] - second[1]) / Math.max(1, top[1]));
  const suggested = top[0] as TalentKey;

  return {
    suggestedTalent:
      suggested === "coding"
        ? "Coding"
        : suggested === "dance"
          ? "Dance"
          : suggested === "music"
            ? "Music"
            : suggested === "sports"
              ? "Sports"
              : "Art",
    themeKey: suggested,
    confidence,
  };
}
