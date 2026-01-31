import type { ThemeKey } from "@/lib/cursorEmojiMap";

type Hsl = `${number} ${number}% ${number}%`;

const accents: Record<ThemeKey, { primary: Hsl; ring: Hsl; chart1: Hsl; chart2: Hsl }> = {
  coding: {
    primary: "210 85% 48%",
    ring: "210 85% 48%",
    chart1: "210 85% 48%",
    chart2: "195 80% 48%",
  },
  dance: {
    primary: "12 92% 54%",
    ring: "12 92% 54%",
    chart1: "12 92% 54%",
    chart2: "25 95% 58%",
  },
  music: {
    primary: "38 95% 52%",
    ring: "38 95% 52%",
    chart1: "38 95% 52%",
    chart2: "48 96% 56%",
  },
  sports: {
    primary: "145 55% 42%",
    ring: "145 55% 42%",
    chart1: "145 55% 42%",
    chart2: "165 55% 38%",
  },
  art: {
    primary: "18 88% 56%",
    ring: "18 88% 56%",
    chart1: "18 88% 56%",
    chart2: "32 92% 56%",
  },
  unknown: {
    primary: "20 90% 48%",
    ring: "20 90% 48%",
    chart1: "27 95% 60%",
    chart2: "43 96% 56%",
  },
};

export function applyTalentTheme(themeKey: ThemeKey) {
  const a = accents[themeKey] ?? accents.unknown;
  const root = document.documentElement;
  root.style.setProperty("--primary", a.primary);
  root.style.setProperty("--ring", a.ring);
  root.style.setProperty("--chart-1", a.chart1);
  root.style.setProperty("--chart-2", a.chart2);
}
