import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cabinet from "./pages/Cabinet";
import { LanguageProvider } from "./lib/i18n";
import { AuthProvider } from "./lib/auth";
import { useYandexMetrikaPageviews } from "./lib/analytics";
import CookieBanner from "./components/CookieBanner";

// Route changes here are client-side (react-router's <Link>, no full
// page reload), so Yandex.Metrika's own snippet only ever sees the
// first URL a visitor lands on — this reports the rest. Needs to live
// inside <BrowserRouter> for useLocation(), so it can't just sit in
// App() itself.
function AnalyticsTracker() {
  useYandexMetrikaPageviews();
  return null;
}

// BrowserRouter, not HashRouter — HashRouter's URLs would collide with
// the site's own #story/#test scroll-to-section anchors. Direct visits
// and refreshes on /cabinet work on GitHub Pages (which has no
// server-side routing of its own) via public/404.html + the redirect
// script in index.html — see README.md.
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cabinet" element={<Cabinet />} />
          </Routes>
        </BrowserRouter>
        <CookieBanner />
      </AuthProvider>
    </LanguageProvider>
  );
}
