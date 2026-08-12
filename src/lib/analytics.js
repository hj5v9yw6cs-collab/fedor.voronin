import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const YANDEX_METRIKA_ID = 111542952;

/**
 * The counter's own snippet (in index.html) already sends a hit for
 * whatever URL the visitor first landed on. Since the app is a
 * client-side-routed SPA (react-router's <Link>, no full page reload),
 * that's the only hit Yandex would ever see on its own — so this fires
 * an extra one on every later route change (e.g. → /cabinet), skipping
 * the very first render to avoid double-counting that initial load.
 */
export function useYandexMetrikaPageviews() {
  const location = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.ym?.(YANDEX_METRIKA_ID, "hit", location.pathname + location.search + location.hash);
  }, [location]);
}
