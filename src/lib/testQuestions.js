// Compact CEFR-style placement quiz. Each question adds at most 1 point;
// the final score maps to a level via LEVELS below. Keep this list short —
// 10 questions is enough signal for a free placement teaser and keeps the
// on-site test under a couple of minutes.
export const QUESTIONS = [
  {
    q: "I ___ from Russia.",
    options: ["am", "is", "are", "be"],
    correct: 0,
  },
  {
    q: "She ___ to the gym every day.",
    options: ["go", "goes", "going", "is go"],
    correct: 1,
  },
  {
    q: "They ___ TV when I called.",
    options: ["watch", "watched", "were watching", "watching"],
    correct: 2,
  },
  {
    q: "If I ___ more time, I would learn French.",
    options: ["have", "had", "will have", "has"],
    correct: 1,
  },
  {
    q: "The results were quite ___.",
    options: ["surprise", "surprised", "surprising", "surprisingly"],
    correct: 2,
  },
  {
    q: "He denied ___ the money.",
    options: ["to steal", "stealing", "steal", "stole"],
    correct: 1,
  },
  {
    q: "By next year, she ___ here for a decade.",
    options: ["will work", "will have worked", "works", "worked"],
    correct: 1,
  },
  {
    q: "The committee ___ yet to reach a decision.",
    options: ["has", "have", "is", "are"],
    correct: 0,
  },
  {
    q: "Choose a synonym for \"meticulous\":",
    options: ["careless", "thorough", "fast", "loud"],
    correct: 1,
  },
  {
    q: "Hardly ___ the office when the phone rang.",
    options: ["I had left", "had I left", "I have left", "I left"],
    correct: 1,
  },
];

export const LEVELS = [
  { min: 0, max: 2, code: "A1", label: "Начальный" },
  { min: 3, max: 4, code: "A2", label: "Элементарный" },
  { min: 5, max: 6, code: "B1", label: "Средний" },
  { min: 7, max: 8, code: "B2", label: "Выше среднего" },
  { min: 9, max: 9, code: "C1", label: "Продвинутый" },
  { min: 10, max: 10, code: "C1+", label: "Профессиональный" },
];

export function getLevel(score) {
  return LEVELS.find((l) => score >= l.min && score <= l.max) ?? LEVELS[0];
}
