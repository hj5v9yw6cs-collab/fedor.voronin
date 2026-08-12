import { useState } from "react";
import "./CookieBanner.css";
import { useLanguage } from "../lib/i18nData";

const STORAGE_KEY = "cookie-notice-seen";

export default function CookieBanner() {
  const { strings } = useLanguage();
  const t = strings.cookieBanner;
  // Lazy initializer — reads localStorage exactly once, on mount,
  // rather than as a render-body side effect (see the Date.now() note
  // in analytics.js for why that distinction matters here).
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="cookie-banner" role="note">
      <p>
        {t.text} <a href="/cookies.html">{t.linkText}</a>
      </p>
      <button type="button" className="btn-burst" onClick={dismiss}>
        {t.accept}
      </button>
    </div>
  );
}
