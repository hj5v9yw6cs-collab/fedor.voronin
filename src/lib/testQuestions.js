import tomFlatAudio from "../assets/audio/tom-flat.mp3";
import onTheFenceAudio from "../assets/audio/on-the-fence.mp3";

// Compact CEFR-style placement quiz. Three question types:
//  - "grammar": a sentence with a gap (as before)
//  - "reading": a short passage + a comprehension question
//  - "listening": a short line + a comprehension question. `audioSrc`
//    is a real recording (see src/assets/audio); if a listening
//    question has no audioSrc, Test.jsx falls back to reading
//    `audioText` aloud with the browser's speech synthesis.
// Each question adds at most 1 point; the final score maps to a level
// via LEVELS below.
export const QUESTIONS = [
  {
    type: "grammar",
    q: "I ___ from Russia.",
    options: ["am", "is", "are", "be"],
    correct: 0,
  },
  {
    type: "grammar",
    q: "She ___ to the gym every day.",
    options: ["go", "goes", "going", "is go"],
    correct: 1,
  },
  {
    type: "grammar",
    q: "They ___ TV when I called.",
    options: ["watch", "watched", "were watching", "watching"],
    correct: 2,
  },
  {
    type: "reading",
    passage:
      "Anna works in a small bakery in the center of town. She usually starts at six in the morning and finishes at two in the afternoon. On weekends, she likes to visit her parents, who live in the countryside.",
    q: "When does Anna usually finish work?",
    options: ["At six in the morning", "At two in the afternoon", "On weekends", "In the countryside"],
    correct: 1,
  },
  {
    type: "grammar",
    q: "If I ___ more time, I would learn French.",
    options: ["have", "had", "will have", "has"],
    correct: 1,
  },
  {
    type: "listening",
    audioText:
      "Hi, this is Tom. I'm calling about the flat on Green Street. Is it still available? Please call me back at your earliest convenience.",
    audioSrc: tomFlatAudio,
    q: "What is Tom asking about?",
    options: ["A job", "A flat", "A car", "A flight"],
    correct: 1,
  },
  {
    type: "grammar",
    q: "The results were quite ___.",
    options: ["surprise", "surprised", "surprising", "surprisingly"],
    correct: 2,
  },
  {
    type: "grammar",
    q: "He denied ___ the money.",
    options: ["to steal", "stealing", "steal", "stole"],
    correct: 1,
  },
  {
    type: "reading",
    passage:
      "Although the meeting had been postponed twice, the team finally agreed on a new project timeline. Everyone seemed relieved, except for the manager, who still had doubts about the budget.",
    q: "How did the manager feel about the new timeline?",
    options: ["Excited", "Relieved", "Uncertain", "Angry"],
    correct: 2,
  },
  {
    type: "grammar",
    q: "By next year, she ___ here for a decade.",
    options: ["will work", "will have worked", "works", "worked"],
    correct: 1,
  },
  {
    type: "listening",
    audioText:
      "Honestly, I was on the fence about the offer at first, but after thinking it over, I decided to go for it.",
    audioSrc: onTheFenceAudio,
    q: "What does \"on the fence\" mean here?",
    options: ["Very excited", "Undecided", "Angry", "Confident"],
    correct: 1,
  },
  {
    type: "grammar",
    q: "The committee ___ yet to reach a decision.",
    options: ["has", "have", "is", "are"],
    correct: 0,
  },
  {
    type: "grammar",
    q: "Choose a synonym for \"meticulous\":",
    options: ["careless", "thorough", "fast", "loud"],
    correct: 1,
  },
  {
    type: "grammar",
    q: "Hardly ___ the office when the phone rang.",
    options: ["I had left", "had I left", "I have left", "I left"],
    correct: 1,
  },
];

export const LEVELS = [
  { min: 0, max: 3, code: "A1", label: "Начальный" },
  { min: 4, max: 6, code: "A2", label: "Элементарный" },
  { min: 7, max: 9, code: "B1", label: "Средний" },
  { min: 10, max: 11, code: "B2", label: "Выше среднего" },
  { min: 12, max: 13, code: "C1", label: "Продвинутый" },
  { min: 14, max: 14, code: "C1+", label: "Профессиональный" },
];

export function getLevel(score) {
  return LEVELS.find((l) => score >= l.min && score <= l.max) ?? LEVELS[0];
}
