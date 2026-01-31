export type LevelDecision = {
  decision: "Promote" | "Maintain" | "Demote";
  confidence: number;
  explanation: string;
};

export function adjustLevel(params: { completionRate: number; avgScore: number; avgMinutes: number }): LevelDecision {
  const { completionRate, avgScore, avgMinutes } = params;

  let points = 0;
  if (completionRate >= 0.8) points += 2;
  else if (completionRate >= 0.55) points += 1;
  else points -= 1;

  if (avgScore >= 85) points += 2;
  else if (avgScore >= 70) points += 1;
  else if (avgScore <= 50) points -= 1;

  if (avgMinutes >= 15) points += 1;
  if (avgMinutes <= 5) points -= 1;

  if (points >= 3) {
    return {
      decision: "Promote",
      confidence: Math.min(0.95, 0.6 + points * 0.1),
      explanation: "You’re completing lessons consistently with strong scores and steady time-on-task. A small increase in difficulty should stay comfortable.",
    };
  }
  if (points <= -2) {
    return {
      decision: "Demote",
      confidence: Math.min(0.9, 0.55 + Math.abs(points) * 0.1),
      explanation: "Your completion rate or scores suggest the current level may be too steep. Stepping down can rebuild confidence and momentum.",
    };
  }
  return {
    decision: "Maintain",
    confidence: 0.65,
    explanation: "You’re making progress. Keeping the same level for a bit longer will help the fundamentals feel automatic.",
  };
}
