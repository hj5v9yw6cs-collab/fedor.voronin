import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cabinet from "./pages/Cabinet";
import { LanguageProvider } from "./lib/i18n";
import { AuthProvider } from "./lib/auth";

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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cabinet" element={<Cabinet />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
