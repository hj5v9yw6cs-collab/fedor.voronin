import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Story from "./components/Story";
import Features from "./components/Features";
import Test from "./components/Test";
import Footer from "./components/Footer";
import ButtonBurst from "./components/ButtonBurst";
import { LanguageProvider } from "./lib/i18n";

export default function App() {
  return (
    <LanguageProvider>
      <Navbar />
      <Hero />
      <Story />
      <Features />
      <Test />
      <Footer />
      <ButtonBurst />
    </LanguageProvider>
  );
}
