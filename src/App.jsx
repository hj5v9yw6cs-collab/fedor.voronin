import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cabinet from "./pages/Cabinet";
import { LanguageProvider } from "./lib/i18n";
import { AuthProvider } from "./lib/auth";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cabinet" element={<Cabinet />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
