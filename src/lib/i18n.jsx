import { useEffect, useMemo, useState } from "react";
import { DICT, LanguageContext } from "./i18nData";

const STORAGE_KEY = "lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "ru";
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ru";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, strings: DICT[lang] }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
