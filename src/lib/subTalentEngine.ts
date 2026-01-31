export function getSubTalents(talent: string) {
  const t = talent.trim().toLowerCase();

  if (t.includes("code") || t.includes("program") || t.includes("dev")) {
    return ["Web Development", "Mobile Development", "AI / ML", "DevOps", "Cybersecurity"];
  }
  if (t.includes("dance")) {
    return ["Salsa", "Hip Hop", "Classical", "Contemporary", "Freestyle"];
  }
  if (t.includes("music") || t.includes("sing")) {
    return ["Singing", "Guitar", "Piano", "Drums", "Music Theory"];
  }
  if (t.includes("sport") || t.includes("fitness")) {
    return ["Strength", "Endurance", "Team Sports", "Martial Arts", "Mobility"];
  }
  if (t.includes("art") || t.includes("draw") || t.includes("paint")) {
    return ["Sketching", "Digital Art", "Painting", "Illustration", "Design Basics"];
  }

  // unknown -> generic but logical options
  return ["Foundations", "Beginner Projects", "Consistency", "Performance", "Creativity"];
}
