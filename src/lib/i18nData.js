import { createContext, useContext } from "react";

export const DICT = {
  ru: {
    nav: {
      story: "история",
      test: "тест",
      contacts: "контакты",
      cta: "пройти тест",
    },
    hero: {
      label: "английский с федором",
      title: ["Узнайте", "свой уровень", "английского."],
      description:
        "Бесплатный интерактивный тест, который определит ваш уровень и покажет, что делать дальше.",
      primaryBtn: "Пройти тест",
      secondaryBtn: "Моя история",
      photoNote: ["Язык объединяет", "людей и открывает", "весь мир."],
    },
    story: {
      label: "МОЯ ИСТОРИЯ",
      blocks: [
        "Всё началось\nс желания\nпознакомиться.",
        "Мне было около пяти лет. Мы с мамой были в путешествии. На площади играли дети, и мне очень хотелось подойти к ним.",
        "Но оказалось, что мы говорим на разных языках.",
        "Тогда я впервые понял, что язык — это возможность знакомиться с людьми.",
      ],
    },
    features: {
      label: "уровни",
      title: ["От «hello»", "до свободной речи."],
      levels: [
        { code: "A1–A2", label: "Начальный", desc: "Базовые фразы, простые диалоги." },
        { code: "B1", label: "Средний", desc: "Свободно на бытовые темы." },
        { code: "B2", label: "Выше среднего", desc: "Работа, учёба, сложные тексты." },
        { code: "C1+", label: "Продвинутый", desc: "Свободное владение, нюансы." },
      ],
    },
    test: {
      label: "тест",
      introTitle: ["Узнайте свой", "уровень за 5 минут."],
      introDescription: (n) =>
        `${n} коротких заданий: грамматика, лексика, текст на понимание прочитанного и аудирование. В конце — ваш уровень по шкале CEFR и рекомендация, с чего начать.`,
      startBtn: "начать тест",
      kindReading: "текст",
      kindListening: "аудирование",
      listen: "прослушать",
      listenAgain: "прослушать ещё раз",
      contactTitle: "Почти готово.",
      contactSubtitle: "Куда прислать результат?",
      namePlaceholder: "имя (необязательно)",
      contactPlaceholder: "telegram или instagram",
      submitBtn: "получить результат",
      sending: "Считаем результат…",
      resultCorrect: (score, total) => `Правильных ответов: ${score} из ${total}.`,
      resultNote: "Результат также отправлен на почту — скоро свяжусь с вами.",
      retryBtn: "пройти ещё раз",
      levels: {
        A1: "Начальный",
        A2: "Элементарный",
        B1: "Средний",
        B2: "Выше среднего",
        C1: "Продвинутый",
        "C1+": "Профессиональный",
      },
    },
    footer: {
      tagline: "Помогаю говорить по-английски\nсвободно — с нуля и до\nпродвинутого уровня.",
      navHeading: "навигация",
      contactHeading: "связаться",
      brandName: "Fedor.",
      copyright: (year) => `© ${year} Fedor. English Studio`,
      privacy: "конфиденциальность",
      terms: "соглашение",
    },
  },

  en: {
    nav: {
      story: "story",
      test: "test",
      contacts: "contact",
      cta: "take the test",
    },
    hero: {
      label: "english with fedor",
      title: ["Find out", "your level of", "English."],
      description:
        "A free interactive test that finds your level and shows you what to do next.",
      primaryBtn: "Take the test",
      secondaryBtn: "My story",
      photoNote: ["Language brings", "people together and", "opens up the world."],
    },
    story: {
      label: "MY STORY",
      blocks: [
        "It all started\nwith wanting\nto connect.",
        "I was about five years old. My mum and I were travelling. Kids were playing in the square, and I really wanted to go up to them.",
        "But it turned out we spoke different languages.",
        "That's when I first understood that language is a chance to get to know people.",
      ],
    },
    features: {
      label: "levels",
      title: ["From \"hello\"", "to speaking freely."],
      levels: [
        { code: "A1–A2", label: "Beginner", desc: "Basic phrases, simple dialogue." },
        { code: "B1", label: "Intermediate", desc: "Comfortable with everyday topics." },
        { code: "B2", label: "Upper-Intermediate", desc: "Work, study, complex texts." },
        { code: "C1+", label: "Advanced", desc: "Fluent, with nuance." },
      ],
    },
    test: {
      label: "test",
      introTitle: ["Find your level", "in 5 minutes."],
      introDescription: (n) =>
        `${n} short tasks: grammar, vocabulary, a reading passage, and listening. At the end — your CEFR level and a recommendation for where to start.`,
      startBtn: "start the test",
      kindReading: "reading",
      kindListening: "listening",
      listen: "play audio",
      listenAgain: "play again",
      contactTitle: "Almost done.",
      contactSubtitle: "Where should I send the result?",
      namePlaceholder: "name (optional)",
      contactPlaceholder: "telegram or instagram",
      submitBtn: "get my result",
      sending: "Scoring your result…",
      resultCorrect: (score, total) => `Correct answers: ${score} of ${total}.`,
      resultNote: "The result was also emailed over — I'll be in touch soon.",
      retryBtn: "take it again",
      levels: {
        A1: "Beginner",
        A2: "Elementary",
        B1: "Intermediate",
        B2: "Upper-Intermediate",
        C1: "Advanced",
        "C1+": "Proficient",
      },
    },
    footer: {
      tagline: "I help people speak English\nfluently — from scratch\nto an advanced level.",
      navHeading: "navigation",
      contactHeading: "contact",
      brandName: "Fedor.",
      copyright: (year) => `© ${year} Fedor. English Studio`,
      privacy: "privacy policy",
      terms: "terms of use",
    },
  },
};

export const LanguageContext = createContext(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
